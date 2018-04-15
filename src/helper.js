/*
Comments notation:
  str, num, bool, regex, date, func:
      -args assumed to be of this type 
      -if prefixed with '>' (eg >str), arg is implicitly or explicitly converted
  obj: object
  ar: array
  cu: cube
  ac: array or cube 
  *: anything
*/

{
	"use strict";
  
  let assert = require('./assert.js');
    
  let helper = {
  
    //used by error messages
    expandDim: {r:'row', c:'column', p:'page'},

    lettersJSA: ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
                 'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
    lettersJSO: {
        a:0, b:1, c:2, d:3, e:4, f:5, g:6, h:7, i:8, j:9, k:10, l:11, m:12, n:13, o:14, p:15, q:16, r:17, s:18, t:19, u:20, v:21, w:22, x:23, y:24, z:25,
        A:26, B:27, C:28, D:29, E:30, F:31, G:32, H:33, I:34, J:35, K:36, L:37, M:38, N:39, O:40, P:41, Q:42, R:43, S:44, T:45, U:46, V:47, W:48, X:49, 
        Y:50, Z:51},
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

    //stem of JS get/set function - used by Date.prototype._add
    timeUnits: {year:'FullYear', month:'Month', day:'Date', hour:'Hours', minute:'Minutes', second:'Seconds', milli:'Milliseconds'},

    //obj->bool, true if o not an obj or o and its
    //proto chain have no enum props, owise false
    isEmpty: o => {
      if (typeof o !== 'object') return true;
      for (var i in o) return false;
      return true;
    },
    //ac,ac->bool, true if args same length and all
    //entries equal (===), owise false
    //  -cubes are treated as arrays
    shallowEqualAr: (a, b) => {
      var n = a.length;
      if (n !== b.length) return false;
      for (var i=0; i<n; i++) { if (a[i] !== b[i]) return false }
      return true;
    },
    //ac->ar, shallow copy array
    //  -a cube is treated as an array
    shallowCopyAr: a => {
      var n = a.length;
      var b = new Array(n);
      for (var i=0; i<n; i++) b[i] = a[i];
      return b;
    },
    //ac->ar, shallow copy array, but convert each
    //entry to a string
    //  -a cube is treated as an array
    shallowCopyAr_toStr: a => {
      var n = a.length;
      var b = new Array(n);
      for (var i=0; i<n; i++) b[i] = '' + a[i];
      return b;
    },
    //ac->bool, true if no entries of a are repeated
    //according to ===, owise false
    //  -a cube is treated as an array
    uniqueAr: a => { 
      for (var i=1, n=a.length; i<n; i++) {
        for (var j=0; j<i; j++) {
          if (a[i] === a[j]) return false;
        }
      }
      return true;
    },    
    //ac->bool, true if no entries of a convert to
    //the same string, owise false
    //  -a cube is treated as an array
    uniqueAr_strEq: a => {
      var seen = {};
      var ent;
      for (var i=0, n=a.length; i<n; i++) {
        ent = a[i];
        if (seen[ent]) return false;
        else seen[ent] = 1;
      }
      return true;
    },
    //num->ar, 0,1,...,len-1, asserts len converts to
    //non-neg int  
    simpleRangeAr: len => {
      len = +assert.nonNegInt(len);
      var a = new Array(len);
      for (var i=0; i<len; i++) a[i] = i;
      return a;
    },
    //obj->num, emun props in o and its proto chain
    countProps: o => {
      var i = 0;
      for (var k in o) i++;
      return i;
    },
    //obj,obj->bool, true if no common enum props in
    //a and b (including proto chains), owise false
    mutExProps: (a, b) => {
      for (var i in b) {
        if (i in a) return false;
      }
      return true;
    },
    //obj->obj, flips keys (enum props, includes proto
    //chain) and values - no checking for repeated values
    keyValFlip: p => {
      var q = {};
      for (var i in p) q[p[i]] = i; 
      return q;
    },
    //num->ar, returns array of length s containing 0 to
    //s-1 shuffled, assert s is a +ve int
    shuffle: s => {
      s = +assert.posInt(s);
      var v = new Array(s);
      var j;
      v[0] = 0;
      for (var i=1; i<s; i++) {
        j = Math.floor(Math.random()*(i + 1));
        v[i] = v[j];
        v[j] = i;
      }
      return v;
    },
            
    //func->num, time in ms to execute synchronous function f; Node.js only
    timer: f => {
      const start = process.hrtime();
      f();
      const t = process.hrtime(start);
      return Math.round((t[0]*1e9 + t[1])/1e6);
    },
    
    //ac,*->ac, assign val to each entry of x; fast version of Array.fill()
    fill: (x,val) => {
      if (val !== undefined) {
        const n = x.length;
        for (let i=0; i<n; i++) x[i] = val;
      }
      return x;
    },

    //ac,ac->ac, fill entrywise: set entries of x to corresp entries of y
    fillEW: (x,y) => {
      const n = x.length;
      if (y.length !== n) throw new Error('shape mismatch');
      for (let i=0; i<n; i++) x[i] = y[i];
      return x;
    },

    //*->num, 0 if not array, 1 if 1-entry array, 2 otherwise (array with 0 or 2+ entries)
    kind: x => { 
      if (!Array.isArray(x)) return 0;
      if (x.length === 1) return 1;
      return 2;
    },

    //*->*, make length property writable or not-writable
    lengthNonWritable: x => Object.defineProperty(x, 'length', { writable: false }),

  
    
    
    
        
    //===========================================================
    // !!! FROM HERE: UPDATED AND BRIEFLY CHECKED; NEED CHECKED AND
    // TESTED ONCE CUBES IMPLEMEMTED !!!!
    //===========================================================  
  
    //cu,ac->ar, cols are col inds/keys of x,
    //returns corresponding non-neg inds, error if
    //duplicate in the non-neg inds 
    colInd: function(x,cols) {
      var n = cols.length;
      var inds = new Array(n);
      for (var i=0; i<n; i++) inds[i] = x._getInd(cols[i],'c');
      if (!helper.uniqueJSA_strEq(inds)) throw new Error('duplicate in argument');
      return inds;
    },
  }
  
  module.exports = helper;
}