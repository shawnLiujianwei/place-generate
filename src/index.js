/**
 * Created by Shawn Liu on 17/4/19.
 */
const RedisCache = require('./components/RedisCache');
const geocode = require('./components/geocode');
const fetchLocation = require('./components/fetchLocation');
const fetchPlaceId = require('./components/fetchPlaceId');
const fetchPlaceDetails = require('./components/fetchPlaceDetails');
const fetchTimezone = require('./components/fetchTimezone');
const formatStore = require('./components/formatStore');
const logger = require('log4js').getLogger('src/index.js');

const checkOptions = (options) => {
    if (!options) {
        throw new Error(`options is required`);
    }
    if (!options.googleAPIKey) {
        throw new Error('googleAPIKey is required');
    }

    if (!options.retailerId) {
        throw new Error('retailer id is required');
    }
    // if (!options.placeQuery) {
    //     throw new Error('placeQuery  is required');
    // }
    // if (!options.locale) {
    //     throw new Error('Place locale is required');
    // }
}

const defaultOption = {
    type: 'convenience_store|store|gas_station|grocery_or_supermarket|food|restaurant|establishment',
    queryRadius: 500, //meters
    redis: {
        host: 'localhost',
        port: 6379,
        namespace: 'construct-store-by-google-redis-cache',
        expire: 604800 * 4 // 28 days
    },
    redisClient: null,
    googleAPIKey: ''
    // gcacheURL: 'https://gcache.evan.dotter.me'
};


/**
 *
 * @param addressOrLocation address string or {lat:xxx, lng:xxx}
 * @param options
 * @param timezoneId
 * @constructor
 */
const Generator = function (addressOrLocation, options, timezoneId) {
    this.init = function () {
        if (!addressOrLocation) {
            throw new Error('Either address or location({lat:xxx, lng:xx}) is required');
        }
        const self = this;
        checkOptions(options);

        global.config = Object.assign(global.config || {}, defaultOption, options);
        self.placeQuery = global.config.placeQuery;
        self.locale = global.config.locale;
        self.retailerId = global.config.retailerId;
        self.queryRadius = global.config.queryRadius;
        self.placeTypes = global.config.placeTypes || 'convenience_store|store|gas_station|grocery_or_supermarket|food|restaurant|establishment'
        if (!global.cache) {
            if (global.config.redisClient) {
                global.cache = new RedisCache(global.config.redisClient);
            } else {
                options.redis = Object.assign({}, defaultOption.redis, options.redis);
                global.cache = new RedisCache(global.config.redisClient, global.config.redis);
            }
            // if (!options.redis) {
            //     console.info('Will use default redis configuration:', defaultOption.redis);
            // } else {
            //     options.redis = Object.assign({}, defaultOption.redis, options.redis);
            // }
            // global.cache = new RedisCache(global.config.redisClient, global.config.redis);
        }
        if (typeof addressOrLocation === 'string') {
            self.address = addressOrLocation
        } else {
            self.location = {
                data: {
                    lat: parseFloat(addressOrLocation.lat),
                    lng: parseFloat(addressOrLocation.lng)
                }
            }; //{lat:xxx, lng:xxxx}
        }
        if (timezoneId) {
            self.timezone = {
                data: {
                    timeZoneId: timezoneId
                }
            }
        }

    }
    this.defaultPlaceTypes = 'convenience_store|store|gas_station|grocery_or_supermarket|food|restaurant|establishment';
    this.init();
    this.locale = global.config.locale;
}

Generator.prototype.getLocation = async function () {
    const self = this;
    if (self.location) {
        return self.location;
    }
    let response = await fetchLocation(self.address);
    if (response.error && response.error.message.indexOf('No results') !== -1) {
        self.location = response = {
            message: response.error.message
        }
    }
    if (response.data) {
        self.location = response;
    }
    return response;
}

Generator.prototype.getPlaceId = async function () {
    const self = this;
    if (self.placeId) {
        return self.placeId;
    }
    if (!self.placeQuery) {
        throw new DateError('place name is required when try to get place');
    }
    let response = await self.getLocation();
    if (response.data) {
        response = await fetchPlaceId(self.placeQuery, response.data, self.placeTypes, self.queryRadius);
    }
    if (response.error &&
        response.error.message.indexOf('No results') !== -1) {
        self.placeId = response = {
            data: null,
            message: response.error.message || 'OK'
        };
    }
    return response;
}

Generator.prototype.getPlaceDetails = async function () {
    const self = this;
    if (self.placeDetails) {
        return self.placeDetails;
    }
    let response = await self.getPlaceId();
    if (response.data) {
        response = await fetchPlaceDetails(response.data, self.locale);
    }
    if (response.data) {
        self.placeDetails = response;
    }
    return response;
}

Generator.prototype.getTimezone = async function () {
    const self = this;
    if (self.timezone) {
        return self.timezone;
    }
    let response = await self.getLocation();
    if (response.data) {
        response = await fetchTimezone(response.data);
    }
    if (response.data) {
        self.timezone = response;
    }
    return response;
}


/**
 *
 * @param queryName , required. can be retailer id or something else
 * @param placeTypes , optional. default is 'convenience_store|store|gas_station|grocery_or_supermarket|food|restaurant|establishment'
 * @returns {Promise.<void>}
 */
Generator.prototype.getFullPlace = async function (retailerId, timezoneId) {
    const self = this;
    // if (self.store) {
    //     return self.store;
    // }
    const response = await self.getPlaceDetails();
    if (response.data) {
        const formatS = await formatStore(response.data, retailerId || self.retailerId, self.locale);
        if (formatS.error) {
            return {
                error: formatS.error
            };
        }
        if (timezoneId) {
            formatS.timezone = {
                timeZoneId: timezoneId
            }
        } else {
            const timezone = await self.getTimezone();
            if (timezone.data) {
                formatS.timezone = timezone.data;
            }
        }
        self.store = {
            data: Object.assign({}, formatS)
        };
    }
    return Object.assign(response, self.store);

}

Generator.prototype.execute = async function (fnName, throwError) {
    if (!fnName) {
        throw new Error("Function name is required");
    }
    const response = await this[fnName]();
    if (response.error) {
        throw response.error;
    }
    if (throwError && !response.data) {
        throw new Error(response.message || `unknown error when exec funtion ${fnName}`);
    }
    return response.data;
}

module.exports = Generator;