import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import { PRODUCT_FILES } from './products.js';
import { DISCOUNTS } from './discounts.js';
import { sendOrderEmail, sendContactEmail } from './email.js';
import { notify } from './discord-webhook.js';

function clientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
}

function emailOrder(o) {
  sendOrderEmail(o).catch(e => console.error('[email] error:', e.message));
}

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC_ROOT = path.join(__dirname, '..');

const app = express();

app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {

  res.json({ received: true });
});

app.use(cors({ origin: (process.env.ALLOWED_ORIGIN || '*').split(',') }));
app.use(express.json());

const STORAGE_ROOT = path.resolve(process.env.STORAGE_ROOT || path.join(__dirname, '..', '..'));
const FRONT_URL = process.env.FRONT_URL || 'http://localhost:5500';

const PAYPAL_MODE = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase();
const PAYPAL_BASE = PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const accessTokens = new Map();
const TOKEN_TTL = 24 * 60 * 60 * 1000;

const orders = new Map();

const redeemed = new Map();

function grantAccess(items, email) {
  const files = [];
  const names = [];
  for (const it of items) {
    const def = PRODUCT_FILES[Number(it.id)];
    if (!def) continue;
    names.push(def.name);
    for (const f of def.files) files.push({ name: path.basename(f), rel: f });
  }
  if (!files.length) return null;
  const dlToken = crypto.randomBytes(24).toString('hex');
  accessTokens.set(dlToken, { files, names, email, createdAt: Date.now() });
  return { token: dlToken, names, files };
}

function totalOf(items) {
  return items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0).toFixed(2);
}

async function paypalToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('Faltan PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET en server/.env');
  }
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error('PayPal auth error: ' + (await res.text()));
  const data = await res.json();
  return data.access_token;
}

async function paypalRequest(method, urlPath, token, body) {
  const res = await fetch(`${PAYPAL_BASE}${urlPath}`, {
    method,
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && (data.message || data.error_description)) || `PayPal ${res.status}`);
  return data;
}

