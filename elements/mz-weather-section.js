/* global CustomElement MZ */
// const DateTime = luxon.DateTime

const defaultTemplate = `
<style>
:host {
  display: block;
}

#mainContainer {
  font-size: var(--base-font-size, 15px);
  color: var(--font-color-second, #BBB);
  font-weight: bolder;
}
.container {
  padding: 5px;
  width: 100%;
}

.con_hourly {
  display: flex;
  overflow: hidden;
  align-items: stretch;
}

.hor {
  display:flex;
}

.hor > * {
  flex: 1 1 auto;
  text-align: center;
}

.hor_item {
  flex: 1 1 auto;
  max-width: 20%;
}

.ver {
  display:flex;
  flex-direction: column;
}

.current {
  font-size: 60%;
}

.current mz-weather-parts[part=title] {
  text-align: center;
  font-weight: bolder;
  color: var(--font-color-first, white);
}

.current mz-weather-parts[part=dt] {
  text-align: center;
  font-size: 75%;

}

.current .emp {
  margin-righ: 20px;
}

.current .emp .hor {
  justify-content: center;
}

.current .emp > * {
  font-size: 500%;
  font-weight: bolder;
  text-align: center;
  color: white;
  width: auto;
  padding: 10px;
  flex-grow: none;
  flex-shring: none;
}

.today {
  font-size:75%;
}

.hourly mz-weather-parts {
  text-align: center;
  font-size: 70%;
  height:100%;
  font-weight: bold;
}
.hourly mz-weather-parts[part=dt],
.hourly mz-weather-parts[part=weather.icon] {

}
.hourly mz-weather-parts[part=dt] {
  font-size: 50%;
  text-align: center;
}

.daily mz-weather-parts {
  font-size: 70%;
  text-align: left;
}
.daily mz-weather-parts[part=dt] {
  width: 35%;
}

.daily mz-weather-parts[part="weather.icon"] {
  text-align: center;
  width: 15%;
}
.daily mz-weather-parts[part=pop] {
  width: 15%;
  color: #1BE;
  text-align: center;
}
.daily mz-weather-parts[part="temp.min"] {
  width: 15%;
  text-align: right;
}

.daily mz-weather-parts[part="temp.max"] {
  width: 15%;
  text-align: right;
}

.temp_min {
  color: #2CF;
}

.temp_max {
  color: #FC2
}




</style>
<div id="mainContainer"></div>
<template id="weather_current">
  <div class="container current">
    <div><mz-weather-parts part="title" type="text"></mz-weather-parts></div>
    <div><mz-weather-parts part="dt" type="time"></mz-weather-parts></div>
    <div class="emp hor">
      <mz-weather-parts part="weather.icon" type="icon"></mz-weather-parts>
      <mz-weather-parts part="temp" type="temperature" fixup="0"></mz-weather-parts>
    </div>
    <div>
      <mz-weather-parts part="weather.description" type="text"></mz-weather-parts>
    </div>
  </div>
</template>
<template id="weather_today">
  <div class="container today hor">
    <mz-weather-parts part="temp.min" type="temperature" class="temp_min">
      <span slot="pre" class="iconify" data-icon="wi:direction-down"></span>
    </mz-weather-parts>
    <mz-weather-parts part="temp.max" type="temperature" class="temp_max">
      <span slot="pre" class="iconify" data-icon="wi:direction-up"></span>
    </mz-weather-parts>
    <mz-weather-parts part="sunrise" type="time" timeformat="h:m a">
      <span slot="pre" class="iconify" data-icon="wi:sunrise"></span>
    </mz-weather-parts>
    <mz-weather-parts part="sunset" type="time" timeformat="h:m a">
      <span slot="pre" class="iconify" data-icon="wi:sunset"></span>
    </mz-weather-parts>
  </div>
</template>
<template id="weather_hourly">
  <div class="container hourly ver">
      <mz-weather-parts part="temp" type="temperature"></mz-weather-parts>
      <mz-weather-parts part="weather.icon" type="icon"></mz-weather-parts>
      <mz-weather-parts part="dt" type="time"></mz-weather-parts>
  </div>
</template>
<template id="weather_daily">
  <div class="container daily hor">
    <mz-weather-parts part="dt" type="time" timeformat="EEEE"></mz-weather-parts>
    <mz-weather-parts part="weather.icon" type="icon"></mz-weather-parts>
    <mz-weather-parts part="pop" type="ratio"></mz-weather-parts>
    <mz-weather-parts part="temp.min" type="temperature" class="temp_min"></mz-weather-parts>
    <mz-weather-parts part="temp.max" type="temperature" class="temp_max"></mz-weather-parts>
  </div>
</template>
`

