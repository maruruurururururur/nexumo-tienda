function toggleChat(){
  const p=document.getElementById('chatPanel');
  if(!p) return;
  p.classList.toggle('open');
  if(p.classList.contains('open')){ document.getElementById('chatInput').focus(); lucide.createIcons(); }
}
function chipAsk(text){ document.getElementById('chatInput').value=text; sendChat(); }
function sendChat(){
  const input=document.getElementById('chatInput');
  const txt=input.value.trim();
  if(!txt) return;
  const body=document.getElementById('chatBody');
  body.insertAdjacentHTML('beforeend','<div class="bubble user">'+escapeHtml(txt)+'</div>');
  input.value='';
  body.insertAdjacentHTML('beforeend','<div class="bubble bot" id="typing"><span class="bubble-typing"><span></span><span></span><span></span></span> NEXUMO IA está escribiendo...</div>');
  body.scrollTop=body.scrollHeight;
  setTimeout(()=>{ const t=document.getElementById('typing'); if(t) t.remove(); body.insertAdjacentHTML('beforeend','<div class="bubble bot">'+botAnswer(txt)+'</div>'); body.scrollTop=body.scrollHeight; lucide.createIcons(); }, 700 + Math.random()*600);
}
function escapeHtml(s){ return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function botAnswer(q){
  q=q.toLowerCase();
  const mail = 'astrihub@gmail.com';
  if(q.includes('lego')) return 'Proveedor de Legos: sets 1:1, envío 7-10 días, margen 50%. Incluye catálogo + vídeo guía. Escríbenos a '+mail+' si tienes dudas.';
  if(q.includes('reloj')) return 'Proveedor de Relojes: Rolex, AP, Casio etc. Calidad AAA, estuche incluido. Desde 14.95 EUR. Contacto: '+mail;
  if(q.includes('perfume')) return 'Proveedor de Perfumes: clones 1:1 (Dior, Creed...), 100ml, duración 8-12h.';
  if(q.includes('tecnologia')||q.includes('tecnolog')) return 'Proveedor Tecnología: AirPods, smartwatches, proyectores. Garantía y testados.';
  if(q.includes('ropa')) return 'Proveedor de Ropa / Pack Ropa+Zapatos: Nike, Adidas, oversize. Tallas S-XXL.';
  if(q.includes('zapato')) return 'Proveedor de Zapatos: Jordan, NB, Yeezy. Cajas originales. Pack combinado disponible.';
  if(q.includes('vaper')) return 'Proveedor Vaperes: Elfbar, Lost Mary, recargables. Sabores variados, entrega discreta.';
  if(q.includes('accesorio')) return 'Pack Accesorios y Ropa: gorras, bolsos, ropa combinada. Ideal para empezar.';
  if(q.includes('pulsera')||q.includes('lv')) return 'Pulseras LV: acero inoxidable, no se oxidan, con caja LV.';
  if(q.includes('lafufu')||q.includes('labubu')) return 'Lafufus: peluches virales, muchos modelos, se venden solos en TikTok.';
  if(q.includes('proveedor')) return 'Todos son proveedores verificados NEXUMO, con contacto directo y soporte en '+mail+'. Elige uno y te paso catálogo.';
  return 'En NEXUMO tienes proveedores exclusivos. Dime: legos, relojes, perfume, tech, ropa, zapatos, vaperes, LV o lafufus? ¿O escribe a '+mail;
}
