const fs=require('fs'),vm=require('vm'),assert=require('assert'),Matter=require('../dist/vendor/matter.min.js');
const ctx=new Proxy({},{get:(_,key)=>key==='measureText'?()=>({actualBoundingBoxLeft:0,actualBoundingBoxRight:24,actualBoundingBoxAscent:32,actualBoundingBoxDescent:4}):()=>{},set:()=>true});let callback;
const canvas={clientWidth:800,clientHeight:764,getBoundingClientRect:()=>({left:0,top:0}),getContext:()=>ctx,addEventListener(){},classList:{add(){},remove(){},toggle(){}},hasPointerCapture:()=>false};
const sandbox={Matter,getComputedStyle:()=>({fontSize:"42px"}),document:{documentElement:{classList:{contains:()=>true}},querySelector:s=>s==='#name-playground'?canvas:s==='#contact-email'?{getBoundingClientRect:()=>({left:480,top:400,width:320,height:64})}:{hidden:false,querySelector(){return {};}},hidden:false,addEventListener(){},fonts:{ready:{then(fn){callback=fn;}}}},matchMedia:()=>({matches:false,addEventListener(){}}),devicePixelRatio:1,performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},ResizeObserver:class{observe(){}},MutationObserver:class{observe(){}},assert};
vm.createContext(sandbox);let src=fs.readFileSync('dist/name-play.js','utf8').replace('})();','globalThis.test={tick,sync,stress(){const b=letters[0];Matter.Sleeping.set(b,false);grab=Constraint.create({pointA:{x:400,y:400},bodyB:b,pointB:{x:15,y:10},stiffness:.055,damping:.22,length:0});Composite.add(engine.world,grab);dragTarget={x:3000,y:3000};},get letters(){return letters}};})();');vm.runInContext(src,sandbox);callback();
for(let i=1;i<=24;i++)sandbox.test.tick(i*16.667);assert.equal(sandbox.test.letters.length,1);assert(sandbox.test.letters[0].position.y<0);
for(let i=25;i<1500;i++)sandbox.test.tick(i*16.667);
assert.equal(sandbox.test.letters.length,20);for(const b of sandbox.test.letters){assert(Number.isFinite(b.angle));assert(b.position.x>0&&b.position.x<800);assert(b.position.y>0&&b.position.y<764);}
assert(sandbox.test.letters.some(b=>Math.abs(b.angle)>.3));assert(sandbox.test.letters.some(b=>b.position.x>480&&b.bounds.max.y<405));console.log('Passed: letters land on email collision box');


sandbox.test.stress();for(let i=1500;i<2000;i++)sandbox.test.tick(i*16.667);for(const b of sandbox.test.letters){assert(b.bounds.min.x>=-.1);assert(b.bounds.max.x<=800.1);assert(b.bounds.max.y<=764.1);}console.log('Boundary stress passed: held outside bottom/right for 500 frames');


