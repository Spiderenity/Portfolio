(() => {
  const {Engine,Bodies,Body,Composite,Constraint,Query,Vector}=Matter;
  const canvas=document.querySelector('#name-playground'),ctx=canvas.getContext('2d'),panel=document.querySelector('#panel-about');
  const characters=Array.from('shalespire@naver.com');
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  // Keep the explicitly requested touch interactions active on mobile.
  const reduced={get matches(){return motionPreference.matches&&!matchMedia('(pointer: coarse)').matches;},addEventListener:(...args)=>motionPreference.addEventListener(...args)};
  const engine=Engine.create({enableSleeping:true,positionIterations:12,velocityIterations:10,constraintIterations:4});engine.gravity.y=1.3;
  let width=0,height=0,size=52,walls=[],letters=[],grab=null,pointerId=null,frame=0,running=false,last=0,elapsed=0,nextLetter=0,dragTarget=null,hoverPoint=null,scrollDrag=null;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function makeWalls(){Composite.remove(engine.world,walls);walls=[Bodies.rectangle(width/2,height+30,width+120,60,{isStatic:true}),Bodies.rectangle(-30,height/2,60,height+800,{isStatic:true}),Bodies.rectangle(width+30,height/2,60,height+800,{isStatic:true}),Bodies.rectangle(width/2,-330,width+120,60,{isStatic:true})];Composite.add(engine.world,walls);}
  function addLetter(index,settled=false){
    const x=clamp(width-size*(.9+(index%3)*.65),size,width-size),y=settled?height-size*(.6+Math.floor(index/3)): -size*1.5;
    ctx.font=`700 ${size}px PortfolioTitle,sans-serif`;ctx.textAlign="left";ctx.textBaseline="alphabetic";const metric=ctx.measureText(characters[index]);const bw=Math.max(12,metric.actualBoundingBoxLeft+metric.actualBoundingBoxRight+4),bh=Math.max(12,metric.actualBoundingBoxAscent+metric.actualBoundingBoxDescent+4);
    const body=Bodies.rectangle(x,y,bw,bh,{chamfer:{radius:3},restitution:.22,friction:.65,frictionStatic:1,frictionAir:.008,density:.002,angle:[.25,-.32,.6,-.48,.17,-.65][index%6]});
    body.letter=characters[index];letters.push(body);Composite.add(engine.world,body);
    if(!settled){Body.setVelocity(body,{x:[-.6,.4,-1,.3,-.5,.2][index%6],y:0});Body.setAngularVelocity(body,[.015,-.025,.02,-.01,.03,-.02][index%6]);}
  }
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;const old=width;width=w;height=h;const previousSize=size;size=width<450?40:52;if(letters.length&&size!==previousSize)for(const b of letters)Body.scale(b,size/previousSize,size/previousSize);const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);makeWalls();if(old&&old!==w)for(const b of letters)Body.setPosition(b,{x:clamp(b.position.x/old*w,size/2,w-size/2),y:Math.min(b.position.y,h-size/2)});draw();}
  function draw(){if(!grab)canvas.classList.toggle("is-over-letter",!!hoverPoint&&Query.point(letters,hoverPoint).length>0);ctx.clearRect(0,0,width,height);ctx.fillStyle='#171717';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font=`700 ${size}px PortfolioTitle,sans-serif`;for(const b of letters){ctx.save();ctx.translate(b.position.x,b.position.y);ctx.rotate(b.angle);const m=ctx.measureText(b.letter);ctx.fillText(b.letter,(m.actualBoundingBoxLeft-m.actualBoundingBoxRight)/2,(m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2);ctx.restore();}ctx.strokeStyle='#17171730';ctx.beginPath();ctx.moveTo(0,height-1);ctx.lineTo(width,height-1);ctx.stroke();}
  function constrainBody(b){
    const dx=b.bounds.min.x<0?-b.bounds.min.x:b.bounds.max.x>width?width-b.bounds.max.x:0;
    const dy=b.bounds.min.y<-300?-300-b.bounds.min.y:b.bounds.max.y>height?height-b.bounds.max.y:0;
    if(dx||dy){Body.translate(b,{x:dx,y:dy});Body.setVelocity(b,{x:dx?0:b.velocity.x,y:dy?0:b.velocity.y});Body.setAngularVelocity(b,b.angularVelocity*.65);b.positionImpulse.x=0;b.positionImpulse.y=0;}
    const speed=Math.hypot(b.velocity.x,b.velocity.y);if(speed>18)Body.setVelocity(b,{x:b.velocity.x*18/speed,y:b.velocity.y*18/speed});
    if(Math.abs(b.angularVelocity)>.35)Body.setAngularVelocity(b,Math.sign(b.angularVelocity)*.35);
  }
  function updateGrab(){if(!grab||!dragTarget)return;const b=grab.bodyB,offset=grab.pointB;
    const left=b.position.x-b.bounds.min.x,right=b.bounds.max.x-b.position.x,top=b.position.y-b.bounds.min.y,bottom=b.bounds.max.y-b.position.y;
    grab.pointA={x:clamp(dragTarget.x-offset.x,left+2,width-right-2)+offset.x,y:clamp(dragTarget.y-offset.y,top+2,height-bottom-2)+offset.y};
  }
  function tick(time){if(!running)return;const dt=Math.min(time-last||16.67,33.33);last=time;elapsed+=dt;
    if(nextLetter<characters.length&&elapsed>=350+nextLetter*300){addLetter(nextLetter++);}
    for(let step=0;step<4;step++){updateGrab();Engine.update(engine,dt/4);for(const b of letters)constrainBody(b);}draw();frame=requestAnimationFrame(tick);
  }
  function release(){dragTarget=null;if(grab){Composite.remove(engine.world,grab);grab=null;}if(pointerId!==null&&canvas.hasPointerCapture(pointerId))canvas.releasePointerCapture(pointerId);pointerId=null;canvas.classList.remove('is-dragging');}
  function sync(){const visible=!panel.hidden&&!document.hidden;if(visible)resize();
    if(visible&&reduced.matches&&nextLetter<characters.length){while(nextLetter<characters.length)addLetter(nextLetter++,true);for(let i=0;i<180;i++)Engine.update(engine,16.67);draw();}
    if(visible&&!reduced.matches&&!running){running=true;last=performance.now();frame=requestAnimationFrame(tick);}else if(!visible||reduced.matches){running=false;cancelAnimationFrame(frame);release();}
  }
  function point(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
  canvas.addEventListener('pointerdown',e=>{if(grab)return;const p=point(e),body=Query.point(letters,p).at(-1)||(e.pointerType==='touch'?letters.filter(b=>Math.hypot(b.position.x-p.x,b.position.y-p.y)<32).sort((a,b)=>Math.hypot(a.position.x-p.x,a.position.y-p.y)-Math.hypot(b.position.x-p.x,b.position.y-p.y))[0]:null);if(!body){if(e.pointerType==='touch'){scrollDrag={id:e.pointerId,y:e.clientY};canvas.setPointerCapture(e.pointerId);}return;}e.preventDefault();Matter.Sleeping.set(body,false);grab=Constraint.create({pointA:p,bodyB:body,pointB:Vector.sub(p,body.position),stiffness:.055,damping:.22,length:0,angularStiffness:0});dragTarget=p;Composite.add(engine.world,grab);pointerId=e.pointerId;canvas.setPointerCapture(pointerId);canvas.classList.add('is-dragging');});
  canvas.addEventListener('pointermove',e=>{if(scrollDrag&&e.pointerId===scrollDrag.id){document.querySelector('#page-scroll').scrollTop+=scrollDrag.y-e.clientY;scrollDrag.y=e.clientY;return;}hoverPoint=point(e);if(!grab){canvas.classList.toggle('is-over-letter',Query.point(letters,point(e)).length>0);return;}if(e.pointerId!==pointerId)return;dragTarget=point(e);updateGrab();if(reduced.matches){Body.setPosition(grab.bodyB,Vector.sub(grab.pointA,grab.pointB));constrainBody(grab.bodyB);Body.setVelocity(grab.bodyB,{x:0,y:0});draw();}});
  canvas.addEventListener('pointerleave',()=>{hoverPoint=null;canvas.classList.remove('is-over-letter');});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(scrollDrag&&e.pointerId===scrollDrag.id){scrollDrag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}if(e.pointerId===pointerId)release();});
  new ResizeObserver(resize).observe(canvas);new MutationObserver(sync).observe(panel,{attributes:true,attributeFilter:['hidden']});document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);document.fonts.ready.then(sync);
})();
