#!/usr/bin/env node

'use strict';

const { takem } = require('../index.js');

const fs = require('fs');

const { argv, cwd, stdin } = process;

const { isTTY } = stdin;

const args = argv.slice(2);

const options = {
  files: [],
  outDir: '',
  data: '',
  verbose: false,
};

if (isTTY && args.length === 0) console.log('Usage: ');

if (args.length !== 0) handleShellArguments();

if (isTTY) takem.pictures(options);

if (!isTTY) handlePipedContent();

function handleShellArguments() {
  while (args.length) {
    let arg = args.pop();
    parseArg(arg);
  }
}

function parseArg(arg) {
  if (arg[0] !== '-') {
    const isReadable = fs.existsSync(arg);

    const isDir = isReadable && fs.lstatSync(arg).isDirectory();

    if (options.outDir === '') {
      isDir ? (options.outDir = arg) : cwd;
    }

    if (isReadable && !isDir) {
      options.files.push(arg);
    }
  }

  if (arg[0] === '-' && arg[1] !== '-') {
    for (const flag of arg) {
      switch (flag) {
        case 'v':
          options.verbose = true;
          break;
        default:
          break;
      }
    }
  }
  if (arg[0] === '-' && arg[1] === '-') {
    switch (arg) {
      case '--verbose':
        options.verbose = true;
        break;
      default:
        break;
    }
  }
}

function handlePipedContent() {
  let data = '';

  stdin.on('readable', function () {
    const chunk = stdin.read();

    if (chunk !== null) data += chunk;
  });
  stdin.on('end', function () {
    if (data.length > 0) {
      options.data = data;
    }
    if (args.length !== 0) handleShellArguments();
    takem.pictures(options);
  });
}
