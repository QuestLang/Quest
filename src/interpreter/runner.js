const readline = require('readline-sync');

const errors = require('../lib/errors');
const parseFuncs = require('./utils').parse;

const MathFunctions = require('../lib/math');
const StringFunctions = require('../lib/string');
const FileFunctions = require('../lib/files');

const MainFunctions = {
  ...MathFunctions,
  ...StringFunctions,
  ...FileFunctions
}

let variables = {};
let functions = {};

// Deep Clone Objects
function deepClone(obj) {
  const cloned = Array.isArray(obj) ? [] : {};
  if (Array.isArray(obj)) {
    for (const prop of obj) {
      if (typeof prop !== 'object' || !prop) {
        cloned.push(prop)
      } else {
        cloned.push(clone(prop))
      }
    }
  } else {
    for (const prop in obj) {
      if (typeof obj[prop] !== 'object' || !obj[prop]) {
        cloned[prop] = obj[prop]
      } else {
        cloned[prop] = deepClone(obj[prop])
      }
    }
  }
  return cloned;
}

// Compare Statements
async function compare(stack){
  let comparer = stack.findIndex(a => a.line !== undefined);

  let firstType = stack[comparer-1].find(a => a.type !== 'math') ? 'string' : 'math';
  let first = await process(stack[comparer-1], firstType);
  let lastType = stack[comparer+1].find(a => a.type !== 'math') ? 'string' : 'math';
  let last = await process(stack[comparer+1], lastType);
  
  if(stack[comparer].chars === '='){
    return first === last;
  } else if(stack[comparer].chars === '>'){
    return first > last;
  } else if(stack[comparer].chars === '<'){
    return first < last;
  } else if(stack[comparer].chars === '!'){
    return first !== last;
  }
}

// Calling Functions
async function call(name, args){
  let returnValue;

  let allPieces = name.split('.');
  let main = allPieces[0];
  let allArgs = [];
  let varbName;

  // Get Arguments
  for(let i=0; i<args.length; i++){
    if(args[i].find(a => a.lexeme === 'separator' && a.chars === '$')){
      varbName = args[i][1].chars;
    } else {
      let type = args[i].find(a => String(a) === a) ? 'string' : 'math';
      allArgs.push(await process(args[i], type));
    }
  }

  // Main Functions
  if(Object.keys(MainFunctions).includes(main)){

    // Get Exact Function
    let thisFunction = MainFunctions;
    for(let i=0; i<allPieces.length; i++){
      if(thisFunction === undefined) errors.functionNotFound(thisFunction);
      thisFunction = thisFunction[allPieces[i]];
    }
    returnValue = await thisFunction(...allArgs);
    if(varbName){
      let varbType = Number(returnValue) === returnValue ? 'math' : 'string';
      setVar(varbName, returnValue, varbType);
    } else {
      return returnValue;
    }
  
  // Object Oriented Functions
  } else if(variables[main] && variables[main].value !== undefined){
    if(allPieces.length < 1) errors.functionNotFound(main);
    
    // Get Exact Function
    let thisFunction = MainFunctions;
    for(let i=1; i<allPieces.length; i++){
      if(thisFunction === undefined) errors.functionNotFound(thisFunction);
      thisFunction = thisFunction[allPieces[i]];
    }
    returnValue = await thisFunction(getVar(main), ...allArgs);
    setVar(main, returnValue, getVar(main, true).type);
    return returnValue;

  // User Created Functions
  } else {
    if(!functions[main]) errors.functionNotFound(main);

    // Get Exact Function
    let thisFunction = functions;
    for(let i=0; i<allPieces.length; i++){
      if(thisFunction === undefined) errors.functionNotFound(thisFunction);
      thisFunction = thisFunction[allPieces[i]];
    }

    let oldVariables = deepClone(variables);
    
    // Create Local 
    if(thisFunction.parameters[0] !== undefined){
      for(let i=0; i<thisFunction.parameters.length; i++){
        let currParam = thisFunction.parameters[i];
        if(args[i]){
          let type = args[i].find(a => a.type === 'math') ? 'math' : 'string';
          let value = await process(args[i], type);
          variables[currParam] = {
            name: currParam,
            value: value,
            type: type
          }
        }
      }
    }

    // Run Instructions and Send Back Return Value
    returnValue = await run(thisFunction.instructions).catch(err => console.error(err));
    variables = oldVariables;
    return returnValue;
  }
}
function getVar(name, raw){
  if(!name) errors.expectedLiteral('a name');
  if(name.match(/\./g)){
    let allPieces = name.split('.');
    let main = allPieces[0];
    let thisVar = variables[main];
    for(let i=1; i<allPieces.length; i++){
      thisVar = thisVar[allPieces[i]]
    }

    if(!variables[main]) errors.variableNotFound(main);
    return variables[main][allPieces[1]];
  } else {
    if(!variables[name]) errors.variableNotFound(name);
    let varb = variables[name];
    if(raw) return varb;
    if(varb.type === 'math') return Number(varb.value);
    if(varb.type === 'string') return String(varb.value);
  }
}
function setVar(name, value, type){
  if(name.match(/\./g)){
    let allPieces = name.split('.');
    let main = allPieces[0];
    let thisVar = variables[main];
    for(let i=1; i<allPieces.length-1; i++){
      if(thisVar === undefined) errors.variableNotFound(name);
      thisVar = thisVar[allPieces[i]];
    }
    thisVar[allPieces[allPieces.length-1]] = value;
  } else {
    if(String(value) === value) type = 'string';
    variables[name] = {
      name: name,
      value: value,
      type: type
    }
    if(value.value || value.value === 0){
      for(let i=0; i<Object.keys(value).length; i++){
        let curr = Object.keys(value)[i];
        variables[name][curr] = value[curr];
      }
    }
  }
}
function getValue(value){
  if(value === undefined) return value;
  if(value.value !== undefined) return value.value;
  return value;
}

