const errors = require('./errors');
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

  // Find End of Set
  const findSetEnd = (open, close) => {
    let setCount = 1;
    let args = [];

    // Check if in a Set
    while(setCount != 0){
      let oldToken = token;
      advance(1);

      // Check if at End of Character
      if(!token) errors.expected(close, oldToken.line, oldToken.col);

      // Find if Current Token is a Set
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
      let setTokens = tokens.slice(index+1, end);
      if(token.chars != '=') errors.expected('=', token.line, token.col);
      
      currInstruction.type = 'math';
      if(setTokens.find(a => a.lexeme === 'string')){
        currInstruction.type = 'string';
      }

      currInstruction.expression = parseFuncs.stack(setTokens, currInstruction.type);
      if(!currInstruction.expression[0]){
        errors.valueNotFound(currInstruction.name, token.line, token.col);
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
        currInstruction.expression = parseFuncs.stack(tokens.slice(index+1, end), 'math');
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
      currInstruction.expression = parseFuncs.stack(expression, currInstruction.type);

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
          expression: parseFuncs.stack([{ lexeme: 'number', chars: 1 }], 'math'),
          operator: '+'
        });
      }
      currInstruction.instruction = 'loop';
      currInstruction.start = parseFuncs.stack(forStart, 'math');
      currInstruction.end = parseFuncs.stack(forEnd, 'math');
      currInstruction.instructions = forInstructions;
      addInstruction();
    }

  /******* Random *******/
    else if(token.chars === 'random' && token.lexeme === 'keyword'){
      advance(1);
      if(token.chars !== '(' || token.lexeme !== 'separator'){
        advance(-1);
        errors.expected('(', token.line, token.col);
      }

      let randArgs = parseFuncs.argms(findSetEnd('(', ')'));
      if(!randArgs[0]) errors.expectedLiteral('a minimum range', token.line, token.col);
      if(!randArgs[1]) errors.expectedLiteral('a maximum range', token.line, token.col);
      if(!randArgs[2]) errors.expectedLiteral('a variable', token.line, token.col);
      
      let min = parseFuncs.stack(randArgs[0]);
      let max = parseFuncs.stack(randArgs[1]);
      let settingVar = randArgs[2][0].chars;

      currInstruction.instruction = 'random';
      currInstruction.min = min;
      currInstruction.max = max;
      currInstruction.name = settingVar;
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
      for(let i=0; i<fnArgs.length; i++) fnArgs[i] = fnArgs[i][0].chars;
      
      if(token.chars !== '{'){
        advance(-1);
        errors.expected('{', token.line, token.col);
      }

      let fnInstructions = parser(findSetEnd('{', '}'));

      currInstruction.instruction = 'createFn';
      currInstruction.name = fnName;
      currInstruction.parameters = fnArgs;
      currInstruction.instructions = fnInstructions;
      addInstruction(); 
    }

  /******* Return Value *******/
    else if(token.chars === 'return' && token.lexeme === 'keyword'){
      currInstruction.instruction = 'return';
      let type = 'math';
      if(tokens.slice(index+1, end).find(a => a.lexeme === 'string')){
        type = 'string';
      }
      currInstruction.value = parseFuncs.stack(tokens.slice(index+1, end), type);
      addInstruction(true);
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
  
  /******* While Loops *******/
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