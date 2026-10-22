/* All content and navigation are available before JavaScript runs. */
const ar=document.documentElement.lang==='ar';
const filters=[...document.querySelectorAll('[data-filter]')],cards=[...document.querySelectorAll('.project-card')];
let remembered;try{remembered=JSON.parse(sessionStorage.getItem('portfolio-filter')||'null');}catch{}
function applyFilter(button){const category=button.dataset.filter;filters.forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});let count=0;cards.forEach(card=>{card.hidden=category!=='All'&&card.dataset.category!==category;if(!card.hidden)count++;});const live=document.querySelector('#count');if(live)live.textContent=ar?`${count} مشاريع`:`${count} projects`;try{sessionStorage.setItem('portfolio-filter',JSON.stringify({category,language:document.documentElement.lang}));}catch{}}
filters.forEach(b=>b.addEventListener('click',()=>{if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.startViewTransition(()=>applyFilter(b));else applyFilter(b);}));
if(remembered?.language===document.documentElement.lang){const previous=filters.find(b=>b.dataset.filter===remembered.category);if(previous)applyFilter(previous);}
const viewer=document.querySelector('#viewer');
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{viewer.querySelectorAll('img,.viewer-frame').forEach(e=>e.remove());const frame=button.querySelector('.media-frame');if(frame){const copy=frame.cloneNode(true);copy.classList.add('viewer-frame');copy.classList.remove('screen','hero-phone');viewer.insertBefore(copy,viewer.querySelector('p'));}else{const image=document.createElement('img');image.src=button.dataset.image;image.alt=button.dataset.caption;viewer.insertBefore(image,viewer.querySelector('p'));}viewer.querySelector('p').textContent=button.dataset.caption;viewer.showModal();}));
document.querySelector('#close-viewer')?.addEventListener('click',()=>viewer.close());
viewer?.addEventListener('click',e=>{if(e.target===viewer)viewer.close();});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}});},{threshold:0.06});document.querySelectorAll('.project-card,.screen-story,.services>div,.process-list li,.experience-list article').forEach(e=>{e.classList.add('reveal-ready');observer.observe(e);});}
if(!CSS.supports('view-transition-name: none')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('page-enter');

// Native touch scrolling with keyboard and button navigation.
document.querySelectorAll('[data-gallery]').forEach(gallery=>{
 const track=gallery.querySelector('.gallery-track'),slides=[...gallery.querySelectorAll('.gallery-slide')],controls=gallery.querySelector('.gallery-controls');
 let current=0;controls.hidden=false;
 const prev=controls.querySelector('[data-direction="prev"]'),next=controls.querySelector('[data-direction="next"]'),status=controls.querySelector('[data-gallery-status]');
 function update(index){current=index;status.textContent=(index+1)+' / '+slides.length;prev.disabled=index===0;next.disabled=index===slides.length-1;}
 function go(step){const index=Math.max(0,Math.min(slides.length-1,current+step));slides[index].scrollIntoView({inline:'center',block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 prev.addEventListener('click',()=>go(-1));next.addEventListener('click',()=>go(1));
 track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go((e.key==='ArrowRight'?1:-1)*(ar?-1:1));}});
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.intersectionRatio>.6)update(slides.indexOf(entry.target));}),{root:track,threshold:[.6,.8]});slides.forEach(slide=>observer.observe(slide));update(0);
});

document.querySelectorAll('.mobile-menu a').forEach(link=>link.addEventListener('click',()=>link.closest('details').open=false));
