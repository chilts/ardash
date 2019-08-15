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

// ----------------------------------------------------------------------------
// setup

const plugin = {
  moon,
  datetime,
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

async function setup() {
  const setups = pages.map(page => {
    return plugin[page.plugin].setup(page.opts)
  })

  // call all plugin `setup()` functions
  await Promise.all(setups).catch(err => {
    console.warn(err)
    process.exit(2)
  })
}

function publish(title, plugin, channel, lines) {
  fmt.msg(`${title} (${plugin}):`)
  for(let i=0; i<lines.length; i++) {
    fmt.li(lines[i])
  }
  client.publish(`ardash/${channel}`, JSON.stringify(lines))
}

function go() {
  fmt.title((new Date()).toISOString())

  const promises = pages.map((page, pageNum) => {
    return plugin[page.plugin].go(page.opts).then(lines => {
      publish(page.title, page.plugin, pageNum, lines)
    })
  })

  Promise.all(promises).then(() => {
    fmt.msg('')
  }).catch(err => {
    console.warn(err)
  })
}

// ----------------------------------------------------------------------------
// main

fmt.line()
fmt.msg('')
fmt.msg('       _            _           _     ')
fmt.msg('      / \\   _ __ __| | __ _ ___| |__  ')
fmt.msg("     / _ \\ | '__/ _` |/ _` / __| '_ \\ ")
fmt.msg('    / ___ \\| | | (_| | (_| \\__ \\ | | |')
fmt.msg('   /_/   \\_\\_|  \\__,_|\\__,_|___/_| |_|')
fmt.msg('')
fmt.msg('')

;(async () => {

  debug('Calling setup ...')
  await setup()

  debug('Doing interval ...')
  setInterval(go, ms(process.env.NODE_ENV === 'production' ? '1 min' : '10s'))
  go()

})()

// ----------------------------------------------------------------------------
