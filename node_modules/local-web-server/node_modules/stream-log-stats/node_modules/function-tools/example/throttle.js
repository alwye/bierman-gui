'use strict'
var f = require('../')

/* testFunc should be called maximum every 200ms */
var lastRun = Date.now()
function testFunc (n) {
  console.log('%d: %d', n, Date.now() - lastRun)
  lastRun = Date.now()
}

var throttled = f.throttle(testFunc, { restPeriod: 200 })

/* call the throttled testFunc 30 times */
var i = 0
var interval = setInterval(function () {
  throttled(++i)
  if (i === 30) clearInterval(interval)
}, 10)
