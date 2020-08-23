const fs = require('fs');

function run(file){
  const lexer = require('./interpreter/lexer.js');
  const parser = require('./interpreter/parser.js');
  const runner = require('./interpreter/runner.js');

  lexer.reset();

  file = file.replace(/\\/g, '/');
  if(fs.existsSync(file)){
    let text = fs.readFileSync(file, 'utf-8');

    let tokens = text ? lexer.lexer(text) : [];

    let instructions = parser(tokens);
    runner.run(instructions);
  } else {
    throw new Error("Quest File Error: " + file + ' is not a valid directory');
  }
}

module.exports = run;