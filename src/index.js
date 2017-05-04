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

module.exports = async (addressOrLocation, retailer, locale, options) => {
    try {
        logger.info(`Processing: ${locale} - ${retailer}:`, addressOrLocation)
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
        const cache = global.cache;
        const cacheKey = typeof addressOrLocation === 'object' ? `storeJSON_${addressOrLocation.toString()}`
            : `storeJSON_${addressOrLocation}`;
        const cacheStore = await cache.getItem(cacheKey);
        if (cacheStore) {
            return cacheStore;
        }
        let location = null;
        if (typeof addressOrLocation === 'string') {
            location = await fetchLocation(addressOrLocation);
        } else if (typeof  addressOrLocation === 'object') {
            if (!addressOrLocation.lat || !addressOrLocation.lng) {
                throw new Error('lat&lng are both required when use location to decode one store');
            }
        }
        const placeId = await fetchPlaceId(retailer, location, options.type);
        const placeDetails = await fetchPlaceDetails(placeId, locale);
        const timezone = await fetchTimezone(location);
        const store = formatStore(placeDetails, locale, retailer);
        store.timezone = timezone;
        await cache.setItem(cacheKey, store);
        return store;
    } catch (e) {
        console.error(e);
        return null;
    }

}