'use strict';

const axios = require('axios');

const fs = require('fs');

const path = require('path');

const takem = (function main() {
  async function downloadImage(source, output) {
    const writer = fs.createWriteStream(output);

    return axios({
      method: 'get',
      url: source,
      responseType: 'stream',
    }).then((response) => {
      return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        let error = null;
        writer.on('error', (err) => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on('close', () => {
          if (!error) {
            resolve(true);
          }
        });
      });
    });
  }

  function Image(link) {
    const _re = /products\/([^.]*\.\w{3})\?v=\d*$/;

    this.link = link;
    link = 'https://' + link;
    let fileName;

    if (link.match(_re) !== null) {
      fileName = link.match(_re)[1];
    }
    let localPath = path.resolve(__dirname, 'images', fileName);
    return {
      link,
      fileName,
      localPath,
    };
  }

  function queueDownloads(images) {
    return images.reduce(function (p, image) {
      return p.then(function (results) {
        return downloadImage(image.link, image.localPath).then(function (data) {
          results.push(data);
          return results;
        });
      });
    }, Promise.resolve([]));
  }

  const check = function (options = {}) {
    console.log('here are your options');
    for (const option in options) {
      if (Object.prototype.hasOwnProperty.call(options, option)) {
        console.log(`Key: ${option}
          Value: ${options[option]}`);
      }
    }
  };

  function pictures(options) {
    const { files = [], outDir = '.', data = '', verbose = false } = options;

    console.log(`
      files: ${files}
      outDir: ${outDir}
      data: ${data}
      verbose: ${verbose}`);

    const fileContents = fs.readFileSync(
      path.resolve(__dirname, files[0]),
      'utf8'
    );

    const sourceUrls = fileContents
      .split(/\n/)
      .filter((line) => line.length > 3);

    const _each = sourceUrls.map((url) => {
      return new Image(url);
    });

    queueDownloads(_each)
      .then((results) => {
        console.log('Done!');
        console.log(results);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return { pictures, check };
})();

module.exports = {
  takem,
};
