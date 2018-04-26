{	
	'use strict';
	
  const assert = require('data-cube-assert');
  const helper = require('data-cube-helper');
  require('data-cube');
  
  const arrayEq = helper.shallowEqualArray;
  const mapEq = helper.shallowEqualMap;
  const toMap = helper.toMap;
  
  //test a.compare(b)
  const test = (name, a, b) => {
    try { 
      a.compare(b);
    }
    catch (err) {
      assert.fail(name, err.message);
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
  
  console.log('Testing data-cube');
  
  console.log('--- compare');
  {
    //these tests use cubes made 'from scratch' (i.e. no cube
    //methods) since compare is used to test all other cube methods    
    const baseArray = [5, 'abc', false, {}, [6]];
    const a0 = [];
    const a1 = [5];
    const a = baseArray.slice();
    const aCopy = baseArray.slice();
    const v0 = [];
    v0._data_cube = true;
    v0._s = [0,1,1];
    const v1 = [5];
    v1._data_cube = true;
    v1._s = [1,1,1];
    const v = baseArray.slice();
    v._data_cube = true;
    v._s = [5,1,1];
    const vCopy = baseArray.slice();
    vCopy._data_cube = true;
    vCopy._s = [5,1,1];
    const ve = baseArray.slice();
    ve._data_cube = true;
    ve._s = [5,1,1];
    ve._k = [ toMap('a',0,'b',1,'c',2,'d',3,'e',4), undefined, undefined ];
    ve._l = ['rows', undefined, undefined];
    const m = [10,11,12,13,14,15];
    m._data_cube = true;
    m._s = [2,3,1];
    const me = [10,11,12,13,14,15];
    me._data_cube = true;
    me._s = [2,3,1];
    me._k = [ undefined, toMap('a',0,'b',1,'c',2), undefined ];
    me._l = ['rows', 'columns', undefined];
    const b = [10,11,12,13,14,15];
    b._data_cube = true;
    b._s = [1,2,3];
    const be = [10,11,12,13,14,15];
    be._data_cube = true;
    be._s = [1,2,3];
    be._k = [ undefined, undefined, toMap('a',0,'b',1,'c',2) ];
    be._l = ['rows', undefined, 'pages'];
    
    assert.cube('compare-check-1', v0);
    assert.cube('compare-check-2', v1);
    assert.cube('compare-check-3', v);
    assert.cube('compare-check-4', vCopy);
    assert.cube('compare-check-5', ve);
    assert.cube('compare-check-6', m);
    assert.cube('compare-check-7', me);
    assert.cube('compare-check-8', b);
    assert.cube('compare-check-9', be);
        
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
    
    v._l = ['rows', undefined, undefined];  //still missing row keys
    test.throw('throw-compare-dict-dict-1', v, ve);
    test.throw('throw-compare-dict-dict-2', ve, v);
    v._k = [ toMap('a',0,'b',1,'c',2,'dd',3,'e',4), undefined, undefined ];  //key dd is wrong
    test.throw('throw-compare-dict-dict-3', v, ve);
    test.throw('throw-compare-dict-dict-4', ve, v);
    v._k[0] = toMap('a',0,'b',1,'c',2,'d',3,'e',4);
    test('compare-dict-dict-1', v, ve);
    test('compare-dict-dict-2', ve, v);
    
    m._k = [ undefined, toMap('a',0,'b',1,'c',2), undefined ];
    m._l = ['rows', undefined, undefined];  //still missing column label
    test.throw('throw-compare-matrix-matrix-1', m, me);
    test.throw('throw-compare-matrix-matrix-2', me, m);
    m._l[1] = 'columns';
    test('compare-matrix-matrix-1', m, me);
    test('compare-matrix-matrix-2', me, m);

    b._k = [ undefined, undefined, toMap('a',0,'b',1,'c',2) ];
    b._l = ['rows', undefined, 'paGes'];  //'G' should not be uppercase
    test.throw('throw-compare-book-book-1', b, be);
    test.throw('throw-compare-book-book-2', be, b);
    b._l[2] = 'pages';
    test('compare-book-book-1', b, be);
    test('compare-book-book-2', be, b);   
  }
  
//HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  
//  console.log('--- cube');
//  {
//    assert.throw('throw-cube-too-many-entries', () => [6,7,8,9].cube());
//    assert.throw('throw-cube-neg', () => (-1).cube().cube());
//    assert.throw('throw-cube-non-int-1', () => [0,2.3].cube());
//    assert.throw('throw-cube-non-int-1', () => ['a',4].cube());
//    assert.throw('throw-cube-non-int-3', () => [1,{}].cube());
//    assert.throw('throw-cube-non-int-4', () => [4,NaN,2].cube());
//    assert.throw('throw-cube-non-int-5', () => [4,Infinity,2].cube());
//    
//    const a = [5,6];
//    const s = [].cube();
//    const s_1 =[1].cube(5);    
//    const e =[0].cube();
//    const v = [2].cube();
//    const v_1 = [2].cube(5);
//    const v_2 = [2].cube(a);
//    const v_3 = [2].cube([a]);
//    const m = [0,3].cube();
//    const m_1 = [2,3].cube([4,5,6,7,8,9]);
//    const b = [2,3,2].cube(true);
    
    //HERE!!!!!!!!!!!!  WHY ERRORS WITH ASSERT.CUBE?????????????????????????
    
//    assert.cube('cube-check-1', s);
//    assert.cube('cube-check-2', s_1);
//    assert.cube('cube-check-3', e);
//    assert.cube('cube-check-4', v);
//    assert.cube('cube-check-5', v_1);
//    assert.cube('cube-check-6', v_2);
//    assert.cube('cube-check-7', v_3);
//    assert.cube('cube-check-8', m);
//    assert.cube('cube-check-9', m_1);
//    assert.cube('cube-check-10', b);
    
//    TESTS WITH HOLES?
    
    //console.log(assert.cube(s))

//    assert.each('cube-empty-shape-0', [
//      [() => assert.cube(s), ],
//      [() => arrayEq(s, [undefined]), true],
//      [() => mapEq(s._d_c_, toMap('r',1,'c',1,'p',1)), true]
//    ]);
//    assert.each('cube-empty-shape-1', [
//      [() => assert.cube(s_1), ],
//      [() => arrayEq(s_1, [5]), true],
//      [() => mapEq(s_1._d_c_, toMap('r',1,'c',1,'p',1)), true]
//    ]);
//    assert.each('cube-vector-empty', [
//      [() => assert.cube(e), ],
//      [() => arrayEq(e, []), true],
//      [() => mapEq(e._d_c_, toMap('r',0,'c',1,'p',1)), true]
//    ]);
//    assert.each('cube-vector-0', [
//      [() => assert.cube(v), ],
//      [() => arrayEq(v, [undefined,undefined]), true],
//      [() => mapEq(v._d_c_, toMap('r',2,'c',1,'p',1)), true]
//    ]);
//    assert.each('cube-vector-1', [
//      [() => assert.cube(v_1), ],
//      [() => arrayEq(v_1, [5,5]), true],
//      [() => mapEq(v_1._d_c_, toMap('r',2,'c',1,'p',1)), true]
//    ]);
//    assert.each('cube-vector-2', [
//      [() => assert.cube(v_2), ],
//      [() => arrayEq(v_2, [5,5]), true],
//      [() => mapEq(v_2._d_c_, toMap('r',2,'c',1,'p',1)), true]
//    ]);
//    assert.each('cube-vector-3', [
//      [() => assert.cube(v_3), ],
//      [() => arrayEq(v_3, [5,6]), true],
//      [() => mapEq(v_3._d_c_, toMap('r',2,'c',1,'p',1)), true]
//    ]);
//    assert.each('cube-matrix-0', [
//      [() => assert.cube(m), ],
//      [() => arrayEq(m, []), true],
//      [() => mapEq(m._d_c_, toMap('r',0,'c',3,'p',1)), true]
//    ]);
//    assert.each('cube-matrix-1', [
//      [() => assert.cube(m_1), ],
//      [() => arrayEq(m_1, [4,5,6,7,8,9]), true],
//      [() => mapEq(m_1._d_c_, toMap('r',2,'c',3,'p',1)), true]
//    ]);
//    assert.each('cube-book', [
//      [() => assert.cube(b), ],
//      [() => arrayEq(b, [true,true,true,true,true,true]), true],
//      [() => mapEq(b._d_c_, toMap('r',2,'c',3,'p',2)), true]
//    ]);
    
    
//  }
  
  
//  console.log('--- rand');
//  
//  console.log('--- normal');
//  
//  console.log('--- shape');
//
//  console.log('--- $shape');
  
  
  
  
  
  
  
  
  
  
  
  
  console.log('Tests finished');
}




