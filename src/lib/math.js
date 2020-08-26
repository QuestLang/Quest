// Contains Useful Maths Functions for Quest
const errors = require('./errors');

// Main Math Functions
function sin(x){ return Math.sin(x) }
function cos(x){ return Math.cos(x) }
function tan(x){ return Math.tan(x) }
function arcsin(x){ return Math.asin(x) }
function arccos(x){ return Math.acos(x) }
function arctan(x){ return Math.atan(x) }
function sinh(x){ return Math.sinh(x) }
function cosh(x){ return Math.cosh(x) }
function tanh(x){ return Math.tan(x) }
function sqrt(x){ return Math.sqrt(x) }
function cbrt(x){ return Math.cbrt(x) }
function root(x, y){ return Math.pow(x, 1/y) }
function floor(x){ return Math.floor(x) }
function ceil(x){ return -Math.floor(-x) }
function truncate(x){ return Math.trunc(x) }
function round(x){ return Math.round(x) }
function toRad(x){ return x * Math.PI / 180 }
function toDeg(x){ return x * 180 / Math.PI }
function sign(x){ return Math.sign(x) }

// Specialized Math Functions

function random(min, max){

  random.int = function(min, max){
    return {
      value: floor(Math.random()*(max-min+1)+min),
      min: min, max: max, range: max - min
    }
  }
  random.float = function(min, max){
    return {
      value: Math.random()*(max-min)+min,
      min: min, max: max, range: max - min
    }
  }
  random.char = function(){
    let randInt = floor(random.int(97, 122).value);
    return {
      value: String.fromCharCode(randInt)
    }
  }
  random.string = function(length){
    let code = '';
    for(let i=0; i<length; i++) code += random.char().value;
    return {
      value: code,
      length: length
    }
  }

  return random.float(min, max);
}
random();

function clamp(x, min, max){
  return {
    value: Math.min(Math.max(min, x), max),
    min: min,
    max: max,
    clamped: x
  }
}

// Probability
function factorial(x){
  if(x < 0) errors.noNegative('factorial');
  return {
    value: x == 0 ? 1 : x * factorial(x-1).value,
    initial: x
  }
}
function doubleFactorial(x){
  if(x < 0) errors.noNegative('doubleFactorial');
  return {
    value: x <= 1 ? 1 : x * factorial(x-1).value,
    initial: x
  }
}
function permutate(x, y){
  return factorial(x)/factorial(x-y);
}
function combinate(x, y){
  return factorial(x)/factorial(y)*factorial(x-y);
}

// Trigonometry
function matrix2d(){
  matrix2d.x = (rad) => {
    return cos(rad);
  }
  matrix2d.y = (rad) => {
    return sin(rad);
  }
}

matrix2d();

module.exports = {
  sin, cos, tan,
  arcsin, arccos, arctan,
  sinh, cosh, tanh,
  sqrt, cbrt, root,
  floor, ceil,
  truncate, round,
  random, clamp, factorial,
  toRad, toDeg, sign,
  doubleFactorial, permutate,
  combinate, matrix2d
}