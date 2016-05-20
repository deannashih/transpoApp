'use strict';

var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  email:String,
  locations: [{type: mongoose.Schema.Types.ObjectId, ref: 'Location'}],
  homeLocation: [{type: mongoose.Schema.Types.ObjectId, ref: 'Location'}]
})

var User = mongoose.model('User', userSchema);

module.exports = User;
