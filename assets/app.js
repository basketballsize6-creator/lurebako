
(function(){
  var q=document.getElementById('q'), form=document.getElementById('lures'),
      cards=[].slice.call(document.querySelectorAll('#grid .card')),
      count=document.getElementById('count'), empty=document.getElementById('empty'),
      sel={brand:null,cat:null}, words=[];
  function apply(){
    var n=0;
    var usec=document.getElementById('upcoming-sec');
    if(usec)usec.style.display=(sel.brand||sel.cat||words.length)?'none':'';
    cards.forEach(function(c){
      var ok=(!sel.brand||c.dataset.brand===sel.brand)&&(!sel.cat||(c.dataset.cat||'').split('|').indexOf(sel.cat)>=0)
             &&words.every(function(w){return c.dataset.search.indexOf(w)>-1;});
      c.style.display=ok?'':'none'; if(ok)n++;
    });
    count.textContent='全'+n+'件';
    var extraHits=0;
    [['rod-results','rod-grid','rod-count'],['reel-results','reel-grid','reel-count']].forEach(function(t){
      var sec=document.getElementById(t[0]); if(!sec)return;
      var hits=0;
      if(words.length){
        [].slice.call(document.querySelectorAll('#'+t[1]+' .card')).forEach(function(c){
          var ok=words.every(function(w){return c.dataset.search.indexOf(w)>-1;});
          c.style.display=ok?'':'none'; if(ok)hits++;
        });
      }
      sec.hidden=!(words.length&&hits>0);
      var cnt=document.getElementById(t[2]); if(cnt)cnt.textContent=hits;
      extraHits+=hits;
    });
    empty.hidden=(n>0||extraHits>0);
  }
  if(form)form.addEventListener('submit',function(e){
    e.preventDefault();
    words=(q.value||'').trim().toLowerCase().split(/\s+/).filter(Boolean);
    apply();
    count.scrollIntoView({behavior:'smooth',block:'start'});
  });
  q.addEventListener('input',function(){
    if(!(q.value||'').trim()&&words.length){ words=[]; apply(); }
  });
  document.querySelectorAll('.chip').forEach(function(ch){
    ch.addEventListener('click',function(){
      var t=ch.dataset.type;
      if(sel[t]===ch.dataset.val){sel[t]=null;ch.classList.remove('on');}
      else{sel[t]=ch.dataset.val;
        document.querySelectorAll('.chip[data-type="'+t+'"]').forEach(function(x){x.classList.toggle('on',x===ch);});}
      apply();
    });
  });
  apply();
  var utg=document.getElementById('up-toggle'), umini=document.getElementById('up-mini'), ufull=document.getElementById('up-full');
  if(utg&&umini&&ufull){utg.addEventListener('click',function(){
    var open=ufull.hidden; ufull.hidden=!open; umini.style.display=open?'none':'';
    utg.textContent=open?'コンパクト表示に戻す ▴':'カードで広げる ▾';
  });}
})();
