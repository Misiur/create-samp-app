const fs = require('fs-extra');
const rimraf = require('rimraf');
const path = require('path');
const decompress = require('decompress');
const pify = require('pify');
const { download, extname } = require('./util');
const config = require('./config');
const sampConfig = require('./sampConfig');

let workspace = null;

const downloadServer = (url) => {
  return download(url, workspace);
};

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
    .then(() => {
      return Promise.all([
        pify(fs.unlink)(pack),
        pify(rimraf)(unpacked)
      ]);
    });
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
    .then(() => {
      return Promise.all([
        pify(fs.unlink)(pack),
        pify(rimraf)(unpacked),
      ]);
    })
  ;
};

const unpackServer = (target, pack) => {
  return decompress(pack, workspace)
    .then((files) => {
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
};

const deleteJunk = () => {
  let promises = [];
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

const deletePawno = () => {
  return pify(rimraf)(path.join(workspace, 'pawno'));
};

module.exports.createWorkspace = (targetPath) => {
  try {
    fs.mkdirSync(targetPath);
  } catch (e) {
    // return -1;
  }

  if (!fs.existsSync(targetPath)) {
    return -2;
  }

  workspace = path.resolve(targetPath);

  return workspace;
};

module.exports.process = async (values) => {
  let url = null;
  if (values.target === 'windows') {
    url = config.SERVER_URL.windows;
  } else {
    url = config.SERVER_URL.linux;
  }

  console.log('Downloading server');
  await downloadServer(url);
  console.log('Server downloaded, unpacking');
  await unpackServer(values.target, path.join(workspace, path.basename(url)));

  if (values.delete) {
    console.log('Clearing bundled filterscripts, includes and scriptfiles');
    await deleteJunk();
    console.log('Cleared');
  }

  if (values.target === 'windows') {
    if (values.compiler === 'none') {
      console.log('Removing pawno');
      await deletePawno();
      console.log('Removed');
    } else if (values.compiler === 'zeex') {
      console.log('Fetching and unpacking Zeex\'s compiler');
      await fetchZeex();
      console.log('Unpacked');
    }

    if (values.includes) {
      if (values.includes.includes('ysi')) {
        console.log('Fetching YSI');
        await fetchYSI();
        console.log('YSI loaded');
      }
    }
  }

  if (values.plugins) {
    if (values.plugins.includes('streamer')) {
      console.log('Fetching streamer');
      await fetchStreamer(values.target);
      console.log('Streamer fetched');
    }

    if (values.plugins.includes('mysql')) {
      console.log(`Fetching MySQL ${values.mysql}`);
      await fetchMySQL(values.mysql, values.target, values['mysql-static']);
      console.log('MySQL fetched');
    }

    if (values.plugins.includes('crashdetect')) {
      console.log('Fetching crashdetect');
      await fetchCrashdetect(values.target);
      console.log('Crashdetect fetched');
    }

    if (values.plugins.includes('sscanf')) {
      console.log('Fetching sscanf');
      await fetchSscanf(values.target);
      console.log('Sscanf fetched');
    }
  }

  let plugins = values.plugins;
  if (values.target !== 'windows') {
    plugins = values.plugins.map(plugin => `${plugin}.so`);
  }

  fs
    .createWriteStream(path.join(workspace, 'server.cfg'))
    .write(sampConfig(plugins.join(' ')))
  ;
};
