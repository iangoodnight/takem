'use strict';

const Log = function() {
  let _level = 'NONE';

  function set(lvl = '') {
    switch (lvl.toUpperCase()) {
      case 'V':
        this._level = 'VERBOSE';
        break;
      case 'VERBOSE':
        this._level = 'VERBOSE';
        break;
      case 'D':
        this._level = 'DEBUG';
        break;
      case 'DEBUG':
        this._level = 'DEBUG';
        break;
      default:
        this._level = 'NONE';
        break;
    }
    this._level = lvl
  }

  function out(msgObj) {
    if (Object.prototype.hasOwnProperty.call(msgObj, _level)) {
      console.log(`${_level}: ${msgObj._level}`);
    }
  }

  return {
    set,
    out,
  };
}

module.exports = Log;
