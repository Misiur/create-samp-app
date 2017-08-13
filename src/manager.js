const fs = require('fs-extra');
const rimraf = require('rimraf');
const path = require('path');
const decompress = require('decompress');
const { download } = require('./util');
const config = require('./config');

let workspace = null;

const downloadServer = (url) => {
  return download(url, workspace);
};

const fetchZeex = () => {
  const url = config.COMPILERS.zeex;

  return download(url, workspace)
    .then(() => {
      const pack = path.join(workspace, path.basename(url));
      return decompress(pack, workspace)
        .then(() => {
          console.log('wtf', pack, workspace);

          return true;
        })
      ;
    })
  ;
};

const unpackServer = (target, pack) => {
  return new Promise((resolve, reject) => {
    return decompress(pack, workspace)
      .then((files) => {
        // fs.unlink(pack, () => {});

        if (target !== 'windows') {
          console.log('Secondary unpacking for linux');
          const unnecessaryFolder = path.join(workspace, 'samp03');
          fs.copy(unnecessaryFolder, workspace, (err) => {
            if (err) return console.error(err);

            return rimraf(unnecessaryFolder, (err2) => {
              if (err) return console.error(err2);

              return resolve();
            });
          });
        } else {
          resolve();
        }

        return files;
      })
    ;
  });
};

const deleteJunk = () => {
  return new Promise((resolve, reject) => {
    let done = 0;

    const folders = ['filterscripts', 'gamemodes', 'include', 'scriptfiles'];
    for (let i = 0; i !== folders.length; ++i) {
      const folder = path.join(workspace, folders[i]);
      rimraf(folder, (err) => {
        if (err) throw err;
        fs.mkdirSync(folder);

        if (++done === folders.length) return resolve();

        return true;
      });
    }
  });
};

const deletePawno = () => {
  return new Promise((resolve) => {
    rimraf(path.join(workspace, 'pawno'), (err) => {
      if (err) throw err;

      resolve();
    });
  });
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
  // await downloadServer(url);
  console.log('Server downloaded, unpacking');
  // await unpackServer(values.target, path.join(workspace, path.basename(url)));

  if (values.delete) {
    console.log('Clearing bundled filterscripts, includes and scriptfiles');
    // await deleteJunk();
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
  }
};
