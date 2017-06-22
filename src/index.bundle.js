module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 16);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/asyncToGenerator");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/regenerator");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("log4js");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("bluebird");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Created by shawn on 17/2/10.
 */
function getBaseServer() {
    return global.config.gcacheURL ? global.config.gcacheURL : 'https://maps.googleapis.com';
}

exports.radar = function () {
    return getBaseServer() + '/maps/api/place/radarsearch/json';
};

exports.location = function () {
    return getBaseServer() + '/maps/api/geocode/json';
};

exports.details = function () {
    return getBaseServer() + '/maps/api/place/details/json';
};

exports.placeId = function () {
    return getBaseServer() + '/maps/api/place/nearbysearch/json';
};

exports.timezone = function () {
    return getBaseServer() + '/maps/api/timezone/json';
};

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("request-promise");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/object/assign");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/json/stringify");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/promise");

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _regenerator = __webpack_require__(1);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = __webpack_require__(8);

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = __webpack_require__(0);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = __webpack_require__(7);

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = __webpack_require__(6);

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by Shawn Liu on 17/4/19.
 */
var bluebird = __webpack_require__(3);
var redis = __webpack_require__(18);
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
var sha1 = __webpack_require__(17);

var RedisCache = function RedisCache(client, options) {
    // arrow function can not be used as constructor
    this.client = client || redis.createClient(options);
    this.defaultOptions = {
        expire: 604800 * 4 // 28 days
    };
    this.options = (0, _assign2.default)({}, this.defaultOptions, options);
};

