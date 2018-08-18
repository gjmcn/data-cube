{
	'use strict';

	//action if assertion fails
	const fail = (name, msg) => {
		console.log(`Fail: ${name}` + (msg ? `, ${msg}` : ''));
	};
		
	//assert function f returns a
	const assert = (name, f, a, msg) => {
    let res;
    try { 
      res = f();
    }
    catch (err) { 
      fail(name, `${msg ? msg + ', ' : ''} error thrown`);
      return;
    }
		if (res !== a) fail(name, msg);
	};

	//x is an array of 2-entry arrays: [function, expectedResult]
	assert.each = (name, x, msg) => {
		x.forEach( xi => assert(name, ...xi, msg) );
	};

	//assert function f throws an error
	assert.throw = (name, f) => {
		try {
			f();
		}
		catch (err) {
      return;
    }
		fail(name, `expected error but none thrown`);
	};

	//x is an array of functions
	assert.throwEach = (name, x) => {
		x.forEach( f => assert.throw(name, f) );
	};
  
  //assert x is a valid cube
  const asrtCube = x => {
    const asrtThreeArray = (prop, y) => {
      if (!Array.isArray(y) || y.length !== 3) {
        throw Error(`${prop} is not an array of length 3`);
      }
    };
    if (!Array.isArray(x)) throw Error('not an array');
    if (!x._data_cube) throw Error('_data_cube not truthy');
    const xs = x._s;
    asrtThreeArray('_s', xs);
    for (let i=0; i<3; i++) {
      if (!Number.isInteger(xs[i]) || xs[i] < 0) {
        throw Error(`_s[${i}] not a non-negative integer`);
      }
    }
    if (xs[0] * xs[1] * xs[2] !== x.length) {
      throw Error('shape not consistent with number of entries');
    }
    if ('_k' in x) {
      const xk = x._k;
      asrtThreeArray('_k', xk);
      for (let i=0; i<3; i++) {
        if (xk[i] instanceof Map) {
          if (xk[i].size !== xs[i]) throw Error(`size of _k[${i}] not equal to _s[${i}]`);
          let j = 0;
          for (let v of xk[i].values()) {
            if (v !== j) throw Error(`values of _k[${i}] not 0,1,2,...`);
            j++;  
          }
        }
        else if (xk[i] !== undefined) throw Error(`_k[${i}] neither a map nor undefined`);
      }
    }
    if ('_l' in x) {
      const xl = x._l;
      asrtThreeArray('_l', xl);
      for (let i=0; i<3; i++) {
        if (typeof xl[i] === 'string') {
          if (xl[i] === '') throw Error(`_l[${i}] an empty string`);
        }
        else if (xl[i] !== undefined) throw Error(`_l[${i}] neither a string nor undefined`);
      }
    }
  };
    
  //1 arg: assert a is a cube
  //2 arg: a - name, b - cube to test, if b not a cube, pass a and err msg to fail
  assert.cube = function(a,b) {
    if (arguments.length < 2) asrtCube(a);
    else {
      try { 
        asrtCube(b);
      }
      catch (err) { 
        fail(a, err.message);
      }
    }
  }; 

  assert.fail = fail;
	module.exports = assert;
}