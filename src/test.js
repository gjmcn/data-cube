{	
	'use strict';
	    
  const _isEqual = require('lodash.isequal');
  const assert = require('data-cube-assert');
  
  let dc;
  try {
    dc = require('../dist/data-cube.js');
    testing = './dist/data-cube.js\n(delete dist to test ./src/data-cube.js)';
  }
  catch (e) {
    dc = require( './data-cube.js');
    testing = './src/data-cube.js\n(dist/data-cube.js does not exist)';
  }
  const h = Array.prototype._helper;
    
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
  
  console.log(`Testing: ${testing}\n`);
  
  
  //--------------- tests ---------------//
    
  console.log('--- helper functions');
  {
  
    //assert functions
    {

      assert.each('assert-non-neg-int', [
        [() => h.assert.nonNegInt(5), 5],
        [() => h.assert.nonNegInt(0), 0]
      ]);
      assert.throwEach('invalid-assert-non-neg-int', [
        () => h.assert.nonNegInt(-2),
        () => h.assert.nonNegInt(1.2),
        () => h.assert.nonNegInt(Infinity),
        () => h.assert.nonNegInt(NaN),
        () => h.assert.nonNegInt('2'),
        () => h.assert.nonNegInt([2])
      ]);

      assert.each('assert-pos-int', [
        [() => h.assert.posInt(5), 5]
      ]);
      assert.throwEach('invalid-assert-pos-int', [
        () => h.assert.posInt(-2),
        () => h.assert.posInt(0),
        () => h.assert.posInt(1.2),
        () => h.assert.posInt(Infinity),
        () => h.assert.posInt(NaN),
        () => h.assert.posInt('2'),
        () => h.assert.posInt([2])
      ]);

      assert.each('assert-number', [
        [() => h.assert.number(5), 5],
        [() => h.assert.number(0), 0],
        [() => h.assert.number(-2.3), -2.3]
      ]);
      assert.throwEach('invalid-assert-number', [
        () => h.assert.number('2'),
        () => h.assert.number(false),
        () => h.assert.number([]),
        () => h.assert.number([2]),
        () => h.assert.number([0])
      ]);

      {
        const obj = {a:5};
        const a0 = [];
        const a1 = [5];
        const a2 = [5,6];
        assert.each('assert-single', [
          [() => h.assert.single(5), 5],
          [() => h.assert.single([5]), 5],
          [() => h.assert.single(obj), obj],
          [() => h.assert.single([obj]), obj],
          [() => h.assert.single([a0]), a0],
          [() => h.assert.single([a1]), a1],
          [() => h.assert.single([a2]), a2]
        ]);
        assert.throwEach('invalid-assert-single', [
          () => h.assert.single([]),
          () => h.assert.single([5,6]),
        ]);
      }

      {
        assert.each('assert-dim', [
          [() => h.assert.dim(0), 0],
          [() => h.assert.dim(1), 1],
          [() => h.assert.dim(2), 2],
          [() => h.assert.dim(undefined), 0],
          [() => h.assert.dim(), 0],
          [() => h.assert.dim([0]), 0],
          [() => h.assert.dim([1]), 1],
          [() => h.assert.dim([2]), 2],
          [() => h.assert.dim([undefined]), 0]
        ]);
        assert.throwEach('invalid-assert-dim', [
          () => h.assert.dim(-1),
          () => h.assert.dim(2.3),
          () => h.assert.dim(NaN),
          () => h.assert.dim([[undefined]]),
          () => h.assert.dim(3),
          () => h.assert.dim('1'),
          () => h.assert.dim([0,1]),
          () => h.assert.dim([]),
          () => h.assert.dim([[0]]),
          () => h.assert.dim([[]]),
          () => h.assert.dim(['0']),
          () => h.assert.dim(['2']),
          () => h.assert.dim([false]),
          () => h.assert.dim(''),
          () => h.assert.dim(null)
        ]);    
      }

    }

    //isSingle
    {
      assert.each('is-single', [
        [() => h.isSingle(5), true],
        [() => h.isSingle([5]), true],
        [() => h.isSingle({a:5}), true],
        [() => h.isSingle([{a:5}]), true],
        [() => h.isSingle([[]]), true],
        [() => h.isSingle([[5]]), true],
        [() => h.isSingle([[5,6]]), true],
        [() => h.isSingle([]), false],
        [() => h.isSingle([5,6]), false]
      ]);
    }

    //equalArray
    {
      const obj = {a:5};
      assert('equal-array-1', () => h.equalArray([2,'a'],[2,'a']), true);
      assert('equal-array-2', () => h.equalArray([2,obj],[2,obj]), true);
      assert('equal-array-3', () => h.equalArray([],[]), true);
      assert('equal-array-4', () => h.equalArray([2,'a'],[2,'b']), false);
      assert('equal-array-5', () => h.equalArray([2,'a',true],[2,'a']), false);
      assert('equal-array-6', () => h.equalArray([2,obj],[2,{a:5}]), false);
    }

    //equalArrayOfArray
    {
      const obj = {a:5};
      assert('equal-array-of-array-1', () => h.equalArrayOfArray( [], [] ), true);
      assert('equal-array-of-array-2', () => h.equalArrayOfArray( [[]], [[]] ), true);
      assert('equal-array-of-array-3', () => h.equalArrayOfArray( [[5]], [[5]] ), true);
      assert('equal-array-of-array-4', () => h.equalArrayOfArray( [[5,6]], [[5,6]] ), true);
      assert('equal-array-of-array-5', () => h.equalArrayOfArray( [[5,obj],[6]], [[5,obj],[6]] ), true);
      assert('equal-array-of-array-6', () => h.equalArrayOfArray( [[5,6,7],[8,9,10]], [[5,6,7],[8,9,10]] ), true);
      assert('equal-array-of-array-7', () => h.equalArrayOfArray( [[5,6]], [[5]] ), false);
      assert('equal-array-of-array-8', () => h.equalArrayOfArray( [[5]], [[5,6]] ), false);
      assert('equal-array-of-array-9', () => h.equalArrayOfArray( [[5,6]], [[5,6,7]] ), false);
      assert('equal-array-of-array-10', () => h.equalArrayOfArray( [[5,6],[]], [[5,6]] ), false);
      assert('equal-array-of-array-11', () => h.equalArrayOfArray( [[obj]], [{a:5}] ), false);
      assert('equal-array-of-array-12', () => h.equalArrayOfArray( [[5,6],['7',8]], [[5,6],[7,8]] ), false);
      assert('equal-array-of-array-13', () => h.equalArrayOfArray( [5,6], [5,6] ), false);
      assert('equal-array-of-array-14', () => h.equalArrayOfArray( [[[5,6]]], [[[5,6]]] ), false);
      assert('equal-array-of-array-15', () => h.equalArrayOfArray( 'abc', 'abc' ), false);
    }

    //toArray
    {
      const obj = {a:5};
      const a0 = [];
      const a1 = [5];
      const a2 = [5,6];
      const a3 = [obj];
      assert.each('to-array', [
        [() => h.equalArray(h.toArray(5), [5]), true],
        [() => h.equalArray(h.toArray(obj), [obj]), true],
        [() => h.toArray(a0), a0],
        [() => h.toArray(a1), a1],
        [() => h.toArray(a2), a2],
        [() => h.toArray(a3), a3]
      ]);
    }

    //copyArray
    {
      obj = {a:5};
      assert.each('copy-array', [
        [() => h.equalArray(h.copyArray([]), []), true],
        [() => h.equalArray(h.copyArray([5]), [5]), true],
        [() => h.equalArray(h.copyArray([5,obj]), [5,obj]), true],
        [() => h.equalArray(h.copyArray([5,obj]), [5,{a:5}]), false]
      ]);
    }

    //equalMap
    {
      const obj = {};
      const m0    = new Map();
      const m0_1  = new Map();
      const m1    = new Map([ ['a', 5] ]);
      const m1_1  = new Map([ ['a', 5] ]);
      const m2    = new Map([ ['a', 5],   ['b',6] ]);
      const m2_1  = new Map([ ['a', 5],   ['b',6] ]);
      const m2_2  = new Map([ ['a', 5],   ['b',7] ]);
      const m2_3  = new Map([ ['a', {}],  ['b',6] ]);
      const m2_4  = new Map([ ['a', {}],  ['b',6] ]);
      const m2_5  = new Map([ ['c', 5],   ['b',6] ]);
      const m2_6  = new Map([ [{} , 5],   ['b',6] ]);
      const m2_7  = new Map([ [{} , 5],   ['b',6] ]);
      const m2_8  = new Map([ [obj, 5],   ['b',6] ]);
      const m2_9  = new Map([ [obj, 5],   ['b',6] ]);
      const m2_10 = new Map([ ['a', obj], ['b',6] ]);
      const m2_11 = new Map([ ['a', obj], ['b',6] ]);
      const m2_12 = new Map([ ['b', 6],   ['a',5] ]);
      assert('equal-map-1',  () => h.equalMap(m0,m0_1), true);
      assert('equal-map-2',  () => h.equalMap(m1,m1_1), true);
      assert('equal-map-3',  () => h.equalMap(m2,m2_1), true);
      assert('equal-map-4',  () => h.equalMap(m2_8,m2_9), true);
      assert('equal-map-5',  () => h.equalMap(m2_10,m2_11), true);
      assert('equal-map-6',  () => h.equalMap(m0,m1), false);
      assert('equal-map-7',  () => h.equalMap(m1,m2), false);
      assert('equal-map-8',  () => h.equalMap(m2,m2_2), false);
      assert('equal-map-9',  () => h.equalMap(m2_3,m2_4), false);
      assert('equal-map-10', () => h.equalMap(m2,m2_5), false);
      assert('equal-map-11', () => h.equalMap(m2_6,m2_7), false);
      assert('equal-map-12', () => h.equalMap(m2,m2_12), false);
    }

    //toMap
    {
      const obj = {};
      assert('to-map-1', () => 
             h.equalMap( h.toMap(), new Map() ), true);
      assert('to-map-2', () => 
             h.equalMap( h.toMap('a',5), new Map([ ['a',5] ]) ), true);
      assert('to-map-3', () => 
             h.equalMap( h.toMap('a',5,'b',6), new Map([ ['a',5], ['b',6] ]) ), true);
      assert('to-map-4', () => 
             h.equalMap( h.toMap('a',5,'b',obj), new Map([ ['a',5], ['b',obj] ]) ), true);
      assert('to-map-5', () => 
             h.equalMap( h.toMap(obj,5,'b',6), new Map([ [obj,5], ['b',6] ]) ), true);
      assert.throw('throw-to-map-1', () => h.toMap(1));
      assert.throw('throw-to-map-2', () => h.toMap('a','b','c'));
      assert.throw('throw-to-map-3', () => h.toMap('a','b','a','c'));
      assert.throw('throw-to-map-4', () => h.toMap(0,1,obj,3,obj,4));
    }

    //copyMap
    {
      const obj = {};
      const m0 = new Map();
      const m1 = new Map([ ['a', 5] ]);
      const m2 = new Map([ ['a', 5],   ['b',6] ]);
      const m3 = new Map([ ['a', {}],  ['b',6] ]);
      const m4 = new Map([ [{} , 5],   ['b',6] ]);
      const m5 = new Map([ [obj, 5],   ['b',6] ]);
      const m6 = new Map([ ['a', obj], ['b',6] ]);
      assert('copy-map-0',  () => 
             h.equalMap(h.copyMap(m0), new Map()), true);
      assert('copy-map-1',  () => 
             h.equalMap(h.copyMap(m1), new Map([ ['a', 5] ])), true);
      assert('copy-map-2',  () => 
             h.equalMap(h.copyMap(m2), new Map([ ['a', 5],   ['b',6] ])), true);
      assert('copy-map-3',  () => 
             h.equalMap(h.copyMap(m3), new Map([ ['a', {}],  ['b',6] ])), false);
      assert('copy-map-4',  () => 
             h.equalMap(h.copyMap(m4), new Map([ [{} , 5],   ['b',6] ])), false);
      assert('copy-map-5',  () => 
             h.equalMap(h.copyMap(m5), new Map([ [obj, 5],   ['b',6] ])), true);
      assert('copy-map-6',  () => 
             h.equalMap(h.copyMap(m6), new Map([ ['a', obj], ['b',6] ])), true);
    }

    //keyMap
    {
      const obj = {};
      assert('key-map-1', () => 
             h.equalMap( h.keyMap([]), new Map() ), true);
      assert('key-map-2', () => 
             h.equalMap( h.keyMap(['a']), new Map([ ['a',0] ]) ), true);
      assert('key-map-3', () =>
             h.equalMap( h.keyMap(['a',obj]), new Map([ ['a',0], [obj,1] ]) ), true);
      assert('key-map-4', () =>   
             h.equalMap( h.keyMap([false,true,5]), new Map([ [false,0], [true,1], [5,2] ]) ), true);
      assert('key-map-5', () =>   
             h.equalMap( h.keyMap(['a','b',5]), new Map([ ['a',0], ['b',1], [5,2] ]) ), true);
      assert.throw('throw-key-map-1', () => h.keyMap([5,undefined]));
      assert.throw('throw-key-map-2', () => h.keyMap([null]));
      assert.throw('throw-key-map-3', () => h.keyMap([5,5]));
      assert.throw('throw-key-map-4', () => h.keyMap([0,1,2,1]));
    }

    //polarize
    {
      const obj = {a:5};
      const a0 = [];
      const a1 = [5];
      const a2 = [5,6];
      const a3 = [obj,5,[]];
      assert.each('polarize', [
        [() => h.equalArray(h.polarize(5), [5,true]), true],
        [() => h.equalArray(h.polarize(a1), [5,true]), true],
        [() => h.equalArray(h.polarize(undefined), [undefined,true]), true],
        [() => h.equalArray(h.polarize([undefined]), [undefined,true]), true],
        [() => h.equalArray(h.polarize(obj), [obj,true]), true],
        [() => h.equalArray(h.polarize([obj]), [obj,true]), true],
        [() => h.equalArray(h.polarize([a0]), [a0,true]), true],
        [() => h.equalArray(h.polarize([a2]), [a2,true]), true],
        [() => h.equalArray(h.polarize([a3]), [a3,true]), true],
        [() => h.equalArray(h.polarize(a0), [a0,false]), true],
        [() => h.equalArray(h.polarize(a2), [a2,false]), true],
        [() => h.equalArray(h.polarize(a3), [a3,false]), true]
      ]);
    }

    //simpleRange
    {
      assert('simple-range-1', () => h.equalArray(h.simpleRange(0), []), true);
      assert('simple-range-2', () => h.equalArray(h.simpleRange(1), [0]), true);
      assert('simple-range-3', () => h.equalArray(h.simpleRange(2), [0,1]), true);
      assert('simple-range-4', () => h.equalArray(h.simpleRange(3), [0,1,2]), true);
      assert.throw('throw-simple-range-1', () => h.simpleRange('2'));
      assert.throw('throw-simple-range-2', () => h.simpleRange([2]));
    }

    //fill, fillEW
    {
      assert('fill-1', () => h.equalArray( h.fill(new Array(1), 5), [5] ), true);
      assert('fill-2', () => h.equalArray( h.fill(new Array(2), 'a'), ['a','a']), true);
      assert('fill-3', () => Array.isArray(h.fill([], 5)), true);
      assert('fill-4', () => h.fill([], 5).length, 0);

      assert('fill-ew-1', () => h.equalArray( h.fillEW([4], [5]), [5] ), true);
      assert('fill-ew-2', () => h.equalArray( h.fillEW(new Array(2), [5,'a']), [5,'a'] ), true);
      assert('fill-ew-3', () => Array.isArray(h.fillEW([], [])), true);
      assert('fill-ew-4', () => h.fillEW([], []).length, 0);
      assert.throw('invalid-fill-ew-1', () => h.fillEW(new Array(3), [5,'a']));
    }

    //nni
    {
      assert.each('nni', [
        [() => h.nni(0,3), 0],
        [() => h.nni(2,3), 2],
        [() => h.nni(-1,3), 2],
        [() => h.nni(-3,3), 0],
        [() => h.nni(0,1), 0],
        [() => h.nni(-1,1), 0]
      ]);
      assert.throwEach('throw-nni', [
        () => h.nni(3,3),
        () => h.nni(-4,3),
        () => h.nni('1',3),
        () => h.nni(Infinity,3),
        () => h.nni(1,1),
        () => h.nni(0,0),
        () => h.nni(1,0),
        () => h.nni(-1,0),
      ]);
    }

    //rangeKey
    {
      const e = new Map();    
      assert('range-key-0', () => h.equalArray(h.rangeKey(null, null, e), []), true);
      assert.throw('throw-range-key-0', () => h.rangeKey('a', null, e));
      assert.throw('throw-range-key-1', () => h.rangeKey(null, 'a', e));
      assert.throw('throw-range-key-2', () => h.rangeKey('a', 'a', e));

      const obj = {};    
      const mp = new Map([ ['a',0], [obj,1], [55,2], ['d',3], ['e',4] ]);
      const allKeys = ['a', obj, 55, 'd', 'e'];
      assert('range-key-1', () => h.equalArray(h.rangeKey(null, null, mp), allKeys), true);
      assert('range-key-2', () => h.equalArray(h.rangeKey('a', undefined, mp), allKeys), true);
      assert('range-key-3', () => h.equalArray(h.rangeKey(undefined, 'e', mp), allKeys), true);
      assert('range-key-4', () => h.equalArray(h.rangeKey('a', 55, mp), ['a', obj, 55]), true);
      assert('range-key-5', () => h.equalArray(h.rangeKey(obj, 'd', mp), [obj, 55, 'd']), true);
      assert('range-key-6', () => h.equalArray(h.rangeKey(obj, obj, mp), [obj]), true);
      assert('range-key-7', () => h.equalArray(h.rangeKey('a','a', mp), ['a']), true);
      assert('range-key-8', () => h.equalArray(h.rangeKey('e','e', mp), ['e']), true);
      assert('range-key-9', () => h.equalArray(h.rangeKey('e',null, mp), ['e']), true);
      assert('range-key-10', () => h.equalArray(h.rangeKey(null,'a', mp), ['a']), true);
      assert.throw('throw-range-key-3', () => h.rangeKey('b', null, mp));
      assert.throw('throw-range-key-4', () => h.rangeKey(null, 'b', mp));
      assert.throw('throw-range-key-5', () => h.rangeKey('b', 'b', mp));
      assert.throw('throw-range-key-6', () => h.rangeKey('e','a', mp));
      assert.throw('throw-range-key-7', () => h.rangeKey(55,obj, mp));

      const s = new Map([ ['a',0] ]);
      assert('range-key-11', () => h.equalArray(h.rangeKey('a','a',s), ['a']), true);
      assert('range-key-12', () => h.equalArray(h.rangeKey(null,'a',s), ['a']), true);
      assert('range-key-13', () => h.equalArray(h.rangeKey('a',null,s), ['a']), true);
      assert('range-key-14', () => h.equalArray(h.rangeKey(null,null,s), ['a']), true);
      assert.throw('throw-range-key-8', () => h.rangeKey('b',null,s));
      assert.throw('throw-range-key-9', () => h.rangeKey(null,'b',s));
      assert.throw('throw-range-key-10', () => h.rangeKey('b','b',s));
    }

    //firstKey
    {
      const e = new Map();    
      assert('first-key-0', () => h.equalArray(h.firstKey(0, e), []), true);
      assert('first-key-1', () => h.equalArray(h.firstKey(1, e), []), true);
      assert('first-key-2', () => h.equalArray(h.firstKey(3, e), []), true);

      const s = new Map([ ['a',0] ]);   
      assert('first-key-3', () => h.equalArray(h.firstKey(0, s), []), true);
      assert('first-key-4', () => h.equalArray(h.firstKey(1, s), ['a']), true);
      assert('first-key-5', () => h.equalArray(h.firstKey(3, s), ['a']), true);

      const obj = {};    
      const mp = new Map([ ['a',0], [obj,1], [55,2], ['d',3], ['e',4] ]);
      const allKeys = ['a', obj, 55, 'd', 'e'];
      assert('first-key-6', () => h.equalArray(h.firstKey(0, mp), []), true);
      assert('first-key-7', () => h.equalArray(h.firstKey(1, mp), ['a']), true);
      assert('first-key-8', () => h.equalArray(h.firstKey(3, mp), ['a', obj, 55]), true);
      assert('first-key-9', () => h.equalArray(h.firstKey(5, mp), allKeys), true);
      assert('first-key-10', () => h.equalArray(h.firstKey(7, mp), allKeys), true);
    }

    //rangeInd
    {
      assert('range-ind-0', () => h.equalArray(h.rangeInd(0,0), [0]), true);
      assert('range-ind-1', () => h.equalArray(h.rangeInd(3,3), [3]), true);
      assert('range-ind-2', () => h.equalArray(h.rangeInd(0,1), [0,1]), true);
      assert('range-ind-3', () => h.equalArray(h.rangeInd(3,4), [3,4]), true);
      assert('range-ind-4', () => h.equalArray(h.rangeInd(0,2), [0,1,2]), true);
      assert('range-ind-5', () => h.equalArray(h.rangeInd(3,5), [3,4,5]), true);

      assert.throw('throw-range-ind-0', () => h.rangeInd(0,-1));
      assert.throw('throw-range-ind-1', () => h.rangeInd(3,2));
    }

    //indInd
    {
      assert('ind-ind-0', () => h.equalArray(h.indInd([0],1), [0]), true);
      assert('ind-ind-1', () => h.equalArray(h.indInd([0,1,2],3), [0,1,2]), true);
      assert('ind-ind-2', () => h.equalArray(h.indInd([-3,1,0,2],3), [0,1,0,2]), true);
      assert('ind-ind-3', () => h.equalArray(h.indInd([],0), []), true);
      assert('ind-ind-4', () => h.equalArray(h.indInd([],1), []), true);
      assert('ind-ind-5', () => h.equalArray(h.indInd([],3), []), true);

      assert.throw('throw-ind-ind-0', () => h.indInd([0],0));
      assert.throw('throw-ind-ind-1', () => h.indInd([1],0));
      assert.throw('throw-ind-ind-2', () => h.indInd([-1],0));
      assert.throw('throw-ind-ind-3', () => h.indInd([3],3));
    }

    //keyInd
    {
      const obj = {};    
      const mp = new Map([ ['a',0], [obj,1], [55,2], ['d',3], ['e',4] ]);
      const allKeys = ['a', obj, 55, 'd', 'e'];
      assert('key-ind-0', () => h.equalArray(h.keyInd(allKeys,mp), [0,1,2,3,4]), true);
      assert('key-ind-1', () => h.equalArray(h.keyInd(allKeys.slice(0).reverse(),mp), [4,3,2,1,0]), true);
      assert('key-ind-2', () => h.equalArray(h.keyInd([],mp), []), true);
      assert('key-ind-3', () => h.equalArray(h.keyInd([55,obj,obj,55],mp), [2,1,1,2]), true);
      assert.throw('throw-key-ind-0', () => h.keyInd(['b'],mp));

      const e = new Map(); 
      assert('key-ind-4', () => h.equalArray(h.keyInd([],e), []), true);
      assert.throw('throw-key-ind-1', () => h.keyInd(['b'], e));
    }

  }
  
  console.log('--- native mutators');
  {
   
    const a = [5,6,7];
    a.copyWithin(0,1);
    assert('native-copyWithin', () => h.equalArray(a, [6,7,7]), true);
    a.fill(8);
    assert('native-fill', () => h.equalArray(a, [8,8,8]), true);
    a.pop();
    assert('native-pop', () => h.equalArray(a, [8,8]), true);
    a.push(9);
    assert('native-push', () => h.equalArray(a, [8,8,9]), true);
    a.reverse();
    assert('native-reverse', () => h.equalArray(a, [9,8,8]), true);
    a.shift();
    assert('native-shift', () => h.equalArray(a, [8,8]), true);
    a[0] = 9;
    a.sort();
    assert('native-sort', () => h.equalArray(a, [8,9]), true);
    a.splice(0,1);
    assert('native-splice', () => h.equalArray(a, [9]), true);
    a.unshift(10);
    assert('native-unshift', () => h.equalArray(a, [10,9]), true);
    
    const c = [5,6,7].toCube();
    assert.throw('throw-native-copyWithin', () => c.copyWithin(0,1));
    assert.throw('throw-native-fill', () => c.fill(8));
    assert.throw('throw-native-pop', () => c.pop());
    assert.throw('throw-native-push', () => c.push(9));
    assert.throw('throw-native-reverse', () => c.reverse());
    assert.throw('throw-native-shift', () => c.shift());
    assert.throw('throw-native-sort', () => c.sort());
    assert.throw('throw-native-splice', () => c.splice(0,1));
    assert.throw('throw-native-unshift', () => c.unshift(10));
    assert.cube('native-mutator-no-change-0', c);
    test('native-mutator-no-change-1', c, [5,6,7]);
  
  }
  
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
    ve._k = [ h.toMap('a',0,'b',1,'c',2,'d',3,'e',4), undefined, undefined ];
    ve._l = ['rows', undefined, undefined];
    const m = [10,11,12,13,14,15];
    m._data_cube = true;
    m._s = [2,3,1];
    const me = [10,11,12,13,14,15];
    me._data_cube = true;
    me._s = [2,3,1];
    me._k = [ undefined, h.toMap('a',0,'b',1,'c',2), undefined ];
    me._l = ['rows', 'columns', undefined];
    const b = [10,11,12,13,14,15];
    b._data_cube = true;
    b._s = [1,2,3];
    const be = [10,11,12,13,14,15];
    be._data_cube = true;
    be._s = [1,2,3];
    be._k = [ undefined, undefined, h.toMap('a',0,'b',1,'c',2) ];
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
    v._k = [ h.toMap('a',0,'b',1,'c',2,'dd',3,'e',4), undefined, undefined ];  //key dd is wrong
    test.throw('throw-compare-dict-dict-3', v, ve);
    test.throw('throw-compare-dict-dict-4', ve, v);
    v._k[0] = h.toMap('a',0,'b',1,'c',2,'d',3,'e',4);
    test('compare-dict-dict-1', v, ve);
    test('compare-dict-dict-2', ve, v);
    
    m._k = [ undefined, h.toMap('a',0,'b',1,'c',2), undefined ];
    m._l = ['rows', undefined, undefined];  //still missing column label
    test.throw('throw-compare-matrix-matrix-1', m, me);
    test.throw('throw-compare-matrix-matrix-2', me, m);
    m._l[1] = 'columns';
    test('compare-matrix-matrix-1', m, me);
    test('compare-matrix-matrix-2', me, m);

    b._k = [ undefined, undefined, h.toMap('a',0,'b',1,'c',2) ];
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
      [() => h.equalArray(s, [undefined]), true],
      [() => h.equalArray(s._s, [1,1,1]), true]
    ]);
    const s_1 = [1].cube(5);  
    assert.each('cube-1-entry-1', [
      [() => assert.cube(s_1), undefined],
      [() => h.equalArray(s_1, [5]), true],
      [() => h.equalArray(s_1._s, [1,1,1]), true]
    ]);
    const e = [0].cube();
    assert.each('cube-empty-vector', [
      [() => assert.cube(e), undefined],
      [() => h.equalArray(e, []), true],
      [() => h.equalArray(e._s, [0,1,1]), true]
    ]);
    const v = [2].cube();
    assert.each('cube-vector-0', [
      [() => assert.cube(v), undefined],
      [() => h.equalArray(v, [undefined,undefined]), true],
      [() => h.equalArray(v._s, [2,1,1]), true]
    ]);
    const v_1 = [2].cube(5);
    assert.each('cube-vector-1', [
      [() => assert.cube(v_1), undefined],
      [() => h.equalArray(v_1, [5,5]), true],
      [() => h.equalArray(v_1._s, [2,1,1]), true]
    ]);
    const v_2 = [2].cube(a);
    assert.each('cube-vector-2', [
      [() => assert.cube(v_2), undefined],
      [() => h.equalArray(v_2, [5,obj]), true],
      [() => h.equalArray(v_2._s, [2,1,1]), true]
    ]);
    const v_3 = [2].cube([a]);
    assert.each('cube-vector-3', [
      [() => assert.cube(v_3), undefined],
      [() => h.equalArray(v_3, [a,a]), true],
      [() => h.equalArray(v_3._s, [2,1,1]), true]
    ]);
    const v_4 = [2].cube([a_1]);
    assert.each('cube-vector-4', [
      [() => assert.cube(v_4), undefined],
      [() => h.equalArray(v_4, [a_1,a_1]), true],
      [() => h.equalArray(v_4._s, [2,1,1]), true]
    ]);
    const v_5 = [2].cube(a_1);
    assert.each('cube-vector-5', [
      [() => assert.cube(v_5), undefined],
      [() => h.equalArray(v_5, [undefined,undefined]), true],
      [() => h.equalArray(v_5._s, [2,1,1]), true]
    ]);
    const m = [0,3].cube();
    assert.each('cube-matrix-0', [
      [() => assert.cube(m), undefined],
      [() => h.equalArray(m, []), true],
      [() => h.equalArray(m._s, [0,3,1]), true]
    ]);
    const m_1 = [2,3].cube([4,5,6,7,8,9]);
    assert.each('cube-matrix-1', [
      [() => assert.cube(m_1), undefined],
      [() => h.equalArray(m_1, [4,5,6,7,8,9]), true],
      [() => h.equalArray(m_1._s, [2,3,1]), true]
    ]);
    const b = [,undefined,3].cube([4,5,6]);
    assert.each('cube-book-0', [
      [() => assert.cube(b), undefined],
      [() => h.equalArray(b, [4,5,6]), true],
      [() => h.equalArray(b._s, [1,1,3]), true]
    ]);
    const b_1 = [2,3,2].cube(true);
    assert.each('cube-book-1', [
      [() => assert.cube(b_1), undefined],
      [() => h.equalArray(b_1, (new Array(12)).fill(true)), true],
      [() => h.equalArray(b_1._s, [2,3,2]), true]
    ]);
    
  }
  
  console.log('--- rand');
  {
    //basic tests; most work handled by cube()
    const a = [10].rand();
    assert('rand-1', () => Math.min(...a) >= 0, true);
    assert('rand-2', () => Math.max(...a) < 1, true);
    assert('rand-3', () => [10].rand(1).every(v => v === 0 || v === 1), true);
    assert('rand-4', () => [10].rand(true).every(v => v === 0 || v === 1), true);
    assert('rand-5', () => [20].rand([3])
      .every(v => v === 0 || v === 1 || v === 2 || v === 3), true);
    assert('rand-6', () => [20].rand(['3'])
      .every(v => v === 0 || v === 1 || v === 2 || v === 3), true);
    assert.throw('throw-rand-invalid-max-1', () => [2].rand(0));
    assert.throw('throw-rand-invalid-max-2', () => [2].rand(-1));
  }
  
  console.log('--- normal');
  {
    //basic tests; most work handled by cube()
    const a = [20].normal();
    const b = [20].normal(500,'10');
    assert('normal-1', () => Math.min(...a) > -10, true);
    assert('normal-2', () => Math.max(...a) < 10, true);
    assert('normal-3', () => Math.min(...b) > 400, true);
    assert('normal-4', () => Math.max(...b) < 600, true);
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
    assert('shape-array-1', () => h.equalArray([].shape(), [0,1,1]), true);
    assert('shape-array-2', () => h.equalArray([5].shape(), [1,1,1]), true);
    assert('shape-array-3', () => h.equalArray([5,6].shape(), [2,1,1]), true);
    assert('shape-empty-1', () => h.equalArray([0].cube().shape(), [0,1,1]), true);
    assert('shape-empty-2', () => h.equalArray([1,0,5].cube().shape(), [1,0,5]), true);
    assert('shape-empty-3', () => h.equalArray([,,0].cube().shape(), [1,1,0]), true);
    assert('shape-vector', () => h.equalArray([3].cube().shape(), [3,1,1]), true);
    assert('shape-matrix', () => h.equalArray([2,4].cube().shape(), [2,4,1]), true);
    assert('shape-book', () => h.equalArray([4,3,2].cube().shape(), [4,3,2]), true);
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
      () => e.$label(1,[null,null]),
    ]);
  
    assert.each('label-1', [
      [() => assert.cube(e), undefined],
      [() => h.equalArray(e._l, [,'columns',,]), true],
      [() => e.label(), null],
      [() => e.label(1), 'columns'],
      [() => e.label(1,10,20), 'columns'],
      [() => e.label(2), null]      
    ]);
  
    assert.each('label-2', [
      [() => assert.cube(m), undefined],
      [() => h.equalArray(m._l, ['1','columns','' + obj]), true],
      [() => m.label(), '1'],
      [() => m.label(1), 'columns'],
      [() => m.label(2), '' + obj]
    ]);
    
    e.$label(1,null);
    m.$label(1,[null])
     .$label([2], null);
    m.$label(2,'columns again');
    assert.each('label-3', [
      [() => e.label(0), null],
      [() => e.label(1), null],
      [() => e.label(2), null],
      [() => m.label(), '1'],      
      [() => m.label(1), null],      
      [() => m.label(2), 'columns again'],     
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
      () => b.$key(0,[null,null]),
    ]);

    assert.each('key-1', [
      [() => assert.cube(e), undefined],
      [() => h.equalArray(e.key(), []), true],
      [() => h.equalArray(e.key(1), ['a']), true],
      [() => h.equalArray(e.key(2), ['b']), true]
    ]);
    
    assert.each('key-2', [
      [() => assert.cube(v), undefined],
      [() => h.equalArray(v.key([undefined]), ['a',obj]), true],
      [() => v.key(1), null],
      [() => v.key(2), null]
    ]);
    
    assert.each('key-3', [
      [() => assert.cube(b), undefined],
      [() => h.equalArray(b.key(0), [obj,'' + obj]), true],
      [() => h.equalArray(b.key(1), [10,20,30]), true],
      [() => h.equalArray(b.key(2), ['a','b',true,false]), true]
    ]);
    
    assert.each('key-4', [
      [() => [].key(), null],
      [() => [].key(1), null],
      [() => [].key(2), null]
    ]);
    
    e.$key(null)
     .$key(1,[null])
     .$key([2],null)
    v.$key(0,null)
     .$key(1,'col-0');
    b.$key(1,null)
    assert.each('key-5', [
      [() => e.key(), null],
      [() => e.key(1), null],
      [() => e.key(2), null],
      [() => v.key(0), null],
      [() => h.equalArray(v.key(1), ['col-0']), true],
      [() => v.key(2), null],
      [() => h.equalArray(b.key(0), [obj,'' + obj]), true],
      [() => b.key(1), null],
      [() => h.equalArray(b.key(2), ['a','b',true,false]), true]
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
  
  console.log('--- subcubes');
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
  
  console.log('--- generators');
  {
    const ent0 = x => x.map(v => v[0]);
    const ent1 = x => x.map(v => v[1]);

    const e = [];
    assert('rows-empty-none', () => h.equalArray(  [...e.rows()] ,        []), true);
    assert('rows-empty-full', () => h.equalArray(  [...e.rows('full')] ,  []), true);
    assert('rows-empty-core', () => h.equalArray(  [...e.rows('core')] ,  []), true);
    assert('rows-empty-array', () => h.equalArray( [...e.rows('array')] , []), true);
    assert('cols-empty-none', () => h.equalArray([...e.cols()] , [0]), true);
    assert('cols-empty-full-ind', () => h.equalArray( ent0([...e.cols('full')]) , [0]), true);
    assert('cols-empty-full-col', () => h.equalArrayOfArray( ent1([...e.cols('full')]) , [[]]), true);
    
    const a = [5,6];
    const aNone =  [...a.rows('none')];
    const aFull =  [...a.rows('full')];
    const aCore =  [...a.rows('core')];
    const aArray = [...a.rows('array')];
    assert('rows-array-none', () => h.equalArray( aNone , [0,1]), true);
    assert('rows-array-full-ind',  () => h.equalArray( ent0(aFull) , [0,1]), true);
    assert('rows-array-core-ind',  () => h.equalArray( ent0(aCore) , [0,1]), true);
    assert('rows-array-array-ind', () => h.equalArray( ent0(aArray), [0,1]), true);
    assert('rows-array-full-row',  () => h.equalArrayOfArray( ent1(aFull) , [[5],[6]]), true);
    assert('rows-array-core-row',  () => h.equalArrayOfArray( ent1(aCore) , [[5],[6]]), true);
    assert('rows-array-array-row', () => h.equalArrayOfArray( ent1(aArray), [[5],[6]]), true);
    assert('cols-array-none', () => h.equalArray( [...a.cols()] , [0]), true);
    assert('cols-array-full-ind', () => h.equalArray( ent0([...a.cols('full')]) , [0]), true);
    assert('cols-array-full-col', () => h.equalArrayOfArray( ent1([...a.cols('full')]) , [[5,6]]), true);
    
    const b = h.simpleRange(24).map(x => x+100)
      .$shape([4,3,2])
      .$key(1,['a','bcd','ef'])
      .$key(2,['I', 'II'])
      .$label(0,'the rows')
      .$label(1,'the columns');
    const bRowsCore = [...b.rows('core')];
    const bColsFull = [...b.cols('full')];
    const bPagesArray = [...b.pages('array')];
    
    assert('rows-book-length' , () => bRowsCore.length,   4);
    assert('cols-book-length' , () => bColsFull.length,   3);
    assert('pages-book-length', () => bPagesArray.length, 2);
            
    assert('rows-book-none', () => h.equalArray( [...b.rows()] , [0,1,2,3]), true);
    assert('cols-book-none', () => h.equalArray( [...b.cols()] , ['a','bcd','ef']), true);
    assert('pages-book-none',() => h.equalArray( [...b.pages()], ['I','II']), true);
    
    assert('rows-book-core-ind',  () => h.equalArray( ent0(bRowsCore)  , [0,1,2,3]), true);
    assert('cols-book-full-key',  () => h.equalArray( ent0(bColsFull)  , ['a','bcd','ef']), true);
    assert('pages-book-array-key',() => h.equalArray( ent0(bPagesArray), ['I', 'II']), true);
        
    test('rows-book-core-row-0', bRowsCore[0][1], b.row(0).copy('core'));
    test('rows-book-core-row-1', bRowsCore[1][1], b.row(1).copy('core'));
    test('rows-book-core-row-2', bRowsCore[2][1], b.row(2).copy('core'));
    test('rows-book-core-row-3', bRowsCore[3][1], b.row(3).copy('core'));
     
    test('cols-book-full-col-0', bColsFull[0][1], b.col('a'));
    test('cols-book-full-col-1', bColsFull[1][1], b.col('bcd'));
    test('cols-book-full-col-2', bColsFull[2][1], b.col('ef'));
    
    let tmpKey = [];
    for (let [ky,cl] of b.cols('full')) tmpKey.push(ky);
    assert('cols-book-full-for-of',() => h.equalArray(tmpKey, ['a','bcd','ef']), true);
    
    test('pages-book-array-page-0', bPagesArray[0][1], b.page('I').copy('array'));
    test('pages-book-array-page-1', bPagesArray[1][1], b.page('II').copy('array'));
    
    assert.throwEach('throw-rows', [
      () => a.rows('a'),
      () => a.rows(['full', a]),
      () => b.rows('a'),
      () => b.rows(['full', a]),
    ]);
  }
  
  console.log('--- vble');
  {
    
    const e = [0,1,2].cube();
    assert('vble-empty-dim-0', () => _isEqual(e.vble(0),
      [ { col: 'c_0', page: 'p_0' }, { col: 'c_0', page: 'p_1' } ]), true);
    assert('vble-empty-dim-1', () => _isEqual(e.vble(1), []), true);
    assert('vble-empty-dim-2', () => _isEqual(e.vble(2), []), true);
    assert('vble-empty-dim-neg-1', () => _isEqual(e.vble(-1), []), true);
    
    const b = [11,12,13,14,15,16,17,18,19,20,
         21,22,23,24,25,26,27,28,29,30,
         31,32,33,34]
      .$shape([3,4,2])
      .$key(['Alice','Bob','Cath'])
      .$key(1,['math','biol','chem','phys'])
      .$key(2,['Autumn','Spring'])
      .$label(0,'Student')
      .$label(1,'Subject')
      .$label(2,'Term');
    
    assert('vble-book-dim-0', () => _isEqual( b.vble(),
      [ { Subject: 'math', Term: 'Autumn', Alice: 11, Bob: 12, Cath: 13 },
        { Subject: 'biol', Term: 'Autumn', Alice: 14, Bob: 15, Cath: 16 },
        { Subject: 'chem', Term: 'Autumn', Alice: 17, Bob: 18, Cath: 19 },
        { Subject: 'phys', Term: 'Autumn', Alice: 20, Bob: 21, Cath: 22 },
        { Subject: 'math', Term: 'Spring', Alice: 23, Bob: 24, Cath: 25 },
        { Subject: 'biol', Term: 'Spring', Alice: 26, Bob: 27, Cath: 28 },
        { Subject: 'chem', Term: 'Spring', Alice: 29, Bob: 30, Cath: 31 },
        { Subject: 'phys', Term: 'Spring', Alice: 32, Bob: 33, Cath: 34 }
      ]), true);
  
    assert('vble-book-dim-1', () => _isEqual( b.vble(1),
      [ { Student: 'Alice',
          Term: 'Autumn',
          math: 11,
          biol: 14,
          chem: 17,
          phys: 20 },
        { Student: 'Bob',
          Term: 'Autumn',
          math: 12,
          biol: 15,
          chem: 18,
          phys: 21 },
        { Student: 'Cath',
          Term: 'Autumn',
          math: 13,
          biol: 16,
          chem: 19,
          phys: 22 },
        { Student: 'Alice',
          Term: 'Spring',
          math: 23,
          biol: 26,
          chem: 29,
          phys: 32 },
        { Student: 'Bob',
          Term: 'Spring',
          math: 24,
          biol: 27,
          chem: 30,
          phys: 33 },
        { Student: 'Cath',
          Term: 'Spring',
          math: 25,
          biol: 28,
          chem: 31,
          phys: 34 }
      ]), true);
  

    assert('vble-book-dim-2', () => _isEqual( b.vble(2),
      [ { Student: 'Alice', Subject: 'math', Autumn: 11, Spring: 23 },
        { Student: 'Bob', Subject: 'math', Autumn: 12, Spring: 24 },
        { Student: 'Cath', Subject: 'math', Autumn: 13, Spring: 25 },
        { Student: 'Alice', Subject: 'biol', Autumn: 14, Spring: 26 },
        { Student: 'Bob', Subject: 'biol', Autumn: 15, Spring: 27 },
        { Student: 'Cath', Subject: 'biol', Autumn: 16, Spring: 28 },
        { Student: 'Alice', Subject: 'chem', Autumn: 17, Spring: 29 },
        { Student: 'Bob', Subject: 'chem', Autumn: 18, Spring: 30 },
        { Student: 'Cath', Subject: 'chem', Autumn: 19, Spring: 31 },
        { Student: 'Alice', Subject: 'phys', Autumn: 20, Spring: 32 },
        { Student: 'Bob', Subject: 'phys', Autumn: 21, Spring: 33 },
        { Student: 'Cath', Subject: 'phys', Autumn: 22, Spring: 34 }
      ]), true);
    
    assert('vble-book-dim-neg-1', () => _isEqual( b.vble(-1),
      [ { Student: 'Alice', Subject: 'math', Term: 'Autumn', entry: 11 },
        { Student: 'Bob', Subject: 'math', Term: 'Autumn', entry: 12 },
        { Student: 'Cath', Subject: 'math', Term: 'Autumn', entry: 13 },
        { Student: 'Alice', Subject: 'biol', Term: 'Autumn', entry: 14 },
        { Student: 'Bob', Subject: 'biol', Term: 'Autumn', entry: 15 },
        { Student: 'Cath', Subject: 'biol', Term: 'Autumn', entry: 16 },
        { Student: 'Alice', Subject: 'chem', Term: 'Autumn', entry: 17 },
        { Student: 'Bob', Subject: 'chem', Term: 'Autumn', entry: 18 },
        { Student: 'Cath', Subject: 'chem', Term: 'Autumn', entry: 19 },
        { Student: 'Alice', Subject: 'phys', Term: 'Autumn', entry: 20 },
        { Student: 'Bob', Subject: 'phys', Term: 'Autumn', entry: 21 },
        { Student: 'Cath', Subject: 'phys', Term: 'Autumn', entry: 22 },
        { Student: 'Alice', Subject: 'math', Term: 'Spring', entry: 23 },
        { Student: 'Bob', Subject: 'math', Term: 'Spring', entry: 24 },
        { Student: 'Cath', Subject: 'math', Term: 'Spring', entry: 25 },
        { Student: 'Alice', Subject: 'biol', Term: 'Spring', entry: 26 },
        { Student: 'Bob', Subject: 'biol', Term: 'Spring', entry: 27 },
        { Student: 'Cath', Subject: 'biol', Term: 'Spring', entry: 28 },
        { Student: 'Alice', Subject: 'chem', Term: 'Spring', entry: 29 },
        { Student: 'Bob', Subject: 'chem', Term: 'Spring', entry: 30 },
        { Student: 'Cath', Subject: 'chem', Term: 'Spring', entry: 31 },
        { Student: 'Alice', Subject: 'phys', Term: 'Spring', entry: 32 },
        { Student: 'Bob', Subject: 'phys', Term: 'Spring', entry: 33 },
        { Student: 'Cath', Subject: 'phys', Term: 'Spring', entry: 34 }
      ]), true);
  
    const m = ['a','b','c','d','e','f']
      .$shape([2,3])
      .$key(1,['55',true,55])  //two keys convert to same string
      .$label(1,'COLS');
    
    assert('vble-matrix-dim-0', () => _isEqual( m.vble(0),
      [ { COLS: '55', page: 'p_0', r_0: 'a', r_1: 'b' },
        { COLS: true, page: 'p_0', r_0: 'c', r_1: 'd' },
        { COLS: 55, page: 'p_0', r_0: 'e', r_1: 'f' }
      ]), true);
  
    assert('vble-matrix-dim-1', () => _isEqual( m.vble(1),
      [ { '55': 'e', row: 'r_0', page: 'p_0', true: 'c' },
        { '55': 'f', row: 'r_1', page: 'p_0', true: 'd' }
      ]), true);
        
    assert('vble-matrix-dim-2', () => _isEqual( m.vble(2),
      [ { row: 'r_0', COLS: '55', p_0: 'a' },
        { row: 'r_1', COLS: '55', p_0: 'b' },
        { row: 'r_0', COLS: true, p_0: 'c' },
        { row: 'r_1', COLS: true, p_0: 'd' },
        { row: 'r_0', COLS: 55, p_0: 'e' },
        { row: 'r_1', COLS: 55, p_0: 'f' } 
      ]), true);
    
    assert('vble-matrix-dim-neg-1', () => _isEqual( m.vble([-1]),
      [ { row: 'r_0', COLS: '55', page: 'p_0', entry: 'a' },
        { row: 'r_1', COLS: '55', page: 'p_0', entry: 'b' },
        { row: 'r_0', COLS: true, page: 'p_0', entry: 'c' },
        { row: 'r_1', COLS: true, page: 'p_0', entry: 'd' },
        { row: 'r_0', COLS: 55, page: 'p_0', entry: 'e' },
        { row: 'r_1', COLS: 55, page: 'p_0', entry: 'f' }
      ]), true);
  
    assert.throwEach('throw-vble', [
      () => b.vble(3),
      () => b.vble('1'),
      () => b.vble([[1]]),
      () => b.vble([1,2])
    ]);
    
  }

  console.log('--- at, $at');
  {
    
    const s = [5];
    assert.each('at-singleton-0', [
      [() => s.at(), 5],   
      [() => s.at(0), 5],
      [() => s.at(0,0), 5],
      [() => s.at(0,0,0), 5],
      [() => s.at(0,null,0), 5],
      [() => s.at(-1), 5],
      [() => s.at(-1,-1,-1), 5]
    ]);
    assert.each('$at-singleton-0', [
      [() => {s.$at(6); return s[0]}, 6],
      [() => {s.$at(0,7); return s[0]}, 7],
      [() => {s.$at(-1,8); return s[0]}, 8],
      [() => {s.$at(null,9); return s[0]}, 9],
      [() => {s.$at(undefined,10); return s[0]}, 10],
      [() => {s.$at(undefined,0,11); return s[0]}, 11],
    ]);
    s.$key('a');
    assert.each('at-singleton-1', [
      [() => s.at(), 11],
      [() => s.at(null), 11],
      [() => s.at('a'), 11],
      [() => s.at('a',0), 11]
    ]);
    assert.each('$at-singleton-1', [
      [() => {s.$at(6); return s[0]}, 6],
      [() => {s.$at('a',7); return s[0]}, 7],
      [() => {s.$at(null,8); return s[0]}, 8],
      [() => {s.$at('a',-0,-1,9); return s[0]}, 9],
    ]);
    test('$at-singleton-2', s, [9].$key('a'));
    
    const v = [6,7,8];
    assert.each('at-vector-0', [
      [() => v.at(1), 7],
      [() => v.at(1,0), 7],
      [() => v.at(-2), 7]
    ]);
    assert.each('$at-vector-0', [
      [() => {v.$at([9]); return v[0]}, 9],
      [() => {v.$at(1,10); return v[1]}, 10],
      [() => {v.$at(-1,11); return v[2]}, 11],
      [() => h.equalArray(v,[9,10,11]), true],
    ]);
    const obj = {};
    v.$key(['a',obj,'c']).$key(1,'q').$key(2,'w');
    assert.each('at-vector-1', [
      [() => v.at(obj), 10],
      [() => v.at(obj,'q','w'), 10],
      [() => v.at(obj,null,'w'), 10]
    ]);
    assert.each('$at-vector-1', [
      [() => {v.$at(13); return v[0]}, 13],
      [() => {v.$at(obj,14); return v[1]}, 14],
      [() => {v.$at('c','q','w',15); return v[2]}, 15],
    ]);
    test('$at-vector-2', v, [13,14,15]
         .$key(['a',obj,'c']).$key(1,'q').$key(2,'w'));
    
    const m = [6,7,8,9,10,11].$shape([2,3]);
    assert.each('at-matrix', [
      [() => m.at(), 6],
      [() => m.at(0,2), 10],
      [() => m.at(-1,-1), 11],
      [() => m.at(null,1), 8]
    ]);
    assert.each('$at-matrix-0', [
      [() => {m.$at(13); return m[0]}, 13],
      [() => {m.$at(1,0,14); return m[1]}, 14],
      [() => {m.$at(0,2,15); return m[4]}, 15],
      [() => {m.$at(1,1,16); return m[3]}, 16],
      [() => {m.$at(-1,-1,-1,17); return m[5]}, 17],
    ]);
    test('$at-matrix-1', m, [13,14,8,16,15,17].$shape([2,3]));
    
    const b = [11,12,13,14,15,16,17,18,19,20,
               21,22,23,24,25,26,27,28,29,30,
               31,32,33,34]
      .$shape([3,4,2])
      .$key(['Alice','Bob','Cath'])
      .$key(2,['Autumn','Spring'])
      .$label(0,'Student')
      .$label(1,'Subject')
      .$label(2,'Term');
    assert.each('at-book', [
      [() => b.at(), 11],
      [() => b.at('Bob'), 12],
      [() => b.at('Bob',-1), 21],
      [() => b.at('Alice',2,'Spring'), 29],
      [() => b.at(null,2,'Spring'), 29],
      [() => b.at(null,null,'Spring'), 23],
      [() => b.at(undefined,undefined,'Spring'), 23]
    ]);
    assert.each('$at-book-0', [
      [() => {b.$at(50); return b[0]}, 50],
      [() => {b.$at('Bob',-1,51); return b[10]}, 51],
      [() => {b.$at('Alice',2,'Spring',52); return b[18]}, 52],
      [() => {b.$at(null,1,'Spring',53); return b[15]}, 53],
    ]);
    test('$at-book-1', b, 
      [50,12,13,14,15,16,17,18,19,20,
       51,22,23,24,25,53,27,28,52,30,
       31,32,33,34]
        .$shape([3,4,2])
        .$key(['Alice','Bob','Cath'])
        .$key(2,['Autumn','Spring'])
        .$label(0,'Student')
        .$label(1,'Subject')
        .$label(2,'Term'));
     
    assert.throwEach('throw-at', [
      () => [].at(),
      () => [].at(0),
      () => [].at(null),
      () => [].at(undefined),
      () => v.at(1),
      () => v.at(-1),
      () => v.at('d'),
      () => m.at(1,3),
      () => m.at(1,-4),
    ]);
    
    assert.throwEach('throw-$at', [
      () => [].$at(5),
      () => [].$at(0,5),
      () => [].$at(null,5),
      () => [].$at(undefined,5),
      () => $v.at(1,5),
      () => $v.at(-1,5),
      () => $v.at('c',[5,6]),
      () => m.at(1,3,5),
      () => m.at(1,-4,5),
    ]);
    
  }
  
  console.log('--- vec, $vec');
  {

    test('vec-empty-0', [].vec(), []);
    test('vec-empty-1', [].vec([]), []);
    test('vec-empty-2', [1,0].cube().vec([]), []);
    test('vec-empty-3', [].vec([1,0].cube()), []);
    
    test('$vec-empty-0', [].$vec(5), []);
    test('$vec-empty-1', [].$vec([],5), []);
    test('$vec-empty-2', [1,0].cube().$vec([],5), [1,0].cube());
    test('$vec-empty-3', [].$vec([1,0].cube(),5), []);
    test('$vec-empty-4', [].$vec([], []), []);
    
    const s = [4];
    test('vec-singleton-0', s.vec(), [4]);
    test('vec-singleton-1', s.vec(null), [4]);
    test('vec-singleton-2', s.vec(undefined), [4]);
    test('vec-singleton-3', s.vec(0), [4]);
    test('vec-singleton-4', s.vec(-1), [4]);
    
    test('$vec-singleton-0', s.$vec([],5), [4]);
    test('$vec-singleton-1', s.$vec(5), [5]);
    test('$vec-singleton-2', s.$vec(null,6), [6]);
    test('$vec-singleton-3', s.$vec(undefined,7), [7]);
    test('$vec-singleton-4', s.$vec(0,[8]), [8]);
    test('$vec-singleton-5', s.$vec(-1,9), [9]);
    
    const v = [5,6,7];
    test('vec-vector-0', v.vec(), [5,6,7]);
    test('vec-vector-1', v.vec(null), [5,6,7]);
    test('vec-vector-2', v.vec(0), [5]);
    test('vec-vector-3', v.vec([0]), [5]);
    test('vec-vector-4', v.vec([0,-1]), [5,7]);
    test('vec-vector-5', v.vec([]), []);
    
    test('$vec-vector-0', v.$vec(8), [8,8,8]);
    test('$vec-vector-1', v.$vec(0,9), [9,8,8]);
    test('$vec-vector-2', v.$vec([1],[10]), [9,10,8]);
    test('$vec-vector-3', v.$vec([0,-1],[11,12]), [11,10,12]);
    test('$vec-vector-4', v.$vec([],13), [11,10,12]);
    test('$vec-vector-5', v.$vec([14,15,16]), [14,15,16]);

    const b = [11,12,13,14,15,16,17,18,19,20,
               21,22,23,24,25,26,27,28,29,30,
               31,32,33,34]
      .$shape([3,4,2])
      .$key(['Alice','Bob','Cath'])
      .$key(2,['Autumn','Spring'])
      .$label(0,'Student')
      .$label(1,'Subject')
      .$label(2,'Term');
    
    test('vec-book-0', b.vec(),
         [11,12,13,14,15,16,17,18,19,20,
          21,22,23,24,25,26,27,28,29,30,
          31,32,33,34]);
    test('vec-book-1', b.vec(0), [11]);
    test('vec-book-2', b.vec(-1), [34]);
    test('vec-book-3', b.vec([4]), [15]);
    test('vec-book-4', b.vec([4,10]), [15,21]);
    test('vec-book-5', b.vec([4,-1,-2,-1,4]), [15,34,33,34,15]);
    test('vec-book-6', b.vec([]), []);
    
    b1 = b.copy();
    b1.$vec(50);
    b1.$vec(0,51);
    b1.$vec(-1,52);
    b1.$vec([2,10,-2],53);
    b1.$vec([5,3,5,6].$shape([1,4]), [54,55,56,57].$shape([2,2]));
    test('$vec-book-0', b1, 
       [51,50,53,55,50,56,57,50,50,50,
        53,50,50,50,50,50,50,50,50,50,
        50,50,53,52]
      .$shape([3,4,2])
      .$key(['Alice','Bob','Cath'])
      .$key(2,['Autumn','Spring'])
      .$label(0,'Student')
      .$label(1,'Subject')
      .$label(2,'Term')); 
        
    assert.throwEach('throw-vec-0', [
      () => [].vec(0),
      () => [].vec([0]),
      () => [].vec([0,1]),
      () => v.vec(3),
      () => v.vec([2,3]),
      () => v.vec(-4),
      () => v.vec('0'),
    ]);
    
    assert.throwEach('throw-$vec-0', [
      () => [].$vec(0,5),
      () => [].$vec([0],5),
      () => [].$vec([0,1],5),
      () => [].$vec([],[5,6]),
      () => v.$vec('0',5),
      () => v.$vec([5,6]),
      () => v.$vec(2,[5,6]),
      () => v.$vec([0,1],[5,6,7]),
      () => v.$vec(3,5),
      () => v.$vec([2,3],5),
      () => v.$vec(-4,5),
      () => v.$vec(),
      () => v.$vec(0,1,2),
    ]);
    
    v.$key(['a','b','c']);
    assert.throwEach('throw-vec-1', [
      () => v.vec('a'),
      () => v.vec(['b','c']),
    ]);

    assert.throwEach('throw-$vec-1', [
      () => v.$vec('a',50),
      () => v.$vec(['b','c'],[51,52]),
    ]);
    
  }
  
  console.log('--- which');
  {  
    test('which-empty-0', [].which(), []);
    test('which-empty-1', [].which(a => true), []);
    test('which-empty-2', [1,0].cube().which(), []);
    test('which-empty-3', [1,0].cube().which(a => true), []);
  
    test('which-singleton-0', [5].which(), [0]);
    test('which-singleton-1', [0].which(), []);
    test('which-singleton-2', [5].which(a => a > 2), [0]);
    test('which-singleton-3', [0].which(a => a > 2), []);

    const v = ['', 5, false, true, null, undefined];
    test('which-vector-0', v.which(), [1,3]);
    test('which-vector-1', v.which(undefined), [1,3]);
    test('which-vector-2', v.which(a => !a), [0,2,4,5]);
    test('which-vector-3', v.which([a => !a]), [0,2,4,5]);
    test('which-vector-4', v.which((a,i) => i % 2 === 0), [0,2,4]);
    test('which-vector-5', v.which((a,i,u) => typeof u[i] === 'boolean'), [2,3]);
    test('which-vector-6', [4].cube().which(), []);
    test('which-vector-7', [4].cube().which(a => !a), [0,1,2,3]);
    test('which-vector-8', [4].cube(1).which(), [0,1,2,3]);
  
    const b = [11,12,13,14,15,16,17,18,19,20,
               21,22,23,24,25,26,27,28,29,30,
               31,32,33,34]
      .$shape([3,4,2])
      .$key(['Alice','Bob','Cath'])
      .$key(2,['Autumn','Spring'])
      .$label(0,'Student')
      .$label(1,'Subject')
      .$label(2,'Term');
    const allInd = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
    test('which-book-0', b.which(), allInd);
    test('which-book-1', b.which(a => a > 20 && a % 4 === 0), [13,17,21]);
    test('which-book-2', b.which(a => a > 100), []);
    test('which-book-3', b.which(a => a > 10), allInd);
    
    assert.throwEach('throw-which', [
      () => [1,0,2].which(null),
      () => [1,0,2].which([[a => a]]),
    ]);
  
  }
  
  
  console.log('\nTests finished');
}





















