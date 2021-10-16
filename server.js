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

function getWeather (req, res) {
  let city = req.params.city
  let country = req.params.country
  let url = ''
  if(typeof(country) === 'undefined') {
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}`
  } else {
    let countryCode = countries.getAlpha2Code(country, 'en')
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${countryCode}&appid=${key}`
  }
  axios.get(url)
    .then(function (response) {
      res.json(response.data)
    })
    .catch(function (error) {
      res.send(error)
    })
    .then(function () {
    })
}
