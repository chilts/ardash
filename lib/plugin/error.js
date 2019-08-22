// ----------------------------------------------------------------------------

// npm
const debug = require('debug')('error')

// ----------------------------------------------------------------------------
// setup

const defaults = {}

// ----------------------------------------------------------------------------

function setup(page) {
  debug('setup()')
}

function run(page) {
  debug('run()')

  return new Promise((resolve, reject) => {
    reject(new Error("Something went wrong!"))
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
