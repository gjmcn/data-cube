{
	'use strict';
      
  const helper = {
    
    //func -> num, time in ms to execute synchronous function f;
    timer: f => {
      const start = process.hrtime();
      f();
      const t = process.hrtime(start);
      return Math.round((t[0]*1e9 + t[1])/1e6);
    }
    
  }
    
  module.exports = helper;
    
}