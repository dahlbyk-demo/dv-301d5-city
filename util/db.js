'use strict';

const pg = require('pg');

// Database Connection Setup
if (!process.env.DATABASE_URL) {
  throw 'Missing DATABASE_URL';
}

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => { throw err; });

module.exports = client;
