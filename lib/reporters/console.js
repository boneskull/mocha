/**
 * Module dependencies.
 */

var tty = require('tty');
var diff = require('diff');
var create = require('lodash.create');
var chalk = require('chalk');
var Stream = require('./stream');
var util = require('util');

var STDOUT = process.stdout;
var STDERR = process.stderr;

function Console(runner) {
  Stream.call(this, runner);
}

Console.isTTY = STDOUT.isTTY && STDERR.isTTY;

/**
 * Enable coloring by default, except in the browser interface.
 */

Console.useColors = chalk.supportsColor || process.env.MOCHA_COLORS;

/**
 * Inline diffs instead of +/-
 */

Console.inlineDiffs = false;

/**
 * Export chalk as chalk
 * @type {exports}
 */
Console.chalk = chalk;

Console.colors = {
  pass: function pass() {
    return chalk.green.apply(null, arguments);
  },
  fail: function fail() {
    return chalk.red.apply(null, arguments);
  },
  pending: function pending() {
    return chalk.cyan.apply(null, arguments);
  },
  suite: function suite() {
    return chalk.dim.apply(null, arguments);
  },
  errorMessage: function errorMessage() {
    return chalk.gray.apply(null, arguments);
  },
  fastSpeed: function fastSpeed() {
    return chalk.gray.apply(null, arguments);
  },
  mediumSpeed: function mediumSpeed() {
    return chalk.yellow.apply(null, arguments);
  },
  slowSpeed: function slowSpeed() {
    return chalk.red.apply(null, arguments);
  }
};

/**
 * Default symbol map.
 */
Console.symbols = (function() {
  switch (process.platform) {
    case 'win32':
      return {
        ok: '\u221A',
        err: '\u00D7',
        dot: '.'
      };
    case 'darwin':
      return {
        ok: '\u2705 ',
        err: '\u274c ',
        dot: '\u2024'
      };
    default:
      return {
        ok: '\u2713',
        err: '\u2716',
        dot: '\u2024'
      };
  }
}());

/**
 * Expose term window size, with some
 * defaults for when stderr is not a tty.
 */

if (Console.isTTY) {
  Console.window =
    STDOUT.getWindowSize ? STDOUT.getWindowSize(1)[0] : tty.getWindowSize()[1];
} else {
  Console.window = 75;
}

/**
 * Expose some basic cursor interactions
 * that are common among reporters.
 */

Console.cursor = {
  hide: function() {
    Console.isTTY && STDOUT.write('\u001b[?25l');
  },

  show: function() {
    Console.isTTY && STDOUT.write('\u001b[?25h');
  },

  deleteLine: function() {
    Console.isTTY && STDOUT.write('\u001b[2K');
  },

  beginningOfLine: function() {
    Console.isTTY && STDOUT.write('\u001b[0G');
  },

  CR: function() {
    if (Console.isTTY) {
      exports.cursor.deleteLine();
      exports.cursor.beginningOfLine();
    } else {
      STDOUT.write('\r');
    }
  }
};

/**
 * Outut the given `failures` as a list.
 *
 * @param {Array} failures
 * @api public
 */

//StreamReporter.list = function(failures){
//  console.log();
//  failures.forEach(function(test, i){
//    // format
//    var fmt = color('error title', '  %s) %s:\n')
//      + color('error message', '     %s')
//      + color('error stack', '\n%s\n');
//
//    // msg
//    var err = test.err
//      , message = err.message || ''
//      , stack = err.stack || message
//      , index = stack.indexOf(message) + message.length
//      , msg = stack.slice(0, index)
//      , actual = err.actual
//      , expected = err.expected
//      , escape = true;
//
//    // uncaught
//    if (err.uncaught) {
//      msg = 'Uncaught ' + msg;
//    }
//    // explicitly show diff
//    if (err.showDiff && sameType(actual, expected)) {
//
//      if ('string' !== typeof actual) {
//        escape = false;
//        err.actual = utils.stringify(actual);
//        err.expected =  utils.stringify(expected);
//      }
//
//      fmt = color('error title', '  %s) %s:\n%s') + color('error stack',
// '\n%s\n'); var match = message.match(/^([^:]+): expected/); msg = '\n      '
// + color('error message', match ? match[1] : msg);  if (exports.inlineDiffs)
// { msg += inlineDiff(err, escape); } else { msg += unifiedDiff(err, escape);
// } }  // indent stack trace without msg stack = stack.slice(index ? index + 1
// : index) .replace(/^/gm, '  ');  console.log(fmt, (i + 1), test.fullTitle(),
// msg, stack); }); };

