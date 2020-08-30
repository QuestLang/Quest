# Quest
A high-level interpreted programming language for the future. Written in Node.JS, soon rewriting in Julia, C, or C++
[![Run on Repl.it](https://repl.it/badge/github/QuestLang/Quest)](https://repl.it/@QuestLang/Quest#index.js)
***
Created by [Sean Lange](https://spicedspices.repl.co) and Bruhmley
***
Quest introduces a new style of programming. Although from the start, it may look like a simple general purpose programming language, as you look deeper into the language, you will find out that it is much more than that.

Quest is a super object-oriented programming language, almost everything in quest is an object, this allows for users to easily edit any variable or value to their need. This simple feature allows for so much more in the field of programming.
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
***
##### Operations
* All Operators: +, -, *, /, ^, %
* How to Use: `a + b` is the same as `a = a + b`
***
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
***
##### Comparisons
All comparisons are strictly typed: `'3' does not equal 3`
* `a = b` means a is equal to b 
* `a ! b` means a is not equal to b
* `a > b` means a is greater than b
* `a < b` means a is less than b
* `a >= b` means a is greater or equal to b
* `a <= b` means a is less than or equal to b
***
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