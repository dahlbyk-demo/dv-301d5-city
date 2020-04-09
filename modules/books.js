'use strict';

const client = require('../util/db');

const booksHandler = (request, response) => {
  const SQL = 'SELECT * FROM Books';
  client.query(SQL)
    .then(results => {
      console.log(results);

      // let rowCount = results.rowCount;
      // let rows = results.rows;

      let { rowCount, rows } = results;

      if (rowCount === 0) {
        // TODO: go to the API and get my thing
        response.send({
          error: true,
          message: 'Read more, dummy'
        });

      } else {
        response.send({
          error: false,
          results: rows,
        })
      }
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}

// NORMALLY DO NOT CREATE STUFF IN A GET. PLEASE.
const booksAddHandler = (request, response) => {
  let { title, author, genre } = request.query; // destructuring
  let SQL = `
    INSERT INTO Books (title, author, genre)
    VALUES($1, $2, $3)
    RETURNING *
  `;
  let SQLvalues = [title, author, genre];
  client.query(SQL, SQLvalues)
    .then(results => {
      response.send(results);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });

  /* NEVER EVER EVER DO THIS
  `
    INSERT INTO Books (title, author, genre)
    VALUES('${title}', '${author}', '${genre}')
  `;
  // SQL Injection
  // title = "', 'whatever', 'whatever'); DELETE FROM Books; --"
  */
}

module.exports = {
  booksHandler,
  booksAddHandler,
};
