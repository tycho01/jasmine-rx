var Rx = require('rxjs');
var rxit = require('./rxit.js');

function RxExpect(observable)
{
	this.observable = observable;
}
function RxExpectSome(observable)
{
	this.observable = observable;
}
// define all the jasmine expect functions
["toThrow","toBe","toBeDefined","toBeFalsy","toBeGreaterThan","toBeLessThan","toBeNull","toBeTruthy","toBeUndefined","toContain","toContain","toEqual","toMatch"].forEach(function(name)
{
	RxExpect.prototype[name] = function()
	{
		var args = arguments;
		return this.observable.doOnNext(function(value)
		{
			var e = expect(value);
			e[name].apply(e,args);
		});
	};
	RxExpectSome.prototype[name] = function()
	{
		var args = arguments;
		return this.observable.some(function(value)
		{
			return jasmine.matchers[name]().compare(value,args[0]).pass;
		}).doOnNext(function(v)
		{
			expect(v).toBe(true);
		});
	};
});
RxExpect.prototype.toBeArrayOfObjects = function()
{
	return this.observable.doOnNext(function(value)
	{
		expect(value).toEqual(jasmine.any(Array));
	}).doOnNext(function(arr)
	{
		arr.forEach(function(value){ expect(value).toEqual(jasmine.any(Object)); });
	});
}
RxExpect.prototype.toBeArray = function()
{
	return this.observable.doOnNext(function(value)
	{
		expect(value).toEqual(jasmine.any(Array));
	});
}
RxExpect.prototype.toBeObject = function()
{
	return this.observable.doOnNext(function(value)
	{
		expect(value).toEqual(jasmine.any(Object));
	});
}
// this is a strict number check
RxExpect.prototype.toBeNumber = function()
{
	return this.observable.doOnNext(function(value)
	{
		expect(value).toEqual(jasmine.any(Number));
	});
}
// this one will also comply with strings with only numbers
RxExpect.prototype.toBeNumberLike = function()
{
	return this.observable.doOnNext(function(value)
	{
		expect(parseInt(value) == value).toEqual(true);
	});
}
RxExpect.prototype.toBeString = function()
{
	return this.observable.doOnNext(function(value)
	{
		expect(value).toEqual(jasmine.any(String));
	});
}
RxExpect.prototype.toBeBoolean = function()
{
	return this.observable.doOnNext(function(value)
	{
		expect(value).toEqual(jasmine.any(Boolean));
	});
}
RxExpect.prototype.toBeTrue = function()
{
	return this.observable.doOnNext(function(value)
	{
		expect(value).toEqual(true);
	});
}
RxExpect.prototype.toBeUri = function()
{
	return this.observable.doOnNext(function(value)
	{
		expect(value.toLowerCase()).toMatch('^https?://');
	});
}

Rx.Observable.prototype.expect = function()
{
	if (arguments.length > 0)
		return new RxExpect(this.pluck.apply(this,arguments));
	return new RxExpect(this);
}
Rx.Observable.prototype.expectSome = function()
{
	if (arguments.length > 0)
		return new RxExpectSome(this.pluck.apply(this,arguments));
	return new RxExpectSome(this);
}
Rx.Observable.prototype.fallthrough = function()
{
	return this.catch(function(error)
	{
		return Rx.Observable.just(error);
	});
}
Rx.Observable.prototype.properties = function()
{
	return this.concatMap(function(value)
	{
		return Rx.Observable.from(Object.keys(value).map(function(key){ return {key: key, value: value[key]} }));
	});
}
Rx.Observable.prototype.log = function()
{
	return this.doOnNext(function(value)
	{
		console.log(value);
	});
}
Rx.Observable.prototype.iterate = function()
{
	return this.concatMap(function(arr){ return Rx.Observable.from(arr); });
}
describe("Rx.Observable.expect",function()
{
	rxit("should expose jasmine functions on observables",
		function()
		{
			var s = new Rx.AsyncSubject();
			s.next({headers:{allow:'GET,PUT'}});
			s.complete();
			return s.pluck('headers','allow').expect().toMatch(/GET/);
		}
	);
	rxit("should support plucking values",
		function()
		{
			var s = new Rx.AsyncSubject();
			s.next({headers:{allow:'GET,PUT'}});
			s.complete();
			return s.expect('headers','allow').toMatch(/GET/);
		}
	);
});
describe("Rx.Observable.fallthrough",function()
{
	rxit("Should silently propagate error if any",
		function()
		{
			var s = new Rx.AsyncSubject();
			s.next({headers:{allow:'GET,PUT'}});
			s.complete();
			return s.map(function(v){ throw v; }).fallthrough().pluck('headers','allow').expect().toMatch(/GET/);
		}
	);
});
describe("Rx.Observable.iterate", function()
{
	rxit("should iterate over each array in the observable",function()
	{
		var s = new Rx.AsyncSubject();
		var total = 0;
		s.next([1,2,3,4]);
		s.complete();
		return s.iterate().reduce(function(acc,value){return acc+value},0).expect().toBe(10);
	});
	it("should fail if the value is not an array",function()
	{
		var s = new Rx.Subject();
		var total = 0;
		s.iterate().subscribe(function(value){ total += value; });
		expect(function(){s.next(1)}).toThrow();
		s.complete();
	});
})
describe("Rx.Observable.expectSome",function()
{
	rxit("should only expect 1 item in the stream to comply",function()
	{
		var s = new Rx.AsyncSubject();
		var total = 0;
		s.next([1,2,3,4]);
		s.complete();
		return s.iterate().expectSome().toBe(3);
	});
});

module.exports = Rx.AsyncSubject;
