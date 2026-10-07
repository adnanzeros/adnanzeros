const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches||typeof gsap==='undefined';
$('#yr').textContent=new Date().getFullYear();

/* ---------- contact form (runs first so nothing else can break it) ---------- */
(()=>{
 const f=$('#form'),st=$('#status'),dial=$('#dial'),btn=$('button[type=submit]',f);
 if(window.COUNTRIES&&dial)dial.innerHTML=COUNTRIES.map(([n,c],i)=>`<option value="${c}"${i===0?' selected':''}>${n} (+${c})</option>`).join('');
 const say=(t,k='')=>{st.textContent=t;st.className=k};
 f.addEventListener('submit',async e=>{
  e.preventDefault();
  const b=Object.fromEntries(new FormData(f));
  const digits=String(b.phone||'').replace(/\D/g,'').replace(/^0+/,'');
  if(!b.name.trim())return say('Please enter your name.','err');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))return say('Please enter a valid email.','err');
  if(digits.length<6||b.dialCode.length+digits.length>15)return say('Please enter a valid WhatsApp number.','err');
  if(b.message.trim().length<5)return say('Please write a short message.','err');
  btn.disabled=true;say('Sending…');
  try{
   const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
   const d=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error(d.error||'Could not send. Try again later.');
   say('Message sent. I will reply soon.','ok');f.reset();
  }catch(err){say(err.message==='Failed to fetch'?'Cannot reach the server. Run npm run dev and open http://localhost:3000':err.message,'err')}
  btn.disabled=false;
 });
})();


/* ---------- content ---------- */
const TECH={"Languages": [["HTML5", "html5"], ["CSS3", "css3"], ["JavaScript", "javascript"], ["TypeScript", "typescript"], ["Python", "python"], ["PowerShell", "powershell"]], "Frontend": [["React", "react"], ["Next.js", "nextjs"], ["React Native", "react-native"], ["React Router", "react-router"], ["Vite", "vite"], ["Tailwind CSS", "tailwind"], ["WordPress", "wordpress"], ["GSAP", "gsap"], ["Three.js", "threejs"]], "Backend & Cloud": [["Node.js", "nodejs"], ["Vercel", "vercel"], ["Netlify", "netlify"], ["Firebase", "firebase"], ["Google Cloud", "google-cloud"], ["Resend", "resend"]], "Tools & Design": [["Git", "git"], ["GitHub", "github"], ["npm", "npm"], ["Figma", "figma"], ["Canva", "canva"], ["Adobe XD", "adobe-xd"], ["Blender", "blender"]]};
const PROJ={
 frontend:[
  {n:'Shuru Kori Online',d:'Learning and guidance platform with live sessions and practical work.',t:['Web','Platform'],u:'https://shurukori.online/'},
  {n:'DevStack',d:'React tech stack builder. Explore technologies and compose your own stack.',t:['React','Vite','CSS'],u:'https://sparkling-chaja-0c0966.netlify.app/',g:'https://github.com/adnanzeros/Assignment-5'},
  {n:'batch-14-assignment-1',d:'Responsive layout assignment built with HTML and CSS.',t:['HTML','CSS'],u:'https://github.com/adnanzeros/batch-14-assignment-1'}],
 backend:[
  {n:'Contact API (this site)',d:'Serverless function that validates messages and emails them through Resend. Keys stay in .env.local.',t:['Node.js','Vercel','Resend'],u:'https://github.com/adnanzeros'}],
 tools:[
  {n:'TimeMate: Screen Time Coach',d:'Chrome extension (Manifest V3) that tracks tab time, sends reminders, blocks sites and has a Focus Mode.',t:['JavaScript','Chrome APIs'],u:'https://github.com/adnanzeros/screen-time-coach'}]
};
$('#techgrid').innerHTML=Object.entries(TECH).map(([k,v])=>`<div class="tgroup"><h3>${k}</h3><div class="tiles">${v.map(([n,f])=>`<div class="tile tilt"><img src="assets/tech/${f}.svg" alt="${n}" width="84" height="84" loading="lazy"><span>${n}</span></div>`).join('')}</div></div>`).join('');
const drawProj=t=>{$('#projgrid').innerHTML=PROJ[t].map(p=>`<a class="card tilt" href="${p.u}" target="_blank" rel="noopener"><h3>${p.n}</h3><p>${p.d}</p><div class="chips">${p.t.map(x=>`<span>${x}</span>`).join('')}</div></a>`).join('');bindTilt();if(!reduce)gsap.from('#projgrid .card',{y:40,rotateX:-40,transformPerspective:900,opacity:0,stagger:.1,duration:.7,ease:'power3.out'})};
$$('.tabs button').forEach(b=>b.onclick=()=>{$$('.tabs button').forEach(x=>x.classList.remove('on'));b.classList.add('on');drawProj(b.dataset.t)});

