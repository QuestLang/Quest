const errors = require('../errors');
const parseFuncs = require('./functions').parse;
const readline = require('readline-sync');

let variables = {};
let functions = {};

// Compare Statements
function compare(stack){
  if(!stack.find(a => a.lexeme === 'comparer')){
    return process(parseFuncs.stack(stack));
  }

  let comparer = stack.findIndex(a => a.lexeme === 'comparer');
  let first = compare(stack.slice(0, comparer));
  let last = compare(stack.slice(comparer+1));
  
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

// Evaluate Math Expressions
function evaluateMath(oldStack){
  let mathStack = [...oldStack];

  if(mathStack.length == 1){
    if(Number(mathStack[0]) === mathStack[0]){
      return mathStack[0];
    } else if(variables[mathStack[0]]){
      return variables[mathStack[0]].value;
    } else {
      errors.variableNotFound(mathStack[0]);
    }
  }
  if(mathStack.length == 3){
    if(variables[mathStack[0]]){
      mathStack[0] = variables[mathStack[0]].value;
    }
    if(variables[mathStack[2]]){
      mathStack[2] = variables[mathStack[2]].value;
    }

    if(mathStack[1] === '+') return mathStack[0]+mathStack[2];
    if(mathStack[1] === '-') return mathStack[0]-mathStack[2];
    if(mathStack[1] === '*') return mathStack[0]*mathStack[2];
    if(mathStack[1] === '/') return mathStack[0]/mathStack[2];
  }

  // Loop through Stack
  let parCount = 0;
  let parStart;
  for(let i=0; i<mathStack.length; i++){
    // Change Variables to Values
    if(variables[mathStack[i]]){
      mathStack[i] = variables[mathStack[i]].value;
    }

    // Find Parentheses
    let currStack = [];
    if(parCount > 0) currStack += mathStack[i];
    if(mathStack[i] === '(') parCount++;
    if(mathStack[i] === ')') parCount--;

    if(parCount === 1 && !parStart) parStart = i+1;
    if(parCount === 0 && parStart){
      let value = evaluateMath(mathStack.slice(parStart, i));
      mathStack.splice(parStart-1, i-parStart+2, value);
      i -= i-parStart;
      parStart = null;
    }
  }

  // Multiplication and Division
  for(let i=0; i<mathStack.length; i++){
    let value;
    if(mathStack[i] === '*') value = mathStack[i-1]*mathStack[i+1];
    if(mathStack[i] === '/') value = mathStack[i-1]/mathStack[i+1];

    if(value){
      mathStack.splice(i-1, 3, value);
      i--;
    }
  }

  // Addition and Subtraction
  for(let i=0; i<mathStack.length; i++){
    let value;
    if(mathStack[i] === '+') value = mathStack[i-1]+mathStack[i+1];
    if(mathStack[i] === '-') value = mathStack[i-1]-mathStack[i+1];
    
    if(value){
      mathStack.splice(i-1, 3, value);
      i--;
    }
  }

  return mathStack[0];
}

function operate(name, operator, value){
  let nval = evaluateMath(value[0].stack);
  if(operator === '+') variables[name].value += nval;
  if(operator === '-') variables[name].value -= nval;
  if(operator === '*') variables[name].value *= nval;
  if(operator === '/') variables[name].value /= nval;
}

// Process Tokens Into Value
function process(stack, type){
  if(type === 'math'){
    return evaluateMath(stack[0].stack);
  } else {
    let result = '';
    for(let token of stack){
      if(token.type === 'math') result += evaluateMath(token.stack);
      if(token.type === 'string') result += token.stack;
      if(token.type === 'variable') result += variables[token.stack].value;
    }
    return result;
  }
}

/********** Main Running Function **********/
function run(instructions){
  for(let step of instructions){
    switch(step.instruction){
      case 'clear':
        console.clear();
        break;
      case 'setvar':
        let value = process(step.expression, step.type);
        
        let type = 'string';
        if(Number(value) === value) type = 'math';

        variables[step.name] = {
          name: step.name,
          type: type,
          value: value
        }
        break;
      case 'changevar':
        let thisValue = process(step.expression, step.type);
        
        let thisType = 'string';
        if(Number(thisValue) === thisValue) thisType = 'math';

        variables[step.name] = {
          name: step.name,
          type: thisType,
          value: thisValue
        }
        break;
      case 'operate':
        operate(step.name, step.operator, step.expression);
        break;
      case 'print':
        let printValue = String(process(step.expression, step.type));
        printValue = printValue.replace(/\\n/g, '\n');
        console.log(printValue);
        break;
      case 'input':
        let inputPrint = String(process(step.expression, step.type));
        inputPrint = inputPrint.replace(/\\n/g, '\n');
        inputValue = readline.question(inputPrint);

        variables[step.variable] = {
          name: step.variable,
          type: 'string',
          value: inputValue
        }
        break;
      case 'loop':
        let loopStart = Number(process(step.start, 'math'));
        let loopEnd = Number(process(step.end, 'math'));

        for(let i=loopStart; i<loopEnd; i++){
          run(step.instructions);
        }
        break;
      case 'createFn':
        functions[step.name] = {
          name: step.name,
          args: step.args,
          instructions: step.instructions
        }
        break;
      case 'if':
        if(compare(step.comparison)){
          run(step.instructions);
        }
        break;
      case 'while':
        while(compare(step.comparison)){
          run(step.instructions);
        }
        break;
      case 'call':
        run(functions[step.name].instructions);
        break;
    }
  }
}

module.exports = run;