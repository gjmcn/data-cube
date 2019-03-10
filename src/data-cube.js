
(() => {
  'use strict';
  
  //--------------- prep ---------------//

	const helper = require('./helper.js');
  
  const { 
    assert, fill, fillEW, addArrayMethod, keyMap,
    isSingle, polarize, def, toArray, copyArray, copyMap,
    ensureKey, ensureLabel, nni, copyKey, copyLabel, skeleton,
    sortInPlace, sortIndex, sortRank, rangeInd, keyInd, indInd,
    callUpdate
  } = helper;
  
  //helper is an object, but can use addArrayMethod for any property
  addArrayMethod('_helper', helper);
      
  //methods use standard accessors for these properties; if an 
  //absent property is on the prototype chain, methods will
  //incorrectly treat it as instance-level 
  ['_data_cube', '_s', '_k', '_l', '_b', '_a'].forEach(prop => {
    if (prop in Array.prototype) {
      throw Error(prop + ' is a property of Array.prototype'); 
    }
  });
    
    
  //--------------- restrict native mutator methods ---------------//
  
  {
    const orig = {};
    ['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift',
     'sort', 'splice', 'unshift'].forEach(nm => {
      orig[nm] = Array.prototype[nm];
      delete Array.prototype[nm];
      addArrayMethod(nm, function() {
        return orig[nm].apply(this.toArray(), arguments);
      });
    }); 
  }

  
  //--------------- convert array <-> cube ---------------//
    
  //array/cube -> cube
  addArrayMethod('toCube', function() {
    if (!this._data_cube) {
      this._data_cube = true;
      this._s = [this.length, 1, 1];
    }
    return this;
  });
  
  //array/cube -> array
  addArrayMethod('toArray', function() {
    if (this._data_cube) {
      delete this._data_cube;
      delete this._s;
      if (this._k) delete this._k;
      if (this._l) delete this._l;
      if (this._b) delete this._b;
      if (this._a) delete this._a;
    }
    return this;
  });
  
  
  //--------------- compare ---------------//
  
  //array/cube[, bool] -> cu/false
  addArrayMethod('compare', function(b, asrt) {
    this.toCube();
    asrt = def(assert.single(asrt), true);
    if (this === b) return this;
    let done;
    if (asrt) done = msg => { throw Error(msg) };
    else done = () => false;
    if (!Array.isArray(b)) return done('cube compared to non-array');
    const n = this.length;
    if (n !== b.length) return done('number of entries not equal')
    for (let i=0; i<n; i++) {
      if (this[i] !== b[i]) return done(`entries at vector index ${i} not equal`);
    }
    if (b._data_cube) {
      if (!helper.equalArray(this._s, b._s)) return done(`shape not equal`);
      const tk = this._k;
      const bk = b._k;
      if (tk) {
        if (!bk) return done('keys-indices');
        for (let i=0; i<3; i++) { //both this and b have keys on at least one dim
          if (tk[i]) {
            if (!bk[i]) return done(`keys-indices, ${helper.dimName[i]}s`);
            if (!helper.equalMap(tk[i],bk[i])) return done(`${helper.dimName[i]} keys not equal`);    
          }
          else if (bk[i]) return done('indices-keys');
        }
      }
      else if (bk) return done('indices-keys');
      const tl = this._l;
      const bl = b._l;
      if (tl) {
        if (!bl) return done('labels not equal or not used on same dimensions');
        if (!helper.equalArray(tl,bl)) {
          return done('labels not equal or not used on same dimensions');
        }
      }
      else if (bl) return done('labels not equal or not used on same dimensions');
    }
    else {  //b is a standard array  
      if (this._s[1] !== 1 || this._s[2] !== 1) return done('shape not equal');
      if (this._k) return done('keys-indices');
      if (this._l) return done('labels not equal or not used on same dimensions');
    }
    return this;
  });

  
  //--------------- create cube/array ---------------//
  
  //[*] -> cube, new cube from shape array
  addArrayMethod('cube', function(val) {
    if (this.length > 3) throw Error('shape cannot have more than 3 entries');
    const r = this[0] === undefined ? 1 : assert.nonNegInt(this[0]);  
    const c = this[1] === undefined ? 1 : assert.nonNegInt(this[1]);  
    const p = this[2] === undefined ? 1 : assert.nonNegInt(this[2]); 
    const z = new Array(r*c*p);
    z._data_cube = true;
    z._s = [r, c, p];
    var [val,valSingle] = polarize(val);
    if (val !== undefined) (valSingle ? fill : fillEW)(z, val);
    return z;
  });
      
  //[num] -> cube, random cube
  addArrayMethod('rand', function(mx) {
    mx = assert.single(mx);
    const z = this.cube();
    const n = z.length;
    if (mx !== undefined) {
      const lim = assert.posInt(+mx) + 1;
      for (let i=0; i<n; i++) z[i] = Math.floor(Math.random()*lim);
    }
    else {
      for (let i=0; i<n; i++) z[i] = Math.random();
    }
    return z;
  });

  //[num, num] -> cube, sample from normal distribution
  addArrayMethod('normal', function(mu, sig) {
    const sampleNormal = () => {
      let u, v, s;
      while (1) {
        u = Math.random() * 2 - 1;
        v = Math.random() * 2 - 1;
        s = u*u + v*v;
        if (s > 0 && s < 1) return u * Math.sqrt((-2 * Math.log(s)) / s);
      }
    }; 
    mu = +def(assert.single(mu),0);
    sig = +def(assert.single(sig),1);
    if (sig <= 0) throw Error('positive number expected (standard deviation)');
    const z = this.cube();
    const n = z.length;
    for (let i=0; i<n; i++) z[i] = sampleNormal() * sig + mu;
    return z;
  });
  
  //[num, str] -> array
  addArrayMethod('seq', function(s, unit) {
    if (this.length !== 2) throw Error('2-entry array expected');
    const [start, stop] = this;
    s = assert.single(s);
    if (s === undefined) s = 1;
    else {
      s = +s;
      if (!Number.isFinite(s) || s === 0) {
        throw Error('finite, non-zero jump expected');
      }
    }
    unit = assert.single(unit);
    const checkDirection = (a, b, c) => {
      if ((a < b && c < 0) || (a > b && c > 0)) {
        throw new Error('stepping in wrong direction');
      }
    };
    let z;
    if (unit !== undefined) {  //date range
      if (!Number.isInteger(s)) throw Error('date range: integer jump expected');
      if (unit === 'week') {
        s *= 7;
		    unit = 'day';
      }
      const stem = helper.timeUnits.get(unit);
      if (!stem) throw Error('invalid time unit');
      const asDate = a => {
        const t = typeof a;
        let dt;
        if (t === 'string' || t === 'number') dt = new Date(a);
        else if (a instanceof Date) dt = new Date(a.getTime());
        else throw Error('date, string or number expected');
        if (!Number.isFinite(dt.getTime())) throw Error('invalid start or end date');
        return dt;
      };
      const getter = 'get' + stem, 
            setter = 'set' + stem,
            first = asDate(start),
            last  = asDate(stop),
            first_ms = first.getTime(),
            last_ms  = last.getTime();
      if (first_ms === last_ms) z = [first];
      else {
        checkDirection(first_ms, last_ms, s);
        z = [];
        let j = 0,
            d = first,
            test = first_ms < last_ms
              ? () => d.getTime() <= last_ms
              : () => d.getTime() >= last_ms;
        while (test()) {
          z[j++] = d;
          d = new Date(d.getTime());
          d[setter](d[getter]() + s);
        }
      }
    }
    else if (typeof start === 'number') {
      assert.fin(start);
      assert.fin(stop);
      if (start === stop) z = [start];
      else {
        checkDirection(start, stop, s);
        const n = Math.floor((Math.abs(stop - start) + 1e-15) / Math.abs(s)) + 1;
        z = new Array(n);
        for (let i=0; i<n; i++) z[i] = start + i*s;
      }
    }
    else if (typeof start === 'string') {
      if (!Number.isInteger(s)) throw Error('string range: integer jump expected');
      if (typeof stop !== 'string') throw Error('string expected');
      const startInd = helper.lettersMap.get(start);
      const stopInd  = helper.lettersMap.get(stop);
      if (startInd === undefined || stopInd === undefined) {
        throw Error('string range: start or end invalid');
      }
      if (startInd === stopInd) z = [start];
      else {
        checkDirection(startInd, stopInd, s);
        const lettersArray = helper.lettersArray,
              n = Math.floor((stopInd - startInd) / s) + 1;
        z = new Array(n);
        for (let i=0; i<n; i++) z[i] = lettersArray[startInd + i*s];        
      }
    }
    else throw Error('arguments not consistent with number, string or date range');
    return z;
  });
    
  //[num, str] -> array
  addArrayMethod('lin', function(n, ret) {
    if (this.length !== 2) throw Error('2-entry array expected');
    const start = assert.fin(+this[0]),
          stop  = assert.fin(+this[1]);
    n = +def(assert.single(n), 10);
    if (!Number.isInteger(n)) throw Error('number of points: integer expected');
    if (n < 2) throw Error('number of points must be at least 2');
    ret = def(assert.single(ret), 'point');
    if (ret !== 'point' && ret !== 'step') {
      throw Error(`'point' or 'step' expected`);
    }
    let j, z;
    if (start === stop) {
      j = 0;
      z = fill(new Array(n), start);
    }
    else {
      j = (stop - start) / (n - 1);
      z = new Array(n);
      z[0] = start;
      z[n-1] = stop;
      if (n > 2) {
        for (let i=1; i<n-1; i++) z[i] = start + i*j;
      }
    }
    return (ret === 'step') ? [z,j] : z;
  });
  
  //* [, str] -> cube
  addArrayMethod('grid', function(y, ret) {
    y = toArray(y);
    ret = def(assert.single(ret), 'value');
    if (ret !== 'value' && ret !== 'index' && ret !== 'both') {
      throw Error(`'value', 'index' or 'both' expected`);
    }
    const nThis = this.length;
    const ny = y.length;
    const n = nThis * ny;
    let z;
    if (ret === 'value' || ret === 'index') {
      z = [n,2].cube();
      let i;
      if (ret === 'value') { for (i=0; i<n; i++) z[i] = this[i % nThis] }
      else                 { for (i=0; i<n; i++) z[i] = i % nThis }
      for (let j=0; j<ny; j++) {
        if (ret === 'value')  { for (let k=0; k<nThis; k++) z[i++] = y[j] }
        else                  { for (let k=0; k<nThis; k++) z[i++] = j }
      }
    }
    else {
      z = [n,4].cube();
      let i;
      for (i=0; i<n; i++) z[i] = i % nThis;
      for (let j=0; j<n; j++, i++) z[i] = this[i % nThis];
      for (let j=0; j<ny; j++) for (let k=0; k<nThis; k++) z[i++] = j;
      for (let j=0; j<ny; j++) for (let k=0; k<nThis; k++) z[i++] = y[j];
    }
    return z;
  });
  
  
  //--------------- shape ---------------//
  
  //-> 3-entry array
  addArrayMethod('shape', function() {
    this.toCube();
    return copyArray(this._s);
  });
    
  //[number/array] -> cube
  addArrayMethod('$shape', function(shp) {
    this.toCube();
    const origShp = shp;
    if (this._b) callUpdate(this, '_b', '$shape', [origShp]);
    var [shp,shpSingle] = polarize(shp);
    let r = 1;
    let c = 1;
    let p = 1;
    const empty = this.length === 0;
    if (shp === undefined) r = this.length;
    else if (shpSingle) {
      r = assert.nonNegInt(shp);
      if (r === 0) {
        if (!empty) throw Error('number of entries cannot change');
      }
      else if (empty) c = 0;
      else c = assert.nonNegInt(this.length / r);
    }
    else if (shp.length === 2) {
      r = assert.nonNegInt(shp[0]);
      c = assert.nonNegInt(shp[1]);
      if (r*c === 0) {
        if (!empty) throw Error('number of entries cannot change');
      }
      else if (empty) p = 0;
      else p = assert.nonNegInt(this.length / (r*c));
    }
    else if (shp.length === 3) {
      r = assert.nonNegInt(shp[0]);
      c = assert.nonNegInt(shp[1]);
      p = assert.nonNegInt(shp[2]);
      if (r*c*p !== this.length) throw Error('number of entries cannot change');
    }
    else throw Error('shape must have 1-3 entries');    
    this._s[0] = r;
    this._s[1] = c;
    this._s[2] = p;
    if (this._k) delete this._k;
    if (this._l) delete this._l;
    if (this._a) callUpdate(this, '_a', '$shape', [origShp]);
    return this;
  });

  //func -> cube
  addArrayMethod('$$shape', function(f) {
    this.toCube();
    this.$shape((assert.single(f))(this.shape()));
    return this;
  });
  
  //[num] -> bool
  addArrayMethod('n', function(dim) {
    this.toCube();
    dim = assert.dim(dim);
    return this._s[dim];
  });
  
  
  //--------------- $squeeze, tp ---------------//
  
  //-> cube
  addArrayMethod('$squeeze', function() {
    this.toCube();
    if (this._b) callUpdate(this, '_b', '$squeeze', []);
    const lenOne = this._s.map(v => v === 1 ? '1' : 'n').join('');
    let perm;
    const permute = nm => {
      const p = this[nm];
      this[nm] = [ p[perm[0]], p[perm[1]], p[perm[2]] ];  
    };
    if      (lenOne === 'n1n') perm = [0,2,1];
    else if (lenOne === '1nn') perm = [1,2,0];
    else if (lenOne === '1n1') perm = [1,0,2];
    else if (lenOne === '11n') perm = [2,0,1];
    if (perm) {
      permute('_s');
      if (this._k) permute('_k');
      if (this._l) permute('_l');
    }
    if (this._a) callUpdate(this, '_a', '$squeeze', []);
    return this;
  });
    
  //[array] -> cube
  addArrayMethod('tp', function(perm) {
    this.toCube();
    var [perm, permSingle] = polarize(perm);
    if (permSingle) {
      if (perm === undefined) perm = [1,0,2];
      else throw Error('invalid permutation');
    }
    else {
      if (perm.length !== 3) throw Error('invalid permutation');
      perm = perm.map(v => +v);
      for (let d=0; d<3; d++) {
        if (!perm.includes(d)) throw Error('invalid permutation');
      }
    }
    const {_s, _k, _l} = this,
          nrz = _s[perm[0]],
          ncz = _s[perm[1]],
          npz = _s[perm[2]],
          z = [nrz, ncz, npz].cube(),
          mult = [ 1, this._s[0], this._s[0] * this._s[1] ].vec(perm);
    let j = 0;
    for (let p=0; p<npz; p++) {
      let pp = p * mult[2];
      for (let c=0; c<ncz; c++) {
        let cc = c * mult[1];
        for (let r=0; r<nrz; r++) {
          z[j++] = this[r * mult[0] + cc + pp];
        }
      }
    }
    if (_k) {
      ensureKey(z);
      for (let d=0; d<3; d++) {
        if (_k[perm[d]]) z._k[d] = copyMap(_k[perm[d]]);  
      }
    }
    if (_l) {
      ensureLabel(z);
      for (let d=0; d<3; d++) {
        if (_l[perm[d]]) z._l[d] = _l[perm[d]];  
      }
    }
    return z;
  });
  
  //--------------- labels ---------------//
    
  //[num] -> string/undefined
  addArrayMethod('label', function(dim) {
    this.toCube();
    dim = assert.dim(dim);
    if (this._l) return this._l[dim] || null;
    return null;
  });
    
  //[num, *] -> cube
  addArrayMethod('$label', function(dim, val) {
    this.toCube();
    const origDim = dim,
          origVal = val;
    if (this._b) callUpdate(this, '_b', '$label', [origDim, origVal]);
    dim = assert.dim(dim);
    val = assert.single(val);
    if (val === undefined || val === null) {
      const _l = this._l;
      if (_l && _l[dim]) {
        _l[dim] = undefined;
        if (!_l[0] && !_l[1] && !_l[2]) delete this._l;
      }
    }
    else {
      val = '' + val;
      if (val === '') throw Error('label cannot be empty string');
      ensureLabel(this);
      this._l[dim] = val;
    }
    if (this._a) callUpdate(this, '_a', '$label', [origDim, origVal]);
    return this;
  });

  //num, func -> cube
  addArrayMethod('$$label', function(dim, f) {
    this.toCube();
    this.$label(dim, (assert.single(f))(this.label(dim)));
    return this;
  });
  
  
  //--------------- keys ---------------//
  
  //[num] -> array/undefined
  addArrayMethod('key', function(dim) {
    this.toCube();
    dim = assert.dim(dim);
    if (this._k) {
      const mp = this._k[dim];
      if (mp) return [...mp.keys()];
    }
    return null;
  });
    
  //[num, *] -> cube
  addArrayMethod('$key', function(dim, val) {
    this.toCube();
    const origDim = dim,
          origVal = val;
    if (this._b) callUpdate(this, '_b', '$key', [origDim, origVal]);
    dim = assert.dim(dim);
    val = toArray(val);
    if (val.length === 1 && (val[0] === undefined || val[0] === null)) {
      const _k = this._k;
      if (_k && _k[dim]) {
        _k[dim] = undefined;
        if (!_k[0] && !_k[1] && !_k[2]) delete this._k;
      }
    }
    else {
      const mp = keyMap(val);
      if (this._s[dim] !== mp.size) throw Error('shape mismatch');
      ensureKey(this);
      this._k[dim] = mp;
    }
    if (this._a) callUpdate(this, '_a', '$key', [origDim, origVal]);
    return this;
  });

  //num, func -> cube
  addArrayMethod('$$key', function(dim, f) {
    this.toCube();
    f = assert.single(f);
    const keys = this.key(dim);
    for (let j=0, n=keys.length; j<n; j++) keys[j] = f(keys[j]);
    this.$key(dim, keys);
    return this;
  });

  

  //--------------- $strip ---------------//
  
  //-> cube
  addArrayMethod('$strip', function() {
    this.toCube();
    if (this._b) callUpdate(this, '_b', '$strip', []);
    delete this._k;
    delete this._l;
    if (this._a) callUpdate(this, '_a', '$strip', []);
    return this;
  });
  
  
  //--------------- ind, indOrKey, hasKey ---------------//
  
  //[num] -> array
  addArrayMethod('ind', function(dim) {
    this.toCube();
    dim = assert.dim(dim);
    return helper.simpleRange(this._s[dim]);
  });
  
  //[num] -> array
  addArrayMethod('indOrKey', function(dim) {
    return this.key(dim) || helper.simpleRange(this._s[assert.dim(dim)]);
  });

  //[num, *] -> bool
  addArrayMethod('hasKey', function (dim, k) {
    this.toCube();
    dim = assert.dim(dim);
    k = assert.single(k);
    const _k = this._k;
    const keysOnDim = !!(_k && _k[dim]);
    return k === undefined ? keysOnDim : keysOnDim && _k[dim].has(k);
  });
  
  
  //--------------- copy ---------------//
      
  //[str] -> array/cube
  addArrayMethod('copy', function(ret) {
    ret = def(assert.single(ret), 'full');
    if (ret !== 'full' && ret !== 'core' && ret !== 'shell' && ret !== 'array') {
      throw Error(`'full', 'core', 'shell' or 'array' expected`);
    }
    if (ret === 'array') return copyArray(this);
    const z = ret === 'shell' ? new Array(this.length) : copyArray(this);
    z.toCube();
    if (this._data_cube) {
      z._s[0] = this._s[0];
      z._s[1] = this._s[1];
      z._s[2] = this._s[2];
      if (ret !== 'core') {  //copy extras
        if (this._l) {
          ensureLabel(z);
          z._l[0] = this._l[0];
          z._l[1] = this._l[1];
          z._l[2] = this._l[2];
        }
        if (this._k) {
          ensureKey(z);
          for (let i=0; i<3; i++) {
            if (this._k[i]) z._k[i] = copyMap(this._k[i]);
          }
        }
      }
    }
    return z;
  });
  

  //--------------- $autoType ---------------//

  //* -> cube
  //based on d3.autoType, but conversion rules not identical
  addArrayMethod('$autoType', function(empty) {
    this.toCube();
    const origEmpty = empty;
    if (this._b) callUpdate(this, '_b', '$autoType', [origEmpty]);
    empty = assert.single(empty);
    for (let i=0, n=this.length; i<n; i++) {
      let v = this[i];
      let num;
      if (typeof v === 'string') {
        if (!v) v = empty;
        else if (v === 'undefined') v = undefined;
        else if (v === 'null') v = null;
        else if (v === 'true') v = true;
        else if (v === 'false') v = false;
        else if (v === 'NaN') v = NaN;
        else if (!isNaN(num = +v)) v = num;
        else continue;
        this[i] = v;
      } 
    }
    if (this._a) callUpdate(this, '_a', '$autoType', [origEmpty]);
    return this;
  });


  //--------------- ent, $ent ---------------//
  
  //num -> *
  addArrayMethod('ent', function(ind) {
    this.toCube();
    return this[ nni(assert.single(ind), this.length) ];
  });
  
  //num, * -> cube
  addArrayMethod('$ent', function(ind, val) {
    this.toCube();
    if (this._b) callUpdate(this, '_b', '$ent', [ind, val]);
    this[ nni(assert.single(ind), this.length) ] = assert.single(val);
    if (this._a) callUpdate(this, '_a', '$ent', [ind, val]);
    return this;
  });

  //num, func -> cube
  addArrayMethod('$$ent', function(ind, f) {
    this.toCube();
    this.$ent(ind, (assert.single(f))(this.ent(ind)));
    return this;
  });
  
  //--------------- at, $at ---------------//
  
  {
    
    //cube, num, * -> num: non-neg-index for dimension dim of x
    //corresponding to singleton value j; j can be a key or index
    //(possibly negative)
    // -note: dim must be non-empty since 0 returned if j
    //  null/undefined
    const nniFromAny = (x, dim, j) => {
      if (j === undefined || j === null) return 0;
      if (x._k && x._k[dim]) return assert.number(x._k[dim].get(j));
      return nni(j, x._s[dim]);
    };
    
    //cube, *, *, * -> num
    const rcpToVec = (x, r, c, p) => {
      return nniFromAny(x, 0, assert.single(r)) + 
             nniFromAny(x, 1, assert.single(c)) * x._s[0] + 
             nniFromAny(x, 2, assert.single(p)) * x._s[0] * x._s[1];
    };
    
    //[*, *, *] -> *
    addArrayMethod('at', function(r, c, p) {
      this.toCube();
      if (this.length === 0) throw Error('cube has no entries');
      return this[ rcpToVec(this, r, c, p) ];
    });
  
    //*, *, *, * -> cube
    addArrayMethod('$at', function(r, c, p, val) {
      this.toCube();
      if (this._b) callUpdate(this, '_b', '$at', [r, c, p, val]);
      if (this.length === 0) throw Error('cube has no entries');
      this[ rcpToVec(this, r, c, p) ] = assert.single(val);
      if (this._a) callUpdate(this, '_a', '$at', [r, c, p, val]);
      return this;
    });

    //*, *, *, func -> cube
    addArrayMethod('$$at', function (r, c, p, f) {
      this.toCube();
      this.$at(r, c, p, (assert.single(f))(this.at(r, c, p)));
      return this;
    });

  }
  
  //--------------- vec, $vec ---------------//
  
  //* -> array
  addArrayMethod('vec', function(i) {
    this.toCube();
    var [i,iSingle] = polarize(i);
    const n = this.length;
    if (iSingle) {
      if (i === undefined || i === null) return copyArray(this);
      else return [ this[nni(i,n)] ];
    }
    const ni = i.length;
    const z = new Array(ni);
    for (let j=0; j<ni; j++) z[j] = this[ nni(i[j],n) ];
    return z;
  });
  
  //*, * -> cube
  addArrayMethod('$vec', function(i, val) {
    this.toCube();
    const origI = i,
          origVal = val;
    if (this._b) callUpdate(this, '_b', '$vec', [origI, origVal]);
    const n = this.length;
    var [i, iSingle] = polarize(i);
    var [val, valSingle] = polarize(val);
    if (iSingle) {
      if (i === undefined || i === null) (valSingle ? fill : fillEW)(this, val);
      else {
        if (!valSingle) throw Error('shape mismatch');
        this[nni(i,n)] = val;
      }
    }
    else {
      const ni = i.length;
      const ind = new Array(ni);
      for (let j=0; j<ni; j++) ind[j] = nni(i[j],n);
      if (valSingle) {
        for (let j=0; j<ni; j++) this[ind[j]] = val;
      }
      else {
        if (val.length !== ni) throw Error('shape mismatch');
        for (let j=0; j<ni; j++) this[ind[j]] = val[j];
      }
    }
    if (this._a) callUpdate(this, '_a', '$vec', [origI, origVal]);
    return this;
  });

  //*, func -> cube
  addArrayMethod('$$vec', function (i, f) {
    this.toCube();
    f = assert.single(f);
    const val = this.vec(i);
    for (let j=0, n=val.length; j<n; j++) val[j] = f(val[j]);
    this.$vec(i, val);
    return this;
  });


  //--------------- vecInd, rcp, $rcp ---------------//

  //[*, *, *] -> array
  addArrayMethod('vecInd', function(r, c, p) {
    this.toCube();
    const _s = this._s,
          mult = [1, _s[0], _s[0] * _s[1]];
    let ind;
    let s = 0;
    for (let d=0; d<3; d++) {
      let [a, aSingle] = polarize(d === 0 ? r : (d === 1 ? c : p)),
          ky = this._k && this._k[d];
      let j;
      if (aSingle) {
        if (_s[d] === 0) throw Error(`${ky ? 'key' : 'index'} does not exist`);
        if (a === undefined || a === null) continue;
        if (ky) {
          j = ky.get(a);
          if (j === undefined) throw Error('key does not exist');
        }
        else j = nni(a, _s[d]);
        s += j * mult[d];
      }
      else {
        j = ky ? keyInd(a, ky) : indInd(a, _s[d]);
        let n = a.length;          
        if (ind) {
          if (n !== ind.length) throw Error('shape mismatch');
          for (let i=0; i<n; i++) ind[i] += j[i] * mult[d];
        }
        else {
          ind = new Array(n);
          for (let i=0; i<n; i++) ind[i] = j[i] * mult[d];
        }
      }
    }
    if (ind) {
      if (s) {
        let n = ind.length;
        for (let i=0; i<n; i++) ind[i] += s;
      }
      return ind;
    }
    else return [s]; //all args singletons - poss all defaults
  });

  //[*, *, *] -> array
  addArrayMethod('rcp', function(r, c, p) {
    this.toCube();
    const v = this.vecInd(r, c, p),  //vecInd checks all args
          n = v.length,
          z = new Array(n);
    for (let i=0; i<n; i++) z[i] = this[v[i]];
    return z;
  });

  //*, *, *, * -> cube
  addArrayMethod('$rcp', function(r, c, p, val) {
    this.toCube();
    const origVal = val;
    if (this._b) callUpdate(this, '_b', '$rcp', [r, c, p, origVal]);
    const v = this.vecInd(r, c, p),  //vecInd checks r, c and p
          n = v.length;
    var [val, valSingle] = polarize(val);
    if (valSingle) {
      for (let i=0; i<n; i++) this[v[i]] = val;
    }
    else {
      if (val.length !== n) throw Error('shape mismatch');
      for (let i=0; i<n; i++) this[v[i]] = val[i];
    }
    if (this._a) callUpdate(this, '_a', '$rcp', [r, c, p, origVal]);
    return this;
  });

  //*, *, *, func -> cube
  addArrayMethod('$$rcp', function (r, c, p, f) {
    this.toCube();
    f = assert.single(f);
    const val = this.rcp(r, c, p);
    for (let j=0, n=val.length; j<n; j++) val[j] = f(val[j]);
    this.$rcp(i, val);
    return this;
  });

  
  //--------------- posn ---------------//
  
  //num, * -> array
  addArrayMethod('posn', function(dim, v) {
    this.toCube();
    dim = assert.dim(dim);
    const n = this.length,
          [nr,nc] = this._s;
    let dimInd;
    if      (dim === 0) dimInd = i => i % nr; 
    else if (dim === 1) dimInd = i => Math.floor(i / nr) % nc; 
    else                dimInd = i => Math.floor(i / (nr*nc));
    const ky = this.key(dim),
          lookup = ky ? i => ky[dimInd(i)] : dimInd;
    if (Array.isArray(v)) {
      const nv = v.length,
            z = new Array(nv);
      for (let i=0; i<nv; i++) z[i] = lookup(nni(v[i],n));
      return z;
    }
    return [lookup(nni(v,n))];
  });
  
  
  //--------------- subcubes ---------------//
        
  {
    
    //cube, num, * -> array: non-neg inds corresponding to q
    //on dimension dim of x. Assume dim a valid dimension.
    //Returned array is [indices (array), full-dim? (bool)] 
    const getInd = (x, dim, q) => {
      const nd = x._s[dim];
      q = toArray(q);
      if (q.length === 1 && (q[0] === undefined || q[0] === null)) {
        return [nd === 0 ? [] : rangeInd(0,nd-1), true];
      }
      if (x._k && x._k[dim]) return [keyInd(q, x._k[dim]), false];
      return [indInd(q, nd), false];
    };

    //*, *, *[, str] -> cube
    addArrayMethod('subcube', function(row, col, page, ret) {
      this.toCube();
      ret = def(assert.single(ret), 'full');
      if (ret !== 'full' && ret !== 'core' && ret !== 'array') {
        throw Error(`'full', 'core', or 'array' expected`);
      }
      const [nr, nc] = this._s;
      //entries
      const ind = [getInd(this,0,row), getInd(this,1,col), getInd(this,2,page)];
      const rInd = ind[0][0],    cInd = ind[1][0],   pInd = ind[2][0];
      const nrz  = rInd.length,  ncz = cInd.length,  npz = pInd.length;
      const z = new Array(nrz * ncz * npz);
      let j = 0;
      for (let p=0; p<npz; p++) {
        let pp = nr * nc * pInd[p];
        for (let c=0; c<ncz; c++) {
          let cc = nr * cInd[c];
          for (let r=0; r<nrz; r++) {
            z[j++] = this[rInd[r] + cc + pp];
          }
        }
      }
      if (ret === 'array') return z;
      z.toCube();
      //shape
      z._s[0] = nrz,  z._s[1] = ncz,  z._s[2] = npz;
      if (ret === 'core') return z;
      //extras
      if (this._k) {
        ensureKey(z); 
        for (let d=0; d<3; d++) {
          if (this._k[d]) {
            z._k[d] = ind[d][1]
              ? copyMap(this._k[d])
              : keyMap(toArray( d === 0 ? row : (d === 1 ? col : page) ));
          }
        }
      }
      copyLabel(this,z);
      return z;      
    });
    
    //cube, *, *, *, * -> undefined
    const setSubcube = (x, row, col, page, val) => {
      const [nr, nc] = x._s;
      const rInd = getInd(x, 0, row)[0],
            cInd = getInd(x, 1, col)[0],
            pInd = getInd(x, 2, page)[0];
      const nrz = rInd.length,  ncz = cInd.length,  npz = pInd.length;
      var [val, valSingle] = polarize(val);
      if (!valSingle && val.length !== nrz * ncz * npz) throw Error('shape mismatch');
      let j = 0;
      for (let p = 0; p < npz; p++) {
        let pp = nr * nc * pInd[p];
        for (let c = 0; c < ncz; c++) {
          let cc = nr * cInd[c];
          for (let r = 0; r < nrz; r++) {
            x[rInd[r] + cc + pp] = valSingle ? val : val[j++];
          }
        }
      }
    };

    //*, *, *, * -> cube
    addArrayMethod('$subcube', function (row, col, page, val) {
      this.toCube();
      if (this._b) callUpdate(this, '_b', '$subcube', [row, col, page, val]);
      setSubcube(this, row, col, page, val);
      if (this._a) callUpdate(this, '_a', '$subcube', [row, col, page, val]);
      return this;
    });

    //*, *, *, func -> cube
    addArrayMethod('$$subcube', function (r, c, p, f) {
      this.toCube();
      this.$subcube(r, c, p, (assert.single(f))(this.subcube(r, c, p)));
      return this;
    });
    
    //row, col, page getters and setters
    {
      //*, *[, str] -> cube
      const oneDimGetter = [
        (x, j, ret) => x.subcube(   j, null, null, ret),
        (x, j, ret) => x.subcube(null,    j, null, ret),
        (x, j, ret) => x.subcube(null, null,    j, ret)
      ];

      //cube, *, * -> undefined
      const oneDimSetter = [
        (x, j, val) => setSubcube(x,    j, null, null, val),
        (x, j, val) => setSubcube(x, null,    j, null, val),
        (x, j, val) => setSubcube(x, null, null,    j, val),
      ];


      ['row', 'col', 'page'].forEach((name, i) => {
        addArrayMethod(name, function (j, ret) {
          return oneDimGetter[i](this, j, ret);
        });
        addArrayMethod('$$' + name, function (j, f) {
          this.toCube();
          this['$' + name](j, (assert.single(f))(this[name](j)));
          return this;
        });
      });

      ['$row', '$col', '$page'].forEach( (name, i) => {
        addArrayMethod(name, function (j, val) {
          this.toCube();
          if (this._b) callUpdate(this, '_b', name, [j, val]);
          oneDimSetter[i](this, j, val); 
          if (this._a) callUpdate(this, '_a', name, [j, val]);
          return this;
        });
      });

      //bool, array/cube, num, *, *, * -> *
      const downAlongBack = function(setter, x, dim, s, e, retVal) {
        x.toCube();
        s = assert.single(s);
        e = assert.single(e);
        let q;
        if (x._k && x._k[dim]) q = helper.rangeKey(s, e, x._k[dim]); 
        else {
          const nd = x._s[dim];
          s = (s === null || s === undefined) ? 0    : nni(s,nd);
          e = (e === null || e === undefined) ? nd-1 : nni(e,nd);
          q = (nd === 0) ? [] : rangeInd(s, e);   //if nd===0, using defaults (nni would have thrown)
        }
        return (setter ? oneDimSetter : oneDimGetter)[dim](x, q, retVal);
      };
      
      ['rowSlice', 'colSlice', 'pageSlice'].forEach( (name, i) => {
        addArrayMethod(name, function(s, e, ret) {
          return downAlongBack(false, this, i, s, e, ret);
        });
        addArrayMethod('$$' + name, function(s, e, f) {
          this.toCube();
          this['$' + name](s, e, (assert.single(f))(this[name](s, e)));
          return this;
        });

      });

      ['$rowSlice', '$colSlice', '$pageSlice'].forEach( (name, i) => {
        addArrayMethod(name, function(s, e, val) {
          this.toCube();
          if (this._b) callUpdate(this, '_b', name, [s, e, val]);
          downAlongBack(true, this, i, s, e, val);
          if (this._a) callUpdate(this, '_a', name, [s, e, val]);
          return this;
        });
      });
    }

    //[num, num, num, str] -> cube
    addArrayMethod('head', function(nr, nc, np, ret) {
      this.toCube();
      const ind = new Array(3);
      for (let d=0; d<3; d++) {
        let m = assert.single( d === 0 ? nr : (d === 1 ? nc : np) );
        const nd = this._s[d];
        if (m === null || m === undefined) m = nd;
        else {
          assert.nonNegInt(m);
          m = Math.min(m,nd);
        }
        if (m === 0) ind[d] = [];
        else if (this._k && this._k[d]) ind[d] = helper.firstKey(m, this._k[d]);
        else ind[d] = rangeInd(0,m-1);
      }
      return this.subcube(...ind, ret);
    });
  }
  
    
  //--------------- vble ---------------//
  
  //[num] -> array
  addArrayMethod('vble', function(dim) {
    this.toCube();
    dim = def(assert.single(dim), 0);  //dim can be -1 so do not use assert.dim
    const {_s, _k, _l} = this;
    const [nr, nc, np] = _s;
    const [rk, ck, pk] = [0,1,2].map(d => {
      return _k && _k[d]
        ? [..._k[d].keys()]
        : helper.simpleRange(_s[d]);
    });
    const [rl, cl, pl] = 
      [0,1,2].map(d => (_l && _l[d]) || helper.shortDimName[d]);
    let z;
    if (dim === -1) {
      z = new Array(this.length);
      let i = 0;
      for (let p=0; p<np; p++) {
        let pp = nr * nc * p;
        let ppk = pk[p];
        for (let c=0; c<nc; c++) {
          let cc = nr * c;
          let cck = ck[c];
          for (let r=0; r<nr; r++) {
            z[i++] = {
              [rl]: rk[r], 
              [cl]: cck,
              [pl]: ppk,
              entry: this[r + cc + pp]
            };
          }
        }
      }
    }
    else if (dim === 0) {
      z = new Array(nc*np);
      let i = 0, j = 0;
      for (let p=0; p<np; p++) {
        for (let c=0; c<nc; c++) {
          let obj = {};
          obj[cl] = ck[c];
          obj[pl] = pk[p];
          for (let r=0; r<nr; r++) {
            obj[rk[r]] = this[j++];
          }
          z[i++] = obj;
        }
      }
    }
    else if (dim === 1) {
      z = new Array(nr*np);
      let i = 0;
      for (let p=0; p<np; p++) {
        for (let r=0; r<nr; r++) {
          let j = r + p*nr*nc;
          let obj = {};
          obj[rl] = rk[r];
          obj[pl] = pk[p];
          for (let c=0; c<nc; c++) {
            obj[ck[c]] = this[j + c*nr];
          }
          z[i++] = obj;
        }
      }
    }
    else if (dim === 2) {
      const epp = nr*nc;  
      z = new Array(epp);
      let i = 0, j = -1;
      for (let c=0; c<nc; c++) {
        for (let r=0; r<nr; r++) {
          j++;
          let obj = {};
          obj[rl] = rk[r];
          obj[cl] = ck[c];
          for (let p=0; p<np; p++) {
            obj[pk[p]] = this[j + p*epp];
          }
          z[i++] = obj;
        }
      }
    }
    else throw Error('invalid dimension'); 
    return z;
  });
  
  
  //--------------- entrywise: no arguments ---------------//
  
  {
    const mathFunc = [
      'sqrt', 'cbrt', 'abs', 'round', 'floor', 'ceil', 'trunc', 'sign',
      'exp', 'expm1', 'log', 'log10', 'log2', 'log1p',
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
      'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh'
    ];
    const numberFunc = ['isInteger', 'isFinite', 'isNaN']; 
    
    //-> cube
    const useStatic = (obj, name) => {
      name.forEach(nm => {
        addArrayMethod(nm, function() {
          this.toCube();          
          const z = this.copy('shell');
          const n = this.length;
          const f = obj[nm];
          for (let i=0; i<n; i++) z[i] = f(this[i]);
          return z;
        });
      });
    };
    useStatic(Math, mathFunc);
    useStatic(Number, numberFunc);
    
    const ewFunc = [
      ['neg',     x => -x],
      ['number',  x => +x],
      ['string',  x => '' + x],
      ['boolean', x => !!x],
      ['date',    x => new Date(x)],
      ['not',     x => !x],
      ['typeof',  x => typeof x],
      ['trim',    x => x.trim()],
      ['toLowerCase', x => x.toLowerCase()],
      ['toUpperCase', x => x.toUpperCase()],
      ['box',   x => Array.isArray(x) ? x    : [x]],
      ['unbox', x => Array.isArray(x) ? x[0] :  x ]
    ];
    
    //-> cube
    for (let [nm,f] of ewFunc) {
      addArrayMethod(nm, function() {
        this.toCube();
        const z = this.copy('shell');
        const n = this.length;
        for (let i=0; i<n; i++) z[i] = f(this[i]);
        return z;
      });
    }

  }
    
  
  //--------------- entrywise: operator-like ---------------//
  
  {
    const opLike = [
      ['add', (a,b) => a + b],
      ['sub', (a,b) => a - b],
      ['mul', (a,b) => a * b],
      ['div', (a,b) => a / b],
      ['rem', (a,b) => a % b],
      ['pow', Math.pow],
      ['atan2', Math.atan2],
      ['hypot', Math.hypot],
      ['eq', (a,b) => a === b],
      ['neq', (a,b) => a !== b],
      ['lt', (a,b) => a < b],
      ['lte', (a,b) => a <= b],
      ['gt', (a,b) => a > b],
      ['gte', (a,b) => a >= b],
      ['lof', Math.min],
      ['gof', Math.max],
      ['toExponential', (a,b) => a.toExponential(b)],
      ['toFixed', (a,b) => a.toFixed(b)],
      ['toPrecision', (a,b) => a.toPrecision(b)],
      ['charAt', (a,b) => a.charAt(b)],
      ['repeat', (a,b) => a.repeat(b)],
      ['search', (a,b) => a.search(b)],
      ['test', (a,b) => a.test(b)],
      ['and', (a,b) => a && b],
      ['or', (a,b) => a || b]
    ];
    
    //*[, *, *, *, ...] -> cube
    for (let [nm,f] of opLike) {
      addArrayMethod(nm, function(a) {
        this.toCube();
        const nArg = arguments.length;
        if (nArg > 1) {
          let curr = this[nm](a);
          for (let j=1; j<nArg; j++) curr = curr[nm](arguments[j]);
          return curr;
        }
        var [a,aSingle] = polarize(a);
        const n = this.length;
        let z;
        if (aSingle) {
          z = this.copy('shell');
          for (let i=0; i<n; i++) z[i] = f(this[i],a);
        }
        else {
          const na = a.length; 
          if (n === 1) {
            z = a.copy('shell');
            const this_0 = this[0];
            for (let i=0; i<na; i++) z[i] = f(this_0,a[i]);
          }
          else {
            if (n !== na) throw Error('shape mismatch');
            z = this.copy('shell');
            for (let i=0; i<n; i++) z[i] = f(this[i],a[i]);
          }
        }
        return z;
      });
    }
        
  }
  
  
  //--------------- entrywise: conditional ---------------//
      
  //*, * -> cube
  addArrayMethod('cond', function(a, b) {
    this.toCube();
    const n = this.length;
    var [a, aSingle] = polarize(a);
    if (!aSingle && a.length !== n) throw Error('shape mismatch');    
    var [b, bSingle] = polarize(b);
    if (!bSingle && b.length !== n) throw Error('shape mismatch');
    const z = this.copy('shell');
    if (aSingle) {
      if (bSingle) { for (let i=0; i<n; i++) z[i] = this[i] ? a    : b }
      else         { for (let i=0; i<n; i++) z[i] = this[i] ? a    : b[i] }
    }
    else {
      if (bSingle) { for (let i=0; i<n; i++) z[i] = this[i] ? a[i] : b }
      else         { for (let i=0; i<n; i++) z[i] = this[i] ? a[i] : b[i] }
    }
    return z;
  });
  
  
  //--------------- entrywise: method, call, apply ---------------//

  {
    //array/cube, str/func/null, str, arr -> cube
    const methodCallApply = (x, nm, mcp, argsArray) => {
      x.toCube();
      nm = assert.single(nm);
      if (mcp === 'call') assert.func(nm);
      else if (mcp === 'apply') {
        for (let f of x) assert.func(f);
      }
      const n = x.length,
            na = argsArray.length,
            z = x.copy('shell');
      if (na === 0) {
        if (mcp === 'method')    { for (let i=0; i<n; i++) z[i] = x[i][nm]() }
        else if (mcp === 'call') { for (let i=0; i<n; i++) z[i] = nm(x[i])   }
        else                     { for (let i=0; i<n; i++) z[i] = x[i]()     }
      }
      else if (na < 3) {
        const [a_0, aSingle_0] = polarize(argsArray[0]);
        if (!aSingle_0 && a_0.length !== n) throw Error('shape mismatch');
        if (na === 1) {
          if (aSingle_0) {
            if (mcp === 'method')    { for (let i=0; i<n; i++) z[i] = x[i][nm](a_0) }
            else if (mcp === 'call') { for (let i=0; i<n; i++) z[i] = nm(x[i], a_0) }
            else                     { for (let i=0; i<n; i++) z[i] = x[i](a_0) }
          }
          else {
            if (mcp === 'method')    { for (let i=0; i<n; i++) z[i] = x[i][nm](a_0[i]) }
            else if (mcp === 'call') { for (let i=0; i<n; i++) z[i] = nm(x[i], a_0[i]) }
            else                     { for (let i=0; i<n; i++) z[i] = x[i](a_0[i]) }
          }
        }
        else {
          const [a_1, aSingle_1] = polarize(argsArray[1]);
          if (!aSingle_1 && a_1.length !== n) throw Error('shape mismatch');
          if (aSingle_0) {
            if (aSingle_1) {
              if (mcp === 'method')    { for (let i=0; i<n; i++) z[i] = x[i][nm](a_0, a_1) }
              else if (mcp === 'call') { for (let i=0; i<n; i++) z[i] = nm(x[i], a_0, a_1) }
              else                     { for (let i=0; i<n; i++) z[i] = x[i](a_0, a_1) }
            }
            else {
              if (mcp === 'method')    { for (let i=0; i<n; i++) z[i] = x[i][nm](a_0, a_1[i]) }
              else if (mcp === 'call') { for (let i=0; i<n; i++) z[i] = nm(x[i], a_0, a_1[i]) }
              else                     { for (let i=0; i<n; i++) z[i] = x[i](a_0, a_1[i]) }
            }
          }
          else {
            if (aSingle_1) {
              if (mcp === 'method')    { for (let i=0; i<n; i++) z[i] = x[i][nm](a_0[i], a_1) }
              else if (mcp === 'call') { for (let i=0; i<n; i++) z[i] = nm(x[i], a_0[i], a_1) }
              else                     { for (let i=0; i<n; i++) z[i] = x[i](a_0[i], a_1) }
            }
            else {
              if (mcp === 'method')    { for (let i=0; i<n; i++) z[i] = x[i][nm](a_0[i], a_1[i]) }
              else if (mcp === 'call') { for (let i=0; i<n; i++) z[i] = nm(x[i], a_0[i], a_1[i]) }
              else                     { for (let i=0; i<n; i++) z[i] = x[i](a_0[i], a_1[i]) }
            }
          }
        }
      }
      else {
        const getArg = new Array(na);
        for (let i=0; i<na; i++) {
          let [a, aSingle] = polarize(argsArray[i]);
          if (aSingle) getArg[i] = () => a;
          else {
            if (a.length !== n) throw Error('shape mismatch');
            getArg[i] = j => a[j];
          }
        }
        const getAllArg = j => {
          const arg = new Array(na);
          for (let i=0; i<na; i++) arg[i] = getArg[i](j);
          return arg;
        };
        if (mcp === 'method')    { for (let i=0; i<n; i++) z[i] = x[i][nm](...getAllArg(i)) }
        else if (mcp === 'call') { for (let i=0; i<n; i++) z[i] = nm(x[i], ...getAllArg(i)) }
        else                     { for (let i=0; i<n; i++) z[i] = x[i](...getAllArg(i)) }
      }
      return z;
    };
    
    addArrayMethod('method', function(nm, ...argsArray) {
      return methodCallApply(this, nm, 'method', argsArray);
    });
    
    addArrayMethod('call', function(f, ...argsArray) {
      return methodCallApply(this, f, 'call', argsArray);
    });

    addArrayMethod('apply', function (...argsArray) {
      return methodCallApply(this, null, 'apply', argsArray);
    });
  
  }
  

  //--------------- entrywise: prop, $prop ---------------//
  
  //str -> cube
  addArrayMethod('prop', function(nm) {
    this.toCube();
    nm = assert.single(nm);
    const n = this.length,
          z = this.copy('shell');
    for (let i=0; i<n; i++) z[i] = this[i][nm];
    return z;
  });
    
  //str, * -> cube
  addArrayMethod('$prop', function(nm, val) {
    this.toCube();
    const origNm = nm,
          origVal = val;
    if (this._b) callUpdate(this, '_b', '$prop', [origNm, origVal]);
    nm = assert.single(nm);
    var [val, valSingle] = polarize(val);
    const n = this.length;
    if (valSingle) {
      for (let j=0; j<n; j++) this[j][nm] = val;
    }
    else {
      if (val.length !== n) throw Error('shape mismatch');
      for (let j=0; j<n; j++) this[j][nm] = val[j];
    }
    if (this._a) callUpdate(this, '_a', '$prop', [origNm, origVal]);
    return this;
  });

  //str, func -> cube
  addArrayMethod('$$prop', function(nm, f) {
    this.toCube();
    f = assert.single(f);
    const val = this.prop(nm);
    for (let j=0, n=val.length; j<n; j++) val[j] = f(val[j]);
    this.$prop(nm, val);
    return this;
  });


  //--------------- entrywise: loop ---------------//

  addArrayMethod('loop', function(...args) {
    this.toCube();
    let nLoop = this.length;
    const nArg = args.length,
          kind = new Array(nArg),
          name = new Array(nArg),
          getter = new Array(nArg);
    
    //check all arguments valid before do anything
    for (let i=0; i<nArg; i++) {
      args[i] = toArray(args[i]);
      const nai = args[i].length;
      if (nai === 0) throw Error('non-empty array expected');
      let nm = assert.single(args[i][0]);
      if (typeof nm === 'function') {
        kind[i] = 'f';
      }
      else if (typeof nm === 'string') {
        if (nm[0] === '$') {
          if (nai !== 2) {
            throw Error('2-entry array expected: property name and new value(s)');
          }
          kind[i] = 'p';
          nm = nm.slice(1);
        }
        else kind[i] = 'm';
      }
      else throw Error('string or function expected');
      name[i] = nm;
      if (nai > 1) {
        getter[i] = new Array(nai - 1);
        for (let j=1; j<nai; j++) {
          const [aij, aijSingle] = polarize(args[i][j]);
          if (aijSingle) getter[i][j - 1] = () => aij;
          else {
            if (aij.length !== nLoop) {
              if (nLoop === 1) nLoop = aij.length; 
              else throw Error('shape mismatch');
            }
            getter[i][j - 1] = k => aij[k];
          }
        }
      }
    }

    //apply methods/functions and set properties
    for (let i=0; i<nLoop; i++) {
      const me = this.length === 1 ? this[0] : this[i];
      for (let j=0; j<nArg; j++) {
        const nm = name[j],
              nj = args[j].length;
        if (kind[j] === 'p') me[nm] = getter[j][0](i);
        else if (kind[j] === 'm') {
          if      (nj === 1) me[nm]();
          else if (nj === 2) me[nm](getter[j][0](i));
          else if (nj === 3) me[nm](getter[j][0](i), getter[j][1](i));
          else if (nj === 4) me[nm](getter[j][0](i), getter[j][1](i), getter[j][2](i));
          else if (nj === 5) me[nm](getter[j][0](i), getter[j][1](i), getter[j][2](i), getter[j][3](i));
          else               me[nm](...getter[j].map(f => f(i)));
        }
        else {
          if      (nj === 1) nm(me);
          else if (nj === 2) nm(me, getter[j][0](i));
          else if (nj === 3) nm(me, getter[j][0](i), getter[j][1](i));
          else if (nj === 4) nm(me, getter[j][0](i), getter[j][1](i), getter[j][2](i));
          else if (nj === 5) nm(me, getter[j][0](i), getter[j][1](i), getter[j][2](i), getter[j][3](i));
          else               nm(me, ...getter[j].map(f => f(i)));
        }
      }
    }

    return this;
  });


  //--------------- entrywise: cmap ---------------//

  addArrayMethod('cmap', function(f, asThis) {
    this.toCube();
    const z = this.map(assert.single(f), assert.single(asThis));
    z.toCube();
    z._s[0] = this._s[0];
    z._s[1] = this._s[1];
    z._s[2] = this._s[2];
    copyKey(this,z);
    copyLabel(this,z);
    return z;
  });
  
  
  //--------------- all fold and cumulative ---------------//
  
  {

    //array/cube, num, func[, *], bool -> cube
    const foldCumu = (x, dim, f, init, cu) => {
      x.toCube();
      dim = def(assert.single(dim), 0);  //dim can be -1 so do not use assert.dim
      f = assert.func(assert.single(f));
      init = assert.single(init);
      const n = x.length;
      let start, v, z;
      if (init === undefined) {
        if (!n) throw Error('must supply init if array/cube empty');
        start = 1;
      }
      else start = 0;
      if (dim === -1) {
        v = start ? x[0] : init;
        if (cu) {
          z = [n].cube();
          if (start) z[0] = v;
          for (let i=start; i<n; i++) z[i] = v = f(v, x[i], i, x);
        }
        else {
          for (let i=start; i<n; i++) v = f(v, x[i], i, x);
          z = [v];
          z.toCube();
        }
      }      
      else {
        //get shape and setup z first in case callback changes shape, keys or labels
        const [nr, nc, np] = x._s;
        const epp = nr*nc;
        if (cu) z = x.copy('shell');
        else {
          if      (dim === 0) z = [ 1, nc, np].cube();
          else if (dim === 1) z = [nr,  1, np].cube();
          else if (dim === 2) z = [nr, nc,  1].cube();
          else throw Error('invalid dimension');
          copyKey(x,z,dim);
          copyLabel(x,z,dim);
        }
        if (dim === 0) {
          let i = 0;
          for (let p=0; p<np; p++) {
            let pp = epp*p;
            for (let c=0; c<nc; c++) {
              let cc = nr*c;
              v = start ? x[cc + pp] : init;
              if (cu) {
                if (start) z[cc + pp] = v;
                for (let r=start; r<nr; r++) {
                  let vInd = r + cc + pp;
                  z[vInd] = v = f(v, x[vInd], r, x);
                }
              }
              else {
                for (let r=start; r<nr; r++) v = f(v, x[r + cc + pp], r, x); 
                z[i++] = v;
              }
            }
          }
        }
        else if (dim === 1) {
          let i = 0;
          for (let p=0; p<np; p++) {
            let pp = epp*p;
            for (let r=0; r<nr; r++) {
              v = start ? x[r + pp] : init;
              if (cu) {
                if (start) z[r + pp] = v;
                for (let c=start; c<nc; c++) {
                  let vInd = r + c*nr + pp;
                  z[vInd] = v = f(v, x[vInd], c, x);
                }
              }
              else {
                for (let c=start; c<nc; c++) v = f(v, x[r + c*nr + pp], c, x);
                z[i++] = v;
              }
            }
          }
        }
        else if (dim === 2) {
          let i = 0;
          for (let c=0; c<nc; c++) {
            let cc = nr*c;
            for (let r=0; r<nr; r++) {
              v = start ? x[r + cc] : init;
              if (cu) {
                if (start) z[r + cc] = v;
                for (let p=start; p<np; p++) {
                  vInd = r + cc + p*epp;
                  z[vInd] = v = f(v, x[vInd], p, x);
                }
              }
              else {
                for (let p=start; p<np; p++) v = f(v, x[r + cc + p*epp], p, x);
                z[i++] = v;
              }
            }
          }
        }
        else throw Error('invalid dimension');
      }
      return z;
    };

    //num, func[, *] -> cube
    addArrayMethod('fold', function(dim, f, init) {
      return foldCumu(this, dim, f, init, false);
    });
    addArrayMethod('cumu', function(dim, f, init) {
      return foldCumu(this, dim, f, init, true);
    });
    
    const basic = [
      ['sum'   , (a,b) => a + (+b)      , 0],
      ['prod'  , (a,b) => a * b         , 1],
      ['all'   , (a,b) => a && !!b      , true],
      ['any'   , (a,b) => a || !!b      , false],
      ['count' , (a,b) => a + !!b       , 0],
      ['min'   , (a,b) => Math.min(a,b) ,  Infinity],  //do not pass Math.min since fold will pass it 4 args 
      ['max'   , (a,b) => Math.max(a,b) , -Infinity]
    ];
    
    //num -> cube
    basic.forEach(ar => {
      addArrayMethod(ar[0], function(dim) {
        return this.fold(dim, ar[1], ar[2]);
      });
    });
    basic.forEach(ar => {
      addArrayMethod('cumu' + ar[0][0].toUpperCase() + ar[0].slice(1), function(dim) {
        return this.cumu(dim, ar[1], ar[2]);
      });
    });
              
    //num -> cube
    addArrayMethod('range', function(dim) {
      const mn = this.min(dim);
      const mx = this.max(dim);
      const nm = mx.length;
      for (let i=0; i<nm; i++) mx[i] -= mn[i];
      return mx;
    });
    
    //num -> cube
    addArrayMethod('sameType', function(dim) {
      return this.fold(
        dim,
        (a,b) => {
          b = typeof b;
          return b === a || a === null ? b : false;
        },
        null
      );
    });
    
    //[bool] -> func: fold func for minPosn/maxPosn
    const minMax = mx => {
      if (mx) return (a,b,i) => a[0] < b ? [b,i] : a;
      else    return (a,b,i) => a[0] > b ? [b,i] : a;
    };
          
    //num -> cube
    ['minPosn', 'maxPosn', 'cumuMinPosn', 'cumuMaxPosn'].forEach((nm,j) => {
      addArrayMethod(nm, function(dim) {
        const mx = j % 2;
        let z = this[j > 1 ? 'cumu' : 'fold'](dim, minMax(mx), [[mx ? -Infinity : Infinity, null]]);
        const nz = z.length;
        dim = def(assert.single(dim), 0);
        if (dim !== -1 && this._k && this._k[dim]) {
          const ky = this.key(dim);
          for (let i=0; i<nz; i++) {
            let ind = z[i][1];  //null if this._s[dim] is 0 (and folding) or poss if non-finite entries
            z[i] = (ind === null) ? null : ky[ind];
          }
        }
        else {
          for (let i=0; i<nz; i++) z[i] = z[i][1];
        }
        return z;
      });
    });
        
    //num -> cube
    ['mean','geoMean'].forEach(nm => {
      addArrayMethod(nm, function(dim) {
        const geo = nm === 'geoMean';
        const z = this[geo ? 'prod' : 'sum'](dim);
        dim = def(assert.single(dim), 0);
        if (dim === -1) {
          z[0] = geo
            ? Math.pow(z[0], (1/this.length))
            : z[0] / this.length;
        }
        else {
          const n = z.length;
          let v = 1 / this._s[dim];
          if (geo) { for (let i=0; i<n; i++) z[i]  = Math.pow(z[i],v) }
          else     { for (let i=0; i<n; i++) z[i] *= v }
        }
        return z;
      });
    });
    
    //num[, str] -> cube
    addArrayMethod('sew', function(dim, sep) {
      this.toCube();
      sep = '' + def(assert.single(sep), ',');
      const z = this.fold(
        dim,
        (a,b) => `${a}${sep}${b === null || b === undefined ? '' : b}`,
        ''
      );
      if (sep) {  //sep is non-empty string - trim first sep from each entry
        const sepLen = sep.length;
        const n = z.length;
        for (let i=0; i<n; i++) z[i] = z[i].slice(sepLen);
      }
      return z;
    });
    
    //num[, num] -> cube
    addArrayMethod('var', function(dim, delta) {
      this.toCube();
      dim = def(assert.single(dim), 0);
      delta = assert.nonNegInt(def(assert.single(delta), 0));
      const f = (a, newValue) => {
        const count = a[0] + 1;
        const delta = newValue - a[1];
        const mean = a[1] + (delta / count);
        const M2 = a[2] + (delta * (newValue - mean));
        return [count, mean, M2];
      };
      const z = this.fold(dim, f, [[0, 0, 0]]);
      const nz = z.length;
      const nDim = (dim === -1) ? this.length : this._s[dim];
      if (nDim < 2) {
        for (let i=0; i<nz; i++) z[i] = NaN;
      }
      else {
        let nDiv = nDim - delta;
        for (let i=0; i<nz; i++) z[i] = z[i][2] / nDiv;
      }
      return z;      
    });
        
    //num[, num] -> cube
    addArrayMethod('sd', function(dim, delta) {
      const z = this.var(dim,delta);
      const nz = z.length;
      for (let i=0; i<nz; i++) z[i] = Math.sqrt(z[i]);
      return z;
    });
        
    //num[, string] -> cube
    addArrayMethod('wrap', function(dim, sc) {
      this.toCube();
      dim = def(assert.single(dim), 0);  //dim can be -1 so do not use assert.dim
      sc = def(assert.single(sc), 'full');
      if (sc !== 'full' && sc !== 'core' && sc !== 'array') {
        throw Error(`'full', 'core', or 'array' expected`);
      }
      let z;
      if (dim === -1) {
        z = copyArray(this);
        if (sc !== 'array') z.toCube();
        z = [z];
        z.toCube();
      }
      else {
        const [nr, nc, np] = this._s;
        const _k = this._k;
        const indFactory = d => (_k && _k[d]) ? ky => _k[d].get(ky) : i => i;
        if (dim === 0) {
          z = [1,nc,np].cube();
          const ind_c = indFactory(1),
                ind_p = indFactory(2);
          for (let p of this.indOrKey(2)) {
            let pi = ind_p(p) * nc;
            for (let c of this.indOrKey(1)) {
              z[ind_c(c) + pi] = this.subcube(null, c, p, sc);         
            }
          }
        }
        else if (dim === 1) {
          z = [nr,1,np].cube();
          const ind_r = indFactory(0),
                ind_p = indFactory(2);
          for (let p of this.indOrKey(2)) {
            let pi = ind_p(p) * nr;
            for (let r of this.indOrKey(0)) {
              z[ind_r(r) + pi] = this.subcube(r, null, p, sc);         
            }
          }
        }
        else if (dim === 2) {
          z = [nr,nc,1].cube();
          const ind_r = indFactory(0),
                ind_c = indFactory(1);
          for (let c of this.indOrKey(1)) {
            let ci = ind_c(c) * nr;
            for (let r of this.indOrKey(0)) {
              z[ind_r(r) + ci] = this.subcube(r, c, null, sc);         
            }
          }
        }
        else throw Error('invalid dimension');
        copyKey(this, z, dim);
        copyLabel(this, z, dim);
      }
      return z;
    });

  }
 
  
  //--------------- quantile ---------------//
  
  //[num, *] -> cube
  addArrayMethod('quantile', function(dim, prob) {
    this.toCube();
    dim = def(assert.single(dim), 0);  //dim can be -1 so do not use assert.dim
    var [prob, probSingle] = polarize(prob);
    let probChecked;
    if (probSingle) {
      if (prob === undefined) {
        prob = [0, 0.25, 0.5, 0.75, 1];
        probChecked = true;
      }
      else prob = [prob];
    }
    if (!probChecked) {
      prob = prob.number().toArray();
      if ( prob.isNaN().any()[0] ||
           prob.lt(0).any()[0] ||
           prob.gt(1).any()[0] ) {
        throw Error('probabilities must be between 0 and 1 (inclusive)');
      }
    }
    const nProb = prob.length;
    const quant = y => {  //quantiles of array y; mutates y
      const ny = y.length;
      if (ny === 0) return fill(new Array(nProb), NaN);
      for (let i=0; i<ny; i++) {
        let v = +y[i];
        if (!Number.isFinite(v)) return fill(new Array(nProb), NaN);
        y[i] = v;
      }
      y.sort(helper.comparison('asc'));
      const sc = prob.mul(ny - 1),
            scFloor = sc.floor(),
            wt = sc.sub(scFloor);
      return y.vec(scFloor).mul([1].sub(wt)).add( y.vec(sc.ceil()).mul(wt) );
    };
    let z;
    if (dim === -1) z = quant(copyArray(this)).$key(0,prob);
    else {
      if (![0,1,2].includes(dim)) throw Error('invalid dimension');
      const z_s = copyArray(this._s);
      z_s[dim] = nProb;
      z = z_s.cube();
      copyKey(this, z, dim);
      copyLabel(this, z, dim);
      z.$key(dim, prob);
      if (dim === 0) {
        for (let p of this.indOrKey(2)) {
          for (let c of this.indOrKey(1)) {
            z.$subcube(null, c, p, quant(this.subcube(null, c, p, 'array')));  
          }
        }
      }
      else if (dim === 1) {
        for (let p of this.indOrKey(2)) {
          for (let r of this.indOrKey(0)) {
            z.$subcube(r, null, p, quant(this.subcube(r, null, p, 'array')));  
          }
        }
      }
      else {  //dim is 2
        for (let c of this.indOrKey(1)) {
          for (let r of this.indOrKey(0)) {
            z.$subcube(r, c, null, quant(this.subcube(r, c, null, 'array')));  
          }
        }
      }
    }
    return z;
  });
    
  
  //--------------- concatenate ---------------//
  
  {
    
    //cube, array, num => [cube, bool]:
    //  -cube to be returned by v, h or d except all entries holes
    //  -true if all args are non-arrays
    const prep = (x, args, dim) => {
      const sk = skeleton(x),
            skKey = sk._k && sk._k[dim],
            nArg = args.length;
      let naAll = true;   //all args are non-arrays
      for (let i=0; i<nArg; i++) {
        let a = args[i];
        if (Array.isArray(a)) {
          const aLen = a.length;
          if (a._data_cube) {
            for (let d=0; d<3; d++) {
              if (d !== dim && sk._s[d] !== a._s[d]) throw Error('shape mismatch');               
            }
            if (skKey) {
              if (!a._k || !a._k[dim]) throw Error(helper.dimName[dim] + ' keys expected');
              let ak = a._k[dim];
              let j = skKey.size;
              for (let k of ak.keys()) skKey.set(k, j++);
            }
            sk._s[dim] += a._s[dim];
          }
          else {  //a is a standard array
            if (dim === 0) {
              if (sk._s[1] !== 1 || sk._s[2] !== 1) throw Error('shape mismatch');
              sk._s[0] += aLen;
            }
            else if (dim === 1) {
              if (sk._s[0] !== aLen || sk._s[2] !== 1) throw Error('shape mismatch');    
              sk._s[1]++;
            }
            else {  // dim is 2
              if (sk._s[0] !== aLen || sk._s[1] !== 1) throw Error('shape mismatch');
              sk._s[2]++;
            }
            if (skKey) throw Error(helper.dimName[dim] + ' keys expected');
          }
          naAll = false;
        }
        else {  //a is a non-array
          for (let d=0; d<3; d++) {
            if (d !== dim && sk._s[d] !== 1) throw Error('shape mismatch');               
          }
          if (skKey) throw Error(helper.dimName[dim] + ' keys expected');
          sk._s[dim]++;
        }
      }
      if (skKey && skKey.size !== sk._s[dim]) throw Error('duplicate key');
      sk.length = sk._s[0] * sk._s[1] * sk._s[2];
      sk._data_cube = true;
      return [sk, naAll];
    };
    
    //[*, *, *, ...] -> cube
    ['vert', 'horiz', 'depth'].forEach((nm, dim) => {
      addArrayMethod(nm, function(...args) {
        this.toCube();
        const [z, naAll] = prep(this, args, dim),
              nArg = args.length,
              nThis = this.length,
              nr = z._s[0],
              nc = z._s[1],
              np = z._s[2];
        if (naAll) {  //includes when nArgs is 0
          let i;
          for (i=0; i<nThis; i++) z[i] = this[i];
          for (let j=0; j<nArg; j++) z[i++] = args[j];
        }
        else if ( //can concat all entries in order (note: following conditions
                  //include all cases where at least one arg is a standard array)
                 (dim === 0 && nc === 1 && np === 1) ||
                 (dim === 1 && np === 1) ||
                 (dim === 2)
                ) {
          let i;
          for (i=0; i<nThis; i++) z[i] = this[i];
          for (let j=0; j<nArg; j++) {
            let a = args[j];
            if (Array.isArray(a)) {
              for (let k=0; k<a.length; k++) z[i++] = a[k];
            } 
            else z[i++] = a;
          }
        }
        else {  //all args are cubes
          let start = 0;
          for (let i=-1; i<nArg; i++) {
            let a = (i === -1) ? this : args[i];
            let k = 0;
            if (dim === 0) {
              let nra = a._s[0];
              for (let p=0; p<np; p++) {          
                let pz = p * nr * nc;          
                for (let c=0; c<nc; c++) {
                  let cz = c * nr;
                  for (let r=0; r<nra; r++) {
                    z[r + start + cz + pz] = a[k++];
                  }
                }
              }
              start += nra;
            }
            else {  //dim is 1 since handled above if 2
              let nca = a._s[1];
              for (let p=0; p<np; p++) {          
                let pz = p * nr * nc;
                for (let c=0; c<nca; c++) {
                  let cz = (c + start) * nr;
                  for (let r=0; r<nr; r++) {
                    z[r + cz + pz] = a[k++];
                  }
                }
              }
              start += nca; 
            }
          }
        }
        return z;
      });
    });
  }
    
  
  //--------------- tile, tileTo ---------------//
  
  
  //[num, num, str] -> cube
  addArrayMethod('tile', function(dim, n, ret) {
    this.toCube();
    dim = assert.dim(dim);
    n = assert.nonNegInt(+def(assert.single(n),2));
    ret = def(assert.single(ret), 'full');
    if (ret !== 'full' && ret !== 'core') throw Error(`'full' or 'core' expected`);
    const zShp = copyArray(this._s);
    zShp[dim] *= n;
    const z = zShp.cube();
    if (dim === 2) {  //order of entries is simple
      const nThis = this.length;
      let k = 0;
      for (let i=0; i<n; i++) {
        for (let j=0; j<nThis; j++) {
          z[k++] = this[j];
        }
      }
    }
    else {  //dim is 0 or 1
      const [nr, nc, np] = this._s,
            [nrz, ncz] = z._s;
      for (let i=0; i<n; i++) {
        let start = (dim === 0) ? i * nr : i * nr * nc,
            k = 0;
        for (let p=0; p<np; p++) {          
          let pz = p * nrz * ncz;          
          for (let c=0; c<nc; c++) {
            let cz = c * nrz;
            for (let r=0; r<nr; r++) {
              z[r + start + cz + pz] = this[k++];
            }
          }
        }
      }
    }
    if (ret === 'full') {
      copyKey(this,z,dim);
      copyLabel(this,z,dim);
    }
    return z;
  });
  
  //*[, str] -> cube  
  addArrayMethod('tileTo', function(y,ret) {
    this.toCube();
    ret = def(assert.single(ret), 'full');
    if (ret !== 'full' && ret !== 'core') throw Error(`'full' or 'core' expected`);
    if (Array.isArray(y)) {
      if (y._data_cube) {
        let z;
        for (let d=0; d<3; d++) {
          let nd = this._s[d];
          if (nd === y._s[d]) continue;
          if (nd === 0) throw Error('shape mismatch');
          z = (z || this).tile(d, assert.nonNegInt(y._s[d] / nd), ret); 
        }
        return z || this.copy(ret);  //if this and y same shape, z is undefined
      }
      else {
        if (this._s[1] !== 1 || this._s[2] !== 1) throw Error('shape mismatch');
        if (this.length === y.length) return this.copy(ret);
        if (this.length === 0) throw Error('shape mismatch');
        return this.tile(0, assert.nonNegInt(y.length / this.length), ret);
      }
    }
    else {
      if (this.length !== 1) throw Error('shape mismatch');
      return this.copy(ret); 
    }
  });


  //--------------- unpack ---------------//

  addArrayMethod('unpack', function() {
    this.toCube();
    const n = this.length;
    if (n > 65536) {
      throw Error('exceeds unpack limit of 65536 entries in outer array');
    }
    let z;
    for (let i=0; i<n; i++) {
      if (!Array.isArray(this[i])) throw Error('all entries must be arrays');
    }
    if (n === 1) z = this[0].copy();
    else {
      let dim;
      for (let d=0; d<3; d++) {
        if (this._s[d] !== 1) {
          if (dim !== undefined) throw Error('at least 2 dimensions must have length 1');
          dim = d;
        }
      }
      if (n === 0) {
        const zShp = [1, 1, 1];
        zShp[dim] = 0;
        z = zShp.cube();
      }
      else {
        const mthd = dim === 0 ? 'vert' : (dim === 1 ? 'horiz' : 'depth');
        if (this[0]._data_cube) {  //call cube concat method on entry 0 so use extras 
          z = this[0][mthd](...this.slice(1));
        }
        else {  //entry 0 has no extras, but calling cube method would convert it to a cube
          const zShp = [this[0].length, 1, 1];
          zShp[dim] = 0;
          z = zShp.cube()[mthd](...this);
        }
      }
    }
    return z;
  });
    
  //--------------- which ---------------//
  
  //[func] -> array
  addArrayMethod('which', function(f) {
    this.toCube();             
    f = assert.single(f);
    const n = this.length;
    const z = new Array(n);
    let j = 0;
    if (f !== undefined) {
      assert.func(f);
      for (let i=0; i<n; i++) {
        if (f(this[i], i, this)) z[j++] = i;
      }
    }
    else {
      for (let i=0; i<n; i++) {
        if (this[i]) z[j++] = i;
      }
    }
    z.length = j;
    return z;
  });
    
  
  //--------------- set theory ---------------//
  
  {
    //-> array
    addArrayMethod('unique', function() {
      this.toCube();
      return [...(new Set(this))];
    });

    //-> bool
    addArrayMethod('isUnique', function() {
      this.toCube();
      return this.length === this.unique().length;
    });

    //[*, *, *, ...] -> array
    addArrayMethod('union', function(...args) {
      this.toCube();
      return [...(new Set(this.concat(...args)))];
    });

    //[*, *, *, ...] -> array
    addArrayMethod('diff', function(...args) {
      this.toCube();
      const s = new Set( args.length === 1
        ? toArray(args[0])
        : [].concat(...args)
      );
      return this.unique().filter(v => !s.has(v));
    });
    
    //[*, *, *, ...] -> array
    addArrayMethod('inter', function(...args) {
      this.toCube();
      const nArg = args.length;
      let z = this.unique();
      for (let i=0; i<nArg; i++) {
        if (z.length === 0) break;
        let s = new Set(toArray(args[i]));
        z = z.filter(v => s.has(v));
      }
      return z;
    });

    //[*, *, *, ...] -> cube
    addArrayMethod('isIn', function(...args) {
      this.toCube();
      const s = new Set( args.length === 1
        ? toArray(args[0])
        : [].concat(...args)
      );
      const z = this.copy('shell'),
            n = this.length;
      for (let i=0; i<n; i++) z[i] = s.has(this[i]);
      return z;
    });

  }
  
  
  //--------------- freq ---------------//
  
  //[str] -> cube
  addArrayMethod('freq', function(ret) {
    this.toCube();
    ret = def(assert.single(ret), 'matrix');
    const n = this.length;
    let z;
    if (ret === 'vector') {
      const countMap = new Map(),
            keyMap = new Map();
      let j = 0;
      for (let i=0; i<n; i++) {
        let v = this[i],
            count = countMap.get(v);
        if (count) countMap.set(v, count + 1);
        else {
          countMap.set(v, 1);
          keyMap.set(
            v === undefined ? '_undefined_' : (v === null ? '_null_' : v),
            j++
          );
        }
      }
      z = [...countMap.values()].toCube();
      ensureKey(z);
      z._k[0] = keyMap;
    }
    else if (ret === 'matrix') {
      z = new Array(n);
      const countMap = new Map();
      let j = 0;
      for (let i=0; i<n; i++) {
        let v = this[i],
            count = countMap.get(v);
        if (count) countMap.set(v, count + 1);
        else {
          countMap.set(v, 1);
          z[j++] = v;
        }
      }
      z.length = 2 * j;
      z.$shape([j,2]).$key(1, ['value','count']);  //use [j,2] (not just j) in case j is 0
      for (let v of countMap.values()) z[j++] = v;
    }
    else throw Error(`'vector' or 'matrix' expected`);
    return z;
  });
  
    
  //--------------- flip, roll, shuffle, sample ---------------//
  //--------------- where, order, orderKey, group -------------//
  
  {

    //cube, num, array/cube, bool -> cube. Get rows/cols/pages with
    //indices in ind (even if dim has keys). keyLabel specifies
    //whether result should have keys and label on dim (if x does).
    const arrange = (x, dim, ind, keyLabel) => {
      const zShp = copyArray(x._s);
      zShp[dim] = ind.length;
      const z = zShp.cube(),
            nrx = x._s[0],
            ncx = x._s[1],
            nrz = z._s[0],
            ncz = z._s[1],
            npz = z._s[2];
      let j = 0;
      if (dim === 0) {
        for (let p=0; p<npz; p++) {
          let pp = nrx * ncx * p;
          for (let c=0; c<ncz; c++) {
            let cc = nrx * c;
            for (let r=0; r<nrz; r++) {
              z[j++] = x[ind[r] + cc + pp];
            }
          }
        }
      }
      else if (dim === 1) {
        for (let p=0; p<npz; p++) {
          let pp = nrx * ncx * p;
          for (let c=0; c<ncz; c++) {
            let cc = nrx * ind[c];
            for (let r=0; r<nrz; r++) {
              z[j++] = x[r + cc + pp];
            }
          }
        }
      }
      else {  //dim is 2
        for (let p=0; p<npz; p++) {
          let pp = nrx * ncx * ind[p];
          for (let c=0; c<ncz; c++) {
            let cc = nrx * c;
            for (let r=0; r<nrz; r++) {
              z[j++] = x[r + cc + pp];
            }
          }
        }
      }
      copyKey(x,z,dim);
      copyLabel(x,z,dim);    
      if (keyLabel) {
        if (x._k && x._k[dim]) z.$key(dim, x.key(dim).vec(ind));
        if (x._l && x._l[dim]) z.$label(dim, x._l[dim]);  
      }
      return z;
    };
        
    //[num] -> cube
    addArrayMethod('flip', function(dim) {
      this.toCube();
      dim = assert.dim(dim);
      const n = this._s[dim],
            ind = new Array(n);
      for (let i=0; i<n; i++) ind[i] = n - 1 - i;
      return arrange(this, dim, ind, true);
    });
    
    //[num, num] -> cube
    addArrayMethod('roll', function(dim, shift) {
      this.toCube();
      dim = assert.dim(dim);
      shift = assert.int(+def(assert.single(shift), 1));
      const n = this._s[dim];
      if (shift < 0) shift = n - (-shift % n);
      const ind = new Array(n);
      for (let i=0; i<n; i++) ind[(i + shift) % n] = i;
      return arrange(this, dim, ind, true);
    });
    
    //[num, *] -> cube
    addArrayMethod('shuffle', function(dim, n) {
      this.toCube();
      dim = assert.dim(dim);
      const nd = this._s[dim];
      n = assert.single(n);
      if (n === undefined || n === null) n = nd;
      else n = assert.nonNegInt(+n);
      let ind;
      if (n > 0) {
        if (n > nd) throw Error(`cannot get ${n} shuffled ${helper.dimName[dim]}s ` + 
                                `from dimension of length ${nd}`);
        ind = helper.shuffle(nd);
        if (n < nd) ind = ind.slice(0,n);
      }
      else ind = [];
      return arrange(this, dim, ind, true);
    });
     
    //[num, num] -> cube
    addArrayMethod('sample', function(dim, n, prob) {
      this.toCube();
      dim = assert.dim(dim);
      n = assert.nonNegInt(+def(assert.single(n), 1));
      var [prob,probSingle] = polarize(prob);
      let ind;
      const nd = this._s[dim];
      if (probSingle) {
        if (prob === undefined || prob === null) {  //uniform probs
          if (n > 0) {
            if (nd === 0) throw Error(`cannot sample ${n} ${helper.dimName[dim]}s ` +
                                      `from empty dimension`);
            ind = (nd === 1) ? [n].cube(0) : [n].rand(nd-1);
          }
          else ind = [];
        }
        else {  //passed a single probability - dim length must be 1
          if (nd !== 1) throw Error('shape mismatch');
          prob = assert.nonNegFin(+prob);
          if (prob === 0) throw Error('at least one probability must be non-zero');
          ind = [n].cube(0);
        }
      }
      else {
        if (prob.length !== nd) throw Error('shape mismatch');
        if (nd) {
          for (let i=0; i<nd; i++) assert.nonNegFin(+prob[i]);
          const cumuProb = prob.number().cumuSum(-1);
          const total = cumuProb[nd-1];
          if (total === 0) throw Error('at least one probability must be non-zero');
          ind = new Array(n);
          for (let i=0; i<n; i++) {
            let rnd = Math.random() * total; 
            for (let j=0; j<nd; j++) {
              if (rnd < cumuProb[j]) {
                ind[i] = j;
                break;
              }
            }
          }
        }
        else {
          if (n) throw Error(`cannot sample ${n} ${helper.dimName[dim]}s from empty dimension`);
          ind = [];  
        }
      }
      return arrange(this, dim, ind, false);
    });

    //[num, *] -> cube        
    addArrayMethod('where', function(dim, val) {   
      this.toCube();
      dim = assert.dim(dim);
      var [val, valSingle] = polarize(val);
      if (valSingle) {
        if (typeof val === 'function') {
          val = val(this);
          this.toCube(); 
        }
        val = toArray(val);
      }
      const nd = this._s[dim];
      if (val.length !== nd) throw Error('shape mismatch');
      const ind = new Array(nd);
      let j = 0;
      for (let i=0; i<nd; i++) {
        if (val[i]) ind[j++] = i;
      }
      ind.length = j;
      return arrange(this, dim, ind, true);
    });

    //[num, *, *] -> cube 
    addArrayMethod('order', function(dim, val, how) { 
      this.toCube();
      dim = assert.dim(dim);
      var [val, valSingle] = polarize(val);
      if (valSingle) {
        if (typeof val === 'function') {
          val = val(this);
          this.toCube(); 
        }
        val = toArray(val);
      }
      if (val.length !== this._s[dim]) throw Error('shape mismatch');
      how = assert.single(how);  //value checked by sortIndex
      return arrange(this, dim, sortIndex(val, how), true);
    });
        
    //[num, *] -> cube
    addArrayMethod('orderKey', function(dim, how) {
      this.toCube();
      dim = assert.dim(dim);
      how = assert.single(how);  //value checked by sortIndex
      if (!this._k || !this._k[dim]) throw Error('dimension does not have keys');
      const ky = this.key(dim),
            ind = sortIndex(ky, how);
      const z = arrange(this, dim, ind, false);  //false to avoid arrange getting keys again
      z.$key(dim, ky.vec(ind));
      if (this._l && this._l[dim]) z.$label(dim, this._l[dim]);
      return z;
    });  
    
    //[num, *, str/func]
    addArrayMethod('group', function(dim, val, ent) {
      this.toCube();
      dim = assert.dim(dim);
      var [val, valSingle] = polarize(val);
      if (valSingle) {
        if (typeof val === 'function') {
          val = val(this);
          this.toCube(); 
        }
        val = toArray(val);
      }
      const nd = this._s[dim],
            nv = val.length;
      let zDim = nv / nd;
      if (![1,2,3].includes(zDim)) {
        if (nd === 0 && nv === 0) zDim = 1;
        else throw Error('shape mismatch');
      }
      ent = def(assert.single(ent), 'subcube');
      if (ent !== 'subcube' && ent !== 'count' && typeof ent !== 'function') {
        throw Error(`'subcube', 'count' or function expected`);
      }
      if (nd === 0) return [].$key(0,[]);
      //map for each 'grouping vector'
      const ky = new Array(zDim);
      let j = 0;
      for (let d=0; d<zDim; d++) {
        let mp = new Map();
        for (let i=0; i<nd; i++) {
          let v = val[j++],
              m = mp.get(v);
          if (m) m[m.length] = i;
          else {
            if (v === '_undefined_' || v === '_null_') {
              throw Error(`entry has value '_undefined_' or '_null_'`);          
            }
            mp.set(v,[i]);
          }
        }
        ky[d] = mp;
      }
      //vector index of z where each index of dim will go
      let size = ky.map(mp => mp.size);
      let zInd = fill(new Array(nd), 0);
      for (let d=0; d<zDim; d++) {
        let mult = d === 0 ? 1 : (d === 1 ? size[0] : size[0] * size[1]);
        let mp = ky[d],
            j = 0;
        for (let ind of mp.values()) {
          const nInd = ind.length;
          for (let i=0; i<nInd; i++) zInd[ind[i]] += j * mult;
          j++;
        }
      };
      //collect indices of dim going to same vector index of z
      const z = size.cube();
      for (let i=0; i<nd; i++) {
        let destInd = zInd[i],
            destVal = z[destInd];
        if (destVal) destVal[destVal.length] = i;
        else z[destInd] = [i];
      }
      //set keys of z
      ensureKey(z);
      ky.map((mp, d) => {  //new maps for keys of z since maps in ky may use null/undefined
        let newMp = new Map(),
            j = 0;
        for (let k of mp.keys()) {
          if      (k === undefined) k = '_undefined_';
          else if (k === null)      k = '_null_';
          newMp.set(k, j++);
        }
        z._k[d] = newMp;
      });
      //set entries of z
      if (typeof ent === 'function') {
        let j = 0,
            sc = (...arg) => {
              z[j] = ent(arrange(this, dim, z[j] || [], true), ...arg);
              j++;
            };
        if (zDim === 1) {
          for (let r of z.key(0)) sc(r);
        }
        else if (zDim === 2) {
          for (let c of z.key(1)) for (let r of z.key(0)) sc(r, c);
        }
        else {  //zDim is 3
          for (let p of z.key(2)) for (let c of z.key(1)) for (let r of z.key(0)) sc(r, c, p);
        }
      }
      else {  //ent is 'count' or 'subcube'
        const nz = z.length;
        for (let i=0; i<nz; i++) {
          let ind = z[i] || [];
          z[i] = (ent === 'count') 
            ? ind.length
            : arrange(this, dim, ind, true);
        }
      }
      return z;
    });
    
  }

  //--------------- arrange ---------------//
  
  //[*, str] -> array
  addArrayMethod('arrange', function(how, ret) {
    this.toCube();
    how = assert.single(how);  //value checked by sort funcs
    ret = def(assert.single(ret), 'value');
    if (ret === 'value') return sortInPlace(copyArray(this), how);
    if (ret === 'index') return sortIndex(this, how);
    if (ret === 'rank')  return sortRank(this, how);
    throw Error(`'value', 'index' or 'rank' expected`);
  });
        
  
  //--------------- bin ---------------//
  
  //array/cube[, *, array/cube] -> cube
  addArrayMethod('bin', function(lim, how, name) {
    this.toCube();
    lim = copyArray(toArray(lim));  //copy so can sort or use cube methods
    const nLim = lim.length;
    if (nLim < 2) throw Error('at least 2 bin limits expected');
    how = assert.single(how);
    let test = helper.comparison(how);  //undefined if how undefined or null
    var [name, nameSingle] = polarize(name);
    if (nameSingle) {
      if (name === undefined) {
        lim.sort(test);
        name = lim;
      }
      else throw Error('invalid bin names');
    }
    else {
      if (name.length !== nLim) {
        throw Error('number of bin names not equal to number of bins');
      }
      const sortedIndex = sortIndex(lim,how);
      lim  = sortedIndex.map(i =>  lim[i]);
      name = sortedIndex.map(i => name[i]);
    }
    if (!name.isUnique()) throw Error('bin names not unique');
    if (!test) test = (a,b) => a <= b ? -1 : 1;
    const n = this.length,
          z = this.copy('shell');
    outer: for (let i=0; i<n; i++) {
      let v = this[i];
      for (let j=0; j<nLim; j++) {
        if (test(v, lim[j]) <= 0) {
          z[i] = name[j];
          continue outer;
        }
      }
      throw Error('entry not assigned to any bin');  
    }
    return z;
  });
  
  
  //--------------- matrix, arAr, arObj, dsv, dict ---------------//
  
  {
    
    const stripBom = require('strip-bom'),
          d3 = require('d3-dsv');
    
    //[str, bool] -> cube
    addArrayMethod('matrix', function(delim, name) {
      delim = assert.single(delim);
      let dsvKy, data;
      if (delim) {  //get matrix from string in dsv format
        if (this.length !== 1) throw Error('1-entry array expected');
        name = def(assert.single(name), true);
        data = d3.dsvFormat(delim).parseRows(stripBom(this[0]));
        if (name) dsvKy = data.shift();
      }
      else data = this;  //get matrix from array-of-arrays/objects
      const n = data.length;
      if (n === 0) throw Error('non-empty array expected');
      let z,
          ent = data[0];
      if (Array.isArray(ent)) {
        const nc = (dsvKy || ent).length;
        z = [n,nc].cube();
        if (dsvKy) z.$key(1, dsvKy);
        for (let r=0; r<n; r++) {
          ent = data[r];
          for (let c=0; c<nc; c++) {
            z[r + n*c] = ent[c];  
          }
        }
      }
      else if (typeof ent === 'object') {
        const ky = Object.keys(ent),
              nc = ky.length;
        z = [n,nc].cube();
        z.$key(1, ky);
        for (let r=0; r<n; r++) {
          ent = data[r];
          for (let c=0; c<nc; c++) {
            z[r + n*c] = ent[ky[c]];
          }
        }
      }
      else throw Error('array or object expected');
      return z;
    });

    //-> array
    addArrayMethod('arAr', function() {
      let z;
      if (this._data_cube) {
        const [nr, nc, np] = this._s;
        if (np !== 1) throw Error('single page expected');
        z = new Array(nr);
        for (let r=0; r<nr; r++) {
          let rw = new Array(nc);
          for (let c=0; c<nc; c++) {
            rw[c] = this[r + nr*c];
          }
          z[r] = rw;
        }
      }
      else {
        const n = this.length;
        z = new Array(n);
        for (let r=0; r<n; r++) z[r] = [this[r]];
      }
      return z;
    });
    
    //-> array
    addArrayMethod('arObj', function() {
      if (!this._data_cube || !this._k || !this._k[1]) {
        throw Error('column keys expected');
      }
      if (this._s[2] !== 1) throw Error('single page expected');
      const name = this.key(1).string();
      if (!name.isUnique()) throw Error('two column keys convert to the same string');
      const [nr, nc] = this._s,
            z = new Array(nr);
      for (let r=0; r<nr; r++) {
        let obj = {};
        for (let c=0; c<nc; c++) {
          obj[name[c]] = this[r + nr*c];
        }
        z[r] = obj;
      }
      return z;
    });
    
    //[str] -> string
    addArrayMethod('dsv', function(delim) {
      delim = def(assert.single(delim), ',');
      const data = this.arAr();
      if (this._data_cube && this._k && this._k[1]) {
        const name = this.key(1).string();
        if (!name.isUnique()) throw Error('two column keys convert to the same string');
        data.unshift(name.toArray());
      }
      return d3.dsvFormat(delim).formatRows(data);
    });
  
    //array/cube -> cube
    addArrayMethod('dict', function(dim) {
      dim = assert.dim(dim);
      const n = this.length / 2;
      if (!Number.isInteger(n)) throw Error('even number of entries expected');
      const k = new Array(n),
            x = new Array(n);
      for (let i=0; i<n; i++) {
        k[i] = this[2*i];
        x[i] = this[2*i + 1];
      }
      const shp = [1, 1, 1];
      shp[dim] = n;
      return x.$shape(shp).$key(dim, k);
    });

  }

  //--------------- stringify, parse ---------------//
  
  //-> string
  addArrayMethod('stringify', function() {
    if (this._data_cube) {
      return JSON.stringify({
        array: this,
        _data_cube: true,
        _s: this._s,
        _k: this._k ? this._k.map((ky,d) => this.key(d)) : undefined,
        _l: this._l  //undefined values are removed by JSON.stringify()
      });
    }
    return JSON.stringify(this);
  });
       
  //-> array/cube
  addArrayMethod('parse', function() {
    if (this.length !== 1) throw Error('1-entry array expected');
    const data = JSON.parse(this[0]);
    if (Array.isArray(data)) return data;
    else if (data._data_cube) {
      const z = data.array;
      z._data_cube = true;
      z._s = data._s;
      if (data._k) {
        for (let d=0; d<3; d++) {
          if (data._k[d]) z.$key(d, data._k[d]);
        }
      }
      if (data._l) z._l = data._l.map(v => v || undefined); 
      return z;
    }
    else throw Error('serialized array or cube expected');
  });

  //--------------- updates ---------------//

  {
    //-> cube
    for (let [nm, prop] of [['before', '_b'], ['after', '_a']]) {
      addArrayMethod(nm, function() {
        this.toCube();
        if (this[prop]) return this[prop].copy();
        else return [0].cube();
      });
    }
    
    //array/cube, *, str -> cube
    const setUpdate = (x, val, prop) => {
      x.toCube();
      val = toArray(val);
      if (val.length === 0 ||
           (val.length === 1 && (val[0] === undefined || val[0] === null))) {
        delete x[prop];
      }
      else {
        for (let v of val) assert.func(v);
        x[prop] = val.copy();
      }
      return x;
    };

    //[*] -> cube
    addArrayMethod('$before', function (val) { return setUpdate(this, val, '_b') });
    addArrayMethod('$after',  function (val) { return setUpdate(this, val, '_a') });

  }
    
  //--------------- export dc function ---------------//
      
  {
    const dc = ar => toArray(ar).toCube();
      
    ['cube','rand','normal',
     'seq','lin','grid','copy','toArray',
     'matrix','arAr','arObj','dsv','dict',
     'stringify','parse'].forEach( nm => {
      dc[nm] = (x,...args) => toArray(x)[nm](...args);
    });
    
    //assertion functions for tests
    dc._assert = require('./assert.js');
    
    //assertion functions that depend on data-cube methods
    dc._assert.test = (name, a, b) => {
      try { 
        a.compare(b);
      }
      catch (err) {
        dc._assert.fail(name, err.message);
      }
    };
    dc._assert.test.approx = (name, a, b) => {
      try { 
        a.copy('shell').compare(b.copy('shell'));
        const n = a.length;
        for (let i=0; i<n; i++) {
          if (!(Math.abs(a[i] - b[i]) < 1e-12)) {  //use < and ! rather than >= so catch NaN
            throw Error(`entries at vector index ${i} not approximately equal`);
          }
        }
      }
      catch (err) {
        dc._assert.fail(name, err.message);
      }
    };
    dc._assert.test.throw = (name, a, b) => {
      try { 
        a.compare(b);
      }
      catch (err) {
        return;
      }
      dc._assert.fail(name, 'expected error but none thrown');
    };
                                         
    module.exports = dc;
  }
          
})();