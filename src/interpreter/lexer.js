// TOKENS
const OPERATORS = ['+', '-', '*', '/', '%', '^'];
const COMPARERS = ['=', '<', '>', '|', '!'];
const SEPARATORS = [';', '(', ')', '{', '}', '[', ']', ',', "'", '"', '$', '&', '//'];
const KEYWORDS = ['print', 'error', 'input', 'clear', 'func', 'if', 'else', 'for', 'while', 'return', 'break', 'continue', 'server'];
const CONNECTORS = ['of', 'in', 'to', 'and', 'as'];
const IDENTIFIERS = ['bool', 'const', 'var'];
const QUEST = ['end', 'rerun', 'add'];
const ARRAY_PARAMS = ['anyCase', 'any'];

let inString = false, inConcat = false, deepConcat = false, inComment = false;

// Resetting Lines and Columns
function reset(){
  currLine = 0;
  currCol = 0;
  currGroup = '';

  inString = false;
  inConcat = false;
  deepConcat = false
  inComment = false;
}

// TOKEN CREATOR
function newToken(charGroup){
  this.token = { lexeme: '', chars: charGroup }

  if(QUEST.includes(charGroup)){
    this.token.lexeme = 'quest';
  } else if(OPERATORS.includes(charGroup)){
    this.token.lexeme = 'operator';
  } else if(COMPARERS.includes(charGroup)){
    this.token.lexeme = 'comparer';
  } else if(IDENTIFIERS.includes(charGroup)){
    this.token.lexeme = 'identifier';
  } else if(SEPARATORS.includes(charGroup)){
    this.token.lexeme = 'separator';
  } else if(CONNECTORS.includes(charGroup)){
    this.token.lexeme = 'connector';
  } else if(KEYWORDS.includes(charGroup)){
    this.token.lexeme = 'keyword';
  } else if(inString){
    this.token.lexeme = 'string';
  } else if(Number(charGroup) == charGroup){
    this.token.lexeme = 'number';
  } else {
    this.token.lexeme = 'variable';
  }

  currGroup = '';

  this.token.line = currLine;
  this.token.col = currCol-this.token.chars.length;
  return this.token;
}

// LEXER
let currGroup = '';
let currLine = 0;
let currCol = 0;

function lexer(text){
  let tokens = [];
  let charArray = text.split('\n');
  
  for(let chars of charArray){
    currLine++;
    if(!inString) chars = chars.trim();
    if(!chars) continue;

    if(!chars[chars.length-1].match(/[\;{\'\"\[\(\=\|\,\?\:\}]/)){
      if(!inString) chars += ';';
    }
    currCol = 0;
    
    for(let char of chars){
      currCol++;

      if(!inComment){
        // String Methods
        if(char.match(/[\'\"]/)){
          if(currGroup) tokens.push(newToken(currGroup));
          inString = !inString;
          if(inConcat) inConcat = deepConcat = inString = false;
          continue;

        // Concatenation for Strings
        } else if(char.match(/\&/gi)){
          if(currGroup) tokens.push(newToken(currGroup));
          inString = false;
          inConcat = true;

        // Keywords and Variables behind a Space
        } else if(char.match(/\s/gi) && !inString){
          if(currGroup) tokens.push(newToken(currGroup));
          if(inConcat && !deepConcat) inConcat = false, inString = true;
        
        // Comparers
        } else if(COMPARERS.includes(char) && !inString){
          if(currGroup) tokens.push(newToken(currGroup));
          tokens.push(newToken(char));
        
        // Separators
        } else if(SEPARATORS.includes(char) && !inString){
          if(char === '(' && inConcat) deepConcat = true;
          if(char === ')' && deepConcat) deepConcat = false;
          if(currGroup) tokens.push(newToken(currGroup));
          tokens.push(newToken(char));

        // Operators  
        } else if(OPERATORS.includes(char) && !inString){
          if(currGroup && !currGroup.match(/\//g)) tokens.push(newToken(currGroup));
          if(char !== '/'){
            tokens.push(newToken(char));
          } else {
            currGroup += '/';
            if(currGroup === '//'){
              inComment = true;
              currGroup = '';
            }
          }
          
        } else {
          if(currGroup === '/') tokens.push(newToken(currGroup));
          currGroup += char;
        }
      
      // Comments
      } else {
        if(char === '/'){
          currGroup += char;
          if(currGroup === '//'){
            currGroup = '';
            inComment = false;
          }
        } else {
          currGroup = '';
        }
      }
    }
  }
  if(currGroup) tokens.push(newToken(currGroup));
  
  return tokens;
}

module.exports = { lexer, reset };