const http = require('request-promise');
const logger = require('log4js').getLogger('src/components/geocode.js');
const Promise = require('bluebird');
const apiURL = require('./googleServerURL');

function parseLocation(res) {
    if (!res.results.length) {
        return null;
    }

    return {
        location: res.results[0].geometry.location,
        placeId: res.results[0].place_id
    };
}

async function getLocation(address) {
    const {cache, config} = global;
    if (!address) {
        throw new Error('address is required when getting location');
    }
    // const address = `${store.address}, ${store.city}, ${store.state} ${store.zip}`;
    const cacheKey = `geocode_${address}`;
    const cacheData = await cache.getItem(cacheKey);
    if (cacheData && cacheData !== {}) {
        logger.info(`Using geocode cache: ${address}`);
        return cacheData;
    }
    const url = apiURL.location();
    logger.info(`Fetching geocode: ${address}`);
    const jsonResponse = await http.get(url, {
        qs: {
            address: address,
            key: config.googleAPIKey
        }
    })
        .then(JSON.parse);
    const location = parseLocation(jsonResponse);

    if (!location) {
        throw new Error(jsonResponse.error_message || 'No results from geocode api');
    }
    logger.info(`Fetched geolocation: ${location}`);
    await cache.setItem(cacheKey, location);
    return location;
}

module.exports = async (address, retryTimes) => {
    const times = retryTimes || 2;
    let error = null;
    for (let i = 0; i < times; i++) {
        try {
            return await getLocation(address);
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
