'use strict'

/**
Useful higher-order functions
@module
@typicalname f
@example
```js
var f = require("function-tools")
```
*/
exports.throttle = throttle

/**
Guarantees a function a specified `restPeriod` in between invocations.
@param {Function} - the function to throttle
@param [options] {Object} - the options
@param [options.restPeriod] {number} - a value in ms
@returns {Function}
@alias module:function-tools.throttle
@example
```js
var throttled = f.throttle(myFunction, { restPeriod: 200 })
throtted() // this will only execute if at least 200ms since the last invocation
```
*/
function throttle (f, options) {
  var timer = null
  var lastRun = 0

  return function throttled () {
    clearTimeout(timer)
    var fArgs = arguments
    var timeSinceLastRun = Date.now() - lastRun
    if (timeSinceLastRun > options.restPeriod) {
      f.apply(f, fArgs)
      lastRun = Date.now()
    } else {
      timer = setTimeout(function () {
        f.apply(f, fArgs)
        lastRun = Date.now()
      }, options.restPeriod - timeSinceLastRun)
    }
  }
}
