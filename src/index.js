#!/usr/bin/env node

global.CLI = false;

if (require.main === module) {
  global.CLI = true;
  require('./cli');
} else {
  const pa = require('./pa');

  module.exports = pa;
}
