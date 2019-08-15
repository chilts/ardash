// ----------------------------------------------------------------------------

// npm
const debug = require('debug')('ardash')
const mqtt = require('mqtt')
const ms = require('ms')
const fmt = require('fmt')

// local
const moon = require('./lib/plugin/moon.js')
const datetime = require('./lib/plugin/datetime.js')

// ----------------------------------------------------------------------------
// setup

const client  = mqtt.connect()

async function setup() {
  // call all plugin `setup()` functions
  await Promise.all([
    moon.setup(),
    datetime.setup(),
  ])
}

function errorHandler(err) {
  console.warn(err)
}

function publish(name, channel, lines) {
  fmt.msg(`${name}:`)
  for(let i=0; i<lines.length; i++) {
    fmt.li(lines[i])
  }
  client.publish(`ardash/${channel}`, JSON.stringify(lines))
}

function go() {
  fmt.title((new Date()).toISOString())

  // now all the plugins
  datetime.go().then(lines => {
    publish('DateTime', 1, lines)
  }).catch(err => errorHandler)

  moon.go().then(lines => {
    publish('Moon', 2, lines)
  }).catch(err => errorHandler)
}

// ----------------------------------------------------------------------------
// main

console.log('')
console.log('       _            _           _     ')
console.log('      / \\   _ __ __| | __ _ ___| |__  ')
console.log("     / _ \\ | '__/ _` |/ _` / __| '_ \\ ")
console.log('    / ___ \\| | | (_| | (_| \\__ \\ | | |')
console.log('   /_/   \\_\\_|  \\__,_|\\__,_|___/_| |_|')
console.log('')
console.log('')

;(async () => {

  debug('Calling setup ...')
  await setup()

  debug('Doing interval ...')
  setInterval(go, ms(process.env.NODE_ENV === 'production' ? '1 min' : '10s'))
  go()

})()

// ----------------------------------------------------------------------------
