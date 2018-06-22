{
	'use strict';
      
  const helper = {
  
    //used by error messages
    dimName: ['row', 'column', 'page'],
    shortDimName: ['row', 'col', 'page'],
    
    lettersArray: [
      'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
      'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'
    ],
    
    //array/cube -> array, shallow copy array
    copyArray: a => {
      const n = a.length;
      const b = new Array(n);
      for (let i=0; i<n; i++) {
        b[i] = a[i];
      }
      return b;
    },
                            
    //array/cube, array/cube -> bool, true if args same length
    //and all entries equal (===), owise false
    equalArray: (a, b) => {
      var n = a.length;
      if (n !== b.length) return false;
      for (var i=0; i<n; i++) { 
        if (a[i] !== b[i]) return false;
      }
      return true;
    },
    
    //array/cube, array/cube -> bool. Returns true if args are
    //arrays-of-arrays and are equal: same outer length, same inner
    //lengths, same (===) inner entries.
    equalArrayOfArray:(a,b) => {
      if (!Array.isArray(a) || !Array.isArray(b)) return false;
      const n = a.length;
      if (n !== b.length) return false;
      for (let i=0; i<n; i++) {
        if (!Array.isArray(a[i]) || !Array.isArray(b[i])) return false;
        if (!helper.equalArray(a[i], b[i])) return false;
      }
      return true;
    },
    
    //map -> map, shallow copy map; both keys and values are
    //shallow copied
    copyMap: m => {
      const q = new Map();
      for (let [k,v] of m.entries()) {
        q.set(k,v);
      }
      return q;
    },
    
    //map, map -> bool, true if maps have same size, keys (===),
    //values (===) and iterate in same order, owise false
    equalMap: (a, b) => {
      if (a.size !== b.size) return false;
      const bIter = b.entries();
      for (let [ak,av] of a.entries()) {
        let [bk,bv] = bIter.next().value;
        if (ak !== bk || av !== bv) return false;
      }
      return true;
    },
    
    //[*, *, *, *, ...] -> map, new map from args: key, val, key, val ...
    //  -error if duplicate keys
    toMap: (...args) => {
      const n = args.length;
      if (n % 2 !== 0) throw Error('even number of arguments expected');
      const mp = new Map();
      for (let i=0; i<n; i+=2) {
        mp.set(args[i], args[i+1]);
      }
      if (mp.size !== n/2) throw Error('duplicate key');
      return mp;      
    },
        
    //array/cube -> map, k is the keys, values are 0, 1, 2, ...
    //  -error if duplicate keys
    //  -error if any keys are undefined or null
    keyMap: k => {
      const n = k.length;
      const mp = new Map();
      for (let i=0; i<n; i++) {
        let ki = k[i];
        if (ki === undefined || ki === null) throw Error(`invalid key: ${ki}`);
        mp.set(ki,i);
      }
      if (mp.size !== n) throw Error('duplicate key');
      return mp;
    },
        
    //num -> array, 0,1,...,len-1, asserts len is a non-neg int  
    simpleRange: len => {
      len = assert.nonNegInt(len);
      var a = new Array(len);
      for (var i=0; i<len; i++) { 
        a[i] = i;
      }
      return a;
    },
    
    //num -> array, returns array of length s containing 0 to
    //s-1 shuffled, assert s is a +ve int
    shuffle: s => {
      s = assert.posInt(s);
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
        
    //array/cube, * -> array/cube, assign val to each entry of x;
    //fast version of Array.fill()
    fill: (x,val) => {
      const n = x.length;
      for (let i=0; i<n; i++) {
        x[i] = val;
      }
      return x;
    },
    
    //array/cube ,array/cube -> array/cube, fill entrywise: set
    //entries of x to corresp entries of y
    fillEW: (x,y) => {
      const n = x.length;
      if (y.length !== n) throw Error('shape mismatch');
      for (let i=0; i<n; i++) {
        x[i] = y[i];
      }
      return x;
    },
        
    //* -> bool, true if s a singleton, false owise
    isSingle: s => {
      if (Array.isArray(s)) return s.length === 1;
      return true;
    },
    
    //* -> array, if s an array, return s; owise wrap s in
    //an array and return the array
    toArray: s => {
      return Array.isArray(s) ? s : [s]; 
    },
    
    //* -> [*, bool] = [processed-s, s-a-singleton?], if s is
    //a 1-entry array, processed-s is the entry, owise it is s
    polarize: s => {
      if (Array.isArray(s)) {
        return s.length === 1 ? [s[0], true] : [s, false];
      }
      return [s, true];
    },
    
    //*, * -> *, returns v if a is undefined, otherwise returns a  
    def: (a,v) => {
      return a === undefined ? v : a;
    },
    
    //str, * -> undef, add property to Array.prototype
    addArrayMethod: (name,f) => {
      if (name in Array.prototype) {
        throw Error(name + ' is already a property of Array.protoype');      
      }
      Object.defineProperty( Array.prototype, name, {
        value: f,
        configurable: true,
        enumerable: false,
        writable: true
      });
    },
      
    //cube, str ->, used by ensureKey/ensureLabel to add property
    //_k/_l if does not already exist
    ensure: (x,s) => {
      if (!x[s]) {  //is truthy if exists
        Object.defineProperty(x, s, {
          value: new Array(3),
          configurable: true,
          writable: true
        });
      }
    },
    
    //cube ->, add _k property to cube if does not exist
    ensureKey: x => {
      helper.ensure(x,'_k');
    },
      
    //cube ->, add _l property to cube if does not exist
    ensureLabel: x => {
      helper.ensure(x,'_l');
    },
    
    //cube, cube[, num] ->, copy keys/labels of a (where
    //they exist) to b. If except is passed, do not copy
    //on this dimension. Assume:
    // -dims where copy keys have same length
    // -b currently has no keys or labels
    copyKey: (a, b, except) => {
      if (a._k) {
        for (let d=0; d<3; d++) {
          if (d === except) continue;
          if (a._k[d]) {
            helper.ensureKey(b);  
            b._k[d] = helper.copyMap(a._k[d]);
          }
        }
      }
    },
    copyLabel: (a, b, except) => {
      if (a._l) {
        for (let d=0; d<3; d++) {
          if (d === except) continue;
          if (a._l[d]) {
            helper.ensureLabel(b);  
            b._l[d] = a._l[d];
          }
        }
      }
    },
        
    //cube -> 'skeleton': copy _s, _k and _l properties of
    //a to an empty array. Returned array is NOT a valid cube.
    //Keys/label not copied on dimension exceptKey/Label - all
    //dims copied if exceptKey/Label omitted or undefined.
    skeleton: (a, exceptKey, exceptLabel) => {
      const b = [];
      Object.defineProperty(b, '_s', {
        value: helper.copyArray(a._s),
        writable: true
      });
      helper.copyKey(a,b,exceptKey);
      helper.copyLabel(a,b,exceptLabel);
      return b;
    },
    
    //num, num -> num: non-neg index corresponding to q
    //for a dimension of length len
    //  -checks q is a valid index
    //  -len assumed a non-neg-int
    nni: (q, len) => {
      if (!Number.isInteger(q)) throw Error('integer expected');
      if (q >= len || q < -len) throw Error('index out of bounds');
      return q < 0 ? q + len : q;
    },

    //*, *, map -> array: keys in map mp from sk to ek
    //inclusive
    //  -sk undef/null: use first key
    //  -ek undef/null: use last key
    rangeKey: (sk, ek, mp) => {
      const a = new Array(mp.size);
      let state = (sk === null || sk === undefined) ? 1 : 0;
      const use_ek = ek !== null && ek !== undefined;
      let j = 0;
      for (let k of mp.keys()) {
        if (state) {  //adding keys
          a[j++] = k;
          if (use_ek && k === ek) {
            state = 2;
            break;
          }
        }
        else {  //not adding keys yet
          if (k === sk) {
            a[j++] = k;
            if (use_ek && sk === ek) {
              state = 2;
              break;
            }
            else state = 1;
          }
        }
      }      
      if (state === 0) throw Error ('start key does not exist');
      if (use_ek && state === 1) throw Error('end-key does not exist or is before start-key');
      a.length = j; 
      return a;
    },
  
    //num, map -> array: first n keys of map mp - or all
    //keys if map size less than n 
    firstKey: (n, mp) => {
      const a = new Array(n);
      let j = 0;
      for (let k of mp.keys()) {
        if (j === n) break;
        a[j++] = k;
      }
      a.length = j;  //in case map size less than n
      return a;
    },
    
    //num, num -> array: step from int s to int e inclusive;
    //e >= s so returned array is never empty
    rangeInd: (s, e) => {
      if (e < s) throw Error ('end less than start');
      const a = new Array(e - s + 1);
      let j = 0;
      for (let i=s; i<=e; i++) a[j++] = i;
      return a;
    },
        
    //array, num -> array: check a contains valid inds for a
    //dimension of length nd; convert neg inds to non-neg
    indInd: (a, nd) => { 
      const n = a.length;
      const b = new Array(n);
      for (let i=0; i<n; i++) b[i] = helper.nni(a[i], nd);
      return b;
    },
    
    //array, map -> array, values corresponding to keys k
    //of map mp; checks values not undefined    
    keyInd: (k, mp) => {
      const n = k.length;
      const b = new Array(n);
      for (let i=0; i<n; i++) {
        let val = mp.get(k[i]);
        if (val === undefined) throw Error('key does not exist');
        b[i] = val;
      }
      return b;
    },
    
    //func -> num, time in ms to execute synchronous function f
    //  -uses process so only works in node
    timer: f => {
      const start = process.hrtime();
      f();
      const t = process.hrtime(start);
      return Math.round((t[0]*1e9 + t[1])/1e6);
    }
          
  }
  
  //letters map
  {
    const ar = helper.lettersArray;
    const mp = new Map();
    for (let i=0; i<ar.length; i++) {
      mp.set(ar[i],i);
    }
    helper.lettersMap = mp;
  }
  
  const assert = {
    
    //* -> num, s must be an integer, returns s
    int: s => { 
      if (!Number.isInteger(s)) {
        throw Error('integer expected');
      }
      return s;
    },
	
    //* -> num, s must be a non-neg integer, returns s
    nonNegInt: s => { 
      if (!Number.isInteger(s) || s < 0) {
        throw Error('non-negative integer expected');
      }
      return s;
    },

    //* -> num, s must be a +ve integer, returns s
    posInt: s => {
      if (!Number.isInteger(s) || s <= 0) {
        throw Error('positive integer expected');
      }
      return s;
    },
    
    //* -> num, s must be a number, returns s
    number: s => {
      if (typeof s !== 'number') throw Error('number expected');
      return s;
    },
    
    //* -> num, s must be a singleton whose value is undefined, 0, 1 or 2;
    //returns value of singleton - except returns 0 if value is undefined
    dim: s => {
      s = assert.single(s);
      if (s === undefined) return 0;
      if (s !== 0 && s !== 1 && s !== 2) throw Error('invalid dimension');
      return s;
    },
    
    //* -> *, s must be a singleton, returns the singleton value
    single: s => {
      if (Array.isArray(s)) {
        if (s.length !== 1) throw Error('singleton expected');
        return s[0];
      }
      return s;
    },
    
    //* -> func, assert f a function, return f
    func: f => { 
      if (typeof f !== 'function') throw Error('function expected');
      return f;
    },
    
    //array-like, num, num ->, a should be arguments 'array' or arguments
    //from rest param - error messages are specific to this
    argRange: (a,mn,mx) => {
      const n = a.length;
      if (n < mn) throw Error('too few arguments');
      if (n > mx) throw Error('too many arguments');
      return n;
    },
    
    //cube ->, throw error if not a matrix with at least 1 col
    dataMatrix: a => {
      if (a._s[2] !== 1 || a._s[1] === 0) {
        throw Error('matrix with at least 1 column expected');
      }
    }
    
  };

  helper.assert = assert;
  module.exports = helper;
}