var isJSON = function isJSON(string) {
    try {
        if (typeof string === 'string') {
            JSON.parse(string);
        } else {
            (0, _stringify2.default)(string);
        }
        return true;
    } catch (e) {
        return false;
    }
};
RedisCache.prototype.setItem = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(key, value) {
        var self, result;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        self = this;

                        if (!(key && value)) {
                            _context.next = 6;
                            break;
                        }

                        _context.next = 4;
                        return self.client.setAsync('data_cache_' + sha1(key), isJSON(value) ? (0, _stringify2.default)(value) : value, 'EX', self.options.expire);

                    case 4:
                        result = _context.sent;
                        return _context.abrupt('return', result);

                    case 6:
                        console.error('both key and value are required when save cache');
                        return _context.abrupt('return', _promise2.default.resolve());

                    case 8:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

RedisCache.prototype.getItem = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(key) {
        var self, hashKey, result;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        self = this;
                        hashKey = 'data_cache_' + sha1(key);
                        _context2.next = 4;
                        return self.client.getAsync(hashKey);

                    case 4:
                        result = _context2.sent;
                        return _context2.abrupt('return', result && isJSON(result) ? JSON.parse(result) : result);

                    case 6:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function (_x3) {
        return _ref2.apply(this, arguments);
    };
}();

module.exports = RedisCache;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _regenerator = __webpack_require__(1);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = __webpack_require__(0);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var getLocation = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(address) {
        var _global, cache, config, cacheKey, cacheData, jsonResponse, location;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _global = global, cache = _global.cache, config = _global.config;

                        if (address) {
                            _context.next = 3;
                            break;
                        }

                        throw new Error('address is required when getting location');

                    case 3:

                        // const address = `${store.address}, ${store.city}, ${store.state} ${store.zip}`;
                        cacheKey = 'location_' + address;
                        _context.next = 6;
                        return cache.getItem(cacheKey);

                    case 6:
                        cacheData = _context.sent;

                        if (!(cacheData && cacheData !== {})) {
                            _context.next = 10;
                            break;
                        }

                        logger.info('Using location cache: ' + address);
                        return _context.abrupt('return', cacheData);

                    case 10:
                        _context.next = 12;
                        return http.get(apiURL.location(), {
                            qs: {
                                address: address,
                                key: config.googleAPIKey
                            }
                        }).then(JSON.parse);

                    case 12:
                        jsonResponse = _context.sent;
                        location = parseLocation(jsonResponse);

                        if (location) {
                            _context.next = 16;
                            break;
                        }

                        throw new Error(jsonResponse.error_message || 'No results from geocode api');

                    case 16:
                        logger.info('Fetched location: ', location);
                        _context.next = 19;
                        return cache.setItem(cacheKey, location);

                    case 19:
                        return _context.abrupt('return', location);

                    case 20:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getLocation(_x) {
        return _ref.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var http = __webpack_require__(5);
var logger = __webpack_require__(2).getLogger('src/components/fetchLocation.js');
var Promise = __webpack_require__(3);
var apiURL = __webpack_require__(4);

function parseLocation(res) {
    if (!res.results.length) {
        return null;
    }

    return res.results[0].geometry.location;
}

module.exports = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(address, retryTimes) {
        var times, error, i, location;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        times = retryTimes || 1;
                        error = null;
                        i = 0;

                    case 3:
                        if (!(i < times)) {
                            _context2.next = 19;
                            break;
                        }

                        _context2.prev = 4;
                        _context2.next = 7;
                        return getLocation(address);

                    case 7:
                        location = _context2.sent;
                        return _context2.abrupt('return', {
                            data: location
                        });

                    case 11:
                        _context2.prev = 11;
                        _context2.t0 = _context2['catch'](4);


                        if (_context2.t0 && _context2.t0.statusCode === 400) {
                            error = {
                                message: JSON.parse(_context2.t0.response.body).error_message
                            };
                        } else {
                            error = _context2.t0;
                        }
                        _context2.next = 16;
                        return Promise.delay(Math.random() * 100);

                    case 16:
                        i++;
                        _context2.next = 3;
                        break;

                    case 19:
                        logger.error(error);
                        return _context2.abrupt('return', {
                            error: error
                        });

                    case 21:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined, [[4, 11]]);
    }));

    return function (_x2, _x3) {
        return _ref2.apply(this, arguments);
    };
}();

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _regenerator = __webpack_require__(1);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = __webpack_require__(0);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var getDetails = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(placeId, locale) {
        var _global, cache, config, query, cacheKey, cacheData, scraped;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _global = global, cache = _global.cache, config = _global.config;

                        if (placeId) {
                            _context.next = 3;
                            break;
                        }

                        return _context.abrupt('return', Promise.reject({
                            errorMessage: 'placeId is required to get place details'
                        }));

                    case 3:
                        query = {
                            placeid: placeId,
                            key: config.googleAPIKey,
                            language: locale ? locale.substr(0, 2) : 'en'
                        };
                        cacheKey = 'details_' + placeId + '_' + query.language;
                        _context.next = 7;
                        return cache.getItem(cacheKey);

                    case 7:
                        cacheData = _context.sent;

                        if (!(cacheData && cacheData !== {})) {
                            _context.next = 11;
                            break;
                        }

                        logger.info('Using details cache: ' + placeId);
                        return _context.abrupt('return', cacheData);

                    case 11:
                        _context.next = 13;
                        return http.get(apiURL.details(), {
                            qs: query
                        }).then(JSON.parse);

                    case 13:
                        scraped = _context.sent;

                        logger.info('Fetched details: ', scraped.result ? scraped.result.formatted_address : scraped.result);

                        if (!(scraped && scraped.error_message)) {
                            _context.next = 19;
                            break;
                        }

                        throw new Error(scraped.error_message);

                    case 19:
                        if (scraped) {
                            _context.next = 21;
                            break;
                        }

                        throw new Error('Got no response from google API');

                    case 21:
                        _context.next = 23;
                        return cache.setItem(cacheKey, scraped);

                    case 23:
                        return _context.abrupt('return', scraped);

                    case 24:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getDetails(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *  used for stores scraped from google
 */
var http = __webpack_require__(5);
var logger = __webpack_require__(2).getLogger('src/components/fetchPlaceDetails.js');
var Promise = __webpack_require__(3);
var apiURL = __webpack_require__(4);

module.exports = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(placeId, locale, retryTimes) {
        var times, error, i, details;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        times = retryTimes || 1;
                        error = null;
                        i = 0;

                    case 3:
                        if (!(i < times)) {
                            _context2.next = 19;
                            break;
                        }

                        _context2.prev = 4;
                        _context2.next = 7;
                        return getDetails(placeId, locale);

                    case 7:
                        details = _context2.sent;
                        return _context2.abrupt('return', {
                            data: details
                        });

                    case 11:
                        _context2.prev = 11;
                        _context2.t0 = _context2['catch'](4);


                        if (_context2.t0 && _context2.t0.statusCode === 400) {
                            error = {
                                message: JSON.parse(_context2.t0.response.body).error_message
                            };
                        } else {
                            error = _context2.t0;
                        }
                        _context2.next = 16;
                        return Promise.delay(Math.random() * 100);

                    case 16:
                        i++;
                        _context2.next = 3;
                        break;

                    case 19:
                        logger.error(error);
                        return _context2.abrupt('return', {
                            error: error
                        });

                    case 21:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined, [[4, 11]]);
    }));

    return function (_x3, _x4, _x5) {
        return _ref2.apply(this, arguments);
    };
}();

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _regenerator = __webpack_require__(1);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = __webpack_require__(7);

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = __webpack_require__(0);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/**
 *
 * @param store
 * @returns {*}
 */
