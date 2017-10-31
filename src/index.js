/**
 * Created by Shawn Liu on 17/4/19.
 */
const log4js = require('log4js');
const RedisCache = require('./components/RedisCache');
// const geocode = require('./components/geocode');
const fetchLocation = require('./components/fetchLocation');
const fetchPlaceId = require('./components/fetchPlaceId');
const searchPlaces = require('./components/searchPlace');
const fetchPlaceDetails = require('./components/fetchPlaceDetails');
const fetchTimezone = require('./components/fetchTimezone');
const formatStore = require('./components/formatStore');
// const logger = log4js.getLogger('src/index.js');

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
    //     throw new Error('placeQuery is required, normally we used it as place name');
    // }

    if (!options.address && !options.location) {
        throw new Error('Either address or location({lat:xxx, lng:xx}) is required');
    }
    // if (!options.placeQuery) {
    //     throw new Error('placeQuery  is required');
    // }
    // if (!options.locale) {
    //     throw new Error('Place locale is required');
    // }
};

const defaultOption = {
    placeTypes: ['store'],
    queryRadius: 500, //meters
    redis: {
        host: 'localhost',
        port: 6379,
        namespace: 'construct-store-by-google-redis-cache',
        expire: 604800 * 4 // 28 days
    },
    redisClient: null,
    googleAPIKey: '',
    filterDomain: true
    // gcacheURL: 'https://gcache.evan.dotter.me'
};


/**
 *
 * @param options
 * @param timezoneId
 * @constructor
 */
const Generator = function (options, timezoneId) {
    const self = this;
    this.init = function () {
        checkOptions(options);
        self.config = Object.assign(self.config || {}, defaultOption, options);
        if (self.config.gcacheURL) {
            process.env.placeGeneratorGcacheURL = self.config.gcacheURL;
        }
        if (self.config.verbose) {
            log4js.configure({
                appenders: [
                    {
                        type: 'console',
                        level: self.config.logLevel || 'DEBUG'
                    }
                ],
                levels: {
                    '[all]': self.config.logLevel || 'DEBUG'
                }
            });
        } else {
            log4js.configure({
                appenders: [
                    {
                        type: 'console',
                        level: 'OFF'
                    }
                ],
                levels: {
                    '[all]': 'OFF'
                }
            });
        }
        self.originalData = {
            placeQuery: options.placeQuery,
            address: options.address,
            location: options.location,
            placeId: options.placeId,
            // locale: options.locale,
            retailerId: options.retailerId
        };
        self.placeQuery = self.config.placeQuery;
        // self.locale = self.config.locale;
        self.retailerId = self.config.retailerId;
        self.queryRadius = self.config.queryRadius;
        self.placeTypes = self.config.placeTypes;
        self.excludedKeys = self.config.excludedKeys;
        if (!self.redisCache) {
            if (self.config.redisClient) {
                self.redisCache = new RedisCache(self.config.redisClient);
            } else {
                self.config.redis = Object.assign({}, defaultOption.redis, options.redis);
                self.redisCache = new RedisCache(null, self.config.redis);
            }
        }
        if (self.config.address) {
            self.address = self.config.address;
        }

        if (self.config.location) {
            self.location = {
                data: {
                    lat: parseFloat(self.config.location.lat),
                    lng: parseFloat(self.config.location.lng)
                }
            }
        }
        if (self.config.placeId) {
            self.placeId = {
                data: self.config.placeId
            };
        }
        if (options.timezone || timezoneId) self.timezone = {
            timeZoneId: options.timezone || timezoneId
        };
    };
    this.init();
    this.locale = self.config.locale;
};

Generator.prototype.getLocation = async function () {
    const self = this;
    if (self.location) {
        return self.location;
    }
    let response = await fetchLocation(self.placeQuery, self.address, self.redisCache, self.config.googleAPIKey);
    if (response.error && response.error.message.indexOf('No results') !== -1) {
        self.location = response = {
            message: response.error.message
        }
    }
    if (response.data) {
        self.location = {
            data: response.data.coordinates
        };
        if (response.data.placeId) {
            self.placeId = {
                data: response.data.placeId
            };
        }
        self.formattedAddress = response.data.formattedAddress;
        return self.location;
    }
    return response;
};

