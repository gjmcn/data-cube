{	
	'use strict';
	
  require('./data-cube.js');
	const assert = require('data-cube-assert');

  //test a.compare(b)
  const test = (name, a, b, msg) => {
    try { a.compare(b) }
    catch (err) { assert.fail(name, msg) }
  }
  
  //test a.compare(b), catch expected error, throw if no error
  test.throw = (name, a, b) => {
		try { 
      a.compare(b);
		  var ran = true;
    }
		catch (err) {}
		if (ran) assert.fail(name, `expected error but none thrown`);
	};
  

  console.log('Testing compare');
  {
    //some tests using arrays/cubes from scratch since
    //compare is used to test all other cube methods
    const baseArray = [5, 'abc', false, {}, [6]];
    const s = 5
    const a0 = [];
    const a1 = [5];
    const a = [...baseArray];  //shallow copy baseArray
    const v0 = [];
    v0._d_c_ = {r:0, c:1, p:1};
    const v1 = [5];
    v1._d_c_ = {r:1, c:1, p:1};
    const v = [...baseArray];
    v._d_c_ = {r:5, c:1, p:1};
    const ve = [...baseArray];
    ve._d_c_ = {r:5, c:1, p:1}
    ve._d_c_.e = {
      rk: {a:0, b:1, c:2, d:3, e:4},
      ra: ['a','b','c','d','e'],
      rl: 'rows'
    };
    const m = [10,11,12,13,14,15];
    m._d_c_ = {r:2, c:3, p:1};
    const me = [10,11,12,13,14,15];
    me._d_c_ = {r:2, c:3, p:1}
    me._d_c_.e = {
      ck: {a:0, b:1,c:2},
      ca: ['a','b','c'],
      rl: 'rows',
      cl: 'columns'
    };
    const b = [10,11,12,13,14,15];
    b._d_c_ = {r:1, c:2, p:3};
    const be = [10,11,12,13,14,15];
    be._d_c_ = {r:1, c:2, p:3}
    be._d_c_.e = {
      pk: {a:0, b:1, c:2},
      pa: ['a','b','c'],
      pl: 'pages',
      rl: 'rows'
    };
    
    
    test.throw('throw-compare-array-scaler', a, s);
    test.throw('throw-compare-cube-scaler', v, s);
    
    
    //equal themselves - NO POINT DOING THESE NOW SINCE 
    test('compare-empty-arrays', a0, []);
    test('compare-1-entrys', a1, [5]);
    test('compare-same-arrays', a, a);
    test('compare-same-books', be, be);
 
    HERE!!!!!!!!!!!!!!!!
    
    
    
    test('compare-array-vector', a , v);
    
    

    //change entry that is an obj so not refericing same object - get throw


 
          
    
    
  
  
  
  }
  
  
  
  console.log('Tests finished');
}
























