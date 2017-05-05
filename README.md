# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* constructs store by specific `address` or `location lat&lng object`

```javascript
const GoogleStore = require('../src/index');

(async () => {
    try {
        const address = 'Homebase Ltd, 345 High Rd, Harrow HA3 6HF, United Kingdom';
        const googleStore = new GoogleStore(address);
        let response = await googleStore.getLocation();
        console.log('location::------', response.data);
        response = await googleStore.getPlaceId('argos.co.uk');
        console.log('placeId::------', response.data);
        response = await googleStore.getPlaceDetails('argos.co.uk','en_gb');
        console.log('placeDetails::------',response.data);
        response = await googleStore.getTimezone();
        console.log('timezone::------', response.data);
        response = await googleStore.getFullPlace('argos.co.uk', 'en_gb');
        console.log('store::------', response.data);
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
    data: { placeId: 'ChIJZ2S08KN-0ocRaBZY1iTuNTw',
            locale: 'en_us',
            retailer: 'walmart.com',
            type: 
             [ 'department_store',
               'electronics_store',
               'grocery_or_supermarket',
               'food',
               'store',
               'point_of_interest',
               'establishment' ],
            location: { type: 'Point', coordinates: [ -92.436863, 35.108599 ] },
            summary: 
             { name: 'Walmart Supercenter',
               address: '1155 Hwy 65 N, Conway, AR 72032, USA',
               phone: '(501) 329-0023',
               internationalPhone: '+1 501-329-0023',
               weekdayText: 
                [ 'Monday: Open 24 hours',
                  'Tuesday: Open 24 hours',
                  'Wednesday: Open 24 hours',
                  'Thursday: Open 24 hours',
                  'Friday: Open 24 hours',
                  'Saturday: Open 24 hours',
                  'Sunday: Open 24 hours' ] },
            openingHourPeriods: [ { open: [Object] } ],
            updateDate: 2017-05-04T02:49:51.482Z,
            timezone: 
             { dstOffset: 3600,
               rawOffset: -21600,
               status: 'OK',
               timeZoneId: 'America/Chicago',
               timeZoneName: 'Central Daylight Time' } }
}

````

### How do I get set up? ###

* just includ this module to your project and call the function

