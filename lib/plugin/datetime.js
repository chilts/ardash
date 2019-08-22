// ----------------------------------------------------------------------------

// npm
const debug = require('debug')('datetime')
const dateFns = require('date-fns')

// ----------------------------------------------------------------------------

const defaults = {
  dateFormat: 'DD MMM YYYY',
  timeFormat: 'HH:mm:ss',
}

function setup(page) {
  debug('setup()')

  page.config = Object.assign({}, defaults, page.opts)
}

function run(page) {
  debug('run()')

  const d = new Date()
  debug(d.toISOString())

  return new Promise((resolve, reject) => {
    const lines = [
      dateFns.format(d, page.config.timeFormat),
      dateFns.format(d, page.config.dateFormat),
    ]
    resolve(lines)
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
