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
let city = 'Dublin'
let country = 'Ireland'
let countryCode = countries.getAlpha2Code(country, 'en')
let url = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${countryCode}&appid=${key}`


axios.get(url)
  .then(function (response) {
    console.log(response.data)
  })
  .catch(function (error) {
    console.log(error)
  })
  .then(function () {

  })

app.use(express.static(publicPath))

app.get('/random/:min/:max', sendrandom)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

function sendrandom (req, res) {
  let min = parseInt(req.params.min)
  let max = parseInt(req.params.max)
  if (isNaN(min) || isNaN(max)) {
    res.status(400)
    res.json({error: "Bad request."})
    return
  }
  let result = Math.round((Math.random() * (max-min)) + min)

  res.json({result:result})
}
