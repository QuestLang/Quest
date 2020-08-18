const errors = require('../errors');

let MathLexemeList = ['number', 'operator', 'separator', 'variable'];

// Create a Stack of Evaluated Tokens
function createStack(tokens){
  let stack = [];
  let mathStack = [];
  
  for(let token of tokens){
    if(MathLexemeList.includes(token.lexeme)){
      let value = token.chars;
      if(token.lexeme === 'number'){
        value = Number(token.chars);
        if(Number(mathStack[mathStack.length-1])){
          errors.unexpToken(token.chars, token.line, token.col);
        }
      }
      mathStack.push(value);
    } else {
      if(mathStack[0] !== undefined){
        stack.push({ type: 'math', stack: mathStack });
        mathStack = [];
      }
      stack.push({ type: 'string', stack: token.chars });
    }
  }

  if(mathStack[0] !== undefined) stack.push({ type: 'math', stack: mathStack });

  return stack;
}

// Take Characters from line of Tokens
function takeChars(line){
  let endStr = '';
  for(let token of line) endStr += token.chars;
  return endStr;
}

// Get Arguments from a List of Tokens
function getArguments(line){
  let args = [];
  let currArg = [];

  for(let i=0; i<line.length; i++){
    if(line[i].lexeme === 'separator' && line[i].chars === ','){
      args.push(currArg);
      currArg = [];
    } else {
      currArg.push(line[i]);
    }
  }

  if(currArg[0]) args.push(currArg);

  return args;
}

