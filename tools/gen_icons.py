import pathlib
folder = pathlib.Path('producto-iconos')
folder.mkdir(exist_ok=True)

products=[
 (1,'legos','blocks'),
 (2,'relojes','watch'),
 (3,'perfumes','droplets'),
 (4,'tecnologia','cpu'),
 (5,'ropa','shirt'),
 (6,'zapatos','footprints'),
 (7,'pack-ropa-zapatos','package'),
 (8,'vaperes','wind'),
 (9,'pack-accesorios','gem'),
 (10,'pulseras-lv','link'),
 (11,'lafufus','bot'),
 (12,'facturas-tickets','file-text'),
 (13,'guia-neuroventa','brain'),
 (14,'guia-arbitraje','scale'),
 (15,'manual-dropshipping','truck'),
 (16,'shopify-maestro','shopping-bag'),
 (17,'pack-guias','library'),
]

icon_symbol={
 'blocks':'▦','watch':'◷','droplets':'💧','cpu':'◉','shirt':'👕','footprints':'👟','package':'📦','wind':'💨','gem':'♦','link':'🔗','bot':'🤖','file-text':'📄','brain':'🧠','scale':'⚖','truck':'🚚','shopping-bag':'🛍','library':'📚'
}

for pid,name,icon in products:
    sym = icon_symbol.get(icon,'•')
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 120 120">
  <defs>
    <filter id="glow">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#ff0f0f" flood-opacity="0.7"/>
    </filter>
  </defs>
  <!-- glow -->
  <rect x="15" y="15" width="90" height="90" rx="18" fill="none" stroke="#ff0f0f" stroke-opacity="0.3" stroke-width="12" filter="url(#glow)"/>
  <!-- cuadrado negro -->
  <rect x="15" y="15" width="90" height="90" rx="18" fill="rgba(18,18,18,1)" stroke="rgba(255,255,255,0.09)" stroke-width="1.5"/>
  <!-- icono centrado -->
  <text x="60" y="68" text-anchor="middle" font-size="38" fill="white">{sym}</text>
</svg>'''
    fname = f"{pid:02d}-{name}.svg"
    (folder/fname).write_text(svg, encoding='utf-8')
    print(fname)

print("done", folder.resolve())
