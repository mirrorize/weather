/* global CustomElement luxon MZ */
const DateTime = luxon.DateTime

const flattenObject = (ob) => {
  var toReturn = {}
  for (var i in ob) {
    if (!Object.prototype.hasOwnProperty.call(ob, i)) continue
    if ((typeof ob[i]) === 'object' && ob[i] !== null) {
      var flatObject = flattenObject(ob[i])
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

const defaultTemplate = `
<style>
:host {
  display:block;
}
</style>
<slot name="pre"></slot>
<span id="self"></span>
<slot name="post"></slot>
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
      current: this.config.currentTimeFormat || 'h:mm a ZZZZ',
      hourly: this.config.hourlyTimeFormat || 'h a',
      daily: this.config.dailyTimeFormat || 'EEEE',
      fixup: this.config.fixup || 0
    }
  }

  onReady () {
    if (MZ.applyIcon) MZ.applyIcon(this.contentDom)
  }

  update (section, sectionName, index) {
    var icon = MZ.getStorage('WEATHER_ICONS')
    if (section.weather && Array.isArray(section.weather)) section.weather = section.weather[0]
    // var ai = this.getAttribute('_iterate')
    section = flattenObject(section)
    var type = this.getAttribute('type') || 'text'
    var timeFormat = this.getAttribute('timeformat') || this.default[sectionName] || 'h a'
    console.log(sectionName, timeFormat)
    var fixup = this.getAttribute('fixup') || 0

    var aPart = this.getAttribute('part')
    var value = section[aPart]

    var content = this.contentDom.querySelector('#self')

    switch (type) {
      case 'raw':
        content.innerHTML = value
        break
      case 'text':
        content.innerHTML = value
        break
      case 'time':
        var dt = DateTime.fromSeconds(value)
        if (section.timezone) dt = dt.setZone(section.timezone)
        if (section.language) dt = dt.setLocale(section.language)
        dt = dt.toFormat(timeFormat)
        content.innerHTML = dt
        break
      case 'temperature':
        var str = value.toFixed(fixup) + ((section.unit === 'imperial') ? '℉' : '℃')
        content.innerHTML = str
        break
      case 'icon':
        content.innerHTML = icon[value]
        break
      case 'ratio':
        if (value) content.innerHTML = (Number(value) * 100).toFixed(fixup) + '%'
        break
      case 'speed':
        content.innerHTML = value + ((section.unit === 'imperial') ? 'mph' : '㎧')
        break
    }
  }
}
