// ----------------------------------------------------------------------------

// npm
const debug = require('debug')('anniversary')
const dateFns = require('date-fns')

// ----------------------------------------------------------------------------
// setup

const defaults = {
  show: 3,
}

function dateAsMMDD(d) {
  return dateFns.format(d, 'MMDD')
}

// ----------------------------------------------------------------------------

function setup(page) {
  debug('setup()')

  // default some opts
  page.config = Object.assign({}, defaults, page.opts)
  page.anniversaries = []

  page.config.date.forEach(line => {
    const parts = line.split(' ')

    page.anniversaries.push({
      // for display
      year: dateFns.format(parts[0], 'YYYY'),
      ddmmm: dateFns.format(parts[0], 'DD MMM'),
      title: parts.splice(1).join(' '),
      // for sorting through the year
      mmdd: dateAsMMDD(parts[0])
    })
  })

  // Sort the anniversaries on 'MMDD' rather than the entire date (since we are year independent) and when we display
  // we just re-arrange based on being before or after todays 'MMDD'.
  page.anniversaries.sort((a, b) => {
    return a.mmdd > b.mmdd ? 1 : a.mmdd < b.mmdd ? -1 : 0
  })

  return null
}

function go(page) {
  debug('go()')

  if (page.anniversaries.length === 0) {
    return []
  }

  // get a copy of the anniversaries so we don't mess up the originals
  const anniversaries = page.anniversaries.slice()

  // Loop (the same number of times as there are `nexts`) and push any anniversaries earlier this year
  // to the end of the list.
  const today = dateAsMMDD(new Date())
  debug(`today=${today}`)
  for( let i = 0; i < anniversaries.length; i++ ) {
    if ( anniversaries[0].mmdd >= today ) {
      debug(`Date ${anniversaries[0].mmdd}/${anniversaries[0].title} is not less than today`)
      break
    }

    debug(`Date ${anniversaries[0].mmdd}/${anniversaries[0].title} is earlier in this year - pushing to the end`)
    // move this date to the end
    anniversaries.push(anniversaries.shift())
  }

  return new Promise((resolve, reject) => {
    const result = []
    // return only the configured number
    anniversaries.splice(0, page.config.show).forEach(ann => {
      result.push(ann.ddmmm)
      result.push(`  ${ann.title}`)
    })
    resolve(result)
  })
}

function cleanup() {
  debug('cleanup()')

  // ToDo: ... !!!

  return null
}

// ----------------------------------------------------------------------------

module.exports = {
  setup,
  go,
  cleanup,
}

// ----------------------------------------------------------------------------
