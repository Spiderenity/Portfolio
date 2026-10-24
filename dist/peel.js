// Draw the actual alpha silhouette as a front sheet and a reflected paper back.
// The fold follows the pointer. No generated artwork or rectangular hover overlay.
window.attachPeel=function(button,img){
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  // Keep the explicitly requested touch interactions active on mobile.
  const reduced={get matches(){return motionPreference.matches&&!matchMedia('(pointer: coarse)').matches;},addEventListener:(...args)=>motionPreference.addEventListener(...args)};
  const canvas=document.createElement('canvas');canvas.className='peel-canvas';canvas.setAttribute('aria-hidden','true');button.append(canvas);
  const ctx=canvas.getContext('2d');let back,fold,edge=[],w,h,depth=0,target=0,nx=0,ny=-1,raf=0,ready=false,heading=-Math.PI/2,targetHeading=-Math.PI/2,lastTime=0;
  function polygon(points,d,inside){
    const out=[];
    for(let i=0;i<points.length;i++){
      const a=points[i],b=points[(i+1)%points.length],da=a[0]*nx+a[1]*ny-d,db=b[0]*nx+b[1]*ny-d;
      const ia=inside?da<=0:da>=0,ib=inside?db<=0:db>=0;
      if(ia)out.push(a);if(ia!==ib){const t=da/(da-db);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
    }return out;
  }
  function path(points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();}
  function draw(){
    if(!ready)return;ctx.clearRect(0,0,w,h);
    if(depth<.4){ctx.drawImage(img,0,0,w,h);return;}
    const rect=[[0,0],[w,0],[w,h],[0,h]];
    const max=Math.max(...edge.map(p=>p[0]*nx+p[1]*ny)),d=max-depth;
    const front=polygon(rect,d,true),flap=polygon(rect,d,false);
    ctx.save();path(front);ctx.clip();ctx.drawImage(img,0,0,w,h);ctx.restore();
    // A rigid reflection preserves the actual contour; no scale/shear is applied.
    const a=1-2*nx*nx,b=-2*nx*ny,c=1-2*ny*ny,tx=2*d*nx,ty=2*d*ny;
    const f=fold.getContext('2d');f.clearRect(0,0,w,h);f.save();
    f.beginPath();flap.forEach((p,i)=>i?f.lineTo(...p):f.moveTo(...p));f.closePath();f.clip();f.drawImage(back,0,0);
    // Shade on an isolated alpha layer so the front can never acquire a solid triangle.
    f.globalCompositeOperation='source-atop';const g=f.createLinearGradient(nx*d,ny*d,nx*(d+depth),ny*(d+depth));
    g.addColorStop(0,'rgba(100,82,45,.46)');g.addColorStop(.18,'rgba(255,255,255,.95)');g.addColorStop(.65,'rgba(248,244,228,.3)');g.addColorStop(1,'rgba(170,150,102,.22)');f.fillStyle=g;f.fillRect(0,0,w,h);f.restore();
    ctx.save();ctx.transform(a,b,b,c,tx,ty);ctx.shadowColor='rgba(35,24,3,.24)';ctx.shadowBlur=depth*.14;ctx.shadowOffsetX=-nx*depth*.05;ctx.shadowOffsetY=-ny*depth*.05;ctx.drawImage(fold,0,0);ctx.restore();
  }
  function tick(time){const dt=lastTime&&time?Math.min(time-lastTime,40):16.67;lastTime=time||0;const ease=1-Math.exp(-dt/185);depth+=(target-depth)*ease;const turn=Math.atan2(Math.sin(targetHeading-heading),Math.cos(targetHeading-heading));heading+=turn*ease;nx=Math.cos(heading);ny=Math.sin(heading);draw();if(Math.abs(target-depth)>.15||(target>0&&Math.abs(turn)>.003))raf=requestAnimationFrame(tick);else{depth=target;draw();raf=0;lastTime=0;}}
  function animate(){if(!raf)raf=requestAnimationFrame(tick);}
  function init(){
    w=Math.min(img.naturalWidth,900);h=Math.round(img.naturalHeight*w/img.naturalWidth);canvas.width=w;canvas.height=h;
    back=document.createElement('canvas');back.width=w;back.height=h;const b=back.getContext('2d');b.drawImage(img,0,0,w,h);
    const alpha=b.getImageData(0,0,w,h).data;edge=[];
    for(let y=0;y<h;y+=2){let left=-1,right=-1;for(let x=0;x<w;x++){if(alpha[(y*w+x)*4+3]>128){if(left<0)left=x;right=x;}}if(left>=0){edge.push([left,y],[right,y]);}}
    b.globalCompositeOperation='source-in';b.fillStyle='#fffbea';b.fillRect(0,0,w,h);fold=document.createElement('canvas');fold.width=w;fold.height=h;
    ready=true;button.classList.add('peel-ready');draw();
  }
  img.addEventListener('load',init,{once:true});if(img.complete&&img.naturalWidth)init();
  button.addEventListener('pointermove',e=>{
    if(!ready||reduced.matches||e.pointerType==='touch')return;
    const r=canvas.getBoundingClientRect();const angle=parseFloat(button.style?.getPropertyValue('--tilt')||'0')*Math.PI/180;
    const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),cw=button.offsetWidth||r.width,ch=button.offsetHeight||r.height;
    const px=Math.max(0,Math.min(1,(dx*Math.cos(angle)+dy*Math.sin(angle))/cw+.5)),py=Math.max(0,Math.min(1,(-dx*Math.sin(angle)+dy*Math.cos(angle))/ch+.5));
    const x=(px-.5)*2,y=(py-.5)*2,len=Math.hypot(x,y)||1;targetHeading=(!x&&!y)?-Math.PI/2:Math.atan2(y/len,x/len);
    target=Math.min(w,h)*(.15+.18*(1-Math.max(Math.abs(x),Math.abs(y))));animate();
  });
  button.addEventListener('background-peel',e=>{if(!ready)return;if(!e.detail){button.classList.remove('is-peeling');target=0;animate();return;}button.classList.add('is-peeling');const r=canvas.getBoundingClientRect();const angle=parseFloat(button.style?.getPropertyValue('--tilt')||'0')*Math.PI/180,dx=e.detail.x-r.left-r.width/2,dy=e.detail.y-r.top-r.height/2;const x=dx*Math.cos(angle)+dy*Math.sin(angle),y=-dx*Math.sin(angle)+dy*Math.cos(angle);if(Math.hypot(x,y)>8)targetHeading=Math.atan2(y,x);target=Math.min(w,h)*.16;animate();});
  img.draggable=false;if(img.style)img.style.pointerEvents='none';
  button.addEventListener('contextmenu',e=>e.preventDefault());
  button.addEventListener('pointerleave',()=>{target=0;animate();});
  button.addEventListener('focus',()=>{if(!reduced.matches&&matchMedia('(hover: hover)').matches){targetHeading=Math.atan2(-.714,.7);target=Math.min(w,h)*.18;animate();}});
  button.addEventListener('blur',()=>{target=0;animate();});
  reduced.addEventListener('change',()=>{if(reduced.matches){target=0;depth=0;draw();}});
};
