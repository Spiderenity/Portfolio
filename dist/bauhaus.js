// Experimental concept, enabled only with ?concept=bauhaus.
// Truchet quarter-turn waves inspired by the supplied “26 Truchet Flow” example.
(()=>{
 if(new URLSearchParams(location.search).get('concept')!=='bauhaus')return;
 document.documentElement.classList.add('bauhaus');
 const style=document.createElement('link');style.rel='stylesheet';style.href='/bauhaus.css';document.head.append(style);
 document.querySelector('meta[name="theme-color"]').content='#f5eedc';
 const email=document.querySelector('#contact-email');
 if(email){const parts=email.textContent.split('@');const at=document.createElement('span');at.className='email-at';at.textContent='@';email.replaceChildren(document.createTextNode(parts[0]),at,document.createTextNode(parts.slice(1).join('@')));}
 document.querySelectorAll('.wordmark').forEach(a=>{const u=new URL(a.href);u.searchParams.set('concept','bauhaus');a.href=u.href;});
 const canvas=document.createElement('canvas');canvas.id='truchet-background';canvas.setAttribute('aria-hidden','true');document.body.prepend(canvas);
 const ctx=canvas.getContext('2d'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let width=0,height=0,ratio=1,time=0,last=0,frame=0,pointer=null;
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
   if(pointer&&!reduce.matches){const d=Math.hypot(pointer.x-cx,pointer.y-cy);angle+=Math.max(0,1-d/(size*1.6))*.22*Math.sin(time*2);}
   ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);ctx.beginPath();
   ctx.arc(-size/2,-size/2,size/2,0,Math.PI/2);
   ctx.moveTo(size/2-size/2,size/2);ctx.arc(size/2,size/2,size/2,Math.PI,Math.PI*1.5);
   ctx.stroke();ctx.restore();
  }
 }
 function tick(now){frame=0;if(document.hidden||reduce.matches)return;time+=last?Math.min((now-last)/1000,.05):0;last=now;draw();frame=requestAnimationFrame(tick);}
 function restart(){cancelAnimationFrame(frame);last=0;draw();if(!document.hidden&&!reduce.matches)frame=requestAnimationFrame(tick);}
 addEventListener('resize',resize);document.addEventListener('visibilitychange',restart);reduce.addEventListener('change',restart);
 addEventListener('pointermove',e=>{pointer={x:e.clientX,y:e.clientY};},{passive:true});document.addEventListener('pointerleave',()=>pointer=null);
 resize();restart();
 let transition=0,animations=[];
 window.transitionPortfolioTab=(tab,apply)=>{
  const tabs=[...document.querySelectorAll('[role=tab]')],selected=tabs.find(t=>t.getAttribute('aria-selected')==='true');
  if(tab===selected)return;
  const ticket=++transition;animations.forEach(a=>a.cancel());animations=[];
  const direction=tabs.indexOf(tab)>tabs.indexOf(selected)?1:-1;
  const old=document.getElementById(selected.getAttribute('aria-controls'));
  const next=document.getElementById(tab.getAttribute('aria-controls'));
  if(reduce.matches){apply();return;}
  const leave=old.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:`translateX(${-direction*64}px)`}],{duration:180,easing:'ease-in',fill:'forwards'});animations.push(leave);
  leave.finished.then(()=>{if(ticket!==transition)return;apply();leave.cancel();const enter=next.animate([{opacity:0,transform:`translateX(${direction*80}px)`},{opacity:1,transform:'translateX(0)'}],{duration:420,easing:'cubic-bezier(.2,.75,.2,1)'});animations=[enter];}).catch(()=>{});
 };
 const viewer=document.querySelector('#viewer');let closing=false,opening=null;
 const close=viewer.close.bind(viewer);
 viewer.close=(...args)=>{if(closing||!viewer.open)return;if(reduce.matches){close(...args);return;}closing=true;opening?.cancel();viewer.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(56px)'}],{duration:200,easing:'ease-in'}).finished.finally(()=>{close(...args);closing=false;});};
 viewer.addEventListener('cancel',e=>{e.preventDefault();viewer.close();});
 new MutationObserver(()=>{if(viewer.open&&!closing&&!reduce.matches)opening=viewer.animate([{opacity:0,transform:'translateY(70px)'},{opacity:1,transform:'translateY(0)'}],{duration:430,easing:'cubic-bezier(.16,1,.3,1)'});}).observe(viewer,{attributes:true,attributeFilter:['open']});
})();
