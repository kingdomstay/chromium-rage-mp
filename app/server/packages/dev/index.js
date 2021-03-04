"use strict";
var chalk = require('chalk');
console.log(chalk.bgRed('REMOVE DEVELOPMENT PACKAGE BEFORE PRODUCTION'));
require('./Fly');
require('./Position');
require('./Spawn');
