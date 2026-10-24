// Default theme; the previous design remains available with ?theme=legacy.
// Truchet quarter-turn waves inspired by the supplied “26 Truchet Flow” example.
(()=>{
 if(new URLSearchParams(location.search).get('theme')==='legacy'){document.querySelectorAll('.wordmark').forEach(a=>{const u=new URL(a.href);u.searchParams.set('theme','legacy');a.href=u.href;});return;}
 document.documentElement.classList.add('bauhaus');
 const closeButton=document.querySelector('#close-viewer');
 closeButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

 document.querySelector('meta[name="theme-color"]').content='#f5eedc';
 document.querySelectorAll('.wordmark').forEach(a=>{const u=new URL(a.href);u.searchParams.delete('concept');a.href=u.href;});
 const canvas=document.createElement('canvas');canvas.id='truchet-background';canvas.setAttribute('aria-hidden','true');document.body.prepend(canvas);
 const ctx=canvas.getContext('2d');
 const motionPreference=matchMedia('(prefers-reduced-motion: reduce)'),touchDevice=matchMedia('(pointer: coarse)');
 // The requested mobile experience keeps background and navigation motion enabled.
 const reduce={get matches(){return motionPreference.matches&&!touchDevice.matches;},addEventListener(type,listener){motionPreference.addEventListener(type,listener);touchDevice.addEventListener(type,listener);}};
 let width=0,height=0,ratio=1,time=0,last=0,frame=0,pointer=null,pointerTarget=null,pointerStrength=0;
 const mod=(n,m)=>((n%m)+m)%m;
 const ease=k=>{k=Math.max(0,Math.min(1,k));return k*k*(3-2*k);};
 function resize(){width=innerWidth;height=innerHeight;ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);draw();}
 function draw(){
  ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
  const size=width<600?112:160,drift=reduce.matches?0:time*10,offset=mod(drift,size),base=Math.floor(drift/size);
  ctx.strokeStyle='#68aab4';ctx.lineWidth=size*.16;ctx.lineCap='round';
  for(let y=-2;y<height/size+2;y++)for(let x=-2;x<width/size+2;x++){
   const i=x-base,j=y-base,ix=mod(i,8),jy=mod(j,8);
   const seed=mod(ix*13+jy*7+ix*jy*3,17),initial=seed%2;
   // Alternate diagonal wave directions and clockwise/counterclockwise turns.
   const phase=mod(time,16),forward=phase<8;
   const delay=(forward?mod(ix+jy,8):mod(ix-jy,8))*.32;
   const progress=ease(((phase%8)-delay)/1.15);
   let angle=(initial+(forward?progress:1-progress))*Math.PI/2;
   const cx=x*size+offset,cy=y*size+offset;
   if(pointer&&!reduce.matches){const d=Math.hypot(pointer.x-cx,pointer.y-cy);angle+=Math.max(0,1-d/(size*1.6))*.22*Math.sin(time*2)*pointerStrength;}
   ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);ctx.beginPath();
   ctx.arc(-size/2,-size/2,size/2,0,Math.PI/2);
   ctx.moveTo(size/2-size/2,size/2);ctx.arc(size/2,size/2,size/2,Math.PI,Math.PI*1.5);
   ctx.stroke();ctx.restore();
  }
 }
 function tick(now){frame=0;if(document.hidden||reduce.matches)return;const dt=last?Math.min((now-last)/1000,.05):0;time+=dt;last=now;const follow=1-Math.exp(-dt/.22);if(pointerTarget){if(!pointer)pointer={...pointerTarget};pointer.x+=(pointerTarget.x-pointer.x)*follow;pointer.y+=(pointerTarget.y-pointer.y)*follow;}pointerStrength+=((pointerTarget?1:0)-pointerStrength)*follow;draw();frame=requestAnimationFrame(tick);}
 function restart(){cancelAnimationFrame(frame);last=0;draw();if(!document.hidden&&!reduce.matches)frame=requestAnimationFrame(tick);}
 addEventListener('resize',resize);document.addEventListener('visibilitychange',restart);reduce.addEventListener('change',restart);
 addEventListener('pointermove',e=>{pointerTarget={x:e.clientX,y:e.clientY};},{passive:true});document.addEventListener('pointerleave',()=>pointerTarget=null);
 resize();restart();
 let transition=0,animations=[];
 const main=document.querySelector('#works');
 function clearMainSize(){main.style.height='';main.style.minHeight='';main.style.flex='';main.style.overflow='';}
 window.transitionPortfolioTab=(tab,apply)=>{
  const tabs=[...document.querySelectorAll('[role=tab]')],selected=tabs.find(t=>t.getAttribute('aria-selected')==='true');
  if(tab===selected)return;
  const startHeight=main.getBoundingClientRect().height;
  const ticket=++transition;animations.forEach(a=>a.cancel());animations=[];clearMainSize();
  const direction=tabs.indexOf(tab)>tabs.indexOf(selected)?1:-1;
  const old=document.getElementById(selected.getAttribute('aria-controls'));
  const next=document.getElementById(tab.getAttribute('aria-controls'));
  if(reduce.matches){apply();return;}
  main.style.flex='0 0 auto';main.style.minHeight='0';main.style.height=startHeight+'px';main.style.overflow='clip';
  const imagesReady=Promise.allSettled([...next.querySelectorAll('img')].map(img=>{img.loading='eager';return img.decode();}));
  const leave=old.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:`translateX(${-direction*64}px)`}],{duration:180,easing:'ease-in',fill:'forwards'});animations.push(leave);
  Promise.all([leave.finished,imagesReady]).then(()=>{
   if(ticket!==transition)return;
   apply();leave.cancel();
   const viewport=document.querySelector('#page-scroll'),footer=document.querySelector('.footer');
   const endHeight=Math.max(next.getBoundingClientRect().height,viewport.clientHeight-footer.getBoundingClientRect().height);
   const timing={duration:420,easing:'cubic-bezier(.2,.75,.2,1)'};
   const size=main.animate([{height:startHeight+'px'},{height:endHeight+'px'}],{...timing,fill:'forwards'});
   const enter=next.animate([{opacity:0,transform:`translateX(${direction*80}px)`},{opacity:1,transform:'translateX(0)'}],timing);
   animations=[enter,size];
   size.finished.then(()=>{if(ticket===transition){main.style.height=endHeight+'px';size.cancel();clearMainSize();animations=[];}}).catch(()=>{});
  }).catch(()=>{});
 };
 const viewer=document.querySelector('#viewer');let closing=false,opening=null;
 const close=viewer.close.bind(viewer);
 viewer.close=(...args)=>{if(closing||!viewer.open)return;if(reduce.matches){close(...args);return;}closing=true;opening?.cancel();viewer.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(56px)'}],{duration:200,easing:'ease-in'}).finished.finally(()=>{close(...args);closing=false;});};
 viewer.addEventListener('cancel',e=>{e.preventDefault();viewer.close();});
 new MutationObserver(()=>{if(viewer.open&&!closing&&!reduce.matches)opening=viewer.animate([{opacity:0,transform:'translateY(70px)'},{opacity:1,transform:'translateY(0)'}],{duration:430,easing:'cubic-bezier(.16,1,.3,1)'});}).observe(viewer,{attributes:true,attributeFilter:['open']});
})();
