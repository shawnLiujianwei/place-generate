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
}

const defaultOption = {
    type: 'convenience_store|store|gas_station|grocery_or_supermarket|food|restaurant|establishment',
    redis: {
        host: 'localhost',
        port: 6379,
        namespace: 'construct-store-by-google-redis-cache',
        expire: 604800 // 7 days
    },
    googleAPIKey: '',
    gcacheURL: 'https://gcache.evan.dotter.me'
};

// function formatStore(scraped) {
//     if (scraped.result) {
//         const scrapedResult = scraped.result;
//         const geometry = scrapedResult.geometry;
//         const openingHours = scrapedResult.opening_hours || {};
//         return {
//             placeId: scrapedResult.place_id,
//             type: scrapedResult.types,
//             location: {
//                 type: 'Point',
//                 coordinates: [geometry.location.lng, geometry.location.lat]
//             },
//             summary: {
//                 name: scrapedResult.name,
//                 address: scrapedResult.formatted_address || '',
//                 phone: scrapedResult.formatted_phone_number || '',
//                 internationalPhone: scrapedResult.international_phone_number || '',
//                 weekdayText: openingHours.weekday_text || []
//             },
//             openingHourPeriods: openingHours.periods || [],
//             updateDate: new Date(),
//         };
//     }
//     return null;
// }


const Generator = function (addressOrLocation, options, timezoneId) {
    this.init = function () {
        if (!addressOrLocation) {
            throw new Error('Either address or location({lat:xxx, lng:xx}) is required');
        }
        const self = this;
        checkOptions(options);
        if (!options.redis) {
            console.info('Will use default redis configuration:', defaultOption.redis);
        } else {
            options.redis = Object.assign({}, defaultOption.redis, options.redis);
        }
        global.config = Object.assign({}, defaultOption, options);
        if (!global.cache) {
            global.cache = new RedisCache(global.config.redis);
        }
        if (typeof addressOrLocation === 'string') {
            self.address = addressOrLocation
        } else {
            self.location = {
                data: addressOrLocation
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
    this.locale = 'en_gb';
}

Generator.prototype.getLocation = async function () {
    const self = this;
    if (self.location) {
        return self.location;
    }
    const response = await fetchLocation(self.address);
    if (response.data || (response.error.message.indexOf('No results from geocode api'))) {
        self.location = response;
    }
    return response;
}

Generator.prototype.getPlaceId = async function (retailerId, placeTypes) {
    if (!retailerId) {
        throw new Error('retailerId is required required when try to get placeId');
    }
    const self = this;
    if (self.placeId) {
        return self.placeId;
    }
    let response = await self.getLocation();
    if (response.data) {
        response = await fetchPlaceId(retailerId, response.data, placeTypes || self.defaultPlaceTypes);
    }
    if (response.data ||
        response.error.message.indexOf('No results') !== -1) {
        self.placeId = {
            data: null,
            message: response.error ? response.error.message : 'OK'
        };
    }
    return response;
}

Generator.prototype.getPlaceDetails = async function (retailerId, locale, placeTypes) {
    const self = this;
    if (self.placeDetails) {
        return self.placeDetails;
    }
    let response = await self.getPlaceId(retailerId, placeTypes);
    if (response.data) {
        response = await fetchPlaceDetails(response.data, locale);
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
Generator.prototype.getFullPlace = async function (retailerId, locale, placeTypes, timezoneId) {
    const self = this;
    if (self.store) {
        return self.store;
    }
    const response = await self.getPlaceDetails(retailerId, locale, placeTypes);
    if (response.data) {
        const formatS = await formatStore(response.data, retailerId, locale);
        if (formatS.error) {
            return {
                error: formatS.error
            };
        }
        const timezone = await self.getTimezone();
        if (timezone.data) {
            formatS.timezone = timezone.data;
        }
        self.store = {
            data: Object.assign({}, formatS)
        };
    }
    return Object.assign(response, self.store);

}

module.exports = Generator;