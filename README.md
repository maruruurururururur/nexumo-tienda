# NEXUMO — Web propia (sin Shopify)

Estructura nueva, limpia y profesional:

```
/
├── index.html                  → Tienda (carga CSS/JS externos)
├── assets/
│   ├── css/style.css           → Todo el diseño
│   ├── js/
│   │   ├── config.js           → ★ CONFIGURA AQUÍ TUS CLAVES DE PAGO
│   │   ├── products.js         → Catálogo 17 productos
│   │   ├── cart.js             → Carrito + guardado localStorage
│   │   ├── checkout.js         → Lógica PayPal + Bizum/Transferencia (Discord)
│   │   ├── chat.js             → Chat IA
│   │   └── main.js             → Inicio, filtros, countdown
│   └── img/
│       ├── productos/ (17 SVG)
│       └── iconos/ (17 SVG)
├── pages/
│   ├── checkout.html           → Paso de pago real
│   ├── pago-exitoso.html       → Muestra enlaces de descarga de tus productos
│   ├── pago-cancelado.html
│   ├── terminos.html
│   ├── privacidad.html
│   ├── reembolsos.html
│   └── envios.html
├── server/
│   ├── server.js               → Backend: PayPal + entrega de archivos
│   ├── products.js             → ★ Mapa producto → archivo(s) a entregar
│   ├── package.json
│   └── .env.example
└── tools/                      → Scripts para generar imágenes
```

## Cómo funciona el pago

1. El cliente añade productos al carrito y va a `pages/checkout.html`.
2. **PayPal**: paga con su cuenta o tarjeta. El backend (`server/server.js`)
   crea la orden, la captura al confirmar y **entrega automáticamente** los
   archivos del producto en `pago-exitoso.html` (enlaces de descarga).
3. **Bizum / Transferencia**: el cliente paga por su cuenta y **contacta por
   Discord** (`maruuxz_`) para recibir el pedido. Tú se lo envías manualmente.

## Qué archivos se entregan con cada producto

Está todo en `server/products.js`. Por defecto entrega los archivos de la
carpeta `alamcen/` (contactos de proveedores, guías PDF) y el
`TICKET Y FACTURAS.zip` para el pack de facturas. Cambia ahí qué archivo(s)
recibe cada cliente.

## Configuración

### 1. Stripe (YA CONFIGURADO — tarjetas, Apple Pay, Google Pay, Bizum)
- `server/.env` → `STRIPE_SECRET_KEY` (la `sk_test_...` ya está puesta)
- `assets/js/config.js` → `payments.stripe.publishableKey` (la `pk_test_...` ya está puesta)
- Para cobrar de verdad: cambia a claves `pk_live_...` / `sk_live_...` en el dashboard de Stripe.

### 2. PayPal (CONFIGURADO en SANDBOX / modo prueba)
- `server/.env` → `PAYPAL_MODE=sandbox` + `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` (ya puestos).
- `assets/js/config.js` → `payments.paypal.clientId` (ya puesto).
- Para probar: usa una cuenta de comprador sandbox en developers.paypal.com.
- **Para cobrar de verdad**: entra en developers.paypal.com → **Apps & Credentials** → pestaña **Live**, copia el **Client ID Live** y el **Secret Live**, y pon `PAYPAL_MODE=live` en `server/.env`.

### 3. Bizum / Transferencia (manual, 0% comisión)
En `assets/js/config.js`:
- `discord.username` = `maruuxz_` (tu Discord)
- Opcional: `payments.manual.bizumPhone` y `payments.manual.iban`

## Cómo probar en local
1. Abre `index.html` con Live Server (VSCode) o `npx serve .`
2. Arranca el backend:
   ```
   cd server
   npm install
   cp .env.example .env   # rellena tus claves
   npm start
   ```
3. En `assets/js/config.js` asegúrate de que `apiBaseUrl = "http://localhost:3000"`.
4. Añade al carrito → Pagar ahora → elige PayPal y paga.

> Para probar sin dinero real usa PayPal **sandbox** (cuentas de prueba de
> developers.paypal.com). Cuando quieras cobrar de verdad, cambia a **live**.

## Factura por email (automática)
Tras cada compra (PayPal, Stripe o pedido gratis) el servidor envía al cliente
un email con:
- La **factura** (productos, cantidades, precios, total y método de pago).
- Los **enlaces de descarga** para que pueda volver a descargar sus productos.

Para activarlo solo tienes que rellenar el bloque `EMAIL (factura automática)`
en `server/.env` con tus datos SMTP (ej. Gmail con App Password, o un servicio
como Brevo/Resend). Si no hay SMTP, la web funciona igual pero no envía email.

## Entrega de archivos (seguridad)
- Tras el pago, el backend genera un **token único de descarga** (válido 24 h).
- `pago-exitoso.html` usa ese token para mostrar los enlaces de descarga.
- Cada enlace solo permite descargar los archivos comprados, con protección
  contra path traversal.
