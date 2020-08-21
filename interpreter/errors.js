const expected = (message, line, col) => {
  throw new Error('Quest Syntax Error: expected \'' + message + '\' at line ' + line + ' at column '  + col);
}
const expectedLiteral = (message, line, col) => {
  throw new Error('Quest Syntax Error: expected ' + message + ' at line ' + line + ' at column '  + col);
}
const fnName = (line, col) => {
  throw new Error('Quest Syntax Error: missing function name at line ' + line + ' at column ' + col);
}
const variableNotFound = (name) => {
  throw new Error('Quest Syntax Error: variable ' + name + ' is not assigned');
}
const functionNotFound = (name) => {
  throw new Error('Quest Syntax Error: function ' + name + ' is not assigned');
}
const valueNotFound = (name, line, col) => {
  throw new Error('Quest Syntax Error: value for variable ' + name + ' was not found at line ' + line + ' at column ' + col);
}
const unexpToken = (token, line, col) => {
  throw new Error('Quest Syntax Error: unexpected token \'' + token + '\' at line ' + line + ' at column ' + col);
}

const reassignConst = (name, line, col) => {
  throw new Error('Quest Variable Error: constant ' + name + ' was reassigned at line ' + line + ' at column ' + col);
}
const unavailableVar = (name, line, col) => {
  throw new Error('Quest Variable Error: variable ' + name + ' can only have alphanumeric characters at line ' + line + ' at column ' + col);
}
const numericVar = (name, line, col) => {
  throw new Error('Quest Variable Error: variable ' + name + ' must start with an alphabetic character at line ' + line + ' at column ' + col);
}

const noNegative = (name) => {
  throw new Error('Quest Runtime Error: function ' + name + ' does not allow a negative parameter');
}

module.exports = {
  expected,
  expectedLiteral,
  fnName,
  variableNotFound,
  functionNotFound,
  valueNotFound,
  unexpToken,
  reassignConst,
  unavailableVar,
  numericVar,
  noNegative
}