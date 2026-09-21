import 'dotenv/config';
import { notify } from './discord-webhook.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    console.error('❌ Falta DISCORD_WEBHOOK_URL en server/.env — añádela antes de probar.');
    process.exit(1);
  }

  console.log('Enviando pruebas de "Nueva visita" a Discord... (info inventada, solo para ver el diseño)\n');

  console.log('→ Visita 1/5: home desde móvil (España), llega desde Instagram');
  await notify.visit({
    page: '/index.html',
    ip: '88.24.15.201',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    referrer: 'https://www.instagram.com/',
  });
  await sleep(1200);

  console.log('→ Visita 2/5: página de producto desde escritorio (México), llega desde Google');
  await notify.visit({
    page: '/pages/producto.html?id=3',
    ip: '187.190.20.5',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    referrer: 'https://www.google.com/',
  });
  await sleep(1200);

  console.log('→ Visita 3/5: pago exitoso desde Mac (Argentina), sin referrer (entrada directa)');
  await notify.visit({
    page: '/pages/pago-exitoso.html',
    ip: '181.44.201.9',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    referrer: '',
  });
  await sleep(1200);

  console.log('→ Visita 4/5: desde tablet Android (Colombia), llega desde TikTok');
  await notify.visit({
    page: '/pages/terminos.html',
    ip: '181.129.100.44',
    ua: 'Mozilla/5.0 (Linux; Android 14; SM-X200) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    referrer: 'https://www.tiktok.com/',
  });
  await sleep(1200);

  console.log('→ Visita 5/5: prueba en local (IP privada, sin geolocalización real)');
  await notify.visit({
    page: '/index.html',
    ip: '127.0.0.1',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0',
    referrer: '',
  });

  console.log('\n✅ Listo. Se enviaron 5 notificaciones de "Nueva visita" de prueba.');
  console.log('   Revisa tu canal de Discord para ver el diseño con país, ciudad, dispositivo y referrer.');
  console.log('   También puedes revisar server/data/visits.jsonl para ver los registros guardados.');
}

main();
