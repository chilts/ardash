// ----------------------------------------------------------------------------

// npm
const mqtt = require('mqtt')
const ms = require('ms')

// local
const moon = require('./lib/plugin/moon.js')

// ----------------------------------------------------------------------------
// setup

const client  = mqtt.connect()

// ----------------------------------------------------------------------------
// main

function go() {
  // log the time
  console.log((new Date()).toISOString())

  // now all the plugins
  moon.go(client)
}

setInterval(go, ms(process.env.NODE_ENV === 'production' ? '1 min' : '10s'))
go()

// ----------------------------------------------------------------------------
