const fs = require('fs');
const run = require('./runquest');
const fetch = require('node-fetch');

async function importPackage(name){
  // Check if File Already Exists
  if(!fs.existsSync('packages/' + name + '.qst')){

    // Fetch Package URL from Package Manager
    await fetch('https://packages.questlang.repl.co/package/' + name)
    .then(async res => await res.text())
    .then(async data => {
      if(!data){
        console.error('Package ' + name + ' does not exist');
        return;
      }

      // Create Package Folder
      if(!fs.existsSync('packages')){
        await fs.mkdirSync('packages');
      }

      // Fetch Quest File from URL
      await fetch(data)
      .then(async res => await res.text())
      .then(async file => {

        // Write Package        
        await fs.writeFileSync('packages/'+name+'.qst', file);
      });
    })
  }
  if(fs.existsSync('packages/'+name+'.qst')){
    await run('packages/'+name+'.qst');
  }
}
async function importURL(url){

  // Fetch Quest File from URL and Run
  await fetch(url).then(async res => await res.text())
  .then(async data => {
    await run(data);
  })
  .catch(err => { throw Error(err) });
}

module.exports = {
  pack: importPackage,
  url: importURL
};