const http = require('request-promise');
const logger = require('log4js').getLogger('src/components/fetchLocation.js');
const Promise = require('bluebird');
const apiURL = require('./googleServerURL');

function parseLocation(res) {
    if (!res.results.length) {
        return null;
    }

    return {
        coordinates: res.results[0].geometry.location,
        placeId: res.results[0].place_id
    };
}

async function getLocation(address, cache, googleKey) {
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
    // logger.info(`Fetching  location for: '${address}'`);
    const jsonResponse = await http.get(apiURL.location(), {
        qs: {
            address: address,
            key: googleKey
        }
    })
        .then(JSON.parse);
    const result = parseLocation(jsonResponse);

    if (!result) {
        throw new Error(jsonResponse.error_message || `No results from geocode api with address: '${address}'`);
    }
    logger.info(`Fetched location: `, result);
    await cache.setItem(cacheKey, result);
    return result;
}

const validAddress = (name, address) => {
    const finalAddress = address.indexOf(name) !== -1 ? address : `${name} ${address}`;
    const regrex = /[^a-z A-Z ,0-9 .]/g;
    return finalAddress.replace(regrex, '');
}

/**
 * @param name , the name of the place,
 * @param address, if the address contains placeName, the response will include the valid placeId, otherwise the placeId is not the expected one
 * need use nearbysearch api to get the real placeId
 * @param cache
 * @param googleKey
 * @param retryTimes
 * @returns {Promise.<*>}
 */
module.exports = async (name, address, cache, googleKey, retryTimes) => {
    const times = retryTimes || 1;
    let error = null;
    for (let i = 0; i < times; i++) {
        try {
            const data = await getLocation(validAddress(name, address), cache, googleKey);
            return {
                data
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
