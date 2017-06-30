/**
 * Created by shawn on 17/2/10.
 */
function getBaseServer() {
    return process.env.placeGeneratorGcacheURL ? process.env.placeGeneratorGcacheURL : 'https://maps.googleapis.com';
}

exports.radar = function () {
    return `${getBaseServer()}/maps/api/place/radarsearch/json`;
}

exports.location = function () {
    return `${getBaseServer()}/maps/api/geocode/json`;
}

exports.details = function () {
    return `${getBaseServer()}/maps/api/place/details/json`;
}

exports.placeId = function () {
    return `${getBaseServer()}/maps/api/place/nearbysearch/json`;
}

exports.timezone = function () {
    return `${getBaseServer()}/maps/api/timezone/json`;
}
