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
// setup

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

function setup() {
  debug('setup()')

  const setups = pages.map(page => {
    return plugin[page.plugin].setup(page)
  })

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
  fmt.msg(`There are ${Object.keys(pages).length} sections.`, true)
  fmt.spacer()

  const promises = pages.map((page, pageNum) => {
    return plugin[page.plugin].go(page).then(lines => {
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

function start() {
  return setInterval(run, ms(process.env.NODE_ENV === 'production' ? '1 min' : '10s'))
}

function shutdown(signal) {
  return err => {
    fmt.line()
    fmt.spacer()
    fmt.arrow(`Received ${signal}`)
    if (err) {
      console.error(err.stack || err)
    }

    fmt.indent('Shutting down each plugin:')
    const shutdowns = pages.map(page => {
      fmt.li(page.title, true)
      return plugin[page.plugin].shutdown(page)
    })

    // if any plugin doesn't shutdown within 10s, then we'll exit with force
    setTimeout(() => {
      fmt.arrow(`Exiting forcefully after 10s since ${signal}`)
      process.exit(err ? 1 : 0)
    }, ms('5 secs')).unref()

    return Promise.all(shutdowns).catch(err => {
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
fmt.spacer()

let intervalId = null

setup()
  .then(run)
  .then(start)
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
