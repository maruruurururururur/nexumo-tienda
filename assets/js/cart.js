let activeCat = 'all';
if(typeof toast === 'undefined'){ var toast = function(m){ try{ alert(m); }catch(e){} }; }
let cart = [];
try {
  const saved = localStorage.getItem('nexumo_cart');
  if (saved) cart = JSON.parse(saved);
} catch(e){}
if(!Array.isArray(cart)) cart = [];
const rawLen = cart.length;
cart = cart
  .map(c => {
    const p = (typeof PRODUCTS !== 'undefined') ? PRODUCTS.find(x => x.id === Number(c && c.id)) : null;
    if(!p) return null;
    const qty = Math.min(99, Math.max(1, parseInt(c.qty) || 1));
    return { id: p.id, name: p.name, price: p.price, qty };
  })
  .filter(Boolean);

function saveCart(){
  try{ localStorage.setItem('nexumo_cart', JSON.stringify(cart)); }
  catch(e){ toast('No se pudo guardar la cesta (almacenamiento bloqueado)'); }
}
function repairCart(){
  try{ localStorage.removeItem('nexumo_cart'); }catch(e){}
  cart = [];
  saveCart(); updateCart();
  toast('Cesta vaciada. Añade de nuevo tus productos.');
}

function icons(){ try{ if(window.lucide) lucide.createIcons(); }catch(e){} }

function renderGrid(list){
  const g = document.getElementById('grid');
  if(!g) return;
  document.getElementById('countLabel').textContent = list.length + ' productos · Hecho por Andres';
  if(list.length===0){
    g.innerHTML = '<div style="grid-column:1/-1;background:#121212;border:1px dashed #2a2a2a;border-radius:16px;padding:32px;text-align:center;color:#777">Sin resultados. Prueba otro filtro.</div>';
  } else {
    g.innerHTML = list.map(p=>`
      <article class="card">
        <div class="card-top">
          <span class="badge">${p.badge}</span>
          <h3><span class="line1">${p.title1}</span><span class="line2">${p.title2}</span></h3>
          <div class="illust"><i data-lucide="${p.icon}" style="width:32px;height:32px;color:#fff"></i></div>
        </div>
        <div class="card-body">
          <h4>${p.name}</h4>
          <div class="price-row2">
            <span class="now">€${p.price.toFixed(2)}</span>
            <span class="was">€${p.was.toFixed(2)}</span>
            <span class="stock"><span class="dot ${p.stock.includes('stock')||p.stock.includes('In')?'ok':'out'}"></span>${p.stock}</span>
          </div>
          <div class="actions">
            <button class="btn-cart" onclick="addToCart(${p.id});openCart()" aria-label="Anadir"><i data-lucide="shopping-cart" style="width:16px;height:16px"></i></button>
            <button class="btn-get" onclick="buyNow(${p.id})">OBTENER</button>
          </div>
        </div>
      </article>
    `).join('');
  }
  icons();
}

function applyFilters(){
  const kw=(document.getElementById('kw').value||'').toLowerCase().trim();
  const min=parseFloat(document.getElementById('minP').value);
  const max=parseFloat(document.getElementById('maxP').value);
  let list=[...PRODUCTS];
  if(activeCat!=='all') list=list.filter(p=>p.cat===activeCat);
  if(kw) list=list.filter(p=> (p.name+' '+p.title1+' '+p.title2).toLowerCase().includes(kw));
  if(!isNaN(min)) list=list.filter(p=>p.price>=min);
  if(!isNaN(max)) list=list.filter(p=>p.price<=max);
  renderGrid(list);
}
function filterCat(c){
  activeCat=c;
  document.querySelectorAll('.cat-btn').forEach(b=>b.classList.toggle('active', b.dataset.cat===c));
  applyFilters();
}
function resetFilters(){
  activeCat='all';
  document.getElementById('kw').value='';document.getElementById('minP').value='';document.getElementById('maxP').value='';
  document.querySelectorAll('.cat-btn').forEach(b=>b.classList.toggle('active', b.dataset.cat==='all'));
  renderGrid(PRODUCTS);
}
function addToCart(id){
  const p=PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  const ex=cart.find(x=>x.id===id);
  if(ex) ex.qty++; else cart.push({id:p.id,name:p.name,price:p.price,qty:1});
  saveCart(); updateCart(); toast('Añadido: '+p.name);
}
function cartTotal(){ return cart.reduce((s,c)=>(Number(c.price)||0)*(parseInt(c.qty)||0)+s,0); }
function updateCart(){
  const total = cartTotal();
  const cc = document.getElementById('cartCount');
  if(cc) cc.textContent = cart.reduce((s,c)=>s+(parseInt(c.qty)||0),0);
  const st = document.getElementById('subtotal');
  if(st) st.textContent='€'+total.toFixed(2);
  const wrap=document.getElementById('cartItems');
  if(!wrap) return;
  if(cart.length===0){
    wrap.innerHTML='<div class="empty">Tu carrito está vacío.<br>Añade algún pack para empezar <i data-lucide="rocket" style="width:14px;height:14px;display:inline-block;vertical-align:middle;color:var(--red)"></i></div>';
  } else {
    wrap.innerHTML=cart.map(c=>{
      const price = Number(c.price)||0;
      const qty = parseInt(c.qty)||0;
      return `
      <div class="ci">
        <div style="width:64px;height:64px;border-radius:10px;background:linear-gradient(135deg,#1a0a0a,#2a0000);display:grid;place-items:center;border:1px solid #2a2a2a"><i data-lucide="package" style="width:22px;height:22px;color:#ff1f1f"></i></div>
        <div style="flex:1">
          <h5>${c.name}</h5><div style="color:var(--red);font-weight:800;font-size:13px">€${price.toFixed(2)}</div>
          <div class="qty"><button onclick="chgQty(${c.id},-1)">−</button><span style="font-weight:800;font-size:13px">${qty}</span><button onclick="chgQty(${c.id},1)">+</button><button onclick="removeItem(${c.id})" style="margin-left:auto;background:transparent;border:none;color:#777;cursor:pointer;font-size:12px;text-decoration:underline">Quitar</button></div>
        </div>
      </div>`;
    }).join('');
  }
  icons();
}
function chgQty(id,d){const it=cart.find(c=>c.id===id);if(!it)return;it.qty+=d;if(it.qty<=0) cart=cart.filter(c=>c.id!==id);saveCart();updateCart()}
function removeItem(id){cart=cart.filter(c=>c.id!==id);saveCart();updateCart()}
function openCart(){
  document.getElementById('drawer').classList.add('open');
}
function closeCart(){document.getElementById('drawer').classList.remove('open')}

function buyNow(id){
  const p=PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  const ex=cart.find(x=>x.id===id);
  if(ex) ex.qty++; else cart.push({id:p.id,name:p.name,price:p.price,qty:1});
  saveCart();
  window.location.href = 'pages/checkout.html';
}

function checkout(){
  if(cart.length===0) return toast('Tu carrito está vacío');
  saveCart();
  window.location.href = 'pages/checkout.html';
}
