'use strict';

function weatherHandler(request, response){
  const weatherData = require('../data/darksky.json');

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

function Weather(weatherData) {
  this.forecast = weatherData.summary;
  this.time = new Date(weatherData.time * 1000).toDateString();
}

module.exports = weatherHandler;
