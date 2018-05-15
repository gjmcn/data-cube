{	
	'use strict';
	
  const clog = console.log;
  
  const assert = require('data-cube-assert');
  const helper = require('data-cube-helper');
  require('data-cube');
  
  const arrayEq = helper.equalArray;
  const arrayOfArrayEq = helper.equalArrayOfArray;
  const mapEq = helper.equalMap;
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
    // -_data_cube, _s, _k and _l properties are added by assignment
    //  here so will not have same writable, enumerable and configurable
    //  settings as actual cubes
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
  
  console.log('--- copy')
  {
    const e = [];
    assert('copy-empty-0', () => e.copy('array')._data_cube, undefined);
    test('copy-empty-1', e.copy('array'), []);
    assert.cube('copy-empty-2', e.copy());
    test('copy-empty-3', e.copy(), []);
    assert.cube('copy-empty-4', e.copy('core'));
    test('copy-empty-5', e.copy('core'), []);
    assert.cube('copy-empty-6', e.copy('shell'));
    test('copy-empty-7', e.copy('shell'), []);
    
    const dt = new Date();
    const a = [5,6]
      .$key(['a',dt])
      .$label(0,'row')
      .$label(2,'page');
    assert('copy-array-0', () => a.copy('array')._data_cube, undefined);
    test('copy-array-1', a.copy('array'), [5,6]);
    assert.cube('copy-array-2', a.copy('full'));
    test('copy-array-3', a.copy('full'),
      [5,6].$key(['a',dt]).$label(0,'row').$label(2,'page'));
    assert.cube('copy-array-4', a.copy('core'));
    test('copy-array-5', a.copy('core'),
      [5,6]);
    assert.cube('copy-array-6', a.copy('shell'));
    test('copy-array-7', a.copy('shell'),
      [,,].$key(['a',dt]).$label(0,'row').$label(2,'page'));
    test.throw('throw-copy-array', a.copy('shell'),
      [,,].$key(['a', new Date(+dt)]).$label(0,'row').$label(2,'page'));
    
    const obj = {};
    const b = [4,5,6,obj,7,8]
      .$shape([1,2,3])
      .$key(1,['a','b'])
      .$key(2,['A','B','C']);
    assert('copy-book-0', () => b.copy('array')._data_cube, undefined);
    test('copy-book-1', b.copy('array'), [4,5,6,obj,7,8]);
    assert.cube('copy-book-2', b.copy('full'));
    test('copy-book-3', b.copy('full'),
      [4,5,6,obj,7,8].$shape([1,2,3]).$key(1,['a','b']).$key(2,['A','B','C']));
    assert.cube('copy-book-4', b.copy('core'));
    test('copy-book-5', b.copy('core'),
      [4,5,6,obj,7,8].$shape([1,2,3]));
    test.throw('throw-copy-book', b.copy('core'),
      [4,5,6,{},7,8].$shape([1,2,3]));
    assert.cube('copy-book-6', b.copy('shell'));
    test('copy-book-7', b.copy('shell'),
      (new Array(6)).$shape([1,2,3]).$key(1,['a','b']).$key(2,['A','B','C']));
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
      .$key(2,['a','b',true,false])
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
      [() => arrayEq(b.key(2), ['a','b',true,false]), true]
    ]);
    
    assert.each('key-4', [
      [() => [].key(), undefined],
      [() => [].key(1), undefined],
      [() => [].key(2), undefined]
    ]);
  }

  console.log('--- n');
  {
    const b = [4,3,5].cube();
  
    assert('n-1', () => [].n(),  0);
    assert('n-2', () => [].n(0), 0);
    assert('n-3', () => [].n(1), 1);
    assert('n-4', () => [].n(2), 1);
    assert('n-5', () => b.n(),  4);
    assert('n-6', () => b.n(0), 4);
    assert('n-7', () => b.n(1), 3);
    assert('n-8', () => b.n(2), 5);
  }
  
  console.log('--- hasKey');
  { 
    assert.each('has-key-1', [
      [() => [].hasKey(), false],
      [() => [].hasKey(1), false],
      [() => [].hasKey(2), false],
      [() => [].hasKey(0,'a'), false],
      [() => [].hasKey(1,'a'), false],
      [() => [].hasKey(2,'a'), false],
    ]);
    assert.throw('throw-has-key-1', () => [].hasKey('a'));
    
    const obj = {a:5};
    const b = [2,3,4].cube()
      .$key([obj,'' + obj])
      .$key(2,['a','b',true,false]);
    assert.each('has-key-2', [
      [() => b.hasKey(), true],
      [() => b.hasKey(0,obj), true],
      [() => b.hasKey(undefined,obj), true],
      [() => b.hasKey(0,''+obj), true],
      [() => b.hasKey(0,{a:5}), false],
      [() => b.hasKey(0,'a'), false],
      [() => b.hasKey(1), false],
      [() => b.hasKey(1,'a'), false],
      [() => b.hasKey(2), true],
      [() => b.hasKey(2,'a'), true],
      [() => b.hasKey(2,false), true],
      [() => b.hasKey(2,true), true],      
      [() => b.hasKey(2,'A'), false]
    ]);
    assert.throw('throw-has-key-2', () => b.hasKey(2,['a','b']));

    const e = [].$key([]);
    assert.each('has-key-3', [
      [() => e.hasKey(), true],
      [() => e.hasKey(0,undefined), true],
      [() => e.hasKey(0,'a'), false],
    ]);
  }
  
  console.log('--- subcube');
  {
    //empty array
    const e = [];
    test('sc-empty-array-0', e.sc(), []);
    test('sc-empty-array-1', e.sc(null, 0, 0) , []);
    test('$sc-empty-array-0', e.$sc([], 5) , []);
    test('$sc-empty-array-1', e.$sc([], 0, 5) , []);
    test('$sc-empty-array-2', e.$sc([], 0, 0, 5) , []);
    test('$sc-empty-array-3', e.$sc(null, null, null, 5) , []);
    test('$sc-empty-array-4', e.$sc([]) , []);
    
    test('row-empty-array-0', e.row(), []);
    test('row-empty-array-1', e.row(null), []);
    test('$row-empty-array-0', e.$row(5), []);
    test('$row-empty-array-1', e.$row([],[]), []);
    
    test('col-empty-array-0', e.col(), []);
    test('col-empty-array-1', e.col(0), []);
    test('$col-empty-array-0', e.$col(5), []);
    test('$col-empty-array-1', e.$col(0, []), []);
    
    test('page-empty-array-0', e.page(null), []);
    test('page-empty-array-1', e.page(0), []);
    test('page-empty-array-2', e.page(-1), []);
    test('page-empty-array-3', e.page(undefined), []);
    test('page-empty-array-4', e.page([undefined]), []);
    test('page-empty-array-5', e.page([null]), []);
    test('$page-empty-array-0', e.$page(5), []);
    test('$page-empty-array-1', e.$page([5]), []);
    test('$page-empty-array-2', e.$page(0, []), []);
    
    test('down-empty-array-0', e.down(), []);
    test('down-empty-array-1', e.down(null, null), []);
    test('$down-empty-array-0', e.$down(5), []);
    test('$down-empty-array-1', e.$down(null, []), []);
    test('$down-empty-array-2', e.$down(null, null, []), []);
    
    test('along-empty-array-0', e.along(), []);
    test('along-empty-array-1', e.along(0, 0), []);
    test('along-empty-array-2', e.along(0), []);
    test('along-empty-array-3', e.along(null, 0), []);
    test('along-empty-array-4', e.along(null), []);
    test('along-empty-array-5', e.along(null, null), []);
    test('along-empty-array-6', e.along(-1, -1), []);
    test('$along-empty-array-0', e.$along(null, []), []);
    test('$along-empty-array-1', e.$along(0, 0, []), []);
    
    test('back-empty-array-0', e.back(), []);
    test('back-empty-array-1', e.back(0, 0), []);
    test('$back-empty-array-1', e.$back(null, []), []);
    test('$back-empty-array-2', e.$back(0, 0, []), []);
    
    test('head-empty-array-0', e.head(), []);
    test('head-empty-array-1', e.head(0), []);
    test('head-empty-array-2', e.head(null, null, null), []);
    test('head-empty-array-3', e.head(0, 1, 1), []);
    test('head-empty-array-4', e.head(5,5,5), []);
    
    assert.throwEach('throw-subcube-empty-array', [
      () => e.sc(0),
      () => e.sc(-1),
      () => e.sc('a'),
      () => e.sc(null,1),
      () => e.sc(null,null,1),
      () => e.row(0),
      () => e.col(1),
      () => e.page(1),
      () => e.down(0),
      () => e.along(0,1),
      () => e.page(0,1),
      () => e.$sc(0,5),
      () => e.$sc(-1,5),
      () => e.$sc('a',5),
      () => e.$sc(null,1,5),
      () => e.$sc(null,null,1,5),
      () => e.$row(0,5),
      () => e.$col(1,5),
      () => e.$page(1,5),
      () => e.$down(0,5),
      () => e.$along(0,1,5),
      () => e.$page(0,1,5)
    ]);  
    
    //get vector
    let v = [5,6,7,8,9];
    test('sc-vector-0', v.sc(), [5,6,7,8,9]);
    test('sc-vector-1', v.sc(3), [8]);
    test('sc-vector-2', v.sc(-2), [8]);
    test('sc-vector-3', v.sc([2,4]), [7,9]);
    test('sc-vector-4', v.sc([2,4], 0, 0), [7,9]);
    test('sc-vector-5', v.sc([2,4], null, null), [7,9]);
    test('sc-vector-6', v.sc([-3,-1], null, null), [7,9]);
    test('sc-vector-7', v.sc([], null, null), []);
    
    test('row-vector-0', v.row(), [5,6,7,8,9]);
    test('row-vector-1', v.row(3), [8]);
    test('row-vector-2', v.row(-2), [8]);
    test('row-vector-3', v.row([2,4]), [7,9]);
    test('row-vector-4', v.row([-3,-1]), [7,9]);
    test('row-vector-5', v.row([]), []);
    
    test('down-vector-0', v.down(), [5,6,7,8,9]);
    test('down-vector-1', v.down(0), [5,6,7,8,9]);
    test('down-vector-2', v.down(null), [5,6,7,8,9]);
    test('down-vector-3', v.down(null,null), [5,6,7,8,9]);
    test('down-vector-4', v.down(1,3), [6,7,8]);
    test('down-vector-5', v.down(1,-2), [6,7,8]);
    test('down-vector-6', v.down(-4,-2), [6,7,8]);
    test('down-vector-7', v.down(1), [6,7,8,9]);
    test('down-vector-8', v.down(null,3), [5,6,7,8]);
    test('down-vector-9', v.down(1), [6,7,8,9]);
    
    test('head-vector-0', v.head(), [5,6,7,8,9]);
    test('head-vector-1', v.head(3), [5,6,7]);
    test('head-vector-2', v.head(0), []);
    test('head-vector-3', v.head(9,9,9), [5,6,7,8,9]);
    
    //set vector
    const obj = {};
    const wrapObj = [obj];
    v = [5,6,7,8,9];
    test('$sc-vector-0', v.$sc(11),          [11,11,11,11,11]);
    test('$sc-vector-1', v.$sc(3,12),        [11,11,11,12,11]);
    test('$sc-vector-2', v.$sc([2,4],13),    [11,11,13,12,13]);
    test('$sc-vector-3', v.$sc(0,14),        [14,11,13,12,13]);
    test('$sc-vector-4', v.$sc([],15),       [14,11,13,12,13]);
    test('$sc-vector-5', v.$sc(-4,16),       [14,16,13,12,13]);
    test('$sc-vector-6', v.$sc([2,-1,0], [17,18,19]), [19,16,17,12,18]);
    test('$sc-vector-7', v.$sc([2,4], [20]), [19,16,20,12,20]);
    test('$sc-vector-8', v.$sc([2,4], [obj, wrapObj]), [19,16,obj,12,wrapObj]);
    test('$sc-vector-9', v.$sc(0, obj),        [obj,16,obj,12,wrapObj]);
    test('$sc-vector-10', v.$sc(0, wrapObj),   [obj,16,obj,12,wrapObj]);
    test('$sc-vector-11', v.$sc(0, [wrapObj]), [wrapObj,16,obj,12,wrapObj]);
    
    v = [5,6,7,8,9];
    test('$row-vector-0', v.$row(11),          [11,11,11,11,11]); 
    test('$row-vector-1', v.$row(3,12),        [11,11,11,12,11]); 
    test('$row-vector-2', v.$row([2,4],13),    [11,11,13,12,13]); 
    test('$row-vector-3', v.$row(0,14),        [14,11,13,12,13]); 
    test('$row-vector-4', v.$row([],15),       [14,11,13,12,13]); 
    test('$row-vector-5', v.$row(-4,16),       [14,16,13,12,13]); 
    test('$row-vector-6', v.$row([2,-1,0],     [17,18,19]), [19,16,17,12,18]);
    test('$row-vector-7', v.$row([2,4], [20]), [19,16,20,12,20]);
    test('$row-vector-8', v.$row([2,4], [obj, wrapObj]), [19,16,obj,12,wrapObj]);
    test('$row-vector-9', v.$row(0, obj),        [obj,16,obj,12,wrapObj]);
    test('$row-vector-10', v.$row(0, wrapObj),   [obj,16,obj,12,wrapObj]);
    test('$row-vector-11', v.$row(0, [wrapObj]), [wrapObj,16,obj,12,wrapObj]);
    
    v = [5,6,7,8,9];
    test('$down-vector-0', v.$down(11),              [11,11,11,11,11]); 
    test('$down-vector-1', v.$down(1,12),            [11,12,12,12,12]); 
    test('$down-vector-2', v.$down(null,2,13),       [13,13,13,12,12]); 
    test('$down-vector-3', v.$down(1,3,[14,15,16]),  [13,14,15,16,12]); 
    test('$down-vector-4', v.$down(-2,-1,[17,18]),   [13,14,15,17,18]); 
    
    //book
    const marks = () => {
      return [11,12,13,14,15,16,17,18,19,20,
              21,22,23,24,25,26,27,28,29,30,
              31,32,33,34];
    };
    const addKeys = x => {
      return x.$key(['Alice','Bob','Cath'])
       .$key(1,['math','biol','chem','phys'])
       .$key(2,['Autumn','Spring']);
    };
    const addLabels = x => {
      return x.$label(0,'Student')
        .$label(1,'Subject')
        .$label(2,'Term');
    };
    const book = () => addLabels(addKeys(marks().$shape([3,4,2])));
    const bob = addLabels(
      [12,15,18,21,24,27,30,33]
        .$shape([1,4,2])
        .$key('Bob')
        .$key(1,['math','biol','chem','phys'])
        .$key(2,['Autumn','Spring'])
    );
    const biolChem = addLabels(
      [14,15,16,17,18,19,26,27,28,29,30,31]
        .$shape([3,2,2])
        .$key(['Alice','Bob','Cath'])
        .$key(1,['biol','chem'])
        .$key(2,['Autumn','Spring'])
    );
    const aliceBiolChemSpring = addLabels(
      [26,29]
        .$shape([1,2,1])
        .$key('Alice')
        .$key(1,['biol','chem'])
        .$key(2,'Spring')
    );
    const spring = addLabels(
      [23,24,25,26,27,28,29,30,31,32,33,34]
        .$shape([3,4,1])
        .$key(['Alice','Bob','Cath'])
        .$key(1,['math','biol','chem','phys'])
        .$key(2,'Spring')
    );
    const emptyCol = addLabels(
      []
        .$shape([3,0,2])
        .$key(['Alice','Bob','Cath'])
        .$key(1,[])
        .$key(2,['Autumn','Spring'])
    );

    let b, bTmp, valTmp;
    
    b = book();
    test('sc-book-0', b.sc(), book());
    test('sc-book-1', b.sc(null, null, null, 'full'), book());
    test('sc-book-2', b.sc(null, null, null, 'core'), marks().$shape([3,4,2]));
    test('sc-book-3', b.sc('Bob'), bob);
    test('sc-book-4', b.sc(null, ['biol','chem']), biolChem);
    test('sc-book-5', b.sc('Alice', ['biol','chem'], 'Spring'), aliceBiolChemSpring);
    test('sc-book-6', b.sc(null, null, 'Spring'), spring);
    test('sc-book-7', b.sc(null, [], null), emptyCol);
    test('sc-book-8', b.sc(null, ['biol','chem'], null, 'full'), biolChem);
    test('sc-book-9', b.sc(null, ['biol','chem'], null, 'core'), 
      [14,15,16,17,18,19,26,27,28,29,30,31].$shape([3,2,2]))
    test('sc-book-10', b.sc(null, ['biol','chem'], null, 'array'), 
      [14,15,16,17,18,19,26,27,28,29,30,31])
    
    test('row-book-0', b.row(), book());
    test('row-book-1', b.row('Bob'), bob);
    test('col-book-0', b.col(['biol','chem']), biolChem);
    test('col-book-1', b.col([]), emptyCol);    
    test('col-book-2', b.col(['biol','chem'], 'full'), biolChem);
    test('col-book-3', b.col(['biol','chem'], 'core'), 
      [14,15,16,17,18,19,26,27,28,29,30,31].$shape([3,2,2]))
    test('col-book-4', b.col(['biol','chem'], 'array'), 
      [14,15,16,17,18,19,26,27,28,29,30,31])
    test('page-book-0', b.page('Spring'), spring);
    test('row-col-page-book-0',
      b.row('Alice').col(['biol','chem']).page('Spring'), aliceBiolChemSpring);
    
    test('down-book-0', b.down(), book());
    test('down-book-1', b.down('Bob','Bob'), bob);
    test('along-book-0', b.along('biol','chem'), biolChem); 
    test('along-book-1', emptyCol.along(), emptyCol); 
    test('along-book-2', b.along('biol','chem', 'full'), biolChem);
    test('along-book-3', b.along('biol','chem', 'core'), 
      [14,15,16,17,18,19,26,27,28,29,30,31].$shape([3,2,2]))
    test('along-book-4', b.along('biol','chem', 'array'), 
      [14,15,16,17,18,19,26,27,28,29,30,31])
    test('back-book-0', b.back('Spring','Spring'), spring);
    test('down-along-back-0',
      b.down('Alice','Alice').along('biol','chem').back('Spring','Spring'),
        aliceBiolChemSpring);
    
    test('head-book-0', b.head(5,5,5), book());
    test('head-book-1', b.head(2,3,1), addLabels(
      [11,12,14,15,17,18]
        .$shape([2,3,1])
        .$key(['Alice','Bob'])
        .$key(1,['math','biol','chem'])
        .$key(2,'Autumn')));    
    
    b = book();
    test('$sc-book-0', b.$sc(50), addLabels(addKeys([3,4,2].cube(50))));
    b = book();
    test('$sc-book-1', b.$sc([24].cube(51)), addLabels(addKeys([3,4,2].cube(51))));
    
    bTmp = book();
    bTmp[1] = 52;    bTmp[4] = 52;    bTmp[7] = 52;    bTmp[10] = 52; 
    bTmp[13] = 52;   bTmp[16] = 52;   bTmp[19] = 52;   bTmp[22] = 52; 
    b = book();
    test('$sc-book-2', b.$sc('Bob',52), bTmp);
    b = book();
    test('$row-book-0', b.$row('Bob',52), bTmp);
    b = book();
    test('$down-book-0', b.$down('Bob','Bob',52), bTmp);
    
    bTmp = book();
    valTmp = [53,54,55,56,57,58,59,60,61,62,63,64];
    bTmp[3] = 53;    bTmp[4] = 54;    bTmp[5] = 55;
    bTmp[6] = 56;    bTmp[7] = 57;    bTmp[8] = 58;
    bTmp[15] = 59;   bTmp[16] = 60;   bTmp[17] = 61;
    bTmp[18] = 62;   bTmp[19] = 63;   bTmp[20] = 64;
    b = book();
    test('$sc-book-3', b.$sc(null,['biol','chem'],valTmp), bTmp);
    b = book();
    test('$col-book-0', b.$col(['biol','chem'],valTmp), bTmp);
    b = book();
    test('$along-book-0', b.$along('biol','chem',valTmp), bTmp);
    
    bTmp = book();
    bTmp[15] = 65;    bTmp[18] = 66; 
    b = book();
    test('$sc-book-4', b.$sc('Alice', ['biol','chem'], 'Spring', [65,66]), bTmp);
    
    b = book();
    test('$sc-book-5', b.$sc(null, null, [], 67),  book());
    test('$page-book-0', b.$page([], 67),  book());

    b = book();
    assert.throwEach('throw-subcube', [
      () => b.sc('x'),
      () => b.sc('Bob', 'x'),
      () => b.sc('Bob', 'biol', 'x'),
      () => b.$sc('x', 10),
      () => b.$sc('Bob', 'x', 10),
      () => b.$sc('Bob', 'biol', 'x', 10),
      () => b.sc([['Alice']]),
      () => b.sc(null, null, null, 'x'),
      () => b.row('x'),
      () => b.col('x'),
      () => b.page('x'),
      () => b.down('x'),
      () => b.along('x'),
      () => b.back('x'),
      () => b.$sc(),
      () => b.$row('Alice',2,3),
      () => b.$col('biol',2,3),
      () => b.$page('Spring',2,3),
      () => b.$down('Alice','Bob',3,4),
      () => b.$along('biol','chem',3,4),
      () => b.$back('Spring','Spring',3,4),
      () => b.along('chem','biol'),
      () => b.$along('chem','biol',10),
      () => b.along('biol',[['chem']]),
      () => b.$along('biol',[['chem']],10),
      () => b.$sc([10,11]),
      () => b.$row('Alice',[10,11]),
      () => b.$down('Alice','Bob',[10,11])
    ]);
  }
  
  console.log('--- rows, cols, pages');
  {
    const ent0 = x => x.map(v => v[0]);
    const ent1 = x => x.map(v => v[1]);

    const e = [];
    assert('rows-empty-none', () => arrayEq(  [...e.rows()] ,        []), true);
    assert('rows-empty-full', () => arrayEq(  [...e.rows('full')] ,  []), true);
    assert('rows-empty-core', () => arrayEq(  [...e.rows('core')] ,  []), true);
    assert('rows-empty-array', () => arrayEq( [...e.rows('array')] , []), true);
    assert('cols-empty-none', () => arrayEq([...e.cols()] , [0]), true);
    assert('cols-empty-full-ind', () => arrayEq( ent0([...e.cols('full')]) , [0]), true);
    assert('cols-empty-full-col', () => arrayOfArrayEq( ent1([...e.cols('full')]) , [[]]), true);
    
    const a = [5,6];
    const aNone =  [...a.rows('none')];
    const aFull =  [...a.rows('full')];
    const aCore =  [...a.rows('core')];
    const aArray = [...a.rows('array')];
    assert('rows-array-none', () => arrayEq( aNone , [0,1]), true);
    assert('rows-array-full-ind',  () => arrayEq( ent0(aFull) , [0,1]), true);
    assert('rows-array-core-ind',  () => arrayEq( ent0(aCore) , [0,1]), true);
    assert('rows-array-array-ind', () => arrayEq( ent0(aArray), [0,1]), true);
    assert('rows-array-full-row',  () => arrayOfArrayEq( ent1(aFull) , [[5],[6]]), true);
    assert('rows-array-core-row',  () => arrayOfArrayEq( ent1(aCore) , [[5],[6]]), true);
    assert('rows-array-array-row', () => arrayOfArrayEq( ent1(aArray), [[5],[6]]), true);
    assert('cols-array-none', () => arrayEq( [...a.cols()] , [0]), true);
    assert('cols-array-full-ind', () => arrayEq( ent0([...a.cols('full')]) , [0]), true);
    assert('cols-array-full-col', () => arrayOfArrayEq( ent1([...a.cols('full')]) , [[5,6]]), true);
    
    const b = helper.simpleRange(24).map(x => x+100)
      .$shape([4,3,2])
      .$key(1,['a','b','c'])
      .$key(2,['I', 'II'])
      .$label(0,'the rows')
      .$label(1,'the columns');
    const bRowsCore = [...b.rows('core')];
    const bColsFull = [...b.cols('full')];
    const bPagesArray = [...b.pages('array')];
    
    assert('rows-book-length' , () => bRowsCore.length,   4);
    assert('cols-book-length' , () => bColsFull.length,   3);
    assert('pages-book-length', () => bPagesArray.length, 2);
            
    assert('rows-book-none', () => arrayEq( [...b.rows()] , [0,1,2,3]), true);
    assert('cols-book-none', () => arrayEq( [...b.cols()] , ['a','b','c']), true);
    assert('pages-book-none',() => arrayEq( [...b.pages()], ['I','II']), true);
    
    assert('rows-book-core-ind',  () => arrayEq( ent0(bRowsCore)  , [0,1,2,3]), true);
    assert('cols-book-full-key',  () => arrayEq( ent0(bColsFull)  , ['a','b','c']), true);
    assert('pages-book-array-key',() => arrayEq( ent0(bPagesArray), ['I', 'II']), true);
        
    test('rows-book-core-row-0', bRowsCore[0][1], b.row(0).copy('core'));
    test('rows-book-core-row-1', bRowsCore[1][1], b.row(1).copy('core'));
    test('rows-book-core-row-2', bRowsCore[2][1], b.row(2).copy('core'));
    test('rows-book-core-row-3', bRowsCore[3][1], b.row(3).copy('core'));
     
    test('cols-book-full-col-0', bColsFull[0][1], b.col('a'));
    test('cols-book-full-col-1', bColsFull[1][1], b.col('b'));
    test('cols-book-full-col-2', bColsFull[2][1], b.col('c'));
    
    test('pages-book-array-page-0', bPagesArray[0][1], b.page('I').copy('array'));
    test('pages-book-array-page-1', bPagesArray[1][1], b.page('II').copy('array'));
    
    assert.throwEach('throw-rows', [
      () => a.rows('a'),
      () => a.rows(['full', a]),
      () => b.rows('a'),
      () => b.rows(['full', a]),
    ]);
  }
  
  
  
  
  
  
  console.log('Tests finished');
}