app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const items = req.body?.items || [];
    if (!items.length) return res.status(400).json({ error: 'Carrito vacío' });
    const total = totalOf(items);
    const token = await paypalToken();
    const order = await paypalRequest('POST', '/v2/checkout/orders', token, {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: 'nexumo-' + Date.now(),
        description: 'Pedido NEXUMO',
        amount: {
          currency_code: 'EUR',
          value: total,
          breakdown: { item_total: { currency_code: 'EUR', value: total } },
        },
        items: items.map(i => ({
          name: String(i.name || 'Producto').slice(0, 127),
          unit_amount: { currency_code: 'EUR', value: Number(i.price).toFixed(2) },
          quantity: String(Number(i.qty) || 1),
        })),
      }],
      application_context: {
        brand_name: 'NEXUMO',
        user_action: 'PAY_NOW',
        return_url: `${FRONT_URL}/pages/pago-exitoso.html`,
        cancel_url: `${FRONT_URL}/pages/pago-cancelado.html`,
      },
    });
    orders.set(order.id, { items, total, createdAt: Date.now() });
    res.json({ id: order.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { orderId, email = '' } = req.body;
    if (!orderId) return res.status(400).json({ error: 'Falta orderId' });
    const saved = orders.get(orderId);
    const items = saved ? saved.items : (req.body?.items || []);
    if (!items.length) return res.status(400).json({ error: 'Carrito vacío' });

    const token = await paypalToken();
    const captured = await paypalRequest('POST', `/v2/checkout/orders/${orderId}/capture`, token);

    if (captured.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'El pago no se completó' });
    }

    const unit = captured.purchase_units?.[0];
    const paid = parseFloat(unit?.amount?.value
      || unit?.payments?.captures?.[0]?.amount?.value || '0');
    const expected = parseFloat(saved ? saved.total : totalOf(items));
    if (Math.abs(paid - expected) > 0.01) {
      return res.status(400).json({ error: 'El importe no coincide con tu pedido. Escríbenos por Discord: maruuxz_' });
    }

    const payerEmail = captured.payer?.email_address || email;
    const granted = grantAccess(items, payerEmail);
    if (!granted) {
      return res.status(400).json({ error: 'No se pudo identificar el pedido. Escríbenos por Discord: maruuxz_' });
    }
    orders.delete(orderId);

    emailOrder({
      to: payerEmail, items, total: paid, paymentMethod: 'PayPal',
      invoiceNo: captured.id, files: granted.files, token: granted.token, frontUrl: FRONT_URL,
    });
    notify.purchase({ email: payerEmail, items, total: paid, method: 'PayPal', invoiceNo: captured.id });

    res.json({ token: granted.token, pedido: captured.id, names: granted.names });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/checkout', async (req, res) => {
  try {
    const items = req.body?.items || [];
    if (!items.length) return res.status(400).json({ error: 'Carrito vacío' });
    if (!stripe) return res.status(500).json({ error: 'Stripe no configurado (STRIPE_SECRET_KEY en server/.env)' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: req.body?.email || undefined,
      line_items: items.map(i => ({
        price_data: { currency: 'eur', product_data: { name: i.name }, unit_amount: Math.round(Number(i.price) * 100) },
        quantity: Number(i.qty) || 1,
      })),
      success_url: `${FRONT_URL}/pages/pago-exitoso.html?metodo=stripe&pedido={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONT_URL}/pages/pago-cancelado.html`,
      metadata: { items: JSON.stringify(items.map(i => i.id)) },

      managed_payments: { enabled: false },
    });
    orders.set(session.id, { items, total: totalOf(items), createdAt: Date.now() });
    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/stripe/access/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    if (!stripe) return res.status(500).json({ error: 'Stripe no configurado' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'El pago no está completado' });
    }
    const saved = orders.get(sessionId);
    const items = saved ? saved.items : [];
    const email = session.customer_details?.email || '';
    const granted = grantAccess(items, email);
    if (!granted) {
      return res.status(400).json({ error: 'No se pudo identificar el pedido. Escríbenos por Discord: maruuxz_' });
    }
    orders.delete(sessionId);
    const paidTotal = session.amount_total ? (session.amount_total / 100) : parseFloat(saved ? saved.total : 0);
    emailOrder({
      to: email, items, total: paidTotal, paymentMethod: 'Tarjeta (Stripe)',
      invoiceNo: sessionId, files: granted.files, token: granted.token, frontUrl: FRONT_URL,
    });
    notify.purchase({ email, items, total: paidTotal, method: 'Tarjeta (Stripe)', invoiceNo: sessionId });
    res.json({ token: granted.token, pedido: sessionId, names: granted.names });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/track', (req, res) => {
  const page = req.body?.page || '/index.html';
  notify.visit({
    page,
    ip: clientIp(req),
    ua: req.headers['user-agent'] || '',
    referrer: req.headers['referer'] || req.body?.referrer || '',
  });
  res.json({ ok: true });
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name = '', email = '', message = '' } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Mensaje vacío' });
    notify.contact({ name, email, message });
    sendContactEmail({ name, email, message }).catch(e => console.error('[email] contacto:', e.message));
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/free', (req, res) => {
  try {
    const { items = [], email = '', code = '' } = req.body || {};
    if (!items.length) return res.status(400).json({ error: 'Carrito vacío' });
    const key = String(code || '').trim().toUpperCase();
    const discount = DISCOUNTS[key];
    if (!discount) return res.status(400).json({ error: 'Código de descuento no válido' });
    if (discount.products && !items.every(i => discount.products.includes(Number(i.id)))) {
      return res.status(400).json({ error: 'Ese código solo vale para productos concretos.' });
    }
    if (discount.maxUses && (redeemed.get(key) || 0) >= discount.maxUses) {
      return res.status(400).json({ error: 'Ese código ya fue usado.' });
    }

    const total = parseFloat(totalOf(items));
    const finalPrice = total * (1 - (discount.percent || 0) / 100);
    if (finalPrice > 0.01) {
      return res.status(400).json({ error: 'Ese código solo cubre parte del importe. Completa el pago.' });
    }

    const granted = grantAccess(items, email);
    if (!granted) {
      return res.status(400).json({ error: 'No se pudo identificar el pedido. Escríbenos por Discord: maruuxz_' });
    }
    if (discount.maxUses) redeemed.set(key, (redeemed.get(key) || 0) + 1);
    emailOrder({
      to: email, items, total: 0, paymentMethod: 'Código de descuento (100%)',
      invoiceNo: 'FREE-' + Date.now(), files: granted.files, token: granted.token, frontUrl: FRONT_URL,
    });
    notify.purchase({ email, items, total: 0, method: 'Código de descuento (100%)', invoiceNo: 'FREE-' + Date.now() });
    res.json({ token: granted.token, pedido: 'FREE-' + Date.now(), names: granted.names });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/access/:token', (req, res) => {
  const t = accessTokens.get(req.params.token);
  if (!t || Date.now() - t.createdAt > TOKEN_TTL) {
    notify.hack({ reason: 'Intento de acceder a descargas con token no válido/caducado', ip: clientIp(req), info: 'Token: ' + req.params.token });
    return res.status(404).json({ error: 'Enlace no válido o caducado. Escríbenos por Discord: maruuxz_' });
  }
  res.json({
    names: t.names,
    files: t.files.map(f => ({
      name: f.name,
      url: `/api/download/${req.params.token}?file=${encodeURIComponent(f.rel)}`,
    })),
  });
});

app.get('/api/download/:token', (req, res) => {
  const t = accessTokens.get(req.params.token);
  const ip = clientIp(req);
  if (!t || Date.now() - t.createdAt > TOKEN_TTL) {
    notify.hack({ reason: 'Intento de descargar con token no válido', ip, info: 'Token: ' + req.params.token });
    return res.status(403).send('Enlace no válido o caducado. Escríbenos por Discord: maruuxz_');
  }
  const rel = req.query.file;
  const file = t.files.find(f => f.rel === rel);
  if (!file) { notify.hack({ reason: 'Intento de descargar un archivo no autorizado', ip, info: 'File: ' + rel }); return res.status(403).send('Archivo no autorizado'); }

  const abs = path.resolve(STORAGE_ROOT, file.rel);
  if (!abs.startsWith(STORAGE_ROOT)) { notify.hack({ reason: 'Posible path traversal en descarga', ip, info: 'Rel: ' + rel }); return res.status(403).send('Acceso denegado'); }
  if (!fs.existsSync(abs)) return res.status(404).send('Archivo no encontrado. Escríbenos por Discord: maruuxz_');

  res.download(abs, file.name);
});

app.get('/api/health', (_, res) => res.json({
  ok: true,
  paypal: PAYPAL_MODE + (PAYPAL_CLIENT_ID ? '' : ' (sin credenciales)'),
  stripe: stripe ? 'configurado' : 'sin configurar',
  storage: STORAGE_ROOT,
}));

app.use(express.static(STATIC_ROOT));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`NEXUMO API en puerto ${port} (PayPal: ${PAYPAL_MODE}, Stripe: ${stripe ? 'sí' : 'no'})`));
