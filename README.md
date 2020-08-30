# Quest
A high-level interpreted programming language for the future. Written in Node.JS, soon rewriting in Julia, C, or C++
[![Run on Repl.it](https://repl.it/badge/github/QuestLang/Quest)](https://repl.it/@QuestLang/Quest#index.js)
***
Created by [Sean Lange](https://spicedspices.repl.co) and Bruhmley
***
### Basics
Semicolons are _optional_ but highly recommended
* Comments
```
// This is a comment //
```
* Print: 
```
print('this is a print statement');
```
* Variables: 
```
var a = 3;
var b = 'Test string';
const c = 'This is a constant';
```
* Concatenation: 
```
print('variable a is &a');
```
* Constants: 
```
const a = 3;
```
***
##### Operations
* For Loops: 
```
for(1 to 10){
  print('in a loop');
}
for(10 to 1){
  print('in a descending loop');
}
for(1 to 10 as i){
  print('looped &i  times');
}
```
* If Statements:
```
if(a ! b){
  a = b;
}
```
* While Loops:
```
while(a > b){
  b * 2;
}
```