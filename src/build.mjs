import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import projects from '../content/projects.json' with {type:'json'};
import site from '../content/site.json' with {type:'json'};
import {renderHome,renderProject} from './templates.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'..'),assets=path.join(root,'assets'),fonts=path.join(root,'fonts'),licenses=path.join(root,'licenses');
const arg=(name,fallback)=>process.argv.find(s=>s.startsWith('--'+name+'='))?.split('=').slice(1).join('=')||fallback;
const preview=process.argv.includes('--preview');
const origin=arg('origin',site.origin).replace(/\/$/,'');
const out=path.resolve(root,arg('out','dist'));
const sharp=(await import(process.env.PORTFOLIO_SHARP_PATH?pathToFileURL(process.env.PORTFOLIO_SHARP_PATH).href:'sharp')).default;
await fs.mkdir(path.join(out,'media'),{recursive:true});
const files=[...new Set(projects.flatMap(p=>[...p.images,p.cover,p.logo,...p.screens.map(s=>s.image),...(p.marketing||[]).map(s=>s.image)].filter(Boolean)))];files.push('cv-preview.png');
const media={};
await sharp(path.join(assets,'favicon.svg')).resize(180,180).png().toFile(path.join(out,'media','personal-icon.png'));
for(const name of files){const file=name.replace(/\.(png|jpg|jpeg)$/i,'.webp');const result=await sharp(path.join(assets,name)).resize({width:1600,withoutEnlargement:true}).webp({quality:86,effort:5}).toFile(path.join(out,'media',file));media[name]={file,width:result.width,height:result.height,bytes:result.size};}
await fs.copyFile(path.join(here,'style.css'),path.join(out,'style.css'));await fs.copyFile(path.join(assets,'favicon.svg'),path.join(out,'favicon.svg'));
for(const name of ['portfolio-sans.woff2','portfolio-sans-bold.woff2','IBMPlexSansArabic-Regular.woff2','IBMPlexSansArabic-Medium.woff2','IBMPlexSansArabic-SemiBold.woff2'])await fs.copyFile(path.join(fonts,name),path.join(out,name));
for(const name of ['DEJAVU_BITSTREAM_VERA_FONT_LICENSE.txt','IBM_PLEX_FONT_LICENSE.txt'])await fs.copyFile(path.join(licenses,name),path.join(out,name));
for(const c of site.cvs)await fs.copyFile(path.join(assets,c.file),path.join(out,c.file));
await fs.copyFile(path.join(here,'enhancements.js'),path.join(out,'app.js'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const routes=[];
function page(language,project=null){
 const ar=language==='ar',tr=(en,arabic)=>ar?arabic:en,o=v=>tr(v.en,v.ar),nm=ar?site.nameAr:site.name;
 const route=(ar?'ar/':'')+(project?'work/'+project.slug+'/':'');
 const other=(!ar?'ar/':'')+(project?'work/'+project.slug+'/':'');
 const prefix='../'.repeat(route.split('/').filter(Boolean).length),home=prefix+(ar?'ar/':'');
 const t=project?(ar?{...project,...project.ar}:project):null;
 const title=project?t.title+' - '+nm:o(site.title);
 const description=project?t.description:o(site.description);
 let body=project?renderProject(project,language,prefix,media):renderHome(language,prefix,media);
 for(const [name,m] of Object.entries(media))body=body.replaceAll('data-image="'+name+'"','data-image="'+prefix+'media/'+m.file+'"');
 const en=origin+'/'+(project?'work/'+project.slug+'/':''),arabic=origin+'/ar/'+(project?'work/'+project.slug+'/':'');
 const schema=JSON.stringify(project?{'@context':'https://schema.org','@type':'CreativeWork',name:t.title,description:t.description,url:origin+'/'+route,creator:{'@type':'Person',name:site.name},inLanguage:language}:{'@context':'https://schema.org','@type':'Person',name:site.name,url:origin+'/',jobTitle:site.jobTitle,sameAs:site.links.map(l=>l.url)}).replace(/</g,'\\u003c');
 const html=`<!doctype html><html lang="${language}" dir="${ar?'rtl':'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="${preview?'noindex,nofollow':'index,follow'}"><meta name="theme-color" content="#f8f7f3"><link rel="canonical" href="${origin}/${route}"><link rel="alternate" hreflang="en" href="${en}"><link rel="alternate" hreflang="ar" href="${arabic}"><link rel="alternate" hreflang="x-default" href="${en}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin}/${route}"><meta property="og:type" content="${project?'article':'website'}"><meta property="og:image" content="${origin}/media/${media[project?.cover||projects[0].cover].file}"><link rel="icon" href="${prefix}favicon.svg"><link rel="stylesheet" href="${prefix}style.css"><script src="${prefix}app.js" defer></script><script type="application/ld+json">${schema}</script></head><body><a class="skip" href="#main">${tr('Skip to content','انتقل للمحتوى')}</a><header><a href="${home||'./'}" class="wordmark">${site.wordmark.map(esc).join('<br>')}</a><nav aria-label="${tr('Main navigation','التنقل الرئيسي')}"><a href="${home}#work">${tr('Work','الأعمال')}</a><a href="${home}#about">${tr('About','عنّي')}</a><a href="${home}#cv">${tr('CV','السيرة الذاتية')}</a><a href="${home}#contact">${tr('Let’s talk ↗','نتكلم ↖')}</a><a id="language" href="${prefix+other||'./'}" lang="${ar?'en':'ar'}" hreflang="${ar?'en':'ar'}">${tr('العربية','English')}</a><details class="mobile-menu"><summary>${tr('Menu','القائمة')}</summary><div><a href="${home}#about">${tr('About me','عنّي')}</a><a href="${home}#approach">${tr('How I work','طريقة شغلي')}</a><a href="${home}#experience">${tr('Experience','الخبرة')}</a><a href="${home}#cv">${tr('CVs','السيرة الذاتية')}</a><a href="${home}#contact">${tr('Contact','تواصل')}</a></div></details></nav></header><main id="main">${body}</main><footer><span>© ${new Date().getFullYear()} ${esc(nm)}${preview?tr(' · Review preview',' · معاينة المراجعة'):''}</span><a class="wordmark" href="${home||'./'}">${esc(site.wordmark.join(' '))}.</a><span>${esc(o(site.location))}</span><a href="mailto:${esc(site.email)}">${tr('Email ↗','البريد ↖')}</a></footer><dialog id="viewer" aria-label="${tr('Image viewer','عارض الصور')}"><button id="close-viewer" aria-label="${tr('Close image','إغلاق الصورة')}">×</button><p></p></dialog></body></html>`;
 const branded=html.replace('<link rel="icon" href="'+prefix+'favicon.svg">','<link rel="icon" type="image/png" href="'+prefix+'media/personal-icon.png"><link rel="apple-touch-icon" href="'+prefix+'media/personal-icon.png">');
 return {route,html:branded};
}
for(const language of ['en','ar'])for(const p of [null,...projects]){const {route,html}=page(language,p);await fs.mkdir(path.join(out,route),{recursive:true});await fs.writeFile(path.join(out,route,'index.html'),html);routes.push(route);}
await fs.writeFile(path.join(out,'robots.txt'),preview?'User-agent: *\nDisallow: /\n':'User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');
await fs.writeFile(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(route=>'<url><loc>'+origin+'/'+route+'</loc></url>').join('')+'</urlset>');
await fs.writeFile(path.join(out,'_headers'),'/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Cache-Control: public, max-age=0, must-revalidate\n'+(preview?'  X-Robots-Tag: noindex, nofollow\n':'')+'/media/*\n  Cache-Control: public, max-age=86400\n');
await fs.writeFile(path.join(out,'_redirects'),'/index.html / 301\n/ar/index.html /ar/ 301\n');
await fs.writeFile(path.join(out,'404.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page not found - ${esc(site.name)}</title><link rel="icon" href="/media/personal-icon.png"><link rel="stylesheet" href="/style.css"></head><body><header><a href="/" class="wordmark">${site.wordmark.map(esc).join('<br>')}</a><a href="/ar/" lang="ar">العربية ↗</a></header><main class="wrap not-found"><span class="eyebrow">404 / PAGE NOT FOUND</span><h1>Let’s get you<br>back to the work.</h1><p>This page is unavailable.</p><div class="links"><a href="/">Explore the portfolio ↗</a><a href="/ar/" lang="ar">استكشف الأعمال ↖</a><a href="mailto:${esc(site.email)}">Get in touch ↗</a></div></main></body></html>`);
await fs.writeFile(path.join(out,'media-manifest.json'),JSON.stringify(media,null,2)+'\n');
console.log(JSON.stringify({output:out,preview,origin,htmlPages:routes.length,images:files.length,mediaBytes:Object.values(media).reduce((a,m)=>a+m.bytes,0)},null,2));
