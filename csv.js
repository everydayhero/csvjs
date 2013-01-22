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
        if (arr.hasOwnProperty(i)) {
          callback(arr[i], i, arr);
        }
      }
    }
  };

  var strCount = function(str, char) {
    var count = 0, i = 0;
    while ((i = str.indexOf(char, i + 1)) !== -1) { ++count; }
    return count;
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
    parse: function(str, opts) {
      opts = extend({}, this.defaults, opts);


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