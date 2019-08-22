// ----------------------------------------------------------------------------

// npm
const debug = require('debug')('sun')
const suncalc = require('suncalc')
const { formatToTimeZone } = require('date-fns-timezone')

// ----------------------------------------------------------------------------
// setup

const defaults = {}

// ----------------------------------------------------------------------------

function setup(page) {
  debug('setup()')

  // default some opts
  page.config = Object.assign({}, defaults, page.opts)
}

function run(page) {
  debug('run()')

  const times = suncalc.getTimes(new Date(), page.opts.lon, page.opts.lon)

  const sunrise = formatToTimeZone(times.sunrise, 'HH:mm:SS', { timeZone: page.opts.timezone })
  const noon = formatToTimeZone(times.solarNoon, 'HH:mm:SS', { timeZone: page.opts.timezone })
  const sunset = formatToTimeZone(times.sunset, 'HH:mm:SS', { timeZone: page.opts.timezone })

  return new Promise((resolve, reject) => {
    resolve([
      'Sunrise : ' + sunrise,
      'Noon    : ' + noon,
      'Sunset  : ' + sunset,
    ])
  })
}

function shutdown(page) {
  debug('shutdown()')
}

// ----------------------------------------------------------------------------

module.exports = {
  setup,
  run,
  shutdown,
}

// ----------------------------------------------------------------------------
