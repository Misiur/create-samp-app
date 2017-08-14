const fs = require('fs');
const path = require('path');
const url = require('url');
const request = require('request-promise-native');

const download = (fileUrl, workspace) => {
  const parsed = url.parse(fileUrl);
  const filename = path.basename(parsed.pathname);

  return new Promise(resolve =>
    request
      .get(fileUrl)
      .on('error', (err) => {
        throw err;
      })
      .pipe(fs.createWriteStream(path.join(workspace, filename)))
      .on('finish', () => {
        resolve();
      }));
};

const extname = platform => (platform === 'windows' ? path.extname : () => '.tar.gz');

module.exports = {
  download,
  extname,
};
