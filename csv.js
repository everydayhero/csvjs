(function(global, undefined) {
  if (typeof RegExp.escape !== 'function') {
    RegExp.escape = function(s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };
  }

  var extend = function(dst) {
    var args = Array.prototype.slice.call(arguments),
        src, k;
    args.shift();

    while (src = args.shift()) {
      for (k in src) {
        if (src.hasOwnProperty(k)) {
          dst[k] = src[k];
        }
      }
    }

    return dst;
  };

  var forEach = function(arr, callback) {
    var i;

    if (typeof arr.forEach === 'function') {
      arr.forEach(callback);
    } else {
      for (i in arr) {
        if (arr.hasOwnProperty(i) && callback(arr[i], i, arr) === false) {
          break;
        }
      }
    }
  };

  var strCount = function(str, char) {
    return str.split(char).length - 1;
  };

  var mapProperties = function(arr, map) {
    forEach(map, function(prop, i) {
      if (typeof arr[prop] === 'undefined') {
        arr[prop] = arr[i];
      }
    });
  };

  var _converters = {},
      convert = function(val) {
        var returnValue = val;
        forEach(_converters, function(obj) {
          if (obj.re.test(val)) {
            returnValue = obj.func(val);
            return false;
          }
        });

        return returnValue;
      };

  var CSV = {
    defaults: {
      colSep: ',',
      rowSep: "\n",
      quoteChar: '"',
      fieldSizeLimit: null,
      headers: false,
      skipBlanks: false,
      forceQuotes: false
    },
    converters: {
      '\\d': function(str) {
        return str.indexOf('.') !== -1 ? parseFloat(str) : parseInt(str);
      },
      '(true|TRUE|false|FALSE)': function(str) {
        return str.toLowerCase() === 'true';
      }
    },
    parse: function(str, opts) {
      opts = extend({}, this.defaults, opts);

      var escColSep = RegExp.escape(opts.colSep),
          escRowSep = RegExp.escape(opts.rowSep),
          reColSplitter = new RegExp(['(?=', escColSep, ')'].join(''), 'g'),
          reRowSplitter = new RegExp(['(?=', escRowSep, ')'].join(''), 'g'),
          escQuoteChar = RegExp.escape(opts.quoteChar),
          reRemoveQuote = new RegExp(['^\s*', escQuoteChar, '([^', escQuoteChar, ']*)', escQuoteChar, '\s*$'].join('')),
          reRemoveSplitters = new RegExp('^(' + [escColSep, escRowSep].join('|') + ')'),
          reDoubleQuote = new RegExp(escQuoteChar + escQuoteChar, 'g'),
          rows = str.split(reRowSplitter),
          headerRow = null,
          arr = [], strBuf = null, colBuf = [];

      forEach(this.converters, function(callback, re) {
        _converters[re] = {
          re: new RegExp(re),
          func: callback
        };
      });

      forEach(rows, function(row) {
        var cols = row.split(reColSplitter);

        forEach(cols, function(col, i) {
          // Append to buffer
          strBuf = [strBuf, col].join('');
          // Check if we have an odd amount of quote characters
          if (strCount(strBuf, opts.quoteChar) % 2 !== 0) {
            return;
          }

          // Remove the column/row separator
          strBuf = strBuf.replace(reRemoveSplitters, '');

          var match = strBuf.match(reRemoveQuote);
          // Strip out strings which are quoted
          if (match) { strBuf = match[1]; }
          // Unescape double-quotes
          strBuf = strBuf.replace(reDoubleQuote, opts.quoteChar);

          colBuf.push(convert(strBuf));
          strBuf = null;
        });

        // Check if buffer has been flushed
        if (strBuf === null) {
          if (!opts.headers || headerRow) {
            if (opts.headers && headerRow) {
              mapProperties(colBuf, headerRow);
            }
            arr.push(colBuf);
          } else {
            headerRow = colBuf;
          }
          colBuf = [];
        }
      });

    if (strBuf !== null) {
      throw "Malformed CSV data";
    }

      return arr;
    },
    stringify: function(csv, opts) {
      opts = extend({}, this.defaults, opts);

      var rows = [],
          escQuoteChar = RegExp.escape(opts.quoteChar),
          escColSep = RegExp.escape(opts.colSep),
          escRowSep = RegExp.escape(opts.rowSep),
          reQuoteChar = new RegExp(escQuoteChar, 'g'),
          reQuoted = new RegExp('(' + [escQuoteChar, escColSep, escRowSep].join('|') + ')');

      forEach(csv, function(row, k) {
        var cols = [];

        forEach(row, function(col, i) {
          col = col.toString();

          if (opts.fieldSizeLimit) {
            col = col.substr(0, opts.fieldSizeLimit);
          }

          // Double-quote all occurances of the quote character
          col = col.replace(reQuoteChar, opts.quoteChar + opts.quoteChar);

          if (opts.forceQuotes || reQuoted.test(col)) {
            col = [opts.quoteChar, col, opts.quoteChar].join('');
          }

          cols.push(col);
        });

        rows.push(cols.join(opts.colSep));
      });

      return rows.join(opts.rowSep);
    },
    forEach: function(str, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }

      var arr = this.parse(str, opts), line;
      while (line = arr.shift()) {
        callback(line);
      }
    }
  };

  global.CSV = CSV;
})(window);