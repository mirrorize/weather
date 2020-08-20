/* global CustomElement MZ */
// const DateTime = luxon.DateTime

export default class extends CustomElement {
  get isShadow () {
    return true
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
      var nodes = template.querySelectorAll('mz-weather-part')
      this.contentDom.append(template)
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
      contentTemplate = document.querySelector(`template#${aTemplateId}`).content.cloneNode(true)
    }
    if (!contentTemplate) {
      var templateId = 'mz-weather-section-default-' + section
      var tmpl = document.querySelector(`template#${templateId}`).content.cloneNode(true)
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
