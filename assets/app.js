
(function(){
  var q=document.getElementById('q'), cards=[].slice.call(document.querySelectorAll('.card')),
      count=document.getElementById('count'), empty=document.getElementById('empty'),
      sel={brand:null,cat:null};
  function apply(){
    var word=(q.value||'').trim().toLowerCase(), n=0;
    cards.forEach(function(c){
      var ok=(!sel.brand||c.dataset.brand===sel.brand)&&(!sel.cat||c.dataset.cat===sel.cat)
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
})();
