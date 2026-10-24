const works = [
  {title:'MORGENSHTERN',slug:'morgenshtern',software:'After Effects'},
  {title:'Until I Know',slug:'until-i-know',software:'After Effects · Clip Studio Paint'},
  {title:'Critical',slug:'critical',software:'After Effects',loop:true},
  {title:'Hamburger',slug:'character-acting',software:'After Effects'},
  {title:'DGU',slug:'dgu',software:'After Effects'},
  {title:'Backwards',slug:'backwards-study',software:'After Effects',description:'원작의 콘셉트와 연출을 참고한 모작입니다.',originalTitle:'Feels Like We Only Go Backwards',originalUrl:'https://youtu.be/wycjnCCgUes?si=v1485BdhEFPvMs22'}
];
const viewer=document.querySelector('#viewer');
const media=document.querySelector('#viewer-media');
let opener;
function openWork(item,button){
  opener=button;
  document.querySelector('#viewer-title').textContent=item.title;
  document.querySelector('#viewer-category').textContent=item.image?'ILLUSTRATION':item.software;
  const description=document.querySelector('#viewer-description');description.replaceChildren();
  if(item.originalUrl){const credit=document.createElement('a');credit.href=item.originalUrl;credit.target='_blank';credit.rel='noopener noreferrer';credit.textContent=item.description;description.append(credit);}
  else description.textContent=item.description||'';
  media.replaceChildren();
  if(item.image){const img=new Image();img.src=item.image;img.alt=item.title;media.append(img);}
  else{const video=document.createElement('video');video.src=`/assets/${item.slug}.mp4`;video.poster=`/assets/${item.slug}.jpg`;video.controls=true;video.playsInline=true;video.preload='metadata';video.loop=!!item.loop;video.muted=!!item.loop;video.setAttribute('aria-label',item.title);media.append(video);}
  document.body.classList.add('modal-open');viewer.showModal();document.querySelector('#close-viewer').focus();
}
function cleanViewer(){const video=media.querySelector('video');if(video){video.pause();video.removeAttribute('src');video.load();}media.replaceChildren();document.body.classList.remove('modal-open');opener?.focus();}
document.querySelector('#close-viewer').addEventListener('click',()=>viewer.close());
viewer.addEventListener('close',cleanViewer);
viewer.addEventListener('click',e=>{const r=viewer.getBoundingClientRect();if(e.target===viewer&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))viewer.close();});
const mobilePreviews=[];
works.forEach((item,i)=>{
  const button=document.createElement('button');button.className='work-card';button.dataset.work=item.slug;button.setAttribute('aria-label',`${item.title} 영상 보기`);
  const frame=document.createElement('div');frame.className='work-image';
  const img=new Image();img.src=`/assets/${item.slug}.jpg`;img.alt=`${item.title} 영상 썸네일`;img.loading=i<2?'eager':'lazy';img.decoding='async';frame.append(img);if(item.originalUrl){const badge=document.createElement('span');badge.className='study-badge';badge.textContent='MV 모작';button.append(badge);}
  const preview=document.createElement('video');preview.className='hover-preview';preview.muted=true;preview.loop=true;preview.playsInline=true;preview.preload='none';preview.setAttribute('aria-hidden','true');frame.append(preview);
  let hovering=false;
  const stop=()=>{hovering=false;preview.pause();preview.classList.remove('is-playing');};
  const start=(force=false)=>{if(force!==true&&(!matchMedia('(hover: hover)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches))return;hovering=true;if(!preview.getAttribute('src'))preview.src=`/assets/${item.slug}-preview.mp4`;preview.play().then(()=>{if(hovering)preview.classList.add('is-playing');else stop();}).catch(stop);};
  mobilePreviews.push({button,start:()=>start(true),stop});
  button.addEventListener('pointerenter',start);button.addEventListener('pointerleave',()=>{if(matchMedia('(hover: hover)').matches)stop();});button.addEventListener('focus',start);button.addEventListener('blur',()=>{if(matchMedia('(hover: hover)').matches)stop();});button.addEventListener('click',stop);
  new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();}).observe(button);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  const play=document.createElement('span');play.className='play-icon';play.setAttribute('aria-hidden','true');play.textContent='▶';frame.append(play);
  const meta=document.createElement('div');meta.className='work-meta';const title=document.createElement('h2');title.textContent=item.title;const type=document.createElement('span');type.className='work-type';type.textContent=item.software;meta.append(title,type);
  const index=document.createElement('span');index.className='work-index';index.textContent=String(i+1).padStart(2,'0');button.append(frame,meta,index);button.addEventListener('click',()=>openWork(item,button));document.querySelector('#motion-grid').append(button);
});
for(let i=1;i<=6;i++){
  const num=String(i).padStart(2,'0');const stamp=[4,6,8].includes(i);const item={title:`Illustration ${num}`,image:`/assets/${stamp?'stamp':'sticker'}-${num}.webp`};
  const button=document.createElement('button');button.className='illustration-card';button.setAttribute('aria-label',`${item.title} 크게 보기`);const img=new Image();img.src=item.image;img.alt=item.title;img.loading='lazy';const label=document.createElement('span');label.textContent=`VIEW ${num} ↗`;button.append(img,label);button.addEventListener('click',()=>openWork(item,button));document.querySelector('#illustration-grid').append(button);
  button.classList.add(stamp?'is-stamp':'is-sticker');button.style.setProperty('--tilt',[-6,5,-4,4,7,-5,-7,5][i-1]+'deg');window.attachPeel(button,img);
}
const tabs=[...document.querySelectorAll('[role=tab]')];
function applyTab(tab){tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!selected;});}
function selectTab(tab){if(window.transitionPortfolioTab)window.transitionPortfolioTab(tab,()=>applyTab(tab));else applyTab(tab);}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',e=>{let index;if(e.key==='ArrowRight')index=(i+1)%tabs.length;else if(e.key==='ArrowLeft')index=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=tabs.length-1;else return;e.preventDefault();selectTab(tabs[index]);tabs[index].focus();});});
document.querySelector('#year').textContent=new Date().getFullYear();

