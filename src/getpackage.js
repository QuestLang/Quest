const fs = require('fs');
const run = require('./runquest');
const fetch = require('node-fetch');

async function importPackage(name){
  await fetch('https://packages.questlang.repl.co/package/' + name)
  .then(async res => await res.text())
  .then(async data => {
    if(!fs.existsSync('../packages')){
      await fs.mkdirSync('../packages');
    }
    await fetch(data)
    .then(async res => await res.text())
    .then(async file => {
      await fs.writeFileSync('../packages/'+name+'.qst', file);
    });
  });
}
async function importURL(url){
  await fetch(url).then(async res => await res.text())
  .then(async data => {
    await run(data);
  })
}

module.exports = {
  pack: importPackage,
  url: importURL
};