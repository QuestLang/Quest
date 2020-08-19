const errors = require('../errors');
const MathLexemeList = ['number', 'operator', 'separator', 'variable'];

// Take Characters from line of Tokens
const takeChars = (line) => {
  let endStr = '';

  for(let token of line) endStr += token.chars;
  return endStr;
}

// Check if Variable is Available
function availableVar(variable, line, col){
  if(!variable) errors.expectedLiteral('a variable', line, col);
  if(variable.match(/[^A-z0-9]/g)) errors.unavailableVar(variable, line, col); 
  if(variable[0].match(/[^A-z]/)) errors.numericVar(variable, line, col);

  return variable;
}

// Get Arguments from a List of Tokens
function getArguments(line){
  let args = [];
  let currArg = [];

  for(let i=0; i<line.length; i++){
  
    // Find if Character is a Comma
    if(line[i].lexeme === 'separator'
    && line[i].chars === ','){

      // Add to Array
      args.push(currArg);
      currArg = [];

    // Otherwise Add to Current Argument
    } else {
      currArg.push(line[i]);
    }

  }

  if(currArg[0]) args.push(currArg); // Push Last Arg

  return args;
}

// Create a Stack of Evaluated Tokens
const createStack = (tokens) => {
  let stack = [];
  let mathStack = [];
  
  for(let token of tokens){

    // If A Mathematical Token
    if(MathLexemeList.includes(token.lexeme)){
      let value = token.chars;

      // If A Number
      if(token.lexeme === 'number'){
        value = Number(token.chars);
        if(Number(mathStack[mathStack.length-1])) errors.unexpToken(token.chars, token.line, token.col);
      }

      mathStack.push(value); // Add to Stack of Maths
    } else {

      // Check if After a Mathematical Token
      if(mathStack[0] !== undefined){
        stack.push({ type: 'math', stack: mathStack });
        mathStack = [];
      }

      // Push String into Stack
      stack.push({ type: 'string', stack: token.chars });
    }
  }

  // Add Final Math to Stack
  if(mathStack[0] !== undefined) stack.push({ type: 'math', stack: mathStack });
  return stack;
}

module.exports = {
  parse: {
    stack: createStack,
    chars: takeChars,
    argms: getArguments,
    varbs: availableVar
  }
}