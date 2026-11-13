
(function(){
  var q=document.getElementById('q'), cards=[].slice.call(document.querySelectorAll('#grid .card')),
      count=document.getElementById('count'), empty=document.getElementById('empty'),
      sel={brand:null,cat:null};
  function apply(){
    var word=(q.value||'').trim().toLowerCase(), n=0;
    var usec=document.getElementById('upcoming-sec');
    if(usec)usec.style.display=(sel.brand||sel.cat||word)?'none':'';
    cards.forEach(function(c){
      var ok=(!sel.brand||c.dataset.brand===sel.brand)&&(!sel.cat||(c.dataset.cat||'').split('|').indexOf(sel.cat)>=0)
             &&(!word||c.dataset.search.indexOf(word)>-1);
      c.style.display=ok?'':'none'; if(ok)n++;
    });
    count.textContent='全'+n+'件'; empty.hidden=n>0;
  }
  document.querySelectorAll('.chip').forEach(function(ch){
    ch.addEventListener('click',function(){
      var t=ch.dataset.type;
      if(sel[t]===ch.dataset.val){sel[t]=null;ch.classList.remove('on');}
      else{sel[t]=ch.dataset.val;
        document.querySelectorAll('.chip[data-type="'+t+'"]').forEach(function(x){x.classList.toggle('on',x===ch);});}
      apply();
    });
  });
  q.addEventListener('input',apply); apply();
  var utg=document.getElementById('up-toggle'), umini=document.getElementById('up-mini'), ufull=document.getElementById('up-full');
  if(utg&&umini&&ufull){utg.addEventListener('click',function(){
    var open=ufull.hidden; ufull.hidden=!open; umini.style.display=open?'none':'';
    utg.textContent=open?'コンパクト表示に戻す ▴':'カードで広げる ▾';
  });}
})();
