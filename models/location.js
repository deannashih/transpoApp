'use strict';

var mongoose = require('mongoose');

var locationSchema = new mongoose.Schema({
  lat: Number,
  long: Number
})

var Location = mongoose.model('Location', locationSchema);

module.exports = Location;