export default class extends CustomElement {
  get isShadow () {
    return true
  }

  defaultContent () {
    return defaultTemplate.trim()
  }

  onConstructed () {
    this.default = {
      hourlygap: this.config.hourlygap || 1,
      hourlymax: this.config.hourlymax || 6,
      dailymax: this.config.dailymax || 7
    }
  }

  onReady () {
    if (MZ.applyIcon) MZ.applyIcon(this.contentDom)
  }

  draw (weather, section, template) {
    var container = this.contentDom.querySelector('#mainContainer')
    if (!container) {
      console.warn('mz-weather-section needs #mainContainer in the template.')
    }
    container.innerHTML = ''
    container.classList.add('con_' + section)
    var max = (section === 'hourly') ? 47 : 6
    var aRepeat = Number(this.getAttribute('repeat') || 6)
    var aGap = Number(this.getAttribute('gap') || 1)
    var aStart = Number(this.getAttribute('start') || 0)
    var index = aStart
    var count = 1
    if (section === 'today' || section === 'current') {
      max = 0
      aRepeat = 1
    }
    while (index <= max && count <= aRepeat) {
      var targetWeather = null
      if (section === 'hourly' || section === 'daily') {
        targetWeather = Object.assign({}, weather.meta, weather[section][index.toString()])
      } else {
        targetWeather = Object.assign({}, weather.meta, weather[section])
      }
      var context = template.content.cloneNode(true)
      var nodes = context.querySelectorAll('mz-weather-parts')
      container.append(context)
      for (var n of [...nodes]) {
        if (MZ.applyIcon) MZ.applyIcon(n)
        n.setAttribute('_iterate', index)
        n.update(targetWeather, section, index)
      }

      index = index + aGap
      count++
    }
  }

  getContainer () {
    var container = this.contentDom.querySelector('#mainContainer')
    if (!container) {
      console.warn('mz-weather-section needs #mainContainer in the template.')
    }
    return container
  }

  update (weather) {
    if (!this.getAttribute('section')) {
      console.warn(`${this.mzTagName} needs 'section' attribute.`)
      return
    }
    var section = this.getAttribute('section')
    var templateId = 'weather_' + section
    var contentTemplate = this.contentDom.querySelector(`template#${templateId}`)
    if (!contentTemplate) {
      console.warn('Cannot find a proper template. Check section attribute:', section)
      return
    }

    this.draw(weather, section, contentTemplate)

    /*
    var childs = this.contentDom.querySelectorAll('mz-weather-parts[part]')
    //var ret = this.flattenObject(weather[section])
    var ret = weather([section])
    for (var child of [...childs]) {
      if (typeof child.update === 'function') {
        var part = child.getAttribute('part')
        if (!part) {
          console.warn("'mz-weather-parts' needs 'part' attribute.")
          continue
        }
        child.update(ret, section)
      }
    }
    */
  }

  flattenObject (ob) {
    var toReturn = {}
    for (var i in ob) {
      if (!Object.prototype.hasOwnProperty.call(ob, i)) continue
      if ((typeof ob[i]) === 'object' && ob[i] !== null) {
        var flatObject = this.flattenObject(ob[i])
        for (var x in flatObject) {
          if (!Object.prototype.hasOwnProperty.call(flatObject, x)) continue
          toReturn[i + '.' + x] = flatObject[x]
        }
      } else {
        toReturn[i] = ob[i]
      }
    }
    return toReturn
  }
}
