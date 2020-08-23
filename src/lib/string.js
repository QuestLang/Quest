// Contains Useful String Functions for Quest

const errors = require('./errors');

const String = (x) => { return String(x) }

function replace(string, replacer, replacement, amount){
  let i = 0;
  let nstring = string;
  if(!amount) amount = string.length;
  while(i < amount){
    string = string.replace(replacer, replacement);
    i++;
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

module.exports = {
  String,
  slice, replace, contains
}