let mysql = require('mysql');
let aws = require('aws-sdk');

var lookUp = require('./lookup.js');

var request = lookUp(aws, mysql, "with love".replace(/ /g,'%'));

