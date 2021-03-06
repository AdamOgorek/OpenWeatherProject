const express = require('express')
const app = express()
const port = 3000
const axios = require('axios')
const fs = require('fs')
//For converting country names to iso codes and back
const countries = require('i18n-iso-countries')

const path = require("path")
let publicPath = path.resolve(__dirname, "public")
//I didn't want to hard code the API key, so I saved it as JSON
let data = fs.readFileSync('API.json')
const key = JSON.parse(data)["key"]


app.use(express.static(publicPath))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
})
app.get('/weather/:city/:country?', getWeather)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

async function getWeather (req, res) {
  let city = req.params.city
  let country = req.params.country
  let url = ''
  if(typeof(country) === 'undefined') {
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&units=metric`
  } else {
    let countryCode = countries.getAlpha2Code(country, 'en')
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${countryCode}&appid=${key}&units=metric`
  }
  let data
  await axios.get(url)
    .then(function (response) {
      data = response.data
    })
    .catch(function (error) {
      res.send(error)
    })
    .then(function () {
    })
  let coords = data['city']['coord']
  let max_pm = 0
  await axios.get(`http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${coords['lat']}&lon=${coords['lon']}&appid=${key}`)
    .then(function (response) {
      air_pollution_data = response.data['list']
      for (let hour_data of air_pollution_data) {
        let pm = hour_data['components']['pm2_5']
        max_pm = Math.max(pm, max_pm)
      }
    })
    .catch(function (error) {
      res.send(error)
    })
    .then(function () {
    })
  let weatherForecasts = data['list']
  let will_rain = false
  let weatherSummary = []
  for (let forecast of weatherForecasts) {
    let forecastSummary = {'Time': forecast['dt_txt'], 'Temperature':forecast['main']['temp'], 'Wind':forecast['wind'], 'Rainfall':0}
    if(forecast['rain']) {
      will_rain = true
      forecastSummary['Rainfall'] = forecast['rain']['3h']
    }
    weatherSummary.push(forecastSummary)
  }
  let min_temp = Math.min.apply( null, weatherSummary.map((v) => v.Temperature))
  let max_temp = Math.max.apply( null, weatherSummary.map((v) => v.Temperature))
  let temperature_range = ''
  if (min_temp > 20) {
    temperature_range = 'hot'
  }
  else if (max_temp < 10) {
    temperature_range = 'cold'
  }
  else {
    temperature_range = 'warm'
  }
  res.json({max_pm:max_pm, will_rain: will_rain, temperature_range: temperature_range, weatherSummary: weatherSummary})
}
