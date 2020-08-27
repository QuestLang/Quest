const ImportPackage = require('../getpackage');
const RequireModule = require('../runquest');
const fs = require('fs');

async function add(file, name){
  if(file.includes('.qst')){
    await RequireModule(file, name);
  } else if(file.includes('://')){
    await ImportPackage.url(file, name, 'url');
  } else {
    await ImportPackage.pack(file, name);
  }
}

function files(){
  files.read = (file) => {
    return fs.readFileSync(file);
  }
  files.write = (file, text) => {
    fs.writeFileSync(file, text);
  }
  files.createFile = (file) => {
    fs.writeFileSync(file, '');
  }
  files.createFolder = (folder) => {
    fs.mkdirSync(folder);
  }
  files.size = (file) => {
    return fs.statSync(file).size;
  }
}
files();

let currTime;
function time(){
  let dt = new Date();
  time.start = () => {
    currTime = Date.now();
  }
  time.end = () => {
    let elapsed = Date.now() - currTime;
    elapsed -= Math.round(elapsed/1000*3); // Errors
    return elapsed;
  }

  time.nano = () => {
    return process.hrtime()[1];
  }
  time.micro = () => {
    return Math.floor(process.hrtime()[1]/1000);
  }
  time.ms = () => {
    return Date.now();
  }
  time.s = () => {
    return Math.floor(Date.now()/1000);
  }
  time.m = () => {
    return Math.floor(Date.now()/60000);
  }
  time.h = () => {
    return Math.floor(Date.now()/3600000);
  }
  time.day = () => {
    return dt.getDay()+1;
  }
  time.date = () => {
    return dt.getDate();
  }
  time.month = () => {
    return dt.getMonth()+1;
  }
  time.year = () => {
    return dt.getFullYear();
  }
  time.zone = () => {
    return dt.getTimezoneOffset();
  }
  time.dayOfYear = () => {
    return Math.floor((dt - new Date(dt.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  }
  time.weekOfYear = () => {
    return Math.floor(time.dayOfYear()/7);
  }
  
  return time.ms();
}
time();

async function delay(ms){
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  });
}

module.exports = {
  add, time, files, delay
}