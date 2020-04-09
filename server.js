'use strict';

// Load Environment Variables from the .env file
const dotenv = require('dotenv')
dotenv.config();

// Application Dependencies
const express = require('express');
const cors = require('cors');


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
const locationHandler = require('./modules/location');
app.get('/location', locationHandler);

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
const client = require('./util/db');
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
