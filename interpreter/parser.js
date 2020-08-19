const errors = require('../errors');
const parseFuncs = require('./functions').parse;

/********** Main Parsing Function **********/
function parser(tokens){

  // Main Parsing Variables
  let instructions = [];

  let index = 0;
  let end = 0;

  let currInstruction = {};
  let token = tokens[index];

  // Add Instruction to Array
  const addInstruction = (toEnd) => {
    instructions.push(currInstruction);
    currInstruction = {};

    if(toEnd && end == -1) errors.expected(';', token.line, token.col);
    if(toEnd) advance(end-index);
  }

  // Move Forward a Token
  const advance = (i) => {
    index += i;
    token = tokens[index]
  }

  // Find End of Parentheses
  const findSetEnd = (open, close) => {
    let setCount = 1;
    let args = [];

    // Check if in a Set of Parentheses
    while(setCount != 0){
      let oldToken = token;
      advance(1);

      // Check if at End of Character
      if(!token) errors.expected(close, oldToken.line, oldToken.col);

      // Find if Current Token is a Parenthesis
      if(token.chars === open) setCount++;
      if(token.chars === close) setCount--;

      // Push Current Token into Expression
      if(setCount == 0) break;
      args.push(token);
    }
    return args;
  }


  /********** Loop Over all Tokens **********/
  while(token){

    // Find the End of the Line
    end = tokens.slice(index).findIndex(a => a.chars === ';')+index;
    if(end - index == -1) end = -1;

  /****** Set Variable ******/
    if(token.lexeme == 'identifier'){

      // Set and Retrieve Basic Information
      currInstruction.instruction = 'setvar';
      advance(1);

      currInstruction.name = token.chars;
      parseFuncs.varbs(token.chars, token.line, token.chars);
      advance(1);

      // Add to Instructions
      if(token.chars != '=') errors.expected('=', token.line, token.col);
      
      currInstruction.expression = parseFuncs.stack(tokens.slice(index+1, end));
      if(!currInstruction.expression[0]){
        errors.valueNotFound(currInstruction.name, token.line, token.col);
      }

      currInstruction.type = 'math';
      if(currInstruction.expression.find(a => a.lexeme === 'string')){
        currInstruction.type = 'string';
      }
      
      addInstruction(true);
    }
    

  /******* Call or Edit Variables *******/
    else if(token.lexeme == 'variable'){

      // Set and Retrieve Basic Information
      let thisVar = token.chars;
      parseFuncs.varbs(token.chars, token.line, token.chars);
      advance(1);

      // Call a Function
      if(token.chars === '('){

        // Find End of Statement
        let expression = findSetEnd('(', ')');

        currInstruction.args = parseFuncs.argms(expression);

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
        currInstruction.expression = parseFuncs.stack(expression);
      
      // Operator Assigments
      } else if(token.chars.match(/[\+\-\*\/]/)){
        let thisOperator = token.chars;
        
        currInstruction.instruction = 'operate';
        currInstruction.name = thisVar;
        currInstruction.expression = parseFuncs.stack(tokens.slice(index+1, end));
        currInstruction.operator = thisOperator;
      } else {
        advance(-1);
        errors.unexpToken(token.chars, token.line, token.col);
      }
      addInstruction(true);
    }


  /******* Print an Expression *******/
    else if(token.chars == 'print'){

      // Retrieve and set Basic Information
      currInstruction.instruction = token.chars;
      advance(1);
      if(token.chars != '(') errors.expected('(', token.line, token.col);

      // Find End of Statement
      let expression = findSetEnd('(', ')');

      if(expression.find(a => a.lexeme === 'string')){
        currInstruction.type = 'string';
      } else {
        currInstruction.type = 'math';
      }
      currInstruction.expression = parseFuncs.stack(expression);

      addInstruction(true);
    }

    
  /******* Input *******/
    else if(token.chars === 'input') {
      currInstruction.instruction = 'input';
      advance(1);
      if(token.chars != '(') errors.expected('(', token.line, token.col);

      let args = parseFuncs.argms(findSetEnd('(', ')'));
      currInstruction.expression = parseFuncs.stack(args[0]);
      currInstruction.variable = parseFuncs.chars(args[1]);
      addInstruction();
    }
    

  /******* For Loops *******/
    else if(token.chars == 'for' && token.lexeme === 'keyword'){
      advance(1);
      if(token.chars != '('){
        advance(-1);
        errors.expected('(', token.line, token.col);
      }

      let oldIndex = index;
      let varName;
      let forArgs = findSetEnd('(', ')');

      // Takes Essential Parts of Statement
      let last = forArgs.findIndex(a => a.chars === 'as' && a.lexeme === 'connector');
      last = last == -1 ? 0 : last;

      let connector = forArgs.findIndex(a => a.chars === 'to' && a.lexeme === 'connector');
      if(connector == -1) errors.expected('to', token.line, token.col);
      
      let forStart = forArgs.slice(0, connector);
      let forEnd = !last ?  forArgs.slice(connector+1) : forArgs.slice(connector+1, last);

      if(last) varName = parseFuncs.varbs(forArgs[last+1] ? forArgs[last+1].chars : '', token.line, token.col);
      
      if(!forStart[0]) errors.expectedLiteral('a starting value', token.line, token.col);
      if(!forEnd[0]) errors.expectedLiteral('an ending value', token.line, token.col);

      // Checks for Variable Counter
      if(varName){
        currInstruction.instruction = 'setvar';
        currInstruction.name = varName;
        currInstruction.type = 'math';
        currInstruction.expression = parseFuncs.stack(forStart);
        addInstruction();
      }
      advance(1);

      // Looks for What is Inside the For Loop
      if(token.chars != '{'){
        advance(-1);
        errors.expected('{', token.line, token.col); 
      }

      // Add the Instructions to Array
      let forInstructions = parser(findSetEnd('{', '}'));

      if(varName){
        forInstructions.push({
          instruction: 'operate',
          name: varName,
          expression: parseFuncs.stack([{ lexeme: 'number', chars: 1 }]),
          operator: '+'
        });
      }
      currInstruction.instruction = 'loop';
      currInstruction.start = parseFuncs.stack(forStart);
      currInstruction.end = parseFuncs.stack(forEnd);
      currInstruction.instructions = forInstructions;
      addInstruction();
    }


  /******* Functions *******/
    else if(token.chars === 'func' && token.lexeme === 'keyword'){
      advance(1);

      if(token.lexeme !== 'variable'){
        errors.fnName(token.line, token.col);
      }
      let fnName = parseFuncs.varbs(token.chars, token.line, token.col);
      advance(1);
      if(token.chars !== '(' || token.lexeme !== 'separator'){
        advance(-1);
        errors.expected('(', token.line, token.col);
      }

      let fnArgs = parseFuncs.argms(findSetEnd('(', ')'));
      advance(1);
      
      if(token.chars !== '{'){
        advance(-1);
        errors.expected('{', token.line, token.col);
      }

      let fnInstructions = parser(findSetEnd('{', '}'));

      currInstruction.instruction = 'createFn';
      currInstruction.name = fnName;
      currInstruction.args = fnArgs;
      currInstruction.instructions = fnInstructions;
      addInstruction(); 
    }


  /******* If Statements *******/
    else if(token.chars === 'if' && token.lexeme === 'keyword'){
      advance(1);
      if(token.chars !== '(' && token.lexeme === 'separator'){
        advance(-1);
        errors.expected('(', token.line, token.col);
      }
      let ifArgs = findSetEnd('(', ')');

      advance(1);
      if(token.chars !== '{' && token.lexeme === 'separator'){
        advance(-1);
        errors.expected('{', token.line, token.col);
      }
      let ifInstructions = parser(findSetEnd('{', '}'));

      currInstruction.instruction = 'if';
      currInstruction.comparison = ifArgs;
      currInstruction.instructions = ifInstructions;
      addInstruction();
    }

    else if(token.chars === 'while' && token.lexeme === 'keyword'){
      advance(1);
      if(token.chars !== '(' && token.lexeme === 'separator'){
        advance(-1);
        errors.expected('(', token.line, token.col);
      }
      let whileArgs = findSetEnd('(', ')');

      advance(1);
      if(token.chars !== '{' && token.lexeme === 'separator'){
        advance(-1);
        errors.expected('{', token.line, token.col);
      }
      let whileInstructions = parser(findSetEnd('{', '}'));
    
      currInstruction.instruction = 'while';
      currInstruction.comparison = whileArgs;
      currInstruction.instructions = whileInstructions;
      addInstruction();
    }

    advance(1); // At end of each Loop
  }

  return instructions;
}

module.exports = parser;