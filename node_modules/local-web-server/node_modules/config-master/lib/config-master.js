'use strict'
var path = require('path')
var walkBack = require('walk-back')

/**
 * @module config-master
 */
module.exports = loadConfig

/**
 *
 *
 * @param {string} - config name
 * @param [options] {object} - options
 * @param [options.startFrom] {string} - directory to begin looking for config
 * @returns {Object}
 * @alias module:config-master
 */
function loadConfig (configName, options) {
  options = options || {}
  const configFileName = '.' + configName + '.json'
  const startFrom = options.startFrom || process.cwd()

  const configs = Array.from(configsInTree(startFrom, configFileName)).reverse()
  const packageConfigs = Array.from(packageConfigsInTree(startFrom, configName)).reverse()

  return Object.assign({}, ...packageConfigs, ...configs)
}

function * configsInTree (startFrom, fileName) {
  let file
  while ((file = walkBack(startFrom, fileName))) {
    yield require(file)
    startFrom = path.resolve(path.dirname(file), '..')
  }
}

function * packageConfigsInTree (startFrom, configName) {
  let file
  while ((file = walkBack(startFrom, 'package.json'))) {
    let config = require(file)[configName]
    if (config) yield config
    startFrom = path.resolve(path.dirname(file), '..')
  }
}
