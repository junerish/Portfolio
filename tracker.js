(function(){
  var EP = window.PORTFOLIO_ANALYTICS_ENDPOINT || (function(){
    var s = localStorage.getItem('pf_endpoint');
    if (s && (s.indexOf('AKfycbxkYqQVIFUj94LvY_L_cfm-SoVL7F2dGuW157ezBzEkrrPnnT8I-BYZLzxdw4ei49Oevg') > -1 || s.indexOf('AKfycbxUQZeTza47oB-GAYb7l7lTqrBEunse0WpW_tTrqplHEGjBe-nAcMPkSvsX4YuoTUob') > -1)) { s = null; localStorage.removeItem('pf_endpoint'); }
    return s;
  })() || 'https://script.google.com/macros/s/AKfycbwhJ_cQs5hDh-FpvmxJd6ZeLk2Bk_U0zpx2wPhGhfNC0V5L45ki5pea6gsKgLr-qor86w/exec';
  function save(v){
    try{ var a=JSON.parse(localStorage.getItem('pf_visits')||'[]'); a.push(v); if(a.length>5000)a=a.slice(-5000); localStorage.setItem('pf_visits',JSON.stringify(a)); }catch(e){}
    if(EP){ try{ var body=JSON.stringify(v); if(navigator.sendBeacon){ navigator.sendBeacon(EP, body); } else { fetch(EP,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:body}); } }catch(e){} }
  }
  var SRC = (function(){ try{ var s=new URLSearchParams(location.search).get('src'); if(s){ localStorage.setItem('pf_src', s); return s; } return localStorage.getItem('pf_src') || ''; }catch(e){ return ''; } })();
  var ipP = fetch('https://api.ipify.org?format=json').then(function(r){return r.json();}).then(function(j){return j.ip;}).catch(function(){return 'unknown';});
  window.pfTrack = function(menu){
    ipP.then(function(ip){ save({ t: Date.now(), ip: ip, menu: menu || 'introduction', ref: document.referrer || 'direct', src: SRC, ua: navigator.userAgent.slice(0,80) }); });
  };
  window.pfTrack((location.hash||'').replace('#','') || 'introduction');
})();
