const fs = require('fs');

function run(file, raw){
  const lexer = require('./interpreter/lexer.js');
  const parser = require('./interpreter/parser.js');
  const runner = require('./interpreter/runner.js');
  
  lexer.reset();

  file = raw ? file : file.replace(/\\/g, '/');
  if(fs.existsSync(file) || raw){
    let text = raw ? file : fs.readFileSync(file, 'utf-8');

    let tokens = text ? lexer.lexer(text) : [];

    let instructions = parser(tokens);

    runner.run(instructions);
  } else {
    throw new Error("Quest File Error: " + file + ' is not a valid directory');
  }
}

module.exports = run;