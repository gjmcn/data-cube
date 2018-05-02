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
    
    assert('compare-test-1', () => v.compare(a,false), v);
    assert('compare-test-2', () => v.compare(a,[false]), v);
    assert('compare-test-3', () => v.compare(ve,[false]), false);
    assert.throw('throw-compare-test', () => v.compare(a,[false,false]));
    
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
    assert.throw('throw-cube-non-int-6', () => [4,'3',2].cube());
    assert.throw('throw-cube-non-int-7', () => [4,[3],2].cube());
    assert.throw('throw-cube-shape-mismatch-1', () => [4].cube([5,6,7]));
    assert.throw('throw-cube-shape-mismatch-2', () => [4,2].cube([5,6,7]));
    
    const obj = {a:5};
    const a = [5,obj];
    const a_1 = [undefined];

    const s = [].cube(); 
    assert.each('cube-1-entry-0', [
      [() => assert.cube(s), undefined],
      [() => arrayEq(s, [undefined]), true],
      [() => arrayEq(s._s, [1,1,1]), true]
    ]);
    const s_1 = [1].cube(5);  
    assert.each('cube-1-entry-1', [
      [() => assert.cube(s_1), undefined],
      [() => arrayEq(s_1, [5]), true],
      [() => arrayEq(s_1._s, [1,1,1]), true]
    ]);
    const e = [0].cube();
    assert.each('cube-empty-vector', [
      [() => assert.cube(e), undefined],
      [() => arrayEq(e, []), true],
      [() => arrayEq(e._s, [0,1,1]), true]
    ]);
    const v = [2].cube();
    assert.each('cube-vector-0', [
      [() => assert.cube(v), undefined],
      [() => arrayEq(v, [undefined,undefined]), true],
      [() => arrayEq(v._s, [2,1,1]), true]
    ]);
    const v_1 = [2].cube(5);
    assert.each('cube-vector-1', [
      [() => assert.cube(v_1), undefined],
      [() => arrayEq(v_1, [5,5]), true],
      [() => arrayEq(v_1._s, [2,1,1]), true]
    ]);
    const v_2 = [2].cube(a);
    assert.each('cube-vector-2', [
      [() => assert.cube(v_2), undefined],
      [() => arrayEq(v_2, [5,obj]), true],
      [() => arrayEq(v_2._s, [2,1,1]), true]
    ]);
    const v_3 = [2].cube([a]);
    assert.each('cube-vector-3', [
      [() => assert.cube(v_3), undefined],
      [() => arrayEq(v_3, [a,a]), true],
      [() => arrayEq(v_3._s, [2,1,1]), true]
    ]);
    const v_4 = [2].cube([a_1]);
    assert.each('cube-vector-4', [
      [() => assert.cube(v_4), undefined],
      [() => arrayEq(v_4, [a_1,a_1]), true],
      [() => arrayEq(v_4._s, [2,1,1]), true]
    ]);
    const v_5 = [2].cube(a_1);
    assert.each('cube-vector-5', [
      [() => assert.cube(v_5), undefined],
      [() => arrayEq(v_5, [undefined,undefined]), true],
      [() => arrayEq(v_5._s, [2,1,1]), true]
    ]);
    const m = [0,3].cube();
    assert.each('cube-matrix-0', [
      [() => assert.cube(m), undefined],
      [() => arrayEq(m, []), true],
      [() => arrayEq(m._s, [0,3,1]), true]
    ]);
    const m_1 = [2,3].cube([4,5,6,7,8,9]);
    assert.each('cube-matrix-1', [
      [() => assert.cube(m_1), undefined],
      [() => arrayEq(m_1, [4,5,6,7,8,9]), true],
      [() => arrayEq(m_1._s, [2,3,1]), true]
    ]);
    const b = [,undefined,3].cube([4,5,6]);
    assert.each('cube-book-0', [
      [() => assert.cube(b), undefined],
      [() => arrayEq(b, [4,5,6]), true],
      [() => arrayEq(b._s, [1,1,3]), true]
    ]);
    const b_1 = [2,3,2].cube(true);
    assert.each('cube-book-1', [
      [() => assert.cube(b_1), undefined],
      [() => arrayEq(b_1, (new Array(12)).fill(true)), true],
      [() => arrayEq(b_1._s, [2,3,2]), true]
    ]);
    
  }
  
  console.log('--- rand');
  {
    //basic tests; most work handled by cube()
    const a = [10].rand();
    assert('rand-1', () => Math.min(...a) >= 0, true);
    assert('rand-2', () => Math.max(...a) < 1, true);
    assert('rand-3', () => [10].rand(1).every(v => v === 0 || v === 1), true);
    assert('rand-4', () => [20].rand([3])
      .every(v => v === 0 || v === 1 || v === 2 || v === 3), true);
    assert.throw('throw-rand-invalid-max-1', () => [2].rand(0));
    assert.throw('throw-rand-invalid-max-2', () => [2].rand(-1));
    assert.throw('throw-rand-invalid-max-3', () => [2].rand('2'));
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
    assert.throw('throw-normal-invalid-mean', () => [20].normal('5',2));
    assert.throw('throw-normal-invalid-std-dev', () => [20].normal(5,-2));
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
    assert.throw('throw-$shape-invalid-new-shape-4', () => x.$shape([6,'1',2]));
    assert.throw('throw-$shape-invalid-new-shape-5', () => x.$shape([[12]]));
    assert.throw('throw-$shape-invalid-new-shape-6', () => y.$shape([false])); 
    assert.throw('throw-$shape-invalid-new-shape-7', () => y.$shape(false));
    assert.throw('throw-$shape-diff-number-entries-1', () => x.$shape(0));
    assert.throw('throw-$shape-diff-number-entries-2', () => x.$shape([1,5]));
    assert.throw('throw-$shape-diff-number-entries-3', () => x.$shape(5));
    assert.throw('throw-$shape-diff-number-entries-4', () => x.$shape([2,6,3]));
    assert.throw('throw-$shape-diff-number-entries-5', () => y.$shape([1,1,1]));
    assert.throw('throw-$shape-diff-number-entries-6', () => y.$shape([2,3,1]));
    assert.throw('throw-$shape-too-many-args', () => y.$shape(0,1));
    
    test('$shape-1', x.$shape([2,3,2]), [2,3,2].cube());
    test('$shape-2', x.$shape(), [12].cube());
    test('$shape-3', x.$shape([1,1]), [1,1,12].cube());
    test('$shape-4', x.$shape([1]), [1,12].cube());
    test('$shape-5', x.$shape([3,2]), [3,2,2].cube());
    test('$shape-6', x.$shape(6), [6,2,1].cube());
    test('$shape-7', x.$shape([6]), [6,2,1].cube());
    test('$shape-8', y.$shape(50), [50,0,1].cube());
    test('$shape-9', y.$shape([2]), [2,0,1].cube());
    test('$shape-10', y.$shape([4,5]), [4,5,0].cube());
    test('$shape-11', y.$shape([undefined]), [0,1,1].cube());
    test('$shape-12', y.$shape(undefined), [0,1,1].cube());
    test('$shape-13', y.$shape(0), [0,1,1].cube());
    test('$shape-14', y.$shape(), [0,1,1].cube());
    test('$shape-15', y.$shape([2,0,3]), [2,0,3].cube());
    assert('$shape-same-length-1', () => x.length, 12);
    assert('$shape-same-length-2', () => y.length, 0);
  }
  
  console.log('--- label, $label')
  {
    const obj = {a:5};
    const e = [].$label(1,'columns');
    const m = [5,6].cube()
      .$label(1)  //label on dim 0 will be '1'
      .$label(1,'columns')
      .$label([2],obj);
    
    assert.throwEach('throw-label', [
      () => e.label(3),
      () => e.label([1,2]),
      () => e.$label(0,'a','b'),
      () => e.$label(),
      () => e.$label('1','a'),
      () => e.$label(1,['a','b']),
      () => e.$label(''),
      () => e.$label(1,''),
    ]);
  
    assert.each('label-1', [
      [() => assert.cube(e), undefined],
      [() => arrayEq(e._l, [,'columns',,]), true],
      [() => e.label(), undefined],
      [() => e.label(1), 'columns'],
      [() => e.label(1,10,20), 'columns'],
      [() => e.label(2), undefined]      
    ]);
  
    assert.each('label-2', [
      [() => assert.cube(m), undefined],
      [() => arrayEq(m._l, ['1','columns','' + obj]), true],
      [() => m.label(), '1'],
      [() => m.label(1), 'columns'],
      [() => m.label(2), '' + obj]
    ]);
  }
    
  console.log('--- key, $key')
  {
    const obj = {a:5};
    const e = []
      .$key([])
      .$key(1,'a')
      .$key(2,'b')
    const v = [5,6]
      .$key(0,['a',obj]);
    const b = [2,3,4].cube()
      .$key([obj,'' + obj])
      .$key(2,['a','b','c','d'])
      .$key(1,[10,20,30]);
    
    assert.throwEach('throw-key', [
      () => e.key(3),
      () => e.key([1,2]),
      () => b.$key(1,[5,6,7],8),
      () => b.$key(),
      () => e.$key('1','a'),
      () => e.$key('a'),
      () => e.$key(0,'a'),
      () => b.$key(1,['a']),
      () => b.$key(1,[5,6,7,8]),
      () => b.$key(1,[false,6,7]),
      () => b.$key(1,[5,true,7]),
      () => b.$key(1,[5,6,null]),
      () => b.$key(1,[undefined,6,7]),
      () => b.$key(1,[6,6,7]),
      () => b.$key(1,[5,6,7,6]),
    ]);

    assert.each('key-1', [
      [() => assert.cube(e), undefined],
      [() => arrayEq(e.key(), []), true],
      [() => arrayEq(e.key(1), ['a']), true],
      [() => arrayEq(e.key(2), ['b']), true]
    ]);
    
    assert.each('key-2', [
      [() => assert.cube(v), undefined],
      [() => arrayEq(v.key([undefined]), ['a',obj]), true],
      [() => v.key(1), undefined],
      [() => v.key(2), undefined]
    ]);
    
    assert.each('key-3', [
      [() => assert.cube(b), undefined],
      [() => arrayEq(b.key(0), [obj,'' + obj]), true],
      [() => arrayEq(b.key(1), [10,20,30]), true],
      [() => arrayEq(b.key(2), ['a','b','c','d']), true]
    ]);
    
    assert.each('key-4', [
      [() => [].key(), undefined],
      [() => [].key(1), undefined],
      [() => [].key(2), undefined]
    ]);
  }

  console.log('Tests finished');

}




