const fs = require('fs');
const lexer = require(__dirname + '/interpreter/lexer.js');
const parser = require(__dirname + '/interpreter/parser.js');
const runner = require(__dirname + '/interpreter/runner.js');

function run(file){
  file = file.replace(/\\/g, '/');
  if(fs.existsSync(file)){
    let text = fs.readFileSync(file, 'utf-8');
    let tokens = text ? lexer(text) : [];

    let instructions = parser(tokens);
    runner(instructions);
  } else {
    console.error("Quest File Error: " + file + ' is not a valid directory');
  }
}

run('/quest-src/math.qst');
run('main.qst');

while(true){
  let str = prompt('>');
  if(str.slice(0, 4) === 'run '){
    let text = run(str.slice(4));
  };
};