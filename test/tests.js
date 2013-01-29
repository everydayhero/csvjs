var ARRAY, STR;

function setup() {
  STR = "Name,Location\nBatman,Gotham City\nSuperman,Metropolis";
  ARRAY = [
    ['Name', 'Location'],
    ['Batman', 'Gotham City'],
    ['Superman', 'Metropolis']
  ];
}

module("CSV parsing", {
  setup: setup
});

test("parses a string", function() {
  var expected = ARRAY,
      actual = CSV.parse(STR);

  deepEqual(actual, expected);
});

test("converts return carriage characters to new line", function() {
  var expected = ARRAY,
      actual = CSV.parse("Name,Location\rBatman,Gotham City\rSuperman,Metropolis");

  deepEqual(actual, expected);
});

test("unescapes quotes", function() {
  var expected = ARRAY,
      actual = CSV.parse("Name,Location\nBatman,\"Gotham City\"\nSuperman,Metropolis");

  deepEqual(actual, expected);
});

test("unescapes double quotes", function() {
  var expected = [['Harvey "Two-face" Dent']],
      actual = CSV.parse('Harvey ""Two-face"" Dent');

  deepEqual(actual, expected);
});

test("column separator is surrounded by quotes", function() {
  var expected = [['Joker', 'Psycho,Funny,Deadly']],
      actual = CSV.parse('Joker,"Psycho,Funny,Deadly"');

  deepEqual(actual, expected);
});

test("row separator is surrounded by quotes", function() {
  var expected = [['Joker', 'Psycho\nFunny\nDeadly']],
      actual = CSV.parse('Joker,"Psycho\nFunny\nDeadly"');

  deepEqual(actual, expected);
});

test("`headers` when true will skip first row", function() {
  var expected = [['Batman', 'Gotham City'], ['Superman', 'Metropolis']],
      actual = CSV.parse(STR, {headers: true});

  deepEqual(actual, expected);
});

test("`headers` when true will map field names on rows", function() {
  var csv = CSV.parse(STR, {headers: true}),
      row = csv[0];

  equal(row.Name, 'Batman');
  equal(row.Location, 'Gotham City');
});

test("`headers` when true will include headers in the output", function() {
  var csv = CSV.parse(STR, {headers: true}),
      expected = ['Name', 'Location'],
      actual = csv.headers;

  deepEqual(actual, expected);
});

test("`fieldSizeLimit` truncates fields that are longer in length", function() {
  var expected = [['Arkham']],
      actual = CSV.parse('Arkham Asylum', {fieldSizeLimit: 6});

  deepEqual(actual, expected);
});

test("`quoteChar` is removed from quoted fields", function() {
  var expected = [['"Batman"', 'Gotham City']],
      actual = CSV.parse('"Batman", |Gotham City|', {quoteChar: '|'});

  deepEqual(actual, expected);
});

test("`quoteChar` is used to unescape double-quotes", function() {
  var expected = [["Harvey `Two-face` Dent"]],
      actual = CSV.parse("Harvey ``Two-face`` Dent", {quoteChar: '`'});

  deepEqual(actual, expected);
});

test("`colSep` is used to separate columns", function() {
  var expected = [['Batman', 'Gotham City'], ['Superman', 'Metropolis']],
      actual = CSV.parse("Batman|Gotham City\nSuperman|Metropolis", {colSep: '|'});

  deepEqual(actual, expected);
});

test("`rowSep` is used to separate columns", function() {
  var expected = [['Batman', 'Gotham City'], ['Superman', 'Metropolis']],
      actual = CSV.parse("Batman,Gotham City|Superman,Metropolis", {rowSep: '|'});

  deepEqual(actual, expected);
});

test("`skipBlanks` ignores empty rows", function() {
  var expected = [['Batman', 'Gotham City'], ['Superman', 'Metropolis']],
      actual = CSV.parse("Batman,Gotham City\n, \nSuperman,Metropolis", {skipBlanks: true});
  deepEqual(actual, expected);
});

test("throw error when csv is malformed", function() {
  throws(function() {
    CSV.parse('Why so ",serious?');
  });
});

module("CSV converters");

test("fixed numbers", function() {
  deepEqual(CSV.parse('123'), [[123]]);
  deepEqual(CSV.parse('-123'), [[-123]]);
  deepEqual(CSV.parse('+123'), [[123]]);
  deepEqual(CSV.parse('abc123'), [['abc123']]);
});