// Evaluate Math Expressions
async function evaluateMath(oldStack){
  if(oldStack == undefined) return undefined;

  let mathStack = [...oldStack];
  
  // If One Value
  if(mathStack.length == 1){
    if(mathStack[0].instruction === 'call'){
      return await call(mathStack[0].name, mathStack[0].args).catch(err => console.error(err));
    } else if(mathStack[0].instruction === 'var'){
      return await getVar(mathStack[0].name, true);
    } else {
      return mathStack[0];
    }
  }

  // If One Simple Equation
  if(mathStack.length == 3){
    if(mathStack[0].instruction === 'call'){
      mathStack[0] = await getValue(await call(mathStack[0].name, mathStack[0].args).catch(err => console.error(err)));
    } else if(mathStack[0].instruction === 'var'){
      mathStack[0] = await getVar(mathStack[0].name);
    }
    
    if(mathStack[2].instruction === 'call'){
      mathStack[2] = await getValue(await call(mathStack[2].name, mathStack[2].args))
      .catch(err => console.error(err));
    } else if(mathStack[2].instruction === 'var'){
      mathStack[2] = await getVar(mathStack[2].name);
    }

    if(mathStack[1] === '+') return mathStack[0]+mathStack[2];
    if(mathStack[1] === '-') return mathStack[0]-mathStack[2];
    if(mathStack[1] === '*') return mathStack[0]*mathStack[2];
    if(mathStack[1] === '/') return mathStack[0]/mathStack[2];
    if(mathStack[1] === '%') return mathStack[0]%mathStack[2];
    if(mathStack[1] === '^') return mathStack[0]**mathStack[2];
  }

  // Loop through Stack
  let parCount = 0;
  let parStart;
  for(let i=0; i<mathStack.length; i++){
    // Change Variables to Values
    if(mathStack[i].instruction === 'call'){
      mathStack[i] = await getValue(await call(mathStack[i].name, mathStack[i].args))
      .catch(err => console.error(err));
    } else if(mathStack[i].instruction === 'var'){
      mathStack[i] = await getVar(mathStack[i].name);
    }

    // Find Parentheses
    if(mathStack[i] === '(') parCount++;
    if(mathStack[i] === ')') parCount--;

    if(parCount === 1 && !parStart) parStart = i+1;
    if(parCount === 0 && parStart){
      let value = await evaluateMath(mathStack.slice(parStart, i));
      
      mathStack.splice(parStart-1, i-parStart+2, value);
      i -= i-parStart;
      parStart = null;
    }
  }

  // Modulus Operator
  for(let i=0; i<mathStack.length-0; i++){
    let value;
    let first = mathStack[i-1] || 0;
    let last = mathStack[i+1] || 0;
    if(mathStack[i] === '%') value = first%last;
    if(mathStack[i] === '^') value = first**last;
    
    if(value){
      mathStack.splice(i-1, 3, value);
      i--;
    }
  }

  // Multiplication and Division
  for(let i=0; i<mathStack.length-0; i++){
    let value;
    let first = mathStack[i-1] || 0;
    let last = mathStack[i+1] || 0;
    
    if(mathStack[i] === '*') value = first*last;
    if(mathStack[i] === '/') value = first/last;

    if(value){
      mathStack.splice(i-1, 3, value);
      i--;
    }
  }

  // Addition and Subtraction
  for(let i=0; i<mathStack.length; i++){
    let value;

    let first = mathStack[i-1] || 0;
    let last = mathStack[i+1] || 0;

    if(mathStack[i] === '+') value = first+last;
    if(mathStack[i] === '-') value = first-last;

    if(value !== undefined && mathStack[i-1] !== undefined){
      mathStack.splice(i-1, 3, value);
      i--;
    } else if(value !== undefined){
      mathStack.splice(i, 2, value);
    }
  }

  return mathStack[0];
}

