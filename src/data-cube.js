
{
  'use strict';
  
  //--------------- prep ---------------//

	const helper = require('data-cube-helper');
  
  const { 
    assert, fill, fillEW, addArrayMethod, squeezeKey, squeezeLabel,
    keyMap, isSingle, polarize, def, toArray, copyArray, copyMap,
    ensureKey, ensureLabel, nni, copyKey, copyLabel, skeleton
  } = helper;
    
  //methods use standard accessors for these properties; if an 
  //absent property is on the prototype chain, methods will
  //incorrectly treat it as instance-level 
  ['_data_cube', '_s', '_k', '_l'].forEach(prop => {
    if (prop in Array.prototype) {
      throw Error(prop + ' is a property of Array.protoype'); 
    }
  });
  
    
  //--------------- convert array to cube ---------------//
  
  //array ->, x should NOT be a cube
  const toCube = x => {
    Object.defineProperty(x, 'length', { writable: false });  
    Object.defineProperty(x, '_data_cube', { value: true });
    Object.defineProperty(x, '_s', {
      value: [x.length,1,1],
      writable: true
    });
  };

  //array/cube -> cube, does nothing if already a cube
  addArrayMethod('toCube', function() {
    if (!this._data_cube) toCube(this);
    return this;
  });
  
    
  //--------------- compare ---------------//
  
  //array/cube[, bool] -> cu/false
  addArrayMethod('compare', function(b, asrt) {
    if (!this._data_cube) toCube(this);
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

  
  //--------------- create cube ---------------//
  
  //[*] -> cube, new cube from shape array
  addArrayMethod('cube', function(val) {
    if (this.length > 3) throw Error('shape cannot have more than 3 entries');
    const r = this[0] === undefined ? 1 : assert.nonNegInt(this[0]);  
    const c = this[1] === undefined ? 1 : assert.nonNegInt(this[1]);  
    const p = this[2] === undefined ? 1 : assert.nonNegInt(this[2]);  
    const z = new Array(r*c*p);
    toCube(z);
    z._s[0] = r;
    z._s[1] = c;
    z._s[2] = p;
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
      const lim = assert.posInt(mx) + 1;
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
    mu = assert.number(def(assert.single(mu),0));
    sig = assert.number(def(assert.single(sig),1));
    if (sig <= 0) throw Error('positive number expected (standard deviation)');
    const z = this.cube();
    const n = z.length;
    for (let i=0; i<n; i++) z[i] = sampleNormal() * sig + mu;
    return z;
  });
    
  
  //--------------- shape ---------------//
  
  //-> 3-entry array
  addArrayMethod('shape', function() {
    if (!this._data_cube) toCube(this);
    return copyArray(this._s);
  });
    
  //[number/array] -> cube
  addArrayMethod('$shape', function(shp) {
    if (!this._data_cube) toCube(this);
    assert.argRange(arguments,0,1);
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
    return this;
  });
  
  //[num] -> bool
  addArrayMethod('n', function(dim) {
    if (!this._data_cube) toCube(this);
    dim = assert.dim(dim);
    return this._s[dim];
  });
       
  
  //--------------- labels ---------------//
    
  //[num] -> string/undefined
  addArrayMethod('label', function(dim) {
    if (!this._data_cube) toCube(this);
    dim = assert.dim(dim);
    if (this._l) return this._l[dim];
  });
    
  //[num], str -> cube
  addArrayMethod('$label', function(dim,val) {
    if (!this._data_cube) toCube(this);
    const nArg = assert.argRange(arguments,1,2);    
    if (nArg === 1) [dim,val] = [undefined,dim];
    dim = assert.dim(dim);
    val = '' + assert.single(val);
    if (val === '') throw Error('label cannot be empty string');    
    ensureLabel(this);
    this._l[dim] = val;
    return this;
  });
    
  
  //--------------- keys ---------------//
  
  //[num] -> array/undefined
  addArrayMethod('key', function(dim) {
    if (!this._data_cube) toCube(this);
    dim = assert.dim(dim);
    if (this._k) {
      const mp = this._k[dim];
      if (mp) return [...mp.keys()];
    }
  });
    
  //[num], * -> cube
  addArrayMethod('$key', function(dim,val) {
    if (!this._data_cube) toCube(this);
    const nArg = assert.argRange(arguments,1,2);    
    if (nArg === 1) [dim,val] = [undefined,dim];
    dim = assert.dim(dim);
    const mp = keyMap(toArray(val));
    if (this._s[dim] !== mp.size) throw Error('shape mismatch');
    ensureKey(this);
    this._k[dim] = mp;
    return this;
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
    toCube(z);
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
  

  //--------------- basic ---------------//
  
  
  //[num, *] -> bool
  addArrayMethod('hasKey', function(dim, k) {
    if (!this._data_cube) toCube(this);
    dim = assert.dim(dim);
    k = assert.single(k);
    const _k = this._k;
    const keysOnDim = !!(_k && _k[dim]);
    return k === undefined ? keysOnDim : keysOnDim && _k[dim].has(k);
  });
  
  
  //--------------- at, $at ---------------//
  
  {
  
    //non-empty-cube, num, * -> num: non-neg-index on dimension
    //dim of x corresponding to singelton value j; j can be a
    //key or index (possibly negative)
    const nniFromAny = (x, dim, j) => {
      if (j === undefined || j === null) return 0;
      if (x._k && x._k[dim]) return assert.number(x._k[dim].get(j));
      return nni(j, x._s[dim]);
    };
        
    //[*, * , *] -> *
    addArrayMethod('at', function(r, c, p) {
      if (!this._data_cube) toCube(this);
      if (this.length === 0) throw Error('cube has no entries');
      const nArg = arguments.length;
      if (nArg <= 1) {
        return this[ nniFromAny(this, 0, assert.single(r)) ];
      }
      else if (nArg === 2) {
        return this[ nniFromAny(this, 0, assert.single(r)) + 
                     nniFromAny(this, 1, assert.single(c)) * this._s[0] ];
      }
      else {
        const _s = this._s;
        return this[ nniFromAny(this, 0, assert.single(r)) + 
                     nniFromAny(this, 1, assert.single(c)) * _s[0] + 
                     nniFromAny(this, 2, assert.single(p)) * _s[0] * _s[1] ];
      }
    });
  
    //*[, *, *, *] -> cube
    addArrayMethod('$at', function(r, c, p, val) {
      if (!this._data_cube) toCube(this);
      if (this.length === 0) throw Error('cube has no entries');
      const nArg = assert.argRange(arguments,1,4);
      if (nArg === 2) {
        this[ nniFromAny(this, 0, assert.single(r)) ] = assert.single(c);
      }
      else if (nArg === 3) {
        this[ nniFromAny(this, 0, assert.single(r)) + 
              nniFromAny(this, 1, assert.single(c)) * this._s[0] ] = assert.single(p);
      }
      else if (nArg === 4) {
        const _s = this._s;
        this[ nniFromAny(this, 0, assert.single(r)) + 
              nniFromAny(this, 1, assert.single(c)) * _s[0] + 
              nniFromAny(this, 2, assert.single(p)) * _s[0] * _s[1] ] = assert.single(val);
      }
      else this[0] = assert.single(r);
      return this;
    });

  }
  
  //--------------- vec, $vec ---------------//
  
  //* -> array
  addArrayMethod('vec', function(i) {
    if (!this._data_cube) toCube(this);    
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
  
  //*[, *] -> cube
  addArrayMethod('$vec', function(i, val) {
    if (!this._data_cube) toCube(this);
    const nArg = assert.argRange(arguments,1,2);
    if (arguments.length === 1) [i, val] = [null, i];
    const n = this.length;
    var [i,iSingle] = polarize(i);
    var [val,valSingle] = polarize(val);
    if (iSingle) {
      if (i === undefined || i === null) (valSingle ? fill : fillEW)(this,val);
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
    return this;
  });


  //--------------- subcubes ---------------//
        
  {
    const {rangeInd, keyInd, indInd} = helper;
    
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
    addArrayMethod('sc', function(row, col, page, ret) {
      if (!this._data_cube) toCube(this);
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
      toCube(z);
      //shape
      z._s[0] = nrz,  z._s[1] = ncz,  z._s[2] = npz;
      if (ret === 'core') return z;
      //extras
      if (this._k) {
        ensureKey(z); 
        for (let d=0; d<3; d++) {
          if (this._k[d]) {
            z._k[d] = ind[d][1] ? copyMap(this._k[d]) : keyMap(toArray(arguments[d]));
          }
        }
      }
      copyLabel(this,z);
      return z;      
    });
    
    //*, *, *, *, * -> cube
    addArrayMethod('$sc', function(row, col, page, val) {
      if (!this._data_cube) toCube(this);
      const nArg = assert.argRange(arguments,1,4);
      switch (nArg) {
        case 1:  [row, col, page, val] = [   ,    , ,  row];  break;
        case 2:  [row, col, page, val] = [row,    , ,  col];  break;
        case 3:  [row, col, page, val] = [row, col, , page];  break;
        case 4:  break;
      }
      const [nr, nc] = this._s;
      const rInd = getInd(this,0,row)[0],
            cInd = getInd(this,1,col)[0],
            pInd = getInd(this,2,page)[0];
      const nrz = rInd.length,  ncz = cInd.length,  npz = pInd.length;
      var [val,valSingle] = polarize(val);
      if (!valSingle && val.length !== nrz * ncz * npz) throw Error('shape mismatch');
      let j = 0;
      for (let p=0; p<npz; p++) {
        let pp = nr * nc * pInd[p];
        for (let c=0; c<ncz; c++) {
          let cc = nr * cInd[c];
          for (let r=0; r<nrz; r++) {
            this[rInd[r] + cc + pp] = valSingle ? val : val[j++];
          }
        }
      }
      return this;
    });
    
    //row, col, page getters and setters
    {
      addArrayMethod('row',   function(j, ret) { return this.sc(   j, null, null, ret) });
      addArrayMethod('col',   function(j, ret) { return this.sc(null,    j, null, ret) });
      addArrayMethod('page',  function(j, ret) { return this.sc(null, null,    j, ret) });
      
      addArrayMethod('$row',  function(j, val) { 
        const nArg = assert.argRange(arguments,1,2);
        return nArg === 1 ? this.$sc(j) : this.$sc(   j, null, null, val);
      });
      addArrayMethod('$col',  function(j, val) { 
        const nArg = assert.argRange(arguments,1,2);
        return nArg === 1 ? this.$sc(j) : this.$sc(null,    j, null, val);
      });
      addArrayMethod('$page', function(j, val) { 
        const nArg = assert.argRange(arguments,1,2);
        return nArg === 1 ? this.$sc(j) : this.$sc(null, null,    j, val);
      });
    }
      
    //bool, array/cube, num, *, *, * -> *
    const downAlongBack = function(setter, x, dim, s, e, retVal) {
      if (!x._data_cube) toCube(x);
      let mthd;
      if (setter) {
        const nArg = assert.argRange(arguments,4,6);  
        switch (nArg) {
          case 4:  [s, e, retVal] = [null, null, s];  break;  
          case 5:  [s, e, retVal] = [   s, null, e];  break;  
          case 6:  break;  
        }
        mthd = '$sc';
      }
      else mthd = 'sc'; 
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
      switch (dim) {
        case 0:  return x[mthd](   q, null, null, retVal); 
        case 1:  return x[mthd](null,    q, null, retVal); 
        case 2:  return x[mthd](null, null,    q, retVal); 
      }
    };
    
    ['down', 'along', 'back', '$down', '$along', '$back'].forEach( (name, i) => {
      addArrayMethod( name, function(s, e, retVal) {
        return downAlongBack(i > 2, this, i % 3, ...arguments);
      });
    });

    //[num, num, num, str] -> cube
    addArrayMethod('head', function(nr, nc, np, ret) {
      if (!this._data_cube) toCube(this);
      const ind = new Array(3);
      for (let d=0; d<3; d++) {
        let m = assert.single(arguments[d]);
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
      return this.sc(...ind, ret);
    });
  }
  
  
  //--------------- generators: rows, cols, pages ---------------//
  
  {
    //cube, num, str, num[, *] -> cube, optimized subcube function
    //for generators; gets individual row, col or page. Assumes:
    //  -x already a cube
    //  -dim a valid dimension
    //  -ret is 'full', 'core' or 'array'
    //  -xSkel is the skelton of x when the generator was created
    //  -m is a valid non-neg index of dim
    //  -mKey is the key that corresponds to m if dim has keys
    const singleRCP = (x, dim, ret, xSkel, m, mKey) => {
      const [nr, nc, np] = xSkel._s;
      const epp = nr * nc;
      let j = 0;
      let z;
      if (dim === 0) {
        z = new Array(nc * np);        
        for (let p=0; p<np; p++)  for (let c=0; c<nc; c++)  z[j++] = x[m + nr*c + epp*p];
      }
      else if (dim === 1) {
        z = new Array(nr * np);
        for (let p=0; p<np; p++)  for (let r=0; r<nr; r++)  z[j++] = x[r + nr*m + epp*p];
      }
      else {
        z = new Array(nr * nc);
        for (let c=0; c<nc; c++)  for (let r=0; r<nr; r++)  z[j++] = x[r + nr*c + epp*m];
      }
      if (ret === 'array') return z;
      toCube(z);
      //shape
      z._s[0] = nr,  z._s[1] = nc,  z._s[2] = np;
      z._s[dim] = 1;
      if (ret === 'core') return z;
      //extras
      copyKey(xSkel,z,dim);  //xSkel does not have keys on dim
      if (mKey !== undefined) {
        ensureKey(z); 
        const mp = new Map();
        mp.set(mKey,0);
        z._k[dim] = mp;
      }
      copyLabel(xSkel,z);
      return z;      
    };

    //array/cube, num[, str] -> generator
    const dimLoop = (x, dim, ret) => {
      if (!x._data_cube) toCube(x);
      ret = def(assert.single(ret), 'none');
      const ky = x._k && x._k[dim];
      const n = x._s[dim];
      if (ret === 'none') {
        if (ky) {
          return (function* () {
            for (let j of x._k[dim].keys()) yield j;
          })();
        }
        return (function* () {
          for (let i=0; i<n; i++) yield i;
        })();
      }
      else {
        const xSkel = skeleton(x,dim);
        if (ret !== 'full' && ret !== 'core' && ret !== 'array') {
          throw Error(`'none', 'full', 'core', or 'array' expected`);
        }
        if (ky) { 
          return (function* () {
            for (let [j,i] of x._k[dim].entries()) yield [j, singleRCP(x, dim, ret, xSkel, i, j)];
          })();
        }
        return (function* () {
          for (let i=0; i<n; i++) yield [i, singleRCP(x, dim, ret, xSkel, i)]; 
        })();
      }
    };
    
    ['rows', 'cols', 'pages'].forEach( (name,d) => {
      addArrayMethod(name, function(ret) { return dimLoop(this, d, ret) });
    });    
    
  }
  
  
  //--------------- vble ---------------//
  
  //[num] -> array
  addArrayMethod('vble', function(dim) {
    if (!this._data_cube) toCube(this);
    dim = def(assert.single(dim), 0);  //dim can be -1 so do not use assert.dim
    const prefix = ['r_', 'c_', 'p_'];
    const {_s, _k, _l} = this;
    const [nr, nc, np] = _s;
    const [rk, ck, pk] = [0,1,2].map(d => {
      return _k && _k[d]
        ? [..._k[d].keys()]
        : helper.simpleRange(_s[d]).map(ind => prefix[d] + ind);
    });
    const [rl, cl, pl] = 
      [0,1,2].map(d => (_l && _l[d]) || helper.shortDimName[d]);
    let z;
    if (dim === -1) {
      z = new Array(this.length);
      let i = 0;
      for (let p=0; p<np; p++) {
        let pp = nr * nc * p;
        for (let c=0; c<nc; c++) {
          let cc = nr * c;
          for (let r=0; r<nr; r++) {
            z[i++] = {
              [rl]: rk[r], 
              [cl]: ck[c],
              [pl]: pk[p],
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
          if (!this._data_cube) toCube(this);
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
      ['toUpperCase', x => x.toUpperCase()]
    ];
    
    //-> cube
    for (let [nm,f] of ewFunc) {
      addArrayMethod(nm, function() {
        if (!this._data_cube) toCube(this);
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
      ['lof', (a,b) => Math.min],
      ['gof', (a,b) => Math.max],	
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
        if (!this._data_cube) toCube(this);
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
  
  
  //--------------- entrywise: method ---------------//
  
  //*[, *, *, *, ...] -> cube
  addArrayMethod('method', function(nm, ...mthdArg) {
    if (!this._data_cube) toCube(this);
    const z = this.copy('shell');
    const n = this.length;
    var [nm,nmSingle] = polarize(nm);
    if (!nmSingle && nm.length !== n) throw Error('shape mismatch');
    const getName = nmSingle ? () => nm : i => nm[i];
    const na = mthdArg.length;
    if (na === 0) {
      for (let i=0; i<n; i++) z[i] = this[i][getName(i)]();
      return z;
    }
    const getArg = new Array(na);
    for (let i=0; i<na; i++) {
      let [a, aSingle] = polarize(mthdArg[i]);
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
    }
    for (let i=0; i<n; i++) z[i] = this[i][getName(i)](...getAllArg(i));
    return z;
  });
  
  
  //--------------- entrywise: prop ---------------//
  //--------------- (and for now, some html style, attr and class methods) ---------------//
  
  {

    //array/cube, str, * -> array/cube. Only converts x to a
    //cube and returns a cube if mthd is 'prop'; other methods
    //are HTML methods.
    const getInfo = (x, mthd, nm) => {
      if (mthd === 'prop' && !x._data_cube) toCube(x);
      const n = x.length;
      var [nm,nmSingle] = polarize(nm);
      if (!nmSingle && nm.length !== n) throw Error('shape mismatch');
      const z = (mthd === 'prop') ? x.copy('shell') : new Array(n);
      const getName = nmSingle ? () => nm : i => nm[i];
      if      (mthd === 'prop')     { for (let i=0; i<n; i++) z[i] = x[i][getName(i)] }
      else if (mthd === 'style')    { for (let i=0; i<n; i++) z[i] = window.getComputedStyle(x[i])[getName(i)] }
      else if (mthd === 'attr')     { for (let i=0; i<n; i++) z[i] = x[i].getAttribute(getName(i)) }
      else if (mthd === 'hasAttr')  { for (let i=0; i<n; i++) z[i] = x[i].hasAttribute(getName(i)) }
      else if (mthd === 'hasClass') { for (let i=0; i<n; i++) z[i] = x[i].classList.contains(getName(i)) }
      else throw Error('invalid argument');
      return z;
    };

    //* -> array/cube
    ['prop','attr','style','hasAttr','hasClass'].forEach(mthd => {
      addArrayMethod(mthd, function(nm) {
        return getInfo(this, mthd, nm);
      });
    });

    //array/cube, str, array -> array/cube. Only converts x to a
    //cube if mthd is '$prop'; other methods are HTML methods.
    const setInfo = (x, mthd, nameVal) => {
      if (mthd === '$prop' && !x._data_cube) toCube(x);
      const n = x.length;
      const nArg = nameVal.length;
      if (nArg < 2 || nArg % 2 !== 0) throw Error('invalid number of arguments');
      const nPair = nArg / 2;
      const getName = new Array(nPair);
      const getVal  = new Array(nPair);
      for (let i=0; i<nPair; i++) {
        let [name, nameSingle] = polarize(nameVal[2*i]);
        let [val,  valSingle]  = polarize(nameVal[2*i + 1]);
        if (!nameSingle && name.length !== n) throw Error('shape mismatch');
        if (!valSingle  &&  val.length !== n) throw Error('shape mismatch');
        getName[i] = nameSingle ? () => name : j => name[j];
        if (!valSingle)                     getVal[i] =  j => val[j];
        else if (typeof val === 'function') getVal[i] =  j => val(x[j],j,x);
        else                                getVal[i] = () => val;
      }
      for (let i=0; i<nPair; i++) {
        let getName_i = getName[i];
        let getVal_i = getVal[i];
        if (mthd === '$prop') {
          for (let j=0; j<n; j++) x[j][getName_i(j)] = getVal_i(j);
        }
        else if (mthd === '$style') {
          for (let j=0; j<n; j++) x[j].style[getName_i(j)] = getVal_i(j);
        }
        else if (mthd === '$attr') {
          for (let j=0; j<n; j++) x[j].setAttribute(getName_i(j), getVal_i(j));
        }
        else throw Error('invalid argument');
      }
      return x;
    };
        
    //*, *[, *, *, *, * ...] -> array/cube
    ['$prop','$attr','$style'].forEach(mthd => {
      addArrayMethod(mthd, function(...nameVal) {
        return setInfo(this, mthd, nameVal);
      });
    });
    
  }
    

  //--------------- entrywise, cmap ---------------//

  addArrayMethod('cmap', function(f, asThis) {
    if (!this._data_cube) toCube(this);
    const z = this.map(assert.single(f), assert.single(asThis));
    toCube(z);
    z._s[0] = this._s[0];
    z._s[1] = this._s[1];
    z._s[2] = this._s[2];
    copyKey(this,z);
    copyLabel(this,z);
    return z;
  });
  
  
  //--------------- fold - all fold methods ---------------//
  
  {

    //array/cube, num, func[, *], bool -> cube
    const foldCumu = (x, dim, f, init, cu) => {
      if (!x._data_cube) toCube(x);
      dim = def(assert.single(dim), 0);  //dim can be -1 so do not use assert.dim
      init = assert.single(init);
      const n = x.length;
      let v, z;
      const start = (init === undefined) ? 1 : 0;
      if (dim === -1) {
        v = (init === undefined) ? x[0] : init;
        if (cu) {
          z = [n].cube();
          if (start && n) z[0] = v;
          for (let i=start; i<n; i++) z[i] = v = f(v, x[i], i, x);
        }
        else {
          for (let i=start; i<n; i++) v = f(v, x[i], i, x);
          z = [v];
          z.toCube();
        }
      }
      else {
        const [nr, nc, np] = x._s;
        const epp = nr*nc;
        //setup z here in case callback changes keys or labels
        if (cu) z = x.copy('shell');
        else {
          if      (dim === 0) z = [ 1, nc, np].cube();
          else if (dim === 1) z = [nr,  1, np].cube();
          else if (dim === 2) z = [nr, nc,  1].cube();
          copyKey(x,z,dim);
          copyLabel(x,z,dim);
        }
        if (dim === 0) {
          let i = 0;
          for (let p=0; p<np; p++) {
            let pp = epp*p;
            for (let c=0; c<nc; c++) {
              let cc = nr*c;
              v = (init === undefined) ? x[cc + pp] : init;
              if (cu) {
                if (start && n) z[cc + pp] = v;
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
              v = (init === undefined) ? x[r + pp] : init;
              if (cu) {
                if (start && n) z[r + pp] = v;
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
              v = (init === undefined) ? x[r + cc] : init;
              if (cu) {
                if (start && n) z[r + cc] = v;
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
    
    //num -> cube
    const basic = [
      ['sum'      , (a,b) => a + b   , 0],
      ['prod'     , (a,b) => a * b   , 1],
      ['all'      , (a,b) => a && b  , true],
      ['any'      , (a,b) => a || b  , false],
      ['truthy'   , (a,b) => a + !!b , 0],
      ['min'      , (a,b) => Math.min(a,b) ,  Infinity],  //do not pass Math.min since fold will pass it 4 args 
      ['max'      , (a,b) => Math.max(a,b) , -Infinity]
    ]
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
    
    //[bool] -> func, fold func for minPosn or maxPosn
    const minMax = mx => {
      if (mx) return (a,b,i) => a[0] < b ? [b,i] : a;
      else    return (a,b,i) => a[0] > b ? [b,i] : a;
    };
      
    //num -> cube
    ['minPosn', 'maxPosn', 'cumuMinPosn', 'cumuMaxPosn'].forEach((nm,j) => {
      addArrayMethod(nm, function(dim) {
        const mx = j % 2;
        let z = this[j > 1 ? 'cumu' : 'fold'](dim, minMax(mx), [[mx ? -Infinity : Infinity, null]]);
        dim = def(assert.single(dim), 0);
        const nz = z.length;
        if (dim !== -1 && this._k && this._k[dim]) {
          const ky = this.key(dim);
          for (let i=0; i<nz; i++) z[i] = ky[z[i][1]];
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
        dim = def(assert.single(dim), 0);
        const geo = nm === 'geoMean';
        const z = this[geo ? 'prod' : 'sum'](dim);  //this and z are cubes from sum/prod
        if (dim === -1) z[0] = geo ? z[0]^(1/this.length) : z[0]/this.length;
        else {
          const n = z.length;
          let v = this._s[dim];
          if (geo) {
            v = 1/v;
            for (let i=0; i<n; i++) z[i] ^= v;
          }
          else {
            for (let i=0; i<n; i++) z[i] /= v;
          }
        }
        return z;
      });
    });
    
    //num[, str] -> cube
    addArrayMethod('sew', function(dim, sep) {
      sep = def(assert.single(sep), ',')
      return this.fold(dim, (a,b) => `${a}${sep}${b}`);
    });
    
    //num[, bool] -> cube
    addArrayMethod('var', function(dim, n) {
      dim = def(assert.single(dim), 0);
      n = def(assert.single(n), true);
      const f = (a, newValue) => {
        const count = a[0] + 1;
        const delta = newValue - a[1];
        const mean = a[1] + (delta / count);
        const M2 = a[2] + (delta * (newValue - mean));
        return [count, mean, M2];
      };
      const z = this.fold(dim, f, [[0, 0, 0]]);  //this now a cube, dim is valid
      const nz = z.length;
      let nDiv = (dim === -1) ? this.length : this._s[dim];
      if (!n) nDiv--;
      for (let i=0; i<nz; i++) z[i] = z[i][2] / nDiv;
      return z;
    });
    
    //num[, bool] -> cube
    addArrayMethod('sd', function(dim, n) {
      const z = this.var(dim,n);
      const nz = z.length;
      for (let i=0; i<nz; i++) z[i] = Math.sqrt(z[i]);
      return z;
    });
    
    //num[, func, string] -> cube
    addArrayMethod('wrap', function(dim, ret) {
      if (!this._data_cube) toCube(this);
      dim = def(assert.single(dim), 0);  //dim can be -1 so do not use assert.dim
      ret = def(assert.single(ret), 'full');
      if (ret !== 'full' && ret !== 'core' && ret !== 'array') {
        throw Error(`'full', 'core', or 'array' expected`);
      }
      let z;
      if (dim === -1) {
        z = copyArray(this);
        if (ret !== 'array') toCube(z);
        z = [z];
        toCube(z);
      }
      else {
        const [nr, nc, np] = this._s;
        const _k = this._k;
        const indFactory = d => (_k && _k[d]) ? ky => _k[d].get(ky) : i => i;
        if (dim === 0) {
          z = [1,nc,np].cube();
          const ind_c = indFactory(1),
                ind_p = indFactory(2);
          for (let p of this.pages()) {
            let pi = ind_p(p);
            for (let c of this.cols()) {
              z[ind_c(c) + nc*pi] = this.sc(null, c, p, ret);         
            }
          }
        }
        else if (dim === 1) {
          z = [nr,1,np].cube();
          const ind_r = indFactory(0),
                ind_p = indFactory(2);
          for (let p of this.pages()) {
            let pi = ind_p(p);
            for (let r of this.rows()) {
              z[ind_r(r) + nr*pi] = this.sc(r, null, p, ret);         
            }
          }
        }
        else if (dim === 2) {
          z = [nr,nc,1].cube();
          const ind_r = indFactory(0),
                ind_c = indFactory(1);
          for (let c of this.cols()) {
            let ci = ind_c(c);
            for (let r of this.rows()) {
              z[ind_r(r) + nr*ci] = this.sc(r, c, null, ret);         
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
 
  
  //--------------- convert data ---------------//
  
  //!!NOTE: THIS IS MAY GET REMOVED SINCE IS A SPECIAL CASE OF 'unvble'
  //-> cube, this typically an array/vector; all entries assumed to
  //be an object with the same own properties - properties (enumerable own)
  //of first entry used to extract vals from all and as column keys
  addArrayMethod('toMatrix', function() {
    if (!this._data_cube) toCube(this);
    const nr = this.length;
    if (nr === 0) throw Error('non-empty array/cube expected');
    const ky = Object.keys(this[0]);
    const nc = ky.length;
    const z = [nr,nc].cube();
    z.$key(1,ky);
    for (let r=0; r<nr; r++) {
      let obj = this[r];
      for (let c=0; c<nc; c++) {
        z[r + nr*c] = obj[ky[c]];  
      }
    }
    return z; 
  });
  
  
  //--------------- which ---------------//
  
  //[func] -> array
  addArrayMethod('which', function(f) {
    if (!this._data_cube) toCube(this);             
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
  

}
 




      