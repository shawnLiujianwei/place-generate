const http = require('request-promise');
const Promise = require('bluebird');
const apiURL = require('./googleServerURL');
const logger = require('log4js').getLogger('src/components/fetchPlaceId.js');

function parsePlaceId(res) {
    if (!res.results.length) {
        return null;
    }
    return res.results[0].place_id;
}

/**
 *
 * @param store
 * @returns {*}
 */
async function getPlaceId(name, location, type) {
    if (!location) {
        return Promise.reject(new Error('No location'));
    }
    const {cache, config} = global;
    const cacheKey = `placeId-${name}-${JSON.stringify(location)}`;
    const cacheData = await cache.getItem(cacheKey);
    if (cacheData && cacheData !== {}) {
        logger.info(`Using placeId cache: '${location}'`);
        return cacheData;
    }
    logger.info(`Fetching placeId by name and location: ${name} - ${location}`);
    const query = {
        location: `${location.lat},${location.lng}`,
        name,
        radius: '300',
        key: config.googleAPIKey
    }
    if (type) {
        if (type.indexOf('|') !== -1) {
            query.types = type;
        } else {

            query.type = type;
        }
    } else {
        query.types = 'convenience_store|store|gas_station|grocery_or_supermarket'
    }
    const res = await http.get(apiURL.placeId(), {
        qs: query
    })
        .then(JSON.parse);
    const placeId = parsePlaceId(res);
    logger.info(`Fetched placeId :`, placeId);
    if (placeId) {
        await cache.setItem(cacheKey, placeId);
        return placeId;
    }
    throw new Error(`Failed to get placeId by 'name: ${name}, location: ${location}'`);
}

module.exports = async (name, location, type, retryTimes) => {
    let error = null;
    for (let i = 0; i < (retryTimes || 2); i--) {
        try {
            return await  getPlaceId(name, location, type);
        } catch (e) {
            logger.error(e);
            if (e && e.statusCode === 400) {
                error = {
                    message: JSON.parse(e.response.body).error_message
                }
            } else {
                error = e;
            }
            await Promise.delay(Math.random() * 100);
        }
    }
    throw error;
};
