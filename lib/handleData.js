#!/usr/bin/env node

'use strict';

const readline = require('readline');

const fs = require('fs');

const { URL } = require('url');

const { stdin, stdout } = process;

const Log = require('./logging');

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

  async function _readSource(file = null, pipe = false) {
    const _data = [];

    const _errors = [];

    const options = {
      crlfDelay: Infinity,
    }
    if (file !== null) {
      options.input = fs.createReadStream(file);
    }
    if (file === null && !stdin.isTTY) {
      options.input = stdin;
      options.output = stdout;
      options.terminal = false;
      file = 'STDIN';
    }
    if (file === null && stdin.isTTY) {
      throw new Error('No input supplied');
    }
    const rl = readline.createInterface(options);
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
    console.log('reading all');
    if (!stdin.isTTY) {
      const fromPiped = await _readSource(null, true)
      console.log('see stdin');
      data.push(...fromPiped._data);
      errors.push(...fromPiped._errors);
    }
    try {
      for (const file of files) {
        console.log('Attempting to read: ' + file)
        const results = await _readSource(file);

        data.push(...results._data);
        errors.push(...results._errors);
      }
    } catch {
      console.log('No files to read');
    }
    console.log('Errors');
    console.log(errors);
    return data;
  }

  async function read(files = [], options = {}) {
    const { log = 'NONE' } = options;

    const logOptions = ['VERBOSE', 'V', 'DEBUG', 'D']
      .includes(log.toUpperCase());
    const logger = new Log();
    if (logOptions) logger.set(log);
    const data = await _readAll(files);
    return data;
  };

  return {
    _readAll,
    _readSource,
    read,
  };
})();

module.exports = handleData;
//handleData
//  ._readAll()
//  .then((data) => {
//    console.log(data);
//  })
//  .catch((err) => {
//    console.log(err);
//  });
