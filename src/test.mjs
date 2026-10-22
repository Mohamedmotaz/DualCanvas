import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=await fs.mkdtemp(path.join(os.tmpdir(),'pb-'));
execFileSync('node',[path.join(root,'src/build.mjs'),'--out='+out,'--origin=https://example.org'],{stdio:'pipe'});
const projects=JSON.parse(await fs.readFile(path.join(root,'content/projects.json'),'utf8'));
const site=JSON.parse(await fs.readFile(path.join(root,'content/site.json'),'utf8'));
const read=f=>fs.readFile(path.join(out,f),'utf8');
const en=await read('index.html'),ar=await read('ar/index.html');
assert.match(en,/<html lang="en" dir="ltr">/);assert.match(ar,/<html lang="ar" dir="rtl">/);
assert.match(en,/hreflang="ar" href="https:\/\/example\.org\/ar\/work\/"?|hreflang="ar" href="https:\/\/example\.org\/ar\/"/);
for(const p of projects){for(const f of [`work/${p.slug}/index.html`,`ar/work/${p.slug}/index.html`])await fs.access(path.join(out,f));assert.ok(en.includes(`work/${p.slug}/`));}
const sitemap=await read('sitemap.xml');assert.equal((sitemap.match(/<loc>/g)||[]).length,2*(projects.length+1));
assert.match(await read('robots.txt'),/Sitemap: https:\/\/example\.org\/sitemap\.xml/);
for(const c of site.cvs)await fs.access(path.join(out,c.file));
assert.match(await read(`work/${projects[2].slug}/index.html`),/prototype-note/);
assert.doesNotMatch(await read(`work/${projects[0].slug}/index.html`),/prototype-note/);
// preview build is noindex
const prev=await fs.mkdtemp(path.join(os.tmpdir(),'pbp-'));
execFileSync('node',[path.join(root,'src/build.mjs'),'--preview','--out='+prev],{stdio:'pipe'});
assert.match(await fs.readFile(path.join(prev,'index.html'),'utf8'),/noindex,nofollow/);
assert.match(await fs.readFile(path.join(prev,'robots.txt'),'utf8'),/Disallow: \//);
// escaping: injected markup in content must not reach output
const tmpRoot=await fs.mkdtemp(path.join(os.tmpdir(),'pbx-'));
await fs.cp(root,tmpRoot,{recursive:true,filter:s=>!s.includes('node_modules')&&!s.includes('dist')});
await fs.symlink(path.join(root,'node_modules'),path.join(tmpRoot,'node_modules'));
const bad=structuredClone(projects);bad[0].title='<script>alert(1)</script>';bad[0].ar.title='<img src=x onerror=alert(1)>';
await fs.writeFile(path.join(tmpRoot,'content/projects.json'),JSON.stringify(bad));
const o2=path.join(tmpRoot,'out');execFileSync('node',[path.join(tmpRoot,'src/build.mjs'),'--out='+o2],{stdio:'pipe'});
for(const f of ['index.html','ar/index.html',`work/${bad[0].slug}/index.html`]){const h=await fs.readFile(path.join(o2,f),'utf8');assert.ok(!h.includes('<script>alert(1)'),f);assert.ok(!h.includes('<img src=x onerror'),f);}
console.log('ok');
