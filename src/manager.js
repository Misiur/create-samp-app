const fs = require('fs-extra');
const rimraf = require('rimraf');
const path = require('path');
const decompress = require('decompress');
const pify = require('pify');
const { download, extname } = require('./util');
const config = require('./config');
const sampConfig = require('./sampConfig');

let workspace = null;

// let log = () => {};
// let error = () => {};
// if (global.CLI === true) {
//   log = console.log.bind(console);
//   error = console.error.bind(console);
// }
const log = console.log.bind(console);
const error = console.error.bind(console);

const downloadServer = url => download(url, workspace);

const fetchZeex = () => {
  const url = config.COMPILERS.zeex;

  const pack = path.join(workspace, path.basename(url));
  const unpacked = path.join(workspace, path.basename(url, path.extname(url)));

  return download(url, workspace)
    .then(() => decompress(pack, workspace))
    .then(() => pify(fs.copy)(
      path.join(unpacked, 'bin'),
      path.join(workspace, 'pawno')
    ))
    .then(() => Promise.all([
      pify(fs.unlink)(pack),
      pify(rimraf)(unpacked),
    ]))
  ;
};

const fetchYSI = () => {
  const url = config.INCLUDES.ysi;

  const pack = path.join(workspace, path.basename(url));

  return download(url, workspace)
    .then(() => decompress(pack, workspace))
    .then(() => pify(fs.unlink)(pack))
  ;
};

const fetchStreamer = (platform) => {
  const url = config.PLUGINS.streamer;

  const pack = path.join(workspace, path.basename(url));

  return download(url, workspace)
    .then(() => decompress(pack, workspace))
    .then(() => pify(fs.unlink)(pack))
    .then(() => {
      const name = `streamer.${platform === 'windows' ? 'so' : 'dll'}`;

      return pify(fs.unlink)(path.join(workspace, 'plugins', name));
    })
  ;
};

const fetchMySQL = (version, platform, staticLib) => {
  let url = null;

  if (platform === 'windows') {
    url = config.PLUGINS.mysql[version][platform];
  } else if (platform === 'linux') {
    if (staticLib) {
      url = config.PLUGINS.mysql[version][platform].static;
    } else {
      url = config.PLUGINS.mysql[version][platform].normal;
    }
  } else {
    url = config.PLUGINS.mysql[version][platform];
  }

  const pack = path.join(workspace, path.basename(url));

  return download(url, workspace)
    .then(() => decompress(pack, workspace))
    .then(() => {
      if (platform !== 'windows') {
        let name = path.basename(url, '.tar.gz');
        if (staticLib) {
          name = name.substring(0, name.indexOf('-static'));
        }

        const unpacked = path.join(workspace, name);

        return pify(fs.copy)(unpacked, workspace)
          .then(() => pify(rimraf)(unpacked))
        ;
      } else if (version === 'r41') {
        const name = path.basename(url, path.extname(url));
        const unpacked = path.join(workspace, name);

        return pify(fs.copy)(unpacked, workspace)
          .then(() => pify(rimraf)(unpacked))
        ;
      }

      return null;
    })
    .then(() => pify(fs.unlink)(pack))
  ;
};

const fetchSscanf = (platform) => {
  let url = null;

  if (platform === 'windows') {
    url = config.PLUGINS.sscanf[platform];
  } else {
    url = config.PLUGINS.sscanf[platform];
  }

  const pack = path.join(workspace, path.basename(url));

  return download(url, workspace)
    .then(() => decompress(pack, workspace))
    .then(() => pify(fs.unlink)(pack))
  ;
};

const fetchCrashdetect = (platform) => {
  const url = config.PLUGINS.crashdetect[platform];

  const pack = path.join(workspace, path.basename(url));
  const unpacked = path.join(workspace, path.basename(url, extname(platform)(url)));
  const pluginsDir = path.join(workspace, 'plugins');
  const includesDir = path.join(workspace, 'pawno', 'include');

  return download(url, workspace)
    .then(() => decompress(pack, workspace))
    .then(() => pify(fs.copy)(unpacked, pluginsDir))
    .then(() => pify(fs.move)(path.join(pluginsDir, 'crashdetect.inc'), path.join(includesDir, 'crashdetect.inc')))
    .then(() => Promise.all([
      pify(fs.unlink)(pack),
      pify(rimraf)(unpacked),
    ]))
  ;
};

