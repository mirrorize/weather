const console = require('../../server/logger.js')('WEATHER')
const iconmap = require('./iconmap.js')
const { ComponentClass } = require('../../server/component-helper.js')
const fetch = require('node-fetch')

// const { DateTime } = require('luxon')

module.exports = class extends ComponentClass {
  defaultConfig () {
    return {
      key: '505969b343..........d4033c4f71', // https://home.openweathermap.org/api_keys
      unit: 'metric', // Or 'imperial'
      language: 'en', // https://openweathermap.org/api/one-call-api#multi
      queryInterval: 1000 * 60 * 30,
      // Free plan of openweathermap has quota limit (1000 per daily).
      // (38600000 / queryInterval) * number of locations will be your daily consumption of API.
      // I believe 1000 * 60 * 30 (30 minutes) is quite enough.

      locations: [
        {
          title: 'Kriftel',
          lattitude: 50.08408,
          longitude: 8.46977,
          language: 'de' // If you want to apply another language for this location.
          // key: 'xxxx....', // If you want to apply another apiKey for this query.
        },
      ]
    }
  }

  injectStyles () {
    return [
      '/weather/public/weather.css'
    ]
  }

  onConstructed () {
    var uid = 1
    this.timer = null
    this.locations = []
    this.weathers = {}
    if (!this.config.locations || !Array.isArray(this.config.locations) || this.config.locations.length < 1) {
      console.warn('Invalid configuration of locations. Confirm your config.')
      return
    }
    for (const location of this.config.locations) {
      if (!location.title) location.title = 'NONAME_' + uid++
      if (!location.id) location.id = location.title.replace(/[^a-zA-Z0-9]/g, '_')
      if (!location.language) location.language = this.config.language || Intl.DateTimeFormat().resolvedOptions().locale || 'en'
      if (!location.unit) location.unit = this.config.unit || 'metric'
      if (!location.key) location.key = this.config.key || null
      if (!location.lattitude || !location.longitude || !location.key) {
        console.warn(`Invalid configuration of location: ${location.title}. It will be ignored.`)
        return
      }
      this.locations.push(location)
    }
  }

  onStart () {
    this.onResume()
  }

  onClientReady (clientUID, clientName) {
    this.transportData(`CLIENT(UID:${clientUID})`, 'WEATHER_ICONS', iconmap)
  }

  onResume () {
    const scanInterval = this.config.scanInterval || 1000 * 60 * 30
    clearTimeout(this.timer)
    this.scan()
    this.timer = setTimeout(() => {
      this.onResume()
    }, scanInterval)
  }

  onSuspend () {
    clearTimeout(this.timer)
  }

  onMessage (msgObj, reply) {
    if (msgObj.message === 'REQUEST_WEATHER') {
      reply(this.pickWeather(msgObj.locations))
    }
  }

  pickWeather (locations = '') {
    var loc = locations.split(/[ ,]+/).filter(Boolean)
    var keys = Object.keys(this.weathers)
    var is = []
    if (Array.isArray(loc) && loc.length > 0) {
      is = loc.filter((value) => { return keys.includes(value) })
    } else {
      is = keys
    }
    var weathers = []
    for (var c of is) {
      weathers.push(this.weathers[c])
    }
    return weathers
  }

  scan () {
    for (const location of this.locations) {
      const {
        title,
        id,
        language,
        unit,
        key,
        lattitude,
        longitude
      } = location
      const api = `https://api.openweathermap.org/data/2.5/onecall?lat=${lattitude}&lon=${longitude}&exclude=minutely&lang=${language}&units=${unit}&appid=${key}`
      fetch(api).then(res => res.json()).then((json) => {
        console.info('Getting weather information from openweathermap:', title)
        const meta = {
          id: id,
          title: title,
          language: language,
          unit: unit,
          lattitude: json.lat,
          longitude: json.lon,
          timezone: json.timezone,
          timezone_offset: json.timezone_offset
        }
        delete json.lat
        delete json.lon
        delete json.timezone
        delete json.timezone_offset
        this.weathers[id] = this.refine(json, meta)
      }).catch((e) => {
        console.warn('There is something wrong ')
        console.error(e)
      })
    }
  }

  refine (json, meta) {
    var {
      current,
      hourly,
      daily
    } = json
    var today = null
    if (daily['0']) {
      today = daily['0']
      /*
      if (today.weather && Array.isArray(today.weather)) {
        today.weather = today.weather[0]
      }
      */
    }
    /*
    if (current.weather && Array.isArray(current.weather)) {
      current.weather = current.weather[0]
    }
    */
    json = {
      meta,
      current,
      today,
      hourly,
      daily
    }

    return json
  }
}