var getPlaceId = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(name, location, type, radius) {
        var _global, cache, config, cacheKey, cacheData, query, res, placeId;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(!name || !location)) {
                            _context.next = 2;
                            break;
                        }

                        return _context.abrupt('return', Promise.reject(new Error('name and location are both required to fetch place id')));

                    case 2:
                        _global = global, cache = _global.cache, config = _global.config;
                        cacheKey = 'placeId-' + name + '-' + (0, _stringify2.default)(location);
                        _context.next = 6;
                        return cache.getItem(cacheKey);

                    case 6:
                        cacheData = _context.sent;

                        if (!(cacheData && cacheData !== {})) {
                            _context.next = 10;
                            break;
                        }

                        logger.info('Using placeId cache: \'' + location + '\'');
                        return _context.abrupt('return', cacheData);

                    case 10:
                        // logger.info(`Fetching placeId by name='${name}' and location=${JSON.stringify(location)}`);
                        query = {
                            location: location.lat + ',' + location.lng,
                            name: name,
                            radius: radius || '500',
                            key: config.googleAPIKey
                        };

                        if (type) {
                            if (type.indexOf('|') !== -1) {
                                query.types = type;
                            } else {

                                query.type = type;
                            }
                        }
                        _context.next = 14;
                        return http.get(apiURL.placeId(), {
                            qs: query
                        }).then(JSON.parse);

                    case 14:
                        res = _context.sent;
                        placeId = parsePlaceId(res);
                        // logger.info(`Fetched placeId :`, placeId);

                        if (!placeId) {
                            _context.next = 20;
                            break;
                        }

                        _context.next = 19;
                        return cache.setItem(cacheKey, placeId);

                    case 19:
                        return _context.abrupt('return', placeId);

                    case 20:
                        throw new Error('No results from google nearbysearch with name=' + name + ' type=' + (query.type || query.types) + ', location=' + (0, _stringify2.default)(location));

                    case 21:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getPlaceId(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var http = __webpack_require__(5);
var Promise = __webpack_require__(3);
var apiURL = __webpack_require__(4);
var logger = __webpack_require__(2).getLogger('src/components/fetchPlaceId.js');

function parsePlaceId(res) {
    if (!res.results.length) {
        return null;
    }
    return res.results[0].place_id;
}

module.exports = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(name, location, type, radius, retryTimes) {
        var error, i, placeId;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        error = null;
                        i = 0;

                    case 2:
                        if (!(i < (retryTimes || 1))) {
                            _context2.next = 18;
                            break;
                        }

                        _context2.prev = 3;
                        _context2.next = 6;
                        return getPlaceId(name, location, type, radius);

                    case 6:
                        placeId = _context2.sent;
                        return _context2.abrupt('return', {
                            data: placeId
                        });

                    case 10:
                        _context2.prev = 10;
                        _context2.t0 = _context2['catch'](3);

                        if (_context2.t0 && _context2.t0.statusCode === 400) {
                            error = {
                                message: JSON.parse(_context2.t0.response.body).error_message
                            };
                        } else {
                            error = _context2.t0;
                        }
                        _context2.next = 15;
                        return Promise.delay(Math.random() * 100);

                    case 15:
                        i++;
                        _context2.next = 2;
                        break;

                    case 18:
                        return _context2.abrupt('return', {
                            error: error
                        });

                    case 19:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined, [[3, 10]]);
    }));

    return function (_x5, _x6, _x7, _x8, _x9) {
        return _ref2.apply(this, arguments);
    };
}();

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _regenerator = __webpack_require__(1);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = __webpack_require__(0);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

/**
 * get timezone by specific location
 * @param geoLocation {lat:xxx, lng:xxx}
 * @returns {*}
 */
