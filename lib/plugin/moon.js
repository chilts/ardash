// ----------------------------------------------------------------------------

// npm
const debug = require('debug')('moon')
const lune = require('lune')

// ----------------------------------------------------------------------------
// setup

// 8 segments, but going either side of the compass markings
// e.g. full moon is 0.5, so 0.5 - 0.0625 to 0.5 + 0.0625.
const fraction = 1/8/2
const phaseTitles = [
  'New Moon',        //  8
  'Waxing Crescent', // 15
  'First Quarter',   // 13
  'Waxing Gibbous',  // 14
  'Full Moon!',      // 10
  'Waning Gibbous',  // 14
  'Third Quarter',   // 13
  'Waning Crescent', // 15
]
const phases = phaseTitles.map((title, i) => {
  const angle = i / 8
  return {
    title,
    from: angle - fraction,
    to: angle + fraction,
  }
})
debug(phases)

// ----------------------------------------------------------------------------

function setup(page) {
  debug('setup()')
}

function run(page) {
  debug('run()')

  const currentPhase = lune.phase().phase
  debug('currentPhase=' + currentPhase)

  let title = null

  phases.forEach(phase => {
    // special case for 'New Moon'
    if ( phase.title === 'New Moon' && (currentPhase - 1) > phase.from && currentPhase < phase.to ) {
      title = phase.title
    }
    else if ( currentPhase > phase.from && currentPhase < phase.to ) {
      title = phase.title
    }
    else {
      // not this phase
    }
  })

  return new Promise((resolve, reject) => {
    resolve([ title || 'Unknown Phase' ])
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
