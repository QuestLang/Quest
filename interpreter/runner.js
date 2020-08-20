const errors = require('./errors');
const parseFuncs = require('./functions').parse;
const readline = require('readline-sync');

let variables = {};
let functions = {};

// Compare Statements
function compare(stack){
  if(!stack.find(a => a.lexeme === 'comparer')){
    let type = stack.find(a => a.lexeme === 'string') ? 'string' : 'math';
    return process(parseFuncs.stack(stack, type));
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

function call(name, args){
  if(!functions[name]) errors.functionNotFound(name);

  let thisFunc = functions[name];

  let oldVariables = JSON.parse(JSON.stringify(variables));
  
  // Create Local 
  if(thisFunc.parameters){
    for(let i=0; i<thisFunc.parameters.length; i++){
      let currParam = thisFunc.parameters[i];

      let type = args[i].find(a => a.type === 'math') ? 'math' : 'string';
      let value = process(args[i], type);

      variables[currParam] = {
        name: currParam,
        value: value || undefined,
        type: type
      }
    }
  }

  // Run Instructions and Send Back Return Value
  
  let returnValue = run(thisFunc.instructions);
  variables = oldVariables;

  return returnValue;
}

// Evaluate Math Expressions
function evaluateMath(oldStack){
  if(oldStack == undefined) return undefined;

  let mathStack = [...oldStack];
  
  // If One Value
  if(mathStack.length == 1){
    if(Number(mathStack[0]) === mathStack[0]){
      return mathStack[0];
    } else if(variables[mathStack[0]]){
      return variables[mathStack[0]].value;
    } else if(mathStack[0].instruction === 'call'){
      return call(mathStack[0].name, mathStack[0].args);
    } else {
      errors.variableNotFound(mathStack[0]);
    }
  }

  // If One Simple Equation
  if(mathStack.length == 3){
    if(variables[mathStack[0]]){
      mathStack[0] = variables[mathStack[0]].value;
    } else if(mathStack[0].instruction === 'call'){
      mathStack[0] = Number(call(mathStack[0].name, mathStack[0].args));
    }
    
    if(variables[mathStack[2]]){
      mathStack[2] = variables[mathStack[2]].value;
    } else if(mathStack[2].instruction === 'call'){
      mathStack[2] = Number(call(mathStack[2].name, mathStack[2].args));
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
    } else if(mathStack[i].instruction === 'call'){
      mathStack[i] = Number(call(mathStack[i].name, mathStack[i].args));
    }

    // Find Parentheses
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
    let firstVal = mathStack[i-1] ? mathStack[i-1] : 0;
    if(mathStack[i] === '+') value = mathStack[i-1]+mathStack[i+1];
    if(mathStack[i] === '-') value = firstVal-mathStack[i+1];
    if(value && firstVal){
      mathStack.splice(i-1, 3, value);
      i--;
    } else if(value){
      mathStack.splice(i, 2, value);
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
          let result = run(step.instructions);
          if(result) return result;
        }
        break;
      case 'random':
        let min = Number(process(step.min, 'math'));
        let max = Number(process(step.max, 'math'));

        variables[step.name] = {
          name: step.name,
          type: 'string',
          value: Math.random()*(max-min)+min
        }

      case 'createFn':
        functions[step.name] = {
          name: step.name,
          parameters: step.parameters,
          instructions: step.instructions
        }
        break;
      case 'return':
        return process(step.value);
        break;
      case 'if':
        if(compare(step.comparison)){
          let result = run(step.instructions);
          if(result) return result;
        }
        break;
      case 'while':
        while(compare(step.comparison)){
          let result = run(step.instructions);
          if(result) return result;
        }
        break;
      case 'call':
        call(step.name, step.args);
        break;
    }
  }
}

module.exports = run;