var getTimezone = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(geoLocation) {
        var _global, cache, config, cacheKey, cacheData, scraped;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (geoLocation) {
                            _context.next = 2;
                            break;
                        }

                        throw new Error('No location , so can not get timezone');

                    case 2:
                        if (!(!geoLocation.lat || !geoLocation.lng)) {
                            _context.next = 4;
                            break;
                        }

                        throw new Error('please set valid lat&lng');

                    case 4:
                        _global = global, cache = _global.cache, config = _global.config;
                        cacheKey = 'timezone_' + geoLocation.lat + '-' + geoLocation.lng;
                        _context.next = 8;
                        return cache.getItem(cacheKey);

                    case 8:
                        cacheData = _context.sent;

                        if (!(cacheData && cacheData !== {})) {
                            _context.next = 12;
                            break;
                        }

                        logger.info('Using timezone cache:', geoLocation);
                        return _context.abrupt('return', cacheData);

                    case 12:
                        _context.next = 14;
                        return http.get(apiURL.timezone(), {
                            qs: {
                                location: geoLocation.lat + ',' + geoLocation.lng,
                                timestamp: new Date().getTime() / 1000,
                                key: config.googleAPIKey
                            }
                        }).then(JSON.parse);

                    case 14:
                        scraped = _context.sent;

                        if (!(scraped && scraped.error_message)) {
                            _context.next = 19;
                            break;
                        }

                        throw new Error(scraped.error_message);

                    case 19:
                        if (scraped) {
                            _context.next = 21;
                            break;
                        }

                        throw new Error('Got no response from google API');

                    case 21:
                        logger.info('Fetched timezone: ', scraped.timeZoneId);
                        _context.next = 24;
                        return cache.setItem(cacheKey, scraped);

                    case 24:
                        return _context.abrupt('return', scraped);

                    case 25:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getTimezone(_x) {
        return _ref.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var http = __webpack_require__(5);
var logger = __webpack_require__(2).getLogger('src/components/fetchTimezone.js');
var Promise = __webpack_require__(3);
var apiURL = __webpack_require__(4);

module.exports = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(location, retryTimes) {
        var error, i, timezone;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        error = null;
                        i = 0;

                    case 2:
                        if (!(i < (retryTimes || 1))) {
                            _context2.next = 18;
                            break;
                        }

                        _context2.prev = 3;
                        _context2.next = 6;
                        return getTimezone({
                            lat: location.lat,
                            lng: location.lng
                        });

                    case 6:
                        timezone = _context2.sent;
                        return _context2.abrupt('return', {
                            data: timezone
                        });

                    case 10:
                        _context2.prev = 10;
                        _context2.t0 = _context2['catch'](3);


                        if (_context2.t0 && _context2.t0.statusCode === 400) {
                            error = {
                                message: JSON.parse(_context2.t0.response.body).error_message
                            };
                        } else {
                            error = _context2.t0;
                        }
                        _context2.next = 15;
                        return Promise.delay(Math.random() * 100);

                    case 15:
                        i++;
                        _context2.next = 2;
                        break;

                    case 18:
                        logger.error(error);
                        return _context2.abrupt('return', {
                            error: error
                        });

                    case 20:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined, [[3, 10]]);
    }));

    return function (_x2, _x3) {
        return _ref2.apply(this, arguments);
    };
}();

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _promise = __webpack_require__(8);

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by Shawn Liu on 17/4/19.
 */
