// ----------------------------------------------------------------------------

// npm
const lune = require('lune')

// ----------------------------------------------------------------------------
// setup

// 8 segments, but going either side of the compass markings
// e.g. full moon is 0.5, so 0.5 - 0.0625 to 0.5 + 0.0625.
const fraction = 1/8/2
const phaseTitles = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon!',
  'Waning Gibbous',
  'Third Quarter',
  'Waning Crescent',
]
const phases = phaseTitles.map((title, i) => {
  const angle = i / 8
  return {
    title,
    from: angle - fraction,
    to: angle + fraction,
  }
})

// ----------------------------------------------------------------------------

function setup() {
  // nothing to do
}

function go(client) {
  const currentPhase = lune.phase().phase
  // console.log('currentPhase:', currentPhase)

  phases.forEach(phase => {
    // special case for 'New Moon'
    if ( phase.title === 'New Moon' && (currentPhase - 1) > phase.from && currentPhase < phase.to ) {
      console.log(`Moon: ${phase.title}`)
      client.publish('ardash/moon.phase', phase.title)
    }
    else if ( currentPhase > phase.from && currentPhase < phase.to ) {
      console.log(`Moon: ${phase.title}`)
      client.publish('ardash/moon.phase', phase.title)
    }
    else {
      // console.log(`Not in ${phase.title}`)
    }
  })
}

// ----------------------------------------------------------------------------

module.exports = {
  setup,
  go,
}

// ----------------------------------------------------------------------------