const unpackServer = (target, pack) =>
  decompress(pack, workspace)
    .then(() => {
      fs.unlink(pack, () => {});

      if (target !== 'windows') {
        const unnecessaryFolder = path.join(workspace, 'samp03');
        return pify(fs.copy)(unnecessaryFolder, workspace)
          .then(() => pify(rimraf)(unnecessaryFolder))
        ;
      }

      return null;
    })
  ;

const deleteJunk = () => {
  const promises = [];
  const folders = ['filterscripts', 'gamemodes', 'include', 'scriptfiles'];
  for (let i = 0; i !== folders.length; ++i) {
    const folder = path.join(workspace, folders[i]);
    promises.push(pify(rimraf)(folder));
  }

  return Promise.all(promises)
    .then(() => {
      for (let i = 0; i !== folders.length; ++i) {
        fs.mkdirSync(path.join(workspace, folders[i]));
      }
    })
  ;
};

const deletePawno = () =>
  pify(rimraf)(path.join(workspace, 'pawno'));

module.exports.createWorkspace = (targetPath) => {
  workspace = path.resolve(targetPath);

  try {
    fs.mkdirSync(workspace);
  } catch (e) {
    const files = fs.readdirSync(workspace);

    if (files.length) {
      throw new Error(`"${workspace}" already exists and is not empty`);
    }
  }

  if (!fs.existsSync(workspace)) {
    throw new Error(`Failed to create folder "${workspace}"`);
  }

  return workspace;
};

module.exports.process = (values) => new Promise(async (resolve) => {
  try {
    let url = null;
    if (values.target === 'windows') {
      url = config.SERVER_URL.windows;
    } else {
      url = config.SERVER_URL.linux;
    }

    log('Downloading server');
    await downloadServer(url);
    log('Server downloaded, unpacking');
    await unpackServer(values.target, path.join(workspace, path.basename(url)));

    if (values.delete) {
      log('Clearing bundled filterscripts, includes and scriptfiles');
      await deleteJunk();
      log('Cleared');
    }

    if (values.target === 'windows') {
      if (values.compiler === 'none') {
        log('Removing pawno');
        await deletePawno();
        log('Removed');
      } else if (values.compiler === 'zeex') {
        log('Fetching and unpacking Zeex\'s compiler');
        await fetchZeex();
        log('Unpacked');
      }

      if (values.includes) {
        if (values.includes.includes('ysi')) {
          log('Fetching YSI');
          await fetchYSI();
          log('YSI loaded');
        }
      }
    }

    let pluginsString = '';

    if (values.plugins) {
      const plugins = values.plugins;

      if (plugins.includes('streamer')) {
        log('Fetching streamer');
        await fetchStreamer(values.target);
        log('Streamer fetched');
      }

      if (plugins.includes('mysql')) {
        log(`Fetching MySQL ${values.mysql}`);
        await fetchMySQL(values.mysql, values.target, values['mysql-static']);
        log('MySQL fetched');
      }

      if (plugins.includes('crashdetect')) {
        log('Fetching crashdetect');
        await fetchCrashdetect(values.target);
        log('Crashdetect fetched');
      }

      if (plugins.includes('sscanf')) {
        log('Fetching sscanf');
        await fetchSscanf(values.target);
        log('Sscanf fetched');
      }

      if (values.target !== 'windows') {
        pluginsString = plugins.map(plugin => `${plugin}.so`).join(' ');
      }
    }

    fs
      .createWriteStream(path.join(workspace, 'server.cfg'))
      .write(sampConfig(pluginsString))
    ;

    resolve();
  } catch (e) {
    error(e);
    throw e;
  }
});
