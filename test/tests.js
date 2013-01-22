var DATA;

module("CSV stringify", {
  setup: function() {
    DATA = [
      ['Name', 'Location'],
      ['Batman', 'Gotham City'],
      ['Superman', 'Metropolis']
    ];
  }
});

test("serialize an array", function() {
  var expected = "Name,Location\nBatman,Gotham City\nSuperman,Metropolis",
      actual = CSV.stringify(DATA);

  equal(actual, expected);
});

test("`forceQuote` quotes all fields", function() {
  var expected = "\"Name\",\"Location\"\n\"Batman\",\"Gotham City\"\n\"Superman\",\"Metropolis\"",
      actual = CSV.stringify(DATA, {forceQuotes: true});

  equal(actual, expected);
});

test("`quoteChar` sets the quote character used", function() {
  var expected = "#Name#,#Location#\n#Batman#,#Gotham City#\n#Superman#,#Metropolis#",
      actual = CSV.stringify(DATA, {forceQuotes: true, quoteChar: '#'});

  equal(actual, expected);
});

test("`fieldSizeLimit` truncates fields that are longer in length", function() {
  var expected = "Nam,Loc\nBat,Got\nSup,Met",
      actual = CSV.stringify(DATA, {fieldSizeLimit: 3});

  equal(actual, expected);
});

test("`colSep` sets the column separator", function() {
  var expected = "Name|Location\nBatman|Gotham City\nSuperman|Metropolis",
      actual = CSV.stringify(DATA, {colSep: '|'});

  equal(actual, expected);
});

test("`rowSep` sets the row separator", function() {
  var expected = "Name,Location\rBatman,Gotham City\rSuperman,Metropolis",
      actual = CSV.stringify(DATA, {rowSep: "\r"});

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
