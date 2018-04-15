








;(function() {








  var L2_sortKey = function(L2_X,L2_d,L2_ord) { if (!L2.aTab(L2_X)) L2_X = new L2.ArJSA([L2_X]); if (L2.aTab(L2_d)) L2_d = L2_d.v[0]; if (L2.aTab(L2_ord)) L2_ord = L2_ord.v[0]; var L2_KeyInd = new L2.ArJSA([undefined]);
    if (((((L2_ord===undefined) || ((L2_ord==='asc'))) || ((L2_ord==='desc'))) || (L2.pf.ew.isFunc(L2_ord)))) {
      L2_KeyInd = L2_X["key"](L2.aux.validSfx(L2_d,false))["sort"](L2_ord); }
    else if (((((L2_ord==='asc-num') || ((L2_ord==='desc-num'))) || ((L2_ord==='asc-date'))) || ((L2_ord==='desc-date')))) {
      var L2_direc = ((L2.pf.ew.str(L2_ord).charAt((0))==='a') ? 'asc' : 'desc');
      if ((L2_ord.substr((-1))==='m')) {
        L2_KeyInd = L2_X["key"](L2.aux.validSfx(L2_d,false))._map(L2.pf.ew.num)["sort"](L2_direc,'index'); }
      else {
        L2_KeyInd = L2_X["key"](L2.aux.validSfx(L2_d,false))._map(L2.pf.ew.date)["sort"](L2_direc,'index'); } }
    else {
      L2.ge.error('invalid argument'); }
    if ((L2_d==='r')) {
      return L2_X._oneDimAr("r",L2_KeyInd); }
    else if ((L2_d==='c')) {
      return L2_X._oneDimAr("c",L2_KeyInd); }
    else {
      return L2_X._oneDimAr("p",L2_KeyInd); } };
  undefined;

  L2.Ar.prototype.sortKey = function(d,ord) {
		if (!this[d + 'k']) throw new Error ('table does not have ' + L2.aux.expandDim[d] + ' keys');
		if (arguments.length === 2 && ord === undefined) throw new Error ('invalid argument');
    return L2_sortKey(this,d,ord) };
  L2.Ar.prototype.sortKey.sig = {arg:[1], rtn:true, min:0, dim:1};


  var L2_peek = function(L2_X) { if (!L2.aTab(L2_X)) L2_X = new L2.ArJSA([L2_X]);
    if ((L2_X.v.length===(0))) {
      L2.aux.prt(L2_X); }
    else {
      L2.aux.prt(L2_X._threeDim((L2.sc.range((0),(L2.pf.math["<>"]((L2_X.r-(1)),(4))))),(L2.sc.range((0),(L2.pf.math["<>"]((L2_X.c-(1)),(4))))),(L2.sc.range((0),(L2.pf.math["<>"]((L2_X.p-(1)),(1))))))); }
    return L2_X; };
  undefined;

  L2.Ar.prototype._peek = function() { return L2_peek(this) };


  var L2_dictSca = function(L2_Ky,L2_val) { if (!L2.aTab(L2_Ky)) L2_Ky = new L2.ArJSA([L2_Ky]); if (L2.aTab(L2_val)) L2_val = L2_val.v[0];
    return (new L2.Ar(L2_Ky.v.length,L2_val))["key:"]("r",undefined,L2_Ky); };
  var L2_dictTab = function(L2_Ky,L2_Val) { if (!L2.aTab(L2_Ky)) L2_Ky = new L2.ArJSA([L2_Ky]); if (!L2.aTab(L2_Val)) L2_Val = new L2.ArJSA([L2_Val]);
    if ((L2_Val.v.length===(1))) {
      return L2.tab(L2_dictSca(L2_Ky,(L2_Val.v[+(0)]))); }
    return L2_Val._v()["key:"]("r",undefined,L2_Ky); };
  undefined;

  L2.Ar.prototype.dict = function(x) { return (L2.aTab(x) ? L2_dictTab : L2_dictSca)(this,x) };
  L2.Ar.prototype.dict.sig = {arg:[3], rtn:true, min:0, dim:0};  







  var L2_owise = function(L2_A,L2_D) { if (!L2.aTab(L2_A)) L2_A = new L2.ArJSA([L2_A]); if (!L2.aTab(L2_D)) L2_D = new L2.ArJSA([L2_D]);
    if (((!L2.ge.isDict(L2_A)) || ((!L2.ge.isDict(L2_D))))) {
      L2.ge.error('dictionary expected'); }
    L2_A = (new L2.ArCopy(L2_A,true));
    var L2_K = L2_D["key"]("r")["diff"]((L2_A["key"]("r")));
    if (L2_K.r) {
      L2_A._appendAr((L2_D._oneDimAr("r",L2_K)),"r",true); }
    return L2_A; };
  undefined;

  L2.Ar.prototype._owise = function(D) { return L2_owise(this,D) };








  var L2_rank = function(L2_X,L2_direc) { if (!L2.aTab(L2_X)) L2_X = new L2.ArJSA([L2_X]); if (L2.aTab(L2_direc)) L2_direc = L2_direc.v[0]; var L2_SortedVal = new L2.ArJSA([undefined]); var L2_Rnk = new L2.ArJSA([undefined]);
    var L2_SortedInd = L2_X["sort"]((((arguments.length===(2)) ? L2_direc : 'asc')),'index');
    var L2_n = L2_X.v.length;
    if ((L2_n===(0))) {
      return (new L2.ArJSA([])); }
    else if ((L2_n===(1))) {
      return (new L2.ArJSA([(0)])); }
    else {
      L2_SortedVal = L2_X._v(L2_SortedInd);
      L2_Rnk = (new L2.Ar(L2_n));
      L2_Rnk["_slashEnt1:"]((0),((0)));
      if (L2.pf.ew.isFunc(L2_direc)) {
        for (var L2_i=(1); L2_i<=((L2_n-(1))); L2_i+=1) {
          L2_Rnk["_slashEnt1:"](L2_i,(((L2.sca(L2_direc(L2_SortedVal.v[+L2_i],(L2_SortedVal.v[+((L2_i-(1)))])))===(0)) ? (L2_Rnk.v[+((L2_i-(1)))]) : L2_i))); } }
      else if (L2.pf.ew.isDate(L2_X.v[+(0)])) {
        for (L2_i=(1); L2_i<=((L2_n-(1))); L2_i+=1) {
          L2_Rnk["_slashEnt1:"](L2_i,(((L2.pf.ew.num(L2_SortedVal.v[+L2_i])===(L2.pf.ew.num(L2_SortedVal.v[+((L2_i-(1)))]))) ? (L2_Rnk.v[+((L2_i-(1)))]) : L2_i))); } }
      else {
        for (L2_i=(1); L2_i<=((L2_n-(1))); L2_i+=1) {
          L2_Rnk["_slashEnt1:"](L2_i,(((L2_SortedVal.v[+L2_i]===(L2_SortedVal.v[+((L2_i-(1)))])) ? (L2_Rnk.v[+((L2_i-(1)))]) : L2_i))); } }
      return (new L2.Ar(L2_n))["_v:"](L2_SortedInd,L2_Rnk); } };
  undefined;

  L2.Ar.prototype.rank = function(direc) { return L2_rank(this,direc) };
  L2.Ar.prototype.rank.sig = {arg:[1], rtn:true, min:0, dim:0};  










  var L2_orderScalar = function(L2_X,L2_c,L2_ord) { if (!L2.aTab(L2_X)) L2_X = new L2.ArJSA([L2_X]); if (L2.aTab(L2_c)) L2_c = L2_c.v[0]; if (L2.aTab(L2_ord)) L2_ord = L2_ord.v[0];
    return L2_X._oneDimAr("r",(L2_X._oneDimSc("c",L2_c)["sort"](L2_ord,'index')));









 };
  var L2_orderTable = function(L2_X,L2_C,L2_Ord) { if (!L2.aTab(L2_X)) L2_X = new L2.ArJSA([L2_X]); if (!L2.aTab(L2_C)) L2_C = new L2.ArJSA([L2_C]); if (!L2.aTab(L2_Ord)) L2_Ord = new L2.ArJSA([L2_Ord]);
    if ((L2_X.r===(0))) {
      return (new L2.ArCopy(L2_X,true)); }
    if ((L2_Ord.v.length===(1))) {
      L2_Ord = (new L2.Ar(L2_C.v.length,(L2_Ord.v[+(0)]))); }
    var L2_SortedInd = (new L2.Ar(L2_X.r));
    var L2_next = (0);







    var L2_subsort = function(L2_J,L2_cInd) { if (!L2.aTab(L2_J)) L2_J = new L2.ArJSA([L2_J]); if (L2.aTab(L2_cInd)) L2_cInd = L2_cInd.v[0]; var L2_Ind = new L2.ArJSA([undefined]);
      if ((arguments.length===(0))) {
        L2_cInd = (0);
        var L2_c = L2_C.v[+(0)];
        L2_Ind = L2_X._oneDimSc("c",L2_c)["sort"]((L2_Ord.v[+(0)]),'index'); }
      else {
        L2_c = L2_C.v[+L2_cInd];
        L2_Ind = L2_J._oneDimAr("r",(L2_X._twoDim("r","c",L2_J,(new L2.ArJSA([L2_c])))["sort"]((L2_Ord.v[+L2_cInd]),'index'))); }
      if (L2.pf.ew.isFunc(L2_Ord.v[+L2_cInd])) {
        var L2_compareFunc = L2_Ord.v[+L2_cInd]; }
      var L2_val = L2_X._slashEnt2((L2_Ind.v[+(0)]),L2_c);
      var L2_start = (0);
      var L2_lastInd = (L2_Ind.r-(1));
      var L2_IndGroup = (new L2.ArJSA([]));
      for (var L2_j=(1); L2_j<=L2_lastInd; L2_j+=1) {
        var L2_newVal = L2_X._slashEnt2((L2_Ind.v[+L2_j]),L2_c);
        if (((((!L2_compareFunc) && (((L2_newVal<L2_val) || ((L2_newVal>L2_val))))) || ((L2_compareFunc && (((L2.sca(L2_compareFunc(L2_val,L2_newVal))!==(0)) || ((L2.sca(L2_compareFunc(L2_newVal,L2_val))!==(0)))))))))) {

          L2_IndGroup._appendSc(((((L2_j-L2_start)>(1)) ? ((new L2.Box(L2_Ind["slice"]("r",L2_start,((L2_j-(1))))))) : (L2_Ind.v[+L2_start]))),"r",true);

          L2_val = L2_newVal;
          L2_start = L2_j; } }
      L2_IndGroup._appendSc(((((L2_j-L2_start)>(1)) ? ((new L2.Box(L2_Ind["slice"]("r",L2_start,((L2_j-(1))))))) : (L2_Ind.v[+L2_start]))),"r",true);
      var L2_g__index=0; var L2_g__limit=L2_IndGroup.v.length; var L2_g=L2_IndGroup.v[0]; for (;L2_g__index<L2_g__limit; L2_g=L2_IndGroup.v[++L2_g__index]) {
        if (L2.pf.ew.isBox(L2_g)) {
          if ((L2_cInd<((L2_C.v.length-(1))))) {
            L2.tab(L2_subsort(L2.sc.unwrap(L2_g),((L2_cInd+(1))))); }
          else {
            L2_SortedInd["slice:"]("r",L2_next,(((L2_next+(L2.sc.unwrap(L2_g).r))-(1))),(L2.sc.unwrap(L2_g)));
            L2_next = (L2_next+(L2.sc.unwrap(L2_g).r)); } }
        else {
          L2_SortedInd["_slashEnt1:"](L2_next,L2_g);
          L2_next = (L2_next+(1)); } } };
    L2.tab(L2_subsort());
    return L2_X._oneDimAr("r",L2_SortedInd); };
  undefined;

  L2.Ar.prototype.order = function(c,ord) {
    L2.assert.dataMatrix(this);
    var i, n, tmp;
    if (arguments.length === 2) {
      if (ord.v.length === 0) throw new Error('non-empty table expected');
      for (i=0, n=ord.v.length; i<n; i++) {
        tmp = ord.v[i];
        if (tmp !== 'desc' && tmp !== 'asc' && typeof tmp !== 'function') {
          throw new Error('\'asc\', \'desc\' or function expected') } } }
    else ord = new L2.ArJSA(['asc']);
    if (c.v.length === 0) throw new Error ('must specify at least 1 column');
    else if (c.v.length === 1) {
      if (ord.v.length !== 1) throw new Error(L2.errorMsg.shapeMismatch);
      return L2_orderScalar(this, c.v[0], ord.v[0]) }
    else {
      if (ord.v.length !== 1 && ord.v.length !== c.v.length) {
        throw new Error(L2.errorMsg.shapeMismatch) }
      c = L2.aux.colInd(this,c);
      //after 1st col, some entries not passed to .sort so check homog types here
      for (i=1, n=c.v.length; i<n; i++) L2.assert.homogType(this,c.v[i]);
      return L2_orderTable(this,c,ord) } };
  L2.Ar.prototype.order.sig = {arg:[2,2], rtn:true, min:1, dim:0};  












  var L2_bin = function(L2_X,L2_C,L2_Limit,L2_makeKey) { if (!L2.aTab(L2_X)) L2_X = new L2.ArJSA([L2_X]); if (!L2.aTab(L2_C)) L2_C = new L2.ArJSA([L2_C]); if (!L2.aTab(L2_Limit)) L2_Limit = new L2.ArJSA([L2_Limit]); if (L2.aTab(L2_makeKey)) L2_makeKey = L2_makeKey.v[0]; var L2_Key = new L2.ArJSA([undefined]); var L2_Y = new L2.ArJSA([undefined]); var L2_Count = new L2.ArJSA([undefined]);
    if (L2.ge.isNil(L2_C)) {
      L2_C = L2.sc.range((0),((L2_X.c-(1)))); }
    L2_Limit = L2_Limit._v();
    var L2_L = L2_Limit._map(L2.pf.ew.num);
    var L2_nData = L2_X.r;
    var L2_nCol = L2_C.r;
    var L2_nBin = (L2_L.r-(1));
    if ((L2_nCol===(0))) {
      L2.ge.error('must specify at least 1 column (pass ~ to use all)'); }
    if ((L2_nBin<(1))) {
      L2.ge.error('at least 1 bin (2 limits) expected'); }
    if ((L2_L._map(L2.pf.ew.isNaN)["any"]("r").v[0] || (L2.symb.as["<="](L2.symb.aa.apply("-",L2_L["slice"]("r",(1),(-1)),(L2_L["slice"]("r",(0),(-2)))),(0))["any"]("r")).v[0])) {
      L2.ge.error('limits must convert to increasing numbers'); }
    var L2_Total = (new L2.ArSh((new L2.ArJSA_Sh([L2_nBin,L2_nCol],2,1,1)),0));

    var L2_z = L2_X.z;

    if (L2_z) {
      if (L2_X["hasKey"]("c")) {
        L2_Total["key:"]("c",undefined,(L2_X["key"]("c")._oneDimAr("r",L2_C))); }
      L2_Total["label:"]("c",(L2_X["label"]("c")))["fmt:"]("c",(L2_X["fmt"]("c")))["key:"]("p",undefined,(L2_X["key"]("p")))["label:"]("p",(L2_X["label"]("p")))["fmt:"]("p",(L2_X["fmt"]("p")));
 }
    if (L2_makeKey) {
      L2_Key = (new L2.Ar(L2_nBin));
      for (var L2_i=(0); L2_i<=((L2_nBin-(1))); L2_i+=1) {
        L2_Key["_slashEnt1:"](L2_i,(L2.sca(L2_makeKey(L2_Limit.v[+L2_i],(L2_Limit.v[+((L2_i+(1)))]),L2_i)))); } }
    else {
      L2_Key = L2.symb.as["+"](L2.symb.aa.apply("+",L2.symb.as["+"](L2.symb.sa["+"]('(',(L2_Limit["slice"]("r",(0),(-2)))),','),(L2_Limit["slice"]("r",(1),(-1)))),']');
      L2_Key["_slashEnt1:"]((0),(L2_Key.v[+(0)].replaceStr('(','['))); }
    L2_Total["key:"]("r",undefined,L2_Key);
    if (L2_nData) {
      var L2_column__index=0; var L2_column__limit=L2_C.v.length; var L2_column=L2_C.v[0]; for (;L2_column__index<L2_column__limit; L2_column=L2_C.v[++L2_column__index]) {
        L2_Y = L2_X._oneDimSc("c",L2_column)._map(L2.pf.ew.num)["asc"]();
        L2_Count = (new L2.Ar(L2_nBin,0));
        var L2_upperInd = (1);
        var L2_upper = L2_L.v[+L2_upperInd];
        var L2_first = (0);
        if ((L2_Y.v[+(0)]<(L2_L.v[+(0)]))) {
          L2.ge.error('data value less than lowest limit'); }
        L2_i = (0);
        while ((L2_i<L2_nData)) {
          if ((L2_Y.v[+L2_i]>L2_upper)) {
            L2_Count["_slashEnt1:"](((L2_upperInd-(1))),((L2_i-L2_first)));
            L2_first = L2_i;
            L2_upperInd = (L2_upperInd+((1)));
            if ((L2_upperInd>L2_nBin)) {
              L2.ge.error('data value greater than highest limit'); }
            L2_upper = L2_L.v[+L2_upperInd];
            continue; }
          L2_i = (L2_i+(1)); }
        L2_Count["_slashEnt1:"](((L2_upperInd-(1))),((L2_nData-L2_first)));
        L2_Total._oneDimSetAr("c",(new L2.ArJSA([L2_column__index])),L2_Count); } }
    return L2_Total; };
  undefined;

  L2.Ar.prototype.bin = function(C,Limit,makeKey) {
    L2.assert.dataMatrix(this);
    if (!L2.ge.isNil(C)) C = L2.aux.colInd(this,C);
    if (arguments.length === 3 && typeof makeKey !== 'function') {
      throw new Error('function expected') }
    return L2_bin(this,C,Limit,makeKey) };
  L2.Ar.prototype.bin.sig = {arg:[2,2,1], rtn:true, min:2, dim:0};












  var L2_quant = function(L2_X,L2_d,L2_A) { if (!L2.aTab(L2_X)) L2_X = new L2.ArJSA([L2_X]); if (L2.aTab(L2_d)) L2_d = L2_d.v[0]; if (!L2.aTab(L2_A)) L2_A = new L2.ArJSA([L2_A]); var L2_R = new L2.ArJSA([undefined]);
    L2_A = L2_A._map(L2.pf.ew.num)._v();
    if (L2.symb.aa.apply("&&",L2.symb.as[">="](L2_A,(0)),(L2.symb.as["<="](L2_A,(1))))["!"]()["any"]("r").v[0]) {
      L2.ge.error('value between 0 and 1 expected'); }
    var L2_getQuant = function(L2_Y) { if (!L2.aTab(L2_Y)) L2_Y = new L2.ArJSA([L2_Y]);
      if ((L2_Y.v.length===(0))) {
        return (new L2.Ar(L2_A.r,(NaN))); }
      L2_Y = L2_Y._map(L2.pf.ew.num)["asc"]();
      var L2_Scaled = L2.symb.as["*"](L2_A,((L2_Y.r-(1))));
      var L2_Wt = L2.symb.aa.apply("-",L2_Scaled,(L2_Scaled._map(L2.pf.ew.floor)));

      if (((L2_Y._vEnt((0))===((-(Infinity)))) || ((L2_Y._vEnt((-1))===(Infinity))))) {
        return L2.symb.aa.apply("+",L2.symb.aa.apply("*",L2_Y._v((L2_Scaled._map(L2.pf.ew.floor))),(L2.symb.sa["-"]((1),L2_Wt)))["where:"]((0),(NaN),(0)),(L2.symb.aa.apply("*",L2_Y._v((L2_Scaled._map(L2.pf.ew.ceil))),L2_Wt)["where:"]((0),(NaN),(0))));
 }
      else {
        return L2.symb.aa.apply("+",L2.symb.aa.apply("*",L2_Y._v((L2_Scaled._map(L2.pf.ew.floor))),(L2.symb.sa["-"]((1),L2_Wt))),(L2.symb.aa.apply("*",L2_Y._v((L2_Scaled._map(L2.pf.ew.ceil))),L2_Wt))); } };
    var L2_copyExtras = function(L2_dim) { if (L2.aTab(L2_dim)) L2_dim = L2_dim.v[0];
      if (L2_X["hasKey"](L2.aux.validSfx(L2_dim,false))) {
        L2_R["key:"](L2.aux.validSfx(L2_dim,false),undefined,(L2_X["key"](L2.aux.validSfx(L2_dim,false)))); }
      if (L2_X["label"](L2.aux.validSfx(L2_dim,false))) {
        L2_R["label:"](L2.aux.validSfx(L2_dim,false),(L2_X["label"](L2.aux.validSfx(L2_dim,false)))); }
      if (L2_X["fmt"](L2.aux.validSfx(L2_dim,true))) {
        L2_R["fmt:"](L2.aux.validSfx(L2_dim,true),(L2_X["fmt"](L2.aux.validSfx(L2_dim,true)))); } };
    if ((L2_d==='e')) {
      return L2.tab(L2_getQuant(L2_X))["key:"]("r",undefined,L2_A); }
    else if ((L2_d==='r')) {
      if (L2.ge.isVec(L2_X)) {
        L2_R = L2.tab(L2_getQuant(L2_X))["key:"]("r",undefined,L2_A); }
      else {
        L2_R = (new L2.ArSh((new L2.ArJSA_Sh([L2_A.r,(L2_X.c)],2,1,1))._appendSc((L2_X.p),"r")))["key:"]("r",undefined,L2_A);
        var L2_i=0; var L2_i__limit=L2_X.c; for (; L2_i<L2_i__limit; L2_i++) {
          var L2_j=0; var L2_j__limit=L2_X.p; for (; L2_j<L2_j__limit; L2_j++) {
            L2_R._twoDimSet("c","p",(new L2.ArJSA([L2_i])),(new L2.ArJSA([L2_j])),(L2.tab(L2_getQuant(L2_X._twoDim("c","p",(new L2.ArJSA([L2_i])),(new L2.ArJSA([L2_j]))))))); } } }
      L2.tab(L2_copyExtras('c'));
      L2.tab(L2_copyExtras('p')); }
    else if ((L2_d==='c')) {
      L2_R = (new L2.ArSh((new L2.ArJSA_Sh([L2_X.r,(L2_A.r)],2,1,1))._appendSc((L2_X.p),"r")))["key:"]("c",undefined,L2_A);
      L2_i=0; L2_i__limit=L2_X.r; for (; L2_i<L2_i__limit; L2_i++) {
        L2_j=0; L2_j__limit=L2_X.p; for (; L2_j<L2_j__limit; L2_j++) {
          L2_R._twoDimSet("r","p",(new L2.ArJSA([L2_i])),(new L2.ArJSA([L2_j])),((new L2.ArTp(L2.tab(L2_getQuant(L2_X._twoDim("r","p",(new L2.ArJSA([L2_i])),(new L2.ArJSA([L2_j]))))))))); } }
      L2.tab(L2_copyExtras('r'));
      L2.tab(L2_copyExtras('p')); }
    else {
      L2_R = (new L2.ArSh((new L2.ArJSA_Sh([L2_X.r,(L2_X.c)],2,1,1))._appendSc((L2_A.r),"r")))["key:"]("p",undefined,L2_A);
      L2_i=0; L2_i__limit=L2_X.r; for (; L2_i<L2_i__limit; L2_i++) {
        L2_j=0; L2_j__limit=L2_X.c; for (; L2_j<L2_j__limit; L2_j++) {
          L2_R._twoDimSet("r","c",(new L2.ArJSA([L2_i])),(new L2.ArJSA([L2_j])),((new L2.ArTp(L2.tab(L2_getQuant(L2_X._twoDim("r","c",(new L2.ArJSA([L2_i])),(new L2.ArJSA([L2_j]))))),'cpr')))); } }
      L2.tab(L2_copyExtras('r'));
      L2.tab(L2_copyExtras('c')); }
    return L2_R; };
  undefined;

  L2.Ar.prototype.quant = function(d,A) { 
    if (arguments.length === 1) A = new L2.ArJSA([0,0.25,0.5,0.75,1]);
    return L2_quant(this,d,A) };
  L2.Ar.prototype.quant.sig = {arg:[2], rtn:true, min:0, dim:2};





  var L2_smry = function(L2_X,L2_d) { if (!L2.aTab(L2_X)) L2_X = new L2.ArJSA([L2_X]); if (L2.aTab(L2_d)) L2_d = L2_d.v[0]; var L2_R = new L2.ArJSA([undefined]);
    var L2_Key = (new L2.ArJSA(['type','finite','mean','sd','min','25%','50%','75%','max']));
    var L2_Qt = (new L2.ArJSA([(0),(0.25),(0.5),(0.75),(1)]));
    var L2_vecSmry = function(L2_V) { if (!L2.aTab(L2_V)) L2_V = new L2.ArJSA([L2_V]);
      if (L2_V._map(L2.pf.ew.isFin)["all"]("e").v[0]) {
        return (new L2.ArJSA(['number',true,(L2_V["mean"]("e")).v[0],(L2_V["sd"]("e")).v[0]]))._appendAr((L2.tab(L2_quant(L2_V,'e',L2_Qt))),"r",true); }
      else {
        return (new L2.ArJSA(['number',false]))._appendAr(((new L2.Ar((7),'--'))),"r",true); } };
    if ((L2_d==='e')) {
      var L2_typ = L2_X["homog"]("e").v[0];
      L2_R = ((L2_typ==='number') ? (L2.tab(L2_vecSmry(L2_X))) : ((new L2.ArJSA([L2_typ]))._appendAr(((new L2.Ar((8),'--'))),"r",true)))["key:"]("r",undefined,L2_Key); }
    else if ((L2_d==='r')) {
      L2_R = L2_X["homog"]("r")._appendAr(((new L2.ArSh((new L2.ArJSA([(8),(L2_X.c),(L2_X.p)])),'--'))),"r",true)["key:"]("r",undefined,L2_Key);
      var L2_c=0; var L2_c__limit=L2_X.c; for (; L2_c<L2_c__limit; L2_c++) {
        var L2_p=0; var L2_p__limit=L2_X.p; for (; L2_p<L2_p__limit; L2_p++) {
          if ((L2_R._slashEnt3((0),L2_c,L2_p)==='number')) {
            L2_R._twoDimSet("c","p",(new L2.ArJSA([L2_c])),(new L2.ArJSA([L2_p])),(L2.tab(L2_vecSmry(L2_X._twoDim("c","p",(new L2.ArJSA([L2_c])),(new L2.ArJSA([L2_p]))))))); } } } }
    else if ((L2_d==='c')) {
      L2_R = L2_X["homog"]("c")._appendAr(((new L2.ArSh((new L2.ArJSA([L2_X.r,(8),(L2_X.p)])),'--'))),"c",true)["key:"]("c",undefined,L2_Key);
      var L2_r=0; var L2_r__limit=L2_X.r; for (; L2_r<L2_r__limit; L2_r++) {
        L2_p=0; L2_p__limit=L2_X.p; for (; L2_p<L2_p__limit; L2_p++) {
          if ((L2_R._slashEnt3(L2_r,(0),L2_p)==='number')) {
            L2_R._twoDimSet("r","p",(new L2.ArJSA([L2_r])),(new L2.ArJSA([L2_p])),((new L2.ArTp(L2.tab(L2_vecSmry(L2_X._twoDim("r","p",(new L2.ArJSA([L2_r])),(new L2.ArJSA([L2_p]))))))))); } } } }
    else {
      L2_R = L2_X["homog"]("p")._appendAr(((new L2.ArSh((new L2.ArJSA([L2_X.r,(L2_X.c),(8)])),'--'))),"p",true)["key:"]("p",undefined,L2_Key);
      L2_r=0; L2_r__limit=L2_X.r; for (; L2_r<L2_r__limit; L2_r++) {
        L2_c=0; L2_c__limit=L2_X.c; for (; L2_c<L2_c__limit; L2_c++) {
          if ((L2_R._slashEnt3(L2_r,L2_c,(0))==='number')) {
            L2_R._twoDimSet("r","c",(new L2.ArJSA([L2_r])),(new L2.ArJSA([L2_c])),((new L2.ArTp(L2.tab(L2_vecSmry(L2_X._twoDim("r","c",(new L2.ArJSA([L2_r])),(new L2.ArJSA([L2_c]))))),'cpr')))); } } } }
    return L2_R; };
  undefined;

  L2.Ar.prototype.smry = function(d) { return L2_smry(this,d) };
  L2.Ar.prototype.smry.sig = {arg:[], rtn:true, min:0, dim:2};









  var L2_cov = function(L2_A,L2_normBy) { if (!L2.aTab(L2_A)) L2_A = new L2.ArJSA([L2_A]); if (L2.aTab(L2_normBy)) L2_normBy = L2_normBy.v[0];
    if ((L2_A.r<(2))) {
      L2_A = L2_A._shell((NaN)); }
    else {
      L2_A = L2.symb.aa.apply("-",L2_A,(L2_A["mean"]("r")["to"](L2_A))); }
    return L2.symb.as["/"]((new L2.ArTp(L2_A))["mm"](L2_A),((L2_normBy ? (L2_A.r) : ((L2_A.r-(1)))))); };
  undefined;

  L2.Ar.prototype.cov = function(normBy) {
    if (arguments.length && normBy !== 'n') throw new Error('argument must be \'n\'');
    return L2_cov(this,normBy) }
  L2.Ar.prototype.cov.sig = {arg:[1], rtn:true, min:0, dim:0};




  var L2_corr = function(L2_A) { if (!L2.aTab(L2_A)) L2_A = new L2.ArJSA([L2_A]);
    L2_A = L2.tab(L2_cov(L2_A));
    var L2_StdDev = L2_A["diag"]()._map(L2.pf.ew.sqrt);
    return L2.symb.aa.apply("/",L2_A,(L2_StdDev["mm"](((new L2.ArTp(L2_StdDev)))))); };
  undefined;

  L2.Ar.prototype.corr = function() { return L2_corr(this) };
  L2.Ar.prototype.corr.sig = {arg:[], rtn:true, min:0, dim:0};
















  var L2_toHTML = function(L2_tag,L2_Ops,L2_vec) { if (L2.aTab(L2_tag)) L2_tag = L2_tag.v[0]; if (!L2.aTab(L2_Ops)) L2_Ops = new L2.ArJSA([L2_Ops]); if (L2.aTab(L2_vec)) L2_vec = L2_vec.v[0];
    if ((!L2.ge.isDict(L2_Ops))) {
      L2.ge.error('dictionary expected'); }
    var L2_isVoid = L2.symb.sa["=="](L2_tag,((new L2.ArJSA(['area','base','br','col','embed','hr','img','input','keygen','link','menuitem','meta','param','source','track','wbr']))))["any"]("r").v[0];

    if (L2_Ops.r) {
      if ((new L2.ArJSA(['n']))["in"]((L2_Ops["key"]("r"))).v[0]) {
        var L2_n = L2_Ops["_barEnt1"]('n');
        if (L2.pf.ew.isBox(L2_n)) {
          L2_n = L2.aux.openIfBox(L2_n).v[+(0)]; }
        L2_n = L2.pf.ew.num(L2_n);
        if (((!L2.pf.ew.isInt(L2_n)) || ((L2_n<(0))))) {
          L2.ge.error('\'n\' option: non-negative integer expected'); } }
      else {
        L2_n = L2_Ops["map"]((function(L2_A) { if (!L2.aTab(L2_A)) L2_A = new L2.ArJSA([L2_A]); return L2_A.v.length}))["max"]("e").v[0]; } }
    else {
      L2_n = (1); }
    var L2_S = (new L2.Ar(L2_n,(('<'+L2_tag))));
    var L2_addVals = function(L2_k) { if (L2.aTab(L2_k)) L2_k = L2_k.v[0]; var L2_X = new L2.ArJSA([undefined]);
      var L2_x = L2_Ops.v[+L2_k];
      if (L2.pf.ew.isBox(L2_x)) {
        L2_X = L2.sc.unwrap(L2_x);
        if ((L2_X.v.length===L2_n)) {
          L2_S = L2.symb.aa.apply("+",L2_S,((L2.ge.isVec(L2_X) ? L2_X : (L2_X._v())))); }
        else {
          var L2_j=0; var L2_j__limit=L2_S.r; for (; L2_j<L2_j__limit; L2_j++) {
            L2_S["_slashEnt1:"](L2_j,(((L2_S.v[+L2_j])+(L2_X.v[+((L2_j%(L2_X.v.length)))])))); } } }
      else {
        L2_S = L2.symb.as["+"](L2_S,(L2_x)); } };
    var L2_i=0; var L2_i__limit=L2_Ops.r; for (; L2_i<L2_i__limit; L2_i++) {
      var L2_attrib = L2_Ops["keyAt"]("r",L2_i);
      if ((L2_attrib==='inner')) {
        var L2_inner = L2_i;
        continue; }
      else if ((L2_attrib==='n')) {
        continue; }
      L2_S = L2.symb.as["+"](L2_S,(((' '+L2_attrib)+'="')));
      L2.sca(L2_addVals(L2_i));
      L2_S = L2.symb.as["+"](L2_S,('"')); }
    L2_S = L2.symb.as["+"](L2_S,('>'));
    if (L2.pf.ew.isNum(L2_inner)) {
      if (L2_isVoid) {
        L2.ge.error('cannot use \'inner\' option with this tag'); }
      L2.sca(L2_addVals(L2_inner)); }
    if ((!L2_isVoid)) {
      L2_S = L2.symb.as["+"](L2_S,((('</'+L2_tag)+'>'))); }
    if (L2_vec) {
      return L2_S; }
    else {
      return L2_S["join"]("r",'').v[0]; } };
  undefined;

  L2.aux.toHTML = function(t,o,v) { return L2_toHTML(t,o,v) };




  ;(function() {


    var L2_env = env = L2.runningIn === 'nw';
    if (env) var vegaPlotNum = 0;


    var L2_TypeLookup = L2.sc.pairNone()._dPush("q",'quantitative')._dPush("t",'temporal')._dPush("o",'ordinal')._dPush("n",'nominal');





    var L2_expandType = function(L2_t) { if (L2.aTab(L2_t)) L2_t = L2_t.v[0];
      L2_t = L2.pf.ew.str(L2_t);
      if ((L2_t.length>(1))) {
        return L2_t; }
      L2_t = L2_TypeLookup["_barEnt1"](L2_t);
      if ((!L2_t)) {
        'invalid 1-character channel type'; }
      return L2_t;
 };
    var L2_addChannel_dict = function(L2_S,L2_name,...L2_Op) { if (!L2.aTab(L2_S)) L2_S = new L2.ArJSA([L2_S]); if (L2.aTab(L2_name)) L2_name = L2_name.v[0]; L2_Op = L2.aux.pair(L2_Op);
      if (L2_Op["hasKey"]("r",'type')) {
        L2_Op._dPush("type",(L2.sca(L2_expandType((L2_Op._dEnt("type")))))); }
      L2.sc._dPush(L2_S._dEnt("encoding"),L2_name,(new L2.Box((L2_Op))));
 };
    var L2_addChannel_basic = function(L2_S,L2_name,L2_field,L2_type) { if (!L2.aTab(L2_S)) L2_S = new L2.ArJSA([L2_S]); if (L2.aTab(L2_name)) L2_name = L2_name.v[0]; if (L2.aTab(L2_field)) L2_field = L2_field.v[0]; if (L2.aTab(L2_type)) L2_type = L2_type.v[0];
      L2.sc._dPush(L2_S._dEnt("encoding"),L2_name,(new L2.Box((L2.sc.pairMult('field',L2_field,'type',(L2.sca(L2_expandType(L2_type))))))));






 };
    var L2_spec = function(L2_dim,L2_X,L2_Op) { if (L2.aTab(L2_dim)) L2_dim = L2_dim.v[0]; if (!L2.aTab(L2_X)) L2_X = new L2.ArJSA([L2_X]); if (!L2.aTab(L2_Op)) L2_Op = new L2.ArJSA([L2_Op]); var L2_V = new L2.ArJSA([undefined]); var L2_Data = new L2.ArJSA([undefined]); var L2_Field = new L2.ArJSA([undefined]); var L2_Tmp = new L2.ArJSA([undefined]);


      var L2_S = L2.sc.pairMult('description','spec','data',(new L2.Box((L2.sc.pairNone()))),'config',(new L2.Box((L2.sc.pair('background','#fff')))),'mark','line','encoding',(new L2.Box((L2.sc.pairNone()))));





      if ((arguments.length<(2))) {
        return L2_S;

 }
      if ((!L2.ge.isDict(L2_Op))) {
        L2_Op = L2.sc.pairNone(); }
      if (L2_Op["hasKey"]("r",'url')) {
        L2_S._dPush("data",(new L2.Box((L2.sc.pair('url',(L2_Op._dEnt("url"))))))); }
      else if ((!L2.ge.isNil(L2_X))) {
        L2_S._dPush("data",(new L2.Box((L2.sc.pair('values',(new L2.Box((L2_X["nest"](L2.aux.validSfx(L2_dim,true),(L2_Op["_barEnt1"]('entry')),(L2_Op["_barEnt1"]('full')))))))))));

 }
      var L2_Op_simple = (new L2.ArJSA(['mark','width','height','title']))["dict"](true);
      var L2_Op_notWithUrl = (new L2.ArJSA(['entry','full']))["dict"](true);
      var L2_Op_plot = (new L2.ArJSA(['embed','put','richTooltip']))["dict"](true);
      var L2_Op_compose_val = (new L2.ArJSA(['layer','hconcat','vconcat','spec']))["dict"](true);
      var L2_val__index=0; var L2_val__limit=L2_Op.v.length; var L2_val=L2_Op.v[0]; for (;L2_val__index<L2_val__limit; L2_val=L2_Op.v[++L2_val__index]) {
        var L2_key = L2_Op["keyAt"]("r",L2_val__index);
        if (L2_Op_simple["_barEnt1"](L2_key)) {
          L2_S._dPush(L2_key,(L2_val)); }
        else if (L2_Op_notWithUrl["_barEnt1"](L2_key)) {
          if (L2_Op["hasKey"]("r",'url')) {
            L2.ge.error((('cannot use \''+L2_key)+'\' option with \'url\' option')); }
          continue; }
        else if (L2_Op_plot["_barEnt1"](L2_key)) {
          L2.ge.error((('invalid option:  \''+L2_key)+'\'')); }
        else if ((L2_key==='url')) {
          continue; }
        else if ((L2_key==='compose')) {
          if ((!L2_Op_compose_val["_barEnt1"](L2_val))) {
            L2.ge.error('invalid \'comp\' option'); }
          var L2_compose = L2_val; }
        else {
          if (L2.pf.ew.isBox(L2_val)) {
            L2_V = L2.sc.unwrap(L2_val);
            if ((L2_V.r===(0))) {
              L2.ge.error((('at least one value expected (channel option \''+L2_key)+'\')')); }
            if (L2.ge.isDict(L2_V)) {
              L2.tab(L2_addChannel_dict(L2_S,L2_key,L2_V)); }
            else if ((L2_V.r===(1))) {
              L2.sca(L2_addChannel_basic(L2_S,L2_key,(L2_V.v[+(0)]),'quantitative')); }
            else if ((L2_V.r===(2))) {
              L2.sca(L2_addChannel_basic(L2_S,L2_key,(L2_V.v[+(0)]),(L2.sca(L2_expandType(L2_V.v[+(1)]))))); }
            else {
              L2.ge.error((('dictionary expected (channel option \''+L2_key)+'\', more than 2 entries)')); } }
          else {
            L2.sca(L2_addChannel_basic(L2_S,L2_key,L2_val,'quantitative'));

 } } }
      if (((L2.sc.unwrap(L2_S._dEnt("data"))["hasKey"]("r",'values') && ((L2.sc.unwrap(L2_S._dEnt("encoding")).r===(0)))) && ((!L2.pf.ew.isBox(L2_X.v[+(0)]))))) {
        L2_Data = L2.sc.unwrap(L2.sc._dEnt(L2_S._dEnt("data"),"values"));
        if ((L2_Data.r===(0))) {
          return L2_S; }
        L2_Field = L2.sc.unwrap(L2_Data.v[+(0)])["key"]("r");
        var L2_nF = L2_Field.r;
        var L2_mark = L2_S._dEnt("mark");
        if ((new L2.ArJSA([L2_mark]))["in"](((new L2.ArJSA(['area','bar','circle','line','point','rect','square'])))).v[0]) {
          var L2_xType = ((new L2.ArJSA([L2_mark]))["in"](((new L2.ArJSA(['bar','rect'])))).v[0] ? 'n' : 'q');
          var L2_yType = ((L2_mark==='rect') ? 'n' : 'q');
          L2.sca(L2_addChannel_basic(L2_S,'y',(L2_Field.v[+(0)]),L2_yType));
          if ((L2_dim==='e')) {
            if ((L2_nF>(1))) {
              L2.sca(L2_addChannel_basic(L2_S,'x',(L2_Field.v[+(1)]),L2_xType));
              if ((L2_nF>(2))) {
                L2.sca(L2_addChannel_basic(L2_S,'color',(L2_Field.v[+(2)]),'n')); } } }
          else {
            var L2_nMainDim = L2_X._n(L2_dim);
            if ((L2_nF>L2_nMainDim)) {
              L2.sca(L2_addChannel_basic(L2_S,'x',(L2_Field.v[+L2_nMainDim]),L2_xType)); }
            if ((L2_nMainDim>(1))) {
              L2.sca(L2_addChannel_basic(L2_S,'color',(L2_Field.v[+(1)]),'n')); } } }
        else if ((new L2.ArJSA([L2_mark]))["in"](((new L2.ArJSA(['rule','tick'])))).v[0]) {
          L2.sca(L2_addChannel_basic(L2_S,'x',(L2_Field.v[+(0)]),'q'));
          if ((L2_nF>(1))) {
            L2.sca(L2_addChannel_basic(L2_S,(((L2_mark==='rule') ? 'color' : 'y')),(L2_Field.v[+(1)]),'n'));

 } } }
      if (L2_compose) {
        L2_Tmp = L2.sc.pairMult('mark',(L2_S._dEnt("mark")),'encoding',(L2_S._dEnt("encoding")));
        L2_S._dPush(L2_compose,(((L2_compose==='spec') ? ((new L2.Box(L2_Tmp))) : ((new L2.Box((new L2.ArJSA([(new L2.Box(L2_Tmp))]))))))));
        L2_S._oneDimAr("r",((new L2.ArJSA(['mark','encoding']))),'cut');
 }
      return L2_S; };
    undefined;

    L2.Ar.prototype.spec = function(d,...op) { return L2_spec(d, this, L2.aux.pair(op)) };
    L2.Ar.prototype.spec.sig = {arg:false, rtn:true, min:0, dim:2};


    var L2_EmbedDef = L2.sc.pairMult('$schema','https://vega.github.io/schema/vega-lite/v2.json','mode','vega-lite','actions',false);









    var L2_plot = function(L2_dim,L2_X,L2_Op) { if (L2.aTab(L2_dim)) L2_dim = L2_dim.v[0]; if (!L2.aTab(L2_X)) L2_X = new L2.ArJSA([L2_X]); if (!L2.aTab(L2_Op)) L2_Op = new L2.ArJSA([L2_Op]);


      L2_Op = (L2.ge.isDict(L2_Op) ? ((new L2.ArCopy(L2_Op,true,'deep'))) : (L2.sc.pairNone()))._owise(L2.sc.pairMult('put','','embed',(new L2.Box(L2_EmbedDef)),'richTooltip',true));



      var L2_OpPlot = L2_Op._oneDimAr("r",((new L2.ArJSA(['put','embed','richTooltip']))),'cut');

      var L2_put = L2_OpPlot._dEnt("put");
      if ((L2_env && ((new L2.ArJSA([L2_put]))["in"]((L2.sc.range((1),(4))))).v[0])) {
        var L2_panel = true;
        if ((L2.sc._dEnt(L2_OpPlot._dEnt("embed"),"mode")!=='vega-lite')) {
          L2.ge.error('the plot panel can only display Vega-Lite plots');

 } }
      if ((L2.ge.isDict(L2_X) && (((L2_X["_barEnt1"]('description')==='spec') || (((L2.pf.ew.isBox(L2_X["_barEnt1"]('spec')) && (L2.ge.isDict(L2.sc.unwrap(L2_X._dEnt("spec"))))) && ((L2.aux.openIfBox(L2_X._dEnt("spec"))["_barEnt1"]('description')==='spec')))))))) {


        if ((L2_Op.r!==(0))) {
          L2.ge.error((('invalid option \''+(L2_Op["keyAt"]("r",(0))))+'\' (cannot pass spec and spec options)')); } }
      else {
        L2_X = L2.tab(L2_spec(L2_dim,L2_X,L2_Op));

 }
      undefined;

      if (L2_panel) {
        L2.ide.vegaData[L2_put-1] = L2.toJS(L2_X);
        L2.aux.drawPlot(L2_put-1) }      
      else L2.aux.drawPlot(L2.toJS(L2_X), L2.toJS(L2_OpPlot,'allow'));

      return L2_X; };
    undefined;

    L2.Ar.prototype.plot = function(d,...op) { return L2_plot(d, this, L2.aux.pair(op)) };
    L2.Ar.prototype.plot.sig = {arg:false, rtn:true, min:0, dim:2};

    // Create plot.
    //    x: jso representing a spec or: 
    //       int in [0..3] - only in env, plot to pane x of panel
    //    op: jso, plot options - ignored if plotting to panel      
    // Returns undefined.
    L2.aux.drawPlot = (x,op) => {
      if (!env && L2.runningIn !== 'wp') return;
      var put, embed, richTooltip, trgt, panel, spec, el;
      if (typeof x === 'object') {  //plot to console or in HTML doc
        spec = x;
        ({put, embed, richTooltip} = op);
        if (env) trgt = document.getElementById('oput') }
      else {  //panel
        spec = L2.ide.vegaData[x];
        panel = true;
        put = x;
        embed = L2.toJS(L2_EmbedDef);
        embed.padding = {left: 10, top: 10, right: 10, bottom: 10};
        richTooltip = true;
        trgt = document.getElementById('pl_' + put);
        trgt.innerHTML = '';
        spec.autosize = 'fit';
        spec.width = trgt.clientWidth - 19;  //1px larger then should be - no risk of lines between plots
        spec.height = trgt.clientHeight - 19 }
        
      if (env) {
        trgt.insertAdjacentHTML('beforeend',
          '<div class="L2VegaWrapper' + (panel ? 'Panel' : '') +'"><div id="vegaPlot_' + 
          (vegaPlotNum++) + '"></div></div><br>');
        el = '#vegaPlot_' + (vegaPlotNum-1) }
      else {
        el = embed.put;
        if (typeof el === 'string') el = L2.html(document.querySelectorAll(el)); 
        else if (typeof el !== 'function' || !el._html_) throw new Error('string or element list expected');
        if (!el._html_.size) throw new Error('empty element list');
        el = el._html_._elmt(0);
      }    
      var scrollConsole = () => $('#co_in').scrollTop(10e10).scrollLeft(0);	 //jQ available in env
      vegaEmbed(el, spec, embed).then( function(result) {
        if (richTooltip) vegaTooltip.vegaLite(result.view, spec, richTooltip);
        if (env) scrollConsole() } )
      .catch( function(err) { //error, catch it or can prevent vega displaying future plots
        if (env) {
          if (panel) {
            trgt.innerHTML = '';
            L2.ide.vegaData[put] = undefined }
          document.getElementById('oput').insertAdjacentHTML('beforeend',
            '<div class="noIndent L2Other">Problem drawing Vega plot:<br>' + 
            L2.aux.specChar(err.message) + '</div><br>');            
          scrollConsole() }
        else console.log('Problem drawing Vega plot:\n' + err.message) } );
    }



 }()); }());