# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* constructs store by specific `address` or `location lat&lng object`

```javascript
const GoogleStore = require('../src/index');

(async () => {
    try {
            const address = 'Homebase Ltd, 345 High Rd, Harrow HA3 6HF, United Kingdom';
            const location = {
                lat: 51.6064929,
                lng: -0.3391241
            }
            const googleStore = new GoogleStore(address, {
                googleAPIKey: 'xxxxxx',
                placeQuery: 'argos',
                retailerId: 'argos.co.uk',
                locale: 'en_gb'
            });
            let response = await googleStore.getLocation();
            console.log('location::------', response.data);
            response = await googleStore.getPlaceId();
            console.log('placeId::------', response.data);
            response = await googleStore.getPlaceDetails();
            console.log('placeDetails::------', response.data);
            response = await googleStore.getTimezone();
            console.log('timezone::------', response.data);
            response = await googleStore.getFullPlace();
            console.log('store::------', JSON.stringify(response.data));
            process.exit(1);
        } catch (e) {
            console.error(e);
            process.exit(1);
        }

})()
````
then you will see data like:


````javascript 1.6
response for '#getFullPlace()':
{
    data: {
            "placeId": "ChIJHYWi9YQUdkgRO6lnQWEeCkc",
            "locale": "en_gb",
            "retailer": "argos.co.uk",
            "type": [
              "store",
              "clothing_store",
              "furniture_store",
              "home_goods_store",
              "point_of_interest",
              "establishment"
            ],
            "location": {
              "type": "Point",
              "coordinates": [
                -0.3391241,
                51.6064929
              ]
            },
            "summary": {
              "name": "Argos Harrow Weald (in Homebase)",
              "address": "Homebase Ltd, 345 High Rd, Harrow HA3 6HF, UK",
              "phone": "0345 656 4293",
              "internationalPhone": "+44 345 656 4293",
              "weekdayText": [
                "Monday: 8:00 AM – 8:00 PM",
                "Tuesday: 8:00 AM – 8:00 PM",
                "Wednesday: 8:00 AM – 8:00 PM",
                "Thursday: 8:00 AM – 8:00 PM",
                "Friday: 8:00 AM – 9:00 PM",
                "Saturday: 8:00 AM – 8:00 PM",
                "Sunday: 10:00 AM – 4:00 PM"
              ]
            },
            "openingHourPeriods": [
              {
                "close": {
                  "day": 0,
                  "time": "1600"
                },
                "open": {
                  "day": 0,
                  "time": "1000"
                }
              },
              {
                "close": {
                  "day": 1,
                  "time": "2000"
                },
                "open": {
                  "day": 1,
                  "time": "0800"
                }
              },
              {
                "close": {
                  "day": 2,
                  "time": "2000"
                },
                "open": {
                  "day": 2,
                  "time": "0800"
                }
              },
              {
                "close": {
                  "day": 3,
                  "time": "2000"
                },
                "open": {
                  "day": 3,
                  "time": "0800"
                }
              },
              {
                "close": {
                  "day": 4,
                  "time": "2000"
                },
                "open": {
                  "day": 4,
                  "time": "0800"
                }
              },
              {
                "close": {
                  "day": 5,
                  "time": "2100"
                },
                "open": {
                  "day": 5,
                  "time": "0800"
                }
              },
              {
                "close": {
                  "day": 6,
                  "time": "2000"
                },
                "open": {
                  "day": 6,
                  "time": "0800"
                }
              }
            ],
            "updateDate": "2017-05-05T08:55:39.013Z",
            "timezone": {
              "dstOffset": 3600,
              "rawOffset": 0,
              "status": "OK",
              "timeZoneId": "Europe/London",
              "timeZoneName": "British Summer Time"
            }
          }
}

````

### How do I get set up? ###

* just includ this module to your project and call the function

