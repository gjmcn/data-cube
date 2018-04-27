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
		assert.fail(name, 'expected error but none thrown');
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
  
  console.log('--- cube');
  {
    assert.throw('throw-cube-too-many-entries', () => [6,7,8,9].cube());
    assert.throw('throw-cube-neg', () => (-1).cube());
    assert.throw('throw-cube-non-int-1', () => [0,2.3].cube());
    assert.throw('throw-cube-non-int-2', () => ['a',4].cube());
    assert.throw('throw-cube-non-int-3', () => [1,{}].cube());
    assert.throw('throw-cube-non-int-4', () => [4,NaN,2].cube());
    assert.throw('throw-cube-non-int-5', () => [4,Infinity,2].cube());
    assert.throw('throw-cube-shape-mismatch', () => [4].cube([5,6,7]));
    
    const a = [5,6];
    const s = [].cube(); 
    const s_1 = [1].cube(5);    
    const e = [0].cube();
    const v = [2].cube();
    const v_1 = [2].cube(5);
    const v_2 = [2].cube(a);
    const v_3 = [2].cube([a]);
    const m = [0,3].cube();
    const m_1 = [2,3].cube([4,5,6,7,8,9]);
    const b = [,undefined,3].cube([4,5,6]);
    const b_1 = [2,3,2].cube(true);

    assert.each('cube-1-entry-0', [
      [() => assert.cube(s), ],
      [() => arrayEq(s, [undefined]), true],
      [() => arrayEq(s._s, [1,1,1]), true]
    ]);
    assert.each('cube-1-entry-1', [
      [() => assert.cube(s_1), ],
      [() => arrayEq(s_1, [5]), true],
      [() => arrayEq(s_1._s, [1,1,1]), true]
    ]);
    assert.each('cube-empty-vector', [
      [() => assert.cube(e), ],
      [() => arrayEq(e, []), true],
      [() => arrayEq(e._s, [0,1,1]), true]
    ]);
    assert.each('cube-vector-0', [
      [() => assert.cube(v), ],
      [() => arrayEq(v, [undefined,undefined]), true],
      [() => arrayEq(v._s, [2,1,1]), true]
    ]);
    assert.each('cube-vector-1', [
      [() => assert.cube(v_1), ],
      [() => arrayEq(v_1, [5,5]), true],
      [() => arrayEq(v_1._s, [2,1,1]), true]
    ]);
    assert.each('cube-vector-2', [
      [() => assert.cube(v_2), ],
      [() => arrayEq(v_2, [5,6]), true],
      [() => arrayEq(v_2._s, [2,1,1]), true]
    ]);
    assert.each('cube-vector-3', [
      [() => assert.cube(v_3), ],
      [() => arrayEq(v_3, [a,a]), true],
      [() => arrayEq(v_3._s, [2,1,1]), true]
    ]);
    assert.each('cube-matrix-0', [
      [() => assert.cube(m), ],
      [() => arrayEq(m, []), true],
      [() => arrayEq(m._s, [0,3,1]), true]
    ]);
    assert.each('cube-matrix-1', [
      [() => assert.cube(m_1), ],
      [() => arrayEq(m_1, [4,5,6,7,8,9]), true],
      [() => arrayEq(m_1._s, [2,3,1]), true]
    ]);
    assert.each('cube-book-0', [
      [() => assert.cube(b), ],
      [() => arrayEq(b, [4,5,6]), true],
      [() => arrayEq(b._s, [1,1,3]), true]
    ]);
    assert.each('cube-book-1', [
      [() => assert.cube(b_1), ],
      [() => arrayEq(b_1, (new Array(12)).fill(true)), true],
      [() => arrayEq(b_1._s, [2,3,2]), true]
    ]);
    
  }
  
  console.log('--- shape');
  {
    assert('shape-array-1', () => arrayEq([].shape(), [0,1,1]), true);
    assert('shape-array-2', () => arrayEq([5].shape(), [1,1,1]), true);
    assert('shape-array-3', () => arrayEq([5,6].shape(), [2,1,1]), true);
    assert('shape-empty-1', () => arrayEq([0].cube().shape(), [0,1,1]), true);
    assert('shape-empty-2', () => arrayEq([1,0,5].cube().shape(), [1,0,5]), true);
    assert('shape-empty-3', () => arrayEq([,,0].cube().shape(), [1,1,0]), true);
    assert('shape-vector', () => arrayEq([3].cube().shape(), [3,1,1]), true);
    assert('shape-matrix', () => arrayEq([2,4].cube().shape(), [2,4,1]), true);
    assert('shape-book', () => arrayEq([4,3,2].cube().shape(), [4,3,2]), true);
  }
  
  console.log('--- $shape');
  {
    const x = [12].cube();
    const y = [0].cube();

    assert.throw('throw-$shape-invalid-new-shape-1', () => x.$shape([6,2,1,1]));
    assert.throw('throw-$shape-invalid-new-shape-2', () => x.$shape(-12));
    assert.throw('throw-$shape-invalid-new-shape-3', () => x.$shape([6,3.4,2])); 
    assert.throw('throw-$shape-diff-number-entries-1', () => x.$shape(0));
    assert.throw('throw-$shape-diff-number-entries-2', () => x.$shape([1,5]));
    assert.throw('throw-$shape-diff-number-entries-3', () => x.$shape(5));
    assert.throw('throw-$shape-diff-number-entries-4', () => x.$shape([2,6,3]));
    assert.throw('throw-$shape-diff-number-entries-5', () => y.$shape([1,1,1]));
    assert.throw('throw-$shape-diff-number-entries-6', () => y.$shape([2,3,1]));

    test('$shape-1', x.$shape([2,3,2]), [2,3,2].cube());
    test('$shape-2', x.$shape(), [12].cube());
    test('$shape-3', x.$shape([1,1]), [1,1,12].cube());
    test('$shape-4', x.$shape([1]), [1,12].cube());
    test('$shape-5', x.$shape([2,3,2]), [2,3,2].cube());
    test('$shape-6', x.$shape(['3','2']), [3,2,2].cube());
    test('$shape-7', x.$shape(6), [6,2,1].cube());
    test('$shape-8', y.$shape(50), [50,0,1].cube());
    test('$shape-9', y.$shape([2]), [2,0,1].cube());
    test('$shape-10', y.$shape([4,5]), [4,5,0].cube());
    test('$shape-11', y.$shape(undefined), [0,1,1].cube());
    test('$shape-12', y.$shape(0), [0,1,1].cube());
    test('$shape-13', y.$shape([2,0,3]), [2,0,3].cube());
    assert('$shape-same-length-1', () => x.length, 12);
    assert('$shape-same-length-2', () => y.length, 0);
  }
  
  console.log('--- rand');
  {
    //basic tests; most work handled by cube()
    const a = [10].rand();
    assert('rand-1', () => Math.min(...a) >= 0, true);
    assert('rand-2', () => Math.max(...a) < 1, true);
    assert('rand-3', () => [10].rand(1).every(v => v === 0 || v === 1), true);
    assert('rand-4', () => [20].rand('3')
      .every(v => v === 0 || v === 1 || v === 2 || v === 3), true);
    assert.throw('throw-rand-invalid-max-1', () => [2].rand(0));
    assert.throw('throw-rand-invalid-max-2', () => [2].rand(-1));
    assert.throw('throw-rand-invalid-max-3', () => [2].rand('a'));
  }
  
  console.log('--- normal');
  {
    //basic tests; most work handled by cube()
    const a = [20].normal();
    const b = [20].normal(500,10);
    assert('normal-1', () => Math.min(...a) > -10, true);
    assert('normal-2', () => Math.max(...a) < 10, true);
    assert('normal-3', () => Math.min(...b) > 400, true);
    assert('normal-4', () => Math.max(...b) < 600, true);
    assert.throw('throw-normal-invalid-std-dev', () => [20].normal(5,-1));
  }
  
  

  //TO DO!!!!!!!!!!!!!
  
  console.log('--- key')
  {

    
  }
  
    console.log('--- $key')
  {
  
    
  }
  
    console.log('--- label')
  {
  
    
  }
  
    console.log('--- $label')
  {
  
    
  }
  
  
  console.log('Tests finished');
}




