function cartItems() {
  return JSON.parse(localStorage.getItem('nexumo_cart') || '[]');
}

function checkoutTotal() {
  return cartItems().reduce((s, c) => s + c.price * c.qty, 0).toFixed(2);
}

function getEmail() {
  return document.getElementById('cx-email')?.value.trim() || '';
}

function getDiscount() {
  try { return JSON.parse(localStorage.getItem('nexumo_discount') || 'null'); } catch (e) { return null; }
}
function saveDiscount(d) { localStorage.setItem('nexumo_discount', JSON.stringify(d)); }
function clearDiscount() { localStorage.removeItem('nexumo_discount'); }
function discountTotal() {
  const t = parseFloat(checkoutTotal());
  const d = getDiscount();
  if (!d || !NEXUMO_CONFIG.discounts?.enabled) return t;
  return Math.max(0, t * (1 - (d.percent || 0) / 100));
}
function applyDiscount() {
  const box = document.getElementById('cx-code');
  const raw = (box ? box.value : '').trim().toUpperCase();
  if (!raw) return toast(T('cx.codeWrite'));
  const codes = NEXUMO_CONFIG.discounts?.codes || {};
  const conf = codes[raw];
  if (!conf) { toast(T('cx.codeBad')); return; }
  saveDiscount({ code: raw, percent: conf.percent, label: conf.label });
  if (box) box.value = '';
  toast(T('cx.codeOk') + (conf.label || '') + '!');
  if (typeof renderCheckout === 'function') renderCheckout();
}
function removeDiscount() {
  clearDiscount();
  if (typeof renderCheckout === 'function') renderCheckout();
}

async function payFree() {
  const email = getEmail();
  if (!email || !email.includes('@')) return toast(T('cx.emailNeed'));
  const d = getDiscount();
  const code = d ? d.code : '';
  try {
    toast(T('cx.freeGen'));
    const res = await fetch((NEXUMO_CONFIG.apiBaseUrl || '') + '/api/free', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems(), email, code }),
    });
    const data = await res.json();
    if (!data.token) { toast('Error: ' + (data.error || T('cx.freeFail'))); return; }
    localStorage.removeItem('nexumo_cart');
    clearDiscount();
    window.location.href = 'pago-exitoso.html?metodo=free&pedido=' + (data.pedido || '') + '&token=' + data.token;
  } catch (e) {
    toast(T('cx.noServer'));
  }
}

function initPayPalButtons() {
  if (!document.getElementById('paypal-buttons')) return;
  const cfg = NEXUMO_CONFIG?.payments?.paypal;
  if (!cfg?.enabled || !cfg?.clientId) return;
  if (typeof paypal === 'undefined') return;

  paypal.Buttons({

    style: { color: 'gold', shape: 'rect', layout: 'vertical', label: 'pay', height: 44 },
    createOrder: async (data, actions) => {
      const items = cartItems();
      if (!items.length) {
        toast(T('cx.cartEmpty'));
        throw new Error('Carrito vacío');
      }
      let res;
      try {
        res = await fetch(NEXUMO_CONFIG.apiBaseUrl + '/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
      } catch (e) {
        toast(T('cx.noPay'));
        throw e;
      }
      let json = null;
      try {
        json = await res.json();
      } catch (e) {
        toast(T('cx.noPay'));
        throw new Error('Pagos no disponibles');
      }
      if (!json.id) {
        toast(T('cx.noOrder'));
        throw new Error('No se pudo crear el pedido');
      }
      sessionStorage.setItem('nexumo_sig', json.sig || '');
      return json.id;
    },
    onApprove: async (data, actions) => {
      let json = null;
      try {
        const res = await fetch(NEXUMO_CONFIG.apiBaseUrl + '/api/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.orderID, email: getEmail(), items: cartItems(), sig: sessionStorage.getItem('nexumo_sig') || '' }),
        });
        json = await res.json();
      } catch (e) {
        toast(T('cx.noConfirm'));
        return;
      }
      if (!json.token) {
        toast(T('cx.noConfirm'));
        return;
      }
      localStorage.removeItem('nexumo_cart');
      sessionStorage.removeItem('nexumo_sig');
      window.location.href = 'pago-exitoso.html?metodo=paypal&pedido=' + (json.pedido || '') + '&token=' + json.token;
    },
    onCancel: () => { window.location.href = 'pago-cancelado.html'; },
    onError: (err) => {
      const log = document.getElementById('paypalDebug');
      if (log) { log.style.display = 'block'; log.textContent = T('cx.payDown') + ' ' + T('cx.noPay'); }
      toast(T('cx.payDown'));
    },
  }).render('#paypal-buttons');
}

