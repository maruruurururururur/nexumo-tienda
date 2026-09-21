# Guía GRATIS para cobrar en NEXUMO (tienes BBVA Bizum + PayPal)

Todo lo de aquí es **gratis de crear**. Solo pagas una pequeña comisión CUANDO vendes (excepto Bizum manual y transferencia que son 0€).

Ya tienes la web lista en modo "aviso". En cuanto hagas estos 3 pasos me pasas 3 datos y te lo dejo cobrando.

---

## OPCIÓN A (haz esta HOY, 10 min, 0€ y sin programar nada)

### 1. PayPal → consigue tu link paypal.me (GRATIS)
1. Entra en paypal.com → pasa tu cuenta a **Cuenta Business** (es gratis: Configuración > Cambiar a cuenta Business).
2. Ve a `paypal.me` → Crea tu link. Ej: `https://paypal.me/tunombre`
3. Pásame ese link. Yo lo pego en `assets/js/config.js` → `paypal.meLink`.
4. Resultado: botón PayPal en tu checkout cobra directo a tu PayPal. Comisión PayPal España ~2,99% + 0,35€ por venta. Crear y mantener: 0€.

> Si luego quieres botones automáticos dentro de la web (sin salir a paypal.me):
> developers.paypal.com → Dashboard → Apps & Credentials → Create App → copia el **Client ID (Live)** y pégalo en `paypal.clientId`. Gratis.

### 2. Bizum manual BBVA → 0% comisión (GRATIS)
1. Abre BBVA → Bizum → verifica tu número (el que ya usas).
2. Pásame:
   - Tu **número Bizum** (ej: 600123456)
   - Tu **IBAN BBVA** (ESxx xxxx ...) si quieres también transferencia
3. Yo lo pego en `assets/js/config.js`:
```js
manual: { enabled: true, bizumPhone: "600123456", iban: "ESxx..." }
```
4. Resultado: en checkout sale "Bizum manual / Transferencia" → el cliente te hace Bizum, te llega email y tú le envías el acceso. 0€ comisión.

### 3. Stripe → Tarjeta + Bizum automático (GRATIS crear)
Aunque quieras gratis, Stripe es gratis de crear y te da tarjeta + Apple Pay + Google Pay + Bizum automático:
1. Crea cuenta en stripe.com (gratis, sin mensualidad).
2. Dashboard → Configuración → Métodos de pago → Activa: **Tarjetas, Apple Pay, Google Pay, Bizum, Klarna**.
3. Pagos → Payment Links → Crear link de prueba → pégalo en `stripe.fallbackPaymentLink`.
   Ej: `https://buy.stripe.com/test_...`
4. Cuando quieras automático total: Developers → API keys → copia `pk_test_...` y `sk_test_...`. Para real: `pk_live_...` / `sk_live_...`. El `sk_` va SOLO en `server/.env`, nunca en frontend.
5. Comisión España: ~1,5% + 0,25€ por venta europea. Crear: 0€.

---

## Qué pasarme ahora (respóndeme con esto)

```
1. Mi paypal.me: https://paypal.me/...
2. Mi número Bizum BBVA: 6xx xxx xxx
3. Mi IBAN (opcional): ESxx...
4. ¿Quieres también Stripe? si/no (si es sí, pásame el Payment Link cuando lo crees)
```

En cuanto me pases 1 y 2 ya cobras HOY sin pagar nada.

## Por qué no Redsys BBVA de momento
BBVA te ofrece TPV Redsys para Bizum automático con tu banco, pero pide contrato de comercio + suele tener mensualidad/alquiler TPV. No es lo más gratis para empezar. Mejor: Bizum manual (0€) + Stripe con Bizum activado (sin banco, sin mensualidad).

## Dónde pego yo tus datos
- `assets/js/config.js` → todo centralizado
- `pages/checkout.html` → ya detecta si falta algo y te avisa
- `server/.env` → solo cuando tengas Stripe sk_

Si quieres, en cuanto me pases los 2 datos te los dejo ya pegados y probados.
