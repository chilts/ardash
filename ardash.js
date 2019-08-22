#!/usr/bin/env node
// ----------------------------------------------------------------------------

// core
const fs = require('fs')

// npm
const debug = require('debug')('ardash')
const mqtt = require('mqtt')
const ms = require('ms')
const fmt = require('fmt')
const ini = require('ini')

// local
const moon = require('./lib/plugin/moon.js')
const datetime = require('./lib/plugin/datetime.js')
const anniversary = require('./lib/plugin/anniversary.js')
const sun = require('./lib/plugin/sun.js')
const error = require('./lib/plugin/error.js')

// ----------------------------------------------------------------------------

function setup() {
  debug('setup()')

  fmt.line()
  fmt.spacer()
  fmt.arrow('Setup')
  fmt.spacer()

  fmt.indent('Setting up each plugin:')

  const setups = pages.map(page => {
    fmt.li(page.title, true)
    return plugin[page.plugin].setup(page)
  })
  fmt.spacer()

  // call all plugin `setup()` functions
  return Promise.all(setups).catch(err => {
    console.warn(err)
    process.exit(2)
  })
}

function publish(title, plugin, channel, lines) {
  fmt.arrow(`${title} (${plugin})`)
  for(let i=0; i<lines.length; i++) {
    fmt.li(lines[i], true)
  }
  fmt.spacer()
  const msg = {
    title,
    lines,
  }
  client.publish(`ardash/${channel}`, JSON.stringify(msg))
}

function run() {
  debug('run()')

  fmt.line()
  fmt.spacer()
  fmt.arrow((new Date()).toISOString())
  fmt.msg(`There are ${Object.keys(pages).length} sections for display.`, true)
  fmt.spacer()

  const promises = pages.map((page, pageNum) => {
    return plugin[page.plugin].run(page).then(lines => {
      publish(page.title, page.plugin, pageNum, lines)
    }).catch(err => {
      publish(page.title, page.plugin, pageNum, [ 'Err: check Ardash log' ])
      console.warn(err)
      console.warn()
    })
  })

  return Promise.all(promises).then(() => {
    fmt.arrow('Finished')
    fmt.spacer()
  }).catch(err => {
    console.warn('Program Error')
    console.warn()
    console.warn("When we call each plugin, we catch at source and shouldn't")
    console.warn("propogate upwards, i.e. here. This is probably some other")
    console.warn("error with the program we should fix. Please help us by")
    console.warn("raising an issue on https://github.com/chilts/ardash - thanks!")
    console.warn()
    console.warn(err)
    console.warn()
  })
}

function startTimer() {
  return setInterval(run, intervalMs)
}

function shutdown(signal) {
  return err => {
    // leave the ^C on it's own line so we can see it
    fmt.spacer()
    fmt.spacer()
    fmt.line()
    fmt.spacer()
    fmt.arrow(`Received ${signal}`)
    if (err && err.stack) {
      console.error(err.stack)
    }

    fmt.spacer()
    fmt.indent('Shutting down each plugin:')
    const shutdowns = pages.map(page => {
      fmt.li(page.title, true)
      return plugin[page.plugin].shutdown(page)
    })
    fmt.spacer()

    // if any plugin doesn't shutdown within 10s, then we'll exit with force
    const timeout = setTimeout(() => {
      fmt.arrow(`Exiting forcefully after 10s since ${signal}`)
      process.exit(err ? 1 : 0)
    }, ms('5 secs')).unref()

    return Promise.all(shutdowns).then(() => {
      clearTimeout(timeout)
      fmt.arrow('Shutdown Complete')
      fmt.spacer()
      fmt.indent('Thanks for using Ardash. https://ardash.io')
      fmt.spacer()
      fmt.indent('Goodbye!')
      fmt.spacer()
      fmt.line()
      process.exit(0)
    }).catch(err => {
      console.warn(err)
      process.exit(2)
    })

  }
}

// ----------------------------------------------------------------------------
// main

fmt.line()
fmt.msg('       _            _           _     ')
fmt.msg('      / \\   _ __ __| | __ _ ___| |__  ')
fmt.msg("     / _ \\ | '__/ _` |/ _` / __| '_ \\ ")
fmt.msg('    / ___ \\| | | (_| | (_| \\__ \\ | | |')
fmt.msg('   /_/   \\_\\_|  \\__,_|\\__,_|___/_| |_|')
fmt.msg('')

// setup
const intervalDefault='10s'
let intervalMs = ms(intervalDefault)

const plugin = {
  moon,
  datetime,
  anniversary,
  sun,
  error,
}

const client  = mqtt.connect()

const config = ini.parse(fs.readFileSync('./ardash.ini', 'utf-8'))
const pages = []

Object.keys(config).forEach((title, pageNum) => {
  const section = config[title]

  // we only want sections, so ignore top-level properties (type=string) and only look for sections (type=object)
  if (typeof section !== 'object') {
    return
  }

  if (!(section.plugin in plugin)) {
    console.warn(`Unknown plugin '${section.plugin}' in section '${title}'`)
    process.exit(2)
  }

  const opts = Object.assign({}, section)
  delete opts.plugin

  pages.push({
    title,
    plugin: section.plugin,
    opts,
  })
})

fmt.line()
fmt.spacer()
fmt.arrow('Config')
fmt.spacer()
fmt.field('Interval', config.interval || intervalDefault, true)
if (config.interval) {
  intervalMs = ms(config.interval)
  if (!intervalMs) {
    console.warn("Config Error: invalid interval, try '10s', '30m', '30 mins', '4 hours', etc")
    process.exit(2)
  }
}
fmt.field('Interval (ms)', intervalMs, true)
fmt.spacer()

let intervalId = null

setup()
  .then(run)
  .then(startTimer)
  .then(id => {
    intervalId = id
  })
  .catch(err => {
    console.warn(err)
  })
;

process
  .on('SIGTERM', shutdown('SIGTERM'))
  .on('SIGINT', shutdown('SIGINT'))
  .on('uncaughtException', shutdown('uncaughtException'))

// ----------------------------------------------------------------------------
