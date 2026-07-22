(function(){
  var EP = window.PORTFOLIO_ANALYTICS_ENDPOINT || (function(){
    var s = localStorage.getItem('pf_endpoint');
    if (s && (s.indexOf('AKfycbxkYqQVIFUj94LvY_L_cfm-SoVL7F2dGuW157ezBzEkrrPnnT8I-BYZLzxdw4ei49Oevg') > -1 || s.indexOf('AKfycbxUQZeTza47oB-GAYb7l7lTqrBEunse0WpW_tTrqplHEGjBe-nAcMPkSvsX4YuoTUob') > -1 || s.indexOf('AKfycbwhJ_cQs5hDh-FpvmxJd6ZeLk2Bk_U0zpx2wPhGhfNC0V5L45ki5pea6gsKgLr-qor86w') > -1)) { s = null; localStorage.removeItem('pf_endpoint'); }
    return s;
  })() || 'https://script.google.com/macros/s/AKfycbwXre2fheqUUTZwlxQsmATEVFRnzq9ZvV0-OzZyjaFBfQgiyqIjIjvFkkhw27zyq5AhHw/exec';

  var GW = 20, GH = 12; // mouse heatmap grid resolution

  function send(v){
    try{ var a=JSON.parse(localStorage.getItem('pf_visits')||'[]'); a.push(v); if(a.length>5000)a=a.slice(-5000); localStorage.setItem('pf_visits',JSON.stringify(a)); }catch(e){}
    if(EP){ try{ var body=JSON.stringify(v); if(navigator.sendBeacon){ navigator.sendBeacon(EP, body); } else { fetch(EP,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:body}); } }catch(e){} }
  }

  var SRC = (function(){ try{ var s=new URLSearchParams(location.search).get('src'); if(s){ localStorage.setItem('pf_src', s); return s; } return localStorage.getItem('pf_src') || ''; }catch(e){ return ''; } })();
  // session id: one per browser tab session (used to reconstruct navigation paths & sessions)
  var SID = (function(){ try{ var k=sessionStorage.getItem('pf_sid'); if(!k){ k=Date.now().toString(36)+Math.random().toString(36).slice(2,7); sessionStorage.setItem('pf_sid',k);} return k;}catch(e){ return Date.now().toString(36);} })();

  var IP = 'unknown';
  var ipP = fetch('https://api.ipify.org?format=json').then(function(r){return r.json();}).then(function(j){IP=j.ip;return j.ip;}).catch(function(){return 'unknown';});

  function evt(menu, data){ return { t: Date.now(), ip: IP, menu: menu, ref: document.referrer || 'direct', src: SRC, ua: navigator.userAgent.slice(0,80), data: data }; }

  // per-page (per-menu) live tracking
  var cur = null, activeMs = 0, lastResume = 0, clicks = [], grid = null, lastMove = 0;

  function newPage(){ activeMs=0; lastResume=Date.now(); clicks=[]; grid=new Array(GW*GH).fill(0); }
  function bank(){ if(lastResume){ activeMs += Date.now()-lastResume; lastResume=0; } }

  function flush(){
    if(cur===null) return;
    bank();
    var dur = Math.round(activeMs);
    if(dur>0) send(evt(cur, { ev:'dwell', sid:SID, dur:dur }));
    var moves=[]; if(grid){ for(var i=0;i<grid.length;i++){ if(grid[i]) moves.push([i,grid[i]]); } }
    if(clicks.length || moves.length){
      var p = { ev:'heat', sid:SID, gw:GW, gh:GH };
      if(clicks.length) p.clicks = clicks.slice(0,80);
      if(moves.length) p.moves = moves.slice(0,240);
      send(evt(cur, p));
    }
    // reset deltas so subsequent flushes are incremental (no double counting)
    activeMs=0; clicks=[]; grid=new Array(GW*GH).fill(0);
    lastResume = (document.visibilityState==='visible') ? Date.now() : 0;
  }

  function onClick(e){ if(cur===null) return; var x=Math.round(e.clientX/Math.max(1,window.innerWidth)*100), y=Math.round(e.clientY/Math.max(1,window.innerHeight)*100); if(x>=0&&x<=100&&y>=0&&y<=100&&clicks.length<200) clicks.push([x,y]); }
  function onMove(e){ if(cur===null||!grid) return; var now=Date.now(); if(now-lastMove<100) return; lastMove=now; var gx=Math.floor(e.clientX/Math.max(1,window.innerWidth)*GW), gy=Math.floor(e.clientY/Math.max(1,window.innerHeight)*GH); if(gx<0)gx=0; if(gx>=GW)gx=GW-1; if(gy<0)gy=0; if(gy>=GH)gy=GH-1; grid[gy*GW+gx]++; }
  function onVis(){ if(document.visibilityState==='hidden'){ flush(); } else { lastResume=Date.now(); } }

  window.addEventListener('click', onClick, true);
  window.addEventListener('mousemove', onMove, true);
  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('pagehide', flush);
  window.addEventListener('beforeunload', flush);

  window.pfTrack = function(menu){
    menu = menu || 'introduction';
    var prev = cur;
    if(prev!==null) flush();          // record dwell + heatmap for the page being left
    cur = menu; newPage();
    ipP.then(function(){ send(evt(menu, { ev:'view', sid:SID, from: prev||'' })); });
  };

  window.pfTrack((location.hash||'').replace('#','') || 'introduction');
})();
