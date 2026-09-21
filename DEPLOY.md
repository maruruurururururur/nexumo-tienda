# DESPLEGAR EN VPS (NEXUMO)

Este servidor ya sirve **la web Y la API desde el mismo origen** (puerto 3000).
Eso significa que al desplegarlo en tu VPS, todo funciona junto: sin fallos de
"Failed to fetch", sin problemas de CORS entre puertos.

## Requisitos en la VPS
- Node.js **18 o superior**
- (Opcional pero recomendado) Nginx o Caddy para el dominio + HTTPS
- Un dominio apuntando a tu VPS

## 1. Copiar el proyecto a la VPS

Sube la carpeta **`mi-tienda`** completa a la VPS (incluye `thema-shopify/` y
`alamcen/` con los productos). Por ejemplo a `/var/www/mi-tienda`:

```
scp -r mi-tienda usuario@tu-vps:/var/www/
```

## 2. Instalar dependencias
```
cd /var/www/mi-tienda/thema-shopify/server
npm install
```

## 3. Configurar el .env (server/.env)
```env
# --- PayPal ---
PAYPAL_MODE=live        # sandbox para probar, live para cobrar de verdad
PAYPAL_CLIENT_ID=TU_CLIENT_ID_DE_PAYPAL
PAYPAL_CLIENT_SECRET=TU_SECRET_DE_PAYPAL

# --- Stripe (opcional) ---
STRIPE_SECRET_KEY=TU_SK_DE_STRIPE

# --- Tu dominio (IMPORTANTE) ---
FRONT_URL=https://tudominio.com
ALLOWED_ORIGIN=https://tudominio.com
PORT=3000
```

**IMPORTANTE:** `FRONT_URL` debe ser tu dominio real, porque ahí es donde
PayPal/Stripe te redirigen tras el pago (la página de éxito con las descargas).

> `config.js` ya usa API en ruta relativa (`/api/...`), así que **no hace falta
> tocar nada de apiBaseUrl** en la VPS si despliegas en la raíz del dominio.

## 4. Arrancar el servidor

En una terminal (modo persistente con pm2):
```
npm install -g pm2
pm2 start server.js --name nexumo
pm2 save
pm2 startup
```

O simplemente para probar: `node server.js` → verás `NEXUMO API en puerto 3000`.

## 5. (Recomendado) Dominio + HTTPS con Nginx

`/etc/nginx/sites-available/tudominio.com`:
```nginx
server {
    server_name tudominio.com www.tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
Luego:
```
sudo ln -s /etc/nginx/sites-available/tudominio.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

## 6. Probar
Abre `https://tudominio.com` en un navegador normal (Chrome). Añade un producto →
pagar → PayPal. Ya no habrá "Failed to fetch": todo es la misma origen.

## Notas
- La carpeta con los productos se configura con `STORAGE_ROOT` en `.env`.
  Por defecto apunta a la raíz de `mi-tienda` (donde está `alamcen/` y el zip).
- Para cobrar dinero de verdad: cambia PayPal a `PAYPAL_MODE=live` (con claves
  **Live**, no sandbox) y Stripe a claves `pk_live_...` / `sk_live_...`.
