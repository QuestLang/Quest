const fs = require('fs');
const run = require('./src/runquest');
const importPackage = require('./src/getpackage');

if(fs.existsSync('./packages')){
  let allPackages = fs.readdirSync('./packages');
  for(let thisPackage of allPackages){
    run('packages/' + thisPackage);
  }
}

// Run The Main Quest Files
run('src/lib/math.qst');

// User Generated
run('main.qst');