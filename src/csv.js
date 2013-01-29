(function(global, undefined) {
  if (typeof RegExp.escape !== 'function') {
    RegExp.escape = function(s) {
      return s.replace(/[\-\/\\\^$*+?.()|\[\]{}]/g, '\\$&');
    };
  }

  var extend = function() {
    var args = Array.prototype.slice.call(arguments),
        dst = args.shift(),
        src, k;

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

  var strCount = function(str, ch) {
    return str.split(ch).length - 1;
  };

  var emtpyArray = function(arr) {
    arr = arr.filter(function(i) { return !!i; });
    return !arr.length;
  };

  var CSVParser = function(opts) {
    this.opts = extend({}, CSV.defaults, opts);
    this.headerRow = null;
  };
  CSVParser.prototype = {
    constructor: CSVParser,
    convert: function(str) {
      var self = this, returnValue = str;

      forEach(CSV.converters, function(func) {
        var ret = func(str);
        if (typeof ret !== 'undefined') {
          returnValue = ret;
          return false;
        }
      });

      return returnValue;
    },
    mapProperties: function(row) {
      if (this.headerRow) {
        forEach(this.headerRow, function(prop, i) {
          if (typeof row[prop] === 'undefined') {
            row[prop] = row[i];
          }
        });
      }
    },
    parse: function(str) {
      var self = this,
          opts = this.opts,
          escColSep = RegExp.escape(opts.colSep),
          escRowSep = RegExp.escape(opts.rowSep),
          reColSplitter = new RegExp(['(?=', escColSep, ')'].join(''), 'g'),
          reRowSplitter = new RegExp(['(?=', escRowSep, ')'].join(''), 'g'),
          escQuoteChar = RegExp.escape(opts.quoteChar),
          reRemoveQuote = new RegExp(['^\\s*', escQuoteChar, '([^', escQuoteChar, ']*)', escQuoteChar, '\\s*$'].join('')),
          reRemoveSplitters = new RegExp('^(' + [escColSep, escRowSep].join('|') + ')'),
          reDoubleQuote = new RegExp(escQuoteChar + escQuoteChar, 'g'),
          csv = [], strBuf = null, colBuf = [], rows;

      rows = str.replace(/\r/g, '\n').split(reRowSplitter);

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

          if (opts.fieldSizeLimit) {
            strBuf = strBuf.substr(0, opts.fieldSizeLimit);
          }

          colBuf.push(self.convert(strBuf));
          strBuf = null;
        });

        // Check if buffer has been flushed
        if (strBuf === null) {
          if (!opts.skipBlanks || !emtpyArray(colBuf)) {
            if (!opts.headers || self.headerRow) {
              if (opts.headers) { self.mapProperties(colBuf); }
              csv.push(colBuf);
            } else {
              self.headerRow = colBuf;
            }
          }
          colBuf = [];
        }
      });

      if (strBuf !== null) {
        throw "Malformed CSV data";
      }

      csv.headers = this.headerRow;

      return csv;
    },
    stringify: function(csv) {
      var opts = this.opts,
          rows = [],
          escQuoteChar = RegExp.escape(opts.quoteChar),
          escColSep = RegExp.escape(opts.colSep),
          escRowSep = RegExp.escape(opts.rowSep),
          reQuoteChar = new RegExp(escQuoteChar, 'g'),
          reQuoted = new RegExp('(' + [escQuoteChar, escColSep, escRowSep].join('|') + ')');

      forEach(csv, function(row, k) {
        var cols = [];

        forEach(row, function(col, i) {
          if (col === null || col === undefined) { col = ''; }
          col = col.toString();

          if (opts.fieldSizeLimit) {
            col = col.substr(0, opts.fieldSizeLimit);
          }

          // Double-quote all occurances of the quote character
          col = col.replace(reQuoteChar, opts.quoteChar + opts.quoteChar);
          // Quote the field if forced or it contains quote, colume or row splitter characters
          if (opts.forceQuotes || reQuoted.test(col)) {
            col = [opts.quoteChar, col, opts.quoteChar].join('');
          }

          cols.push(col);
        });

        rows.push(cols.join(opts.colSep));
      });

      return rows.join(opts.rowSep);
    }
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
    converters: [
      function(str) {
        if (/^[\+\-]?\d+(\,\d+)*(\.\d+)?$/.test(str)) {
          str = str.replace(',', '');
          return str.indexOf('.') !== -1 ? parseFloat(str) : parseInt(str, 0);
        }
      },
      function(str) {
        str = str.toLowerCase();
        if (str === 'true' || str === 'false') {
          return str === 'true';
        }
      },
      function(str) {
        if (/^(\s*|null)$/i.test(str)) {
          return null;
        }
      },
      function(str) {
        var date = Date.parse(str);

        if (/^\d{4}([\-\/]\d{2}){2}/.test(str) && !isNaN(date)) {
          return new Date(date);
        }
      }
    ],
    parse: function(str, opts) {
      return new CSVParser(opts).parse(str);
    },
    stringify: function(csv, opts) {
      return new CSVParser(opts).stringify(csv);
    }
  };

  global.CSV = CSV;
})(this);