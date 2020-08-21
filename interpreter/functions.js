// Contains Useful Functions for Quest
const errors = require('./errors');

// Main Math Functions
function Sin(x){ return Math.sin(x) }
function Cos(x){ return Math.cos(x) }
function Tan(x){ return Math.tan(x) }
function Arcsin(x){ return Math.asin(x) }
function Arccos(x){ return Math.acos(x) }
function Arctan(x){ return Math.atan(x) }
function Sinh(x){ return Math.sinh(x) }
function Cosh(x){ return Math.cosh(x) }
function Tanh(x){ return Math.tan(x) }
function Sqrt(x){ return Math.sqrt(x) }
function Cbrt(x){ return Math.cbrt(x) }
function Root(x, y){ return Math.pow(x, 1/y) }
function Floor(x){ return Math.floor(x) }
function Ceil(x){ return -Math.floor(-x) }
function Truncate(x){ return Math.trunc(x) }
function Round(x){ return Math.round(x) }

// Specialized Math Functions
function Random(min, max){
  return Math.random()*(max-min)+min;
}
function Clamp(x, min, max){
  return Math.min(Math.max(min, x), max);
}
function Factorial(x){
  if(x < 0) errors.noNegative('Factorial');
  return x == 0 ? 1 : x * Factorial(x-1);
}

module.exports = {
  Sin, Cos, Tan,
  Arcsin, Arccos, Arctan,
  Sinh, Cosh, Tanh,
  Sqrt, Cbrt, Root,
  Floor, Ceil,
  Truncate, Round,

  Random, Clamp, Factorial,

}