const http = require('request-promise');
const logger = require('log4js').getLogger('src/components/fetchTimezone.js');
const Promise = require('bluebird');
const apiURL = require('./googleServerURL');

/**
 * get timezone by specific location
 * @param geoLocation {lat:xxx, lng:xxx}
 * @returns {*}
 */
async function getTimezone(geoLocation) {
    if (!geoLocation) {
        throw new Error('No location , so can not get timezone');
    }
    if (!geoLocation.lat || !geoLocation.lng) {
        throw new Error('please set valid lat&lng');
    }
    const {cache, config} = global;
    const cacheKey = `timezone_${geoLocation.lat}-${geoLocation.lng}`;
    const cacheData = await cache.getItem(cacheKey);
    if (cacheData && cacheData !== {}) {
        logger.info(`Using timezone cache:`, geoLocation);
        return cacheData;
    }
    logger.info(`Fetching timezone: ${geoLocation}`);
    const scraped = await http.get(apiURL.timezone(), {
        qs: {
            location: `${geoLocation.lat},${geoLocation.lng}`,
            timestamp: new Date().getTime() / 1000,
            key: config.googleAPIKey
        }
    })
        .then(JSON.parse);
    if (scraped && scraped.error_message) {
        throw new Error(scraped.error_message);
    } else if (!scraped) {
        throw new Error('Got no response from google API');
    }
    logger.info(`Fetched timezone: `, scraped);
    await cache.setItem(cacheKey, scraped);
    return scraped;
}

module.exports = async (location, retryTimes) => {
    let error = null;
    for (let i = 0; i < (retryTimes || 2); i++) {
        try {
            return await getTimezone({
                lat: location.lat,
                lng: location.lng
            });
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
