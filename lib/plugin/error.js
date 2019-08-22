// ----------------------------------------------------------------------------

// npm
const debug = require('debug')('error')

// ----------------------------------------------------------------------------
// setup

const defaults = {}

// ----------------------------------------------------------------------------

function setup(page) {
  debug('setup()')
  return null
}

function go(page) {
  debug('go()')

  return new Promise((resolve, reject) => {
    reject(new Error("Something went wrong!"))
  })
}

function cleanup(page) {
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