module.exports = function (scraped, retailer1, locale) {
    if (!scraped || !scraped.result || !retailer1) {
        throw new Error('scrapedResult, retailer are all required when format the store');
    }
    var retailer = retailer1;
    var scrapedResult = scraped.result;
    if (retailer !== 'independent' && scrapedResult.website && scrapedResult.website.indexOf(retailer) === -1) {
        var msg = 'Unexpected place ,\n      the expected site is ' + retailer + ', but got ' + scrapedResult.website;
        return _promise2.default.reject({
            status: 'error',
            message: msg,
            placeId: scrapedResult.place_id,
            type: 'unexpected'
        });
    }
    // TODO
    var geometry = scrapedResult.geometry;
    var openingHours = scrapedResult.opening_hours || {};
    if (retailer === 'docmorris-apotheke.de') {
        retailer = 'docmorris.de';
    }
    return {
        placeId: scrapedResult.place_id,
        locale: locale,
        retailer: retailer,
        type: scrapedResult.types,
        location: {
            type: 'Point',
            coordinates: [geometry.location.lng, geometry.location.lat]
        },
        summary: {
            name: scrapedResult.name,
            address: scrapedResult.formatted_address || '',
            phone: scrapedResult.formatted_phone_number || '',
            internationalPhone: scrapedResult.international_phone_number || '',
            weekdayText: openingHours.weekday_text || []
        },
        openingHourPeriods: openingHours.periods || [],
        updateDate: new Date()
    };
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _regenerator = __webpack_require__(1);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = __webpack_require__(0);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var getLocation = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(address) {
        var _global, cache, config, cacheKey, cacheData, url, jsonResponse, location;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _global = global, cache = _global.cache, config = _global.config;

                        if (address) {
                            _context.next = 3;
                            break;
                        }

                        throw new Error('address is required when getting location');

                    case 3:
                        // const address = `${store.address}, ${store.city}, ${store.state} ${store.zip}`;
                        cacheKey = 'geocode_' + address;
                        _context.next = 6;
                        return cache.getItem(cacheKey);

                    case 6:
                        cacheData = _context.sent;

                        if (!(cacheData && cacheData !== {})) {
                            _context.next = 10;
                            break;
                        }

                        logger.info('Using geocode cache: ' + address);
                        return _context.abrupt('return', cacheData);

                    case 10:
                        url = apiURL.location();

                        logger.info('Fetching geocode: ' + address);
                        _context.next = 14;
                        return http.get(url, {
                            qs: {
                                address: address,
                                key: config.googleAPIKey
                            }
                        }).then(JSON.parse);

                    case 14:
                        jsonResponse = _context.sent;
                        location = parseLocation(jsonResponse);

                        if (location) {
                            _context.next = 18;
                            break;
                        }

                        throw new Error(jsonResponse.error_message || 'No results from geocode api');

                    case 18:
                        logger.info('Fetched geolocation: ' + location);
                        _context.next = 21;
                        return cache.setItem(cacheKey, location);

                    case 21:
                        return _context.abrupt('return', location);

                    case 22:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getLocation(_x) {
        return _ref.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var http = __webpack_require__(5);
var logger = __webpack_require__(2).getLogger('src/components/geocode.js');
var Promise = __webpack_require__(3);
var apiURL = __webpack_require__(4);

function parseLocation(res) {
    if (!res.results.length) {
        return null;
    }

    return {
        location: res.results[0].geometry.location,
        placeId: res.results[0].place_id
    };
}

module.exports = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(address, retryTimes) {
        var times, error, i;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        times = retryTimes || 2;
                        error = null;
                        i = 0;

                    case 3:
                        if (!(i < times)) {
                            _context2.next = 19;
                            break;
                        }

                        _context2.prev = 4;
                        _context2.next = 7;
                        return getLocation(address);

                    case 7:
                        return _context2.abrupt('return', _context2.sent);

                    case 10:
                        _context2.prev = 10;
                        _context2.t0 = _context2['catch'](4);

                        logger.error(_context2.t0);
                        if (_context2.t0 && _context2.t0.statusCode === 400) {
                            error = {
                                message: JSON.parse(_context2.t0.response.body).error_message
                            };
                        } else {
                            error = _context2.t0;
                        }
                        _context2.next = 16;
                        return Promise.delay(Math.random() * 100);

                    case 16:
                        i++;
                        _context2.next = 3;
                        break;

                    case 19:
                        throw error;

                    case 20:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined, [[4, 10]]);
    }));

    return function (_x2, _x3) {
        return _ref2.apply(this, arguments);
    };
}();

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _regenerator = __webpack_require__(1);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = __webpack_require__(0);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _assign = __webpack_require__(6);

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by Shawn Liu on 17/4/19.
 */
var log4js = __webpack_require__(2);
var RedisCache = __webpack_require__(9);
var geocode = __webpack_require__(15);
var fetchLocation = __webpack_require__(10);
var fetchPlaceId = __webpack_require__(12);
var fetchPlaceDetails = __webpack_require__(11);
var fetchTimezone = __webpack_require__(13);
var formatStore = __webpack_require__(14);
var logger = log4js.getLogger('src/index.js');

var checkOptions = function checkOptions(options) {
    if (!options) {
        throw new Error('options is required');
    }
    if (!options.googleAPIKey) {
        throw new Error('googleAPIKey is required');
    }

    if (!options.retailerId) {
        throw new Error('retailer id is required');
    }
    // if (!options.placeQuery) {
    //     throw new Error('placeQuery  is required');
    // }
    // if (!options.locale) {
    //     throw new Error('Place locale is required');
    // }
};

