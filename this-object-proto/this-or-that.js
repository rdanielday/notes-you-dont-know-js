// =============== //
// `this` or That? //
// =============== //

// Why `this`?
// ===========

// `this` is known to be a very confusing mechanism in JS. Let's first demonstrate
// why it is useful.

/*
function identify() {
  return this.name.toUpperCase();
}

function speak() {
  var greeting = "Hello, I'm " + identify.call( this );
  console.log( greeting );
}

var me = {
  name: "Kyle"
};

var you = {
  name: "Reader"
};

identify.call( me );
identify.call( you );

speak.call( me );
speak.call( you );
*/

// With the `this` keyword, we can use the two functions in different contexts.
// Of course, you could manually pass that context into the function...

/*
function identify(context) {
  return context.name.toUpperCase();
}

function speak(context) {
  var greeting = "Hello, I'm " + identify( context );
  console.log( greeting );
}

identify( you );
speak( me );
*/

// ...however using `this` leads to cleaner and more reusable code.

// Confusions
// ==========

// 1. Itself

// Some think `this` refers back to the function itself into order to allow an
// easy form of recursion or the ability to store state between function calls.
// This is not accurate, as illustrated below:

/*
function foo(num) {
  console.log( "foo: " + num );

  this.count++;
}

foo.count = 0;

var i;

for (i=0; i<10; i++) {
  if (i > 5) {
    foo( i );
  }
}

// how many times was 'foo' called?
console.log( foo.count );
*/

// foo.count remains 0 because `this` is not pointing at the function object.
// This result often leads to the creation of hacks to get around the misidentified
// `this` functionality, ignoring `this` entirely.

/*
function foo(num) {
  console.log( "foo: " + num );

  data.count++;
}

var data = {
  count: 0
};

var i;
for (i=0; i<10; i++) {
  if (i > 5) {
    foo( i );
  }
}

// how many times was 'foo' called?
console.log( data.count );
*/

// This makes use of lexical scope instead of facing `this` directly.
// `this` is not the proper tool for self-identifying a function. A variable pointing
// to the function is needed.

/*
function foo() {
  foo.count = 4; // 'foo' refers to itself
}

setTimeout( function(){
  // anonymous function (no name), cannot refer to itself
}, 10);
*/

// So a similar implementation can be used to our first version, only using the
// variable pointing to the function instead of `this`

/*
function foo(num) {
  console.log( "foo: " + num );

  // keep track of how many times 'foo' is called
  foo.count++;
}

foo.count = 0;

var i;
for (i=0; i<10; i++) {
  if (i > 5) {
    foo( i );
  }
}

// how many times was 'foo' called?
console.log( foo.count );
*/

// Once again, this works but totally avoids `this`

// It is also possible to force `this` to point to 'foo'

/*
function foo(num) {
  console.log( "foo: " + num );

  // keep track of how many times 'foo' is called
  // Note: `this` IS actually 'foo' now, based on how 'foo' is called (see below)
  this.count++
}

foo.count = 0;

var i;
for (i=0; i<10; i++) {
  if (i > 5) {
    // using 'call(..)', we ensure the `this`
    // points at the function object ('foo') itself
    foo.call( foo, i );
  }
}

// how many times was 'foo' called?
console.log( foo.count );
*/

// This version embraces `this`!

// 2. Its Scope

// It is also commonly thought that `this` refers to the function's scope. In one
// sense this is true, but it does not point to the lexical scope, which is not
// accessible as an object.

/*
function foo() {
  var a = 2;
  this.bar();
}

function bar() {
  console.log( this.a );
}

foo();
*/

// `this` does not create a bridge between the scopes of the two functions. There is,
// in fact, no way to create such a bridge.

// What's `this`?
// ==============

// `this` is a runtime binding that refers to the execution context of the function.
// It is tied to where and how the function was called.
