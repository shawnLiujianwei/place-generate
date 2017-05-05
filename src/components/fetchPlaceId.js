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
    if (!name || !location) {
        return Promise.reject(new Error('name and location are both required to fetch place id'));
    }
    const {cache, config} = global;
    const cacheKey = `placeId-${name}-${JSON.stringify(location)}`;
    const cacheData = await cache.getItem(cacheKey);
    if (cacheData && cacheData !== {}) {
        logger.info(`Using placeId cache: '${location}'`);
        return cacheData;
    }
    logger.info(`Fetching placeId by name='${name}' and location=${JSON.stringify(location)}`);
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
    // logger.info(`Fetched placeId :`, placeId);
    if (placeId) {
        await cache.setItem(cacheKey, placeId);
        return placeId;
    }
    throw new Error(`No results from google nearbysearch with name=${name} type=${query.type || query.types}, location=${JSON.stringify(location)}`);
}

module.exports = async (name, location, type, retryTimes) => {
    let error = null;
    for (let i = 0; i < (retryTimes || 1); i++) {
        try {
            const placeId = await  getPlaceId(name, location, type);
            return {
                data: placeId
            }
        } catch (e) {
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
    return {
        error
    };
};