var defaultOption = {
    type: 'convenience_store|store|gas_station|grocery_or_supermarket|food|restaurant|establishment',
    queryRadius: 500, //meters
    redis: {
        host: 'localhost',
        port: 6379,
        namespace: 'construct-store-by-google-redis-cache',
        expire: 604800 * 4 // 28 days
    },
    redisClient: null,
    googleAPIKey: ''
    // gcacheURL: 'https://gcache.evan.dotter.me'
};

/**
 *
 * @param addressOrLocation address string or {lat:xxx, lng:xxx}
 * @param options
 * @param timezoneId
 * @constructor
 */
var Generator = function Generator(addressOrLocation, options, timezoneId) {
    this.init = function () {
        if (!addressOrLocation) {
            throw new Error('Either address or location({lat:xxx, lng:xx}) is required');
        }
        var self = this;
        checkOptions(options);
        global.config = (0, _assign2.default)(global.config || {}, defaultOption, options);
        if (global.config.verbose) {
            log4js.configure({
                appenders: [{
                    type: 'console',
                    level: global.config.logLevel || 'DEBUG'
                }],
                levels: {
                    '[all]': global.config.logLevel || 'DEBUG'
                }
            });
        } else {
            log4js.configure({
                appenders: [{
                    type: 'console',
                    level: 'OFF'
                }],
                levels: {
                    '[all]': 'OFF'
                }
            });
        }
        self.placeQuery = global.config.placeQuery;
        self.locale = global.config.locale;
        self.retailerId = global.config.retailerId;
        self.queryRadius = global.config.queryRadius;
        self.placeTypes = global.config.placeTypes || 'convenience_store|store|gas_station|grocery_or_supermarket|food|restaurant|establishment';
        if (!global.cache) {
            if (global.config.redisClient) {
                global.cache = new RedisCache(global.config.redisClient);
            } else {
                options.redis = (0, _assign2.default)({}, defaultOption.redis, options.redis);
                global.cache = new RedisCache(global.config.redisClient, global.config.redis);
            }
            // if (!options.redis) {
            //     console.info('Will use default redis configuration:', defaultOption.redis);
            // } else {
            //     options.redis = Object.assign({}, defaultOption.redis, options.redis);
            // }
            // global.cache = new RedisCache(global.config.redisClient, global.config.redis);
        }
        if (typeof addressOrLocation === 'string') {
            self.address = addressOrLocation;
        } else {
            self.location = {
                data: {
                    lat: parseFloat(addressOrLocation.lat),
                    lng: parseFloat(addressOrLocation.lng)
                }
            }; //{lat:xxx, lng:xxxx}
        }
        if (timezoneId) {
            self.timezone = {
                data: {
                    timeZoneId: timezoneId
                }
            };
        }
    };
    this.defaultPlaceTypes = 'convenience_store|store|gas_station|grocery_or_supermarket|food|restaurant|establishment';
    this.init();
    this.locale = global.config.locale;
};

Generator.prototype.getLocation = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
    var self, response;
    return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    self = this;

                    if (!self.location) {
                        _context.next = 3;
                        break;
                    }

                    return _context.abrupt('return', self.location);

                case 3:
                    _context.next = 5;
                    return fetchLocation(self.address);

                case 5:
                    response = _context.sent;

                    if (response.error && response.error.message.indexOf('No results') !== -1) {
                        self.location = response = {
                            message: response.error.message
                        };
                    }
                    if (response.data) {
                        self.location = response;
                    }
                    return _context.abrupt('return', response);

                case 9:
                case 'end':
                    return _context.stop();
            }
        }
    }, _callee, this);
}));

Generator.prototype.getPlaceId = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
    var self, response;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    self = this;

                    if (!self.placeId) {
                        _context2.next = 3;
                        break;
                    }

                    return _context2.abrupt('return', self.placeId);

                case 3:
                    if (self.placeQuery) {
                        _context2.next = 5;
                        break;
                    }

                    throw new Error('place name is required when try to get place');

                case 5:
                    _context2.next = 7;
                    return self.getLocation();

                case 7:
                    response = _context2.sent;

                    if (!response.data) {
                        _context2.next = 12;
                        break;
                    }

                    _context2.next = 11;
                    return fetchPlaceId(self.placeQuery, response.data, self.placeTypes, self.queryRadius);

                case 11:
                    response = _context2.sent;

                case 12:
                    if (response.error && response.error.message.indexOf('No results') !== -1) {
                        self.placeId = response = {
                            data: null,
                            message: response.error.message || 'OK'
                        };
                    }
                    return _context2.abrupt('return', response);

                case 14:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _callee2, this);
}));

