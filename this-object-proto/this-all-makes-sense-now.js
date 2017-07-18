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
  fn(); // <-- call-site!
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

function foo(el) {
  console.log( el, this.id );
}

var obj = {
  id: "awesome"
};

// use `obj` as `this` for `foo(..)` calls
[1, 2, 3].forEach( foo, obj ); // 1 awesome 2 awesome 3 awesome

// `new` Binding
// =============

// While the `new` call looks almost exactly like a constructor call from OO 
// language, it is not the same. In fact, a function called with `new` is exactly
// that: a function called with `new` that is hijacked by the functionality
// built into `new`. It is not a constructor, it is instead a "constructor
// call."

// Calling a function with `new` creates a new object that is prototype-linked.
// The `this` keyword is automatically pointed towards this newly created object,
// and unless the function returns an object itself, this new object is returned.

function foo(a) {
  this.a = a;
}

var bar = new foo( 2 );
console.log( bar.a ); // 2

// =================== //
// Everything in Order //
// =================== //

// These four rules follow an order of precedence in the case that multiple rules
// apply. Default binding holds the lowest priority. Let's explore the rest.

// Implicit or Explicit?

function foo() {
  console.log( this.a );
}

var obj1 = {
  a: 2,
  foo: foo
};

var obj2 = {
  a: 3,
  foo: foo
};

obj1.foo(); // 2
obj2.foo(); // 3

obj1.foo.call( obj2 ); // 3
obj2.foo.call( obj1 ); // 2

// This shows that in a case of both implicit and explicit binding, explicit binding
// takes priority. And what about `new` binding?

function foo(something) {
  this.a = something;
}

var obj1 = {
  foo: foo
};

var obj2 = {};

obj1.foo( 2 );
console.log( obj1.a ); // 2

obj1.foo.call( obj2, 3 ); 
console.log( obj2.a ); // 3

var bar = new obj1.foo( 4 );
console.log( obj1.a ); // 2
console.log( bar.a ); // 4

// `new` binding overrides implicit binding. And explicit binding? Well, `new` and
// apply(..)/call(..) cannot be used at the same time, but we can test `new` against
// hard binding.

function foo(something) {
  this.a = something;
}

var obj1 = {};

var bar = foo.bind( obj1 );
bar( 2 );
console.log( obj1.a ); // 2

var baz = new bar( 3 );
console.log( obj1.a ); // 2
console.log( baz.a ); // 3

// As you can see, using `new` to create an object does not maintain the hard
// binding we created. `this` now points elsewhere.

// So, in order of precedence:

// 1. `new` Binding
// 2. Explicit Binding
// 3. Implicit Binding
// 4. Default Binding

// ================== //
// Binding Exceptions //
// ================== //

// Ignored `this`
// ==============

// There are some exceptions to every rule. For instance, passing `null` or
// `undefined` to call(..), apply(..) or bind(..) will result in `this` following
// the default binding rule. In most of these cases, `this` binding doesn't really
// matter anyways...

function foo(a,b) {
  console.log( "a:" + a + ", b:" + b );
}

// spreading out array as parameters
foo.apply( null, [2, 3] ); // a:2, b:3

// currying with `bind(..)`
var bar = foo.bind( null, 2 );
bar ( 3 ); // a:2, b:3

// In both of these cases, the helper function expects a `this` binding as the first
// argument. In this case, when it doesn't matter, `null` seems as good as anything
// else. But there are some gotchas there, especially when using third-party
// libraries. There's a safer way to throw away that binding.

// Safer `this`

// If we set up an empty, unused object, we can safely point our `this` binding
// towards it and be assured that it will never cause unwanted side effects in
// our program.

function foo(a,b) {
  console.log( "a:" + a + ", b:" + b );
}

// our DMZ empty object
var ø = Object.create(null);

// spreading out array as parameters
foo.apply( ø, [2, 3] ); // a:2, b:3

// currying with `bind(..)`
var bar = foo.bind( ø, 2);
bar ( 3 ); // a:2, b:3

// Indirection
// ===========

// It is possible to (unintentionally) indirectly reference a function, which will
// cause `this` to fall back to the default binding rule.

function foo() {
  console.log( this.a );
}

var a = 2;
var o = { a: 2, foo: foo };
var p = { a: 4 };

o.foo(); // 3
(p.foo = o.foo)(); // 2

// In this case, the reference, though it looks like it is pointing to the `o` 
// object, is actually pointing at the original `foo` because `o.foo` is just
// a reference to the object itself. Thus, default binding applies.

// Softening Binding
// =================

// Hard binding is safe but inflexible. We can build a 'soft binding' utility 
// that allows us to manually change the binding implicitly or explicitly but
// fall back to a default binding of our choice (not the global object!).

if (!Function.prototype.softBind) {
  Function.prototype.softBind = function(obj) {
    var fn = this,
        curried = [].slice.call( arguments, 1 ),
        bound = function bound() {
          return fn.apply(
            (!this ||
              (typeof window !== "undefined" && this === window) ||
              (typeof global !== "undefined" && this === global)
            ) ? obj : this,
            curried.concat.apply( curried, arguments)
          );
        };
        bound.prototype = Object.create( fn.prototype );
        return bound;
  };
}

// If `this` points to the global object or undefined, this function sets the binding
// to a specified default object.

function foo() {
  console.log("name: " + this.name);
}

var obj = { name: "obj" },
    obj2 = { name: "obj2" },
    obj3 = { name: "obj3" };
    
var fooOBJ = foo.softBind( obj );

fooOBJ(); // name: obj

obj2.foo = foo.softBind(obj);
obj2.foo(); // name: obj2    <---- look!!!

fooOBJ.call( obj3 ); // name: obj3    <---- look!

setTimeout( obj2.foo, 10 ); // name: obj    <---- falls back to soft-binding

// ============== //
// Lexical `this` //
// ============== //

// ES6 adds a kink to our nicely defined `this` rules... Meet the arrow function.
// A function declared in this way automatically binds its `this` to the enclosing
// scope's `this`, even if that's the global scope.

function foo() {
  // return an arrow function
  return (a) => {
    // `this` here is lexically adopted from `foo()`
    console.log( this.a );
  };
}

var obj1 = {
  a: 2
};

var obj2 = {
  a: 3
};

var bar = foo.call( obj1 );
bar.call( obj2 ); // 2, not 3!

// In this case, the arrow function inside of `foo()` takes its this binding from
// `foo()` at call-time. There is no way to override this binding. 

// This will likely be most useful for callback functions.

function foo() {
  setTimeout(() => {
    // `this` here is lexically adopted from `foo()`
    console.log( this. a);
  },100);
}

var obj = {
  a: 2
};

foo.call( obj ); // 2

// This ties binding to lexical scope, which as we discussed previously, is a 
// common misconception as to how `this` works. Except now `this` works that 
// way... sometimes. This is basically a way of adopting the common hack using `self`.

function foo() {
  var self = this; // lexical capture of `this`
  setTimeout( function() {
    console.log( self.a );
  }, 100 );
}

var obj = {
  a: 2
};

foo.call( obj ); // 2






