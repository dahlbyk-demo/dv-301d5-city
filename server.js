'use strict';

// Load Environment Variables from the .env file
const dotenv = require('dotenv')
dotenv.config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const client = require('./util/db');

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

function getLocationFromCache(city) {
  const SQL = `
    SELECT *
    FROM Locations
    WHERE search_query = $1
    LIMIT 1
  `;
  const parameters = [city];

  return client.query(SQL, parameters);
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
    .then(result => {
      console.log('Location from cache', result.rows)
      let { rowCount, rows } = result;
      if (rowCount > 0) {
        response.send(rows[0]);
      }
      else {
        return getLocationFromAPI(city, response);
      }
    })
}

function getLocationFromAPI(city, response) {
  console.log('Requesting location from API', city)
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

      setLocationInCache(location)
        .then(() => {
          console.log('Location has been cached', location);

          response.send(location);
        });

    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}

const weatherHandler = require('./modules/weather');
console.log('weatherHandler', weatherHandler)
app.get('/weather', weatherHandler);

const booksModule = require('./modules/books');
console.log('booksModule', booksModule);
const { booksHandler, booksAddHandler } = booksModule;

// Books!
app.get('/books', booksHandler)

// NORMALLY DO NOT CREATE STUFF IN A GET. PLEASE.
app.get('/books/add', booksAddHandler);


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