Generator.prototype.getPlaceDetails = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
    var self, response;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    self = this;

                    if (!self.placeDetails) {
                        _context3.next = 3;
                        break;
                    }

                    return _context3.abrupt('return', self.placeDetails);

                case 3:
                    _context3.next = 5;
                    return self.getPlaceId();

                case 5:
                    response = _context3.sent;

                    if (!response.data) {
                        _context3.next = 10;
                        break;
                    }

                    _context3.next = 9;
                    return fetchPlaceDetails(response.data, self.locale);

                case 9:
                    response = _context3.sent;

                case 10:
                    if (response.data) {
                        self.placeDetails = response;
                    }
                    return _context3.abrupt('return', response);

                case 12:
                case 'end':
                    return _context3.stop();
            }
        }
    }, _callee3, this);
}));

Generator.prototype.getTimezone = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
    var self, response;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    self = this;

                    if (!self.timezone) {
                        _context4.next = 3;
                        break;
                    }

                    return _context4.abrupt('return', self.timezone);

                case 3:
                    _context4.next = 5;
                    return self.getLocation();

                case 5:
                    response = _context4.sent;

                    if (!response.data) {
                        _context4.next = 10;
                        break;
                    }

                    _context4.next = 9;
                    return fetchTimezone(response.data);

                case 9:
                    response = _context4.sent;

                case 10:
                    if (response.data) {
                        self.timezone = response;
                    }
                    return _context4.abrupt('return', response);

                case 12:
                case 'end':
                    return _context4.stop();
            }
        }
    }, _callee4, this);
}));

/**
 *
 * @param queryName , required. can be retailer id or something else
 * @param placeTypes , optional. default is 'convenience_store|store|gas_station|grocery_or_supermarket|food|restaurant|establishment'
 * @returns {Promise.<void>}
 */
Generator.prototype.getFullPlace = function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(retailerId, timezoneId) {
        var self, response, formatS, timezone;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        self = this;
                        // if (self.store) {
                        //     return self.store;
                        // }

                        _context5.next = 3;
                        return self.getPlaceDetails();

                    case 3:
                        response = _context5.sent;

                        if (!response.data) {
                            _context5.next = 19;
                            break;
                        }

                        _context5.next = 7;
                        return formatStore(response.data, retailerId || self.retailerId, self.locale);

                    case 7:
                        formatS = _context5.sent;

                        if (!formatS.error) {
                            _context5.next = 10;
                            break;
                        }

                        return _context5.abrupt('return', {
                            error: formatS.error
                        });

                    case 10:
                        if (!timezoneId) {
                            _context5.next = 14;
                            break;
                        }

                        formatS.timezone = {
                            timeZoneId: timezoneId
                        };
                        _context5.next = 18;
                        break;

                    case 14:
                        _context5.next = 16;
                        return self.getTimezone();

                    case 16:
                        timezone = _context5.sent;

                        if (timezone.data) {
                            formatS.timezone = timezone.data;
                        }

                    case 18:
                        self.store = {
                            data: (0, _assign2.default)({}, formatS)
                        };

                    case 19:
                        return _context5.abrupt('return', (0, _assign2.default)(response, self.store));

                    case 20:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function (_x, _x2) {
        return _ref5.apply(this, arguments);
    };
}();

Generator.prototype.execute = function () {
    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(fnName, throwError) {
        var response;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        if (fnName) {
                            _context6.next = 2;
                            break;
                        }

                        throw new Error("Function name is required");

                    case 2:
                        _context6.next = 4;
                        return this[fnName]();

                    case 4:
                        response = _context6.sent;

                        if (!response.error) {
                            _context6.next = 7;
                            break;
                        }

                        throw response.error;

                    case 7:
                        if (!(throwError && !response.data)) {
                            _context6.next = 9;
                            break;
                        }

                        throw new Error(response.message || 'unknown error when exec funtion ' + fnName);

                    case 9:
                        return _context6.abrupt('return', response.data);

                    case 10:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function (_x3, _x4) {
        return _ref6.apply(this, arguments);
    };
}();

module.exports = Generator;

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = require("crypto-sha1");

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = require("redis");

/***/ })
/******/ ]);