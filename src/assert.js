{	
	"use strict";
  
  const assert = {};
	
	//*->*, arg must convert to non-neg number, returns arg
	assert.nonNegInt = s => { 
		if (!Number.isInteger(+s) || s < 0 || !isFinite(s)) {
      throw new Error('non-negative integer expected');
    }
		return s;
  };

	//*->*, arg must convert to +ve number, returns arg
	assert.posInt = s => { 
		if (!Number.isInteger(+s) || s <= 0 || !isFinite(s)) {
      throw new Error('positive integer expected');
    }
		return s;
  };

  //ac->, assert A has 1-3 entries, all non-neg ints
	assert.shapeArray = A => {
		var nd = A.length;
		if (nd > 3 || nd === 0) {
      throw new Error('shape array must have 1, 2 or 3 entries');
    }
    for (var i=0; i<nd; i++) assert.nonNegInt(A[i]);
	};
  
  //*->func, assert f a function, return f
  assert.func = f => { 
		if (typeof f !== 'function') throw new Error('function expected');
		return f;
  };
  
  
  //===========================================================
  // !!! FROM HERE: UPDATED AND CHECKED, BUT NOT TESTED !!!!!!!
  //===========================================================
  
  //cu->, throw error if not a matrix with at least 1 col
  assert.dataMatrix = a => {
    if (a._d_c_.p !== 1 || a._d_c_.c === 0) {
      throw new Error('matrix with at least 1 column expected');
    }
  };
    
  //cu[,num]->, if c undef: treat x as a long vec, else assert
  //x a data matrix and assume c is a valid non-neg col ind of
  //x (not checked here). Throw error if entries in x or
  //given col are:
  //  not same type
  //  not string, number, date or boolean
  //  NaN or invalid date
  //Returns type as a string: date is 'date' not 'object',
  //'undefined' if no rows. 
  homogType = (x,c) => {
    var i, typ, stop;
    var cube = x._d_c_;
    var cUndef = c === cUndef;
    if (!cUndef) assert.dataMatrix(x);
    if (cube.r === 0) return 'undefined';
    if (cUndef) {
      i = 0;
      stop = x.length-1;
    }
    else {
      i = cube.r*c;
      stop = i + cube.r - 1;
    }
    typ = typeof x[i];
    if (typ === 'string' || typ === 'boolean') {
      for (i++; i<=stop; i++) {
        if (typeof x[i] !== typ) throw new Error(typ + ' expected')
      }
    }
    else if (typ === 'number') {
      for (; i<=stop; i++) { //from first entry to check not NaN
        if (typeof x[i] !== 'number') throw new Error('number expected');
        if (isNaN(x[i])) throw new Error('NaN not permitted')
      }
    }
    else if (x[i] instanceof Date) {
      typ = 'date';
      for (; i<=stop; i++) {  //from first entry to check valid date
        if (!(x[i] instanceof Date)) throw new Error('date expected');
        if (isNaN(x[i])) throw new Error('valid date expected')
      }
    }
    else throw new Error('string, number, date or boolean expected');
    return typ;
  };
  
  module.exports = assert;
}