function payWithPayPalFallback() {
  const cfg = NEXUMO_CONFIG.payments.paypal;
  if (cfg.meLink) { window.location.href = cfg.meLink; return; }
  toast('Configura tu Client ID o PayPal.Me en config.js');
}

function payManual() {
  const m = NEXUMO_CONFIG.payments.manual;
  const discord = m.discord || NEXUMO_CONFIG.discord?.username || 'maruuxz_';
  const items = cartItems();

  const modal = document.getElementById('manualModal');
  if (!modal) return;

  const itemsEl = document.getElementById('mm-items');
  if (itemsEl) {
    itemsEl.innerHTML = items.length
      ? items.map(c => `<div class="mm-it"><span>${c.name} ×${c.qty}</span><strong>€${(c.price * c.qty).toFixed(2)}</strong></div>`).join('')
      : '<div class="mm-it"><span>Carrito vacío</span></div>';
  }
  const tot = document.getElementById('mm-total');
  if (tot) tot.textContent = '€' + discountTotal().toFixed(2);
  const d1 = document.getElementById('mm-discord');
  if (d1) d1.textContent = discord;
  const d2 = document.getElementById('mm-discord2');
  if (d2) d2.textContent = discord;

  const lines = [];
  if (m.bizumPhone) lines.push({ k: 'Bizum', v: m.bizumPhone });
  if (m.iban) lines.push({ k: 'IBAN', v: m.iban });
  const wrap = document.getElementById('mm-details-wrap');
  const det = document.getElementById('mm-details');
  if (wrap && det) {
    if (lines.length) {
      wrap.style.display = 'block';
      det.innerHTML = lines.map(l => `<div class="mm-detail-line"><span class="k">${l.k}</span><strong>${l.v}</strong></div>`).join('');
    } else {
      wrap.style.display = 'none';
    }
  }

  const pb = document.getElementById('paypal-buttons');
  if (pb) pb.style.display = 'none';

  modal.classList.add('open');
}

function closeManualModal() {
  const modal = document.getElementById('manualModal');
  if (modal) modal.classList.remove('open');
  const pb = document.getElementById('paypal-buttons');
  if (pb) pb.style.display = '';
}

function copyDiscord() {
  const discord = document.getElementById('mm-discord')?.textContent || 'maruuxz_';
  navigator.clipboard?.writeText(discord).then(() => toast(T('cx.copied') + discord));
}

async function doPay() {
  const email = getEmail();
  if (!email || !email.includes('@')) return toast(T('cx.emailNeed'));

  if (discountTotal() <= 0.01) { await payFree(); return; }

  const method = document.querySelector('input[name="pay"]:checked').value || 'paypal';
  if (method === 'paypal') {
    if (NEXUMO_CONFIG.payments.paypal.clientId) {
      toast(T('cx.useBtn'));
    } else {
      payWithPayPalFallback();
    }
  } else if (method === 'manual') {
    payManual();
  }
}

(function () {
  const warns = [];
  const icon = '<i data-lucide="alert-triangle" style="width:13px;height:13px;display:inline-block;vertical-align:middle;color:#ffb4b4"></i> ';

  if (!NEXUMO_CONFIG.payments.paypal.clientId && !NEXUMO_CONFIG.payments.paypal.meLink)
    warns.push(icon + 'PayPal sin configurar: pega tu <b>Client ID</b> en config.js.');
  if (warns.length) {
    const d = document.getElementById('cfgWarn');
    if (d) { d.style.display = 'block'; d.innerHTML = warns.join('<br><br>'); lucide.createIcons(); }
  }
})();

(function () {
  const id = NEXUMO_CONFIG.payments.paypal.clientId;
  if (!id) return;
  const s = document.createElement('script');
  s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(id)}&currency=${NEXUMO_CONFIG.payments.paypal.currency || 'EUR'}&intent=capture&components=buttons&enable-funding=card&disable-funding=paylater,credit&locale=${(typeof LANG==='function'&&LANG()==='fr')?'fr_FR':((typeof LANG==='function'&&LANG()==='en')?'en_US':'es_ES')}`;
  s.onload = () => initPayPalButtons();
  s.onerror = () => {
    const log = document.getElementById('paypalDebug');
    if (log) { log.style.display = 'block'; log.textContent = T('cx.sdkFail'); }
  };
  document.head.appendChild(s);
})();

document.querySelectorAll('input[name="pay"]').forEach(r => r.addEventListener('change', () => {
  document.querySelectorAll('.pay-method').forEach(l => l.classList.remove('active'));
  document.querySelector('input[name="pay"]:checked').closest('.pay-method').classList.add('active');
}));
