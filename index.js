const fs = require('fs');
const lexer = require(__dirname + '/interpreter/lexer.js');
const parser = require(__dirname + '/interpreter/parser.js');
const runner = require(__dirname + '/interpreter/runner.js');

function run(file){
  file = file.replace(/\\/g, '/');
  if(fs.existsSync(file)){
    let text = fs.readFileSync(file, 'utf-8');
    return text;
  } else {
    console.error("Quest File Error: " + file + ' is not a valid directory');
  }
}

let text = run('main.qst');
let tokens = text ? lexer(text) : [];

let instructions = parser(tokens);

let start = process.hrtime();
runner(instructions);
let end = process.hrtime();
let timeTaken = (end[0]*1000000+end[1]/1000)-(start[0]*1000000+start[1]/1000);
console.log('Run Time: ' + Math.floor(timeTaken) + 'mcs');

while(true){
  let str = prompt('>');
  if(str.slice(0, 4) === 'run '){
    let text = run(str.slice(4));
    let tokens = text ? lexer(text) : [];

    let instructions = parser(tokens);

    let start = process.hrtime();
    runner(instructions);
    let end = process.hrtime();
    let timeTaken = (end[0]*1000000+end[1]/1000)-(start[0]*1000000+start[1]/1000);
    console.log('Run Time: ' + Math.floor(timeTaken) + 'mcs');
  };
};