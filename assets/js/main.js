function toast(msg){const t=document.getElementById('toast');if(!t) return alert(msg);t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function toggleMenu(){document.getElementById('mobileMenu').classList.toggle('open')}
function toggleFaq(btn){const item=btn.closest('.faq-item');const was=item.classList.contains('open');document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));if(!was) item.classList.add('open');}

(function(){
  const KEY='nexumo_offer_end';
  function createEnd(initial){
    const now=Date.now();
    let days, hours, mins, secs;
    if(initial){ days=14; hours=0; mins=Math.floor(Math.random()*60); secs=Math.floor(Math.random()*60); }
    else { days=7+Math.floor(Math.random()*8); hours=Math.floor(Math.random()*24); mins=Math.floor(Math.random()*60); secs=Math.floor(Math.random()*60); }
    const ms = ((days*24 + hours)*3600 + mins*60 + secs)*1000;
    const end = now + ms;
    localStorage.setItem(KEY, end);
    return end;
  }
  let end = parseInt(localStorage.getItem(KEY)||'0',10);
  if(!end || end < Date.now()) end = createEnd(true);
  function tick(){
    let diff = end - Date.now();
    if(diff <= 0){ end = createEnd(false); diff = end - Date.now(); toast('¡Nueva oferta activada!'); }
    const d = Math.floor(diff/86400000);
    const h = Math.floor(diff%86400000/3600000);
    const m = Math.floor(diff%3600000/60000);
    const s = Math.floor(diff%60000/1000);
    const pad = n => String(n).padStart(2,'0');
    const elD=document.getElementById('cd-days'), elH=document.getElementById('cd-hours'), elM=document.getElementById('cd-min'), elS=document.getElementById('cd-sec');
    if(elD) elD.textContent=pad(d);
    if(elH) elH.textContent=pad(h);
    if(elM) elM.textContent=pad(m);
    if(elS) elS.textContent=pad(s);
  }
  tick(); setInterval(tick,1000);
})();

document.addEventListener('DOMContentLoaded', ()=>{
  lucide.createIcons();
  if(document.getElementById('grid')) renderGrid(PRODUCTS);
  updateCart();
});
