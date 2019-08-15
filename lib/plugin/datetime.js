// ----------------------------------------------------------------------------

// npm
const debug = require('debug')('datetime')
const dateFns = require('date-fns')

// ----------------------------------------------------------------------------

let defaults = {
  dateFormat: 'DD MMM YYYY',
  timeFormat: 'HH:mm:ss',
}
let config = null

function setup(opts) {
  debug('setup()')

  config = Object.assign({}, defaults, opts)

  return null
}

function go() {
  debug('go()')

  const d = new Date()
  debug(d.toISOString())

  return new Promise((resolve, reject) => {
    const lines = [
      dateFns.format(d, config.timeFormat),
      dateFns.format(d, config.dateFormat),
    ]
    resolve(lines)
  })
}

function cleanup() {
  debug('cleanup()')
  return null
}

// ----------------------------------------------------------------------------

module.exports = {
  setup,
  go,
  cleanup,
}

// ----------------------------------------------------------------------------
