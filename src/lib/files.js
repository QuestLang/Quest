const ImportPackage = require('../getpackage');
const RequireModule = require('../runquest');
const fs = require('fs');

async function Import(file, name){
  if(file.includes('.qst')){
    await RequireModule(file, name);
  } else if(file.includes('://')){
    await ImportPackage.url(file, name, 'url');
  } else {
    await ImportPackage.pack(file, name);
  }
}

function Files(){
  Files.read = (file) => {
    return fs.readFileSync(file);
  }
  Files.write = (file, text) => {
    fs.writeFileSync(file, text);
  }
  Files.createFile = (file) => {
    fs.writeFileSync(file, '');
  }
  Files.createFolder = (folder) => {
    if(!fs.existsSync(folder)) fs.mkdirSync(folder);
  }
  Files.size = (file) => {
    return fs.statSync(file).size;
  }
}
Files();

let currTime;
function Time(){
  let dt = new Date();
  Time.start = () => {
    currTime = Date.now();
  }
  Time.end = () => {
    let elapsed = Date.now() - currTime;
    elapsed -= Math.round(elapsed/1000*3); // Errors
    return elapsed;
  }

  Time.nano = () => {
    return process.hrtime()[1];
  }
  Time.micro = () => {
    return Math.floor(process.hrtime()[1]/1000);
  }
  Time.ms = () => {
    return Date.now();
  }
  Time.s = () => {
    return Math.floor(Date.now()/1000);
  }
  Time.m = () => {
    return Math.floor(Date.now()/60000);
  }
  Time.h = () => {
    return Math.floor(Date.now()/3600000);
  }
  Time.day = () => {
    return dt.getDay()+1;
  }
  Time.date = () => {
    return dt.getDate();
  }
  Time.month = () => {
    return dt.getMonth()+1;
  }
  Time.year = () => {
    return dt.getFullYear();
  }
  Time.zone = () => {
    return dt.getTimezoneOffset();
  }
  Time.dayOfYear = () => {
    return Math.floor((dt - new Date(dt.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  }
  Time.weekOfYear = () => {
    return Math.floor(Time.dayOfYear()/7);
  }
  
  return Time.ms();
}
Time();

async function delay(ms){
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  });
}

module.exports = {
  Import, Time, Files, delay
}