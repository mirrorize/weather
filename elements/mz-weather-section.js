/* global CustomElement MZ */
// const DateTime = luxon.DateTime

const defaultTemplate = `
<style>
:host {
  display: block;
  box-sizing: border-box;
  color: var(--font-color-second, #CCC);
  --default-font-size: var(--font-base-size, 20px);
  font-size: var(--default-font-size, 20px);
  padding-bottom: 5px;
}

:host([section=today]) {
  --default-font-size: calc(var(--font-base-size, 20px) * 0.8);
}

:host([section=hourly]) {
  --default-font-size: calc(var(--font-base-size, 20px) * 0.8);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

:host([section=daily]) {
  --default-font-size: calc(var(--font-base-size, 20px) * 0.8);
}

* {
  box-sizing: border-box;
}

.container {
  display: flex;
  justify-content: space-around;
}

.ver {
  flex-direction: column;
}

.hor {
  flex-direction: row;
}

.center {
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title_section {
  font-size: 1em;
  align-items: center;

}

.title_section [part=title] {
  font-weight:bolder;
}

.title_section [part=dt] {
  font-size: 0.8em;
}

.emp {
  font-size: 3em;
  font-weight: bold;
  margin-top: 0.5em;
  justify-content: space-around;
  color: var(--font-color-first, white);
  line-height: 100%;
}

.temp_min {
  color: #2CF;
}

.temp_max {
  color: #FC2;
}

.hourly_iteration {
  align-items: center;
  justify-content: center;
}

.hourly_iteration [part=temp] {
  font-weight: bolder;
}

.hourly_iteration [part="weather.icon"] {
  font-size: 1.5em;
  font-weight: bolder;
}

.daily_iteration [part=dt] {
  width: 35%;
}

.daily_iteration [part="weather.icon"] {
  width: 10%;
  text-align: center;
  font-weight: bolder;
}
.daily_iteration [part=pop] {
  width: 15%;
  text-align: right;
  color: #33F;
}
.daily_iteration [part="temp.min"] {
  width: 15%;
  text-align: right;
}
.daily_iteration [part="temp.max"] {
  width: 15%;
  text-align: right;
}

</style>

<template id="current">
  <div class="container ver center title_section">
    <mz-weather-part part="title" type="text"></mz-weather-part>
    <mz-weather-part part="dt" type="time"></mz-weather-part>
  </div>
  <div class="container emp hor center">
    <mz-weather-part part="weather.icon" type="icon"></mz-weather-part>
    <mz-weather-part part="temp" type="temperature" fixup="0" displayunit></mz-weather-part>
  </div>
  <div class="container center">
    <mz-weather-part part="weather.description" type="text"></mz-weather-part>
  </div>
</template>

<template id="today">
  <div class="container hor">
    <mz-weather-part part="temp.min" type="temperature" class="temp_min">
      <span slot="pre" class="iconify" data-icon="wi:direction-down"></span>
      <span slot="post">°</span>
    </mz-weather-part>
    <mz-weather-part part="temp.max" type="temperature" class="temp_max">
      <span slot="pre" class="iconify" data-icon="wi:direction-up"></span>
      <span slot="post">°</span>
    </mz-weather-part>
    <mz-weather-part part="sunrise" type="time" timeformat="h:m a">
      <span slot="pre" class="iconify" data-icon="wi:sunrise"></span>
    </mz-weather-part>
    <mz-weather-part part="sunset" type="time" timeformat="h:m a">
      <span slot="pre" class="iconify" data-icon="wi:sunset"></span>
    </mz-weather-part>
  </div>
</template>

<template id="hourly">
  <div class="container hourly_iteration ver">
      <mz-weather-part part="temp" type="temperature">
        <span slot="post">°</span>
      </mz-weather-part>
      <mz-weather-part part="weather.icon" type="icon"></mz-weather-part>
      <mz-weather-part part="dt" type="time"></mz-weather-part>
  </div>
</template>

<template id="daily">
  <div class="container daily_iteration hor">
    <mz-weather-part part="dt" type="time" timeformat="EEEE"></mz-weather-part>
    <mz-weather-part part="weather.icon" type="icon"></mz-weather-part>
    <mz-weather-part part="pop" type="ratio" displayunit></mz-weather-part>
    <mz-weather-part part="temp.min" type="temperature" class="temp_min">
      <span slot="post">°</span>
    </mz-weather-part>
    <mz-weather-part part="temp.max" type="temperature" class="temp_max">
      <span slot="post">°</span>
    </mz-weather-part>
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
    var nodes = this.contentDom.children
    for (var d of [...nodes]) {
      if (d.nodeName !== 'STYLE' && d.nodeName !== 'TEMPLATE') {
        d.remove()
      }
    }
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
      var nodes = context.querySelectorAll('mz-weather-part')
      this.contentDom.append(context)
      for (var n of [...nodes]) {
        if (MZ.applyIcon) MZ.applyIcon(n)
        n.setAttribute('_iterate', index)
        n.update(targetWeather, section, index)
      }
      index = index + aGap
      count++
    }
  }


  update (weather) {
    if (!this.getAttribute('section')) {
      console.warn(`${this.mzTagName} needs 'section' attribute.`)
      return
    }
    var section = this.getAttribute('section')
    var contentTemplate = null
    var aTemplateId = this.getAttribute('template')
    if (aTemplateId) {
      var tmpl = MZ.getTemplate(aTemplateId, false)
      contentTemplate = tmpl

    }
    if (!contentTemplate) {
      var templateId = section
      var tmpl = this.contentDom.querySelector(`template#${templateId}`)
      contentTemplate = tmpl
    }
    if (!contentTemplate) {
      console.warn('Cannot find a proper template. Check section attribute:', section)
      return
    }

    this.draw(weather, section, contentTemplate)
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
