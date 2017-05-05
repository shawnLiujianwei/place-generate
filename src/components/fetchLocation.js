const http = require('request-promise');
const logger = require('log4js').getLogger('src/components/fetchLocation.js');
const Promise = require('bluebird');
const apiURL = require('./googleServerURL');

function parseLocation(res) {
    if (!res.results.length) {
        return null;
    }

    return res.results[0].geometry.location;
}

async function getLocation(address) {
    const {cache, config} = global;
    if (!address) {
        throw new Error('address is required when getting location');
    }

    // const address = `${store.address}, ${store.city}, ${store.state} ${store.zip}`;
    const cacheKey = `location_${address}`;
    const cacheData = await cache.getItem(cacheKey);
    if (cacheData && cacheData !== {}) {
        logger.info(`Using location cache: ${address}`);
        return cacheData;
    }
    logger.info(`Fetching  location for: '${address}'`);
    const jsonResponse = await http.get(apiURL.location(), {
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
    logger.info(`Fetched location: `, location);
    await cache.setItem(cacheKey, location);
    return location;
}

module.exports = async (address, retryTimes) => {
    const times = retryTimes || 1;
    let error = null;
    for (let i = 0; i < times; i++) {
        try {
            const location = await getLocation(address);
            return {
                data: location
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
    logger.error(error);
    return {
        error
    }
};
