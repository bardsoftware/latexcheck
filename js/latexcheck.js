var checkLatexCode = require("./main").checkLatexCode;
var fs = require("fs");

var inputName = process.argv[2];
var outputName = process.argv[3] || "out.json";
var contents = fs.readFileSync(inputName, "utf8");
fs.writeFileSync(outputName, JSON.stringify(checkLatexCode(contents), null, 2));
