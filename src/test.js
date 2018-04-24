{	
	'use strict';
	
  const assert = require('data-cube-assert');
  const helper = require('data-cube-helper');
  require('data-cube');

  //test a.compare(b)
  const test = (name, a, b, msg) => {
    try { 
      a.compare(b);
    }
    catch (err) {
      assert.fail(name, msg);
    }
  };
  
  //test a.compare(b), catch expected error, throw if no error
  test.throw = (name, a, b) => {
		try { 
      a.compare(b);
    }
		catch (err) {
      return;
    }
		assert.fail(name, `expected error but none thrown`);
	};
  
  
  //--------------- tests ---------------//
  
  console.log('Testing compare');
  {
    //these tests use cubes made 'from scratch' (i.e. no cube
    //methods) since compare is used to test all other cube methods    
    const baseArray = [5, 'abc', false, {}, [6]];
    const a0 = [];
    const a1 = [5];
    const a = baseArray.slice();  //shallow copy baseArray
    const aCopy = baseArray.slice();
    const v0 = [];
    v0._d_c_ = new Map([ ['r',0], ['c',1], ['p',1] ]);
    const v1 = [5];
    v1._d_c_ = new Map([ ['r',1], ['c',1], ['p',1] ]);
    const v = baseArray.slice();
    v._d_c_ = new Map([ ['r',5], ['c',1], ['p',1] ]);
    const vCopy = baseArray.slice();
    vCopy._d_c_ = new Map([ ['r',5], ['c',1], ['p',1] ]);
    const ve = baseArray.slice();
    ve._d_c_ = new Map([ ['r',5], ['c',1], ['p',1] ]);
    ve._d_c_.set('e', new Map());
    ve._d_c_.get('e').set('rk', new Map([ ['a',0], ['b',1], ['c',2], ['d',3] ,['e',4] ]));
    ve._d_c_.get('e').set('rl','rows');
    const m = [10,11,12,13,14,15];
    m._d_c_ = new Map([ ['r',2], ['c',3], ['p',1] ]);
    const me = [10,11,12,13,14,15];
    me._d_c_ = new Map([ ['r',2], ['c',3], ['p',1] ]);
    me._d_c_.set('e', new Map());
    me._d_c_.get('e').set('ck', new Map([ ['a',0], ['b',1], ['c',2] ]));
    me._d_c_.get('e').set('rl','rows');
    me._d_c_.get('e').set('cl','columns');
    const b = [10,11,12,13,14,15];
    b._d_c_ = new Map([ ['r',1], ['c',2], ['p',3] ]);
    const be = [10,11,12,13,14,15];
    be._d_c_ = new Map([ ['r',1], ['c',2], ['p',3] ]);
    be._d_c_.set('e', new Map());
    be._d_c_.get('e').set('pk', new Map([ ['a',0], ['b',1], ['c',2] ]));
    be._d_c_.get('e').set('pl','pages');
    be._d_c_.get('e').set('rl','rows');
    
    assert.cube(v0);
    assert.cube(v1);
    assert.cube(v);
    assert.cube(vCopy);
    assert.cube(ve);
    assert.cube(m);
    assert.cube(me);
    assert.cube(b);
    assert.cube(be);
        
    test.throw('throw-compare-array-scaler', a, 5);
    test.throw('throw-compare-vector-scaler', v, 5);
    test.throw('throw-compare-vector-dict', v, ve);
    test.throw('throw-compare-matrix-extras', m, me);
    test.throw('throw-compare-book-extras', b, be);
    test.throw('throw-compare-shape-1', a1, [5,5]);
    test.throw('throw-compare-shape-2', [5,5], a1);
    test.throw('throw-compare-shape-3', v1, [5,5]);
    test.throw('throw-compare-shape-4', [5,5], v1);
    test.throw('throw-compare-shape-5', m, b);
    test.throw('throw-compare-entry-1', a1, [6]);
    test.throw('throw-compare-entry-2', v1, [6]);
        
    test('compare-empty-arrays', a0, []);
    test('compare-1-entry-arrays', a1, [5]);
    test('compare-same-arrays', a, aCopy);
    test('compare-same-reference', be, be);
    test('compare-empty-array-vector', a0, v0);
    test('compare-empty-vector-array', v0, a0);
    test('compare-1-entry-vector-array', v1, a1);
    test('compare-1-entry-array-vector', a1, v1);
    test('compare-array-vector', a, v);
    test('compare-vector-array', v, a);
    
    aCopy[3] = {}; //same as before, but now not referencing same object as a[3]
    vCopy[3] = {};
    test.throw('throw-compare-array-array', a, aCopy);
    test.throw('throw-compare-vector-vector', v, vCopy);
    
    v._d_c_.set('e', new Map());
    v._d_c_.get('e').set('rl','rows');  //still missing row keys
    test.throw('throw-compare-dict-dict-1', v, ve);
    test.throw('throw-compare-dict-dict-2', ve, v);
    v._d_c_.get('e').set('rk', new Map([ ['a',0], ['b',1], ['c',2], ['dd',3] ,['e',4] ]));  //key dd is wrong
    test.throw('throw-compare-dict-dict-3', v, ve);
    test.throw('throw-compare-dict-dict-4', ve, v);
    v._d_c_.get('e').set('rk', new Map([ ['a',0], ['b',1], ['c',2], ['d',3] ,['e',4] ]));
    test('compare-dict-dict-1', v, ve);
    test('compare-dict-dict-2', ve, v);
    
    m._d_c_.set('e', new Map());
    m._d_c_.get('e').set('ck', new Map([ ['a',0], ['b',1], ['c',2] ]));
    m._d_c_.get('e').set('rl','rows');  //still missing column label
    test.throw('throw-compare-matrix-matrix-1', m, me);
    test.throw('throw-compare-matrix-matrix-2', me, m);
    m._d_c_.get('e').set('cl','columns');
    test('compare-matrix-matrix-1', m, me);
    test('compare-matrix-matrix-2', me, m);
    
    b._d_c_.set('e', new Map());
    b._d_c_.get('e').set('pk', new Map([ ['a',0], ['b',1], ['c',2] ]));
    b._d_c_.get('e').set('pl','paGes');   //G should not be uppercase
    b._d_c_.get('e').set('rl','rows'); 
    test.throw('throw-compare-book-book-1', b, be);
    test.throw('throw-compare-book-book-2', be, b);
    b._d_c_.get('e').set('pl','pages');
    test('compare-book-book-1', b, be);
    test('compare-book-book-2', be, b);   
  }
  
  console.log('Tests finished');
}




