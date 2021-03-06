#Jasmine-Rx

Jasmine-rx allows you to return [Rx's observables](https://github.com/Reactive-Extensions/RxJS) in rxit() functions.

```javascript
describe("integer observable",function()
{
	rxit("should return integers",function()
	{
		return getIntegerObservable().doOnNext(function(value)
		{
			expect(value).toEqual(jasmine.any(Number));
		});
	});
});
```

## For whom

If you have no idea what Rx is, or what observables are, this is probably not for you. In case you are wondering, Observables are like Promises, but instead of returning just 1 value, they can return multiple values. Essentially they are push-bases collections. Rx makes it interesting by combining Observables with functional programming, allowing you to run the familiar `map`, `filter`, `concat`, `zip` and others on them.

## Why

Because jasmine has lousy support for async testing and we are using observable everywhere.

## Installation

	$ npm install jasmine-rx


## Shorthand-form

When you use the TestableObservable you can use the shorthand form:

```javascript
describe("integer observable",function()
{
	rxit("should return integers",function()
	{
		return getIntegerObservable().expect().toEqual(jasmine.any(Number));
	});
});
```

Here `expect()` works the same `pluck()` in Rx. So if your observable returns objects instead (e.g. `{value:3}`), you can do the following:

```javascript
describe("object observable",function()
{
	rxit("should return objects where the value are integers",function()
	{
		return getObjectObservable().expect('value').toEqual(jasmine.any(Number));
	});
});
```

## Use cases

An excellent use-case would be api-testing. In fact, that is why I wrote it. Here is some of our raw code:

```javascript
describe("/ endpoint",function()
	{
	rxit("should allow GET request", function()
	{
		return backend.invoke('/Api/v1/product',{method:'OPTIONS'}).expect('headers','allow').toMatch(/GET/);
	});
	rxit("should return unauthorized when no credentials", function()
	{
		return backend.invoke('/Api/v1/product',{method:'GET'}).fallthrough().expect('status').toBe(401);
	});
	rxit("should return a payload with products", function()
	{
		return backend.auth().invoke('/Api/v1/product',{method:'GET'})
			.doOnNext(function(result)
			{
				expect(result.status).toBe(200);
				expect(result.payload.products).toEqual(jasmine.any(Array));
			});
	});
});
```

Where `backend.invoke()` is a wrapper around `http.request` that returns a TestableObservable.

## rxit

```javascript
var rxit = require('jasmine-rx').rxit;
```

The cornerstone function that integrates with jasmine.

## TestableObservable

```javascript
var TestableObservable = require('jasmine-rx').TestableObservable;
```

Extends the `Rx.AsyncSubject` with some helper functions.

### TestableObservable API

Look in the source for `jasmine-observe.js` for the latest stuff.

- `expect()`
	Acts as pluck, requires a chained-call to any of the normal jasmine matchers, or the custom ones defined in `jasmine-observe.js` (see below)

- `expectSome()`
	Same as expect, but only requires one value in the observable to pass the matcher.  

- `fallthrough()`
	In case the observable throws an exception, this will catch it and propagate it as a normal value in the observable.  

- `properties()`
	Maps each key/value pair from each object in the observable to an object {key: .., value: ..} and inserts that into the observable, allowing you to iterate over object keys or values.

- `log()`
	calls `console.log()` on every item in the observable.

- `iterate()`
	Maps an observable of arrays to an observable of items in the arrays.

After a call to `expect()` or `expectSome()`, in addition to the normal jasmine-matches you also get:

- toBeArrayOfObjects  
- toBeArray  
- toBeObject  
- toBeNumber  
- toBeNumberLike  
- toBeString  
- toBeBoolean  
- toBeTrue  
- toBeUri

## Contribution

Stuff is pretty simple - just 2 files - so contribution-threshold is pretty low. You do need bitbucket to create pull-requests.

## Todo

- Jasmine timeouts. Some operations just take longer than 5 sec. Need a nice way to temporarily set a different timeout.