'use strict';

const superagent = require('superagent');
const client = require('../util/db');

function getLocationFromCache(city) {
  const SQL = `
    SELECT *
    FROM Locations
    WHERE search_query = $1
    LIMIT 1
  `;
  const parameters = [city];

  return client.query(SQL, parameters)
    .then(result => {
      if (result.rowCount > 0) {
        return (result.rows[0]);
      }
      else {
        return null;
      }
    })
}

// Returns a promise!
function setLocationInCache(location) {
  const { search_query, formatted_query, latitude, longitude } = location;

  const SQL = `
    INSERT INTO Locations (search_query, formatted_query, latitude, longitude)
    VALUES ($1, $2, $3, $4)
    -- RETURNING *
  `;
  const parameters = [search_query, formatted_query, latitude, longitude];

  // Return the promise that we'll have done a query
  return client.query(SQL, parameters)
    .then(result => {
      console.log('Cache Location', result);
    })
    .catch(err => {
      console.error('Failed to cache location', err);
    })
}

// Route Handler
function locationHandler(request, response) {
  // const geoData = require('./data/geo.json');
  const city = request.query.city;

  getLocationFromCache(city)
    .then(location => {
      console.log('Location from cache', location)
      if (location) {
        response.send(location);
      }
      else {
        return getLocationFromAPI(city)
          .then(location => {
            response.send(location)
          })
      }
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}

function getLocationFromAPI(city) {
  console.log('Requesting location from API', city)
  const url = 'https://us1.locationiq.com/v1/search.php';
  return superagent.get(url)
    .query({
      key: process.env.GEO_KEY,
      q: city, // query
      format: 'json'
    })
    .then(locationResponse => {
      let geoData = locationResponse.body;
      // console.log(geoData);

      const location = new Location(city, geoData);

      return setLocationInCache(location)
        .then(() => {
          console.log('Location has been cached', location);

          return location;
        });
    })
}

function Location(city, geoData) {
  this.search_query = city; // "cedar rapids"
  this.formatted_query = geoData[0].display_name; // "Cedar Rapids, Iowa"
  this.latitude = parseFloat(geoData[0].lat);
  this.longitude = parseFloat(geoData[0].lon);
}

module.exports = locationHandler;
