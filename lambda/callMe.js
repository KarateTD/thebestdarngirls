'use strict';

const mysql = require('mysql');
const aws = require('aws-sdk');

const lookUp = require('./lookup.js');

lookUp.searching(aws, mysql, "with love".replace(/ /g,'%')).then(data => {
    console.log(data);
}).catch(err => {
    console.log(err+" fool");
});

