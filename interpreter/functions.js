const errors = require('./errors');
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
const createStack = (tokens, type) => {
  let stack = [];
  if(type === 'math'){
    let mathStack = [];

    // Loop Through Tokens to Create Stack
    for(let i=0; i<tokens.length; i++){
      let token = tokens[i];
      
      // Numbers
      if(token.lexeme === 'number'){
        mathStack.push(Number(token.chars));
      
      // Operators
      } else if(token.lexeme === 'operator'){
        mathStack.push(token.chars);
      
      // Separators
      } else if(token.lexeme === 'separator'){
        mathStack.push(token.chars);

      // Calling Functions
      } else if(token.lexeme === 'variable'){

        if(tokens[i+1] && tokens[i+1].chars === '('){
          if(!tokens[i+2]) errors.expected(')', tokens[i+1].line, tokens[i+1].col);
          
          let funcArgs = [];

          // If It has Parameters
          if(tokens[i+2].chars !== ')'){
            let end;
            let setCount = 1;
            for(let j=0; j<tokens.slice(i+2).length; j++){
              let thisToken = tokens[j+i+2];
              if(thisToken.chars === '(') setCount++;
              if(thisToken.chars === ')') setCount--;
              if(setCount == 0){ end = j+i+2; break; }
            }
            if(!end) errors.expected(')', tokens[i+2].line, tokens[i+2].col);

            let args = getArguments(tokens.slice(i+2, end));
            
            for(let j=0; j<args.length; j++){
              let thisType = args[j].find(a => a.lexeme === 'string') ? 'string' : 'math';
              args[j] = createStack(args[j], thisType);
            }

            funcArgs = args;
          }

          mathStack.push({
            instruction: 'call',
            name: tokens[i].chars,
            args: funcArgs
          });

          i += 2 + funcArgs.length*2-1;
      // Normal Variables
        } else {
          mathStack.push(token.chars);
        }
      }
    }
    stack.push({ type: 'math', stack: mathStack });
  } else {
    stack = createStringStack(tokens);
  }

  return stack;
}
const createStasack = (tokens, type) => {
  let stack = [];
  let currIndex = 0;

  if(type === 'math'){
    let mathStack = [];

    for(let i=0; i<tokens.length; i++){
      let token = tokens[i];

      if(token.lexeme === 'operator' || token.chars.match(/[\(\)]/) || i+1 === tokens.length){
        let ending = i+1 === tokens.length ? i+1 : i;
        let value = tokens.slice(currIndex, ending);
        currIndex = value.length;
        i = currIndex+1;

        if(value.length == 0) continue;

        if(value.length == 1){
          let pushValue = Number(value[0].chars) == value[0].chars ? 
          Number(value[0].chars) : value[0].chars;
          
          if(token.chars.match(/[\(\)]/)) mathStack.push(token.chars);

          mathStack.push(pushValue);

        // Calling Functions
        } else if(value[1].chars === '('){
          let setCount = 1;
          let args = [];

          // Take Arguments
          let j = 1;
          let thisToken = value[j];
          while(setCount != 0){
            let oldToken = thisToken;
            j++;
            thisToken = value[j];
            if(!thisToken) errors.expected(')', oldToken.line, oldToken.col);
            if(thisToken.chars === '(') setCount++;
            if(thisToken.chars === ')') setCount--;
            if(setCount == 0) break;
            args.push(thisToken);
          }
          
          args = getArguments(args);

          mathStack.push({ instruction: 'call', name: value[0].chars, args: args });
        }

        if(token.lexeme === 'operator') mathStack.push(token.chars);
      }
    }
    stack.push({ type: 'math', stack: mathStack });
  } else {
    stack = createStringStack(tokens);
  }
  return stack;
}
const createStringStack = (tokens) => {
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