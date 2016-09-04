'use strict'

var Form = require('./build/form')

exports = module.exports = Form

exports.Field = require('./build/field')
exports.reducer = require('./build/reducer').default

exports['default'] = Form