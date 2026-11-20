"""Set canonical/social URLs and rebuild every page."""
from pathlib import Path
from urllib.parse import urlsplit
import json,subprocess,sys
base=sys.argv[1].rstrip('/')+'/'
u=urlsplit(base)
if u.scheme not in ['https','http'] or not u.netloc or u.query or u.fragment or u.username:
 raise SystemExit('Provide an absolute http(s) site URL without a query, fragment, or credentials.')
root=Path(__file__).resolve().parents[1]
p=root/'src/site.json';config=json.loads(p.read_text());config['base_url']=base;p.write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n')
subprocess.run([sys.executable,str(root/'scripts/build_site.py')],check=True)
print('Updated canonical and social-card URLs to',base)
