function toggleChat(){
  const p=document.getElementById('chatPanel');
  if(!p) return;
  p.classList.toggle('open');
  if(p.classList.contains('open')){ document.getElementById('chatInput').focus(); lucide.createIcons(); }
}
function chipAsk(text){ document.getElementById('chatInput').value=text; sendChat(); }
function chipAskL(n){ document.getElementById('chatInput').value = T('chip.q' + n); sendChat(); }
function sendChat(){
  const input=document.getElementById('chatInput');
  const txt=input.value.trim();
  if(!txt) return;
  const body=document.getElementById('chatBody');
  body.insertAdjacentHTML('beforeend','<div class="bubble user">'+escapeHtml(txt)+'</div>');
  input.value='';
  body.insertAdjacentHTML('beforeend','<div class="bubble bot" id="typing"><span class="bubble-typing"><span></span><span></span><span></span></span> '+escapeHtml(T('chat.writing'))+'</div>');
  body.scrollTop=body.scrollHeight;
  setTimeout(()=>{ const t=document.getElementById('typing'); if(t) t.remove(); body.insertAdjacentHTML('beforeend','<div class="bubble bot">'+botAnswer(txt)+'</div>'); body.scrollTop=body.scrollHeight; lucide.createIcons(); }, 700 + Math.random()*600);
}
function escapeHtml(s){ return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function eur(n){ return '€'+Number(n).toFixed(2).replace('.',','); }
function chatData(){ const l = (typeof LANG==='function') ? LANG() : 'es'; return (I18N.CHAT && I18N.CHAT[l]) || I18N.CHAT.es; }

function findProduct(q){
  if(typeof PRODUCTS==='undefined') return null;
  const items = chatData().items;
  for(const it of items){
    for(const k of it.k){ if(q.includes(norm(k))) return PRODUCTS.find(p=>p.id===it.id)||null; }
  }
  return null;
}

function botAnswer(raw){
  const C = chatData();
  const q = norm(raw);
  for(const f of C.faq){
    for(const k of f.k){ if(q.includes(norm(k))) return f.a; }
  }
  const p = findProduct(q);
  if(p) return C.prodT(Object.assign({}, p, (typeof prodLoc==='function') ? prodLoc(p) : {})) + C.contact;
  if(/precio|cuanto cuesta|cuanto vale|coste|price|how much|prix|combien/.test(q)) return C.priceRange;
  if(/proveedor|supplier|fournisseur/.test(q)) return C.providerFallback;
  return C.fallback + C.contact;
}
