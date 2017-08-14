const manager = require('./manager');
const values = require('./values');
const { validateChoice, validateMultiChoice } = require('./validation');

module.exports = (path, config) => {
  if (!path) {
    throw 'Path must be specified';
  }

  const defaults = {
    target: 'windows',
    delete: false,
    compiler: 'standard',
    includes: [],
    plugins: [],
    mysql: null,
    'mysql-static': false,
  };

  const options = Object.assign({}, defaults, config);

  validateChoice('target', options.target, values.targets);
  validateChoice('compiler', options.compiler, values.compilers);
  validateMultiChoice('includes', options.includes, values.allIncludes);
  validateMultiChoice('plugins', options.plugins, values.allPlugins);
  validateChoice('mysql', options.mysql, values.allMySQL);

  if (options.plugins.includes('mysql')) {
    if (options.mysql === null) {
      throw new Error('MySQL requested, but no version specified');
    }
  }

  manager.createWorkspace(path);
  manager.process(options);

  return true;
};