// get place country in English
Generator.prototype.getPlaceCountry = async function () {
    const self = this;
    if (self.placeCountry) {
        return self.placeCountry;
    }
    const getCountry = formattedAddress => {
        const lastSpace = formattedAddress.lastIndexOf(',');
        const country = formattedAddress.substring(lastSpace + 1);
        if (!country) {
            throw new Error(`failed to extract countr from formatted address: ${formattedAddress}`);
        }
        return country.trim();
    }
    //1 when fetch location from address , can get formatted adderss , that can extract country
    if (self.formattedAddress) {
        self.placeCountry = getCountry(self.formattedAddress);
        return self.placeCountry;
    }
    const response = await self.getPlaceId();
    const placeDetails = await  fetchPlaceDetails(response.data, 'en_us', self.redisCache, self.config.googleAPIKey);
    if(placeDetails && placeDetails.data) {
        const country = getCountry(placeDetails.data.result.formatted_address);
        self.placeCountry = country;
    }
    return self.placeCountry;
};

Generator.prototype.getPlaceId = async function () {
    const self = this;
    if (self.placeId) {
        return self.placeId;
    }
    if (!self.placeQuery && self.retailerId !== 'independent') {
        throw new Error('place name is required when try to get place');
    }
    let response = await self.getLocation();
    if (self.placeId) {
        return self.placeId;
    } else if (response.data) {
        response = await fetchPlaceId(self.placeQuery, response.data, self.placeTypes, self.queryRadius, self.redisCache, self.config.googleAPIKey);
    }
    if (response.error &&
        response.error.message.indexOf('No results') !== -1) {
        self.placeId = response = {
            data: null,
            message: response.error.message || 'OK'
        };
    }
    return response;
};

Generator.prototype.searchPlace = async function (radius) {
    const self = this;
    if (self.placeId) {
        return self.placeId;
    }
    if (!self.placeQuery) {
        throw new Error('place name is required when try to get place');
    }
    let response = await self.getLocation();
    if (self.placeId) {
        return self.placeId;
    } else if (response.data) {
        response = await searchPlaces(self.placeQuery, response.data, self.placeTypes, radius || self.queryRadius, self.redisCache, self.config.googleAPIKey);
    }
    if (response.error &&
        response.error.message.indexOf('No results') !== -1) {
        self.placeId = response = {
            data: null,
            message: response.error.message || 'OK'
        };
    }
    return response;
};

Generator.prototype.getPlaceDetails = async function () {
    const self = this;
    if (self.placeDetails) {
        return self.placeDetails;
    }
    let response = await self.getPlaceId();
    if (response.data) {
        response = await fetchPlaceDetails(response.data, self.locale, self.redisCache, self.config.googleAPIKey);
    }
    if (response.data) {
        self.placeDetails = response;
    }
    return response;
};

Generator.prototype.getTimezone = async function () {
    const self = this;
    if (self.timezone) {
        return self.timezone;
    }
    let response = await self.getLocation();
    if (response.data) {
        response = await fetchTimezone(response.data, self.redisCache, self.config.googleAPIKey);
    }
    if (response.data) {
        self.timezone = response;
    }
    return response;
};

/**
 *
 * @param retailerId , required. can be retailer id or something else
 * @param timezoneId , optional.
 * @returns {{error}}
 */
Generator.prototype.getFullPlace = async function (retailerId, timezoneId) {
    const self = this;
    // if (self.store) {
    //     return self.store;
    // }
    const response = await self.getPlaceDetails();
    if (response.data) {
        const formatS = await formatStore(response.data, retailerId || self.retailerId, self.locale, self.filterDomain,self.excludedKeys);
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
            data: Object.assign({}, formatS, {
                originalData: self.originalData
            })
        };
        if (self.config.validateCountry) {
            const placeCountry = await self.getPlaceCountry();
            self.store.data.country = placeCountry;
        }
    }

    return self.store;
};

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
};

module.exports = Generator;