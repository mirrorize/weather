/* global CustomElement MZ */
// const DateTime = luxon.DateTime

/*
const defaultTemplate = `
<div class="container">
  <mz-weather-current>
    <div><mz-weather-parts part="title" type="text"></mz-weather-parts></div>
    <div>!<mz-weather-parts part="dt" type="time"></mz-weather-parts></div>
    <div><mz-weather-parts part="temp" type="temperature" fixup="0"></mz-weather-parts></div>
    <div>
      <mz-weather-parts part="weather_icon" type="icon"></div>
      <mz-weather-parts part="weather_main" type="text"></div>
    </div>
  </mz-weather-current>
  <mz-weather-today>
    <div>
      <mz-weather-parts part="temp_min" type="temperature"></mz-weather-parts>
      <mz-weather-parts part="temp_max" type="temperature"></mz-weather-parts>
    </div>
    <div>
      <mz-weather-parts part="sunrise" type="time"></mz-weather-parts>
      <mz-weather-parts part="sunset" type="time"></mz-weather-parts>
    </div>
  </mz-weather-today>
  <mz-weather-hourly>
    <div class="container">
      <mz-weather-parts part="weather_icon" type="icon"></mz-weather-parts>
      <mz-weather-parts part="temp" type="temperature"></mz-weather-parts>
      <mz-weather-parts part="dt" type="time" timeformat="H a"></mz-weather-parts>
    </div>
  </mz-weather-hourly>
  <mz-weather-daily>
    <div class="container">
      <mz-weather-parts part="dt" type="time" timeformat="EEEE"></mz-weather-parts>
      <mz-weather-parts part="weather_icon" type="icon"></mz-weather-parts>
      <mz-weather-parts part="pop" type="percent"></mz-weather-parts>
      <mz-weather-parts part="temp_min" type="temperature"></mz-weather-parts>
      <mz-weather-parts part="temp_max" type="temperature"></mz-weather-parts>
    </div>
  </mz-weather-daily>
</div>
`
*/

const defaultTemplate = `
<style>
:host {
  position: relative;
  display:flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  width: 100%;
}
* {
  box-sizing: border-box;
}

.current {
  order: 1;
}
.today {
  order: 2;
}
.hourly {
  order: 3;
}
.daily {
  order: 4;
}

</style>
<mz-weather-section section="current"></mz-weather-section>
<mz-weather-section section="today"></mz-weather-section>
<mz-weather-section section="hourly" start="1"></mz-weather-section>
<mz-weather-section section="daily" start="1"></mz-weather-section>

`

export default class extends CustomElement {
  get isShadow () {
    return true
  }

  defaultContent () {
    return defaultTemplate.trim()
  }

  onConstructed () {
    this.timer = null
    this.weathers = []
    this.index = 0

    this.animation = (this.config.animation) ? this.config.animation : {
      hide: {
        animation: {
          opacity: [1, 0],
          transform: ['translateX(0%)', 'translateX(-50%)']
        },
        timing: {
          duration: 1000,
          easing: 'ease-in-out'
        }
      },
      show: {
        animation: {
          opacity: [0, 1],
          transform: ['translateX(50%)', 'translateX(0)']
        },
        timing: {
          duration: 1000,
          easing: 'ease-in-out'
        }
      }
    }
  }

  onReady () {
    if (MZ.applyIcon) MZ.applyIcon(this.contentDom)
    this.query()
    setTimeout(() => {
      this.update()
    }, 1000)
  }

  query () {
    var bind = this.getAttribute('bind') || this.config.bind || this.bindTo
    this.sendMessage(`COMPONENT(NAME:${bind})`, {
      message: 'REQUEST_WEATHER',
      locations: this.getAttribute('location') || ''
    }, (ret) => {
      if (!ret || !Array.isArray(ret) || ret.length < 1) {
        console.warn('Something wrong. Retrial after 60 sec.')
        MZ.notify({
          title: 'mz-weather',
          content: 'Server returns invalid weather info.',
          timer: 5000,
          type: 'warn',
          location: 'top left'
        })
        setTimeout(() => {
          this.query()
        }, 6000)
        return
      }
      this.weathers = ret
    })
  }

  update () {
    var refresh = this.getAttribute('refresh') || this.config.refreshInterval || 1000 * 30
    clearTimeout(this.timer)
    this.refresh()
    this.timer = setTimeout(() => {
      this.update()
    }, refresh)
  }

  refresh () {
    if (!Array.isArray(this.weathers) || this.weathers.length < 1) return
    var weather = this.weathers[this.index++]
    if (this.index >= this.weathers.length) {
      this.index = 0
      this.query()
    }
    this.hide(this.uid, this.animation.hide).then(() => {
      var childs = this.contentDom.querySelectorAll('mz-weather-section[section]')
      for (var child of [...childs]) {
        if (typeof child.update === 'function') {
          var section = child.getAttribute('section')
          if (weather[section]) {
            child.update(weather)
          }
        }
      }
      this.show(this.uid, this.animation.show)
    })
  }
}
