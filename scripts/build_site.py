"""Build the static CRAFT pages from src/layout.html and src/pages/*.html."""
from pathlib import Path
from html import escape
from urllib.parse import urlsplit
import hashlib,json,re
root=Path(__file__).resolve().parents[1]
config=json.loads((root/'src/site.json').read_text())
layout=(root/'src/layout.html').read_text()
public=root/'public' if (root/'public').is_dir() else root
public.mkdir(exist_ok=True)
base=config['base_url'].rstrip('/')+'/'
version=hashlib.sha256(b''.join((public/f).read_bytes() for f in ['style.css','site.js','app.js'])).hexdigest()[:10]
routes={'top':'index.html','model-flow':'index.html','about':'index.html','themes':'themes.html','cfp':'cfp.html','dates':'timeline.html','program':'program.html','speakers':'speakers.html','organizers':'organizers.html','committee':'committee.html','sponsors':'sponsors.html','submission-types':'cfp.html','author-guidance-title':'cfp.html','submission-review':'cfp.html'}
def links(content,current):
 def replace(m):
  anchor=m[1]
  if anchor not in routes:return m[0]
  target=routes[anchor]
  if anchor in ['submission-types','author-guidance-title','submission-review']:
   return 'href="'+('' if target==current else target)+'#'+anchor+'"'
  return 'href="'+target+'"'
 return re.sub(r'href="#([^"]+)"',replace,content)
for page in config['pages']:
 filename=page['file']
 nav=''.join('<a href="'+target+'"'+(' aria-current="page"' if target==filename else '')+'>'+escape(label)+'</a>' for target,label in config['navigation'])
 values={'TITLE':escape(page['title']),'DESCRIPTION':escape(page['description'],quote=True),'CANONICAL':base+('' if filename=='index.html' else filename),'BASE_URL':base,'PAGE':Path(filename).stem,'NAV':nav,'CONTENT':links((root/'src/pages'/filename).read_text(),filename),'PAGE_SCRIPT':('<script src="app.js?v='+version+'" defer></script>' if filename=='index.html' else ''),'ASSET_VERSION':version}
 result=layout
 for key,value in values.items():result=result.replace('{{'+key+'}}',value)
 assert not re.search(r'\{\{[A-Z_]+\}\}',result),filename
 (public/filename).write_text(result)
(public/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(' <url><loc>'+escape(base+('' if p['file']=='index.html' else p['file']))+'</loc></url>\n' for p in config['pages'])+'</urlset>\n')
print('Built',len(config['pages']),'pages; asset version',version)

# Keep a conventional About URL as an alias for the combined home page.
(public/'about.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=index.html#about"><link rel="canonical" href="'+base+'"><title>About | CRAFT 2027</title></head><body><p><a href="index.html#about">About CRAFT</a></p></body></html>\n')
