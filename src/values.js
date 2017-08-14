module.exports = {
  targets: [{
    name: 'Windows',
    value: 'windows',
  }, {
    name: 'Generic linux',
    value: 'linux',
  }, {
    name: 'CentOS 7',
    value: 'centos7',
  }],

  compilers: [{
    name: 'Do not include',
    value: 'none',
  }, {
    name: 'Standard',
    value: 'standard',
  }, {
    name: 'Zeex\'s',
    value: 'zeex',
  }],

  allIncludes: [{
    name: 'YSI 4',
    value: 'ysi',
  }],

  allPlugins: [{
    name: 'Streamer',
    value: 'streamer',
  }, {
    name: 'Crashdetect',
    value: 'crashdetect',
  }, {
    name: 'BlueG MySQL',
    value: 'mysql',
  }, {
    name: 'sscanf',
    value: 'sscanf',
  }],

  allMySQL: [{
    name: 'R39',
    value: 'r39',
  }, {
    name: 'R41',
    value: 'r41',
  }],
}
