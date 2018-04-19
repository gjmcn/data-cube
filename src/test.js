{	
	'use strict';
	
	const assert = require('data-cube-assert');
	require('./data-cube.js');
	  
  console.log('Testing compare');
  {
    //create tested arrays/cubes from scratch (i.e. without
    //cube methods) since compare used to test all cube methods
    s = 5
    a = [5, 'abc', false, {}];
    ae = [];
    a1 = [5];
    v = [5, 'abc', false, {}];
    v._d_c_ = {r:4, c:1, p:1};
    ve = [];
    ve._d_c_ = {r:0, c:1, p:1};
    v1 = [5];
    v1._d_c_ = {r:1, c:1, p:1};
    m = [10,11,12,13,14,15];
    m._d_c_ = {r:2, c:3, p:1};
    
    
    
  }
  
  
  
  console.log('Tests finished');
}














