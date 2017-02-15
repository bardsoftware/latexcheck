// Copyright (C) 2017 BarD Software s.r.o
// Author: Alexandr Yanenko (yanenkoalexandr@gmail.com)
var checkLatexCode = require("./main").checkLatexCode;
var fs = require("fs");

if (process.argv.length < 3) {
    console.log("Input file is needed.");
    process.exit();
}
var inputName = process.argv[2];
if (!fs.existsSync(inputName)) {
    console.log("Input file should exist.");
    process.exit();
}
if (fs.lstatSync(inputName).isDirectory()) {
    console.log("Input file should not be a directory.");
    process.exit();
}
var outputName = process.argv[3] || "out.json";
var contents = fs.readFileSync(inputName, "utf8");
fs.writeFileSync(outputName, JSON.stringify(checkLatexCode(contents), null, 2));
