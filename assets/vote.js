
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, increment, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC_lPi5hrryJlI_6kSQ3Psm7Fg0Q5QEd9g",
  authDomain: "lurebako-votes.firebaseapp.com",
  projectId: "lurebako-votes",
  storageBucket: "lurebako-votes.firebasestorage.app",
  messagingSenderId: "384196445868",
  appId: "1:384196445868:web:a97eb9073b854cf9e7c109"
};
const FIELDS = ["s60", "s50", "s40", "sLow"];
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function escT(s){var d=document.createElement('div');d.textContent=String(s==null?'':s);return d.innerHTML;}

/* ---------- ルアー詳細ページ：釣果チェック（投票） ---------- */
var voteBox = document.getElementById('vote-box');
if (voteBox) {
  var lureId = voteBox.getAttribute('data-lure');
  var counts = {s60:0, s50:0, s40:0, sLow:0, total:0};
  var LSKEY = 'lb_votes';
  function myVotes(){
    try { return JSON.parse(localStorage.getItem(LSKEY) || '{}'); } catch(e){ return {}; }
  }
  function saveMine(m){ try { localStorage.setItem(LSKEY, JSON.stringify(m)); } catch(e){} }
  function render(){
    FIELDS.forEach(function(f){
      var el = voteBox.querySelector('[data-c="' + f + '"]');
      if (el) el.textContent = Math.max(0, counts[f] || 0);
    });
    var t = document.getElementById('vote-total');
    if (t) t.textContent = Math.max(0, counts.total || 0);
    var mine = myVotes()[lureId] || [];
    voteBox.querySelectorAll('.vote-btn').forEach(function(b){
      b.classList.toggle('on', mine.indexOf(b.getAttribute('data-f')) >= 0);
    });
  }
  var ref = doc(db, 'votes', lureId);
  getDoc(ref).then(function(snap){
    if (snap.exists()) { var d = snap.data(); FIELDS.concat(['total']).forEach(function(f){ counts[f] = d[f] || 0; }); }
    render();
  }).catch(function(){ render(); });
  render();
  voteBox.querySelectorAll('.vote-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var f = btn.getAttribute('data-f');
      var mine = myVotes();
      var arr = mine[lureId] || [];
      var has = arr.indexOf(f) >= 0;
      var delta = has ? -1 : 1;
      if (has) { arr = arr.filter(function(x){ return x !== f; }); } else { arr.push(f); }
      if (arr.length) { mine[lureId] = arr; } else { delete mine[lureId]; }
      saveMine(mine);
      counts[f] = Math.max(0, (counts[f] || 0) + delta);
      counts.total = Math.max(0, (counts.total || 0) + delta);
      render();
      btn.disabled = true;
      var upd = {}; upd[f] = increment(delta); upd.total = increment(delta);
      setDoc(ref, upd, {merge: true}).then(function(){
        btn.disabled = false;
      }).catch(function(){
        counts[f] = Math.max(0, (counts[f] || 0) - delta);
        counts.total = Math.max(0, (counts.total || 0) - delta);
        var m2 = myVotes(); var a2 = m2[lureId] || [];
        if (delta > 0) { a2 = a2.filter(function(x){ return x !== f; }); } else if (a2.indexOf(f) < 0) { a2.push(f); }
        if (a2.length) { m2[lureId] = a2; } else { delete m2[lureId]; }
        saveMine(m2);
        render();
        btn.disabled = false;
      });
    });
  });
}

/* ---------- 釣果ランキングページ ---------- */
var rankList = document.getElementById('rank-list');
if (rankList) {
  var LABELS = {total:'総合', s60:'60アップ', s50:'50アップ', s40:'40アップ'};
  var allRows = [];
  var curSort = 'total';
  function renderRank(){
    var key = curSort;
    var rows = allRows.filter(function(r){ return (r[key] || 0) > 0; });
    rows.sort(function(a, b){ return (b[key] || 0) - (a[key] || 0) || (b.total || 0) - (a.total || 0); });
    document.querySelectorAll('.rank-tab').forEach(function(t){
      t.classList.toggle('on', t.getAttribute('data-sort') === key);
    });
    if (!rows.length) {
      rankList.innerHTML = '<p class="empty">このサイズの釣果チェックはまだありません。</p>';
      return;
    }
    rankList.innerHTML = rows.map(function(r, i){
      var m = r.meta;
      var thumb = m.photo
        ? '<span class="rank-thumb"><img src="' + m.photo + '" alt="" loading="lazy"></span>'
        : '<span class="rank-thumb noimg"></span>';
      var brk = '60アップ ' + (r.s60||0) + '件 ・ 50アップ ' + (r.s50||0) + '件 ・ 40アップ ' + (r.s40||0) + '件 ・ それ以下 ' + (r.sLow||0) + '件';
      var main = (key === 'total')
        ? '<span class="rank-total">' + (r.total||0) + '件<small>合計</small></span>'
        : '<span class="rank-total">' + (r[key]||0) + '件<small>' + LABELS[key] + '（合計' + (r.total||0) + '件）</small></span>';
      return '<a class="rank-row" href="' + m.url + '"><span class="rank-no">' + (i + 1) + '</span>' + thumb +
        '<span class="rank-main"><span class="rank-brand">' + escT(m.brand) + '</span><br>' +
        '<span class="rank-name">' + escT(m.name) + '</span><br>' +
        '<span class="rank-break">' + brk + '</span></span>' + main + '</a>';
    }).join('');
  }
  var note = document.getElementById('rank-note');
  getDocs(collection(db, 'votes')).then(function(snap){
    var idx = window.LURE_INDEX || {};
    snap.forEach(function(d){
      var v = d.data(); var meta = idx[d.id];
      if (!meta) return;
      var row = {id: d.id, meta: meta, s60: v.s60||0, s50: v.s50||0, s40: v.s40||0, sLow: v.sLow||0, total: v.total||0};
      if (row.total > 0) allRows.push(row);
    });
    if (!allRows.length) {
      rankList.innerHTML = '<p class="empty">まだ釣果チェックがありません。各ルアーのページから、釣れたサイズをチェックしてみてください。</p>';
      if (note) note.textContent = '';
      return;
    }
    if (note) note.textContent = '投票のあったルアー ' + allRows.length + ' 件を表示しています。';
    renderRank();
  }).catch(function(){
    rankList.innerHTML = '<p class="empty">ランキングを読み込めませんでした。時間をおいて再度お試しください。</p>';
  });
  document.querySelectorAll('.rank-tab').forEach(function(t){
    t.addEventListener('click', function(){ curSort = t.getAttribute('data-sort'); renderRank(); });
  });
}
