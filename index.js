const run = require('./runquest');

// Run The Main Quest Files
run('quest-src/math.qst');

// User Generated
run('main.qst');

while(true){
  let str = prompt('>');
  if(str.slice(0, 4) === 'run ') run(str.slice(4));
};