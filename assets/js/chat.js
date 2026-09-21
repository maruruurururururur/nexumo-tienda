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

const NEXUMO_MAIL='astrihub@gmail.com';
const NEXUMO_DISCORD='maruuxz_';
const NEXUMO_CONTACT='Si necesitas ayuda humana, escríbenos por Discord ('+NEXUMO_DISCORD+') o al email '+NEXUMO_MAIL+'.';

function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function eur(n){ return '€'+Number(n).toFixed(2).replace('.',','); }

const NEXUMO_ITEMS=[
  {id:1, k:['lego','legos','bloques']},
  {id:2, k:['reloj','relojes','rolex','casio']},
  {id:3, k:['perfume','perfumes','colonia','fragancia']},
  {id:4, k:['tecnologia','tecnologico','airpods','smartwatch','auricular']},
  {id:5, k:['proveedor de ropa','ropa']},
  {id:6, k:['zapato','zapatos','zapatilla','jordan','nike']},
  {id:7, k:['pack ropa y zapatos','pack ropa']},
  {id:8, k:['vaper','vaperes','elfbar']},
  {id:9, k:['accesorio','accesorios']},
  {id:10, k:['pulsera','pulseras','lv']},
  {id:11, k:['lafufu','lafufus','labubu','peluche']},
  {id:12, k:['factura','facturas','ticket','tickets','plantilla']},
  {id:13, k:['neuroventa','ventas','guia avanzada']},
  {id:14, k:['arbitraje','reventa','guia maestra']},
  {id:15, k:['dropshipping','ecommerce','manual definitivo']},
  {id:16, k:['shopify','maestro']},
  {id:17, k:['pack guias','pack completo','todas las guias']},
];

function findProduct(q){
  if(typeof PRODUCTS==='undefined') return null;
  for(const it of NEXUMO_ITEMS){
    for(const k of it.k){ if(q.includes(k)) return PRODUCTS.find(p=>p.id===it.id)||null; }
  }
  return null;
}

const NEXUMO_FAQ=[
  {k:['donde esta mi pedido','no me llega','no llega','no recibi','no he recibido','llego','llega','descargar','descarga','enlace','link','spam'],
   a:'Tras pagar recibes todo al instante: los enlaces salen en la página de éxito y además te llegan por email (revisa SPAM, viene de NEXUMO). Los enlaces duran 24h. Si no te llegó nada en 1 hora, escríbenos por Discord ('+NEXUMO_DISCORD+') con tu número de pedido y te lo reenviamos.'},
  {k:['cuanto tarda','cuando llega','envio','envíos','entrega','tarda mucho','semana','dias tarda'],
   a:'Todo el catálogo es digital: entrega inmediata tras el pago, normalmente en menos de 5 minutos (descarga + email). No hay envío físico ni esperas de días.'},
  {k:['como pago','metodo de pago','forma de pago','pagar','paypal','tarjeta','bizum','transferencia','apple pay','google pay'],
   a:'Puedes pagar con PayPal (cuenta PayPal o tarjeta de débito/crédito a través de PayPal, sin necesidad de cuenta) o por Bizum/transferencia contactando por Discord ('+NEXUMO_DISCORD+'). El pago es cifrado SSL y nunca guardamos tu tarjeta.'},
  {k:['descuento','codigo','cupon','promo','oferta'],
   a:'Si tienes un código, escríbelo en "Código de descuento" dentro del checkout y pulsa Aplicar. Las ofertas marcadas OFERTA son por tiempo limitado.'},
  {k:['factura','iva','impuesto'],
   a:'Con cada compra recibes tu factura en PDF por email, con desglose de productos, total y método de pago. Precios en euros con impuestos incluidos.'},
  {k:['reembolso','devolucion','devolver','reclamar','me arrepiento'],
   a:'Al ser productos digitales con entrega inmediata, no hay reembolso una vez entregado el acceso, salvo archivo defectuoso que no podamos reparar en 48h o cobro duplicado. Escríbenos a '+NEXUMO_MAIL+' en 7 días con tu número de pedido.'},
  {k:['es fiable','fiable','estafa','seguro','confiar','garantia','quien sois'],
   a:'NEXUMO es una tienda propia con pago seguro (PayPal con protección al comprador), entrega automática y soporte en 24-48h laborables por Discord ('+NEXUMO_DISCORD+') y email ('+NEXUMO_MAIL+'). Miles de pedidos se entregan al instante tras el pago.'},
  {k:['humano','persona','contacto','soporte','ayuda','discord','email','correo','hablar con alguien'],
   a:'Puedes contactarnos por Discord ('+NEXUMO_DISCORD+') o por email ('+NEXUMO_MAIL+'). Respondemos en 24-48h laborables.'},
  {k:['que vendes','que venden','catalogo','productos teneis','que hay'],
   a:'Vendemos packs de proveedores para resellers (legos, relojes, perfumes, tecnología, ropa, zapatos, vaperes, lafufus...), guías de venta/reventa/dropshipping y plantillas de facturas y tickets editables. Todo digital con entrega inmediata. Dime qué te interesa y te digo precio.'},
  {k:['hola','buenas','hey','gracias'],
   a:'¡Hola! Soy el asistente de NEXUMO. Pregúntame por entregas, pagos, precios, descuentos o cualquier producto del catálogo.'},
];

function productAnswer(p){
  return p.name+': '+eur(p.price)+' (antes '+eur(p.was)+'). Producto digital con entrega inmediata tras el pago: descarga + email con factura. Lo tienes en la ficha de la tienda con todos los detalles. '+NEXUMO_CONTACT;
}

function botAnswer(raw){
  const q=norm(raw);
  for(const f of NEXUMO_FAQ){
    for(const k of f.k){ if(q.includes(norm(k))) return f.a; }
  }
  const p=findProduct(q);
  if(p) return productAnswer(p);
  if(q.includes('precio')||q.includes('cuanto cuesta')||q.includes('cuanto vale')||q.includes('coste'))
    return 'Las guías están a €3,95, los proveedores entre €4,95 y €9,95 y los packs hasta €9,95. Dime qué producto te interesa (legos, relojes, ropa, guías...) y te doy su precio exacto.';
  if(q.includes('proveedor'))
    return 'Son contactos y packs verificados para resellers, con entrega digital inmediata. Dime cuál te interesa (legos, relojes, perfumes, ropa, zapatos, vaperes, lafufus...) y te digo precio y contenido.';
  return 'No tengo la respuesta exacta a eso. '+NEXUMO_CONTACT;
}
