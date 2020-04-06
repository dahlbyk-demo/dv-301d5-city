'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');

// Application Setup
const PORT = process.env.PORT;
const app = express();

app.get('/', (request, response) => {
  response.send('City Explorer Goes Here');
});

app.get('/paypal', (request, response) => {
  response.send(process.env.PAYPAL_URL);
});

app.get('/weather', (request, response) => {
  response.send('Weather!');
});

// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
