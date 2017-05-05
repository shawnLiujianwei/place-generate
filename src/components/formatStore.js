/**
 * Created by Shawn Liu on 17/4/19.
 */
module.exports = (scraped, retailer1, locale) => {
    if (!scraped || !scraped.result || !locale || !retailer1) {
        throw new Error('scrapedResult,locale, retailer are all required when format the store');
    }
    let retailer = retailer1;
    const scrapedResult = scraped.result;
    if (retailer !== 'independent' && scrapedResult.website
        && scrapedResult.website.indexOf(retailer) === -1) {
        const msg = `Unexpected place ,
      the expected site is ${retailer}, but got ${scrapedResult.website}`;
        return Promise.reject({
            status: 'error',
            message: msg,
            placeId: scrapedResult.place_id,
            type: 'unexpected'
        });
    }
    // TODO
    const geometry = scrapedResult.geometry;
    const openingHours = scrapedResult.opening_hours || {};
    if (retailer === 'docmorris-apotheke.de') {
        retailer = 'docmorris.de';
    }
    return {
        placeId: scrapedResult.place_id,
        locale,
        retailer,
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
        updateDate: new Date(),
    };
}