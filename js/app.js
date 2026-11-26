(function(){
'use strict';
const D=window.DATA,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const main=$('#main'),side=$('#side');
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let done=new Set(store.get('done',[])),saved=new Set(store.get('saved',[]));
const persist=()=>{store.set('done',[...done]);store.set('saved',[...saved])};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CMD=/\b((?:kubectl|docker|terraform|aws|df|du|lsof|journalctl|systemctl|ss|curl|dig|git|chmod|chown|find|logrotate|usermod|visudo|openssl|tcpdump|helm|ansible)(?:\s+[\w\-<>\/.=:*$%|]+){0,3})/g;
const FLAG=/(\s)(--?[a-zA-Z][\w-]*|[\w.-]+\/[\w\/.-]+|[a-zA-Z]+:\s?[a-zA-Z_]+_[a-zA-Z_]+)/g;
function rich(t){let s=esc(t);s=s.replace(CMD,'<code>$1</code>');return s}
function steps(a){const parts=a.split(/(?<=[.!?])\s+(?=[A-Z"'(])/).filter(Boolean);return parts}
const all=[];D.topics.forEach(t=>{t.qa.forEach(x=>{x.t=t;all.push(x)});});
const idx=new Map(all.map(x=>[x.id,x]));
const lvlLabel={Junior:'Junior',Mid:'Mid-level',General:'General'};
function toast(m){const e=document.createElement('div');e.className='toast';e.textContent=m;document.body.appendChild(e);setTimeout(()=>e.remove(),1400)}
function follows(t,x){
  const txt=(x.q+' '+x.a).toLowerCase();
  const sc=t.follow.map(f=>({f,s:f.k.reduce((n,k)=>n+(txt.includes(k)?1:0),0)})).filter(o=>o.s>0).sort((a,b)=>b.s-a.s).slice(0,2).map(o=>o.f);
  const g=D.generic,i=x.id%g.length,out=[...sc];
  for(let k=0;out.length<3;k++)out.push(g[(i+k)%g.length]);
  return out;
}
function fuHtml(list,title){return `<div class="fu"><h5>${title||'Interviewer may ask next:'}</h5>${list.map(f=>`<details><summary>${esc(f.q)}</summary><p>${rich(f.a)}</p></details>`).join('')}</div>`}
function qCard(x,t,n,tag){
  const isQ=x.id!==undefined;
  const fu=isQ?follows(t,x):(x.fu&&x.fu.length?x.fu:[]);
  const st=steps(x.a);
  const key=isQ?x.id:null;
  return `<details class="q ${key&&done.has(key)?'done':''}" ${key?`data-id="${key}"`:''} style="--c:${t.color}">
  <summary><span class="n">${tag||n}</span><span class="qt">${esc(x.q)}${isQ?`<span class="lv">${lvlLabel[x.lvl]}</span>`:''}</span><span class="chev">›</span></summary>
  <div class="body">
   <p class="say">How to answer in an interview</p>
   <ol class="steps">${st.map(s=>`<li>${rich(s)}</li>`).join('')}</ol>
   ${fu.length?fuHtml(fu,isQ?'Likely follow-up questions':'Follow-up'):''}
   ${isQ?`<div class="acts"><button class="mini ${done.has(key)?'on':''}" data-act="done">${done.has(key)?'✓ Learned':'Mark as learned'}</button><button class="mini ${saved.has(key)?'on':''}" data-act="save">${saved.has(key)?'★ Saved':'☆ Save'}</button></div>`:''}
  </div></details>`;
}
function flow(d,c){return `<div class="flow" style="--c:${c}"><h3>${esc(d.t)}</h3><div class="fl">${d.steps.map((s,i)=>(i?'<span class="ar"></span>':'')+`<div class="nd">${esc(s)}</div>`).join('')}</div></div>`}
function prog(t){const n=t.qa.length,d=t.qa.filter(x=>done.has(x.id)).length;return {n,d,p:Math.round(d/n*100)}}
function renderSide(r){
  const cur=r[0]==='t'?r[1]:'';
  side.innerHTML=`<h4>Start</h4><a href="#/" class="${!r[0]?'on':''}">🏠 Home</a><a href="#/prep" class="${r[0]==='prep'?'on':''}">💼 Career &amp; Salary prep</a><a href="#/mock" class="${r[0]==='mock'?'on':''}">🎤 Mock interview</a><a href="#/saved" class="${r[0]==='saved'?'on':''}">🔖 Saved <small>${saved.size}</small></a><h4>Topics</h4>`+
  D.topics.map(t=>{const p=prog(t);return `<a href="#/t/${t.slug}" class="${cur===t.slug?'on':''}" style="--c:${t.color}"><span>${t.icon}</span>${esc(t.name)}<small>${p.d}/${p.n}</small></a><div class="bar" style="--c:${t.color}"><i style="width:${p.p}%"></i></div>`}).join('');
  $$('.bottom a').forEach(a=>a.classList.toggle('on',a.dataset.r===(r[0]||'home')));
}
function home(){
  const tot=all.length,d=done.size;
  const extras=D.topics.reduce((n,t)=>n+t.edge.length+t.follow.length,0);
  main.innerHTML=`<section class="hero"><h1>Crack your next DevOps interview</h1><p>Real scenario questions with answers you can say out loud, diagrams for every topic, edge cases, and follow-up questions the interviewer will actually ask.</p>
  <div class="stats"><span><b>${tot}</b>scenarios</span><span><b>${extras}</b>edge cases &amp; follow-ups</span><span><b>${D.topics.length}</b>topics</span><span><b>${d}</b>learned</span></div><p style="margin:16px 0 0"><a class="btn" href="#/mock">🎤 Start mock interview</a></p></section>
  <h2 style="margin-top:0">Topics</h2><div class="grid">${D.topics.map(t=>{const p=prog(t);return `<a class="tcard" href="#/t/${t.slug}" style="--c:${t.color}"><div class="ic">${t.icon}</div><h3>${esc(t.name)}</h3><p>${esc(t.blurb)}</p><div class="meter"><i style="width:${p.p}%"></i></div><div class="meta"><span>${t.qa.length} questions</span><span>${p.p}% learned</span></div></a>`}).join('')}</div>
  <h2>Also here</h2><div class="grid"><a class="tcard" href="#/prep" style="--c:#0f766e"><div class="ic">💼</div><h3>Career &amp; salary prep</h3><p>Self-intro, HR answers, resume tips, 30-day plan and negotiation script.</p></a></div>`;
}
let tabState={};
function topic(slug,tab){
  const t=D.topics.find(x=>x.slug===slug);if(!t)return home();
  tab=tab||tabState[slug]||'q';tabState[slug]=tab;
  const tabs=[['q','Questions',t.qa.length],['d','Diagrams',t.diagrams.length],['c','Cheatsheet',t.cheats.length],['e','Edge cases',t.edge.length],['f','Follow-ups',t.follow.length]];
  let body='';
  if(tab==='q'){
    body=`<div class="tools"><input id="flt" type="search" placeholder="Filter ${esc(t.name)} questions…" aria-label="Filter questions"><div class="chips" id="lvls">${['All','Junior','Mid','General'].map((l,i)=>`<button class="chip ${i?'':'on'}" data-l="${l}">${l==='Mid'?'Mid-level':l}</button>`).join('')}</div></div><div id="list"></div>`;
  }else if(tab==='d')body=`<p class="lead">Read these top to bottom. In an interview, drawing a flow like this on the whiteboard shows structured thinking.</p>`+t.diagrams.map(d=>flow(d,t.color)).join('');
  else if(tab==='c')body=`<p class="lead">Tap a command to copy it.</p><div class="cheats">${t.cheats.map(c=>`<div class="ch"><code data-copy="${esc(c.c)}">${esc(c.c)}</code><span>${esc(c.d)}</span></div>`).join('')}</div>`;
  else if(tab==='e')body=`<p class="lead">Tricky "what if" scenarios that interviewers use to test real experience.</p>`+t.edge.map((e,i)=>qCard(e,t,'E'+(i+1))).join('');
  else body=`<p class="lead">Common follow-up questions with short spoken-style answers.</p>`+t.follow.map((f,i)=>qCard(f,t,'F'+(i+1))).join('');
  main.innerHTML=`<div style="--c:${t.color}"><h1>${t.icon} ${esc(t.name)}</h1><p class="lead">${esc(t.blurb)}</p>
  <div class="tabs" role="tablist">${tabs.map(([k,l,n])=>`<button class="tab ${k===tab?'on':''}" data-tab="${k}">${l}<span>${n}</span></button>`).join('')}</div>${body}</div>`;
  $$('.tab').forEach(b=>b.onclick=()=>{location.hash=`#/t/${slug}/${b.dataset.tab}`});
  if(tab==='q'){
    let lv='All';const list=$('#list');
    const draw=()=>{const q=$('#flt').value.toLowerCase().trim();const items=t.qa.filter(x=>(lv==='All'||x.lvl===lv)&&(!q||(x.q+' '+x.a).toLowerCase().includes(q)));
      list.innerHTML=items.length?items.map((x,i)=>qCard(x,t,t.qa.indexOf(x)+1)).join(''):'<div class="empty">No questions match. Try another word or level.</div>'};
    $('#flt').oninput=draw;$$('#lvls .chip').forEach(c=>c.onclick=()=>{lv=c.dataset.l;$$('#lvls .chip').forEach(x=>x.classList.toggle('on',x===c));draw()});draw();
  }
}
function savedPage(){
  const items=[...saved].map(i=>idx.get(i)).filter(Boolean);
  main.innerHTML=`<h1>🔖 Saved questions</h1><p class="lead">Questions you starred for last-minute revision. Stored only in this browser.</p>`+(items.length?items.map(x=>qCard(x,x.t,x.id)).join(''):'<div class="empty">Nothing saved yet. Open any question and tap ☆ Save.</div>');
}
function prep(){
  const p=D.prep;
  main.innerHTML=`<h1>💼 Career &amp; salary prep</h1><p class="lead">Goal: move from 2.88 LPA to 6+ LPA. The numbers below are targets, not promises. They depend on your projects, company and market.</p>
  <div class="card"><h3>${esc(p.intro.title)}</h3><p>${esc(p.intro.text)}</p></div>
  <h2>Skills that justify 6+ LPA</h2><div class="card"><ul>${p.tips.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>
  <h2>Tell a project story (STAR)</h2><div class="card"><ul>${p.star.map(s=>`<li><b>${s[0]}:</b> ${esc(s[1])}</li>`).join('')}</ul></div>
  <h2>HR round answers</h2>${p.hr.map(h=>`<details class="q" style="--c:#0f766e"><summary><span class="n">HR</span><span class="qt">${esc(h[0])}</span><span class="chev">›</span></summary><div class="body"><p>${esc(h[1])}</p></div></details>`).join('')}
  <h2>Salary negotiation</h2><div class="card"><ul>${p.neg.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>
  <h2>Questions to ask the interviewer</h2><div class="card"><ul>${p.ask.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>
  <h2>30-day plan</h2><div class="card"><ul>${p.plan.map(s=>`<li><b>${s[0]}:</b> ${esc(s[1])}</li>`).join('')}</ul></div>`;
}
let mockTimer=null;
function mock(){
  clearInterval(mockTimer);
  main.innerHTML=`<div class="mock"><h1>🎤 Mock interview</h1><p class="lead" style="margin-inline:auto">Read the question, answer out loud, then reveal the answer and compare.</p>
  <div class="tools" style="justify-content:center"><select id="mt" aria-label="Topic"><option value="">All topics</option>${D.topics.map(t=>`<option value="${t.slug}">${t.icon} ${esc(t.name)}</option>`).join('')}</select><select id="ml" aria-label="Level"><option value="">All levels</option><option>Junior</option><option>Mid</option></select></div>
  <div class="card" id="mc"></div></div>`;
  const next=()=>{
    const s=$('#mt').value,l=$('#ml').value;const pool=all.filter(x=>(!s||x.t.slug===s)&&(!l||x.lvl===l));
    if(!pool.length){$('#mc').innerHTML='<div class="empty">No questions for that filter.</div>';return}
    const x=pool[Math.floor(Math.random()*pool.length)];let sec=0;clearInterval(mockTimer);
    $('#mc').innerHTML=`<div class="timer" id="tm">0:00</div><div class="big">${esc(x.q)}</div><p><button class="btn pri" id="rv">Reveal answer</button> <button class="btn" id="nx">Next question</button></p><div id="ans" style="text-align:left"></div>`;
    mockTimer=setInterval(()=>{sec++;const e=$('#tm');if(!e){clearInterval(mockTimer);return}e.textContent=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')},1000);
    $('#nx').onclick=next;
    $('#rv').onclick=()=>{clearInterval(mockTimer);$('#ans').innerHTML=`<hr style="border:0;border-top:1px solid var(--line);margin:14px 0"><ol class="steps" style="--c:${x.t.color}">${steps(x.a).map(s=>`<li>${rich(s)}</li>`).join('')}</ol>${fuHtml(follows(x.t,x),'Now the interviewer asks:')}<p><button class="mini" id="ok">✓ I knew this</button></p>`;$('#ok').onclick=()=>{done.add(x.id);persist();toast('Marked as learned')}};
  };
  $('#mt').onchange=next;$('#ml').onchange=next;next();
}
function route(){
  const r=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
  clearInterval(mockTimer);
  if(!r[0])home();else if(r[0]==='t')topic(r[1],r[2]);else if(r[0]==='saved')savedPage();else if(r[0]==='prep')prep();else if(r[0]==='mock')mock();else home();
  renderSide(r);document.body.classList.remove('nav');$('#menuBtn').setAttribute('aria-expanded','false');
  window.scrollTo(0,0);openPending();
}
main.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');
  if(b){e.preventDefault();const card=b.closest('.q'),id=+card.dataset.id;
    if(b.dataset.act==='done'){done.has(id)?done.delete(id):done.add(id);card.classList.toggle('done',done.has(id));b.classList.toggle('on',done.has(id));b.textContent=done.has(id)?'✓ Learned':'Mark as learned'}
    else{saved.has(id)?saved.delete(id):saved.add(id);b.classList.toggle('on',saved.has(id));b.textContent=saved.has(id)?'★ Saved':'☆ Save'}
    persist();renderSide(location.hash.replace(/^#\/?/,'').split('/').filter(Boolean));return}
  const c=e.target.closest('[data-copy]');
  if(c){const v=c.dataset.copy;(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(()=>toast('Copied'),()=>toast('Copy not available'))}
});
// menu
$('#menuBtn').onclick=()=>{const o=document.body.classList.toggle('nav');$('#menuBtn').setAttribute('aria-expanded',o)};
$('#scrim').onclick=()=>document.body.classList.remove('nav');
// theme
const setTheme=t=>{document.documentElement.dataset.theme=t;store.set('theme',t);const m=$('meta[name=theme-color]');if(m)m.content=t==='dark'?'#0e1716':'#0f766e'};
setTheme(store.get('theme',matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
$('#themeBtn').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
// search
const sm=$('#searchModal'),si=$('#searchInput'),sr=$('#searchResults');
const openS=()=>{sm.hidden=false;si.value='';sr.innerHTML='';si.focus()},closeS=()=>sm.hidden=true;
$('#searchBtn').onclick=openS;sm.addEventListener('click',e=>{if(e.target===sm)closeS()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeS();if(e.key==='/'&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();openS()}});
si.oninput=()=>{const w=si.value.toLowerCase().split(/\s+/).filter(Boolean);if(!w.length){sr.innerHTML='';return}
  const hit=all.filter(x=>{const s=(x.q+' '+x.a+' '+x.t.name).toLowerCase();return w.every(k=>s.includes(k))}).slice(0,30);
  sr.innerHTML=hit.length?hit.map(x=>`<a class="sr" href="#/t/${x.t.slug}/q" data-q="${x.id}" data-s="${x.t.slug}">${x.t.icon} ${esc(x.q.slice(0,150))}${x.q.length>150?'…':''}<br><small>${esc(x.t.name)} · ${lvlLabel[x.lvl]}</small></a>`).join(''):'<div class="empty">No results.</div>'};
let pendingOpen=null;
function openPending(){if(!pendingOpen)return;const c=$(`.q[data-id="${pendingOpen}"]`);pendingOpen=null;if(c){c.open=true;c.scrollIntoView({block:'center'})}}
sr.addEventListener('click',e=>{const a=e.target.closest('[data-q]');if(!a)return;e.preventDefault();closeS();pendingOpen=a.dataset.q;
  const to=a.getAttribute('href');tabState[a.dataset.s]='q';
  if(location.hash===to){route()}else{location.hash=to}});
window.addEventListener('hashchange',route);route();
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