function showContact(event){
  event.preventDefault();
  selectTab(document.querySelector('#tab-about'));
  document.querySelector('#contact').scrollIntoView({block:'center'});
  document.querySelector('#copy-email').focus({preventScroll:true});
}
document.querySelectorAll('[data-contact]').forEach(link=>link.addEventListener('click',showContact));
let copyStatusTimer;
document.querySelector('#copy-email').addEventListener('click',async()=>{
  const status=document.querySelector('#copy-status');
  try{await navigator.clipboard.writeText('shalespire@naver.com');clearTimeout(copyStatusTimer);status.textContent='복사 완료';status.classList.add('is-visible');copyStatusTimer=setTimeout(()=>status.classList.remove('is-visible'),1800);}
  catch{clearTimeout(copyStatusTimer);status.classList.add('is-visible');status.textContent='주소를 선택해서 복사해 주세요.';const range=document.createRange();range.selectNodeContents(document.querySelector('#contact-email'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);}
});

document.querySelector('#scroll-top').addEventListener('click',()=>{document.querySelector('#page-scroll').scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});

// Touch devices highlight the project closest to the scroll area's center.
const touchLayout=matchMedia('(hover: none)'),projectRows=[...document.querySelectorAll('.project-row')];
const scrollArea=document.querySelector('#page-scroll');let highlightedRow=null,projectFrame=0;
function updateProjectHighlight(){projectFrame=0;if(!touchLayout.matches||document.querySelector('#panel-other').hidden){projectRows.forEach(row=>row.classList.remove('is-scroll-active'));highlightedRow=null;return;}
 const maxScroll=Math.max(0,scrollArea.scrollHeight-scrollArea.clientHeight);
 const progress=maxScroll>0?Math.max(0,Math.min(1,scrollArea.scrollTop/maxScroll)):0;
 const index=Math.min(projectRows.length-1,Math.floor(progress*projectRows.length));
 const closest=projectRows[index];
 if(closest===highlightedRow)return;
 projectRows.forEach(row=>row.classList.toggle('is-scroll-active',row===closest));highlightedRow=closest;
}
function queueProjectHighlight(){if(!projectFrame)projectFrame=requestAnimationFrame(updateProjectHighlight);}
scrollArea.addEventListener('scroll',queueProjectHighlight,{passive:true});window.addEventListener('resize',queueProjectHighlight);touchLayout.addEventListener('change',queueProjectHighlight);new MutationObserver(queueProjectHighlight).observe(document.querySelector('#panel-other'),{attributes:true,attributeFilter:['hidden']});


const stickerBoard=document.querySelector('#illustration-grid');
let stickerGesture=null,stickerHoldTimer=0,stickerEndTimer=0,ignoreNativeClickUntil=0,syntheticStickerClick=false;
function finishStickerGesture(){clearTimeout(stickerHoldTimer);clearTimeout(stickerEndTimer);stickerGesture=null;window.stopTouchPeel?.();}
stickerBoard.addEventListener('touchstart',e=>{
 if(e.touches.length!==1){finishStickerGesture();return;}finishStickerGesture();
 const t=e.touches[0],card=e.target.closest('.illustration-card');
stickerGesture={card,x:t.clientX,y:t.clientY,lastY:t.clientY,mode:'pending'};
 if(!card)window.moveTouchPeel({x:t.clientX,y:t.clientY});
 stickerHoldTimer=setTimeout(()=>{if(stickerGesture?.mode==='pending'){stickerGesture.mode='peel';window.moveTouchPeel({x:stickerGesture.x,y:stickerGesture.y});}},220);
},{passive:false});
stickerBoard.addEventListener('touchmove',e=>{
 if(!stickerGesture||e.touches.length!==1)return;const t=e.touches[0],g=stickerGesture;
 if(g.mode!=='peel'){if(Math.hypot(t.clientX-g.x,t.clientY-g.y)>12){g.mode='scroll';clearTimeout(stickerHoldTimer);window.stopTouchPeel();}return;}e.preventDefault();
 if(g.mode==='pending'&&Math.hypot(t.clientX-g.x,t.clientY-g.y)>12){clearTimeout(stickerHoldTimer);g.mode='peel';window.stopTouchPeel();}
 if(g.mode==='peel')window.moveTouchPeel({x:t.clientX,y:t.clientY});
 g.lastY=t.clientY;
},{passive:false});
stickerBoard.addEventListener('touchend',e=>{
 if(!stickerGesture)return;const g=stickerGesture;if(!g.card&&g.mode==='scroll'){finishStickerGesture();return;}e.preventDefault();clearTimeout(stickerHoldTimer);stickerGesture=null;ignoreNativeClickUntil=Date.now()+700;
 if(g.mode==='pending'&&g.card){window.stopTouchPeel();syntheticStickerClick=true;try{g.card.click();}finally{syntheticStickerClick=false;}}
 else stickerEndTimer=setTimeout(()=>window.stopTouchPeel(),g.mode==='pending'?260:0);
},{passive:false});
stickerBoard.addEventListener('touchcancel',finishStickerGesture);
stickerBoard.addEventListener('click',e=>{if(!syntheticStickerClick&&Date.now()<ignoreNativeClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
stickerBoard.addEventListener('contextmenu',e=>e.preventDefault());
new MutationObserver(()=>{if(document.querySelector('#panel-illustration').hidden)finishStickerGesture();}).observe(document.querySelector('#panel-illustration'),{attributes:true,attributeFilter:['hidden']});

let activeMobilePreview=null,mobilePreviewFrame=0;
function updateMobilePreview(){mobilePreviewFrame=0;let best=null,bestDistance=Infinity;
 if(matchMedia('(hover: none)').matches&&!document.hidden&&!viewer.open&&!document.querySelector('#panel-motion').hidden){
  const viewport=scrollArea.getBoundingClientRect(),center=(viewport.top+viewport.bottom)/2;
  for(const item of mobilePreviews){const r=item.button.getBoundingClientRect(),visible=Math.max(0,Math.min(r.bottom,viewport.bottom)-Math.max(r.top,viewport.top));if(visible<Math.min(r.height,viewport.height)*.45)continue;const distance=Math.abs((r.top+r.bottom)/2-center);if(distance<bestDistance){best=item;bestDistance=distance;}}
 }
 if(best&&scrollArea.scrollTop<24)best=mobilePreviews[0];
 else if(best&&scrollArea.scrollTop+scrollArea.clientHeight>=scrollArea.scrollHeight-24)best=mobilePreviews[mobilePreviews.length-1];
 if(best===activeMobilePreview)return;activeMobilePreview?.stop();activeMobilePreview=best;best?.start();
}
function queueMobilePreview(){if(!mobilePreviewFrame)mobilePreviewFrame=requestAnimationFrame(updateMobilePreview);}
scrollArea.addEventListener('scroll',queueMobilePreview,{passive:true});window.addEventListener('resize',queueMobilePreview);document.addEventListener('visibilitychange',queueMobilePreview);new MutationObserver(queueMobilePreview).observe(document.querySelector('#panel-motion'),{attributes:true,attributeFilter:['hidden']});new MutationObserver(queueMobilePreview).observe(viewer,{attributes:true,attributeFilter:['open']});touchLayout.addEventListener('change',queueMobilePreview);queueMobilePreview();

// Resolve touch positions against all stickers, independent of pointer capture.
let touchPeelCard=null;
window.moveTouchPeel=function(point){const cards=[...document.querySelectorAll('.illustration-card')];let next=null,best=Infinity;for(const card of cards){const r=card.getBoundingClientRect();const dx=Math.max(r.left-point.x,0,point.x-r.right),dy=Math.max(r.top-point.y,0,point.y-r.bottom),d=Math.hypot(dx,dy);if(d<best){next=card;best=d;}}
 if(next!==touchPeelCard){touchPeelCard?.dispatchEvent(new CustomEvent('background-peel',{detail:null}));touchPeelCard=next;}touchPeelCard?.dispatchEvent(new CustomEvent('background-peel',{detail:point}));};
window.stopTouchPeel=function(){touchPeelCard?.dispatchEvent(new CustomEvent('background-peel',{detail:null}));touchPeelCard=null;};
