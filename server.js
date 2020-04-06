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

// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
