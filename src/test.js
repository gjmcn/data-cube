{	
	"use strict";
	
	const assert = require('data-cube-assert');
	const dcAssert = require('./assert.js');
	const helper = require('./helper.js');
	//	const dc = require('./dc.js.js');
	
  
  console.log('Testing data-cube assertion functions');
	{
		assert.each(
			'assert-non-neg-int', [
				[() => dcAssert.nonNegInt(5), 5],
				[() => dcAssert.nonNegInt(0), 0],
				[() => dcAssert.nonNegInt('2'), '2']
		  ]
		);
		assert.throwEach(
			'invalid-non-neg-int',
			[
				() => dcAssert.nonNegInt(-2),
				() => dcAssert.nonNegInt(1.2),
				() => dcAssert.nonNegInt(Infinity),
				() => dcAssert.nonNegInt(NaN)
		  ]
		);
			
    assert.each(
			'assert-pos-int', [
				[() => dcAssert.posInt(5), 5],
				[() => dcAssert.posInt('2'), '2']
		  ]
		);
		assert.throwEach(
			'invalid-pos-int',
			[
				() => dcAssert.posInt(-2),
        () => dcAssert.posInt(0),
				() => dcAssert.posInt(1.2),
				() => dcAssert.posInt(Infinity),
				() => dcAssert.posInt(NaN)
		  ]
		);
    
    assert.each(
			'assert-shape-array', [
				[() => dcAssert.shapeArray([2]),undefined],
				[() => dcAssert.shapeArray([2,3]),undefined],
				[() => dcAssert.shapeArray([2,3,4]),undefined],
				[() => dcAssert.shapeArray([2,0,1]),undefined]
		  ]
		);
    assert.throwEach(
			'invalid-shape-array',
      [
				() => dcAssert.shapeArray([1.2]),
				() => dcAssert.shapeArray([2,-1]),
        () => dcAssert.shapeArray([]),
        () => dcAssert.shapeArray([2,3,4,5])
      ]
    );
    
	}
  
  
  console.log('Testing helper.js');
  {
    let h = helper;
    let shEq = h.shallowEqualAr;
    
    assert('assert-is-empty-1', () => h.isEmpty([]), true);
    assert('assert-is-empty-2', () => h.isEmpty([5]), false);
    
    assert('assert-shallow-equal-ar-1',
           () => shEq([2,'a'],[2,'a']),
           true);
    assert('assert-shallow-equal-ar-2',
           () => shEq([2,'a'],[2,'b']),
           false);
    assert('assert-shallow-equal-ar-3',
           () => shEq([2,'a',true],[2,'a']),
           false);

    assert('assert-shallow-copy-ar-1',
           () => shEq(h.shallowCopyAr([2,'a']), [2,'a']),
           true);
    
    assert('assert-shallow-copy-ar-to-str-1',
           () => shEq(h.shallowCopyAr_toStr([2,'a']), ['2','a']),
           true);
    
    assert('unique-ar-1', () => h.uniqueAr([]), true);
    assert('unique-ar-2', () => h.uniqueAr([5]), true);
    assert('unique-ar-3', () => h.uniqueAr([5,6]), true);
    assert('unique-ar-4', () => h.uniqueAr([5,'5']), true);
    assert('unique-ar-5', () => h.uniqueAr([5,5]), false);
    assert('unique-ar-6', () => h.uniqueAr([5,6,5]), false);
    
    assert('unique-ar-str-eq-1', () => h.uniqueAr_strEq([]), true);
    assert('unique-ar-str-eq-2', () => h.uniqueAr_strEq([5]), true);
    assert('unique-ar-str-eq-3', () => h.uniqueAr_strEq([5,6]), true);
    assert('unique-ar-str-eq-4', () => h.uniqueAr_strEq([5,'5']), false);
    assert('unique-ar-str-eq-5', () => h.uniqueAr_strEq([5,5]), false);
    assert('unique-ar-str-eq-6', () => h.uniqueAr_strEq([false,6,'false']), false);
    
    assert('simple-range-ar-1', () => shEq(h.simpleRangeAr(0), []), true);
    assert('simple-range-ar-2', () => shEq(h.simpleRangeAr(1), [0]), true);
    assert('simple-range-ar-3', () => shEq(h.simpleRangeAr(2), [0,1]), true);
    assert('simple-range-ar-4', () => shEq(h.simpleRangeAr(3), [0,1,2]), true);
    
    assert('count-props-1', () => h.countProps({}), 0);
    assert('count-props-2', () => h.countProps({a: 5}), 1);
    assert('count-props-3', () => h.countProps({a: 5, b: 'c'}), 2);
    
    assert('mut-ex-props-1', () => h.mutExProps({}, {}), true);
    assert('mut-ex-props-2', () => h.mutExProps({a:5}, {b:6}), true);
    assert('mut-ex-props-3', () => h.mutExProps({a:5, b:6}, {c:5, d:6}), true);
    assert('mut-ex-props-4', () => h.mutExProps({a:5}, {a:6}), false);
    assert('mut-ex-props-5', () => h.mutExProps({a:5, b:6}, {c:7, a:8}), false);
    
    assert('key-val-flip-1',
      () => shEq(Object.keys(h.keyValFlip({a:5, b:6})), ['5','6']),
      true);
        
    assert('fill-1', () => h.shallowEqualAr( h.fill(new Array(1), 5), [5] ), true);
    assert('fill-2', () => h.shallowEqualAr( h.fill(new Array(2), 'a'), ['a','a']), true);
    assert('fill-3', () => Array.isArray(h.fill([], 5)), true);
    assert('fill-4', () => h.fill([], 5).length, 0);
    
    assert('fill-ew-1', () => h.shallowEqualAr( h.fillEW([4], [5]), [5] ), true);
    assert('fill-ew-2', () => h.shallowEqualAr( h.fillEW(new Array(2), [5,'a']), [5,'a'] ), true);
    assert('fill-ew-3', () => Array.isArray(h.fillEW([], [])), true);
    assert('fill-ew-4', () => h.fillEW([], []).length, 0);
    assert.throw('invalid-fill-ew-1', () => h.fillEW(new Array(3), [5,'a']));

    assert('kind-1', () => h.kind(5), 0);
    assert('kind-2', () => h.kind({a:5}), 0);
    assert('kind-3', () => h.kind([5]), 1);
    assert('kind-4', () => h.kind([[5,6]]), 1);
    assert('kind-5', () => h.kind([5,6]), 2);
    assert('kind-6', () => h.kind([]), 2);

    
  
  }
  

  console.log('Tests finished');
}














