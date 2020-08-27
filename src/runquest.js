const fs = require('fs');

function run(file, raw, stats){
  const lexer = require('./interpreter/lexer.js');
  const parser = require('./interpreter/parser.js');
  const runner = require('./interpreter/runner.js');
  
  lexer.reset();

  file = raw ? file : file.replace(/\\/g, '/');
  if(fs.existsSync(file) || raw){
    let text = raw ? file : fs.readFileSync(file, 'utf-8');

    let lexStart = process.hrtime()[0]*1000000 + process.hrtime()[1]/1000;
    let tokens = text ? lexer.lexer(text) : [];
    let lexEnd = process.hrtime()[0]*1000000 + process.hrtime()[1]/1000;
    let lexTime = Math.round(lexEnd-lexStart);

    let parseStart = process.hrtime()[0]*1000000 + process.hrtime()[1]/1000;
    let instructions = parser(tokens);
    let parseEnd = process.hrtime()[0]*1000000 + process.hrtime()[1]/1000;
    let parseTime = Math.round(parseEnd-parseStart);

    (async() => {
      let runStart = process.hrtime()[0]*1000000 + process.hrtime()[1]/1000;
      await runner(instructions);
      let runEnd = process.hrtime()[0]*1000000 + process.hrtime()[1]/1000;
      let runTime = Math.round(runEnd-runStart);

      if(stats === 'milliseconds'){
        console.log('\nStats:')
        console.log('Lexing Time: ' + lexTime/1000 + ' milliseconds');
        console.log('Parsing Time: ' + parseTime/1000 + ' milliseconds');
        console.log('Running Time: ' + runTime/1000 + ' milliseconds');
      } else if(stats === 'microseconds'){
        console.log('Stats:')
        console.log('Lexing Time: ' + lexTime + ' microseconds');
        console.log('Parsing Time: ' + parseTime + ' microseconds');
        console.log('Running Time: ' + runTime + ' microseconds');
      }
    })();
  } else {
    throw new Error("Quest File Error: " + file + ' is not a valid directory');
  }
}

module.exports = run;