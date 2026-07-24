(function(){
  var EP = window.PORTFOLIO_ANALYTICS_ENDPOINT || (function(){
    var s = localStorage.getItem('pf_endpoint');
    return s || null;
  })() || 'https://script.google.com/macros/s/AKfycbwXre2fheqUUTZwlxQsmATEVFRnzq9ZvV0-OzZyjaFBfQgiyqIjIjvFkkhw27zyq5AhHw/exec';

  // 이미 이 세션에서 인증했으면 통과
  try { if (sessionStorage.getItem('pf_authed') === '1') return; } catch(e){}

  // 콘텐츠가 보이기 전에 가림막을 즉시 삽입
  var veil = document.createElement('div');
  veil.id = 'pf-gate-veil';
  veil.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#F7F6F3;display:flex;align-items:center;justify-content:center;font-family:"Noto Sans KR",system-ui,sans-serif';
  (document.body || document.documentElement).appendChild(veil);

  function remove(){ if (veil && veil.parentNode) veil.parentNode.removeChild(veil); }

  function showForm(){
    veil.innerHTML =
      '<div style="width:min(360px,86vw);background:#fff;border:1px solid #E8E7E4;border-radius:16px;padding:40px 32px;box-shadow:0 20px 60px rgba(47,43,61,0.12)">' +
        '<p style="font-family:\'Public Sans\',\'Noto Serif KR\',serif;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#FF9F43;margin:0 0 10px">Private</p>' +
        '<h1 style="font-family:\'Noto Serif KR\',serif;font-size:20px;font-weight:600;color:#2F2B3DE6;margin:0 0 4px">로그인이 필요합니다</h1>' +
        '<p style="font-size:12px;color:#2F2B3D8C;margin:0 0 24px">아이디와 비밀번호를 입력해 주세요.</p>' +
        '<input id="pf-gate-id" type="text" placeholder="아이디" autocomplete="username" style="width:100%;box-sizing:border-box;border:1px solid #E8E7E4;border-radius:9px;padding:12px 14px;font-size:14px;margin:0 0 10px;outline:none">' +
        '<input id="pf-gate-pw" type="password" placeholder="비밀번호" autocomplete="current-password" style="width:100%;box-sizing:border-box;border:1px solid #E8E7E4;border-radius:9px;padding:12px 14px;font-size:14px;margin:0 0 6px;outline:none">' +
        '<p id="pf-gate-err" style="font-size:12px;color:#e05252;margin:6px 2px 0;min-height:16px"></p>' +
        '<button id="pf-gate-go" style="width:100%;margin-top:14px;border:0;border-radius:9px;padding:13px;font-size:14px;font-weight:600;color:#fff;background:#2F2B3DE6;cursor:pointer">로그인</button>' +
      '</div>';
    var idEl = veil.querySelector('#pf-gate-id');
    var pwEl = veil.querySelector('#pf-gate-pw');
    var errEl = veil.querySelector('#pf-gate-err');
    var goEl = veil.querySelector('#pf-gate-go');
    idEl.focus();
    function submit(){
      var id = idEl.value.trim(), pw = pwEl.value;
      errEl.textContent = '';
      goEl.disabled = true; goEl.textContent = '확인 중…';
      fetch(EP + '?login=1&id=' + encodeURIComponent(id) + '&pw=' + encodeURIComponent(pw))
        .then(function(r){ return r.json(); })
        .then(function(j){
          if (j && j.ok){ try{ sessionStorage.setItem('pf_authed','1'); }catch(e){} remove(); }
          else { errEl.textContent = '아이디 또는 비밀번호가 올바르지 않습니다.'; goEl.disabled = false; goEl.textContent = '로그인'; pwEl.value=''; pwEl.focus(); }
        })
        .catch(function(){ errEl.textContent = '확인 중 오류가 발생했습니다. 다시 시도해 주세요.'; goEl.disabled = false; goEl.textContent = '로그인'; });
    }
    goEl.addEventListener('click', submit);
    [idEl, pwEl].forEach(function(el){ el.addEventListener('keydown', function(e){ if (e.key === 'Enter') submit(); }); });
  }

  fetch(EP + '?config=1')
    .then(function(r){ return r.json(); })
    .then(function(cfg){ if (cfg && cfg.loginEnabled){ showForm(); } else { remove(); } })
    .catch(function(){ remove(); }); // 설정 조회 실패 시 잠금 해제(락아웃 방지)
})();
