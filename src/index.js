#!/usr/bin/env node

const inquirer = require('inquirer');
const parseArgs = require('minimist');
const manager = require('./manager');

const values = {};

const args = parseArgs(process.argv.slice(2));
const help = args.h || args.help;
const target = args.t || args.target;
const clean = args.d || args.delete;
const compiler = args.c || args.compiler;
const includes = args.i || args.includes;
const plugins = args.p || args.plugins;
const mysql = args.m || args.mysql;
const mysqlStatic = args.ms || args['mysql-static'];
const targetPath = args._[0];

if (help) {
  console.log('Available flags:');
  console.log('-h, --help             This help message');
  console.log('-t, --target           Platform target');
  console.log('-d, --delete           Remove default filterscripts and includes');
  console.log('-c, --compiler         PAWN compiler');
  console.log('-i, --includes         Includes');
  console.log('-p, --plugins          Plugins');
  console.log('-m, --mysql            Mysql plugin version');
  console.log('-ms, --mysql-static    Use statically compiled mysql plugin (linux only)');
  process.exit(0);
}

const targets = [{
  name: 'Windows',
  value: 'windows',
}, {
  name: 'Generic linux',
  value: 'linux',
}, {
  name: 'CentOS 7',
  value: 'centos7',
}];

const compilers = [{
  name: 'Do not include',
  value: 'none',
}, {
  name: 'Standard',
  value: 'standard',
}, {
  name: 'Zeex\'s',
  value: 'zeex',
}];

const allIncludes = [{
  name: 'YSI 4',
  value: 'ysi',
}];

const allPlugins = [{
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
}];

const allMySQL = [{
  name: 'R39',
  value: 'r39',
}, {
  name: 'R41',
  value: 'r41',
}];

const validateChoice = (name, subject, validOptions) => {
  if (subject) {
    const options = validOptions.map(o => o.value);

    if (options.includes(subject)) {
      values[name] = subject;
      return true;
    }

    console.error(`"${subject}" is not a valid ${name} (available: ${options.join(', ')})`);
    process.exit(1);
  }

  return false;
};

const validateMultiChoice = (name, subject, validOptions) => {
  if (subject && typeof subject === 'string') {
    const options = validOptions.map(t => t.value);
    values[name] = subject.split(',').map((item) => {
      if (options.includes(item)) {
        return item;
      }

      console.error(`"${item}" is not a valid ${name.substr(0, name.length - 1)} (available: ${options.join(', ')})`);
      process.exit(1);

      return false;
    });
  }
};

if (!targetPath) {
  console.error('You must specify target path');
  process.exit(1);
}

if (typeof mysqlStatic !== 'undefined') {
  values['mysql-static'] = !!mysqlStatic;
}

if (typeof clean !== 'undefined') {
  values.delete = !!clean;
}

validateChoice('target', target, targets);
validateChoice('compiler', compiler, compilers);
validateMultiChoice('includes', includes, allIncludes);
validateMultiChoice('plugins', plugins, allPlugins);
validateChoice('mysql', mysql, allMySQL);

const questions = {
  target: {
    type: 'list',
    name: 'target',
    message: 'Target platform',
    choices: targets,
  },
  delete: {
    type: 'confirm',
    name: 'delete',
    default: false,
    message: 'Remove bundled filterscripts, scriptfiles and includes?',
  },
  compiler: {
    type: 'list',
    name: 'compiler',
    default: 'standard',
    message: 'PAWN compiler',
    choices: compilers,
    when: answers => (answers.target === 'windows' || target === 'windows'),
  },
  includes: {
    type: 'checkbox',
    name: 'includes',
    message: 'Includes',
    choices: allIncludes,
    when: answers => (answers.target === 'windows' || target === 'windows'),
  },
  plugins: {
    type: 'checkbox',
    name: 'plugins',
    message: 'Plugins',
    choices: allPlugins,
  },
  mysql: {
    type: 'list',
    name: 'mysql',
    message: 'MySQL plugin version',
    choices: allMySQL,
    when: answers => (answers.plugins && answers.plugins.includes('mysql')) || plugins.includes('mysql'),
  },
  mysqlStatic: {
    type: 'confirm',
    name: 'mysql-static',
    message: 'Statically linked MySQL?',
    default: false,
    when: answers => (
      ((answers.plugins && answers.plugins.includes('mysql')) || plugins.includes('mysql')) &&
      (target === 'linux' || answers.target === 'linux')),
  },
};

const workspace = manager.createWorkspace(targetPath);

if (workspace === -1) {
  console.error('Project folder already exists');
  process.exit(2);
} else if (workspace === -2) {
  console.error('Failed to create folder');
  process.exit(2);
}

const passedValuesKeys = Object.keys(values);
const missingValues = Object
  .keys(questions)
  .filter(k => !passedValuesKeys.includes(k))
  .map(k => questions[k])
;

inquirer.prompt(missingValues).then((answers) => {
  const all = Object.assign({}, answers, values);

  manager.process(all);
});