/**
 * Output common epilogue used by many of
 * the bundled reporters.
 *
 * @api public
// */
//
//Console.prototype.epilogue = function() {
//  var stats = this.stats;
//  var fmt;
//
//  console.log();
//
//  // passes
//  fmt = color('bright pass', ' ')
//    + color('green', ' %d passing')
//    + color('light', ' (%s)');
//
//  console.log(fmt,
//    stats.passes || 0,
//    ms(stats.duration));
//
//  // pending
//  if (stats.pending) {
//    fmt = color('pending', ' ')
//      + color('pending', ' %d pending');
//
//    console.log(fmt, stats.pending);
//  }
//
//  // failures
//  if (stats.failures) {
//    fmt = color('fail', '  %d failing');
//
//    console.log(fmt, stats.failures);
//
//    Console.list(this.failures);
//    console.log();
//  }
//
//  console.log();
//};

Console.prototype = create(Stream.prototype, {
  stream: STDOUT,
  color: Console.colors,
  write: function write() {
    Stream.write.call(this, util.format.apply(null, arguments) + '\n');
  }
});

/**
 * Pad the given `str` to `len`.
 *
 * @param {String} str
 * @param {String} len
 * @return {String}
 * @api private
 */

function pad(str, len) {
  str = String(str);
  return Array(len - str.length + 1).join(' ') + str;
}


/**
 * Returns an inline diff between 2 strings with coloured ANSI output
 *
 * @param {Error} Error with actual/expected
 * @return {String} Diff
 * @api private
 */

function inlineDiff(err, escape) {
  var msg = errorDiff(err, 'WordsWithSpace', escape);

  // linenos
  var lines = msg.split('\n');
  if (lines.length > 4) {
    var width = String(lines.length).length;
    msg = lines.map(function(str, i) {
      return pad(++i, width) + ' |' + ' ' + str;
    }).join('\n');
  }

  // legend
  msg = '\n'
    + color('diff removed', 'actual')
    + ' '
    + color('diff added', 'expected')
    + '\n\n'
    + msg
    + '\n';

  // indent
  msg = msg.replace(/^/gm, '      ');
  return msg;
}

/**
 * Returns a unified diff between 2 strings
 *
 * @param {Error} Error with actual/expected
 * @return {String} Diff
 * @api private
 */

function unifiedDiff(err, escape) {
  var indent = '      ';

  function cleanUp(line) {
    if (escape) {
      line = escapeInvisibles(line);
    }
    if (line[0] === '+') {
      return indent + colorLines('diff added', line);
    }
    if (line[0] === '-') {
      return indent + colorLines('diff removed', line);
    }
    if (line.match(/\@\@/)) {
      return null;
    }
    if (line.match(/\\ No newline/)) {
      return null;
    } else {
      return indent + line;
    }
  }

  function notBlank(line) {
    return line != null;
  }

  var msg = diff.createPatch('string', err.actual, err.expected);
  var lines = msg.split('\n').splice(4);
  return '\n      '
    + colorLines('diff added', '+ expected') + ' '
    + colorLines('diff removed', '- actual')
    + '\n\n'
    + lines.map(cleanUp).filter(notBlank).join('\n');
}

/**
 * Return a character diff for `err`.
 *
 * @param {Error} err
 * @return {String}
 * @api private
 */

function errorDiff(err, type, escape) {
  var actual = escape ? escapeInvisibles(err.actual) : err.actual;
  var expected = escape ? escapeInvisibles(err.expected) : err.expected;
  return diff['diff' + type](actual, expected).map(function(str) {
    if (str.added) {
      return colorLines('diff added', str.value);
    }
    if (str.removed) {
      return colorLines('diff removed', str.value);
    }
    return str.value;
  }).join('');
}

/**
 * Returns a string with all invisible characters in plain text
 *
 * @param {String} line
 * @return {String}
 * @api private
 */
function escapeInvisibles(line) {
  return line.replace(/\t/g, '<tab>')
    .replace(/\r/g, '<CR>')
    .replace(/\n/g, '<LF>\n');
}

/**
 * Color lines for `str`, using the color `name`.
 *
 * @param {String} name
 * @param {String} str
 * @return {String}
 * @api private
 */

function colorLines(name, str) {
  return str.split('\n').map(function(str) {
    return color(name, str);
  }).join('\n');
}

/**
 * Check that a / b have the same type.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Boolean}
 * @api private
 */

function sameType(a, b) {
  a = Object.prototype.toString.call(a);
  b = Object.prototype.toString.call(b);
  return a == b;
}

module.exports = Console;
