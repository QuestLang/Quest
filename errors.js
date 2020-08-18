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
const valueNotFound = (name, line, col) => {
  throw new Error('Quest Syntax Error: value for variable ' + name + ' was not found at line ' + line + ' at column ' + col);
}
const unexpToken = (token, line, col) => {
  throw new Error('Quest Syntax Error: unexpected token \'' + token + '\' at line ' + line + ' at column ' + col);
}

module.exports = {
  expected,
  expectedLiteral,
  fnName,
  variableNotFound,
  valueNotFound,
  unexpToken
}