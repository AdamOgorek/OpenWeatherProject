const express = require('express')
const app = express()
const port = 3000
const axios = require('axios')
const fs = require('fs')
//For converting country names to iso codes and back
const countries = require('i18n-iso-countries')

const path = require("path")
let publicPath = path.resolve(__dirname, "public")
let data = fs.readFileSync('API.json')
const key = JSON.parse(data)["key"]


app.use(express.static(publicPath))

app.get('/weather/:city/:country?', getWeather)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

async function getWeather (req, res) {
  let city = req.params.city
  let country = req.params.country
  let url = ''
  if(typeof(country) === 'undefined') {
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}`
  } else {
    let countryCode = countries.getAlpha2Code(country, 'en')
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${countryCode}&appid=${key}`
  }
  let data
  await axios.get(url)
    .then(function (response) {
      data = response.data
    })
    .catch(function (error) {
      res.send('oops')
      data = 'error'
      console.log('oops')
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
      console.log(max_pm)
    })
    .catch(function (error) {
      console.log(error)
    })
    .then(function () {
    })
  if(max_pm > 10) {
    res.send('Wear mask')
  }
  else res.send('No need for mask')
}
