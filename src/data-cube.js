 /*
  comments:
    obj: object
    ar: array
    cu: cube
    ac: array or cube 
    *: anything
  Arguments are assumed to be of the correct type unless
  prefixed with '>' (e.g. >str), in which case they are
  implicitly or explicitly converted.
*/

{
  'use strict';

	const helper = require('data-cube-helper');
  
  const {assert, fill, fillEW, kind, expand, addArrayMethod} = helper;
  const isAr = Array.isArray;
  const errorMsg = {
    shapeMismatch: 'shape mismatch',
    dupKey: 'will result in duplicate key',
    acExpected: 'array/cube expected'
  };
  
  
  //--------------- convert array to cube ---------------//

  addArrayMethod('toCube', function() {
    if (!this._d_c_) {
      this._d_c_ = {r: this.length, c: 1, p: 1};
      helper.lengthNonWritable(this);
    }
    return this;
  });
  
    
  //--------------- compare ---------------//
  
  //ac[,str]->cu/false
  addArrayMethod('compare', function(b, behav = 'assert') {
    this.toCube();
    const dc = this._d_c_;
    const anExtra = (dcProp) => { //name of an extra or false if none 
      if (dcProp.e) {
        for (let k of dcProp.e) {
          if (dcProp.e[k]) return k;
        } 
      }
      return false;
    }
    let done;
    if (behav === 'assert') done = msg => { throw new Error(msg) };
    else if (behav === 'test') done = () => false;
    else throw new Error('\'assert\' or \'test\' expected');
    if (!isAr(b)) return done('cube compared to non-array');
    const bdc = b._d_c_;
    const n = this.length;
    if (n !== b.length) return done('number of entries not equal')
    for (let i=0; i<n; i++) {
      if (this[i] !== b[i]) return done(`entries at vector index ${i} not equal`);
    }
    if (bdc) {  //b is a cube
      if (dc.r !== bdc.r || dc.c !== bdc.c || dc.p !== bdc.p) return done(`shape not equal`);
      const thisEx = anExtra(dc);
      const bEx = anExtra(bdc);
      if (!thisEx) {
        if (bEx) return done(`no ${expand[bEx]}, ${expand[bEx]}`);
        else return this;
      }
      else if (!BEx) return done(`${expand[thisEx]}, no ${expand[thisEx]}`);
      else { //both this and b have at least one extra
        ['ra','ca','pa','rl','cl','pl'].forEach(a => {
          if (dc.e[a]) {
            if (!bdc.e[a]) return done(`${expand[a]}, no ${expand[a]}`);
            else if (a[1] === 'a') {
              if (!helper.shallowEqualAr(dc.e[a], bdc.e[a])) return done(`${expand[a]} not equal`);
            }
            else {
              if (dc.e[a] !== bdc.e[a]) return done(`${expand[a]} not equal`);
            }
          }
          else if (bdc.e[a]) return done(`no ${expand[a]}, ${expand[a]}`);
        });
      }
    }
    else {  //b is a standard array  
      if (dc.c !== 1 || dc.p !== 1) return done('shape not equal');
      const thisEx = anExtra(dc);
      if (thisEx) return done(`${expand[thisEx]}, no ${expand[thisEx]}`);
    }
    return this;
  });


  // NEXT: overwrite native array methods where reqd - put at top of file

  //what if error thrown by cube method after converted to cube?? -transactional like L2 
  //EXCEPT FOR THE ARRAY -> CUBE CONVERSION
  
  
  //--------------- create cube ---------------//

  //[*]->cb, new cube from shape array
  addArrayMethod('cube', function(val) {
    assert.shapeArray(this);
    let n, dc;
    switch (this.length) {
      case 1:  dc = {r: +this[0], c: 1,        p: 1};         n = dc.r;                break;
      case 2:  dc = {r: +this[0], c: +this[1], p: 1};         n = dc.r * dc.c;         break;
      case 3:  dc = {r: +this[0], c: +this[1], p: +this[2]};  n = dc.r * dc.c * dc.p;  break;
    }
    const r = new Array(n);
    r._d_c_ = dc;
    helper.lengthNonWritable(r);
    if (val !== undefined) {
      switch (kind(val)) {
        case 0:  fill(r, val);     break;
        case 1:  fill(r, val[0]);  break;
        case 2:  fillEW(r,val);    break;
      }
    }
    return r;
  });
    
  //[>num]->cb, random cube
  addArrayMethod('rand', function(mx) {
    const r = this.cube();
    const n = r.length;
    if (mx !== undefined) {
      const lim = +assert.posInt(mx) + 1;
      for (let i=0; i<n; i++) r[i] = Math.floor(Math.random()*lim);
    }
    else {
      for (let i=0; i<n; i++) r[i] = Math.random();
    }
    return r;
  });

  //[>num,>num]->cb, sample from normal distribution
  addArrayMethod('normal', function(mu = 0, sig = 1) {
    const sampleNormal = () => {
      let u, v, s;
      while (1) {
        u = Math.random() * 2 - 1;
        v = Math.random() * 2 - 1;
        s = u*u + v*v;
        if (s > 0 && s < 1) return u * Math.sqrt((-2 * Math.log(s)) / s);
      }
    };
    const r = this.cube();
    const n = r.length;
    mu = +mu;
    sig = +sig;
    if (sig <= 0) throw new Error('positive number expected (standard deviation)');
    for (let i=0; i<n; i++) r[i] = sampleNormal() * sig + mu;
    return r;
  });
    

}




  /*
  

  
  
  
  
  
  //entrywise functions, all scalar->scalar
  

  DO NOT USE AS FUNCS ANYMORE, LOOP OVER ENTRIES JUST AS DO FOR EG '+'!!!!!!!!!!!!!!!11
  
  -or do not have any (many?) of these and have an .ew method - BUT WE CAN JUST USE MAP:
    x.map(Number.isFinite)
  -just make .ew   a convenient list:
        -avoid writing    x.map(Number.round)     x.ew('round')
        -                 x.map(a => typeof a)    x.ew('type') 
  STILL HAVE MOST IMPORTANT AS CONVENIENCE FUNCS?
  -still need 
  
  for (let nm in {
    sqrt: Math.sqrt,
    abs: Math.abs,
    round: Math.round,
    floor: Math.floor,
    ceil: Math.ceil,
    exp: Math.exp,
    log: Math.log,
    log10: s => Math.log(s)/Math.LN10,
    log2:  s => Math.log(s)/Math.LN2,
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    sinh: Math.sinh,
    cosh: Math.cosh,
    tanh: Math.tanh,
    asinh: Math.asinh,
    acosh: Math.acosh,
    atanh: Math.atanh,
    cbrt: Math.cbrt,
    num: x => +x,
    str: x => '' + x,
    bool: x => !!x,
    date: s => new Date(s),
    isInteger: Number.isInteger,
    isFinite: Number.isFinite,
    isNaN: Number.isNaN,
    type: x => typeof x,
  }) {
    assert.notInProto(nm);
    
    !!!!!!!!!!!HERE 
      -check happy with notInProto assert func
      -want to minimize number of cube methods? - since these
      convert the array->cube  (DOES IT MATTER?????)
        -eg do use as single .ew
            x.type()  versus  x.ew('type')
            x.flip('row').shuffle('col')
            x.get(rpw)
    
  }
  
  //NEED TO REDEFINE NATIVE ARRAY MUTATING FUNCTIONS - OR AT LEAST THEOSE THAT CAN POTENTIIALL Y INVALIDATE THE ARRAY
  // USE ORIGIN FUNC IF NOT A CUBE, ELSE THORW AN ERROR
  

		//s[,s]->s, create regExp
		reg: function(s,flg) {
			if (flg !== undefined) {  //do not allow sticky flag 'y' - cannot access lastindex prop of regex in L2
				if (/[^gim]/.test(flg)) throw new Error('invalid flag'); //only check flags are 'g','i' or 'm' - RegExp constructor will catch too many/repeated flags
				return new RegExp(s,flg); }
			return new RegExp(s) }
	};

	//----- GEN FUNCS CALLED FORM PARSER --------------------------------------------------------------------
	// sig properties:  
	//	    arg (arg stuc): 1-sc 2-ar 3-either
	//	    rtn (returned struc): false-sc true-ar
	//	    min (min no. args)
	L2.ge = {};
	L2.ge.isBasic = function(x) { return !(L2.aTab(x) || L2.aBox(x)) };
	L2.ge.isBasic.sig = {arg:[3], rtn:false, min:1};
	L2.ge.isNil = function(x) { return x === undefined || (L2.aTab(x) && x.v.length === 1 && x.v[0] === undefined) };
	L2.ge.isNil.sig = {arg:[3], rtn:false, min:1};
	L2.ge.isVec = function(x) {
		if (L2.aTab(x) && (x.c !== 1 || x.p !== 1)) return false;
		return true };
	L2.ge.isVec.sig = {arg:[3], rtn:false, min:1};
	L2.ge.isMat = function(x) {
		if (L2.aTab(x) && x.p !== 1) return false;
		return true };
	L2.ge.isMat.sig = {arg:[3], rtn:false, min:1};
	L2.ge.isDict = function(x) {
		if (L2.aTab(x) && x.rk && x.c === 1 && x.p === 1) return true;
		return false };
	L2.ge.isDict.sig = {arg:[3], rtn:false, min:1};
	L2.ge.error = function(msg) { 
		var e = new Error(L2.aTab(msg) ? msg.v[0] : msg)
		e._user_ = true;
		throw e };
	L2.ge.error.sig = {arg:[3], rtn:false, min:0};
	L2.ge.equal = function(x,y) {
		var i, n;
		if (L2.aTab(x)) {
			if (!(L2.aTab(y))) return false;
			if (x.r !== y.r || x.c !== y.c || x.p !== y.p) return false;
			if (x.z || y.z) { //z only indicates may have extras
				if ( !!x.ra !== !!y.ra || (x.ra && !L2.aux.shallowEqualJSA(x.ra,y.ra)) ||
						 !!x.ca !== !!y.ca || (x.ca && !L2.aux.shallowEqualJSA(x.ca,y.ca)) || 
						 !!x.pa !== !!y.pa || (x.pa && !L2.aux.shallowEqualJSA(x.pa,y.pa)) ) return false;
				if (!!x.e !== !!y.e) return false //only have e if something in it - not like z
				if (x.e) {
					if (x.e.t !== y.e.t || x.e.i !== y.e.i || x.e.rl !== y.e.rl || x.e.cl !== y.e.cl || x.e.pl !== y.e.pl ||
						!!x.e.rf !== !!y.e.rf || !!x.e.cf !== !!y.e.cf || !!x.e.pf !== !!y.e.pf || !!x.e.ef !== !!y.e.ef) return false } }
			for (i=0, n=x.v.length; i<n; i++) {
				if (L2.aBox(x.v[i])) {
					if (!(L2.aBox(y.v[i])) || !L2.ge.equal(x.v[i].___L2B,y.v[i].___L2B)) return false }
				else if (x.v[i] !== y.v[i]) return false } } //if y.v[i] a box, will return
		else {
			if (L2.aTab(y)) return false;
			if (L2.aBox(x)) {
				if (!(L2.aBox(y)) || !L2.ge.equal(x.___L2B,y.___L2B)) return false }
			else if (x !== y) return false }
		return true };
	L2.ge.equal.sig = {arg:[3,3], rtn:false, min:2};
	L2.ge.assert = function(x,y) {
		var i, n, d, dims, da;
		dims = ['r','c','p'];
		if (L2.aTab(x)) {
			if (!(L2.aTab(y))) throw new Error('(assert) table and scalar');
			if (x.r !== y.r) throw new Error('(assert) number of rows not equal');
			if (x.c !== y.c) throw new Error('(assert) number of columns not equal');
			if (x.p !== y.p) throw new Error('(assert) number of pages not equal');
			if (x.z || y.z) { //z only indicates may have extras
				for (d=0; d<3; d++) {
					da = dims[d] + 'a';
					if (!!x[da] !== !!y[da]) throw new Error('(assert) only one argument has ' + L2.aux.expandDim[dims[d]] + ' keys');
					if (x[da] && !L2.aux.shallowEqualJSA(x[da],y[da])) throw new Error('(assert) ' +  L2.aux.expandDim[dims[d]] + ' keys not equal') }
				if (!!x.e !== !!y.e) throw new Error('(assert) only one argument has a non-keys extra'); //only have e if something in it, not like z
				if (x.e) {
					if (x.e.t !== y.e.t) throw new Error('(assert) titles not equal');
					if (x.e.i !== y.e.i) throw new Error('(assert) info not equal');
					if (x.e.rl !== y.e.rl) throw new Error('(assert) row labels not equal');
					if (x.e.cl !== y.e.cl) throw new Error('(assert) column labels not equal');
					if (x.e.pl !== y.e.pl) throw new Error('(assert) page labels not equal');
					if (!!x.e.rf !== !!y.e.rf) throw new Error('(assert) only one argument has row key formatting');
					if (!!x.e.cf !== !!y.e.cf) throw new Error('(assert) only one argument has column key formatting');
					if (!!x.e.pf !== !!y.e.pf) throw new Error('(assert) only one argument has page key formatting');
					if (!!x.e.ef !== !!y.e.ef) throw new Error('(assert) only one argument has entry formatting') } }
			for (i=0, n=x.v.length; i<n; i++) {
				if (L2.aBox(x.v[i])) {
					if (!(L2.aBox(y.v[i])) || !L2.ge.equal(x.v[i].___L2B,y.v[i].___L2B)) throw new Error('(assert) entries at index ' + i + ' not equal') }
				else if (x.v[i] !== y.v[i]) throw new Error('(assert) entries at index ' + i + ' not equal') } } //if y.v[i] a box, will return here
		else {
			if (L2.aTab(y)) throw new Error('(assert) scalar and table');
			if (L2.aBox(x)) {
				if (!(L2.aBox(y)) || !L2.ge.equal(x.___L2B,y.___L2B)) throw new Error('(assert) scalars not equal'); }
			else if (x !== y) throw new Error('(assert) scalars not equal') }
		return true };
	L2.ge.assert.sig = {arg:[3,3], rtn:false, min:2};
	L2.ge.cd = function(p) { //overwritten in ide.js so that fileDialogue updated
		L2.assert.node();
		process.chdir(L2.aux.absPath(L2.aTab(p) ? p.v[0] : p));
		return process.cwd() };
	L2.ge.cd.sig = {arg:[3], rtn:false, min:1};
	L2.ge.delete = function(p) {
		L2.assert.node();	
		if (L2.aTab(p)) for (var i=0; i<p.v.length; i++) L2.node_fs.unlinkSync(L2.aux.absPath(p.v[i]));
		else L2.node_fs.unlinkSync(L2.aux.absPath(p));
		return true };
	L2.ge.delete.sig = {arg:[3], rtn:false, min:1};
	L2.ge.cache = function() { return new L2.ArJSA( L2.node_path ? Object.keys(require.cache) : [] )};
	L2.ge.cache.sig = {arg:[], rtn:true, min:0};
	L2.ge.path = function() { 
		if (L2.node_path) {
			var n = process.mainModule.paths.length;
			var v = new Array(n);
			for (var i=0; i<n; i++) v[i] = '' + process.mainModule.paths[i];
			return new L2.ArJSA(v) }
		return new L2.ArJSA([]) };
	L2.ge.path.sig = {arg:[], rtn:true, min:0}; 

	//----- sc OBJECT, stores funcs applied to scalars - assume inputs are scalars -----------------------------
	L2.sc = {};
	//s,s[,s,s,s]->a, unit and utc only used by by date range
  //NEED TO INCLUDE ADDDATE dunc here (approp modified)
  //(LOCALLY OR ADD TO TO HELPERS) since removed from earlier? 
	L2.sc.range = function(s,f,j,unit,utc) {
		var tmp = typeof s;
		var i,n,R,v,s_ms,f_ms;
		if (typeof f !== tmp) throw new Error('first two arguments must be same type');
		if (tmp === 'number')	{
			if (!isFinite(s) || !isFinite(f)) throw new Error('start or end not finite'); 
			if (j === undefined) j = 1;
			else {
				j = +((+j).toFixed(14)); 
				if (j === 0 || !isFinite(j)) throw new Error('invalid step size'); }
			s = +(s.toFixed(14));
			f = +(f.toFixed(14));
			if ((s < f && j < 0) || (s > f && j > 0)) throw new Error('stepping in wrong direction');
			n = Math.floor(Math.abs((f-s)/j).toFixed(14)) + 1;
			R = new L2.Ar(n,undefined,true);
			for (i=0; i<n; i++) R.v[i] = s + i*j; }
		else {
			if (j === undefined) j = 1;
				else {
					j = +j;
					if ( Math.round(j) !== j || j === 0 || !isFinite(j) ) throw new Error('invalid step size'); }
			if (tmp === 'string') {
				s = L2.aux.lettersJSO[s];
				f = L2.aux.lettersJSO[f];
				if (s === undefined || f === undefined) throw new Error('start or end not a letter');
				if ((s < f && j < 0) || (s > f && j > 0)) throw new Error('stepping in wrong direction');
				n = Math.floor(Math.abs((f-s)/j)) + 1;
				R = new L2.Ar(n,undefined,true);
				for (i=0; i<n; i++) R.v[i] = L2.aux.lettersJSA[s + i*j]; }
			else if (s instanceof Date) {
				s_ms = s.getTime();
				f_ms = f.getTime();
				if (!isFinite(s_ms) || !isFinite(f_ms)) throw new Error('start or end invalid'); 
				v = [];
				s = new Date(s);
				if (s_ms < f_ms) {
					if (j < 0) throw new Error('stepping in wrong direction');
					do { v.push(s); s = s.addDate(j,unit,utc) } while (s.getTime() <= f_ms); }
				else if (s_ms > f_ms) {
					if (j > 0) throw new Error('stepping in wrong direction');	
					do { v.push(s); s = s.addDate(j,unit,utc) } while (s.getTime() >= f_ms); }
				else v.push(s);
				R = new L2.ArJSA(v) }
			else throw new Error('first argument must be number, string or date') }
		return R };
	//s,s->a, returns 1-entry dictionary
	L2.sc.pair = function(k,v) {
		if (k === undefined) throw new Error(L2.errorMsg.undefAsKey);
		var R = new L2.ArJSA([v]);
		R.rk = {};
		R.rk[k] = 0;
		R.ra = ['' + k];
		R.z = true;
		return R };
	//->a, returns empty dictionary	
	L2.sc.pairNone = function() {
		var R = new L2.ArJSA([]);
		R.rk = {};
		R.ra = [];
		R.z = true;
		return R };
	// s,s,s,s [,s,s,s,s ...]->a OR a->a, returns dictionary, requires even number of args (not chkd) or array with even number of entries (chkd)
	L2.sc.pairMult = function() {
		var n = arguments.length;
		var args;
		if (n === 1) {
			args = arguments[0].v;
			n = args.length;
			if (n % 2 === 1) throw new Error('odd number of entries'); }
		else args = arguments;
		var tmp, i, m, R;
		var vJSA = new Array(n/2);
		for (i=1, m=0; i<n; i+=2) vJSA[m++] = args[i];
		R = new L2.ArJSA(vJSA);
		R.rk = {};
		R.ra = new Array(n/2);
		for (i=0, m=0; i<n; i+=2) {
			tmp = args[i];
			if (tmp === undefined) throw new Error(L2.errorMsg.undefAsKey);
			if (typeof R.rk[tmp] === 'number') throw new Error(L2.errorMsg.dupKey);
			R.rk[tmp] = m;
			R.ra[m++] = '' + tmp }
		R.z = true;
		return R };
	//s,s[,s]->a, split string into substrings
	L2.sc.split = function(x,sep,lim) {
		var v;
		if (sep === undefined) sep = '';
		if (arguments.length === 3) {
			L2.assert.nonNegInt(lim);
			v = x.split(sep,lim) }
		else v = x.split(sep);
		return new L2.ArJSA(v) };
	//s[,s,s]->a, loads table from csv file, p: file (absolute or relative path), a1 must be 'name' or undefined, a2 must be 'miss' or undefined 
	L2.sc.loadCSV = function(p,a1,a2) {
		var jsa, s, h, miss, r, rTab, rowZero, c, R, i, ir, j, n, v, x, tmp, jsaRow;
		if (arguments.length === 2) {
			if (a1 === 'name') h = true;
			else if (a1 === 'miss') miss = true;
			else throw new Error('argument must be \'name\' or \'miss\'') }
		else if (arguments.length === 3) {
			if (!((a1 === 'name' && a2 === 'miss') || (a1 === 'miss' && a2 === 'name'))) throw new Error('arguments must be \'name\' and \'miss\'');
			h = true;
			miss = true }
		s = L2.sc.read(p);
		if (s.trim() === '') throw new Error('no data in file\n' + p);
		if (miss) s = L2.aux.emptyToNull(s);
		jsa = s.split('\n');
		while (jsa[jsa.length-1].trim().length === 0) jsa.pop(); //remove all empty lines at btm
		try { rowZero = JSON.parse('[' + jsa[0] + ']') }
		catch(e) { throw new Error('invalid data\n' + p + ':1') }
		c = rowZero.length;
		r = jsa.length;
		rTab = h ? r-1 : r;
		n = rTab*c;
		v = new Array(n);
		ir = 0;
		for (i = h ? 1 : 0; i<r; i++,ir++) { //rows: i is index of split jsa, ir is row of table being created
			try { jsaRow = (i === 0 ? rowZero : JSON.parse('[' + jsa[i] + ']')) }
			catch(e) { throw new Error('invalid data\n' + p + ':' + (i+1)) }
			if (jsaRow.length !== c) throw new Error('wrong number of fields\n' + p + ':' + (i+1));
			for (j=0; j<c; j++) {
				x = jsaRow[j];
				tmp = typeof x;
				if (x === null) x = undefined;
				else if (tmp !== 'number' && tmp !== 'boolean' && tmp !== 'string') { //block literal jsa and jso
					throw new Error('invalid type - must be number, string or boolean\n' + p + ':' + (i+1)) }
				v[ir + rTab*j] = x } }
		R = new L2.ArJSA(v);
		R.r = rTab;
		R.c = c;
		if (h) {
			for (i=0; i<c; i++) {
				tmp = typeof rowZero[i];
				if (tmp === 'number' || tmp === 'boolean' || tmp === 'string') continue;
				else throw new Error('invalid key\n' + p + ':1') }
			R['key:']('c', undefined, new L2.ArJSA(rowZero)) }
		return R };
	//s->a, load table, p is the path - no checks, assumes string from file is valid L2 table
	L2.sc.load = function(p) {
		if (p.slice(-4).toUpperCase() !== '.L2T') throw new Error('file extension must be \'.L2T\'');
		return L2.sc.deserial(L2.sc.read(p)) }
	//s->a, convert string to table: assume string corresponds to valid L2 table as returned by
	//  serial - entries are number, boolean, string, null (->undefined) or box; no format funcs
	L2.sc.deserial = function(s) {
		function checkEntries(A) {
			var i, n, tmp;
			for (i=0, n=A.v.length; i<n; i++) {
				tmp = typeof A.v[i];
				if (tmp === 'number' || tmp === 'boolean' || tmp === 'string') continue;
				else if (A.v[i] === null) A.v[i] = undefined;
				else A.v[i] = new L2.Box(new L2.ArDeserial(checkEntries(A.v[i].___L2B))) }
			return A }
		return new L2.ArDeserial(checkEntries(JSON.parse(s))) };
	//s->s, get key of local/session storage using index - use sessionStorage if session truthy
	L2.sc.storageKey = function(session,i) {
		var val = L2.assert.webStorage(session).key(i);
		return val === null ? undefined : val };
	//s,s,s->a, change/add entry to dictionary inside box
	L2.sc._dPush = function(s,k,v) { 
		if (L2.aBox(s)) return s.___L2B._dPush(k,v);
		throw new Error('dictionary expected') };
	//s,s->s, get entry of dictionary inside box
	L2.sc._dEnt = function(s,k) { 
		if (L2.aBox(s)) return s.___L2B._dEnt(k);
		throw new Error('dictionary expected') };
	//s->s, read contents of file to string
	L2.sc.read = function(p) {
		L2.assert.node();
		return L2.node_fs.readFileSync(L2.aux.absPath(p),'utf8') };
	//s,s[,s]->s, write string to file, if passed 3rd arg must be 'append' - appends to file rather then overwrites
	L2.sc.write = function(s,p,ap) {
		L2.assert.node();
		if (arguments.length === 3) {
			if (ap === 'append') L2.node_fs.appendFileSync(L2.aux.absPath(p),s);
			else throw new Error('argument must be \'append\'') }
		else L2.node_fs.writeFileSync(L2.aux.absPath(p),s);
		return true	};
	//s,s->s, read to file in chunks of ~16kB, apply function to each line
	//  adapted from: https://gist.github.com/hippietrail/4461158
	L2.sc.readLine = function(fPath,g) {
		L2.assert.node();
		L2.assert.func(g);
		var blob = '';
		var blobStart = 0;
		var blobEnd = 0;
		var decoder = new L2.node_stringdecode('utf8');
		var CHUNK_SIZE = 16384;  //read in 16KB at a time
		var chunk = new Buffer(CHUNK_SIZE);
		var eolPos = -1;
		var lastChunk = false;
		var moreLines = true;
		var readMore = true;
		var bytesRead, freeable;
		var fileDesc = L2.node_fs.openSync(fPath,'r');  //returns file descriptor - an integer
		while (moreLines) {  //each line
			readMore = true;
			while (readMore) {  //append more chunks from the file onto the end of our blob of text until we have an EOL or EOF
				eolPos = blob.indexOf('\n', blobStart);  	// do we have a whole line? (with LF)
				if (eolPos !== -1) {
					blobEnd = eolPos;
					readMore = false }
				else if (lastChunk) { //do we have the last line? (no LF)
					blobEnd = blob.length;
					readMore = false }
				else {  //read more 
					bytesRead = L2.node_fs.readSync(fileDesc, chunk, 0, CHUNK_SIZE, null);
					lastChunk = bytesRead !== CHUNK_SIZE;
					blob += decoder.write(chunk.slice(0, bytesRead)) } }
			if (blobStart < blob.length) {
				g(blob.substring(blobStart, blobEnd + 1));
				blobStart = blobEnd + 1;
				if (blobStart >= CHUNK_SIZE) {
					freeable = blobStart / CHUNK_SIZE;  //blobStart is in characters, CHUNK_SIZE is in octets
					blob = blob.substring(CHUNK_SIZE);  //keep blob from growing indefinitely, not as deterministic as I'd like
					blobStart -= CHUNK_SIZE;
					blobEnd -= CHUNK_SIZE } } 
			else moreLines = false }
		L2.node_fs.closeSync(fileDesc) }	
	//s,s->s, stream entire file in fPath (gunzips if .gz), pass contents (string scalar) to callback g
	L2.sc.stream = function(fPath, g) {
		L2.assert.node();
		L2.assert.func(g);
		var readStream = L2.node_fs.createReadStream(fPath);
		var concatStream = L2.node_concat( function(data) { g(data.toString()) } );
		fPath.slice(-3) === '.gz' ? readStream.pipe(L2.node_zlib.createGunzip()).pipe(concatStream) : readStream.pipe(concatStream) }
	//s,s,s[,s]->s, stream file in fPath (gunzips if .gz), split on sep (str or regex), apply g to each chunk, call done when finished
	L2.sc.streamChunk = function(fPath, sep, g, done) {
		L2.assert.node();
		L2.assert.func(g);
		var readStream, gunzipStream, splitStream;
		readStream = L2.node_fs.createReadStream(fPath);
		splitStream = L2.node_es.split(sep);
		if (fPath.slice(-3) === '.gz') gunzipStream = L2.node_zlib.createGunzip();
		done === undefined ? (done = function(){}) : L2.assert.func(done);
		if (gunzipStream) readStream.pipe(gunzipStream).pipe(splitStream).pipe(L2.node_es.through(g,done));
		else readStream.pipe(splitStream).pipe(L2.node_es.through(g,done)) };
	//s,s[,s,s]->s, stream entire file in url (gunzips file if .gz), pass contents (string scalar) to callback g, username, password
	L2.sc.http = function(url, g, usr, pswd) {
		L2.assert.node();
		L2.assert.func(g);
		var concatStream = L2.node_concat( function(data){ g(data.toString()) } );
		if (url.slice(-3) === '.gz') L2.node_request.get(url).auth(String(usr),String(pswd),false).pipe(L2.node_zlib.createGunzip()).pipe(concatStream);
		else L2.node_request.get(url).auth(String(usr),String(pswd),false).pipe(concatStream) };
	//s,s,s[,s,s,s]->s, stream file in url (gunzips file if .gz), split on sep (str or regex), apply g to each chunk, call done when finished, username, password
	L2.sc.httpChunk = function(url, sep, g, done, usr, pswd) {
		L2.assert.node();
		L2.assert.func(g);
		done === undefined ? (done = function(){}) : L2.assert.func(done);
		var splitStream = L2.node_es.split(sep);
		if (url.slice(-3) === '.gz') {
			L2.node_request.get(url).auth(String(usr),String(pswd),false).pipe(L2.node_zlib.createGunzip()).pipe(splitStream).pipe(L2.node_es.through(g,done))}
		else L2.node_request.get(url).auth(String(usr),String(pswd),false).pipe(splitStream).pipe(L2.node_es.through(g,done)) };
	//s,s[,s,s]->s, download file (does not gunzip), apply g to contents (scalar string), username, password
	L2.sc.httpBasic = function(url, g, usr, pswd) {
		L2.assert.node();
		L2.assert.func(g);
		L2.node_request
			.get(url, function(error, response, body) {
				if (error) throw error;
				else if (response.statusCode == 200) g(body);
				else throw new Error('status code: ' + response.statusCode + ', message: ' + response.statusMessage) })
			.auth(String(usr), String(pswd), false) };
	//s,s[,s,s,s]->s, download file (does not gunzip), save to destPath, callback when done, username, password
	L2.sc.httpGet = function(url, destPath, done, usr, pswd) {
		L2.assert.node();
		done === undefined ? (done = function(){}) : L2.assert.func(done);
		L2.node_request.get(url).auth(String(usr),String(pswd),false).pipe(L2.node_fs.createWriteStream(destPath)).on('finish',done) }
	//s,s,s[,s]->, gzip/gunzip file - gunzip if gunz truthy, callback when done
	L2.sc.gzip = function(gunz,fPath,destPath,done) {
		L2.assert.node();
		done === undefined ? (done = function(){}) : L2.assert.func(done);
		L2.node_fs.createReadStream(fPath).pipe(L2.node_zlib[gunz ? 'createGunzip' : 'createGzip']())
			.pipe(L2.node_fs.createWriteStream(destPath)).on('finish',done) };	
	//[s]->a, names of contents of directory
	L2.sc.ls = function(p) {
		L2.assert.node();
		p = arguments.length ? L2.aux.absPath(p) : process.cwd();
		return new L2.ArJSA(L2.node_fs.readdirSync(p)) };
	//[s]->a, details of items in directory
	L2.sc.about = function(p) {
		L2.assert.node();
		p = arguments.length ? L2.aux.absPath(p) : process.cwd();
		var det, ex, name_i, i, j;
		var names = L2.node_fs.readdirSync(p);
		var n = names.length;
		var R = new L2.ArSh((new L2.ArJSA([n,6,1])), undefined, true);
		R['key:']('c', undefined, (new L2.ArJSA(['base','ext','byte','item','mod','born']))); 
		R['key:']('r', undefined, (new L2.ArJSA(names)));
		for (i=0; i<n; i++) {
			j = i;
			name_i = p + '/' + names[i];
			ex = L2.node_path.extname(name_i);
			R.v[j] = L2.node_path.basename(name_i, ex);
			R.v[j+=n] = ex;
			try {
				det = L2.node_fs.statSync(name_i);
				R.v[j+=n] = det.size;
				R.v[j+=n] = (det.isFile() ? 'file' : (det.isDirectory() ? 'dir' : 'other'));
				R.v[j+=n] = det.mtime;
				R.v[j+=n] = det.birthtime	}
			catch(e) {}	}
		return R };
	//s->a, if arg is a box, returns contents of table, owise throws error
	L2.sc.unwrap = function(s) { 
		if (L2.aBox(s)) return s.___L2B; 
		throw new Error('box expected') };  
	//->s, single sample from standard normal distbn
	L2.sc.normal = function() {
		var u, v, s;
		while (1) {
			u = Math.random()*2-1;
			v = Math.random()*2-1;
			s = u*u + v*v;
			if (s > 0 && s < 1) return u*Math.sqrt((-2*Math.log(s))/s) } };
	//s[,s]->s, returns L2 func that takes a JS argument. The JS arg is passed through L2.fromJS() unless it is num, str, bool, undef or null (-> undef); if g
	//is passed, it is eval'd to a JS func and passed the JS arg(s), the result is passed through L2.fromJS() (unless it is num, str, bool, undef or null) then to f
	L2.sc.argJS = function(f,g) {
		L2.assert.func(f);
		var ensureL2 = function(x) {
			var t = typeof x;
			if (t === 'number' || t === 'string' || t === 'boolean') return x;
			else if (x === undefined || x === null) return undefined;
			else if (t === 'function' || x instanceof Date || x instanceof RegExp) return '' + x;
			else return L2.fromJS(x) };
		if (arguments.length === 1) return function(x) {return f(ensureL2(x))};
		g = eval('' + g);
		if (typeof g !== 'function') throw new Error('does not evaluate to a JavaScript function');
		return function(...x) {return f(ensureL2(g(...x)))} };

	//----- BOX CLASS ----------------------------------------------------------------------------------------
	// a->s
	L2.Box = function(A) { this.___L2B = A };
	L2.Box.prototype.toString = function() { return 'box' };


	//----- ARRAY CLASS --------------------------------------------------------------------------------------

	///// CONSTRUCTORS /////
	//s[,s,s]->a, construct vector of given length: s: num rows,
	//  x: init val for all ents (not copied if a box), if fast shape not checked
	L2.Ar = function(s,x,fast) {
		if (!fast) {
			s = +s;
			L2.assert.nonNegInt(s) }
		this.v = new Array(s);
		if (x !== undefined) for (var i=0; i<s; i++) this.v[i] = x;
		this.r = s;
		this.c = this.p = 1;
		this.z = false;
		this.___L2T = true };

	//a[,s,s]->a, construct arb shape array: Sh: shape,
	//  x: init val for all ents (not copied if a box), if fast shape not checked
	L2.ArSh = function(Sh,x,fast) {
		var d = Sh.v.length;
		if (!fast) L2.assert.validShAr(Sh);  //empty Sh will produce error here
		this.r = +(Sh.v[0]);
		if (d > 1) {
			this.c = +(Sh.v[1]);
			if (d > 2) this.p = +(Sh.v[2]);	
			else this.p = 1; }
		else this.c = this.p = 1;
		var n = this.r * this.c * this.p;
		this.v = new Array(n);
		if (x !== undefined) for (var i=0; i<n; i++) this.v[i] = x;	
		this.z = false;
		this.___L2T = true };
	L2.ArSh.prototype = L2.Ar.prototype;

	//s,s,s->a, construct array with shape r,c,p, all entries undefined, no checking
	L2.ArFast = function(r,c,p) {
		this.v = new Array(r*c*p);
		this.r = r;
		this.c = c;
		this.p = p;
		this.z = false;
		this.___L2T = true };
	L2.ArFast.prototype = L2.Ar.prototype;

	//jsa->a, construct vector from JS array, no checking, arg is NOT copied - used by ref
	L2.ArJSA = function(va) { 
		this.v = va;
		this.r = va.length;
		this.c = this.p = 1;
		this.z = false;
		this.___L2T = true };
	L2.ArJSA.prototype = L2.Ar.prototype;

	//jsa->a, as L2.ArJSA (no checking, arg used by ref) but also specify shape - all dims reqd
	L2.ArJSA_Sh = function(va,r,c,p) { 
		this.v = va;
		this.r = r;
		this.c = c;
		this.p = p;
		this.z = false;
		this.___L2T = true };
	L2.ArJSA_Sh.prototype = L2.Ar.prototype;

	//a->a, shape array
	L2.ArToSh = function(A) {
		this.v = [A.r, A.c, A.p];
		this.r = 3;
		this.c = this.p = 1; 
		this.z = false;
		this.___L2T = true };
	L2.ArToSh.prototype = L2.Ar.prototype;

	//a[,s]->a, transpose array, extras included, no deep copy
	L2.ArTp = function(A,s) {
		if (s !== undefined) {
			s = s.toLowerCase();
			if (s !== 'rcp' && s !== 'rpc' && s !== 'crp' && s !== 'cpr' && s !== 'prc' && s !== 'pcr') throw new Error('invalid permutation') }
		else s = 'crp';
		var sr=s[0], sc=s[1], sp=s[2];
		this.r = A[sr];	this.c = A[sc];	this.p = A[sp];
		if (A.z) {
			if (A.e) {
				this.e = {};
				if (A.e.t) this.e.t = A.e.t;
				if (A.e.i) this.e.i = A.e.i;
				if (A.e[sr + 'l']) this.e.rl = A.e[sr + 'l'];	
				if (A.e[sc + 'l']) this.e.cl = A.e[sc + 'l'];
				if (A.e[sp + 'l']) this.e.pl = A.e[sp + 'l'];
				if (A.e.ef) this.e.ef = A.e.ef;
				if (A.e[sr + 'f']) this.e.rf = A.e[sr + 'f'];
				if (A.e[sc + 'f']) this.e.cf = A.e[sc + 'f'];
				if (A.e[sp + 'f']) this.e.pf = A.e[sp + 'f'] }
			if (A[sr + 'a']) this._copyKey(A,'r',sr);
			if (A[sc + 'a']) this._copyKey(A,'c',sc);
			if (A[sp + 'a']) this._copyKey(A,'p',sp);
			this.z = true }
		else this.z = false;
		this.v = new Array(A.v.length);
		var mult = {r:1, c:A.r, p:A.r*A.c};
		var mr=mult[sr], mc=mult[sc], mp=mult[sp];
		var m=0;
		for (var k=0; k<A[sp]; k++) {
			for (var j=0; j<A[sc]; j++) { 
				for (var i=0; i<A[sr]; i++) {				
					this.v[m++] = A.v[ i*mr + j*mc + k*mp ] } } }
		this.___L2T = true };
	L2.ArTp.prototype = L2.Ar.prototype;

	//s->a, construct 1-entry array: arg is value
	L2.ArSc = function(s) {
		this.v = [s];
		this.r = this.c = this.p = 1; 
		this.z = false;
		this.___L2T = true };
	L2.ArSc.prototype = L2.Ar.prototype;

	//a[,s,s]->a, copy: truthy 2nd arg - include copies of extras, truthy 3rd arg - deep copy (ie copy boxes recursively)
	L2.ArCopy = function(A,ex,b) {
		if (arguments.length >= 3 && b !== 'deep') throw new Error('argument must be \'deep\'');
		var i;
		this.r = A.r;
		this.c = A.c;
		this.p = A.p;
		if (ex && A.z) { //copy extras
			if (A.e) { this.e =	{}; for (i in A.e) this.e[i] = A.e[i] }
			if (A.rk) this._copyKey(A,'r','r');
			if (A.ck) this._copyKey(A,'c','c');
			if (A.pk) this._copyKey(A,'p','p');
			this.z = true }
		else this.z = false;
		var n = A.v.length;
		this.v = new Array(n);
		if (b) { //deep copy
			for (i=0; i<n; i++) {
				if (L2.aBox(A.v[i])) this.v[i] = new L2.Box( new L2.ArCopy(A.v[i].___L2B, true, 'deep') );
				else this.v[i] = A.v[i] } }
		else for (i=0; i<n; i++) this.v[i] = A.v[i];
		this.___L2T = true };
	L2.ArCopy.prototype = L2.Ar.prototype;

	//a,s->a, copy, but with NO .v property, extras included, omitKeyD ('r', 'c' or 'p' - not chkd) - keys on this dim not included 
	L2.ArShell = function(A,omitKeyD) {
		var i;
		this.r = A.r;
		this.c = A.c;
		this.p = A.p;
		if (A.z) { //copy extras
			if (A.e) { this.e =	{};	for (i in A.e) 	this.e[i] = A.e[i] }
			if (A.rk && omitKeyD !== 'r') this._copyKey(A,'r','r');
			if (A.ck && omitKeyD !== 'c') this._copyKey(A,'c','c');
			if (A.pk && omitKeyD !== 'p') this._copyKey(A,'p','p');
			this.z = true }
		else this.z = false;
		this.___L2T = true };
	L2.ArShell.prototype = L2.Ar.prototype;

	//jso->a, use properties of A (directly - no copying or checking) to create table
	L2.ArDeserial = function(A) {
		this.v = A.v;
		this.r = A.r;
		this.c = A.c;
		this.p = A.p;
		this.z = A.z;
		if (A.z) {
			if (A.rk) { this.rk = A.rk;  this.ra = A.ra }
			if (A.ck) { this.ck = A.ck;  this.ca = A.ca }
			if (A.pk) { this.pk = A.pk;  this.pa = A.pa }
			if (A.e) {
				this.e =	{};
				for (var i in A.e) this.e[i] = A.e[i] } }
		this.___L2T = true };
	L2.ArDeserial.prototype = L2.Ar.prototype;

	////// Ar PROTOTYPE /////
	L2.P = L2.Ar.prototype;

	///// STANDARD ARRAY PROTO FUNCTIONS - have sig object /////
	// sig properties:  
	//	arg (arg struc):
	//    falsy: no upper limit on number of args, lower limit (arg.min) still enforced,
	//           args can be scalars or tables (handle inside function), CANNOT be used with setter
	//    jsa: entries: 1-sc, 2-ar, 3-either  !!starts after dim arg if takes one!!  if 1 or 2, compiler converts if necc
	//	rtn (returned struc): false-sc true-ar
	//	min (min no. args) !!not including dim arg if takes one!!  min must be >= 1 for setter funcs
	//	dim (valid dimension suffixes) 0-none 1-RCP 2-ERCP

	//title
	L2.P['title:'] = function(s) {
		if (s === undefined) { //delete title
			if (this.e) {
				delete this.e.t;
				if (L2.aux.isEmpty(this.e)) delete this.e; } }
		else { 
			s = '' + s;
			if (s === '') throw new Error('empty string not permitted');
			this.e = this.e || {}; 	
			this.e.t = s;
			this.z = true; }
		return this; };
	L2.P['title:'].sig = {arg:[1], rtn:true, min:1, dim:0};
	L2.P.title = function() { if (this.e) return this.e.t };
	L2.P.title.sig = {arg:[], rtn:false, min:0, dim:0};

	//info
	L2.P['info:'] = function(s) {
		if (s === undefined) {
			if (this.e) { //delete info
				delete this.e.i;
				if (L2.aux.isEmpty(this.e)) delete this.e; } }
		else { 
			s = '' + s;
			if (s === '') throw new Error('empty string not permitted');
			this.e = this.e || {}; 	
			this.e.i = s; 
			this.z = true; }
		return this; };
	L2.P['info:'].sig = {arg:[1], rtn:true, min:1, dim:0};
	L2.P.info = function() { if (this.e) return this.e.i };
	L2.P.info.sig = {arg:[], rtn:false, min:0, dim:0};

	//format
	L2.P['fmt:'] = function(d,f) {
		if (f === undefined) { //delete a format function
			if (this.e) { 
				delete this.e[d + 'f'];
				if (L2.aux.isEmpty(this.e)) delete this.e; } }
		else {	//set a format func
			if (typeof f !== 'function') throw new Error('function expected');
			this.e = this.e || {};
			this.e[d + 'f'] = function(x) {return L2.sca(f(x))};
			this.z = true; }
		return this };
	L2.P['fmt:'].sig = {arg:[1], rtn:true, min:1, dim:2};
	L2.P.fmt = function(d) { if (this.e) return this.e[d + 'f'] };
	L2.P.fmt.sig = {arg:[], rtn:false, min:0, dim:2};

	//label
	L2.P['label:'] = function(d,s) {
		if (s === undefined) { //delete a label
			if (this.e) { 
				delete this.e[d + 'l'];
				if (L2.aux.isEmpty(this.e)) delete this.e; } }
		else { //set a label
			s = '' + s;
			if (s === '') throw new Error('empty string not permitted');
			this.e = this.e || {};
			this.e[d + 'l'] = s;
			this.z = true; }
		return this };
	L2.P['label:'].sig = {arg:[1], rtn:true, min:1, dim:1};
	L2.P.label = function(d) { if (this.e) return this.e[d + 'l'] };
	L2.P.label.sig = {arg:[], rtn:false, min:0, dim:1};

	//key
	L2.P['key:'] = function(d,k,m) {
		var kNil = L2.ge.isNil(k);
		var tmp, kJSO, i, n, kLen, daNew;
		var dk = d + 'k';
		var da = d + 'a';
		if (L2.ge.isNil(m)) { //delete all keys on dim
			if (!kNil) throw new Error('invalid combination of arguments');
			delete this[dk];
			delete this[da] }
		else if (kNil) { //set all keys on given dim
			if (L2.aTab(m)) {
				if (m.v.length !== this[d]) throw new Error('number of keys not equal to number of ' + L2.aux.expandDim[d] + 's');
				if (this[d] === 0) {
					this[dk] = {};
					this[da] = [] }
				else {
					kJSO = {};
					for (i=0, n=this[d]; i<n; i++) {
						tmp = m.v[i];
						if (tmp === undefined) throw new Error(L2.errorMsg.undefAsKey);
						if (typeof kJSO[tmp] === 'number') throw new Error(L2.errorMsg.dupKey);
						 kJSO[tmp] = i }
					this[dk] = kJSO;
					 this[da] = L2.aux.shallowCopyJSA_toStr(m.v) } }
			else {  //new key a scalar
				if (this[d] !== 1) throw new Error('number of keys not equal to number of ' + L2.aux.expandDim[d] + 's');
				this[dk] = {};
				this[dk][m] = 0;
				this[da] = ['' + m] }
			this.z = true }
		else {	 //set given keys on given dim
			if (!this[dk]) throw new Error ('table does not have ' + L2.aux.expandDim[d] + ' keys');
			if (!L2.aTab(k) && !L2.aTab(m)) {  //k and m both scalars
				if (m === undefined) throw new Error(L2.errorMsg.undefAsKey);
				m = '' + m;
				tmp = this._getInd(k,d);
				if (this[da][tmp] === m) return this;
				if (typeof this[dk][m] === 'number') throw new Error(L2.errorMsg.dupKey);
				delete this[dk][this[da][tmp]];
				this[dk][m] = tmp;
				this[da][tmp] = m }
			else {  //get k and v as JSAs
				k = L2.aTab(k) ? k.v : [k];
				m = L2.aTab(m) ? m.v : [m];
				kLen = k.length;
				if (kLen !== m.length) throw new Error ('last two arguments do not have same number of entries');
				daNew = L2.aux.shallowCopyJSA(this[da]);
				for (i=0; i<kLen; i++) {
					if (m[i] === undefined) throw new Error(L2.errorMsg.undefAsKey);
					daNew[this._getInd(k[i],d)] = '' + m[i] }
				if (!L2.aux.uniqueJSA_strEq(daNew)) throw new Error(L2.errorMsg.dupKey);
				kJSO = {};  //deleting properties is slow so create new key jso from scratch
				for (i=0; i<this[d]; i++) kJSO[daNew[i]] = i;
				this[dk] = kJSO;
				this[da] = daNew } }
		return this };
	L2.P['key:'].sig = {arg:[3,3], rtn:true, min:1, dim:1};
	L2.P.key = function(d,k) {
		var i, n, v;
		var da = d + 'a';
		if (k) {
			if (!this[da]) throw new Error('table does not have ' + L2.aux.expandDim[d] + ' keys');
			n = k.v.length;
			v = new Array(n);
			for (i=0; i<n; i++) v[i] = this[da][this._getInd(k.v[i],d)];
			return new L2.ArJSA(v) }
		else return new L2.ArJSA( this[da] ? L2.aux.shallowCopyJSA(this[da]) : [undefined] ) };  
	L2.P.key.sig = {arg:[2], rtn:true, min:0, dim:1};
	L2.P.keyAt = function(d,k) { 
		if (!this[d + 'a']) throw new Error('table does not have ' + L2.aux.expandDim[d] + ' keys');
		return this[d + 'a'][this._getInd(k,d)] }
	L2.P.keyAt.sig = {arg:[1], rtn:false, min:1, dim:1};

	//keyInd, keyIndAt
	L2.P.keyInd = function(d,k) {
		var i, n, v;
		var da = d + 'a';
		if (!this[da]) throw new Error('table does not have ' + L2.aux.expandDim[d] + ' keys');
		if (k) {
			n = k.v.length;
			v = new Array(n);
			for (i=0; i<n; i++) v[i] = this._getInd(k.v[i],d);
			return new L2.ArJSA(v) }
		else return this.ind(d) };
	L2.P.keyInd.sig = {arg:[2], rtn:true, min:0, dim:1};
	L2.P.keyIndAt = function(d,k) {
		if (!this[d + 'a']) throw new Error('table does not have ' + L2.aux.expandDim[d] + ' keys');
		return this._getInd(k,d) };
	L2.P.keyIndAt.sig = {arg:[1], rtn:false, min:1, dim:1};

	//ind
	L2.P.ind = function(d,A) {
		var i, n, v, R, epp;  
		if (arguments.length === 2) {
			n = A.v.length; 
			v = new Array(n);
			if (d === 'r')      {     for (i=0; i<n; i++) v[i] = this._getIndLin(+A.v[i]) % this.r  }     
			else if (d === 'c') {     for (i=0; i<n; i++) v[i] = Math.floor(this._getIndLin(+A.v[i]) / this.r) % this.c }
			else { for (epp=this.r*this.c, i=0; i<n; i++) v[i] = Math.floor(this._getIndLin(+A.v[i]) / epp) }
			return new L2.ArJSA(v) }
		else {
			R = new L2.Ar(this[d],undefined,true);
			for (i=0; i<this[d]; i++) R.v[i] = i;
			return R } };
	L2.P.ind.sig = {arg:[2], rtn:true, min:0, dim:1};

	//extra
	L2.P['extra:'] = function(x) {
		if (x !== undefined) throw new Error('must pass undefined as second argument');
		if (this.z) {
			if (this.rk) { delete this.rk;  delete this.ra }
			if (this.ck) { delete this.ck;  delete this.ca }
			if (this.pk) { delete this.pk;  delete this.pa }
			if (this.e) delete this.e;
			this.z = false }
		return this };
	L2.P['extra:'].sig = {arg:[1], rtn:true, min:1, dim:0};
	L2.P.extra = function(x) { throw new Error(L2.errorMsg.setOnly) };
	L2.P.extra.sig = {arg:[1], rtn:true, min:1, dim:0};

	//shape
	L2.P['shape:'] = function(s) {
		var n = this.v.length;
		var r, c, p, sTable, ns;
		if (L2.aTab(s)) { s.v.length === 1 ? s = s.v[0] : sTable = true }
		if (sTable) {
			ns = s.v.length;
			if (ns !== 2 && ns !== 3) throw new Error('shape table must have 1, 2 or 3 entries');
			r = +L2.assert.nonNegInt(s.v[0]);
			c = +L2.assert.nonNegInt(s.v[1]);
			if (ns === 3) p = +L2.assert.nonNegInt(s.v[2]);
			else if (r*c) {
				p = n/(r*c);
				if (Math.round(p) !== p) throw new Error('will result in non-integer number of pages') }
			else p = 1 }
		else {
			if      (s === '|')  { this.r = n;  this.c = 1;  this.p = 1 }
			else if (s === '-')  { this.r = 1;  this.c = n;  this.p = 1 }
			else if (s === '/')  { this.r = 1;  this.c = 1;  this.p = n }  
			else {
				r = +L2.assert.nonNegInt(s);
				if (r) {
					c = n/r;
					if (Math.round(c) !== c) throw new Error('will result in non-integer number of columns') }
				else c = 1;
				p = 1 } }
		if (r !== undefined) {  //not using vec symbol
			if (r*c*p !== n) throw new Error('number of entries cannot change');
			this.r = r;  this.c = c;  this.p = p }
		this['extra:'](undefined);
		return this };
	L2.P['shape:'].sig = {arg:[3], rtn:true, min:1, dim:0};

	//sqz
	L2.P.sqz = function() {
		var R = new L2.ArCopy(this, true);
		var tmp, sing='', nonSing='';
		this.r !== 1 ? nonSing += 'r' : sing += 'r';
		this.c !== 1 ? nonSing += 'c' : sing += 'c'; 
		this.p !== 1 ? nonSing += 'p' : sing += 'p';
		tmp = nonSing + sing;
		return tmp === 'rcp' ? R : new L2.ArTp(R,tmp) };
	L2.P.sqz.sig = {arg:[], rtn:true, min:0, dim:0};

	//flip, shuf, shift, rep, to
	L2.P.flip = function(d) {
		var R = new L2.ArShell(this,d);
		var i,j,k,m=0,epp=R.r*R.c,newDa,n;
		var this_da = this[d + 'a'];
		if (this_da) {
			n = this[d];
			newDa = new Array(n);
			for (i=0; i<n; i++) newDa[i] = this_da[n-i-1];
			R._setKey(d,newDa) }
		R.v = new Array(this.v.length);
		if (d === 'r')      for (k=0; k<R.p; k++)     for (j=0; j<R.c; j++)     for (i=R.r-1; i>=0; i--) 	R.v[m++] = this.v[i + j*R.r + k*epp];
		else if (d === 'c') for (k=0; k<R.p; k++)     for (j=R.c-1; j>=0; j--)  for (i=0; i<R.r; i++) 		R.v[m++] = this.v[i + j*R.r + k*epp]; 
		else                for (k=R.p-1; k>=0; k--)  for (j=0; j<R.c; j++)     for (i=0; i<R.r; i++) 		R.v[m++] = this.v[i + j*R.r + k*epp]; 
		return R };
	L2.P.flip.sig = {arg:[], rtn:true, min:0, dim:1};
	L2.P.shuf = function(d) {
		var R = new L2.ArShell(this,d);
		var i,j,k,m=0,epp=R.r*R.c,newDa,n;
		var this_da = this[d + 'a'];
		var shufJSA = L2.aux.shuffle(R[d]);
		if (this_da) {
			n = this[d];
			newDa = new Array(n);
			for (i=0; i<n; i++) newDa[i] = this_da[shufJSA[i]];
			R._setKey(d,newDa) }
		R.v = new Array(this.v.length);
		if (d === 'r')      for (k=0; k<R.p; k++)   for (j=0; j<R.c; j++)   for (i=0; i<R.r; i++) 	R.v[m++] = this.v[shufJSA[i] + j*R.r + k*epp];
		else if (d === 'c') for (k=0; k<R.p; k++)   for (j=0; j<R.c; j++)   for (i=0; i<R.r; i++) 	R.v[m++] = this.v[i + shufJSA[j]*R.r + k*epp]; 
		else 							for (k=0; k<R.p; k++)   for (j=0; j<R.c; j++)   for (i=0; i<R.r; i++)	R.v[m++] = this.v[i + j*R.r + shufJSA[k]*epp]; 
		return R };
	L2.P.shuf.sig = {arg:[], rtn:true, min:0, dim:1};
	L2.P.shift = function(d,s) {
		if (s === undefined) s = 1;
		else if (Math.round(s) != s || !isFinite(s)) throw new Error ('integer expected');
		s = -(+s);
		var R = new L2.ArShell(this,d);
		var i,j,k,m=0,epp=R.r*R.c,newDa,n;
		var this_da = this[d + 'a'];
		if (this_da) {
			n = this[d];
			newDa = new Array(n);
			for (i=0; i<n; i++) newDa[i] = this_da[L2.aux.mod(i+s,n)];
			R._setKey(d,newDa) }
		R.v = new Array(this.v.length);
		if (d === 'r')      for (k=0; k<R.p; k++)	for (j=0; j<R.c; j++)	for (i=0; i<R.r; i++) 	R.v[m++] = this.v[L2.aux.mod(i+s,R.r) + j*R.r + k*epp];
		else if (d === 'c') for (k=0; k<R.p; k++) 	for (j=0; j<R.c; j++) 	for (i=0; i<R.r; i++) 	R.v[m++] = this.v[i + L2.aux.mod(j+s,R.c)*R.r + k*epp]; 
		else 							for (k=0; k<R.p; k++) 	for (j=0; j<R.c; j++) 	for (i=0; i<R.r; i++) 	R.v[m++] = this.v[i + j*R.r + L2.aux.mod(k+s,R.p)*epp]; 
		return R };
	L2.P.shift.sig = {arg:[1], rtn:true, min:0, dim:1};
	L2.P.rep = function(d,s) {
		if (s === undefined) s = 2;
		else s = +(L2.assert.nonNegInt(s));
		if (this[d + 'k']) throw new Error('cannot repeat along dimension with keys');
		var n = this.v.length * s;
		var R = new L2.ArShell(this);
		R.v = new Array(n);
		var i, j, k, rep, m=0, epp=R.r*R.c;
		if (d === 'r') 			for (k=0; k<R.p; k++)			for (j=0; j<R.c; j++)			for (rep=0; rep<s; rep++)	for (i=0; i<R.r; i++)	R.v[m++] = this.v[i + j*R.r + k*epp];
		else if (d === 'c') for (k=0; k<R.p; k++)			for (rep=0; rep<s; rep++)	for (j=0; j<R.c; j++)			for (i=0; i<R.r; i++)	R.v[m++] = this.v[i + j*R.r + k*epp];
		else								for (rep=0; rep<s; rep++)	for (k=0; k<R.p; k++)			for (j=0; j<R.c; j++)			for (i=0; i<R.r; i++)	R.v[m++] = this.v[i + j*R.r + k*epp];
		R[d] *= s;
		return R };
	L2.P.rep.sig = {arg:[1], rtn:true, min:0, dim:1};
	L2.P.to = function(A) {
		var R;
		if (this.r !== A.r) {
			if (this.r !== 1) throw new Error('will only repeat along singleton dimensions');
			R = this.rep('r',A.r) }
		if (this.c !== A.c) {
			if (this.c !== 1) throw new Error('will only repeat along singleton dimensions');
			R = R ? R.rep('c',A.c) : this.rep('c',A.c) }
		if (this.p !== A.p) {
			if (this.p !== 1) throw new Error('will only repeat along singleton dimensions');
			R = R ? R.rep('p',A.p) : this.rep('p',A.p) }
		if (!R) R = new L2.ArCopy(this,true); 
		return R };
	L2.P.to.sig = {arg:[2], rtn:true, min:1, dim:0};

	//slice
	L2.P['slice:'] = function(d,s,f,A) {
		s = this._getInd(s,d);
		if (f === undefined) f = s-1;  //insert new slice
		else {
			f = this._getInd(f,d);
			if (f < s) throw new Error('end index less than start index'); }
		if ((d === 'r' && (this.c !== A.c || this.p !== A.p)) || (d === 'c' && (this.r !== A.r || this.p !== A.p)) || 
				(d === 'p' && (this.r !== A.r || this.c !== A.c)) ) throw new Error(L2.errorMsg.shapeMismatch);
		var dk = d + 'k';
		var da = d + 'a';
		var tmp, i, j, k, m=0, newV, newN;
		if (s === 0 && f === this[d]-1) { //replace entire array
			if (this[dk]) { 
				if (!A[dk]) throw new Error('second table does not have ' + L2.aux.expandDim[d] + ' keys');
				this._copyKey(A,d,d) }
			this.v = L2.aux.shallowCopyJSA(A.v);
			this[d] = A[d] }
		else {
			var wid = f - s + 1;
			var eppThis = this.r*this.c;
			var eppA = A.r*A.c;
			if (d === 'r') {
				newN = (this.r - wid + A.r)*this.c*this.p;
				newV = new Array(newN);
				for (k=0; k<this.p; k++)	{
					for (j=0; j<this.c; j++) {
						for (i=0; i<s; i++)	 			newV[m++] = this.v[i + j*this.r + k*eppThis];
						for (i=0; i<A.r; i++)	 		newV[m++] = A.v[i + j*A.r + k*eppA];
						for (i=f+1; i<this.r; i++)	newV[m++] = this.v[i + j*this.r + k*eppThis] } } }
			else if (d === 'c') {
				newN = this.r*(this.c - wid + A.c)*this.p;
				newV = new Array(newN);
				for (k=0; k<this.p; k++) {
					for (j=0; j<s; j++) 				for (i=0; i<this.r; i++)	newV[m++] = this.v[i + j*this.r + k*eppThis];
					for (j=0; j<A.c; j++) 				for (i=0; i<this.r; i++)	newV[m++] = A.v[i + j*A.r + k*eppA];
					for (j=f+1; j<this.c; j++) 	for (i=0; i<this.r; i++)	newV[m++] = this.v[i + j*this.r + k*eppThis] } }
			else {
				newN = eppThis*(this.p - wid + A.p);
				newV = new Array(newN);
				j = s*eppThis;			for (i=0; i<j; i++)  							newV[m++] = this.v[i];
				j = A.v.length;			for (i=0; i<j; i++)  							newV[m++] = A.v[i];
				j = this.v.length;	for (i=(f+1)*eppThis; i<j; i++)		newV[m++] = this.v[i] }
			if (this[dk]) {
				if (!A[dk]) throw new Error('second table does not have ' + L2.aux.expandDim[d] + ' keys');
				this._setKey(d,this[da].slice(0,s).concat(A[da], this[da].slice(f+1))) }
			this.v = newV;
			this[d] = this[d] - wid + A[d] }
		return this };
	L2.P['slice:'].sig = {arg:[1,1,2], rtn:true, min:2, dim:1};
	L2.P.slice = function(d,s,f,cut) {
		if (arguments.length === 4 && cut !== 'cut') throw new Error('argument must be \'cut\'');
		var R = new L2.ArShell(this,d);
		var dk = d + 'k';
		var da = d + 'a';
		s = this._getInd(s,d);
		if (f === undefined) { // undefined for empty slice
			R.v = [];
			if (this[dk]) R._setKey(d,[]);
			R[d] = 0;
			return R }
		else f = this._getInd(f,d);
		if (f < s) throw new Error('end index less than start index');
		var ind, newV, epp=R.r*R.c, i, j, k, m=0;
		var wid = f - s + 1;
		if (this[dk]) {
			if (cut) {
				R._setKey(d,this[da].splice(s,wid));
				this._setKey(d,this[da]) }
			else R._setKey(d,this[da].slice(s,f+1)) }
		if (this.v.length === 0) {
			R.v = [];
			if (cut) newV = []; }
		else if (d === 'r') {
			R.v = new Array(wid*R.c*R.p);
			for (k=0; k<R.p; k++)		for (j=0; j<R.c; j++)		for (i=s; i<=f; i++)		R.v[m++] = this.v[i + j*R.r + k*epp];
			if (cut) {
				m=0;
				newV = new Array(this.v.length - R.v.length);
				for (k=0; k<R.p; k++) {
					for (j=0; j<R.c; j++)	{
						for (i=0; i<s; i++)				newV[m++] = this.v[i + j*R.r + k*epp];
						for (i=f+1; i<R.r; i++)		newV[m++] = this.v[i + j*R.r + k*epp] } } } }
		else if (d === 'c') {
			R.v = new Array(R.r*wid*R.p);
			for (k=0; k<R.p; k++)		for (j=s; j<=f; j++)		for (i=0; i<R.r; i++)		R.v[m++] = this.v[i + j*R.r + k*epp];
			if (cut) {
				m=0;
				newV = new Array(this.v.length - R.v.length);
				for (k=0; k<R.p; k++) {
					for (j=0; j<s; j++) 		for (i=0; i<R.r; i++)		newV[m++] = this.v[i + j*R.r + k*epp];
					for (j=f+1; j<R.c; j++) 	for (i=0; i<R.r; i++)		newV[m++] = this.v[i + j*R.r + k*epp]; } } }
		else {
			R.v = new Array(epp*wid);
			j = (f+1)*epp; 	for (i=s*epp; i<j; i++) 	R.v[m++] = this.v[i];
			if (cut) {
				m=0;
				newV = new Array(this.v.length - R.v.length);
				j = s*epp;					for (i=0; i<j; i++) 					newV[m++] = this.v[i];
				j = this.v.length;  for (i=(f+1)*epp; i<j; i++)		newV[m++] = this.v[i]; } }
		R[d] = wid;
		if (cut) {
			this.v = newV;
			this[d] -= wid }
		return R };
	L2.P.slice.sig = {arg:[1,1,1], rtn:true, min:1, dim:1};

	//diagonal
	L2.P['diag:'] = function(x) {
		var i, j, k, nr, np, nMin, epp;
		nr = this.r;
		np = this.p;
		nMin = Math.min(nr,this.c);
		epp = nr*this.c;
		if (L2.aTab(x)) {
			if (x.v.length === 1) x = x.v[0];
			else {
				if (x.v.length !== nMin*np) throw new Error(L2.errorMsg.shapeMismatch)
				k = 0;
				for (j=0; j<np; j++) for (i=0; i<nMin; i++,k++)  this.v[i + i*nr + j*epp] = x.v[k];
				return this } }
		for (j=0; j<np; j++) for (i=0; i<nMin; i++)  this.v[i + i*nr + j*epp] = x;
		return this };
	L2.P['diag:'].sig = {arg:[3], rtn:true, min:1, dim:0};
	L2.P.diag = function() {
		var i, j, k, v, nr, np, nrNew, epp, R;
		nr = this.r;
		np = this.p;
		nrNew = Math.min(nr,this.c);
		epp = nr*this.c;
		v = new Array(nrNew*np);
		k = 0;
		for (j=0; j<np; j++) for (i=0; i<nrNew; i++,k++)  v[k] = this.v[i + i*nr + j*epp];
		R = new L2.ArShell(this,'c');
		R.r = nrNew;
		R.c = 1;
		R.v = v;
		if (R.z) {
			if (R.e) {
				delete R.e.cl;  delete R.e.cf;  delete R.e.t;  delete R.e.i;
				if (L2.aux.isEmpty(R.e)) delete R.e }
			if (R.rk && nrNew < nr) R._setKey('r',R.ra.slice(0,nrNew)) }
		return R };
	L2.P.diag.sig = {arg:[], rtn:true, min:0, dim:0};

	//sample
	L2.P.sample = function(d,nS) {
		var i, ind;
		var nS = +nS;
		if (Math.round(nS) !== nS || nS < 1) throw new Error('invalid sample size');
		if (this.v.length === 0) throw new Error('cannot sample from empty table');
		if (this[d + 'k']) throw new Error('dimension has keys - risk of duplicate key in sample');
		ind = new L2.Ar(nS,undefined,true);
		for (i=0; i<nS; i++) ind.v[i] = Math.floor(Math.random()*this[d]);
		return this._oneDimAr(d,ind);	};
	L2.P.sample.sig = {arg:[1], rtn:true, min:1, dim:1};

	//cat
	L2.P.cat = function(nS,k) {
		if (this.c !== 1 || this.p !== 1) throw new Error('vector expected');
		if (this.r === 0 ) throw new Error('probability table cannot be empty');
		var nS = +nS;
		if (Math.round(nS) !== nS || nS < 1) throw new Error('invalid sample size');
		var pJSA = new Array(this.r);
		var i, j, tmp, old=0;
		for (i=0; i<this.r; i++) {
			tmp = +(this.v[i]);
			if (tmp < 0 || !isFinite(tmp)) throw new Error('probabilities must be non-negative and finite');
			pJSA[i] = (old += tmp) }
		if (old === 0) throw new Error('one or more probabilities must be non-zero');
		for (i=0; i<this.r; i++) pJSA[i] /= old;
		var	R = new L2.Ar(nS,undefined,true);
		for (i=0; i<nS; i++) {
			tmp = Math.random();
			for (j=0; j<this.r; j++) {
				if (tmp <= pJSA[j]) {
					R.v[i] = j;
					break } } }
		if (arguments.length === 2) {
			if (k !== 'key') throw new Error('argument must be \'key\'');			
			if (!this.rk) throw new Error('probability table does not have row keys');
			for (i=0; i<nS; i++) R.v[i] = this.ra[R.v[i]] }
		return R };
	L2.P.cat.sig = {arg:[1,1], rtn:true, min:1, dim:0};

	//reduction functions
	L2.P.sum = function(d) {
		var R, i, j, k, m, q, w, tmp, epp;
		var tmpInit = 0;
		if (d === 'e') {
			m = this.v.length;
			tmp = tmpInit;
			for (i=0; i<m; i++) tmp += this.v[i];
			return new L2.ArJSA([tmp]) }
		R = (new L2.ArShell(this,d))._remRedExtras(d);  
		m = 0;
		epp = R.r*R.c;
		if (d === 'r') {
			i = j = 0;
			k = R.c*R.p;
			R.v = new Array(k);
			while (m<k) {
				for (tmp=tmpInit, j+=R.r; i<j; i++) tmp += this.v[i];
				R.v[m++] = tmp } }
		else if (d === 'c') {
			R.v = new Array(R.r*R.p);
			for (k=0; k<R.p; k++) {
				q = k * epp;
				w = q + epp;
				for (i=0; i<R.r; i++) {
					for (tmp=tmpInit, j=q+i; j<w; j+=R.r) tmp += this.v[j];
					R.v[m++] = tmp } } }
		else {
			R.v = new Array(epp);
			j = this.v.length; 
			for (i=0; i<epp; i++) {
				for (tmp=tmpInit, k=i; k<j; k+=epp) tmp += this.v[k];
				R.v[i] = tmp } }
		R[d] = 1;
		return R };
	L2.P.sum.sig = {arg:[], rtn:true, min:0, dim:2};
	L2.P.join = function(d,s) {
		s = s === undefined ? ',' : ('' + s);
		var R, i, j, k, m, q, w, tmp, epp;
		var tmpInit = '';
		if (d === 'e') {
			m = this.v.length;
			tmp = tmpInit;
			if (m > 0) {
				if (s) {
					for (i=0; i<(m-1); i++) tmp += this.v[i] + s;
					tmp += this.v[i] }
				else for (i=0; i<m; i++) tmp += this.v[i]; }
			return new L2.ArJSA([tmp]) }
		R = (new L2.ArShell(this,d))._remRedExtras(d);  
		m = 0;
		epp = R.r*R.c;
		if (d === 'r') {  
			j = 0;
			k = R.c*R.p;
			R.v = new Array(k);
			if (R.r) {
				while (m<k) {
					if (s) {		
						for (tmp=tmpInit, i=0; i<(R.r-1); i++) tmp += this.v[j++] + s;
						tmp += this.v[j++] }
					else for (tmp=tmpInit, i=0; i<R.r; i++) tmp += this.v[j++];
					R.v[m++] = tmp } }
			else for (i=0; i<k; i++) R.v[i] = '' }
		else if (d === 'c') {
			R.v = new Array(R.r*R.p);
			if (R.c) {
				for (k=0; k<R.p; k++) {
					q = k * epp;
					w = q + epp;
					for (i=0; i<R.r; i++) {
						if (s) {
							for (tmp=tmpInit, j=q+i; j<(w-R.r); j+=R.r) tmp += this.v[j] + s;
							tmp += this.v[j] }
						else for (tmp=tmpInit, j=q+i; j<w; j+=R.r) tmp += this.v[j];
						R.v[m++] = tmp } } }
			else for (j=R.r*R.p, i=0; i<j; i++) R.v[i] = '' }
		else {
			R.v = new Array(epp);
			j = this.v.length;
			if (R.p) {
				for (i=0; i<epp; i++) {
					if (s) {
						for (tmp=tmpInit, k=i; k<(j-epp); k+=epp) tmp += this.v[k] + s;
						tmp += this.v[k] }
					else for (tmp=tmpInit, k=i; k<j; k+=epp) tmp += this.v[k];
					R.v[m++] = tmp } }
			else for (i=0; i<epp; i++) R.v[i] = '' }
		R[d] = 1;
		return R };
	L2.P.join.sig = {arg:[1], rtn:true, min:0, dim:2};
	L2.P.prod = function(d) {
		var R, i, j, k, m, q, w, tmp, epp;
		var tmpInit = 1;
		if (d === 'e') {
			m = this.v.length;
			tmp = tmpInit;
			for (i=0; i<m; i++) tmp *= this.v[i];
			return new L2.ArJSA([tmp]) }    
		R = (new L2.ArShell(this,d))._remRedExtras(d);  
		m = 0;
		epp = R.r*R.c;
		if (d === 'r') {
			i = j = 0;
			k = R.c*R.p;
			R.v = new Array(k);
			while (m<k) {
				for (tmp=tmpInit, j+=R.r; i<j; i++) tmp *= this.v[i];
				R.v[m++] = tmp } }
		else if (d === 'c') {
			R.v = new Array(R.r*R.p);
			for (k=0; k<R.p; k++) {
				q = k * epp;
				w = q + epp;
				for (i=0; i<R.r; i++) {
					for (tmp=tmpInit, j=q+i; j<w; j+=R.r) tmp *= this.v[j];
					R.v[m++] = tmp } } }
		else {
			R.v = new Array(epp);
			j = this.v.length; 
			for (i=0; i<epp; i++) {
				for (tmp=tmpInit, k=i; k<j; k+=epp) tmp *= this.v[k];
				R.v[i] = tmp } }
		R[d] = 1;
		return R };
	L2.P.prod.sig = {arg:[], rtn:true, min:0, dim:2};
	L2.P.min = function(d,ky) {
		if (arguments.length === 2 && ky !== 'index' && ky !== 'key') throw new Error('argument must be \'index\' or \'key\'');
		var R, i, j, k, m, q, w, kys, mInd, ct, tmp, epp;
		var tmpInit = Infinity;
		if (d === 'e') {
			if (ky === 'key') throw new Error(L2.errorMsg.noKeyWithE);
			m = this.v.length;
			tmp = tmpInit;
			if (ky) {
				mInd = 0;
				for (i=0; i<m; i++) if (this.v[i] < tmp) {tmp = this.v[i]; mInd = i}
				return new L2.ArJSA([mInd]) }
			else {
				for (i=0; i<m; i++) tmp = Math.min(tmp, this.v[i]);
				return new L2.ArJSA([tmp]) } }
		R = new L2.ArShell(this,d);
		if (ky === 'key') {
			if (this[d + 'k']) kys = this.key(d).v;
			else throw new Error('table does not have ' + L2.aux.expandDim[d] + ' keys') }
		R._remRedExtras(d);
		m = 0;
		epp = R.r*R.c;
		if (d === 'r') {
			i = j = 0;
			k = R.c*R.p;
			R.v = new Array(k);
			if (ky) {
				while (m<k) {
					if (R.r) {
						for (tmp=tmpInit, mInd=0, j+=R.r; i<j; i++) if (this.v[i] < tmp) {tmp = this.v[i]; mInd = i}
						R.v[m++] = ky === 'key' ? kys[mInd%R.r] : mInd%R.r } 
					else R.v[m++] = ky === 'key' ? 'n/a' : NaN } }
			else {
				while (m<k) {
					for (tmp=tmpInit, j+=R.r; i<j; i++) tmp = Math.min(tmp, this.v[i]);
					R.v[m++] = tmp } } }
		else if (d === 'c') {
			R.v = new Array(R.r*R.p);
			if (ky) {
				for (k=0; k<R.p; k++) {
					q = k * epp;
					w = q + epp;
					for (i=0; i<R.r; i++) {
						if (R.c) {
							for (tmp=tmpInit, mInd=0, ct=0, j=q+i; j<w; j+=R.r, ct++) if (this.v[j] < tmp) {tmp = this.v[j]; mInd = ct}
							R.v[m++] = ky === 'key' ? kys[mInd] : mInd }
						else R.v[m++] = ky === 'key' ? 'n/a' : NaN } } }
			else {
				for (k=0; k<R.p; k++) {
					q = k * epp;
					w = q + epp;
					for (i=0; i<R.r; i++) {
						for (tmp=tmpInit, j=q+i; j<w; j+=R.r) tmp = Math.min(tmp, this.v[j]);
						R.v[m++] = tmp } } } }
		else {
			R.v = new Array(epp);
			j = this.v.length;
			if (ky) {
				for (i=0; i<epp; i++) {
					if (R.p) {
						for (tmp=tmpInit, mInd=0, ct=0, k=i; k<j; k+=epp, ct++) if (this.v[k] < tmp) {tmp = this.v[k]; mInd = ct}
						R.v[i] = ky === 'key' ? kys[mInd] : mInd }
					else R.v[i] = ky === 'key' ? 'n/a' : NaN } }
			else {
				for (i=0; i<epp; i++) {
					for (tmp=tmpInit, k=i; k<j; k+=epp) tmp = Math.min(tmp, this.v[k]);
					R.v[i] = tmp } } }
		R[d] = 1;
		return R };
	L2.P.min.sig = {arg:[1], rtn:true, min:0, dim:2};
	L2.P.max = function(d,ky) {
		if (arguments.length === 2 && ky !== 'index' && ky !== 'key') throw new Error('argument must be \'index\' or \'key\'');
		var R, i, j, k, m, q, w, kys, mInd, ct, tmp, epp;
		var tmpInit = -Infinity;
		if (d === 'e') {
			if (ky === 'key') throw new Error(L2.errorMsg.noKeyWithE);
			m = this.v.length;
			tmp = tmpInit;
			if (ky) {
				mInd = 0;
				for (i=0; i<m; i++) if (this.v[i] > tmp) {tmp = this.v[i]; mInd = i}
				return new L2.ArJSA([mInd]) }
			else { 
				for (i=0; i<m; i++) tmp = Math.max(tmp, this.v[i]);
				return new L2.ArJSA([tmp]) } }
		R = new L2.ArShell(this,d);
		if (ky === 'key') {
			if (this[d + 'k']) kys = this.key(d).v;
			else throw new Error('table does not have ' + L2.aux.expandDim[d] + ' keys') }  
		R._remRedExtras(d);
		m = 0;
		epp = R.r*R.c;
		if (d === 'r') {  
			i = j = 0;
			k = R.c*R.p;
			R.v = new Array(k);
			if (ky) {
				while (m<k) {
					if (R.r) {
						for (tmp=tmpInit, mInd=0, j+=R.r; i<j; i++) if (this.v[i] > tmp) {tmp = this.v[i]; mInd = i}
						R.v[m++] = ky === 'key' ? kys[mInd%R.r] : mInd%R.r } 
					else R.v[m++] = ky === 'key' ? 'n/a' : NaN } }
			else {
				while (m<k) {
					for (tmp=tmpInit, j+=R.r; i<j; i++) tmp = Math.max(tmp, this.v[i]);
					R.v[m++] = tmp } } }
		else if (d === 'c') {
			R.v = new Array(R.r*R.p);
			if (ky) {
				for (k=0; k<R.p; k++) {
					q = k * epp;
					w = q + epp;
					for (i=0; i<R.r; i++) {
						if (R.c) {
							for (tmp=tmpInit, mInd=0, ct=0, j=q+i; j<w; j+=R.r, ct++) if (this.v[j] > tmp) {tmp = this.v[j]; mInd = ct}
						R.v[m++] = ky === 'key' ? kys[mInd] : mInd }
						else R.v[m++] = ky === 'key' ? 'n/a' : NaN } } }
			else {
				for (k=0; k<R.p; k++) {
					q = k * epp;
					w = q + epp;
					for (i=0; i<R.r; i++) {
						for (tmp=tmpInit, j=q+i; j<w; j+=R.r) tmp = Math.max(tmp, this.v[j]);
						R.v[m++] = tmp } } } }
		else {
			R.v = new Array(epp);
			j = this.v.length;
			if (ky) {
				for (i=0; i<epp; i++) {
					if (R.p) {
						for (tmp=tmpInit, mInd=0, ct=0, k=i; k<j; k+=epp, ct++) if (this.v[k] > tmp) {tmp = this.v[k]; mInd = ct}
						R.v[i] = ky === 'key' ? kys[mInd] : mInd }
					else R.v[i] = ky === 'key' ? 'n/a' : NaN } }
			else {
				for (i=0; i<epp; i++) {
					for (tmp=tmpInit, k=i; k<j; k+=epp) tmp = Math.max(tmp, this.v[k]);
					R.v[i] = tmp } } }
		R[d] = 1;
		return R };
	L2.P.max.sig = {arg:[1], rtn:true, min:0, dim:2};
	L2.P.mean = function(d) {
		var R, i, j, k, m, q, w, tmp, epp;
		var tmpInit = 0;
		if (d === 'e') {
			m = this.v.length;
			tmp = tmpInit;
			for (i=0; i<m; i++) tmp += this.v[i];
			return new L2.ArJSA([tmp/m]) }
		R = (new L2.ArShell(this,d))._remRedExtras(d);
		m = 0;
		epp = R.r*R.c;
		if (d === 'r') {  
			i = j = 0;
			k = R.c*R.p;
			R.v = new Array(k);
			while (m<k) {
				for (tmp=tmpInit, j+=R.r; i<j; i++) tmp += this.v[i];
				R.v[m++] = tmp/R.r } }
		else if (d === 'c') {
			R.v = new Array(R.r*R.p);
			for (k=0; k<R.p; k++) {
				q = k * epp;
				w = q + epp;
				for (i=0; i<R.r; i++) {
					for (tmp=tmpInit, j=q+i; j<w; j+=R.r) tmp += this.v[j];
					R.v[m++] = tmp/R.c } } }
		else {
			R.v = new Array(epp);
			j = this.v.length; 
			for (i=0; i<epp; i++) {
				for (tmp=tmpInit, k=i; k<j; k+=epp) tmp += this.v[k];
				R.v[i] = tmp/R.p } }
		R[d] = 1;
		return R };
	L2.P.mean.sig = {arg:[], rtn:true, min:0, dim:2};
	L2.P.range = function(d) { 
		var mx = this.max(d);
		var mn = this.min(d);
		for (var i=0, n=mx.v.length; i<n; i++) mx.v[i] -= mn.v[i];
		return mx	};
	L2.P.range.sig = {arg:[], rtn:true, min:0, dim:2};    
	L2.P.geoMean = function(d) {
		var R, i, j, k, m, q, w, tmp, epp;
		var tmpInit = 1;
		if (d === 'e') {
			m = this.v.length;
			tmp = tmpInit;
			for (i=0; i<m; i++) tmp *= this.v[i];
			return new L2.ArJSA([ Math.pow(tmp,1/m) ]) }
		R = (new L2.ArShell(this,d))._remRedExtras(d);  
		m = 0;
		epp = R.r*R.c;
		if (d === 'r') {  
			i = j = 0;
			k = R.c*R.p;
			R.v = new Array(k);
			while (m<k) {
				for (tmp=tmpInit, j+=R.r; i<j; i++) tmp *= this.v[i];
				R.v[m++] = Math.pow(tmp,1/R.r) } }
		else if (d === 'c') {
			R.v = new Array(R.r*R.p);
			for (k=0; k<R.p; k++) {
				q = k * epp;
				w = q + epp;
				for (i=0; i<R.r; i++) {
					for (tmp=tmpInit, j=q+i; j<w; j+=R.r) tmp *= this.v[j];
					R.v[m++] = Math.pow(tmp,1/R.c) } } }
		else {
			R.v = new Array(epp);
			j = this.v.length; 
			for (i=0; i<epp; i++) {
				for (tmp=tmpInit, k=i; k<j; k+=epp) tmp *= this.v[k];
				R.v[i] = Math.pow(tmp,1/R.p) } }
		R[d] = 1;
		return R };
	L2.P.geoMean.sig = {arg:[], rtn:true, min:0, dim:2};
	L2.P.truthy = function(d) {
		var R, i, j, k, m, q, w, tmp, epp;
		var tmpInit = 0;
		if (d === 'e') {
			m = this.v.length;
			tmp = tmpInit;
			for (i=0; i<m; i++) if (this.v[i]) tmp++;
			return new L2.ArJSA([tmp]) }
		R = (new L2.ArShell(this,d))._remRedExtras(d);
		m = 0;
		epp = R.r*R.c;
		if (d === 'r') {
			i = j = 0;
			k = R.c*R.p;
			R.v = new Array(k);
			while (m<k) {
				for (tmp=tmpInit, j+=R.r; i<j; i++) if(this.v[i]) tmp++;
				R.v[m++] = tmp } }
		else if (d === 'c') {
			R.v = new Array(R.r*R.p);
			for (k=0; k<R.p; k++) {
				q = k * epp;
				w = q + epp;
				for (i=0; i<R.r; i++) {
					for (tmp=tmpInit, j=q+i; j<w; j+=R.r) if(this.v[j]) tmp++;
					R.v[m++] = tmp } } }
		else {
			R.v = new Array(epp);
			j = this.v.length; 
			for (i=0; i<epp; i++) {
				for (tmp=tmpInit, k=i; k<j; k+=epp) if (this.v[k]) tmp++;
				R.v[i] = tmp } }
		R[d] = 1;
		return R };
	L2.P.truthy.sig = {arg:[], rtn:true, min:0, dim:2};
	L2.P.any = function(d) {
		var R, i, j, k, m, q, w, tmp, epp;
		var tmpInit = false;
		if (d === 'e') {
			m = this.v.length;
			for (i=0; i<m; i++) if (this.v[i]) return new L2.ArJSA([true]);
			return new L2.ArJSA([tmpInit]) }
		R = (new L2.ArShell(this,d))._remRedExtras(d);
		m = 0;
		epp = R.r*R.c;
		if (d === 'r') {
			j = 0;
			k = R.c*R.p;
			R.v = new Array(k);
			while (m<k) {
				for (tmp=tmpInit, i=j, j+=R.r; i<j; i++) if (this.v[i]) { tmp = true; break }
				R.v[m++] = tmp } }
		else if (d === 'c') {
			R.v = new Array(R.r*R.p);
			for (k=0; k<R.p; k++) {
				q = k * epp;
				w = q + epp;
				for (i=0; i<R.r; i++) {
					for (tmp=tmpInit, j=q+i; j<w; j+=R.r) if (this.v[j]) { tmp = true; break }
					R.v[m++] = tmp } } }
		else {
			R.v = new Array(epp);
			j = this.v.length; 
			for (i=0; i<epp; i++) {
				for (tmp=tmpInit, k=i; k<j; k+=epp) if (this.v[k]) { tmp = true; break }
				R.v[i] = tmp } }
		R[d] = 1;
		return R };
	L2.P.any.sig = {arg:[], rtn:true, min:0, dim:2};
	L2.P.all = function(d) {
		var R, i, j, k, m, q, w, tmp, epp;
		var tmpInit = true;
		if (d === 'e') {
			m = this.v.length;
			for (i=0; i<m; i++) if (!this.v[i]) return new L2.ArJSA([false]);
			return new L2.ArJSA([tmpInit]) }
		R = (new L2.ArShell(this,d))._remRedExtras(d);
		m = 0;
		epp = R.r*R.c;
		if (d === 'r') {
			j = 0;
			k = R.c*R.p;
			R.v = new Array(k);
			while (m<k) {
				for (tmp=tmpInit, i=j, j+=R.r; i<j; i++) if (!this.v[i]) { tmp = false; break }
				R.v[m++] = tmp } }
		else if (d === 'c') {
			R.v = new Array(R.r*R.p);
			for (k=0; k<R.p; k++) {
				q = k * epp;
				w = q + epp;
				for (i=0; i<R.r; i++) {
					for (tmp=tmpInit, j=q+i; j<w; j+=R.r) if (!this.v[j]) { tmp = false; break }
					R.v[m++] = tmp } } }
		else {
			R.v = new Array(epp);
			j = this.v.length; 
			for (i=0; i<epp; i++) {
				for (tmp=tmpInit, k=i; k<j; k+=epp) if (!this.v[k]) { tmp = false; break }
				R.v[i] = tmp } }
		R[d] = 1;
		return R };
	L2.P.all.sig = {arg:[], rtn:true, min:0, dim:2};
	L2.P.first = function(d,ky) {
		if (arguments.length === 2 && ky !== 'key') throw new Error('argument must be \'key\'');	
		var R, i, j, k, m, q, w, ct, kys, tmp, epp;
		var tmpInit = Infinity;
		if (d === 'e') {	
			if (ky) throw new Error(L2.errorMsg.noKeyWithE);
			m = this.v.length;
			for (i=0; i<m; i++) if (this.v[i]) return new L2.ArJSA([i]);
			return new L2.ArJSA([tmpInit]) }
		R = new L2.ArShell(this,d);
		if (ky) {
			if (this[d + 'k']) kys = this.key(d).v;
			else throw new Error('table does not have ' + L2.aux.expandDim[d] + ' keys') }
		R._remRedExtras(d);
		m = 0;
		epp = R.r*R.c;
		if (d === 'r') {  
			k = R.c*R.p;
			R.v = new Array(k);
			j = 0;
			while (m<k) {
				for (tmp=tmpInit, i=j, j+=R.r; i<j; i++)  if (this.v[i]) { tmp = i; break }
				if (tmp === tmpInit) R.v[m++] = ky ? 'n/a' : tmpInit;
				else  R.v[m++] = ky ? kys[tmp%R.r] : tmp%R.r } }
		else if (d === 'c') {
			R.v = new Array(R.r*R.p);
			for (k=0; k<R.p; k++) {
				q = k * epp;
				w = q + epp;
				for (i=0; i<R.r; i++) {
					for (tmp=tmpInit, ct=0, j=q+i; j<w; j+=R.r, ct++) if (this.v[j]) { tmp = ct; break }
					if (tmp === tmpInit) R.v[m++] = ky ? 'n/a' : tmpInit;
					else  R.v[m++] = ky ? kys[tmp] : tmp } } }
		else {
			R.v = new Array(epp);
			j = this.v.length; 
			for (i=0; i<epp; i++) {
				for (tmp=tmpInit, ct=0, k=i; k<j; k+=epp, ct++) if (this.v[k]) { tmp = ct; break }
				if (tmp === tmpInit) R.v[i] = ky ? 'n/a' : tmpInit;
				else  R.v[i] = ky ? kys[tmp] : tmp } }
		R[d] = 1;
		return R };
	L2.P.first.sig = {arg:[1], rtn:true, min:0, dim:2};
	L2.P.last = function(d,ky) {
		if (arguments.length === 2 && ky !== 'key') throw new Error('argument must be \'key\'');
		var R, i, j, k, m, q, w, ct, kys, tmp, epp;
		var tmpInit = -Infinity;
		if (d === 'e') {	
			if (ky) throw new Error(L2.errorMsg.noKeyWithE);	
			for (i=this.v.length-1; i>=0; i--) if (this.v[i]) return new L2.ArJSA([i]);
			return new L2.ArJSA([tmpInit]) }
		R = new L2.ArShell(this,d);
		if (ky) {
			if (this[d + 'k']) kys = this.key(d).v;
			else throw new Error('table does not have ' + L2.aux.expandDim[d] + ' keys') }
		R._remRedExtras(d);
		epp = R.r*R.c;
		if (d === 'r') {
			k = R.c*R.p;
			R.v = new Array(k);
			j = this.v.length-1;
			m = k-1;
			while (m>=0) {
				for (tmp=tmpInit, i=j, j-=R.r; i>j; i--)  if (this.v[i]) { tmp = i; break }
				if (tmp === tmpInit) R.v[m--] = ky ? 'n/a' : tmpInit;
				else  R.v[m--] = ky ? kys[tmp%R.r] : tmp%R.r } }
		else if (d === 'c') {
			R.v = new Array(R.r*R.p);
			m = 0;
			for (k=0; k<R.p; k++) {
				q = k * epp;
				w = (R.c-1)*R.r;
				for (i=0; i<R.r; i++) {
					for (tmp=tmpInit, ct=R.c-1, j=q+i+w; j>=q; j-=R.r, ct--) if (this.v[j]) { tmp = ct; break }
					if (tmp === tmpInit) R.v[m++] = ky ? 'n/a' : tmpInit;
					else  R.v[m++] = ky ? kys[tmp] : tmp } } }
		else {
			R.v = new Array(epp);
			j = this.v.length; 
			for (i=0; i<epp; i++) {
				for (tmp=tmpInit, ct=R.p-1, k=i+(R.p-1)*epp; k>=0; k-=epp, ct--) if (this.v[k]) { tmp = ct; break }
				if (tmp === tmpInit) R.v[i] = ky ? 'n/a' : tmpInit;
				else  R.v[i] = ky ? kys[tmp] : tmp } }
		R[d] = 1;
		return R };
	L2.P.last.sig = {arg:[1], rtn:true, min:0, dim:2};  
	L2.P.wrap = function(d) { return this._wrapReduce(d) };
	L2.P.wrap.sig = {arg:[], rtn:true, min:0, dim:2};
	L2.P.reduce = function(d,f) {
		if (typeof f !== 'function') throw new Error('function expected');
		return this._wrapReduce(d,f) };
	L2.P.reduce.sig = {arg:[1], rtn:true, min:1, dim:2};
	L2.P.var = function(d,normBy) {
		if (arguments.length === 2 && normBy !== 'n') throw new Error('argument must be \'n\'');
		var R, i, j, k;
		function vecVar(u) {  //u a JSA, returns scalar
			var a, obs, delta1, delta2;
			var mean = 0;
			var res = 0;
			var n = u.length;
			if (n < 2) return NaN;
			for (a=0; a<n;) {
				obs = u[a];
				delta1 = obs - mean;
				mean += delta1/(++a);
				delta2 = obs - mean;
				res += delta1 * delta2 }
			return res / (normBy ? n : n-1) }
		if (d === 'e') 	return new L2.ArJSA([vecVar(this.v)]);
		R = (new L2.ArShell(this,d))._remRedExtras(d);
		if (d === 'r') {
			if (this.c === 1 && this.p === 1) R.v = [vecVar(this.v)]; 
			else {
				R.v = new Array(this.c*this.p);
				for (k=0, j=0; j<this.p; j++) for (i=0; i<this.c; i++)  R.v[k++] = vecVar(this._twoDim('c','p',new L2.ArJSA([i]),new L2.ArJSA([j])).v) } }
		else if (d === 'c') {
			R.v = new Array(this.r*this.p);
			for (k=0, j=0; j<this.p; j++)  for (i=0; i<this.r; i++)   R.v[k++] = vecVar(this._twoDim('r','p',new L2.ArJSA([i]),new L2.ArJSA([j])).v) }
		else {  //d is 'p'
			R.v = new Array(this.r*this.c);
			for (k=0, j=0; j<this.c; j++)  for (i=0; i<this.r; i++)   R.v[k++] = vecVar(this._twoDim('r','c',new L2.ArJSA([i]),new L2.ArJSA([j])).v) }
		R[d] = 1;
		return R }
	L2.P.var.sig = {arg:[1], rtn:true, min:0, dim:2};
	L2.P.sd = function(d,normBy) {
		var R = arguments.length === 2 ? this.var(d,normBy) : this.var(d);
		for (var i=0, n=R.v.length; i<n; i++) R.v[i] = Math.sqrt(R.v[i]);
		return R };
	L2.P.sd.sig = {arg:[1], rtn:true, min:0, dim:2};
	L2.P.homog = function(d) {
		var R, i, j, k, m, q, w, tmp, epp;
		if (d === 'e') {
			m = this.v.length;
			tmp = L2.aux.typeL2(this.v[0]);
			for (i=1; i<m; i++) if (L2.aux.typeL2(this.v[i]) !== tmp) return new L2.ArJSA([false]);
			return new L2.ArJSA([tmp]) }
		R = (new L2.ArShell(this,d))._remRedExtras(d);
		m = 0;
		epp = R.r*R.c;
		if (d === 'r') {
			j = 0;
			k = R.c*R.p;
			R.v = new Array(k);
			while (m<k) {
				for (i=j, tmp=L2.aux.typeL2(this.v[i++]), j+=R.r; i<j; i++) if (L2.aux.typeL2(this.v[i]) !== tmp) { tmp = false; break }
				R.v[m++] = tmp } }
		else if (d === 'c') {
			R.v = new Array(R.r*R.p);
			for (k=0; k<R.p; k++) {
				q = k * epp;
				w = q + epp;
				for (i=0; i<R.r; i++) {
					for (j=q+i, tmp=L2.aux.typeL2(this.v[j]), j+=R.r; j<w; j+=R.r) if (L2.aux.typeL2(this.v[j]) !== tmp) { tmp = false; break }
					R.v[m++] = tmp } } }
		else {  //d is 'p'
			R.v = new Array(epp);
			j = this.v.length; 
			for (i=0; i<epp; i++) {
				for (k=i, tmp=L2.aux.typeL2(this.v[k]), k+=epp; k<j; k+=epp) if (L2.aux.typeL2(this.v[k]) !== tmp) { tmp = false; break }
				R.v[i] = tmp } }
		R[d] = 1;
		return R };
	L2.P.homog.sig = {arg:[], rtn:true, min:0, dim:2};

	//unwrap
	L2.P.unwrap = function(d) {
		var i, j, k, sft, v, R, box0, tmp, nBox;
		var nE = this.v.length;
		var dNot = ['r','c','p'].filter( function(x) {return x !== d} );
		if (this[d] !== 1) throw new Error('can only unwrap singleton dimension');  
		if (nE === 0) throw new Error('cannot unwrap empty table');
		box0 = this.v[0].___L2B;
		for (i=0; i<nE; i++) {
			if (!(L2.aBox(this.v[i]))) throw new Error('box expected');
			tmp = this.v[i].___L2B;
			if (tmp[d] !== box0[d] || tmp[dNot[0]] !== 1 || tmp[dNot[1]] !== 1) throw new Error(L2.errorMsg.shapeMismatch) }
		nBox = box0.v.length;
		v = new Array(nE * nBox);
		if (d === 'r') {
			for (i=0, k=0; k<nE; k++) {
				tmp = this.v[k].___L2B.v;
				for (j=0; j<nBox; j++) v[i++] = tmp[j] } }
		else if (d === 'c') {
			for (k=0; k<nE; k++) {
				tmp = this.v[k].___L2B.v;
				sft = Math.floor(k/this.r)*this.r*nBox + (k % this.r);
				for (j=0; j<nBox; j++) v[sft + j*this.r] = tmp[j] } }
		else { //d is 'p'
			for (k=0; k<nE; k++) {
				tmp = this.v[k].___L2B.v;
				sft = this.r * this.c;
				for (j=0; j<nBox; j++) v[k + j*sft] = tmp[j] } }
		R = new L2.ArShell(this,d);    
		R.v = v;    
		R[d] = nBox;
		if (box0[d + 'a']) R._copyKey(box0,d,d);
		if (R.e) {
			delete R.e[d + 'l'];    delete R.e[d + 'f'];		delete R.e.ef; 		delete R.e.t;		delete R.e.i;
			if (L2.aux.isEmpty(R.e)) delete R.e }
		if (box0.e) {
			if (box0.e[d + 'l']) R['label:'](d,box0.e[d + 'l']);
			if (box0.e[d + 'f']) R['fmt:'](d,box0.e[d + 'f']);
			if (box0.e.ef)       R['fmt:']('e',box0.e.ef) }
		return R };
	L2.P.unwrap.sig = {arg:[], rtn:true, min:0, dim:1};

	//cumulative functions
	L2.P.cuSum = function(d) {
		var R, i, j, k, m, v, tmp, epp;
		m = this.v.length;
		v = new Array(m);
		if (d === 'e') {
			if (m === 0) return new L2.ArJSA([]);
			v[0] = this.v[0];
			for (i=1; i<m; i++) v[i] = v[i-1] + this.v[i];
			return new L2.ArJSA(v) }
		R = new L2.ArShell(this);
		if (m === 0) {
			R.v = [];
			return R; }
		epp = R.r*R.c;
		if (R.e) {
			delete R.e.ef; 	delete R.e.t;		delete R.e.i;
			if (L2.aux.isEmpty(R.e)) delete R.e; }
		if (d === 'r') {
			j = 0;
			while (j<m) {
				v[j] = this.v[j];
				j++;
				for (i=1; i<R.r; i++,j++) v[j] = v[j-1] + this.v[j]; } }
		else if (d === 'c') {
			for (k=0; k<R.p; k++) {
				for (i=0; i<R.r; i++) {
					tmp = i + epp*k;
					v[tmp] = this.v[tmp];
					for (j=1; j<R.c; j++) {
						tmp = i + j*R.r + epp*k;
						v[tmp] = v[tmp-R.r] + this.v[tmp]; } } } }
		else {
			for (j=0; j<epp; j++) {
				v[j] = this.v[j];
				for (i=j+epp; i<m; i+=epp) v[i] = v[i-epp] + this.v[i] } }
		R.v = v;
		return R };
	L2.P.cuSum.sig = {arg:[], rtn:true, min:0, dim:2};
	L2.P.cuProd = function(d) {
		var R, i, j, k, m, v, tmp, epp;
		m = this.v.length;
		v = new Array(m);
		if (d === 'e') {
			if (m === 0) return new L2.ArJSA([]);
			v[0] = this.v[0];
			for (i=1; i<m; i++) v[i] = v[i-1] * this.v[i];
			return new L2.ArJSA(v) }
		R = new L2.ArShell(this);
		if (m === 0) {
			R.v = [];
			return R; }
		epp = R.r*R.c;
		if (R.e) {
			delete R.e.ef; 	delete R.e.t;		delete R.e.i;
			if (L2.aux.isEmpty(R.e)) delete R.e; }
		if (d === 'r') {
			j = 0;
			while (j<m) {
				v[j] = this.v[j];
				j++;
				for (i=1; i<R.r; i++,j++) v[j] = v[j-1] * this.v[j]; } }
		else if (d === 'c') {
			for (k=0; k<R.p; k++) {
				for (i=0; i<R.r; i++) {
					tmp = i + epp*k;
					v[tmp] = this.v[tmp];
					for (j=1; j<R.c; j++) {
						tmp = i + j*R.r + epp*k;
						v[tmp] = v[tmp-R.r] * this.v[tmp]; } } } }
		else {
			for (j=0; j<epp; j++) {
				v[j] = this.v[j];
				for (i=j+epp; i<m; i+=epp) v[i] = v[i-epp] * this.v[i] } }
		R.v = v;
		return R };
	L2.P.cuProd.sig = {arg:[], rtn:true, min:0, dim:2};
	L2.P.cuMin = function(d) {
		var R, i, j, k, m, v, tmp, epp;
		m = this.v.length;
		v = new Array(m);
		if (d === 'e') {
			if (m === 0) return new L2.ArJSA([]);
			v[0] = this.v[0];
			for (i=1; i<m; i++) v[i] = Math.min( v[i-1], this.v[i] );
			return new L2.ArJSA(v) }
		R = new L2.ArShell(this);
		if (m === 0) {
			R.v = [];
			return R; }
		epp = R.r*R.c;
		if (R.e) {
			delete R.e.ef; 	delete R.e.t;		delete R.e.i;
			if (L2.aux.isEmpty(R.e)) delete R.e; }
		if (d === 'r') {
			j = 0;
			while (j<m) {
				v[j] = this.v[j];
				j++;
				for (i=1; i<R.r; i++,j++) v[j] = Math.min( v[j-1], this.v[j] ) } }
		else if (d === 'c') {
			for (k=0; k<R.p; k++) {
				for (i=0; i<R.r; i++) {
					tmp = i + epp*k;
					v[tmp] = this.v[tmp];
					for (j=1; j<R.c; j++) {
						tmp = i + j*R.r + epp*k;
						v[tmp] = Math.min( v[tmp-R.r], this.v[tmp]) } } } }
		else {
			for (j=0; j<epp; j++) {
				v[j] = this.v[j];
				for (i=j+epp; i<m; i+=epp) v[i] = Math.min( v[i-epp], this.v[i]) } }
		R.v = v;
		return R };
	L2.P.cuMin.sig = {arg:[], rtn:true, min:0, dim:2};
	L2.P.cuMax = function(d) {
		var R, i, j, k, m, v, tmp, epp;
		m = this.v.length;
		v = new Array(m);
		if (d === 'e') {
			if (m === 0) return new L2.ArJSA([]);
			v[0] = this.v[0];
			for (i=1; i<m; i++) v[i] = Math.max( v[i-1], this.v[i] );
			return new L2.ArJSA(v) }
		R = new L2.ArShell(this);
		if (m === 0) {
			R.v = [];
			return R; }
		epp = R.r*R.c;
		if (R.e) {
			delete R.e.ef; 	delete R.e.t;		delete R.e.i;
			if (L2.aux.isEmpty(R.e)) delete R.e; }
		if (d === 'r') {
			j = 0;
			while (j<m) {
				v[j] = this.v[j];
				j++;
				for (i=1; i<R.r; i++,j++) v[j] = Math.max( v[j-1], this.v[j] ) } }
		else if (d === 'c') {
			for (k=0; k<R.p; k++) {
				for (i=0; i<R.r; i++) {
					tmp = i + epp*k;
					v[tmp] = this.v[tmp];
					for (j=1; j<R.c; j++) {
						tmp = i + j*R.r + epp*k;
						v[tmp] = Math.max( v[tmp-R.r], this.v[tmp]) } } } }
		else {
			for (j=0; j<epp; j++) {
				v[j] = this.v[j];
				for (i=j+epp; i<m; i+=epp) v[i] = Math.max( v[i-epp], this.v[i]) } }
		R.v = v;
		return R };
	L2.P.cuMax.sig = {arg:[], rtn:true, min:0, dim:2};
	L2.P.cuTruthy = function(d) {
		var R, i, j, k, m, v, tmp, epp;
		m = this.v.length;
		v = new Array(m);
		if (d === 'e') {
			if (m === 0) return new L2.ArJSA([]);
			v[0] = this.v[0] ? 1 : 0;
			for (i=1; i<m; i++) v[i] = v[i-1] + !!this.v[i];
			return new L2.ArJSA(v) }
		R = new L2.ArShell(this);
		if (m === 0) {
			R.v = [];
			return R; }
		epp = R.r*R.c;
		if (R.e) {
			delete R.e.ef; 	delete R.e.t;		delete R.e.i;
			if (L2.aux.isEmpty(R.e)) delete R.e; }
		if (d === 'r') {
			j = 0;
			while (j<m) {
				v[j] = this.v[j] ? 1 : 0;
				j++;
				for (i=1; i<R.r; i++,j++) v[j] = v[j-1] + !!this.v[j] } }
		else if (d === 'c') {
			for (k=0; k<R.p; k++) {
				for (i=0; i<R.r; i++) {
					tmp = i + epp*k;
					v[tmp] = this.v[tmp] ? 1 : 0;
					for (j=1; j<R.c; j++) {
						tmp = i + j*R.r + epp*k;
						v[tmp] = v[tmp-R.r] + !!this.v[tmp] } } } }
		else {
			for (j=0; j<epp; j++) {
				v[j] = this.v[j] ? 1 : 0;
				for (i=j+epp; i<m; i+=epp) v[i] = v[i-epp] + !!this.v[i] } }
		R.v = v;
		return R };
	L2.P.cuTruthy.sig = {arg:[], rtn:true, min:0, dim:2};

	//table to string and save table
	L2.P.serial = function() {
		function checkValid(A) {
			var i, n, tmp;
			if (A.e && (A.e.rf || A.e.cf || A.e.pf || A.e.ef)) throw new Error('table must not have format functions');
			for (i=0, n=A.v.length; i<n; i++) {
				tmp = typeof A.v[i];
				if (tmp === 'number' || tmp === 'boolean' || tmp === 'string' || tmp === 'undefined') continue;
				else if (L2.aBox(A.v[i])) checkValid(A.v[i].___L2B);
				else throw new Error('entry cannot be of type date, regex or function') } }
		checkValid(this);
		return JSON.stringify(this) }  //undefined entries converted to null since appear in a JS array
	L2.P.serial.sig = {arg:[], rtn:false, min:0, dim:0};
	L2.P.save = function(p) {
		if (p.slice(-4).toUpperCase() !== '.L2T') throw new Error('file extension must be \'.L2T\'');
		L2.sc.write(this.serial(),p);
		return true };
	L2.P.save.sig = {arg:[1], rtn:false, min:1, dim:0};

	//save table as csv
	L2.P.saveCSV = function(p,h) {
		var	epp, x, tmp, i, j, k;
		var s = '';
		if (this.v.length === 0) throw new Error('cannot save empty table as csv file');
		if (arguments.length === 2) {
			if (h !== 'name') throw new Error('argument must be \'name\'');
			if (this.ck) {
				for (i=0; i<this.c-1; i++) s+= L2.aux.exportStringCSV(this.ca[i]) + ',';
				s += L2.aux.exportStringCSV(this.ca[this.c-1]) + '\n' }
			else throw new Error('cannot use \'name\' if table does not have column keys') }
		epp = this.r*this.c;
		for (k=0; k<this.p; k++) {
			for (i=0; i<this.r; i++) { 
				for (j=0; j<this.c; j++) {
					x = this.v[i + j*this.r + k*epp];
					tmp = typeof x;   //do not catch undefined below since leave as empty in csv file
					if (tmp === 'number' || tmp === 'boolean') s += x;
					else if (tmp === 'string') s += L2.aux.exportStringCSV(x);
					else if (x !== undefined) s += L2.aux.exportStringCSV(x.toString());  //box, date, regex, function
					s += (j === this.c-1 ? '\n' : ',') } } }
		L2.sc.write(s,p);
		return true };
	L2.P.saveCSV.sig = {arg:[1,1], rtn:false, min:1, dim:0};

	//convert to JSON
	L2.P.toJSONa = function() { return JSON.stringify(L2.toJS(this)) };
	L2.P.toJSONa.sig = {arg:[], rtn:false, min:0, dim:0};

	//set theory
	L2.P.unique = function() {
		var i, j, ent;
		var seen = {};
		var n = this.v.length;
		var v = new Array(n);
		for (j=0, i=0; i<n; i++) {
			ent = this.v[i];
			if (!seen[ent]) {
				seen[ent] = 1;
				v[j++] = ent } }
		return new L2.ArJSA(v.slice(0,j)) };
	L2.P.unique.sig = {arg:[], rtn:true, min:0, dim:0};
	L2.P.isUnique = function() { return L2.aux.uniqueJSA_strEq(this.v) };
	L2.P.isUnique.sig = {arg:[], rtn:false, min:0, dim:0};
	L2.P.inter = function(A) {
		var i, j, ent;
		var nThis = this.v.length;
		var nA = A.v.length;
		var AJSO = {};
		var got = {};
		var keep = new Array(Math.min(nThis,nA));
		for (i=0; i<nA; i++) AJSO[A.v[i]] = 1;
		for (j=0, i=0; i<nThis; i++) {
			ent = this.v[i];
			if (AJSO[ent] && !got[ent]) {
				keep[j++] = ent;
				got[ent] = 1 } }
		return new L2.ArJSA(keep.slice(0,j)) };
	L2.P.inter.sig = {arg:[2], rtn:true, min:1, dim:0};
	L2.P.union = function(A) {
		var i, j, ent;
		var seen = {};
		var nThis = this.v.length;
		var nA = A.v.length;
		var v = new Array(nThis + nA);
		for (j=0, i=0; i<nThis; i++) {
			ent = this.v[i];
			if (!seen[ent]) {
				seen[ent] = 1;
				v[j++] = ent } }
		for (i=0; i<nA; i++) {
			ent = A.v[i];
			if (!seen[ent]) {
				seen[ent] = 1;
				v[j++] = ent } }
		return new L2.ArJSA(v.slice(0,j)) };
	L2.P.union.sig = {arg:[2], rtn:true, min:1, dim:0};
	L2.P.diff = function(A) {
		var i, j, ent;
		var nThis = this.v.length;
		var nA = A.v.length;
		var AJSO = {};
		var got = {};
		var keep = new Array(nThis);
		for (i=0; i<nA; i++) AJSO[A.v[i]] = 1;
		for (j=0, i=0; i<nThis; i++) {
			ent = this.v[i];
			if (!AJSO[ent] && !got[ent]) {
				keep[j++] = ent;
				got[ent] = 1 } }
		return new L2.ArJSA(keep.slice(0,j)) };
	L2.P.diff.sig = {arg:[2], rtn:true, min:1, dim:0};
	L2.P.symmDiff = function(A) {
		var v = this.diff(A).v.concat(A.diff(this).v);
		return new L2.ArJSA(v) };
	L2.P.symmDiff.sig = {arg:[2], rtn:true, min:1, dim:0};
	L2.P.in = function(A) {
		var i;
		var AJSO = {};
		var nThis = this.v.length;
		var nA = A.v.length;
		var v = new Array(nThis);
		for (i=0; i<nA; i++) AJSO[A.v[i]] = true;
		for (i=0; i<nThis; i++) v[i] = !!AJSO[this.v[i]];
		return new L2.ArJSA(v) };
	L2.P.in.sig = {arg:[2], rtn:true, min:1, dim:0};

	//freq
	L2.P.freq = function(ky) {
		if (arguments.length === 1 && ky !== 'key') throw new Error('argument must be \'key\'');
		var i, j, tmp, ct, va, R;
		var ne = this.v.length;
		var frq = {};
		var nf = 0;  
		for (i=0; i<ne; i++) {
			tmp = this.v[i];
			if (frq[tmp]) frq[tmp]++;
			else {
				frq[tmp] = 1;
				nf++ } }
		j = 0;
		if (ky) {
			va = new Array(nf);
			ct = new Array(nf);
			for (i in frq) {
				va[j] = i;
				ct[j++] = frq[i] }
			return (new L2.ArJSA(ct))['key:']('r', undefined, new L2.ArJSA(va)) }
		else {
			va = new Array(2*nf);
			for (i in frq) {
				va[j] = i;
				va[j + nf] = frq[i];
				j++ }
			R = new L2.ArJSA(va);
			R.r = nf;
			R.c = 2;
			R['key:']('c', undefined, new L2.ArJSA(['value','frequency']));
			return R } };
	L2.P.freq.sig = {arg:[1], rtn:true, min:0, dim:0};

	//hasKey
	L2.P.hasKey = function(d,ky) {
		var dk = this[d + 'k'];
		if (arguments.length === 2) {
			if (ky === undefined) throw new Error(L2.errorMsg.undefAsKey);
			if (!dk) return false;
			return typeof dk[ky] === 'number' }
		return !!dk };
	L2.P.hasKey.sig = {arg:[1], rtn:false, min:0, dim:1};

	//sort
	L2.P.sort = function(x,ind) {
		var i, thisV, typ, xIsFunc, unboxedV;
		var n = this.v.length;
		var v = new Array(n);
		if (x === undefined) x = 'asc';  //not passed or undefined passed
		else {
			xIsFunc = typeof x === 'function';
			if (x !== 'desc' && x !== 'asc' && !xIsFunc) throw new Error('\'asc\', \'desc\' or function expected') }
		if (arguments.length > 1 && ind !== 'index') throw new Error('argument must be \'index\'');
		if (n === 0) return new L2.ArJSA([]);
		if (!xIsFunc) L2.assert.homogType(this);
		typ = typeof this.v[0];    
		if (ind) {
			thisV = this.v; //function passed to sort cannot use 'this'
			for (i=0; i<n; i++) v[i] = i;
			if (x === 'asc') {
				if (typ === 'string') v.sort(function(a,b) { var a=thisV[a], b=thisV[b]; return a > b ? 1 : (a < b ? -1 : 0) });
				else v.sort( function(a,b) {return thisV[a] - thisV[b]} ) } //numbers, dates or bools  
			else if (x === 'desc') {
				if (typ === 'string') v.sort(function(a,b) { var a=thisV[a], b=thisV[b]; return a < b ? 1 : (a > b ? -1 : 0) });
				else v.sort( function(a,b) {return thisV[b] - thisV[a]} ) } //numbers, dates or bools
			else {  //x is a func
				unboxedV = new Array(n);
				for (i=0; i<n; i++) unboxedV[i] = L2.tabIfBox(this.v[i]);  //avoid calling L2.tabIfBox() inside comparison func
				v.sort(function(a,b) {return L2.sca(x(unboxedV[a], unboxedV[b]))}) } }
		else {
			if (x === 'asc') {
				for (i=0; i<n; i++) v[i] = this.v[i];  //copy - js sorts in place
				if (typ === 'string') v.sort();
				else v.sort(function(a,b) {return a - b}) }  //numbers, dates or bools
			else if (x === 'desc') {
				for (i=0; i<n; i++) v[i] = this.v[i];  //copy - js sorts in place
				if (typ === 'string') v.sort().reverse();
				else v.sort(function(a,b) {return b - a}) }  //numbers, dates or bools
			else {  //x is a func
				unboxedV = new Array(n);
				for (i=0; i<n; i++) {
					v[i] = i;
					unboxedV[i] = L2.tabIfBox(this.v[i]) }  //avoid calling L2.tabIfBox() inside comparison func
				v.sort(function(a,b) {return L2.sca(x(unboxedV[a], unboxedV[b]))});
				for (i=0; i<n; i++) v[i] = this.v[v[i]] } }
		return new L2.ArJSA(v) };
	L2.P.sort.sig = {arg:[1,1], rtn:true, min:0, dim:0};
	L2.P.asc = function(ind) {
		if (arguments.length === 1) return this.sort('asc',ind);
		else return this.sort('asc') };
	L2.P.asc.sig = {arg:[1], rtn:true, min:0, dim:0};
	L2.P.desc = function(ind) {
		if (arguments.length === 1) return this.sort('desc',ind);
		else return this.sort('desc') };
	L2.P.desc.sig = {arg:[1], rtn:true, min:0, dim:0};

	//do, map, each
	L2.P.do = function(f) {
		L2.assert.func(f);
		for (var i=0, n=this.v.length; i<n; i++) f(L2.tabIfBox(this.v[i]), i, this);
		return this };
	L2.P.do.sig = {arg:[1], rtn:true, min:1, dim:0};
	L2.P.map = function(f) {
		var i, R;
		var n = this.v.length;
		L2.assert.func(f);
		R = new L2.ArShell(this);
		R.v = new Array(n);
		for (i=0; i<n; i++) R.v[i] = L2.boxIfTab( f(L2.tabIfBox(this.v[i]), i, this) );
		return R };
	L2.P.map.sig = {arg:[1], rtn:true, min:1, dim:0};
	L2.P.each = function(d,f) {
		L2.assert.func(f);
		for (var i=0, n=this[d]; i<n; i++) f(this._oneDimSc(d,i), i, this);
		return this };
	L2.P.each.sig = {arg:[1], rtn:true, min:1, dim:1};

	//sapply, tapply
	L2.P.sapply = function(f,rtn) { return L2.sca(L2.assert.func(f)(...this.v.map(L2.tabIfBox))) };
	L2.P.sapply.sig = {arg:[1,1], rtn:false, min:1, dim:0};
	L2.P.tapply = function(f,rtn) { return L2.tab(L2.assert.func(f)(...this.v.map(L2.tabIfBox))) };
	L2.P.tapply.sig = {arg:[1,1], rtn:true, min:1, dim:0};

	//find, filter
	L2.P._filterFind = function(f,fnd) {
		var n = this.v.length;
		var v = new Array(n);
		var i = 0;
		var j = 0;
		if (f) {
			if (fnd) { for (; i<n; i++) if (L2.sca(f(L2.tabIfBox(this.v[i]),i,this))) v[j++] = i }
			else     { for (; i<n; i++) if (L2.sca(f(L2.tabIfBox(this.v[i]),i,this))) v[j++] = this.v[i] } }
		else {
			if (fnd) { for (; i<n; i++) if (this.v[i]) v[j++] = i } 
			else     { for (; i<n; i++) if (this.v[i]) v[j++] = this.v[i] } }
		v.length = j;
		return new L2.ArJSA(v) };
	L2.P.find = function(f) { 
		if (arguments.length === 1 && typeof f !== 'function') throw new Error('function expected');
		return this._filterFind(f,true) };
	L2.P.find.sig = {arg:[1], rtn:true, min:0, dim:0};
	L2.P.filter = function(f) { 
		if (arguments.length === 1 && typeof f !== 'function') throw new Error('function expected');
		return this._filterFind(f) };
	L2.P.filter.sig = {arg:[1], rtn:true, min:0, dim:0};

	//nest
	L2.P._nestFlat = function(d,entryLabel,full) {
		if (d === 'e' && entryLabel === undefined) entryLabel = 'entry';
		var nE = this.v.length;
		if (nE === 0) return new L2.ArJSA([]);
		L2.assert.noBoxes(this);
		var i, j, k, m, s, v, tmp, da, db, namesDa, namesDb;
		var names = {};
		var dimList = ['r','c','p'];
		var rc = this.r*this.c;
		var setNames = dim => {
			var q, tmpNames;
			if (this[dim + 'a']) tmpNames = L2.aux.shallowCopyJSA(this[dim + 'a']);
			else if (dim === d) {
				tmpNames = new Array(this[dim]);
				for (q=0; q<this[dim]; q++) tmpNames[q] = dim + '_' + q }
			else tmpNames = L2.aux.simpleRangeJSA(this[dim]);
			names[dim] = tmpNames };
		if (full) dimList.map(setNames);
		else dimList.filter(dim => dim === d || this[dim] > 1 || this[dim + 'k'] || this.label(dim)).map(setNames);
		var getLabel = dim => this.label(dim) || L2.aux.expandDim[dim];
		var templateKeys = (d === 'e')
			? [entryLabel].concat(dimList.filter(dim => names[dim]).map(getLabel))
			: names[d].concat(dimList.filter(dim => dim !== d && names[dim]).map(getLabel));
		var template = new L2.ArJSA(new Array(templateKeys.length))['key:']('r', undefined, new L2.ArJSA(templateKeys));
		var copyTemplate = () => {
			var cpy = new L2.ArShell(template);
			cpy.v = new Array(template.r);
			return cpy };
		if (d === 'e') {
			v = new Array(nE);
			for (i=0; i<nE; i++) {
				k = 1;  
				tmp = copyTemplate();
				tmp.v[0] = this.v[i];
				if (names.r) tmp.v[k++] = names.r[i % this.r];
				if (names.c) tmp.v[k++] = names.c[Math.floor(i/this.r) % this.c];
				if (names.p) tmp.v[k]   = names.p[Math.floor(i/rc)];
				v[i] = new L2.Box(tmp) } }
		else { //r, c or p
			[da,db] = dimList.filter(dim => dim !== d);
			namesDa = names[da];
			namesDb = names[db];
			v = new Array(this[da] * this[db]);
			m = 0;
			for (k=0; k<this[db]; k++) {
				for (j=0; j<this[da]; j++) {
					tmp = copyTemplate();
					if      (d === 'r') for (i=0; i<this.r; i++) tmp.v[i] = this.v[rc*k + this.r*j + i];
					else if (d === 'c') for (i=0; i<this.c; i++) tmp.v[i] = this.v[rc*k + this.r*i + j];
					else                for (i=0; i<this.p; i++) tmp.v[i] = this.v[rc*i + this.r*k + j];      
					s = 0;
					if (namesDa) {
						tmp.v[this[d]] = namesDa[j];
						s = 1 }
					if (namesDb) tmp.v[this[d] + s] = namesDb[k];
					v[m++] = new L2.Box(tmp) } } }
		return new L2.ArJSA(v) };
	L2.P._nestBox = function(...arg) {
		var nE = this.v.length;
		if (nE === 0) return new L2.ArJSA([]);
		L2.assert.allBoxes(this);
		var i, j, k, m, tmp, nTmp, tmpKeys_i, tmp_j, nOrig_i, nAdd, outerEnts_i, outerKeys;
		var dimList = ['r','c','p'];
		var outerShell = this._shell();
		var ensureLabel = dim => {
			if (!this.label(dim)) outerShell['label:'](dim, L2.aux.expandDim[dim] + ' (outer)') };
		if (arg[2]) dimList.map(ensureLabel); 
		else dimList.filter(dim => this[dim] > 1 || this[dim + 'k']).map(ensureLabel);  
		var outerNest = outerShell._nestFlat('e', '', arg[2]);  //'' so no dict key clash - other keys are from dim labels which cannot be ''
		if (outerNest.v[0].___L2B.v.length === 1) {  //no extra key-entry pairs from outer - nE is 1, no outer keys/labels, full arg falsy
			return this.v[0].___L2B._nestFlat(...arg) }    
		outerKeys = outerNest.v[0].___L2B.ra.slice(1);  //keys added from outer always the same (first row corresponds to entry - not used)
		nAdd = outerKeys.length; //always append same number key-entry pairs from outer
		var v = [];
		m = 0;
		for (i=0; i<nE; i++) {  //outer boxes
			tmp = this.v[i].___L2B._nestFlat(...arg);
			nTmp = tmp.v.length;
			if (nTmp === 0) continue;
			tmpKeys_i = tmp.v[0].___L2B.rk;  //each dict for box i has same keys
			nOrig_i = tmp.v[0].___L2B.ra.length;
			outerEnts_i = outerNest.v[i].___L2B.v.slice(1);    
			for (j of outerKeys) {  //check no name clash - only reqd once per i 
				if (typeof tmpKeys_i[j] === 'number') throw new Error(L2.errorMsg.dupKey) }
			v.length += nTmp;
			for (j=0; j<nTmp; j++) {  //dicts for box i
				tmp_j = tmp.v[j].___L2B;
				for (k=0; k<nAdd; k++) {  //additional key-entry pairs
					tmp_j.v[nOrig_i + k] = outerEnts_i[k];
					tmp_j.ra[nOrig_i + k] = outerKeys[k];
					tmp_j.rk[outerKeys[k]] = nOrig_i + k }
				tmp_j.r += nAdd;
				v[m++] = tmp.v[j] } }
		return new L2.ArJSA(v) };
	L2.P.nest = function(...arg) { return L2.aBox(this.v[0]) ? this._nestBox(...arg) : this._nestFlat(...arg) };
	L2.P.nest.sig = {arg:[1,1], rtn:true, min:0, dim:2};

	//query
	L2.P._where = function(c,s,unless) {
		L2.assert.dataMatrix(this);
		var i, ns, sJSO;
		var keep = new Array(this.r);
		var sft = this._getInd(c,'c') * this.r;
		var hit = 0;
		if (L2.aTab(s)) {
			ns = s.v.length;
			if (ns === 1) s = s.v[0];
			else {
				sJSO = {};
				for (i=0; i<ns; i++) sJSO[s.v[i]] = 1;
				if (unless) { for (i=0; i<this.r; i++) if (!sJSO[this.v[sft + i]]) keep[hit++] = i }
				else        { for (i=0; i<this.r; i++) if ( sJSO[this.v[sft + i]]) keep[hit++] = i }
				return this._oneDimAr("r", new L2.ArJSA(keep.slice(0,hit))) } }
		if (typeof s === 'function') {
			if (unless) { for (i=0; i<this.r; i++) if (!L2.sca(s( L2.tabIfBox(this.v[sft + i]), i, this))) keep[hit++] = i }
			else        { for (i=0; i<this.r; i++) if ( L2.sca(s( L2.tabIfBox(this.v[sft + i]), i, this))) keep[hit++] = i } }
		else {
			sJSO = {};
			sJSO[s] = 1;
			if (unless) { for (i=0; i<this.r; i++) if (!sJSO[this.v[sft + i]]) keep[hit++] = i }
			else        { for (i=0; i<this.r; i++) if ( sJSO[this.v[sft + i]]) keep[hit++] = i } }
		return this._oneDimAr("r", new L2.ArJSA(keep.slice(0,hit))) };
	L2.P.where = function(c,s) { return this._where(c,s) };
	L2.P.where.sig = {arg:[1,3], rtn:true, min:2, dim:0};  
	L2.P.unless = function(c,s) { return this._where(c,s,true) };
	L2.P.unless.sig = {arg:[1,3], rtn:true, min:2, dim:0}; 
	L2.P['_where:'] = function(c,s,a,unless) {
		L2.assert.dataMatrix(this);
		var i, ns, sJSO, na, aJSO, funcVal;
		var keep = new Array(this.r);
		var sft = this._getInd(c,'c') * this.r;
		var hit = 0;
		var aIsAr = L2.aTab(a);
		if (aIsAr) na = a.v.length;
		function checkEntExist(B) {  //use once finished with callbacks - ensures do not return an invalid table
			if (hit > 0 && B.v.length <= sft + keep[hit-1]) throw new Error('index out of bounds') }
		if (L2.aTab(s)) {
			ns = s.v.length;
			if (ns === 1) s = s.v[0];
			else {
				sJSO = {};
				for (i=0; i<ns; i++) sJSO[s.v[i]] = 1;
				if (unless) { for (i=0; i<this.r; i++) if (!sJSO[this.v[sft + i]]) keep[hit++] = i }
				else        { for (i=0; i<this.r; i++) if ( sJSO[this.v[sft + i]]) keep[hit++] = i }
				if (aIsAr) {  //only when calling '.where:' not '.unless:'
					if (na === 1) a = a.v[0];
					else if (na !== ns) throw new Error(L2.errorMsg.shapeMismatch);
					else {
						aJSO = {};
						for (i=0; i<na; i++) { aJSO[s.v[i]] = a.v[i] }
						for (i=0; i<hit; i++) { this.v[sft + keep[i]] = aJSO[this.v[sft + keep[i]]] }
						return this } }
				if (typeof a === 'function') {
					funcVal = new Array(hit);  //only change this.v once know callback does not throw error
					for (i=0; i<hit; i++) funcVal[i] = L2.boxIfTab(a( L2.tabIfBox(this.v[sft + keep[i]]), keep[i], this));
					checkEntExist(this);
					for (i=0; i<hit; i++) this.v[sft + keep[i]] = funcVal[i] }
				else { for (i=0; i<hit; i++) this.v[sft + keep[i]] = a }
				return this } }
		if (typeof s === 'function') {
			if (unless) { for (i=0; i<this.r; i++) if (!L2.sca(s( L2.tabIfBox(this.v[sft + i]), i, this))) keep[hit++] = i }
			else        { for (i=0; i<this.r; i++) if ( L2.sca(s( L2.tabIfBox(this.v[sft + i]), i, this))) keep[hit++] = i } }
		else {
			sJSO = {};
			sJSO[s] = 1;
			if (unless) { for (i=0; i<this.r; i++) if (!sJSO[this.v[sft + i]]) keep[hit++] = i }
			else        { for (i=0; i<this.r; i++) if ( sJSO[this.v[sft + i]]) keep[hit++] = i } }
		if (aIsAr) {
			if (na !== 1) throw new Error(L2.errorMsg.shapeMismatch);
			a = a.v[0] }
		if (typeof a === 'function') {
			funcVal = new Array(hit);  //only change this.v once know callback does not throw error
			for (i=0; i<hit; i++) funcVal[i] = L2.boxIfTab(a( L2.tabIfBox(this.v[sft + keep[i]]), keep[i], this));
			checkEntExist(this);
			for (i=0; i<hit; i++) this.v[sft + keep[i]] = funcVal[i] }
		else {
			if (typeof s === 'function') checkEntExist(this);
			for (i=0; i<hit; i++) this.v[sft + keep[i]] = a }
		return this };
	L2.P['where:'] = function(c,s,a) { return this['_where:'](c,s,a) };
	L2.P['where:'].sig = {arg:[1,3,3], rtn:true, min:3, dim:0};
	L2.P['unless:'] = function(c,s,a) { return this['_where:'](c,s,a,true) };
	L2.P['unless:'].sig = {arg:[1,3,1], rtn:true, min:3, dim:0};
	L2.P.count = function(c) {
		var i, j, nc, val, allKeys, ci, allKeysJSA, nak, total, flipColKey, newColKey;
		L2.assert.dataMatrix(this);
		//process c to a JSA of non-neg col inds
		if (c.v.length === 0) throw new Error('must specify at least 1 column (pass ~ to use all)');
		else if (L2.ge.isNil(c)) {
			nc = this.c;
			c = new Array(nc);
			for (i=0; i<nc; i++) c[i] = i }
		else {
			nc = c.v.length;
			c = L2.aux.colInd(this,c).v }
		//count cols  
		allKeys = {};
		function zeroJSA(n) {
			var a = new Array(n);
			for (var b=0; b<n; b++) a[b] = 0;
			return a }
		for (i=0; i<nc; i++) {
			ci = this.r * c[i];
			for (j=0; j<this.r; j++) {
				val = this.v[ci + j];
				if (allKeys[val]) allKeys[val][i]++;
				else {
					allKeys[val] = zeroJSA(nc);
					allKeys[val][i] = 1 } } }
		allKeysJSA = Object.keys(allKeys);
		nak = allKeysJSA.length;
		total = new L2.ArFast(nak,nc,1);
		for (i=0; i<nc; i++) {
			for (j=0; j<nak; j++) {
				total.v[i*nak + j] = allKeys[allKeysJSA[j]][i] } }      
		//extras
		total._setKey('r',allKeysJSA);
		if (this.z) {
			if (this.ca) total._setKeyFrom('c',this,c);
			if (this.pa) total._setKey('p', [this.pa[0]]);
			if (this.e) {
				if (this.e.cl) total['label:']('c', this.e.cl);
				if (this.e.pl) total['label:']('p', this.e.pl);
				if (this.e.cf) total['fmt:']('c', this.e.cf);
				if (this.e.pf) total['fmt:']('p', this.e.pf) } }
		return total };
	L2.P.count.sig = {arg:[2], rtn:true, min:1, dim:0};
	L2.P.group = function(gc,f) {
		var i, j, tmp, iKey, gcNonNeg, v, nv, dest, keepCol, R;
		var gp = [{}, {}, {}];
		var ky = new Array(3);
		var newLabel = new Array(3);
		var vShp = [0,0,0];
		var gcn = gc.v.length;
		var gcnIs3 = gcn === 3;
		L2.assert.dataMatrix(this);
		if (gcn === 0 || gcn > 3) throw new Error('must specify 1, 2 or 3 columns to group on');
		if (arguments.length === 2 && f !== 'tally' && typeof f !== 'function') throw new Error('function or \'tally\' expected');
		gcNonNeg = L2.aux.colInd(this,gc);  //L2 table
		keepCol = L2.sc.range(0,this.c-1)["unless"](0, gcNonNeg);  //L2 table
		function remTitleInfo(a) {
			if (a.e) {
				if (a.e.title) a['title:'](undefined);
				if (a.e.info)  a['info:'](undefined) }
			return a }
		//group each focal column and get new dim labels
		(function(that) {
			var i, j, sft, ent;
			for (i=0; i<gcn; i++) {
				if (typeof gc.v[i] === 'number') newLabel[i] = that.ck ? that.ca[gcNonNeg.v[i]] : gcNonNeg.v[i];
				else newLabel[i] = gc.v[i];  //know that converts to valid key from L2.aux.colInd()
				sft = gcNonNeg.v[i]*that.r;
				for (j=0; j<that.r; j++) {
					ent = that.v[sft + j];
					gp[i][ent] ? gp[i][ent].push(j) : (gp[i][ent] = [j], vShp[i]++) }
				ky[i] = Object.keys(gp[i]) } }(this));
		//group on 1 column
		if (gcn === 1) {
			v = new Array(vShp[0]);
			if (f === 'tally') { for (i=0; i<vShp[0]; i++) v[i] = gp[0][ky[0][i]].length }
			else {
				for (i=0; i<vShp[0]; i++) {
					iKey = ky[0][i];
					tmp = remTitleInfo(this._twoDim('r','c', new L2.ArJSA(gp[0][iKey]), keepCol));
					if (typeof f === 'function') v[i] = L2.boxIfTab(f(tmp, iKey));
					else v[i] = new L2.Box(tmp) } }
			R = (new L2.ArJSA(v))['label:']('r',newLabel[0]);
			R._setKey('r',ky[0]);
			return R }
		//group on 2 or 3 columns
		nv = vShp[0] * vShp[1] * (gcnIs3 ? vShp[2] : 1);
		v = new Array(nv);
		for (i=0; i<nv; i++) v[i] = [];  //initially put row inds into entries of v
		dest = new Array(this.r);
		for (i=0; i<this.r; i++) dest[i] = 0;
		function addToDest(a) {
			var tmp, i, j;
			var mult = a === 2 ? vShp[0]*vShp[1] : (a === 1 ? vShp[0] : 1);
			for (i=0; i<vShp[a]; i++) {
				tmp = gp[a][ky[a][i]];
				for (j=0; j<tmp.length; j++) dest[tmp[j]] += mult*i } }
		addToDest(0);
		addToDest(1);
		if (gcnIs3) addToDest(2);
		for (i=0; i<this.r; i++) v[dest[i]].push(i);
		if (f === 'tally') { for (i=0; i<nv; i++) v[i] = v[i].length }
		else {
			for (i=0; i<nv; i++) {
				tmp = remTitleInfo(this._twoDim('r','c', new L2.ArJSA(v[i]), keepCol));
				if (typeof f === 'function') {
					if (gcnIs3) tmp = f(tmp, ky[0][i % vShp[0]], ky[1][Math.floor(i/vShp[0]) % vShp[1]], ky[2][Math.floor(i/(vShp[0]*vShp[1]))]);
					else        tmp = f(tmp, ky[0][i % vShp[0]], ky[1][Math.floor(i/vShp[0])]);
					v[i] = L2.boxIfTab(tmp) }
				else v[i] = new L2.Box(tmp) } }
		R = new L2.ArJSA(v);
		R.r = vShp[0];
		R.c = vShp[1];
		R._setKey('r',ky[0]);
		R._setKey('c',ky[1]);
		R['label:']('r',newLabel[0])['label:']('c',newLabel[1]);
		if (gcnIs3) {
			R.p = vShp[2];
			R._setKey('p',ky[2]);
			R['label:']('p',newLabel[2]) }
		return R };
	L2.P.group.sig = {arg:[2,1], rtn:true, min:1, dim:0};
	L2.P.merge = function(ac,B,bc,ops) {
		var i, j, k, val, tmp, v, R, vr, vrk; 
		var sft, aJSO, bJSO, indA, indB, nInd, indLeft, indRight, entA, entB;
		var join = 'inner';
		var leftPrefix = '';
		var rightPrefix = '';
		var A = this;
		var vc = A.c + B.c;
		L2.assert.dataMatrix(A);
		L2.assert.dataMatrix(B);
		if (arguments.length === 4) {
			if (!L2.ge.isDict(ops)) throw new Error('dictionary expected');
			for (i in ops.rk) {
				val = ops.v[ops.rk[i]];
				if (i === 'join') {
					if (['inner','outer','left','right','cross'].indexOf(val) === -1) {
						throw new Error('invalid join type') }
					join = val }
				else if (i === 'leftPrefix')  leftPrefix  += val;
				else if (i === 'rightPrefix') rightPrefix += val;
				else throw new Error('invalid merge option') } }
		if (A.ck && !B.ck) throw new Error('second table does not have column keys');
		//cross join is special - join cols neither used nor checked
		if (join === 'cross') {  //repeat each row of A B.r times, repeat B A.r times
			vr = A.r * B.r;
			v = new Array(vr * vc);
			for (k=0; k<A.c; k++) {
				for (j=0; j<A.r; j++) {
					tmp = A.v[A.r*k + j];
					sft = k*vr + B.r*j;
					for (i=0; i<B.r; i++) v[sft + i] = tmp } }
			for (k=0; k<B.c; k++) {
				for (j=0; j<A.r; j++) {
					sft = (A.c + k)*vr + B.r*j;
					for (i=0; i<B.r; i++) v[sft + i] = B.v[k*B.r + i] } } }
		else {
			//process join columns
			function rangeJSO(n) {
				var jso = {};
				for (var i=0; i<n; i++) jso[i] = i;
				return jso }
			function colJSO(X,c) {  //property is a row ind if key appears once, else a jsa of row inds 
				var curr, tmp;
				var jso = {};
				for (var i=0; i<X.r; i++) {
					tmp = X.v[X.r*c + i];
					curr = jso[tmp];
					if (curr === undefined) jso[tmp] = i;
					else if (typeof curr === 'number') jso[tmp] = [curr, i];
					else curr.push(i) }
				return jso }
			if (ac === undefined) aJSO = A.rk || rangeJSO(A.r);
			else {
				ac = A._getInd(ac,'c');
				aJSO = colJSO(A,ac) }
			if (bc === undefined) {
				if (B.rk) {  //copy keys jso since delete from bJSO below
					bJSO = {};
					for (i in B.rk) bJSO[i] = B.rk[i] }
				else bJSO = rangeJSO(B.r) }
			else {
				bc = B._getInd(bc,'c');
				bJSO = colJSO(B,bc) }
			//row inds of A and B to join
			indA = [];
			indB = [];
			indLeft = [];
			indRight = [];
			for (i in aJSO) {
				entA = aJSO[i];
				entB = bJSO[i];
				if (typeof entA === 'number') {
					if (entB === undefined) indLeft.push(entA); 
					else {
						if (typeof entB === 'number') {
							indA.push(entA);
							indB.push(entB) }
						else { //entB a jsa
							for (j=0; j<entB.length; j++) {
								indA.push(entA);
								indB.push(entB[j]) } }
						delete bJSO[i] } }
				else {  //entA a jsa
					if (entB === undefined) {
						for (j=0; j<entA.length; j++) indLeft.push(entA[j]) }
					else {
						if (typeof entB === 'number') {
							for (j=0; j<entA.length; j++) {
								indA.push(entA[j]);
								indB.push(entB) } }
						else { //entB a jsa
							for (j=0; j<entA.length; j++) {
								for (k=0; k<entB.length; k++) {
									indA.push(entA[j]);
									indB.push(entB[k]) } } }
						delete bJSO[i] } } }          
			if (join === 'right' || join === 'outer') {
				for (i in bJSO) {
					entB = bJSO[i];
					if (typeof entB === 'number') indRight.push(entB);
					else {  //entB a jsa
						for (j=0; j<entB.length; j++) indRight.push(entB[j]) } } }          
			//create and fill v
			nInd = indA.length;
			vr = nInd;
			switch (join) {
				case 'left':   vr += indLeft.length; break;
				case 'right':  vr += indRight.length; break;
				case 'outer':  vr += indLeft.length + indRight.length; break }
			v = new Array(vr * vc);
			for (j=0; j<A.c; j++)  for (i=0; i<nInd; i++)  v[j*vr + i] = A.v[j*A.r + indA[i]];
			for (j=0; j<B.c; j++)  for (i=0; i<nInd; i++)  v[(A.c + j)*vr + i] = B.v[j*B.r + indB[i]];   
			sft = nInd;
			if (join === 'left' || join === 'outer') {
				for (j=0; j<A.c; j++)  {
					k = j*vr + nInd
					for (i=0; i<indLeft.length; i++)  v[k + i] = A.v[j*A.r + indLeft[i]] }
				sft += indLeft.length }
			if (join === 'right' || join === 'outer') {
				for (j=0; j<B.c; j++)  {
					k = (A.c + j)*vr + sft;
					for (i=0; i<indRight.length; i++) v[k + i] = B.v[j*B.r + indRight[i]] } } }
		R = new L2.ArJSA(v);
		R.r = vr;
		R.c = vc;
		if ((join === 'inner' || join === 'left') && bc === undefined) {  //use row extras of A
			if (A.rk) {
				vrk = new Array(nInd + indLeft.length);
				for (i=0; i<nInd; i++) vrk[i] = A.ra[indA[i]];
				if (join === 'left') for (i=0; i<indLeft.length; i++) vrk[nInd + i] = A.ra[indLeft[i]];
				else vrk.length = nInd;
				R._setKey('r',vrk) }
			if (A.e) {
				if (A.e.rl) R['label:']('r', A.e.rl);
				if (A.e.rf) R['fmt:']('r', A.e.rf) } }
		if (A.ck) {
			R['key:']('c', undefined, new L2.ArJSA(
				(leftPrefix  ? A.ca.map(function(x) {return leftPrefix  + x}) : A.ca).concat(
				(rightPrefix ? B.ca.map(function(x) {return rightPrefix + x}) : B.ca)))) }
		if (A.pk) R._setKey('p',[A.pa[0]]);
		if (A.e) {
			if (A.e.pl) R['label:']('p', A.e.pl);
			if (A.e.pf) R['fmt:']('p', A.e.pf) }
		return R };
	L2.P.merge.sig = {arg:[1,2,1,2], rtn:true, min:3, dim:0};

	//inside
	L2.P.inside = function(shp,X,mrgn) {
		var testPoint = {  //all args treated as numbers (assumes mrgn is a number), abs values of widths and heights used
			rect:    function(xx,yy,x,y,w,h,mrgn) { return xx >= x-mrgn && yy >= y-mrgn && xx <= (+x)+Math.abs(w)+mrgn && yy <= (+y)+Math.abs(h)+mrgn },
			circle:  function(xx,yy,x,y,w,filler,mrgn) { return Math.sqrt(Math.pow(xx-x,2) + Math.pow(yy-y,2)) <= Math.abs(w)/2+mrgn },
			ellipse: function(xx,yy,x,y,w,h) { return Math.pow((xx-x)/(w/2),2) + Math.pow((yy-y)/(h/2),2) <= 1 },
			segment: function(xx,yy,x1,y1,x2,y2,mrgn) {
				if (testPoint.circle(xx,yy,x1,y1,0,undefined,mrgn) || testPoint.circle(xx,yy,x2,y2,0,undefined,mrgn)) return true;
				var segLen = Math.sqrt(Math.pow(y2-y1,2) + Math.pow(x2-x1,2));
				var scaProj = ((xx-x1)*(x2-x1) + (yy-y1)*(y2-y1))/segLen;
				return scaProj >= 0 && scaProj <= segLen && Math.abs((y2-y1)*xx - (x2-x1)*yy + x2*y1 - y2*x1)/segLen <= mrgn },
			polygon: function(xx,yy,P) { //P is a 2-col matrix; alg based on https://github.com/substack/point-in-polygon
				var v = P.v;
				var isIn = false;
				var i, j, yi, yj;
				yy = +yy;
				for (i=0, j=P.r-1; i<P.r; j=i++) {
					yi = v[i + P.r];
					yj = v[j + P.r];
					if (((yi > yy) !== (yj > yy)) && (xx < (v[j] - v[i]) * (yy - yi) / (yj - yi) + (+v[i]))) isIn = !isIn }
				return isIn },
			polyline: function(xx,yy,P,mrgn) { //P is a 2-col matrix
				for (var i=0; i<P.r-1; i++) { if (testPoint.segment(xx, yy, P.v[i], P.v[i + P.r], P.v[i + 1], P.v[i + 1 + P.r], mrgn)) return true }
				return false } };
		var i, j, R, tmp, tmp_0, tmp_1, tmp_2, tmp_3, test;
		function copyDimExtras(A,da,B,db) {
			if (A.z) {
				if (A[da + 'k']) B._copyKey(A,db,da);
				if (A.e) {
					B['label:'](db, A.e[da + 'l']);
					B['fmt:'](  db, A.e[da + 'f']) } } }
		function copyExtras(Pt,Sh,Re) {
			copyDimExtras(Pt,'r',Re,'r');
			copyDimExtras(Pt,'p',Re,'p');
			if (Sh) copyDimExtras(Sh,'r',Re,'c') }
		if (this.c !== 2 || this.p !== 1) throw new Error('2-column matrix expected');
		test = testPoint[shp];
		if (!test) throw new Error('invalid shape name');
		if (arguments.length > 2) {
			if (shp === 'polygon' || shp === 'ellipse') throw new Error('cannot use a margin with \'' + shp + '\'');
			else mrgn = +mrgn }
		else mrgn = 0;  
		if (shp === 'polygon' || shp === 'polyline') {
			if (L2.aux.polyData(X) === 'boxed') {
				R = new L2.ArFast(this.r, X.r, 1);
				for (j=0; j<X.r; j++) {
					tmp = X.v[j].___L2B;
					for (i=0; i<this.r; i++) {
						R.v[i + j*this.r] = test(this.v[i], this.v[i + this.r], tmp, mrgn) } } }  //mrgn ignored by polygon test
			else { //unboxed poly, a 2-col matrix
				R = new L2.ArFast(this.r, 1, 1);
				for (i=0; i<this.r; i++) R.v[i] = test(this.v[i], this.v[i + this.r], X, mrgn);
				copyExtras(this,undefined,R);
				return R } } //return early since extras treated differently
		else {
			if (X.p !== 1) throw new Error('matrix expected'); 
			if ((shp === 'circle' && X.c !== 3) || (shp !== 'circle' && X.c !== 4)) throw new Error('wrong number of columns for given shape');
			R = new L2.ArFast(this.r, X.r, 1);
			//always pass 7 args; 'circle': 4th col of X does not exist (undefined is passed); 'ellipse': mrgn ignored in test function
			for (j=0; j<X.r; j++) {
				tmp_0 = X.v[j];   tmp_1 = X.v[j + X.r];   tmp_2 = X.v[j + 2*X.r];   tmp_3 = X.v[j + 3*X.r];
				for (i=0; i<this.r; i++) R.v[i + j*this.r] = test( this.v[i], this.v[i + this.r], tmp_0, tmp_1, tmp_2, tmp_3, mrgn) } }
		copyExtras(this,X,R);
		return R };
	L2.P.inside.sig = {arg:[1,2,1], rtn:true, min:2, dim:0};

	//linear algebra
	//matrix multiply; extras: this row -> return row, B col -> return col, this page -> return page if this pages not repeated
	L2.P.mm = function(B) {
		var A = new L2.ArTp(this);  //transpose first arg so access consecutive blocks of both args in inner loop
		var i, j, k, m, x, stA, stB, multA, multB;
		var nP = (A.p === 0 || B.p === 0 ? 0 : Math.max(A.p,B.p));
		var nR = A.c,  nC = B.c,  nK = A.r,  nN = nR*nC*nP;
		var R = new L2.ArFast(nR,nC,nP);
		this._twoMatExtras(B,R);	
		if (nK !== B.r || !(A.p === 1 || B.p === 1 || A.p === B.p)) throw new Error(L2.errorMsg.shapeMismatch);
		if (nK === 0 || nR === 0 || nC === 0 || nP === 0) return R;  //most important to catch nK === 0 since R has entries that should be undef not 0
		multA = (A.p === 1 ? 0 : nR*nK);
		multB = (B.p === 1 ? 0 : nK*nC);
		for (m=0; m<nP; m++) {
			for (j=0; j<nC; j++) {
				stB = j*nK + m*multB;
				for (i=0; i<nR; i++) {
					stA = i*nK + m*multA;
					x = 0.0;
					for (k=0; k<nK; k++) x += A.v[stA + k]*B.v[stB + k];
					R.v[i + j*nR + m*nR*nC] = x } } }
		return R };
	L2.P.mm.sig = {arg:[2], rtn:true, min:1, dim:0};
	//outer, all pairs of rows; extras: this row -> return row, B row -> return col, this page -> return page if this pages not repeated
	L2.P.outer = function(B,f) {	
		L2.assert.func(f);
		var i, j, m, rowThis, rowB, allRowsThis, allRowsB, pTable;
		var nP = (this.p === 0 || B.p === 0 ? 0 : Math.max(this.p,B.p));
		var nR = this.r,  nC = B.r, nN = nR*nC*nP;
		var R = new L2.ArFast(nR,nC,nP);
		this._twoMatExtras(B,R,true);
		if (this.c !== B.c || !(this.p === 1 || B.p === 1 || this.p === B.p)) throw new Error(L2.errorMsg.shapeMismatch);	
		if (R.v.length === 0) return R;  //if this and B have no cols, still compute entry - func may doing something with extras or have side effects
		if (nP === 1) { //this.p === B.p === 1
			allRowsB = new Array(nC);
			for (j=0; j<nC; j++) 	allRowsB[j] = B._oneDimSc('r',j); //avoid getting row repeatedly - does mean storing copy of each row of B
			for (i=0; i<nR; i++) {
				rowThis = this._oneDimSc('r',i);
				for (j=0; j<nC; j++)  R.v[i + j*nR] = L2.boxIfTab(f(rowThis, allRowsB[j])) } }
		else if (this.p === 1) { //B.p > 1
			allRowsThis = new Array(nR);
			for (i=0; i<nR; i++)	allRowsThis[i] = this._oneDimSc('r',i);
			for (m=0; m<nP; m++) {
				pTable = new L2.ArJSA([m]);
				for (j=0; j<nC; j++) {
					rowB = B._twoDim('r', 'p', new L2.ArJSA([j]), pTable);
					for (i=0; i<nR; i++)  R.v[i + j*nR + m*nR*nC] = L2.boxIfTab(f(allRowsThis[i], rowB)) } } }
		else if (B.p === 1) { //this.p > 1
			allRowsB = new Array(nC);
			for (j=0; j<nC; j++) 	allRowsB[j] = B._oneDimSc('r',j);
			for (m=0; m<nP; m++) {
				pTable = new L2.ArJSA([m]);
				for (i=0; i<nR; i++) {
					rowThis = this._twoDim('r', 'p', new L2.ArJSA([i]), pTable);
					for (j=0; j<nC; j++) R.v[i + j*nR + m*nR*nC] = L2.boxIfTab(f(rowThis, allRowsB[j])) } } }
		else { //this.p === B.p, >1
			allRowsB = new Array(nC);
			for (m=0; m<nP; m++) {
				pTable = new L2.ArJSA([m]);
				for (j=0; j<nC; j++) allRowsB[j] = B._twoDim('r','p',new L2.ArJSA([j]), pTable);
				for (i=0; i<nR; i++) {
					rowThis = this._twoDim('r', 'p', new L2.ArJSA([i]), pTable);
					for (j=0; j<nC; j++)  R.v[i + j*nR + m*nR*nC] = L2.boxIfTab(f(rowThis, allRowsB[j])) } } }
		return R };
	L2.P.outer.sig = {arg:[2,1], rtn:true, min:2, dim:0};
	L2.P.inv = function() {
		var i,X,A;
		if (this.r !== this.c) throw new Error('matrix must be square');
		X = L2.linAlg.matrix(this);
		for (i=0; i<this.p; i++) X[i] = numeric.inv(X[i]);
		A = L2.linAlg.unmatrix(X, this.r, this.c, this.p);
		L2.linAlg.copyPageExtras(this,A);
		return A }
	L2.P.inv.sig = {arg:[], rtn:true, min:0, dim:0};
	L2.P.det = function() {
		var i,X,v,A,e;
		if (this.r !== this.c) throw new Error('matrix must be square');
		X = L2.linAlg.matrix(this);
		v = new Array(this.p);
		for (i=0; i<this.p; i++) {
			e = numeric.det(X[i]);
			if (typeof e !== 'number') throw new Error('number expected');
			v[i] = e }
		A = new L2.ArJSA(v);
		A.r = A.c = 1;
		A.p = this.p;
		L2.linAlg.copyPageExtras(this,A);
		return A }
	L2.P.det.sig = {arg:[], rtn:true, min:0, dim:0};
	L2.P.svd = function() {
		var i,j,k,X,jso,U,sv,V,c,p,tmp,A;
		if (this.r < this.c) throw new Error('number of rows must be ≥ number of columns');  //numeric.svd() unreliable if r < c
		X = L2.linAlg.matrix(this);
		c = this.c;
		p = this.p;
		U = new Array(p);
		sv = new Array(c*p);
		V = new Array(p);
		for (k=0, i=0; i<p; i++) {
			jso = numeric.svd(X[i]);
			U[i] = jso.U;
			V[i] = jso.V;
			for (j=0; j<c; j++, k++) sv[k] = jso.S[j] }
		A = new L2.ArJSA(new Array(3));
		A['key:']('r', undefined, new L2.ArJSA(['U','S','V']));
		tmp = L2.linAlg.unmatrix(U,this.r,c,p);  L2.linAlg.copyPageExtras(this,tmp);  A.v[0] = new L2.Box(tmp);
		tmp = L2.linAlg.unmatrix(V,     c,c,p);  L2.linAlg.copyPageExtras(this,tmp);  A.v[2] = new L2.Box(tmp);
		tmp = new L2.ArJSA(sv);
		tmp.r = c;
		tmp.p = p;
		L2.linAlg.copyPageExtras(this,tmp);
		A.v[1] = new L2.Box(tmp);
		return A };  
	L2.P.svd.sig = {arg:[], rtn:true, min:0, dim:0};

	//linear algebra: basic funcs and helper funcs so can use numeric.js funcs
	L2.linAlg = {

		//a,a->undefined, copy page extras from X to Y, no checks that shapes match, only called internally
		copyPageExtras: function(X,Y) {
			if (X.pk) Y._copyKey(X,'p','p');
			if (X.e && (X.e.pl || X.e.pf)) {
				Y.z = true;
				Y.e = Y.e || {};
				if (X.e.pl) Y.e.pl = X.e.pl;
				if (X.e.pf) Y.e.pf = X.e.pf } },

		//s->a, identity matrix
		eye: function(r) {
			var n,v,i,A,rPl;
			r = +r;
			L2.assert.posInt(r);
			n = r*r;
			v = new Array(n);
			rPl = r + 1;
			for (i=0; i<n; i++) v[i] = 0;
			for (i=0; i<n; i+=rPl) v[i] = 1;
			A = new L2.ArJSA(v);
			A.r = A.c = r;
			return A },

		//a->js array-of-arrays-of-arrays, convert numeric-L2-matrices to JS matrices, extras ignored
		matrix: function(A) {
			var i,j,k,X,R,e,rc;
			if (A.v.length === 0) throw new Error('cannot convert empty table to matrix');
			rc = A.r*A.c;
			X = new Array(A.p);
			for (k=0; k<A.p; k++) {
				X[k] = new Array(A.r);
				for (i=0; i<A.r; i++) {
					R = X[k][i] = new Array(A.c);
					for (j=0; j<A.c; j++) {
						e = A.v[k*rc + j*A.r + i];
						if (typeof e !== 'number') throw new Error('entry must be a number');
						R[j] = e } } }
				return X },
		//js array-of-arrays-of-arrays[,s,s,s] -> a, convert numeric-JS-matrices to numeric-L2-matrices
		//	-optional r, c and p	(non-neg ints, not chkd) are expected number of rows/cols/pages
		unmatrix: function(X,r,c,p) {
			var i,j,k,v,R,A,e,rc;
			if (p !== undefined) { if (p !== X.length)       throw new Error('unexpected number of pages') }
			else p = X.length;
			if (r !== undefined) { if (r !== X[0].length)    throw new Error('unexpected number of rows') }
			else r = X[0].length;
			if (c !== undefined) { if (c !== X[0][0].length) throw new Error('unexpected number of columns') }
			else c = X[0][0].length;
			if (r*c*p === 0) throw new Error('cannot convert empty matrix');
			rc = r*c;
			v = new Array(r*c*p);
			for (k=0; k<p; k++) {
				if (X[k].length !== r) throw new Error('all pages must have same number of rows')
				for (i=0; i<r; i++) {
					R = X[k][i];
					if (R.length !== c) throw new Error('all rows must have same number of columns');
					for (j=0; j<c; j++) {
						e = R[j];
						if (typeof e !== 'number') throw new Error('entry must be a number');
						v[i + j*r + k*rc] = e } } }
			A = new L2.ArJSA(v);
			A.r = r;
			A.c = c;
			A.p = p;
			return A }

	}

	///// NON-STANDARD ARRAY PROTO FUNCTIONS /////
	//no sig, start names with _ so cannot be called as standard proto func accidentally from parser

	//add extras to result table for linear alg funcs of two tables
	//this and U are the orig tables, X is the result, outer is true if called from
	//L2.P.outer - use row extras of U as col extras of X
	L2.P._twoMatExtras = function(U,X,outer) {
		var i,cl,cf,du;
		var tmp = {};
		if (this.z) {
			if (this.rk) X._copyKey(this,'r','r');
			if (this.pk && this.p === X.p) X._copyKey(this,'p','p');
			if (this.e) {
				if (this.e.rl) tmp.rl = this.e.rl;
				if (this.e.rf) tmp.rf = this.e.rf;
				if (this.p === X.p) {
					if (this.e.pl) tmp.pl = this.e.pl;
					if (this.e.pf) tmp.pf = this.e.pf } }
			X.z = true }
		if (U.z) {
			du = outer ? 'r' : 'c';
			if (U[du + 'k']) X._copyKey(U,'c',du);
			if (U.e) {
				if (cl = outer ? U.e.rl : U.e.cl) tmp.cl = cl;
				if (cf = outer ? U.e.rf : U.e.cf) tmp.cf = cf }
			X.z = true }
		if (!L2.aux.isEmpty(tmp)) X.e = tmp };

	//shell
	//[s]->a, copies extras and shape, all vals are s or undefined
	L2.P._shell = function(s) { 
		var R = new L2.ArShell(this);
		R.v = new Array(R.r*R.c*R.p);
		if (s !== undefined) for (var i=0, n=R.r*R.c*R.p; i<n; i++) R.v[i] = s;
		return R };

	//s->a, remove unwanted extras from table returned by reduction op
	L2.P._remRedExtras = function(d) {
			if (this.e) {
			delete this.e[d + 'l'];		delete this.e[d + 'f'];   delete this.e.ef; 		delete this.e.t;		delete this.e.i;
			if (L2.aux.isEmpty(this.e)) delete this.e }
			return this };  

	//wrap and reduce
	//s[,s]->a, d: dim ('r' 'c' 'p' 'e' - not chkd), f: func (not chkd) applied to each fiber if passed, else wrap each fiber 
	L2.P._wrapReduce = function(d,f) {
		var addEx, apply_f, this_da, this_dl, this_df, this_ef, R, i, j, k, m, q, w, u, tmp, epp;
		if (d === 'e') {
			m = this.v.length;
			tmp = new Array(m);
			for (i=0; i<m; i++) tmp[i] = this.v[i];
			tmp = new L2.ArJSA(tmp);
			return new L2.ArJSA([ f ? L2.boxIfTab(f(tmp)) : new L2.Box(tmp) ]) }
		if (this[d + 'a']) this_da = L2.aux.shallowCopyJSA(this[d + 'a']);
		if (this.e) {
			this_dl = this.e[d + 'l'];   this_df = this.e[d + 'f'];   this_ef = this.e.ef;
			addEx = function(A) {
				if (this_dl) A['label:'](d,this_dl);
				if (this_df) A['fmt:'](d,this_df);
				if (this_ef) A['fmt:']('e',this_ef);
				if (this_da) A._setKey(d,L2.aux.shallowCopyJSA(this_da));
				return A } }
		else if (this_da) {
			addEx = function(A) {
				A._setKey(d,L2.aux.shallowCopyJSA(this_da));
				return A } }
		if (f) apply_f = addEx ? function(A) {return L2.boxIfTab(f(addEx(A)))} : function(A) {return L2.boxIfTab(f(A))};
		R = (new L2.ArShell(this,d))._remRedExtras(d);
		m = 0;
		epp = R.r*R.c;
		if (d === 'r') {
			i = j = 0;
			k = R.c*R.p;
			R.v = new Array(k);
			while (m<k) {
				for (tmp=new Array(R.r), q=0, j+=R.r; i<j; i++) tmp[q++] = this.v[i];
				tmp = new L2.ArJSA(tmp);
				R.v[m++] = f ? apply_f(tmp) : new L2.Box(tmp) } }
		else if (d === 'c') {
			R.v = new Array(R.r*R.p);
			for (k=0; k<R.p; k++) {
				q = k * epp;
				w = q + epp;
				for (i=0; i<R.r; i++) {
					for (tmp=new Array(R.c), u=0, j=q+i; j<w; j+=R.r) tmp[u++] = this.v[j];
					 tmp = new L2.ArJSA(tmp);
					 tmp.r = 1;
					 tmp.c = R.c;
					R.v[m++] = f ? apply_f(tmp) : new L2.Box(tmp) } } }
		else {
			R.v = new Array(epp);
			j = this.v.length; 
			for (i=0; i<epp; i++) {
				for (tmp=new Array(R.p), q=0, k=i; k<j; k+=epp) tmp[q++] = this.v[k];
				 tmp = new L2.ArJSA(tmp);
				 tmp.r = 1;
				 tmp.p = R.p;
				R.v[i] = f ? apply_f(tmp) : new L2.Box(tmp) } }
		R[d] = 1;
		if (!f && addEx) { for (i=0, j=R.v.length; i<j; i++) addEx(R.v[i].___L2B) }
		return R };      

	//number of
	//s->s, called when pass variable dim suffix, d: dimension
	L2.P._n = function(d) {
		d = ('' + d).toLowerCase();
		if (d === 'e') return this.v.length;
		else if (d === 'r' || d === 'c' || d === 'p') return this[d];
		throw new Error('invalid suffix') };

	//append
	//s,s[,s]->a, append scalar s on dim d (not chkd), chg: change array if truthy
	L2.P._appendSc = function(s,d,chg) {
		if ( (d === 'r' && (this.c !== 1 || this.p !== 1)) ||
				 (d === 'c' && (this.r !== 1 || this.p !== 1)) ||
				 (d === 'p' && (this.r !== 1 || this.c !== 1)) ) throw new Error(L2.errorMsg.shapeMismatch);
		if (this[d + 'k']) throw new Error('cannot append scalar on dimension with keys');
		var R = chg ? this : new L2.ArCopy(this,true);
		R.v[R.v.length] = s;
		R[d]++;
		return R };

	//a,s[,s]->a, append array A on dim d (not chkd), chg: change array if truthy
	L2.P._appendAr = function(A,d,chg) {
		var R = chg ? this : new L2.ArShell(this);
		var dk = d + 'k';
		var da = d + 'a';
		var i, j, k, m, n, nj, nk, nR, ps, thisV;
		if ( (d === 'r' && (R.c !== A.c || R.p !== A.p)) ||
				 (d === 'c' && (R.r !== A.r || R.p !== A.p)) ||
				 (d === 'p' && (R.r !== A.r || R.c !== A.c)) ) throw new Error(L2.errorMsg.shapeMismatch);
		if (R[dk]) {
			if (!A[dk]) throw new Error('second table does not have ' + L2.aux.expandDim[d] + ' keys');
			for (i=0; i<A[d]; i++) { if (typeof R[dk][A[da][i]] === 'number') throw new Error(L2.errorMsg.dupKey) }
			R[da].length += A[d];
			for (i=0; i<A[d]; i++) {
				j = R[d] + i;
				k = A[da][i];
				R[dk][k] = j;
				R[da][j] = k } }
		if (d === 'r' && R.c === 1 && R.p === 1 || d ===  'c' && R.p === 1 || d === 'p')  { //simply append entries
			if (!chg) R.v = L2.aux.shallowCopyJSA(this.v);
			nR = R.v.length;
			n = A.v.length;
			R.v.length += n;
			for (i=0; i<n; i++) R.v[nR + i] = A.v[i] }
		else {  //order of entries more complex, create .v jsa from scratch even if chg truthy
			if (d === 'r')  { ps = R.c*R.p;   nj = R.r;           nk = A.r        }
			if (d === 'c')  { ps = R.p;       nj = R.r*R.c;       nk = A.r*A.c    }
			if (d === 'p')  { ps = 1;         nj = R.v.length;    nk = A.v.length }
			thisV = this.v;
			R.v = new Array(thisV.length + A.v.length);
			i = j = k = m = 0;
			for (; i<ps; i++) {
				for (n=j+nj; j<n; j++) R.v[m++] = thisV[j];
				for (n=k+nk; k<n; k++) R.v[m++] = A.v[k] } }
		R[d] += A[d];
		return R };

	//dictionary ent, add/change
	//s,s->a, change/add entry to dictionary (@: .a:)
	L2.P._dPush = function(k,v) {
		var n;
		if (!this.rk || this.c !== 1 || this.p !== 1) throw new Error('dictionary expected');
		if (k === undefined) throw new Error(L2.errorMsg.undefAsKey);
		var i = this.rk[k];
		if (typeof i === 'number') this.v[i] = v;
		else {
			n = this.v.length;
			this.rk[k] = n;
			this.v[n] = v;
			this.ra[n] = '' + k;
			this.r++ }
		return this };
	//s->s, entry of dict (@ .a)
	L2.P._dEnt = function(k) {
		if (!this.rk || this.c !== 1 || this.p !== 1) throw new Error('dictionary expected');
		if (k === undefined) throw new Error(L2.errorMsg.undefAsKey);
		var i = this.rk[k];
		if (typeof i === 'number') return this.v[i];
		else throw new Error('key does not exist') }

	//random
	//[s]->a
	L2.P._setRand = function(s) {
		var i=0, n=this.v.length;
		if (s !== undefined) {
			L2.assert.nonNegInt(s);
			for (i; i<n; i++) this.v[i] = Math.floor(Math.random()*(1+(+s))); }
		else for (i; i<n; i++) this.v[i] = Math.random();
		return this };

	//length
	// ->a, length of each entry - only meaningful for strings and funcs (number of args expected)
	L2.P._len = function() {
		var R = new L2.ArShell(this);
		var n = this.v.length;
		R.v = new Array(n);
		for (var i=0; i<n; i++) R.v[i] = this.v[i].length;
		return R };

	//index processing
	//  _getInd used for rcp indices so does not throw error if 'this' is empty
	//  _getIndLin used for vector indices so does throw error if 'this' empty  
	//s,s->s, check and return index as nonNegInt, s may be -ve or non-num (key), d: dimension ('r' 'c' 'p' - not chkd)
	L2.P._getInd = function(s,d) {
		if (typeof s === 'number') {
			if (Math.round(s) !== s) throw new Error('integer expected'); //catches NaN
			if (s < 0) s = this[d] + s;
			if (s >= this[d] || s < 0) throw new Error('index out of bounds'); }
		else if (s === undefined) throw new Error(L2.errorMsg.undefAsKey);
		else {		
			switch (d) {
				case 'r': 
					if (!this.rk) throw new Error ('table does not have row keys');
					s = this.rk[s];
					break;
				case 'c': 
					if (!this.ck) throw new Error ('table does not have column keys');
					s = this.ck[s];
					break;
				default:
					if (!this.pk) throw new Error ('table does not have page keys');
					s = this.pk[s];
					break; }
			if (typeof s !== 'number') throw new Error('key does not exist'); }
		return s };

	//s->s, check and return linear index, s can be index (possibly -ve) or key - treated as row key
	L2.P._getIndLin = function(s) {
		var n;
		n = this.v.length;
		if (typeof s === 'number') {
			if (Math.round(s) !== s) throw new Error('integer expected');
			if (s < 0) s = n + s;
			if (s >= n || s < 0) throw new Error('index out of bounds') }
		else {
			if (!this.rk) throw new Error('table does not have row keys');
			if (s === undefined) throw new Error(L2.errorMsg.undefAsKey);
			s = this.rk[s];
			if (typeof s !== 'number' || n === 0) throw new Error('key does not exist or table is empty') }
		return s };

	//s,jsa->s, set all keys on given dim ('r', 'c', 'p' - not checked), k neither copied nor checked
	L2.P._setKey = function(d,k) {
		var n = k.length;
		var kJSO = {};
		for (var i=0; i<n; i++) kJSO[k[i]] = i;
		this[d + 'k'] = kJSO;
		this[d + 'a'] = k;
		this.z = true };

	//s,a,jsa->s, set keys on dim d of this to keys of dim d of A at indices inds (non-neg)
	//  no checks except that no repeats in ind
	L2.P._setKeyFrom = function(d,A,ind) {
		var n = ind.length;
		var this_dk = {};
		var this_da = new Array(n);
		var i, k;
		var A_da = A[d + 'a'];
		for (i=0; i<n; i++) {
			k = A_da[ind[i]];
			if (typeof this_dk[k] === 'number') throw new Error (L2.errorMsg.dupKey);
			this_dk[k] = i;
			this_da[i] = k }
		this[d + 'k'] = this_dk;
		this[d + 'a'] = this_da;
		this.z = true };

	//a,s,s->s, copy keys of A on dim dA to dim dThis of this, does not check dim lengths are same
	L2.P._copyKey = function(A,dThis,dA) {
		var i, tmp, this_da, this_dk;
		var A_da = A[dA + 'a'];
		var n = A_da.length;
		this[dThis + 'a'] = this_da = new Array(n);
		this[dThis + 'k'] = this_dk = {};
		for (i=0; i<n; i++) {
			tmp = A_da[i];
			this_da[i] = tmp;
			this_dk[tmp] = i }
		this.z = true };

	//entry
	//s,s,s[,s]->a, set entry, last arg is new value, missing p assumed 0
	L2.P['_e:'] = function(r,c,p,y) {
		if (this.v.length === 0) throw new Error ('non-empty table expected');
		if (arguments.length === 3) this.v[this._getInd(r,'r') + this._getInd(c,'c')*this.r] = p;
		else                        this.v[this._getInd(r,'r') + this._getInd(c,'c')*this.r + this._getInd(p,'p')*this.r*this.c] = y;
		return this };
	//s,s[,s]->s, get entry, missing p assumed 0
	L2.P._e = function(r,c,p) {
		if (this.v.length === 0) throw new Error ('non-empty table expected');
		if (arguments.length === 2) return this.v[this._getInd(r,'r') + this._getInd(c,'c')*this.r];
		else                        return this.v[this._getInd(r,'r') + this._getInd(c,'c')*this.r + this._getInd(p,'p')*this.r*this.c] }
	//s->s, get entry using vector index (may be -ve),  key assumed a row key
	L2.P._vEnt = function(i) {return this.v[this._getIndLin(i)]};
	//s,s->a, set entry using vector index  
	L2.P['_vEnt:'] = function(i,x) {
		this.v[this._getIndLin(i)] = x;
		return this };
	// fast entry using indices
	//  -indices converted to numbers (explicitly if reqd) 
	//  -check inds in correct range - or risk of combining invalid rcp inds into valid vector ind
	//s,s->s, checks that i is a valid index for dim of length len, returns boolean
	L2.P._slashCheckInd = function(i,len) {return i >= 0 && i < len && Math.round(i) === i};
	//s,s->s, get entry at row r, column c, page 0, treat args as indices
	L2.P._slashEnt2 = function(r,c) {
		r = +r;  c = +c;
		if ( this._slashCheckInd(r,this.r) && 
				 this._slashCheckInd(c,this.c) ) return this.v[ r + c*this.r ] }
	//s,s,s->s, as _slashEnt2(), but also expects page index
	L2.P._slashEnt3 = function(r,c,p) {
		r = +r;  c = +c;  p = +p;
		if ( this._slashCheckInd(r,this.r) &&
				 this._slashCheckInd(c,this.c) &&
				 this._slashCheckInd(p,this.p) ) return this.v[ r + c*this.r + p*this.r*this.c] };
	//s,s->a, fast set entry using vector index
	L2.P['_slashEnt1:'] = function(i,x) {  
		i = +i;
		if ( this._slashCheckInd(i,this.v.length) ) this.v[i] = x;
		return this }
	//s,s,s->a, fast set entry at row r, col c, page 0
	L2.P['_slashEnt2:'] = function(r,c,x) {
		r = +r;  c = +c;
		if ( this._slashCheckInd(r,this.r) && 
				 this._slashCheckInd(c,this.c) &&
				 this.p !== 0 ) this.v[ r + c*this.r ] = x;
		return this }
	//s,s,s,s->a, fast set entry at row r, col c, page p
	L2.P['_slashEnt3:'] = function(r,c,p,x) {
		r = +r;  c = +c;  p = +p;
		if ( this._slashCheckInd(r,this.r) && 
				 this._slashCheckInd(c,this.c) &&
				 this._slashCheckInd(p,this.p) ) this.v[ r + c*this.r + p*this.r*this.c] = x;
		return this }
	//fast entry using keys
	//s->s, passed row key, uses 1st col and 1st page
	L2.P._barEnt1 = function(rk)       {return this.v[ this.rk[rk] ]};
	//s,s->s, passed row key and col key, uses 1st page
	L2.P._barEnt2 = function(rk,ck)    {return this.v[ this.rk[rk] + this.ck[ck]*this.r ]};
	//s,s,s->s, passed row key, col key and page key
	L2.P._barEnt3 = function(rk,ck,pk) {return this.v[ this.rk[rk] + this.ck[ck]*this.r + this.pk[pk]*this.r*this.c ]};
	//s,s->s, set entry at row key rk, col 0, page 0
	L2.P['_barEnt1:'] = function(rk,x) {
		var r = this.rk[rk];
		if (this.v.length !== 0 && typeof r === 'number') this.v[r] = x;
		return this }
	//s,s,s->s, set entry at row key rk, col ck, page 0
	L2.P['_barEnt2:'] = function(rk,ck,x) {
		var r = this.rk[rk],  c = this.ck[ck];
		if (this.p !== 0 && typeof r === 'number' && typeof c === 'number') this.v[r + c*this.r] = x;
		return this }
	//s,s,s,s,->s, set entry at row key rk, col ck, page pk
	L2.P['_barEnt3:'] = function(rk,ck,pk,x) {
		var r = this.rk[rk],  c = this.ck[ck],  p = this.pk[pk];
		if (typeof r === 'number' && typeof c === 'number' && typeof p === 'number') this.v[r + c*this.r + p*this.r*this.c] = x;
		return this }

	//vector from vector indices
	//s/a[,s/a]->a, set using linear index, if one arg, x is new value(s), if two args, x is inds/keys to chg, y is new values 
	L2.P['_v:'] = function(x,y) {
		var n = this.v.length;
		var i, nX;
		if (arguments.length === 1) {
			if (L2.aTab(x)) {
				nX = x.v.length;
				if (nX === 1) for (i=0; i<n; i++) this.v[i] = x.v[0];
				else if (nX === n) for (i=0; i<n; i++) this.v[i] = x.v[i];
				else throw new Error(L2.errorMsg.shapeMismatch); }
			else for (i=0; i<n; i++) this.v[i] = x; }
		else if (L2.aTab(x)) {
			nX = x.v.length;
			var newX = new Array(nX);  //cannot change any entries of this b4 sure no index errors
			for (i=0; i<nX; i++) newX[i] = this._getIndLin(x.v[i]); 
			if (L2.aTab(y)) {
				var nY = y.v.length;
				if (nY === 1) for (i=0; i<nX; i++) this.v[newX[i]] = y.v[0];
				else if (nY === nX) for (i=0; i<nX; i++) this.v[newX[i]] = y.v[i];
				else throw new Error(L2.errorMsg.shapeMismatch); }
			else for (i=0; i<nX; i++) this.v[newX[i]] = y; }
		else {
			if (L2.aTab(y)) {
				if (y.v.length !== 1) throw new Error(L2.errorMsg.shapeMismatch);
				y = y.v[0] }
			this.v[ this._getIndLin(x) ] = y; }
		return this };
	//[s/a]->a, get using linear index, if no args, get all, if one arg, it is the inds/keys
	L2.P._v = function(x) {
		var i, R, nX;
		var n = this.v.length;
		if (arguments.length === 0) return new L2.ArJSA(L2.aux.shallowCopyJSA(this.v));
		else if (L2.aTab(x)) {
			nX = x.v.length;
			R = new L2.Ar(nX,undefined,true);
			for (i=0; i<nX; i++) R.v[i] = this.v[ this._getIndLin(x.v[i]) ];
			return R; }
		else return new L2.ArJSA([ this.v[ this._getIndLin(x) ] ]); };
	//a,a,a/s[,a/s]->a, set entries using rcp indices, last arg passed is new values (only this can be scalar), page default 0
	L2.P['_vrcp:'] = function(R,C,P,Y) {
		var i, n, nY, newX, val;
		n = R.v.length;
		if (C.v.length !== n) throw new Error(L2.errorMsg.shapeMismatch);
		newX = new Array(n);  //below, get all inds and check are valid b4 change any entries of this
		if (arguments.length > 3) {  //pages given
			if (P.v.length !== n) throw new Error(L2.errorMsg.shapeMismatch);
			for (i=0; i<n; i++) newX[i] = this._getInd(R.v[i],'r') + this._getInd(C.v[i],'c')*this.r + this._getInd(P.v[i],'p')*this.r*this.c }
		else { //use page 0
			if (this.p === 0 && n !== 0) throw new Error ('non-empty table expected');
			for (i=0; i<n; i++) newX[i] = this._getInd(R.v[i],'r') + this._getInd(C.v[i],'c')*this.r;
			Y = P }
		if (L2.aTab(Y)) {
			nY = Y.v.length;
			if (nY === 1) {
				val = Y.v[0];
				for (i=0; i<n; i++) this.v[newX[i]] = val }
			else if (nY === n) for (i=0; i<n; i++) this.v[newX[i]] = Y.v[i];
			else throw new Error(L2.errorMsg.shapeMismatch) }
		else for (i=0; i<n; i++) this.v[newX[i]] = Y;
		return this }
	//a,a[,a]->a, get entries using rcp indices (ie scattered indices), page default 0
	L2.P._vrcp = function(R,C,P) {
		var i, n, v;
		n = R.v.length;
		if (C.v.length !== n) throw new Error(L2.errorMsg.shapeMismatch);
		v = new Array(n);
		if (arguments.length > 2) {
			if (P.v.length !== n) throw new Error(L2.errorMsg.shapeMismatch); 
			for (i=0; i<n; i++) v[i] = this.v[this._getInd(R.v[i],'r') + this._getInd(C.v[i],'c')*this.r + this._getInd(P.v[i],'p')*this.r*this.c] }
		else {
			if (this.p === 0 && n !== 0) throw new Error ('non-empty table expected');
			for (i=0; i<n; i++) v[i] = this.v[this._getInd(R.v[i],'r') + this._getInd(C.v[i],'c')*this.r] }
		return new L2.ArJSA(v) };

	//subtable
	//s,s,[s]->a, get single row/col/page, d: dim - not chkd, x: ind/key to get, cut: if 'cut' (chkd) remove from array
	L2.P._oneDimSc = function(d,x,cut) {
		if (arguments.length >= 3 && cut !== 'cut') throw new Error('argument must be \'cut\'');
		var R = new L2.ArShell(this,d);
		var dk = d + 'k';
		var da = d + 'a';
		var ind, xInd, xKey, i, j, k, m=0, tmp, epp=R.r*R.c, newV;
		xInd = this._getInd(x,d);
		if (this[dk]) {
			xKey = typeof x === 'number' ? this[da][xInd] : x;
			R[dk] = {};
			R[dk][xKey] = 0;
			R[da] = ['' + xKey];
			if (cut) {
				delete this[dk][xKey];
				for (i=xInd+1; i<this[d]; i++) this[dk][this[da][i]]--;
				this[da].splice(xInd,1) } }
		if (d === 'r') {
			R.v = new Array(R.c*R.p);
			for (k=0; k<R.p; k++) 	for (j=0; j<R.c; j++)		R.v[m++] = this.v[xInd + j*R.r + k*epp];
			if (cut) {
				m = 0;
				newV = new Array(this.v.length - R.v.length);
				for (k=0; k<R.p; k++) 	for (j=0; j<R.c; j++)		for (i=0; i<R.r; i++)	 if (i !== xInd)	newV[m++] = this.v[i + j*R.r + k*epp]; } }
		else if (d === 'c') {
			R.v = new Array(R.r*R.p);
			tmp = xInd*R.r;
			for (k=0; k<R.p; k++) 	for (i=0; i<R.r; i++)   R.v[m++] = this.v[i + tmp + k*epp]; 
			if (cut) {
				m = 0;
				newV = new Array(this.v.length - R.v.length);
				for (k=0; k<R.p; k++) 	for (j=0; j<R.c; j++)		if (j !== xInd)		for (i=0; i<R.r; i++)	 newV[m++] = this.v[i + j*R.r + k*epp]; } }
		else {
			R.v = new Array(epp);
			for (i=xInd*epp; i<(xInd+1)*epp; i++)		R.v[m++] = this.v[i];
			if (cut) {
				m = 0;
				newV = new Array(this.v.length - R.v.length);
				for (i=0; i<xInd*epp; i++)		newV[m++] = this.v[i];
				for (i=(xInd+1)*epp; i<this.v.length; i++)	 newV[m++] = this.v[i]; } }
		R[d] = 1;
		if (cut) {
			this[d]--;
			this.v = newV; }
		return R };

	//s,a,[s]->a, get any number of row/col/page, d: dim - not chkd, X: inds/keys to get, cut: if 'cut' (chkd) remove from array
	L2.P._oneDimAr = function(d,X,cut) {
		if (arguments.length >= 3 && cut !== 'cut') throw new Error('argument must be \'cut\'');
		var nX = X.v.length;
		if (nX === 1) {  //1-ent - call scalar version
			if (cut) return this._oneDimSc(d,X.v[0],cut);
			else     return this._oneDimSc(d,X.v[0]) }
		var R = new L2.ArShell(this,d);
		var dk = d + 'k';
		var da = d + 'a';
		var tmp, xInd, xIndSort, cutN, cutInd, i, j, k, m, epp=R.r*R.c, newV, newN, newDa;
		xInd = new Array(nX);
		for (var i=0; i<nX; i++) xInd[i] = this._getInd(X.v[i],d);
		if (cut) {
			if (!L2.aux.uniqueJSA_strEq(xInd)) throw new Error ('repeats not permitted when cutting');
			xIndSort = L2.aux.shallowCopyJSA(xInd).sort( function(a,b) {return a-b} );
			cutN = R[d] - nX;
			cutInd = new Array(cutN);
			for (i=0, m=0, tmp=0; i<R[d]; i++) i === xIndSort[tmp] ? tmp++ : cutInd[m++] = i }
		if (this[dk]) {
			R[dk] = {};
			R[da] = new Array(nX);
			for (i=0; i<nX; i++) {
				tmp = typeof X.v[i] === 'number' ? this[da][xInd[i]] : X.v[i];
				if (!cut && typeof R[dk][tmp] === 'number') throw new Error (L2.errorMsg.dupKey);
				R[dk][tmp] = i;
				R[da][i] = '' + tmp }
			if (cut) {
				newDa = new Array(cutN);
				for (i=0; i<cutN; i++) newDa[i] = this[da][cutInd[i]];
				this._setKey(d,newDa) } }
		m = 0;
		if (d === 'r') {
			newN = nX*R.c*R.p;
			R.v = new Array(newN);
			for (k=0; k<R.p; k++) 	for (j=0; j<R.c; j++)		for (i=0; i<nX; i++)		R.v[m++] = this.v[xInd[i] + j*R.r + k*epp];
			if (cut)  {
				newV = new Array(this.v.length - R.v.length);
				for (m=0, k=0; k<R.p; k++)	for (j=0; j<R.c; j++)		for (i=0; i<cutN; i++)	newV[m++] = this.v[cutInd[i] + j*R.r + k*epp]; } }
		else if (d === 'c') {
			newN = R.r*nX*R.p;
			R.v = new Array(newN);
			for (k=0; k<R.p; k++) 	for (j=0; j<nX; j++)		for (i=0; i<R.r; i++)		R.v[m++] = this.v[i + xInd[j]*R.r + k*epp];
			if (cut) {
				newV = new Array(this.v.length - R.v.length);
				for (m=0, k=0; k<R.p; k++) 	for (j=0; j<cutN; j++)	for (i=0; i<R.r; i++)		newV[m++] = this.v[i + cutInd[j]*R.r + k*epp]; } }
		else {
			newN = epp*nX;
			R.v = new Array(newN);
			for (k=0; k<nX; k++)   	for (i=xInd[k]*epp; i<(xInd[k]+1)*epp; i++)			R.v[m++] = this.v[i];
			if (cut) {
				newV = new Array(this.v.length - R.v.length);
				for (m=0, k=0; k<cutN; k++)  for (i=cutInd[k]*epp; i<(cutInd[k]+1)*epp; i++)		newV[m++] = this.v[i]; } }
		R[d] = nX;
		if (cut) {
			this[d] -= nX;
			this.v = newV; }
		return R };

	//s,s,a,a,->a get any number of row/col/page, d1,d2: 1st,2nd dim  (ordered rc, rp or cp - not chkd), X1,X2: inds/keys to get on 1st,2nd dim
	L2.P._twoDim = function(d1,d2,X1,X2) {
		var R = new L2.ArShell(this,d1);
		var i, j, k, m, epp=R.r*R.c, newN, newDa;
		var nX1 = X1.v.length,		xInd1 = new Array(nX1);
		var nX2 = X2.v.length,		xInd2 = new Array(nX2);
		for (i=0; i<nX1; i++) xInd1[i] = this._getInd(X1.v[i],d1);
		for (i=0; i<nX2; i++) xInd2[i] = this._getInd(X2.v[i],d2);
		if (this[d1 + 'k']) R._setKeyFrom(d1,this,xInd1);
		if (this[d2 + 'k']) R._setKeyFrom(d2,this,xInd2);
		m = 0;
		if (d1 === 'r' && d2 ==='c') {
			newN = nX1*nX2*R.p;
			R.v = new Array(newN);
			for (k=0; k<R.p; k++) 	for (j=0; j<nX2; j++)		for (i=0; i<nX1; i++)		R.v[m++] = this.v[xInd1[i] + xInd2[j]*R.r + k*epp] }
		else if (d1 === 'r' && d2 ==='p') {
			newN = nX1*R.c*nX2;
			R.v = new Array(newN);
			for (k=0; k<nX2; k++) 	for (j=0; j<R.c; j++)		for (i=0; i<nX1; i++)		R.v[m++] = this.v[xInd1[i] + j*R.r + xInd2[k]*epp] }
		else { //assumed .cp
			newN = R.r*nX1*nX2;
			R.v = new Array(newN);
			for (k=0; k<nX2; k++) 	for (j=0; j<nX1; j++)		for (i=0; i<R.r; i++)		R.v[m++] = this.v[i + xInd1[j]*R.r + xInd2[k]*epp] }
		R[d1] = nX1;
		R[d2] = nX2;
		return R };

	//a,a,a->a get any number of row/col/page, X1,X2,X3: inds/keys to get on each dim
	L2.P._threeDim = function(X1,X2,X3) {
		var R = new L2.ArShell(this,'r');
		var i, j, k, m, epp=R.r*R.c, newN;
		var nX1 = X1.v.length,		xInd1 = new Array(nX1);
		var nX2 = X2.v.length,		xInd2 = new Array(nX2);
		var nX3 = X3.v.length,		xInd3 = new Array(nX3);
		for (i=0; i<nX1; i++) xInd1[i] = this._getInd(X1.v[i],'r');
		for (i=0; i<nX2; i++) xInd2[i] = this._getInd(X2.v[i],'c');
		for (i=0; i<nX3; i++) xInd3[i] = this._getInd(X3.v[i],'p');
		if (this.rk) R._setKeyFrom('r',this,xInd1);
		if (this.ck) R._setKeyFrom('c',this,xInd2);
		if (this.pk) R._setKeyFrom('p',this,xInd3);
		newN = nX1*nX2*nX3;
		R.v = new Array(newN);
		m = 0;
		for (k=0; k<nX3; k++)  for (j=0; j<nX2; j++)  for (i=0; i<nX1; i++)  R.v[m++] = this.v[xInd1[i] + xInd2[j]*R.r + xInd3[k]*epp];
		R.r = nX1;
		R.c = nX2;
		R.p = nX3;
		return R };

	//s,a,s->a, set any number of row/col/page, d:dim - not chkd, X: inds/keys to set, y: replacement
	L2.P._oneDimSetSc = function(d,X,y) {
		var nX = X.v.length;
		if (nX === 0) return this;
		var xInd, i, j, k, epp=this.r*this.c;
		xInd = new Array(nX);
		for (i=0; i<nX; i++) xInd[i] = this._getInd(X.v[i],d);
		if (d === 'r')  			for (k=0; k<this.p; k++) 	for (j=0; j<this.c; j++)	  for (i=0; i<nX; i++)			  this.v[xInd[i] + j*this.r + k*epp] 	= y;
		else if (d === 'c')		for (k=0; k<this.p; k++) 	for (j=0; j<nX; j++)			for (i=0; i<this.r; i++)  	this.v[i + xInd[j]*this.r + k*epp] 	= y;
		else									for (k=0; k<nX; k++)			for (i=xInd[k]*epp; i<(xInd[k]+1)*epp; i++)					this.v[i] = y; 
		return this };

	//s,a,a->a, set any number of row/col/page, d:dim - not chkd, X: inds/keys to set, Y: replacement
	L2.P._oneDimSetAr = function(d,X,Y) {
		if (Y.v.length === 1) return this._oneDimSetSc(d,X,Y.v[0]);
		var nX = X.v.length;
		var xInd, i, j, k, m=0, epp=this.r*this.c;
		xInd = new Array(nX);
		for (i=0; i<nX; i++) xInd[i] = this._getInd(X.v[i],d);	
		if (d === 'r') {
			if (nX !== Y.r || this.c !== Y.c || this.p !== Y.p) throw new Error(L2.errorMsg.shapeMismatch);
			for (k=0; k<this.p; k++) 	for (j=0; j<this.c; j++)	  for (i=0; i<nX; i++)			this.v[xInd[i] + j*this.r + k*epp] 	= Y.v[m++]; }
		else if (d === 'c') {
			if (this.r !== Y.r || nX !== Y.c || this.p !== Y.p) throw new Error(L2.errorMsg.shapeMismatch);
			for (k=0; k<this.p; k++) 	for (j=0; j<nX; j++)			for (i=0; i<this.r; i++)	this.v[i + xInd[j]*this.r + k*epp] 	= Y.v[m++]; }	
		else {
			if (this.r !== Y.r || this.c !== Y.c || nX !== Y.p) throw new Error(L2.errorMsg.shapeMismatch);
			for (k=0; k<nX; k++)			for (i=xInd[k]*epp; i<(xInd[k]+1)*epp; i++) 				this.v[i] = Y.v[m++]; }
			return this };

	//s,s,a,a,s/a->a, set any number of row/col/page, d1,d2 1st,2nd dim (ordered rc, rp or cp - not chkd), X1,X2 inds/keys to set, y: replacement
	L2.P._twoDimSet = function(d1,d2,X1,X2,y) {
		var ind, xInd1, xInd2, i, j, k, m=0, epp=this.r*this.c, ySc=null;
		var nX1 = X1.v.length,		xInd1 = new Array(nX1);
		var nX2 = X2.v.length,		xInd2 = new Array(nX2);
		for (var i=0; i<nX1; i++) xInd1[i] = this._getInd(X1.v[i],d1);
		for (var i=0; i<nX2; i++) xInd2[i] = this._getInd(X2.v[i],d2);
		if (!(L2.aTab(y))) ySc = y;
		else if (y.v.length === 1) ySc = y.v[0];
		if (ySc !== null) {
			if (d1 === 'r' && d2 === 'c') {
				for (k=0; k<this.p; k++)  	for (j=0; j<nX2; j++) 		  for (i=0; i<nX1; i++) 		  this.v[xInd1[i] + xInd2[j]*this.r + k*epp] = ySc }
			else if (d1 === 'r' && d2 === 'p') {
				for (k=0; k<nX2; k++)			for (j=0; j<this.c; j++)  for (i=0; i<nX1; i++) 		  this.v[xInd1[i] + j*this.r + xInd2[k]*epp] = ySc }
			else { //assumed cp
				for (k=0; k<nX2; k++)			for (j=0; j<nX1; j++) 		  for (i=0; i<this.r; i++) 	this.v[i + xInd1[j]*this.r + xInd2[k]*epp] = ySc } }
		else {
			if (d1 === 'r' && d2 === 'c') {
				if (nX1 !== y.r || nX2 !== y.c || this.p !== y.p) throw new Error(L2.errorMsg.shapeMismatch);
				for (k=0; k<this.p; k++)	for (j=0; j<nX2; j++) 		    for (i=0; i<nX1; i++) 		  this.v[xInd1[i] + xInd2[j]*this.r + k*epp] = y.v[m++] }
			else if (d1 === 'r' && d2 === 'p') {
				if (nX1 !== y.r || this.c !== y.c || nX2 !== y.p) throw new Error(L2.errorMsg.shapeMismatch);
				for (k=0; k<nX2; k++)			for (j=0; j<this.c; j++) 	for (i=0; i<nX1; i++) 		  this.v[xInd1[i] + j*this.r + xInd2[k]*epp] = y.v[m++] }
			else { //assumed cp
				if (this.r !== y.r || nX1 !== y.c || nX2 !== y.p) throw new Error(L2.errorMsg.shapeMismatch);
				for (k=0; k<nX2; k++)			for (j=0; j<nX1; j++) 		  for (i=0; i<this.r; i++) 	this.v[i + xInd1[j]*this.r + xInd2[k]*epp] = y.v[m++] } }
		return this };

	//a,a,a,s/a->a, set any number of row/col/page, X1,X2,X3 inds/keys to set, y: replacement
	L2.P._threeDimSet = function(X1,X2,X3,y) {
		var ind, xInd1, xInd2, xInd3, i, j, k, m=0, epp=this.r*this.c, ySc=null;
		var nX1 = X1.v.length,		xInd1 = new Array(nX1);
		var nX2 = X2.v.length,		xInd2 = new Array(nX2);
		var nX3 = X3.v.length,		xInd3 = new Array(nX3);
		for (var i=0; i<nX1; i++) xInd1[i] = this._getInd(X1.v[i],'r');
		for (var i=0; i<nX2; i++) xInd2[i] = this._getInd(X2.v[i],'c');
		for (var i=0; i<nX3; i++) xInd3[i] = this._getInd(X3.v[i],'p');
		if (!(L2.aTab(y))) ySc = y;
		else if (y.v.length === 1) ySc = y.v[0];
		if (ySc !== null) {
			for (k=0; k<nX3; k++)		for (j=0; j<nX2; j++) 	for (i=0; i<nX1; i++) 	this.v[xInd1[i] + xInd2[j]*this.r + xInd3[k]*epp] = ySc }
		else {
			if (nX1 !== y.r || nX2 !== y.c || nX3 !== y.p) throw new Error(L2.errorMsg.shapeMismatch);
			for (k=0; k<nX3; k++)		for (j=0; j<nX2; j++) 	for (i=0; i<nX1; i++) 	this.v[xInd1[i] + xInd2[j]*this.r + xInd3[k]*epp] = y.v[m++] }
		return this };

	//map functions
	//s->a applies f entrywise
	L2.P._map = function(f) { 
		var R = new L2.ArShell(this);
		var n = this.v.length;
		R.v = new Array(n);
		for (var i=0; i<n; i++) R.v[i] = f(this.v[i]);
		return R };
	//s,s->a, applies f entrywise with x as the 2nd arg
	L2.P._map_1_as = function(f,x) { 
		var R = new L2.ArShell(this);
		var n = this.v.length;
		R.v = new Array(n);
		for (var i=0; i<n; i++) R.v[i] = f(this.v[i],x);
		return R };
	//s,s->a, as _map_1_as, but x is 1st arg and entry 2nd
	L2.P._map_1_sa = function(f,x) {
		var n = this.v.length;
		var v = new Array(n);
		for (var i=0; i<n; i++) v[i] = f(x,this.v[i]);
		var R = new L2.ArJSA(v);
		R.r = this.r;
		R.c = this.c;
		R.p = this.p;
		return R; };
	//s,a->a, applies f to corresponding entries of arrays - either array repeated if has only 1 entry
	L2.P._map_1_aa = function(f,A) {
		var n = this.v.length;
		var nA = A.v.length;
		if (nA === 1) return this._map_1_as(f,A.v[0]);
		else if (n === 1) return A._map_1_sa(f,this.v[0]);
		else {	
			if (this.r !== A.r || this.c !== A.c || this.p !== A.p) throw new Error(L2.errorMsg.shapeMismatch);
			var R = new L2.ArShell(this);
			R.v = new Array(n);
			for (var i=0; i<n; i++) R.v[i] = f(this.v[i], A.v[i]);
			return R } };

	//map methods
	//s->a, entrywise calls the method with name s
	L2.P._mapMeth = function(s) { 
		var R = new L2.ArShell(this);
		var n = this.v.length;
		R.v = new Array(n);
		for (var i=0; i<n; i++) R.v[i] = this.v[i][s]();
		return R };
	//s,s->a, entrywise calls the method with name s and argument x 
	L2.P._mapMeth_as = function(s,x) {
		var R = new L2.ArShell(this);
		var n = this.v.length;
		R.v = new Array(n);
		for (var i=0; i<n; i++) R.v[i] = this.v[i][s](x);
		return R };
	//s,s->a, as _mapMeth_as but call method of 2nd arg and entry is argument	
	L2.P._mapMeth_sa = function(s,x) {
		var n = this.v.length;
		var v = new Array(n);
		for (var i=0; i<n; i++) v[i] = x[s](this.v[i]);
		var R = new L2.ArJSA(v);
		R.r = this.r;
		R.c = this.c;
		R.p = this.p;
		return R; };
	//s,a->a, calls method of array with name s entrywise, entries of A are argument - either array repeated if has only 1 entry
	L2.P._mapMeth_aa = function(s,A) {
		var n = this.v.length;
		var nA = A.v.length;
		if (nA === 1) return this._mapMeth_as(s,A.v[0]);
		else if (n === 1) return A._mapMeth_sa(s,this.v[0])
		else {
			if (this.r !== A.r || this.c !== A.c || this.p !== A.p) throw new Error(L2.errorMsg.shapeMismatch);
			var R = new L2.ArShell(this);
			R.v = new Array(n);
			for (var i=0; i<n; i++) R.v[i] = this.v[i][s](A.v[i]);
			return R } };
	//s,s,s->a, as _mapMeth_as, but x and y both arguments
	L2.P._mapMeth_ass = function(s,x,y) {
		var R = new L2.ArShell(this);
		var n = this.v.length;
		R.v = new Array(n);
		for (var i=0; i<n; i++) R.v[i] = this.v[i][s](x,y);
		return R };
	//s,s[,s,s,s]->a, as _mapMeth_as, but copies entry first, passes upto 4 scalars as method args, returned value converted to new date
	L2.P._mapMeth_date = function(s,u,v,x,y) {
		var R = new L2.ArShell(this);
		var n = this.v.length;
		var nA = arguments.length;
		var i;
		R.v = new Array(n);
		switch (nA) {
			case 2: 	for (i=0; i<n; i++) R.v[i] = new Date((new Date(this.v[i]))[s](u));  break;
			case 3: 	for (i=0; i<n; i++) R.v[i] = new Date((new Date(this.v[i]))[s](u,v));  break;
			case 4: 	for (i=0; i<n; i++) R.v[i] = new Date((new Date(this.v[i]))[s](u,v,x));  break;
			default: 	for (i=0; i<n; i++) R.v[i] = new Date((new Date(this.v[i]))[s](u,v,x,y));  break; }
		return R };

	//not and unary
	//a->a, not - as _map, but specific to unary and ! since cannot pass operator
	L2.P['!'] = function() { 
		var R = new L2.ArShell(this);
		var n = this.v.length;
		R.v = new Array(n);
		for (var i=0; i<n; i++) R.v[i] = !this.v[i];
		return R };
	L2.P._unary = function() { 
		var R = new L2.ArShell(this);
		var n = this.v.length;
		R.v = new Array(n);
		for (var i=0; i<n; i++) R.v[i] = -this.v[i];
		return R };

	//repeating symbol functions - different inner func for each operator since cannot pass operator
	L2.symb = {};
	//all funcs: a,s->a, apply function entrywise to A, x is second argument
	L2.symb.as = {
    
    //!!ADD THESE IN? - paste in func for mod
//    math: {
//			'^': 	Math.pow,
//			'^^':	function(x,y) {return x*Math.pow(10,y)},
//			'><': Math.max,
//			'<>':	Math.min,
//			'%%': L2.aux.mod
//		},
    
    
    
		'+':  function(A,x) { var R = new L2.ArShell(A), n = A.v.length;		R.v = new Array(n);		for (var i=0; i<n; i++) R.v[i] = A.v[i] + x;		return R },
		'-':  function(A,x) { var R = new L2.ArShell(A), n = A.v.length;		R.v = new Array(n);		for (var i=0; i<n; i++) R.v[i] = A.v[i] - x;		return R },
		'*':  function(A,x) { var R = new L2.ArShell(A), n = A.v.length;		R.v = new Array(n);		for (var i=0; i<n; i++) R.v[i] = A.v[i] * x;		return R },
		'/':  function(A,x) { var R = new L2.ArShell(A), n = A.v.length;		R.v = new Array(n);		for (var i=0; i<n; i++) R.v[i] = A.v[i] / x;		return R },
		'%':  function(A,x) { var R = new L2.ArShell(A), n = A.v.length;		R.v = new Array(n);		for (var i=0; i<n; i++) R.v[i] = A.v[i] % x;		return R },
		'==': function(A,x) { var R = new L2.ArShell(A), n = A.v.length;		R.v = new Array(n);		for (var i=0; i<n; i++) R.v[i] = A.v[i] === x;	return R },
		'!=': function(A,x) { var R = new L2.ArShell(A), n = A.v.length;		R.v = new Array(n);		for (var i=0; i<n; i++) R.v[i] = A.v[i] !== x;	return R },
		'<':  function(A,x) { var R = new L2.ArShell(A), n = A.v.length;		R.v = new Array(n);		for (var i=0; i<n; i++) R.v[i] = A.v[i] < x;		return R },
		'<=': function(A,x) { var R = new L2.ArShell(A), n = A.v.length;		R.v = new Array(n);		for (var i=0; i<n; i++) R.v[i] = A.v[i] <= x;	return R },
		'>':  function(A,x) { var R = new L2.ArShell(A), n = A.v.length;		R.v = new Array(n);		for (var i=0; i<n; i++) R.v[i] = A.v[i] > x;		return R },
		'>=': function(A,x) { var R = new L2.ArShell(A), n = A.v.length;		R.v = new Array(n);		for (var i=0; i<n; i++) R.v[i] = A.v[i] >= x;	return R },
		'&&': function(A,x) { var R = new L2.ArShell(A), n = A.v.length;		R.v = new Array(n);		for (var i=0; i<n; i++) R.v[i] = A.v[i] && x;	return R },
		'||': function(A,x) { var R = new L2.ArShell(A), n = A.v.length;		R.v = new Array(n);		for (var i=0; i<n; i++) R.v[i] = A.v[i] || x;	return R } };
	//all funcs: s,a->a, apply function entrywise to A, but x is first arg, entry is second
	L2.symb.sa = {
		'+': 	function(x,A) { 
			var n = A.v.length, v = new Array(n);	 
			for (var i=0; i<n; i++) v[i] = x + A.v[i];  
			var R = new L2.ArJSA(v); 	R.r=A.r; R.c=A.c; R.p=A.p;
			return R },
		'-': 	function(x,A) { 
			var n = A.v.length, v = new Array(n);	 
			for (var i=0; i<n; i++) v[i] = x - A.v[i];  
			var R = new L2.ArJSA(v); 	R.r=A.r; R.c=A.c; R.p=A.p;
			return R },
		'*': 	function(x,A) { 
			var n = A.v.length, v = new Array(n);	 
			for (var i=0; i<n; i++) v[i] = x * A.v[i];  
			var R = new L2.ArJSA(v); 	R.r=A.r; R.c=A.c; R.p=A.p;
			return R },
		'/': 	function(x,A) { 
			var n = A.v.length, v = new Array(n);	 
			for (var i=0; i<n; i++) v[i] = x / A.v[i];  
			var R = new L2.ArJSA(v); 	R.r=A.r; R.c=A.c; R.p=A.p;
			return R },
		'%': 	function(x,A) { 
			var n = A.v.length, v = new Array(n);	 
			for (var i=0; i<n; i++) v[i] = x % A.v[i];  
			var R = new L2.ArJSA(v); 	R.r=A.r; R.c=A.c; R.p=A.p;
			return R },
		'==': 	function(x,A) { 
			var n = A.v.length, v = new Array(n);	 
			for (var i=0; i<n; i++) v[i] = x === A.v[i];  
			var R = new L2.ArJSA(v); 	R.r=A.r; R.c=A.c; R.p=A.p;
			return R },
		'!=': 	function(x,A) { 
			var n = A.v.length, v = new Array(n);	 
			for (var i=0; i<n; i++) v[i] = x !== A.v[i];  
			var R = new L2.ArJSA(v); 	R.r=A.r; R.c=A.c; R.p=A.p;
			return R },
		'<': 	function(x,A) { 
			var n = A.v.length, v = new Array(n);	 
			for (var i=0; i<n; i++) v[i] = x < A.v[i];  
			var R = new L2.ArJSA(v); 	R.r=A.r; R.c=A.c; R.p=A.p;
			return R },
		'<=': 	function(x,A) { 
			var n = A.v.length, v = new Array(n);	 
			for (var i=0; i<n; i++) v[i] = x <= A.v[i];  
			var R = new L2.ArJSA(v); 	R.r=A.r; R.c=A.c; R.p=A.p;
			return R },
		'>': 	function(x,A) { 
			var n = A.v.length, v = new Array(n);	 
			for (var i=0; i<n; i++) v[i] = x > A.v[i];  
			var R = new L2.ArJSA(v); 	R.r=A.r; R.c=A.c; R.p=A.p;
			return R },
		'>=': 	function(x,A) { 
			var n = A.v.length, v = new Array(n);	 
			for (var i=0; i<n; i++) v[i] = x >= A.v[i];  
			var R = new L2.ArJSA(v); 	R.r=A.r; R.c=A.c; R.p=A.p;
			return R },
		'&&': 	function(x,A) { 
			var n = A.v.length, v = new Array(n);	 
			for (var i=0; i<n; i++) v[i] = x && A.v[i];  
			var R = new L2.ArJSA(v); 	R.r=A.r; R.c=A.c; R.p=A.p;
			return R },
		'||': 	function(x,A) { 
			var n = A.v.length, v = new Array(n);	 
			for (var i=0; i<n; i++) v[i] = x || A.v[i];  
			var R = new L2.ArJSA(v); 	R.r=A.r; R.c=A.c; R.p=A.p;
			return R } };
	//repeating functions for array-array
	L2.symb.aa = {
		//s,a,a->a, top level func for applying function with name s (from this object) to corresponding entries of A and B
		apply: function(s,A,B) {
			var nA = A.v.length;
			var nB = B.v.length;
			if (nB === 1) return L2.symb.as[s](A, B.v[0]);
			else if (nA === 1) return L2.symb.sa[s](A.v[0], B);
			else {
				if (A.r !== B.r || A.c !== B.c || A.p !== B.p) throw new Error(L2.errorMsg.shapeMismatch);
				var R = new L2.ArShell(A);
				R.v = L2.symb.aa[s](A.v, B.v);
				return R } },
		//all funcs: jsa,jsa->jsa, called by apply
		'+':  function(X,Y) { var n = X.length, v = new Array(n);	  for (var i=0; i<n; i++) v[i] = X[i] + Y[i];		return v; },
		'-':  function(X,Y) { var n = X.length, v = new Array(n);	  for (var i=0; i<n; i++) v[i] = X[i] - Y[i];		return v; },
		'*':  function(X,Y) { var n = X.length, v = new Array(n);	  for (var i=0; i<n; i++) v[i] = X[i] * Y[i];		return v; },
		'/':  function(X,Y) { var n = X.length, v = new Array(n);	  for (var i=0; i<n; i++) v[i] = X[i] / Y[i];		return v; },
		'%':  function(X,Y) { var n = X.length, v = new Array(n);	  for (var i=0; i<n; i++) v[i] = X[i] % Y[i];		return v; },
		'==': function(X,Y) { var n = X.length, v = new Array(n);	  for (var i=0; i<n; i++) v[i] = X[i] === Y[i];	return v; },
		'!=': function(X,Y) { var n = X.length, v = new Array(n);	  for (var i=0; i<n; i++) v[i] = X[i] !== Y[i];	return v; },
		'<':  function(X,Y) { var n = X.length, v = new Array(n);	  for (var i=0; i<n; i++) v[i] = X[i] < Y[i];		return v; },
		'<=': function(X,Y) { var n = X.length, v = new Array(n);	  for (var i=0; i<n; i++) v[i] = X[i] <= Y[i];		return v; },
		'>':  function(X,Y) { var n = X.length, v = new Array(n);	  for (var i=0; i<n; i++) v[i] = X[i] > Y[i];		return v; },
		'>=': function(X,Y) { var n = X.length, v = new Array(n);	  for (var i=0; i<n; i++) v[i] = X[i] >= Y[i];		return v; },
		'&&': function(X,Y) { var n = X.length, v = new Array(n);	  for (var i=0; i<n; i++) v[i] = X[i] && Y[i];		return v; },
		'||': function(X,Y) { var n = X.length, v = new Array(n);	  for (var i=0; i<n; i++) v[i] = X[i] || Y[i];		return v; } };
	//special case logic funcs for when scalars passed to || or && - put thru function so no short-circuit evaluation
	L2.symb.logic = {
		//s,s->s
		'||': function(x,y) {return x || y},
		'&&': function(x,y) {return x && y} };


	///// SKETCH INFO THAT IS USED BY BOTH COMPILER AND (WHEN INCLUDED) SKETCH OPS
	L2.sketch = {
		combineList: {
			arc:1, ellipse:1, segment:1, spot:1, quad:1, rect:1, triangle:1, fill:1, stroke:1, resetMatrix:1, rotateX:1, rotateY:1,
			rotateZ:1, rotate:1, scale:1, shearX:1, shearY:1, translate:1, text:1, textFont:1, plane:1, cuboid:1, sphere:1, cylinder:1,
			cone:1, ellipsoid:1, torus:1, strokeWeight:1, textAlign:1, textLeading:1, textSize:1, textStyle:1, curveTightness:1, circle:1,
			background:1, colorMode:1, ellipseMode:1, rectMode:1, strokeCap:1, strokeJoin:1, redraw:1, camera:1, perspective:1,
			ortho:1, ambientLight:1, directionalLight:1, pointLight:1, normalMaterial:1, ambientMaterial:1, specularMaterial:1,
			erase:1, noFill:1, noStroke:1, noSmooth:1, smooth:1, discard:1, pause:1, play:1, push:1, pop:1, cursor:1, noCursor:1,
			resizeCanvas:1, noCanvas:1, blendMode:1, createCanvas:1 },
		polyList: { polygon:1, polyline:1, curve:1 },
		changeName: { lastKey:1, lastCode:1, erase:1, discard:1, pause:1, play:1, segment:1, spot:1, cuboid:1, rotate:1, circle:1 },
		suffix: function(fn) { return this.changeName[fn] ? '_L2_' + fn : fn }
	};


	////// LOAD OTHER FILES IN L2-BASE /////
	if (L2.runningIn !== 'wp') {
		require('./extend.js');  //also needed for 'wp', but gulp appends code to core.js
		L2.srv = require('./server.js');
		require('./compile.js') }

	delete L2.P;



}

*/