// Simple Operations
async function operate(name, operator, value){
  let nval = await process(value, 'math');
  if(operator === '+') variables[name].value += nval;
  if(operator === '-') variables[name].value -= nval;
  if(operator === '*') variables[name].value *= nval;
  if(operator === '/') variables[name].value /= nval;
  if(operator === '%') variables[name].value %= nval;
  if(operator === '^') variables[name].value **= nval;
}

// Process Tokens Into Value
async function process(stack, type, raw){
  if(type === 'math'){
    if(raw) return await evaluateMath(stack[0].stack);
    return await getValue(await evaluateMath(stack[0].stack));
  } else {
    let result = '';
    for(let token of stack){
      if(token.type === 'math'){
        result += await getValue(await evaluateMath(token.stack));
      } else {
        result += token;
      }
    }
    if(raw) return result;
    return result;
  }
}

function unescape(text){
  text = text.replace(/\\n/g, '\n');
  text = text.replace(/\\b/g, '\b');
  text = text.replace(/\\t/g, '\t');
  text = text.replace(/\\\\/g, '\\');
  text = text.replace(/\\'/g, '\'');
  text = text.replace(/\\"/g, '\"');

  // windows gang
  text = text.replace(/\\r/g, '\r');

  return text;
}

/********** Main Running Function **********/
async function run(instructions){
  for(let step of instructions){
    switch(step.instruction){
      case 'clear':
        console.clear();
        break;
      case 'setvar':
        let value = await process(step.expression, step.type, true);
        
        let type = 'string';
        if(Number(await getValue(value)) === await getValue(value)){
          type = 'math';
        }

        await setVar(step.name, await getValue(value), type);
        break;
      case 'changevar':
        let thisValue = await process(step.expression, step.type, true);
        
        let thisType = 'string';
        if(Number(thisValue) === thisValue) thisType = 'math';

        setVar(step.name, thisValue, thisType);
        break;
      case 'operate':
        await operate(step.name, step.operator, step.expression);
        break;
      case 'print':
        let printValue = String(await process(step.expression, step.type));
        printValue = unescape(printValue);
        console.log(printValue);
        break;
      case 'input':
        let inputPrint = String(await process(step.expression, step.type));
        inputPrint = JSON.parse('"'+inputPrint+'"');
        inputValue = String(readline.question(inputPrint));

        setVar(step.variable, inputValue, 'string');
        break;
      case 'error':
        let saying = String(await process(step.expression, 'string'));
        saying = JSON.parse('"'+saying+'"');
        throw new Error(saying);
      case 'loop':
        let loopStart = Number(await process(step.start, 'math'));
        let loopEnd = Number(await process(step.end, 'math'));

        for(let i=loopStart; i<loopEnd; i++){
          let result = await run(step.instructions).catch(err => console.error(err));
          if(result !== undefined) return await result;
        }
        break;
      case 'createFn':
        functions[step.name] = {
          name: step.name,
          parameters: step.parameters,
          instructions: step.instructions
        }
        break;
      case 'return':
        if(step.value.find(a => a.type === 'string')){
          returnType = 'string';
        } else {
          returnType = 'math';
        }
        return await process(step.value, returnType, true);
      case 'break':
        return 0;
      case 'continue':
        return undefined;
      case 'if':
        if(await compare(step.comparison)){
          let result = await run(step.instructions).catch(err => console.error(err));
          if(result !== undefined) return result;
        }
        break;
      case 'while':
        while(await compare(step.comparison)){
          let result = await run(step.instructions);
          if(result !== undefined) return result;
        }
        break;
      case 'call':
        await call(step.name, step.args).catch(err => console.error(err));
        break;
    }
  }
}

module.exports = run;