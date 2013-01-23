CSV.js
======

A javascript CSV parser.

There are many javascript CSV parsers but they either had dependencies or were difficult to use. This library aims to be straight forward to use and works similarly to the JSON parser.

**Note** This file does not handle the reading of files.

## Getting started

1. Download [csv.js](https://raw.github.com/everydayhero/csvjs/master/csv.js)
2. Add it to your HTML file, or where ever you want to use it.
3. ???
4. Profit?

## Parsing

If you've ever parsed JSON in javascript then you basically know how to parse a CSV. Simply pass in a string containing CSV content to the parser.

```javascript
// csv = "Header,...\nRows,...\n..."
var data = CSV.parse(csv);
// data = [['Header', ...], ['Rows', ...], ...]
```

## Generating

To generate a CSV simply pass an array containing rows. The first row is optionally being the header.

```javascript
// data = [['Header', ...], ['Rows', ...], ...]
csv = CSV.stringify(data);
// csv = "Header,...\nRows,...\n..."
```

## Options

The following options can be passed as the second argument to `parse` or `stringify`.

### `colSep`
> column separator. Defaults to comma.

### `rowSep`
> row separator. Defaults to new line.

### `quoteChar`
> quote character. Defaults to double quote.

### `fieldSizeLimit`
> truncate fields that are larger. Defaults to null.

### `headers`
> first row is the header row and should be omitted. When enabled the collection will feature the headers as a property on itself and columns can be referenced by the column name on the row. ie. `row.Name`. Defaults to false.

### `skipBlanks`
> ignore blank rows when parsing.

### `forceQuotes`
> all fields are quoted when generating.

## Contributing

1. [Fork](https://github.com/everydayhero/csvjs/fork_select) the repo
2. Make changes
3. Submit pull request

## Todo

* Test in Internet Explorer and Opera.
* Support generating from an array of objects.
* Benchmark
