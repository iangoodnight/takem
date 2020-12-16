'use strict';

const readline = require('readline');

const fs = require('fs');

const { URL } = require('url');

const handleData = (function () {
  const data = [];

  const errors = [];

  function _validate(line) {
    const validator = /^('|")?((https?:)?\/\/)?([^'"]*)\1,?$/;

    function replacer(match, ...matches) {
      const [, pre, , url] = matches;

      const protocol =
        pre === 'http://' || pre === 'https://' ? pre : 'https://';
      const result = protocol + url;

      try {
        new URL(result);
        return result;
      } catch {
        throw new Error();
      }
    }
    return line.trim().replace(validator, replacer);
  }

  async function _readFromStdin() {}

  async function _readFromFile(file) {
    const _data = [];

    const _errors = [];

    const fileStream = fs.createReadStream(file);

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    let lineNumber = 1;
    for await (const line of rl) {
      try {
        const valid = _validate(line);
        _data.push(valid);
      } catch {
        const err = `${file}:::${lineNumber}:::${line}`;
        _errors.push(err);
      }
      lineNumber++;
    }
    return { _data, _errors };
  }

  async function _readAll(files) {
    for (const file of files) {
      const results = await _readFromFile(file);

      data.push(...results._data);
      errors.push(...results._errors);
    }
    console.log('Errors');
    console.log(errors);
    return data;
  }

  return {
    _readFromFile,
    _readAll,
    _readFromStdin,
  };
})();

handleData
  ._readAll(['../test.txt', '../test2.txt'])
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
