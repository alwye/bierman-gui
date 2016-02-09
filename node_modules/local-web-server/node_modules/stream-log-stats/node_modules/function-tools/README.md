[![view on npm](http://img.shields.io/npm/v/function-tools.svg)](https://www.npmjs.org/package/function-tools)
[![npm module downloads per month](http://img.shields.io/npm/dm/function-tools.svg)](https://www.npmjs.org/package/function-tools)
[![Build Status](https://travis-ci.org/75lb/function-tools.svg?branch=master)](https://travis-ci.org/75lb/function-tools)
[![Dependency Status](https://david-dm.org/75lb/function-tools.svg)](https://david-dm.org/75lb/function-tools)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

<a name="module_function-tools"></a>
## function-tools
Useful higher-order functions

**Example**  
```js
var f = require("function-tools")
```
<a name="module_function-tools.throttle"></a>
### f.throttle(f, [options]) ⇒ <code>function</code>
Guarantees a function a specified `restPeriod` in between invocations.

**Kind**: static method of <code>[function-tools](#module_function-tools)</code>  

| Param | Type | Description |
| --- | --- | --- |
| f | <code>function</code> | the function to throttle |
| [options] | <code>Object</code> | the options |
| [options.restPeriod] | <code>number</code> | a value in ms |

**Example**  
```js
var throttled = f.throttle(myFunction, { restPeriod: 200 })
throtted() // this will only execute if at least 200ms since the last invocation
```

* * *

&copy; 2015 Lloyd Brookes <75pound@gmail.com>
