var test = require('tape')
var f = require('../')

test('first', function (t) {
  t.plan(3)
  function testFunc () {
    t.pass()
  }

  var throttled = f.throttle(testFunc, { restPeriod: 200 })

  var i = 0
  var interval = setInterval(function () {
    throttled(++i)
    if (i === 30) clearInterval(interval)
  }, 10)
})