/* ---------- menu ---------- */
const burger=$('.burger'),menu=$('.menu');
const setMenu=o=>{menu.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''};
burger.onclick=()=>setMenu(!menu.classList.contains('open'));
$$('.menu a').forEach(a=>a.onclick=()=>setMenu(false));

/* ---------- 3D tilt (cards + photo) ---------- */
function bindTilt(){
 if(reduce)return;
 $$('.tilt').forEach(el=>{
  if(el._t)return;el._t=1;
  el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
   gsap.to(el,{transformPerspective:900,rotateY:x*16,rotateX:-y*16,duration:.4,ease:'power2.out'})});
  el.addEventListener('mouseleave',()=>gsap.to(el,{rotateX:0,rotateY:0,duration:.6}));
 });
}
const img=$('#photo img');img.classList.add('tilt');drawProj('frontend');bindTilt();

/* ---------- hero intro (one orchestrated moment) ---------- */
const logo=$('.logo');logo.innerHTML=[...logo.textContent].map(c=>`<span>${c}</span>`).join('');
if(typeof gsap!=='undefined')gsap.registerPlugin(ScrollTrigger);
if(!reduce){
 gsap.timeline({defaults:{ease:'power4.out'}})
  .from('.logo span',{yPercent:110,rotateX:-90,opacity:0,stagger:.05,duration:1.1})
  .from('.hi,.role,.cta',{y:20,opacity:0,stagger:.12,duration:.7},'-=.6')
  .from('#photo img',{rotateY:-60,opacity:0,scale:.9,duration:1.3},'-=1.2');
 gsap.utils.toArray('.wrap h2').forEach(h=>gsap.from(h,{scrollTrigger:{trigger:h,start:'top 85%'},x:-30,opacity:0,duration:.8}));
}

/* ---------- three.js background ---------- */
try{(()=>{
 const cv=$('#bg'),R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});
 R.setPixelRatio(Math.min(devicePixelRatio,2));
 const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(60,1,.1,100);C.position.z=7;
 const mat=new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.18});
 const core=new THREE.Mesh(new THREE.IcosahedronGeometry(2.4,1),mat);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(3.6,.012,8,120),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.25}));
 ring.rotation.x=1.2;
 const n=700,pos=new Float32Array(n*3);for(let i=0;i<n*3;i++)pos[i]=(Math.random()-.5)*26;
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
 const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0xffffff,size:.035,transparent:true,opacity:.6}));
 const g=new THREE.Group();g.add(core,ring);S.add(g,pts);
 const size=()=>{R.setSize(innerWidth,innerHeight);C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix();g.position.x=innerWidth>820?2.6:0};
 size();addEventListener('resize',size);
 let mx=0,my=0;addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
 let sc=0;addEventListener('scroll',()=>sc=scrollY/innerHeight,{passive:true});
 (function loop(){
  const t=performance.now()*.0003;
  if(!reduce){core.rotation.y=t+sc*.8;core.rotation.x=t*.6+my*.6;ring.rotation.z=t*2;pts.rotation.y=t*.3+mx*.3;g.position.y=-sc*.6;C.position.x+=(mx*1.2-C.position.x)*.04}
  R.render(S,C);requestAnimationFrame(loop);
 })();
})()}catch(err){console.warn('3D background disabled:',err.message)}

/* ---------- scroll animations ---------- */
if(!reduce){
 $$('.tgroup').forEach(g=>{
  gsap.from($$('.tile',g),{scrollTrigger:{trigger:g,start:'top 82%'},y:70,z:-200,rotateX:-80,transformPerspective:900,opacity:0,stagger:.05,duration:.9,ease:'back.out(1.4)'});
  gsap.from($('h3',g),{scrollTrigger:{trigger:g,start:'top 88%'},x:-30,opacity:0,duration:.6});
 });
 gsap.from('#about .lead',{scrollTrigger:{trigger:'#about',start:'top 75%'},y:40,opacity:0,duration:1});
 gsap.from('#github .stats img',{scrollTrigger:{trigger:'#github',start:'top 75%'},y:60,rotateX:-30,transformPerspective:900,opacity:0,stagger:.15,duration:.9});
 gsap.from('.foot > *',{scrollTrigger:{trigger:'.foot',start:'top 95%'},y:20,opacity:0,stagger:.08,duration:.6});
 gsap.to('.photo',{scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true},y:-80,rotateZ:3});
 gsap.to('.hero-text',{scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true},y:-60,opacity:.2});
}
if(typeof gsap!=='undefined')gsap.to('#bar',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.3}});
