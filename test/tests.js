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

test("parse string when column separator is surrounded by quotes", function() {
  var expected = [['Joker', 'Psycho,Funny,Deadly']],
      actual = CSV.parse('Joker,"Psycho,Funny,Deadly"');

  deepEqual(actual, expected);
});

test("parse string when row separator is surrounded by quotes", function() {
  var expected = [['Joker', 'Psycho\nFunny\nDeadly']],
      actual = CSV.parse('Joker,"Psycho\nFunny\nDeadly"');

  deepEqual(actual, expected);
});

test("skip first row when instructed as header", function() {
  var expected = [['Batman', 'Gotham City'], ['Superman', 'Metropolis']],
      actual = CSV.parse(STR, {headers: true});

  deepEqual(actual, expected);
});

test("map field names on rows when headers is enabled", function() {
  var csv = CSV.parse(STR, {headers: true}),
      row = csv[0];

  equal(row.Name, 'Batman');
  equal(row.Location, 'Gotham City');
});

test("throw error when csv is malformed", function() {
  throws(function() {
    CSV.parse('Why so ",serious?');
  });
});

module("CSV converters");

test("fixed numbers", function() {
  deepEqual(CSV.parse("123"), [[123]]);
  deepEqual(CSV.parse("-123"), [[-123]]);
});

test("real numbers", function() {
  deepEqual(CSV.parse("123.12"), [[123.12]]);
  deepEqual(CSV.parse("-123.12"), [[-123.12]]);
});

test("booleans", function() {
  deepEqual(CSV.parse("true"), [[true]]);
  deepEqual(CSV.parse("false"), [[false]]);
});

module("CSV stringify", {
  setup: setup
});

test("serialize an array", function() {
  var expected = "Name,Location\nBatman,Gotham City\nSuperman,Metropolis",
      actual = CSV.stringify(ARRAY);

  equal(actual, expected);
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
