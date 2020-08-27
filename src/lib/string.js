// Contains Useful String Functions for Quest

const errors = require('./errors');

const String = (x) => { return String(x) }

function replace(string, replacer, replacement){
  let i = 0;
  for(let i=replacer.length; i<string.length+1; i++){
    let currStr = string.slice(i-replacer.length, i);
    if(currStr === replacer){
      let beginning = string.slice(0, i-replacer.length);
      let end = string.slice(i);
      string = beginning + replacement + end;
      i+=replacement.length-replacer.length;
    }
  }
  return string;
}
function slice(string, start, end){
  if(!end)
  return string.slice(start, end+1);
}
function contains(string, set){
  return string.includes(set);
}
function index(string, chars){
  return string.indexOf(chars);
}
function trim(string){
  return string.trim();
}
function trimLeft(string){
  return string.trimLeft();
}
function trimRight(string){
  return string.trimRight();
}
function upper(string){
  return string.toUpperCase();
}
function lower(string){
  return string.toLowerCase();
}
function startsWith(string, chars){
  return string.startsWith(chars);
}
function endsWith(string, chars){
  return string.endsWith(chars);
}
function capitalize(string){
  return string[0].toUpperCase() + string.slice(1);
}
function reverse(string){
  return string.split('').reverse().join('');
}

module.exports = {
  String,
  slice, replace, contains,
  index, trim, trimLeft,
  trimRight, upper, lower,
  startsWith, endsWith,
  capitalize, reverse
}