/********** Main Parsing Function **********/
function parser(tokens){
  let instructions = [];

  let index = 0;
  let token = tokens[index];

  // Add Instruction to Array
  const addInstruction = (toEnd) => {
    instructions.push(currInstruction);
    currInstruction = {};
    if(toEnd) advance(end-index);
  }

  // Move Forward a Token
  const advance = (i) => {
    index += i;
    token = tokens[index]
  }

  // Find end of Parentheses
  const findParEnd = (i) => {
    let parCount = 1;
    let args = [];
    while(parCount != 0){
      let oldToken = token;
      advance(1);
      if(!token) errors.expected(')', oldToken.line, oldToken.col);
      if(token.chars === '(') parCount++;
      if(token.chars === ')') parCount--;
      if(parCount == 0) break;

      args.push(token);
    }
    return args;
  }

  // Find end of Brackets
  const findBrackEnd = () => {
    let brackCount = 1;
    let expression = [];
    while(brackCount != 0){
      let oldToken = token;
      advance(1);
      if(!token) errors.expected('}', oldToken.line, oldToken.col);
      if(token.chars === '{') brackCount++;
      if(token.chars === '}') brackCount--;
      if(brackCount == 0) break;

      expression.push(token);
    }
    return expression;
  }

  // Instruction and End of Line
  let currInstruction = {};
  let end;

  while(token){

    // Find the End of the Line
    end = tokens.slice(index).findIndex(a => a.chars === ';')+index;
    
    /********** Set Variable **********/
    if(token.lexeme == 'identifier'){

      // Set and Retrieve Basic Information
      currInstruction.instruction = 'setvar';
      advance(1);
      currInstruction.name = token.chars;
      advance(1);

      // Add to Instructions
      if(token.chars != '=') errors.expected('=', token.line, token.col);
      currInstruction.expression = createStack(tokens.slice(index+1, end));
      if(!currInstruction.expression[0]){
        errors.valueNotFound(currInstruction.name, token.line, token.col);
      }

      currInstruction.type = 'math';
      if(currInstruction.expression.find(a => a.lexeme === 'string')){
        currInstruction.type = 'string';
      }
      
      addInstruction(true);
    }

    /*********** Call or Edit Variables ***********/
    else if(token.lexeme == 'variable'){

      // Set and Retrieve Basic Information
      let thisVar = token.chars;
      advance(1);

      // Call a Function
      if(token.chars === '('){

        // Find End of Statement
        let expression = findParEnd();

        currInstruction.args = getArguments(expression);

        // Add to Instructions
        currInstruction.instruction = 'call';
        currInstruction.name = thisVar;

      // Edit Variable Values
      } else if(token.chars === '='){
        currInstruction.instruction = 'changevar';
        currInstruction.name = thisVar;
        
        let expression = tokens.slice(index+1, end);

        if(expression.find(a => a.lexeme === 'string')){
          currInstruction.type = 'string';
        } else {
          currInstruction.type = 'math';
        }
        currInstruction.expression = createStack(expression);
      
      // Operator Assigments
      } else if(token.chars.match(/[\+\-\*\/]/)){
        let thisOperator = token.chars;
        
        currInstruction.instruction = 'operate';
        currInstruction.name = thisVar;
        currInstruction.expression = createStack(tokens.slice(index+1, end));
        currInstruction.operator = thisOperator;
      } else {
        advance(-1);
        errors.unexpToken(token.chars, token.line, token.col);
      }
      addInstruction(true);
    }

    /*********** Print an Expression ***********/
    else if(token.chars == 'print'){

      // Retrieve and set Basic Information
      currInstruction.instruction = token.chars;
      advance(1);
      if(token.chars != '(') errors.expected('(', token.line, token.col);

      // Find End of Statement
      let expression = findParEnd();

      if(expression.find(a => a.lexeme === 'string')){
        currInstruction.type = 'string';
      } else {
        currInstruction.type = 'math';
      }
      currInstruction.expression = createStack(expression);

      addInstruction(true);
    }
    
    /********** Input **********/
    else if(token.chars === 'input') {
      currInstruction.instruction = 'input';
      advance(1);
      if(token.chars != '(') errors.expected('(', token.line, token.col);

      let args = getArguments(findParEnd());
      currInstruction.expression = createStack(args[0]);
      currInstruction.variable = takeChars(args[1]);
      addInstruction();
    }
    
    /********** For Loops **********/
    else if(token.chars == 'for'){
      advance(1);
      if(token.chars != '(') errors.expected('(', token.line, token.col);

      // Finds the Parentheses
      let oldIndex = index;
      findParEnd();
      let endStatement = index;
      advance(oldIndex-index);

      // Takes the Parts of the For Loop
      let usingVar = tokens.slice(index).findIndex(a => a.chars == 'as');
      usingVar = usingVar == -1 ? 0 : usingVar + index;

      let forMiddle = tokens.slice(index).findIndex(a => a.chars == 'to')+index;
      if(forMiddle - index == -1) errors.expected('to', token.line, token.col);

      let forStart = tokens.slice(index+1, forMiddle);
      let forEnd = tokens.slice(forMiddle+1, usingVar || endStatement);

      let varName = tokens[forMiddle+forEnd.length+2].chars;
      
      if(!forStart[0]) errors.expectedLiteral('a starting value', token.line, token.col);
      if(!forEnd[0]) errors.expectedLiteral('an ending value', token.line, token.col);

      // Checks for Variable Counter
      if(usingVar){
        currInstruction.instruction = 'setvar';
        currInstruction.name = varName;
        currInstruction.type = 'math';
        currInstruction.expression = createStack(forStart);
        addInstruction(true);
      }

      // Advances Token to The First Bracket
      advance(endStatement-index+1);

      // Looks for What is Inside the For Loop
      if(token.chars != '{') errors.expected('{', token.line, token.col); 

      let forTokens = [];
      forTokens = findBrackEnd();

      // Add the Instructions to Array
      let forInstructions = parser(forTokens);
      if(usingVar){
        forInstructions.push({
          instruction: 'operate',
          name: varName,
          expression: createStack([{ lexeme: 'number', chars: 1 }]),
          operator: '+'
        });
      }
      currInstruction.instruction = 'loop';
      currInstruction.start = createStack(forStart);
      currInstruction.end = createStack(forEnd);
      currInstruction.instructions = forInstructions;
      addInstruction();
    }

    /********** Functions **********/
    else if(token.chars === 'func'){
      advance(1);

      if(token.lexeme !== 'variable'){
        errors.fnName(token.line, token.col);
      }
      let fnName = token.chars;
      advance(1);
      if(token.chars !== '(' || token.lexeme !== 'separator'){
        errors.expected('(', token.line, token.col);
      }

      let fnArgs = getArguments(findParEnd());
      advance(1);
      if(token.chars !== '{') error.expected('{');
      let fnTokens = findBrackEnd();

      let fnInstructions = parser(fnTokens);

      currInstruction.instruction = 'createFn';
      currInstruction.name = fnName;
      currInstruction.args = fnArgs;
      currInstruction.instructions = fnInstructions;
      addInstruction(); 
    }

    advance(1);
  }
  return instructions;
}

module.exports = parser;