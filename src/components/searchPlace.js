const http = require('request-promise');
const Promise = require('bluebird');
const apiURL = require('./googleServerURL');
const logger = require('log4js').getLogger('src/components/fetchPlaceId.js');

function parsePlace(res) {
    if (!res.results.length) {
        return null;
    }
    return res.results.map(t => {
        return {
            placeId: t.place_id,
            location: t.geometry.location
        }
    });
}

/**
 *
 * @param store
 * @returns {*}
 */
async function searchPlace(name, location, types, radius, cache, googleKey) {
    if (!name || !location) {
        return Promise.reject(new Error('name and location are both required to fetch place id'));
    }

    // logger.info(`Fetching placeId by name='${name}' and location=${JSON.stringify(location)}`);
    const query = {
        location: `${location.lat},${location.lng}`,
        name,
        radius: Math.min(radius || 500, 20000),
        key: googleKey,
        // type:types[0]
        type: types[0]
    }
    const cacheKey = `radarsearch-${JSON.stringify(Object.assign({},query,{key:null}))}`;
    const cacheData = await cache.getItem(cacheKey);
    if (cacheData && cacheData !== {}) {
        logger.info(`Using placeId cache: '${location}'`);
        return cacheData;
    }
    // if (type) {
    //     if (type.indexOf('|') !== -1) {
    //         query.type = type.split('|')[0];
    //     } else {
    //
    //         query.type = type;
    //     }
    // }
    const res = await http.get(apiURL.radar(), {
        qs: query
    })
        .then(JSON.parse);

    const placeList = parsePlace(res);
    if (placeList) {
        await cache.setItem(cacheKey, placeList);
        return placeList;
    }
    throw new Error(`No results from google nearbysearch with name=${name} type=${query.type || query.types}, location=${JSON.stringify(location)}`);
}

module.exports = async (name, location, type, radius, cache, googleKey, retryTimes) => {
    let error = null;
    for (let i = 0; i < (retryTimes || 1); i++) {
        try {
            const placeList = await  searchPlace(name, location, type, radius, cache, googleKey);
            return {
                data: placeList
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
