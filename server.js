'use strict';

// Load Environment Variables from the .env file
const dotenv = require('dotenv')
dotenv.config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

// Database Connection Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => { throw err; });

// Application Setup
const PORT = process.env.PORT;
const app = express();

app.use(cors()); // Middleware

app.get('/', (request, response) => {
  response.send('City Explorer Goes Here');
});

app.get('/bad', (request, response) => {
  throw new Error('oops');
});

app.get('/paypal', (request, response) => {
  response.send(process.env.PAYPAL_URL);
});

// Add /location route
app.get('/location', locationHandler);

const locationCache = {
  // "cedar rapids, ia": { display_name: 'Cedar Rapids', lat: 5, lon: 1 }
};

function getLocationFromCache(city) {
  const cacheEntry = locationCache[city];

  if (cacheEntry) {

    // // Older than 5 seconds? Remove from cache.
    // if (cacheEntry.cacheTime < Date.now() - 5000) {
    //   delete locationCache[city];
    //   return null;
    // }

    return cacheEntry.location;
  }

  return null;
}

function setLocationInCache(city, location) {
  locationCache[city] = {
    cacheTime: new Date(),
    location,
  };
  console.log('Location cache update', locationCache);
}

// Route Handler
function locationHandler(request, response) {
  // const geoData = require('./data/geo.json');
  const city = request.query.city;

  const locationFromCache = getLocationFromCache(city);
  if (locationFromCache) {
    response.send(locationFromCache);
    return; // or use an else { ... } below
  }

  const url = 'https://us1.locationiq.com/v1/search.php';
  superagent.get(url)
    .query({
      key: process.env.GEO_KEY,
      q: city, // query
      format: 'json'
    })
    .then(locationResponse => {
      let geoData = locationResponse.body;
      // console.log(geoData);

      const location = new Location(city, geoData);
      setLocationInCache(city, location);
      response.send(location);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });

  // response.send('oops');
}

app.get('/weather', weatherHandler);

function weatherHandler(request, response){
  const weatherData = require('./data/darksky.json');

  // const key = process.env.WEATHER_KEY;
  // const lat = request.query.latitude;
  // const lon = request.query.longitude;

  // superagent.get('whatever weather')
  //   .query({ key, lat, lon })
  //   .then(...)

  const latitude = request.query.latitude;
  const longitude = request.query.longitude;
  console.log('/weather', { latitude, longitude });

  const weatherResults = [];
  weatherData.daily.data.forEach(dailyWeather => {
    weatherResults.push(new Weather(dailyWeather));
  });

  response.send(weatherResults);
}

// Has to happen after everything else
app.use(notFoundHandler);
// Has to happen after the error might have occurred
app.use(errorHandler); // Error Middleware

// Make sure the server is listening for requests
client.connect()
  .then(() => {
    console.log('PG connected!');

    app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
  })
  .catch(err => {
    throw `PG error!: ${err.message}`
  });

// Helper Functions

function errorHandler(error, request, response, next) {
  console.log(error);
  response.status(500).json({
    error: true,
    message: error.message,
  });
}

function notFoundHandler(request, response) {
  response.status(404).json({
    notFound: true,
  });
}

function Location(city, geoData) {
  this.search_query = city; // "cedar rapids"
  this.formatted_query = geoData[0].display_name; // "Cedar Rapids, Iowa"
  this.latitude = parseFloat(geoData[0].lat);
  this.longitude = parseFloat(geoData[0].lon);
}

function Weather(weatherData) {
  this.forecast = weatherData.summary;
  this.time = new Date(weatherData.time * 1000).toDateString();
}
