'use strict';

var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var request = require('request');
var cors = require('cors');
var stormpath = require('express-stormpath');

require('dotenv').config();

var mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
var mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/pubtranspo-db';

mongoose.connect(mongoUrl, function(err){
  if(err) return console.error(`Error connecting to Mongodb: ${err}`);
  console.log(`Connected to MongoDB: ${mongoUrl}`);
});

var app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(express.static('public'));

app.get('/', function(req, res){
  var indexPath = path.join(__dirname, 'index.html');
  res.sendFile(indexPath);
})

app.use('/users', require('./routes/users'));
app.use('/locations', require('./routes/locations'));


var server = http.createServer(app);

server.listen(PORT, function(){
  console.log(`Server listening on port ${PORT}`);
});
