import pathlib
folder=pathlib.Path('producto-imagenes')
folder.mkdir(exist_ok=True)

products=[
 (1,'Proveedor','Legos','blocks','OFERTA'),
 (2,'Proveedor','Relojes','watch','OFERTA'),
 (3,'Proveedor','Perfumes','droplets','OFERTA'),
 (4,'Proveedor','Tecnologia','cpu','OFERTA'),
 (5,'Proveedor','Ropa','shirt','OFERTA'),
 (6,'Proveedor','Zapatos','footprints','OFERTA'),
 (7,'Pack Ropa','+ Zapatos','package','PACK'),
 (8,'Proveedor','Vaperes','wind','OFERTA'),
 (9,'Pack','Accesorios','gem','PACK'),
 (10,'Pulseras','LV','link','OFERTA'),
 (11,'Lafufus','Proveedor','bot','OFERTA'),
 (12,'+99 Facturas','+ Tickets','file-text','OFERTA'),
 (13,'Guia Avanzada','Neuroventa','brain','OFERTA'),
 (14,'Guia Maestra','Arbitraje','scale','OFERTA'),
 (15,'Manual','Dropshipping','truck','OFERTA'),
 (16,'Shopify','Maestro','shopping-bag','OFERTA'),
 (17,'Pack','Guias','library','PACK'),
]

icon_symbol={
 'blocks':'▦','watch':'◷','droplets':'💧','cpu':'◉','shirt':'👕','footprints':'👟','package':'📦','wind':'💨','gem':'♦','link':'🔗','bot':'🤖','file-text':'📄','brain':'🧠','scale':'⚖','truck':'🚚','shopping-bag':'🛍','library':'📚'
}

name_map={1:'01-legos',2:'02-relojes',3:'03-perfumes',4:'04-tecnologia',5:'05-ropa',6:'06-zapatos',7:'07-pack-ropa-zapatos',8:'08-vaperes',9:'09-pack-accesorios',10:'10-pulseras-lv',11:'11-lafufus',12:'12-facturas-tickets',13:'13-guia-neuroventa',14:'14-guia-arbitraje',15:'15-manual-dropshipping',16:'16-shopify-maestro',17:'17-pack-guias'}

for pid,title1,title2,icon,badge in products:
    sym=icon_symbol.get(icon,'•')
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <linearGradient id="g{pid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a0f0f"/>
      <stop offset="55%" stop-color="#140808"/>
      <stop offset="100%" stop-color="#0e0e0e"/>
    </linearGradient>
    <radialGradient id="r{pid}" cx="50%" cy="0%" r="70%">
      <stop offset="0%" stop-color="rgba(255,15,15,0.55)"/>
      <stop offset="70%" stop-color="transparent"/>
    </radialGradient>
  </defs>
  <rect width="600" height="400" rx="24" fill="url(#g{pid})"/>
  <rect width="600" height="400" rx="24" fill="url(#r{pid})"/>
  <rect x="1" y="1" width="598" height="398" rx="23" fill="none" stroke="rgba(255,15,15,0.18)" stroke-width="1"/>
  <g transform="translate(18,352)">
    <rect width="76" height="24" rx="12" fill="rgba(10,10,10,0.95)" stroke="rgba(255,255,255,0.14)"/>
    <text x="38" y="16" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="800" fill="white" letter-spacing="1">{badge}</text>
  </g>
  <text x="300" y="88" text-anchor="middle" font-family="Sora, Inter, sans-serif" font-size="30" font-weight="900" fill="#ff0f0f" letter-spacing="-0.5">{title1.upper()}</text>
  <text x="300" y="124" text-anchor="middle" font-family="Sora, Inter, sans-serif" font-size="32" font-weight="900" fill="white" letter-spacing="-0.5">{title2.upper()}</text>
  <g transform="translate(261,155)">
    <rect width="78" height="78" rx="16" fill="rgba(0,0,0,0.38)" stroke="rgba(255,255,255,0.09)"/>
    <text x="39" y="48" text-anchor="middle" font-size="34">{sym}</text>
  </g>
  <rect x="0" y="340" width="600" height="1" fill="rgba(255,15,15,0.18)"/>
</svg>
'''
    fname=name_map[pid]+'.svg'
    (folder/fname).write_text(svg,encoding='utf-8')
    print(fname)
print('done')
