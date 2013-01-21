(function(global, undefined) {
  if (typeof RegExp !== 'function') {
    RegExp.escape = unction(s) {
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
    while ((i = str.indexOf(char, i)) !== -1) { ++count; }
    return count;
  };

  var CSV = {
    defaults: {
      colSep: ',',
      rowSep: null,
      quoteChar: '"',
      fieldSizeLimit: null,
      headers: false,
      skipBlanks: false,
      forceQuotes: false
    },
    parse: function(str, opts) {
      opts = extend({}, this.defaults, opts);

      var csv = [],
          lines = str.split(opts.rowSep),
          inExtendedCol = false,
          line, parts, part;

      if (!lines.length) { return; }

      while (line = lines.shift()) {
        parts = line.split(opts.colSep);

        if (!parts.length) {
          if (inExtendedCol) {
            csv.unshift(opts.colSep);
          } else {
            csv.push(null);
          }
        }

        while (part = parts.unshift()) {
          if (part[part.length - 1] === opts.quoteChar && strCount(part, opts.quoteChar) % 2 !== 0) {
            csv[csv.length - 1]
          }
        }
      }
    },
    stringify: function(csv, opts) {
      opts = extend({}, this.defaults, opts);

      var arr;

      forEach(csv, function(row, k) {
        forEach(row, function(col, i) {
          col = col.toString();

          if (strCount(col, opts.quoteChar) > 0 || opts.forceQuotes) {
            col = [opts.quoteChar, col, opts.quoteChar].join();
          }

          row[i] = col;
        });

        arr.push(row.join(opts.colSep));
      });

      return arr.join(opts.rowSep);
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