test("real numbers", function() {
  deepEqual(CSV.parse('123.12'), [[123.12]]);
  deepEqual(CSV.parse('+123.12'), [[123.12]]);
  deepEqual(CSV.parse('-123.12'), [[-123.12]]);
  deepEqual(CSV.parse('"1,234.12"'), [[1234.12]]);
  deepEqual(CSV.parse('"+1,234.12"'), [[1234.12]]);
  deepEqual(CSV.parse('"-1,234.12"'), [[-1234.12]]);
  deepEqual(CSV.parse('"abc1,234.12"'), [['abc1,234.12']]);
});

test("booleans", function() {
  deepEqual(CSV.parse('true'), [[true]]);
  deepEqual(CSV.parse('TRUE'), [[true]]);
  deepEqual(CSV.parse('false'), [[false]]);
  deepEqual(CSV.parse('FALSE'), [[false]]);
});

test("nulls", function() {
  deepEqual(CSV.parse('foo,,bar'), [['foo', null, 'bar']]);
  deepEqual(CSV.parse('foo,NULL,bar'), [['foo', null, 'bar']]);
  deepEqual(CSV.parse('foo,null,bar'), [['foo', null, 'bar']]);
});

test("dates", function() {
  deepEqual(CSV.parse('2013 01 23'), [['2013 01 23']]);
  deepEqual(CSV.parse('2013-01-23T20:26:13.123Z'), [[new Date(2013, 0, 24, 6, 26, 13, 123)]]);
  // The follow test passes in Chrome but not Node :S
  // deepEqual(CSV.parse('2013-01-23'), [[new Date(Date.UTC(2013, 0, 23))]]);
  deepEqual(CSV.parse('2013/01/23'), [[new Date(2013, 0, 23)]]);
});

module("CSV stringify", {
  setup: setup
});

test("serialize an array", function() {
  var expected = "Name,Location\nBatman,Gotham City\nSuperman,Metropolis",
      actual = CSV.stringify(ARRAY);

  equal(actual, expected);
});

test("serializes null", function() {
  equal(CSV.stringify([['foo', null, 'bar']]), "foo,,bar");
  equal(CSV.stringify([['foo', undefined, 'bar']]), "foo,,bar");
  equal(CSV.stringify([['foo', false, 'bar']]), "foo,false,bar");
  equal(CSV.stringify([['foo', 0, 'bar']]), "foo,0,bar");
});

test("`forceQuote` quotes all fields", function() {
  var expected = "\"Name\",\"Location\"\n\"Batman\",\"Gotham City\"\n\"Superman\",\"Metropolis\"",
      actual = CSV.stringify(ARRAY, {forceQuotes: true});

  equal(actual, expected);
});

test("`quoteChar` sets the quote character used", function() {
  var expected = "#Name#,#Location#\n#Batman#,#Gotham City#\n#Superman#,#Metropolis#",
      actual = CSV.stringify(ARRAY, {forceQuotes: true, quoteChar: '#'});

  equal(actual, expected);
});

test("`fieldSizeLimit` truncates fields that are longer in length", function() {
  var expected = "Nam,Loc\nBat,Got\nSup,Met",
      actual = CSV.stringify(ARRAY, {fieldSizeLimit: 3});

  equal(actual, expected);
});

test("`colSep` sets the column separator", function() {
  var expected = "Name|Location\nBatman|Gotham City\nSuperman|Metropolis",
      actual = CSV.stringify(ARRAY, {colSep: '|'});

  equal(actual, expected);
});

test("`rowSep` sets the row separator", function() {
  var expected = "Name,Location\rBatman,Gotham City\rSuperman,Metropolis",
      actual = CSV.stringify(ARRAY, {rowSep: "\r"});

  equal(actual, expected);
});

test("serializing double-quotes the quote character", function() {
  var expected = "'Harley-Quinne says ''hey Mr J'''",
      actual = CSV.stringify([["Harley-Quinne says 'hey Mr J'"]], {quoteChar: "'"});

  equal(actual, expected);
});

test("serializing double-quotes when field contains column separator", function() {
  var expected = "\"Batman, Robin\",Batgirl",
      actual = CSV.stringify([["Batman, Robin", "Batgirl"]]);

  equal(actual, expected);
});

test("serializing double-quotes when field contains column separator", function() {
  var expected = "\"Batman\nRobin\",Batgirl",
      actual = CSV.stringify([["Batman\nRobin", "Batgirl"]]);

  equal(actual, expected);
});
