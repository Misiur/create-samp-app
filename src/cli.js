const inquirer = require('inquirer');
const parseArgs = require('minimist');

const manager = require('./manager');
const values = require('./values');
const { validateChoice, validateMultiChoice } = require('./validation');

const inputs = {};

const args = parseArgs(process.argv.slice(2));
const help = args.h || args.help;
const target = args.t || args.target;
const clean = args.d || args.delete;
const compiler = args.c || args.compiler;
const includes = args.i || args.includes || [];
const plugins = args.p || args.plugins || [];
const mysql = args.m || args.mysql;
const mysqlStatic = args.s || args['mysql-static'];
const targetPath = args._[0];

if (typeof mysqlStatic !== 'undefined') {
  inputs['mysql-static'] = !!mysqlStatic;
}

if (typeof clean !== 'undefined') {
  inputs.delete = !!clean;
}

if (help) {
  console.log('Available flags:');
  console.log('-h, --help             This help message');
  console.log('-t, --target           Platform target');
  console.log('-d, --delete           Remove default filterscripts and includes');
  console.log('-c, --compiler         PAWN compiler');
  console.log('-i, --includes         Includes');
  console.log('-p, --plugins          Plugins');
  console.log('-m, --mysql            Mysql plugin version');
  console.log('-s, --mysql-static    Use statically compiled mysql plugin (linux only)');
  process.exit(0);
}

if (!targetPath) {
  console.error('You must specify target path');
  process.exit(1);
}

const validateMultiString = (name, subject, validOptions) => {
  let mapped = [];
  if (subject && typeof subject === 'string') {
    mapped = subject.split(',');
  }

  return validateMultiChoice(name, mapped, validOptions);
};

try {
  inputs.target = validateChoice('target', target, values.targets);
  inputs.compiler = validateChoice('compiler', compiler, values.compilers);
  inputs.includes = validateMultiString('includes', includes, values.allIncludes);
  inputs.plugins = validateMultiString('plugins', plugins, values.allPlugins);
  inputs.mysql = validateChoice('mysql', mysql, values.allMySQL);
} catch (e) {
  console.error(e);
  process.exit(2);
}

const questions = {
  target: {
    type: 'list',
    name: 'target',
    message: 'Target platform',
    choices: values.targets,
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
    choices: values.compilers,
    when: answers => (answers.target === 'windows' || target === 'windows'),
  },
  includes: {
    type: 'checkbox',
    name: 'includes',
    message: 'Includes',
    choices: values.allIncludes,
    when: answers => (answers.target === 'windows' || target === 'windows'),
  },
  plugins: {
    type: 'checkbox',
    name: 'plugins',
    message: 'Plugins',
    choices: values.allPlugins,
  },
  mysql: {
    type: 'list',
    name: 'mysql',
    message: 'MySQL plugin version',
    choices: values.allMySQL,
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

try {
  manager.createWorkspace(targetPath);
} catch (e) {
  console.error(e);
  process.exit(2);
}

const passedValuesKeys = Object.keys(inputs).filter(k => inputs[k] !== null);
const missingValues = Object
  .keys(questions)
  .filter(k => !passedValuesKeys.includes(k))
  .map(k => questions[k])
;

inquirer.prompt(missingValues).then((answers) => {
  const all = Object.assign({}, answers, inputs);

  manager.process(all, true);
});
