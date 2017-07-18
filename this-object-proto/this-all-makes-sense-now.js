// ========= //
// Call-site //
// ========= //

// The call-site refers to the place in the program that a function is
// called. This is not the same as where the function is declared.

// Sometimes finding the call-site is easy, but sometimes it can be difficult with
// complex code structures. Using the call-stack makes it easier to find the
// call-site.

/*
function baz() {
  // call-stack is:   `baz`
  // so our call-site is in the global scope

  console.log( "baz" );
  bar(); // <-- call-site for `bar`
}

function bar() {
  // call-stack is: `baz` -> `bar`
  // so, our call-site is in `baz`

  console.log( "bar" );
  foo(); // <-- call-site for `foo`
}

function foo() {
  // call-stack is: `baz` -> `bar` -> `foo`
  // so, our call-site is in `bar`

  console.log( "foo" );
}

baz(); // <-- call-site for `baz`
*/

// ================= //
// Nothing But Rules //
// ================= //

// There are 4 rules that determine the binding of the `this` variable.

// Default Binding
// ===============

// This rule applies when none of the other rules apply.

/*
function foo() {
  console.log( this.a );
}

var a = 2;

foo(); // 2
*/

// Global variables are properties of the global object. Because `foo` is called
// from the global object and none of the other rules apply to the binding of
// `this`, this points to the global object.

// Note: Strict mode makes the global object unavailable for `this` binding.

// Implicit Binding
// ================

// Does the call-site have a 'containing' object? AKA, is the function called as
// a property of an object? `this` will be bound to this 'containing' object.

function foo() {
  console.log( this.a );
}

var obj = {
  a: 2,
  foo: foo
};

obj.foo(); // 2

// In a reference chain, only the last level counts for `this` binding.

function foo() {
  console.log( this.a );
}

var obj2 = {
  a: 42,
  foo: foo
};

var obj1 = {
  a:2,
  obj2: obj2
};

obj1.obj2.foo();

// Implicitly Lost

// Sometimes this implicit binding can be lost and will fall back to the default
// binding.

function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
  foo: foo
};

var bar = obj.foo; // function reference/alias!

var a = "oops, global"; // `a` property also on global object

bar(); // "oops, global"

// In this case, calling `foo` from `bar` changes the call-site from the `obj`
// object to the global object.

function foo() {
  console.log( this.a );
}

function doFoo(fn) {
  // `fn` is just another reference to `foo`

  fn(); // <-- call-site!
}

var object = {
  a: 2,
  foo: foo
};

var a = "oops, global"; // `a` also property on global object

doFoo( obj.foo ); // "oops, global"

// In this case, passing `foo` into `doFoo` changes the call-site, even if we have
// previously implicitly bound `this` to `obj`

function foo() {
  console.log( this.a );
}

var obj = {
  a: 2,
  foo: foo
};

var a = "oops, global"; // `a` also property on global object

setTimeout( obj.foo, 100 ); // "oops, global"

// Once again, calling `foo` from within another function changed the call-site.
// For example, this pseudocode implementation of `setTimeout`

function setTimeout(fn,delay) {
  // wait (somehow) for `delay` milliseconds
  fn(); <-- call-site!
}

// Sometimes, functions from libraries will intentionally change the `this` binding
// in an attempt to be 'helpful'! Either way, you don't have control of where
// `this` is pointing.

// Explicit Binding
// ================

// The methods call(..) and apply(..) can be used to force `this` to point towards
// a specific object. The object you want to point to is taken as the first
// parameter of both functions.

function foo() {
  console.log( this.a );
}

var obj = {
  a: 2
};

foo.call( obj ); // 2

// This isn't enough, however, to totally eradicate `this` 'losing' its binding.

// Hard Binding

// But there is a version of explicit binding that will do just that!

function foo() {
  console.log( this.a );
}

var obj = {
  a: 2
};

var bar = function() {
  foo.call( obj )
};

bar(); // 2

// `bar` hard binds `foo`'s `this` to `obj`
// so that it cannot be overriden
bar.call( window ); // 2

// No matter what happens when calling `bar` it will always call `foo` with its
// `this` bound to the object you want.

// A pass-through function can be created to create an explicit, hard binding
// of `this`.

function foo(something) {
  console.log( this.a, something );
  return this.a + something;
}

var obj = {
  a: 2
};

var bar = function() {
  return foo.apply( obj, arguments );
};

var b = bar( 3 ); // 2 3
console.log( b ); // 5

// Or a reusable helper function:

function foo(something) {
  console.log( this.a, something );
  return this.a + something;
}

// simple `bind` helper
function bind(fn, obj) {
  return function() {
    return fn.apply( obj, arguments );
  };
}

var obj = {
  a: 2
};

var bar = bind( foo, obj );

var b = bar( 3 ); // 2 3
console.log( b ); // 5

// In fact... there's a built-in utility to do exactly that.

function foo(something) {
  console.log( this.a, something );
  return this.a + something;
}

var obj = {
  a: 2
};

var bar = foo.bind( obj );

var b = bar( 3 ); // 2 3
console.log( b ); // 5

// API Call "Contexts"

// Some built-in functions allow for an additional parameter to set the binding
// of `this` in a similar way to `bind` or call(..) or apply(..)

function(el) {
  console.log( el, this.id );
}

var obj = {
  id: "awesome"
};

// use `obj` as `this` for `foo(..)` calls
[1, 2, 3].forEach( foo, obj ); // 1 awesome 2 awesome 3 awesome
