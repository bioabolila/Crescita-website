
const modelStages=[
{name:'Signal',kicker:'Start here',title:'What is the business actually telling us?',copy:'Before changing channels, campaigns or tactics, we look at the signals in the business and understand what has actually changed.'},
{name:'Diagnosis',kicker:'Understand',title:'Find the constraint behind the symptom.',copy:'We connect customer behaviour, commercial data and market context to identify what is actually holding growth back.'},
{name:'Decision',kicker:'Prioritize',title:'Decide what matters most right now.',copy:'Not every opportunity deserves attention. We prioritize based on potential impact, effort and the constraint we’re trying to change.'},
{name:'The Gap',kicker:'Recognize',title:'A step isn’t always enough.',copy:'Sometimes incremental optimization won’t change the trajectory. That’s where a deliberate leap becomes necessary.'},
{name:'Experiment',kicker:'Move',title:'Turn the decision into a test.',copy:'We turn the strategic decision into a focused experiment with a clear hypothesis and measurable outcome.'},
{name:'Momentum',kicker:'Compound',title:'Turn learning into momentum.',copy:'Results become new information. We measure the shift, learn from it, and use that learning to determine the next move.'}
];
const stageButtons=[...document.querySelectorAll('.stage')],stagePanel=document.querySelector('#stage-panel');function selectStage(index,focus=false){const item=modelStages[index];stagePanel.classList.remove('is-updating');void stagePanel.offsetWidth;stagePanel.classList.add('is-updating');stageButtons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1});if(focus)stageButtons[index].focus();stagePanel.setAttribute('aria-labelledby',stageButtons[index].id);stagePanel.dataset.number=String(index+1).padStart(2,'0');stagePanel.classList.toggle('is-gap',index===3);document.querySelector('#stage-kicker').textContent=item.kicker;document.querySelector('#stage-title').textContent=item.title;document.querySelector('#stage-copy').textContent=item.copy;document.querySelectorAll('.stage-progress i').forEach((e,i)=>e.classList.toggle('active',i===index))}stageButtons.forEach((b,i)=>{b.addEventListener('click',()=>selectStage(i));b.addEventListener('keydown',e=>{if(['ArrowDown','ArrowRight'].includes(e.key)){e.preventDefault();selectStage((i+1)%stageButtons.length,true)}if(['ArrowUp','ArrowLeft'].includes(e.key)){e.preventDefault();selectStage((i+stageButtons.length-1)%stageButtons.length,true)}})});if(stagePanel)selectStage(0);
const aboutContent=[
{kicker:'How we see growth',title:'Challenge the assumption.',copy:'Companies don’t always need more ideas. Sometimes they need someone willing to challenge the ideas they already have.'},
{kicker:'How we think',title:'Understand deeply. Prioritize clearly. Communicate meaningfully.',copy:'Discover the business and its signals. Define what is holding growth back. Design a focused strategy, deliver the next move, and develop what works.'},
{kicker:'How we work together',title:'A senior growth team, alongside yours.',copy:'We work alongside your team, taking responsibility for understanding the problem and helping determine the next move.'},
{kicker:'The people',title:'Mohamed Abolila',copy:'Founder & Growth Strategist. Experience across P&G and YC-backed Camlist informs how Crescita works.'}
];const aboutButtons=[...document.querySelectorAll('.about-tab')];function selectAbout(index,focus=false){const data=aboutContent[index];aboutButtons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1});if(focus)aboutButtons[index].focus();document.querySelector('#about-panel').setAttribute('aria-labelledby',aboutButtons[index].id||'about-tab-'+index);aboutButtons[index].id='about-tab-'+index;document.querySelector('#about-kicker').textContent=data.kicker;document.querySelector('#about-title').textContent=data.title;document.querySelector('#about-copy').textContent=data.copy}aboutButtons.forEach((b,i)=>{b.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')selectAbout(i)});b.addEventListener('focus',()=>selectAbout(i));b.addEventListener('click',()=>selectAbout(i));b.addEventListener('keydown',e=>{if(['ArrowDown','ArrowRight'].includes(e.key)){e.preventDefault();selectAbout((i+1)%aboutButtons.length,true)}if(['ArrowUp','ArrowLeft'].includes(e.key)){e.preventDefault();selectAbout((i+aboutButtons.length-1)%aboutButtons.length,true)}})});if(aboutButtons.length)selectAbout(0);
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav-panel');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');nav.classList.toggle('open',open)});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation menu');nav.classList.remove('open')}));
const reducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(document.body.classList.contains('home'))document.documentElement.classList.add('home-deck-scroll');
const revealSections=[...document.querySelectorAll('.reveal')];
function cueSectionInteraction(section){
 if(reducedMotion)return;
 const activeControl=section.querySelector('.method-item.is-active, .where-item.is-open, #stage-panel, #about-panel');
 if(!activeControl)return;
 activeControl.classList.remove('is-scroll-arriving');
 void activeControl.offsetWidth;
 activeControl.classList.add('is-scroll-arriving');
 window.setTimeout(()=>activeControl.classList.remove('is-scroll-arriving'),850);
}
if(reducedMotion||!('IntersectionObserver'in window)){
 revealSections.forEach(section=>section.classList.add('visible'));
}else{
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){
   entry.target.classList.add('visible');
   cueSectionInteraction(entry.target);
   revealObserver.unobserve(entry.target);
  }
 }),{threshold:.12,rootMargin:'0px 0px -8% 0px'});
 revealSections.forEach(section=>revealObserver.observe(section));
}

const pathCopy={step:[
{tag:'01 / READ',title:'Read the signal.',copy:'The constraint determines the next move.'},
{tag:'02 / CHOOSE',title:'Choose the move.',copy:'Read the signal / choose the move / measure the shift.'},
{tag:'03 / MEASURE',title:'Measure the shift.',copy:'Growth is not always about doing more. Sometimes the next move is a step.'}],
leap:[
{tag:'01 / READ',title:'Read the signal.',copy:'Growth is not always about doing more. Sometimes the next move is a leap.'},
{tag:'02 / THE GAP',title:'The Gap.',copy:'The difficult part is knowing which one to make.'},
{tag:'03 / LEAP',title:'Make the leap deliberate.',copy:'When another step won’t change the trajectory, make the leap deliberate.'}]};
const pathTabs=[...document.querySelectorAll('.path-tab')];
const trajectory=document.querySelector('.thesis-panel');
const sequencePoints=[...document.querySelectorAll('.sequence-step')];
const trajectoryReadout=document.querySelector('.trajectory-readout');
let activePath='step';
let activePoint=0;
let readoutMotionTimer=0;

function selectPathPoint(index,focus=false){
 if(!trajectory||!pathCopy[activePath][index])return;
 const changed=index!==activePoint;
 activePoint=index;
 const data=pathCopy[activePath][index];
 document.querySelector('#trajectory-stage').textContent=data.tag;
 document.querySelector('#trajectory-title').textContent=data.title;
 document.querySelector('#trajectory-copy').textContent=data.copy;
 document.querySelector('#path-status').textContent=(activePath==='step'?'STEP':'LEAP')+' / 0'+(index+1);
 sequencePoints.forEach((point,i)=>point.setAttribute('aria-pressed',String(i===index)));
 if(changed&&trajectoryReadout&&!reducedMotion){
  trajectoryReadout.classList.remove('is-updating');
  void trajectoryReadout.offsetWidth;
  trajectoryReadout.classList.add('is-updating');
  clearTimeout(readoutMotionTimer);
  readoutMotionTimer=window.setTimeout(()=>trajectoryReadout.classList.remove('is-updating'),520);
 }
 if(focus)sequencePoints[index].focus();
}

function selectPath(path,focus=false){
 if(!trajectory)return;
 const pathChanged=path!==activePath;
 if(pathChanged){
  activePath=path;
  activePoint=-1;
 }
 pathTabs.forEach(tab=>{
  const active=tab.dataset.path===path;
  tab.setAttribute('aria-selected',String(active));
  tab.tabIndex=active?0:-1;
  if(active&&focus)tab.focus();
 });
 trajectory.dataset.path=path;
 trajectory.setAttribute('aria-labelledby',path==='step'?'path-step':'path-leap');
 document.querySelector('#trajectory-kicker').textContent=path==='step'?'A measured progression':'When the step is not enough';
 sequencePoints.forEach(point=>{
  const index=Number(point.dataset.point);
  const label=path==='step'?['Read the signal','Choose the move','Measure the shift'][index]:['Read the signal','The Gap','Make the leap'][index];
  point.setAttribute('aria-label',label);
  point.querySelector('strong').textContent=path==='step'?['READ','CHOOSE','MEASURE'][index]:['READ','THE GAP','LEAP'][index];
 });
 selectPathPoint(pathChanged?0:Math.max(activePoint,0));
}

pathTabs.forEach((tab,index)=>{
 tab.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')selectPath(tab.dataset.path)});
 tab.addEventListener('focus',()=>selectPath(tab.dataset.path));
 tab.addEventListener('click',()=>selectPath(tab.dataset.path));
 tab.addEventListener('keydown',event=>{
  if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(event.key)){
   event.preventDefault();
   selectPath(pathTabs[1-index].dataset.path,true);
  }
 });
});

sequencePoints.forEach((point,index)=>{
 point.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')selectPathPoint(index)});
 point.addEventListener('focus',()=>selectPathPoint(index));
 point.addEventListener('click',()=>selectPathPoint(index));
 point.addEventListener('keydown',event=>{
  if(['ArrowRight','ArrowDown'].includes(event.key)){
   event.preventDefault();
   selectPathPoint((index+1)%sequencePoints.length,true);
  }
  if(['ArrowLeft','ArrowUp'].includes(event.key)){
   event.preventDefault();
   selectPathPoint((index+sequencePoints.length-1)%sequencePoints.length,true);
  }
 });
});
if(trajectory)selectPath('step');

const thesisSteps=document.querySelector('.step-sequence');
if(thesisSteps){
 if(reducedMotion||!('IntersectionObserver'in window)){
  thesisSteps.classList.add('has-entered');
 }else{
  thesisSteps.classList.add('motion-pending');
  const stepsObserver=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){
    thesisSteps.classList.add('is-visible');
    stepsObserver.disconnect();
   }
  },{threshold:.16,rootMargin:'0px 0px -8% 0px'});
  stepsObserver.observe(thesisSteps);
  const finalStep=sequencePoints[sequencePoints.length-1];
  finalStep?.addEventListener('animationend',event=>{
   if(event.animationName==='crescita-staircase-rise'){
    thesisSteps.classList.remove('is-visible','motion-pending');
    thesisSteps.classList.add('has-entered');
   }
  },{once:true});
 }
}

stageButtons.forEach((button,index)=>{
 button.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')selectStage(index)});
 button.addEventListener('focus',()=>selectStage(index));
});

const methodItems=[...document.querySelectorAll('[data-method-item]')];
const methodButtons=methodItems.map(item=>item.querySelector('.method-trigger'));
let activeMethodIndex=methodItems.findIndex(item=>item.classList.contains('is-active'));
let methodMotionTimer=0;

function selectMethod(index,focus=false){
 if(index<0||index>=methodItems.length)return;
 const changed=index!==activeMethodIndex;
 methodItems.forEach((item,i)=>{
  const active=i===index;
  item.classList.toggle('is-active',active);
  if(!active)item.classList.remove('is-entering');
  methodButtons[i].setAttribute('aria-expanded',String(active));
  item.querySelector('.method-detail').setAttribute('aria-hidden',String(!active));
 });
 activeMethodIndex=index;
 if(changed){
  clearTimeout(methodMotionTimer);
  const activeItem=methodItems[index];
  activeItem.classList.remove('is-entering');
  void activeItem.offsetWidth;
  activeItem.classList.add('is-entering');
  methodMotionTimer=window.setTimeout(()=>activeItem.classList.remove('is-entering'),850);
 }
 if(focus)methodButtons[index].focus();
}

methodItems.forEach((item,index)=>{
 const button=methodButtons[index];
 item.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')selectMethod(index)});
 button.addEventListener('focus',()=>selectMethod(index));
 button.addEventListener('click',()=>selectMethod(index));
 button.addEventListener('keydown',event=>{
  if(['ArrowDown','ArrowRight'].includes(event.key)){
   event.preventDefault();
   selectMethod((index+1)%methodButtons.length,true);
  }
  if(['ArrowUp','ArrowLeft'].includes(event.key)){
   event.preventDefault();
   selectMethod((index+methodButtons.length-1)%methodButtons.length,true);
  }
 });
});
if(methodButtons.length)selectMethod(activeMethodIndex>=0?activeMethodIndex:0);

const whereList=document.querySelector('.where-list');
const whereItems=[...document.querySelectorAll('[data-where-item]')];
const whereButtons=whereItems.map(item=>item.querySelector('.where-row'));
function selectWhere(index){
 whereItems.forEach((item,i)=>{
  const active=i===index;
  item.classList.toggle('is-open',active);
  whereButtons[i].setAttribute('aria-expanded',String(active));
  item.querySelector('.where-detail').setAttribute('aria-hidden',String(!active));
 });
}
whereItems.forEach((item,index)=>{
 const button=whereButtons[index];
 item.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')selectWhere(index)});
 button.addEventListener('focus',()=>selectWhere(index));
 button.addEventListener('click',()=>selectWhere(index));
 button.addEventListener('keydown',event=>{
  if(['ArrowDown','ArrowRight'].includes(event.key)){
   event.preventDefault();
   whereButtons[(index+1)%whereButtons.length].focus();
  }
  if(['ArrowUp','ArrowLeft'].includes(event.key)){
   event.preventDefault();
   whereButtons[(index+whereButtons.length-1)%whereButtons.length].focus();
  }
 });
});
if(whereList){
 whereList.addEventListener('pointerleave',event=>{
  if(event.pointerType!=='touch'&&!whereList.matches(':focus-within'))selectWhere(-1);
 });
 whereList.addEventListener('focusout',event=>{
  if(!whereList.contains(event.relatedTarget))window.setTimeout(()=>{
   if(!whereList.matches(':focus-within'))selectWhere(-1);
  },0);
 });
}

const deckProgressFill=document.querySelector('#deck-scroll-fill');
if(deckProgressFill){
 let deckScrollFrame=0;
 const drawDeckProgress=()=>{
  deckScrollFrame=0;
  const available=document.documentElement.scrollHeight-window.innerHeight;
  const progress=available>0?Math.min(1,Math.max(0,window.scrollY/available)):0;
  deckProgressFill.style.transform='scaleX('+progress+')';
 };
 const queueDeckProgress=()=>{if(deckScrollFrame)return;deckScrollFrame=window.requestAnimationFrame(drawDeckProgress)};
 window.addEventListener('scroll',queueDeckProgress,{passive:true});
 window.addEventListener('resize',queueDeckProgress);
 drawDeckProgress();
}

// Keep navigation transitions brief, and leave reduced-motion preferences in control.
const transitionKey='crescita:page-enter';
if(!reducedMotion){
 document.body.classList.add('page-transition-ready');
 const transitionNameMarker='::crescita-page-enter::';
 let enterAfterNavigation=false;
 if(window.location.protocol==='file:'&&window.name.endsWith(transitionNameMarker)){
  window.name=window.name.slice(0,-transitionNameMarker.length);
  enterAfterNavigation=true;
 }
 try{
  enterAfterNavigation=enterAfterNavigation||sessionStorage.getItem(transitionKey)==='1';
  sessionStorage.removeItem(transitionKey);
 }catch(error){}
 if(enterAfterNavigation){
  document.body.classList.add('page-entering');
  window.setTimeout(()=>document.body.classList.remove('page-entering'),540);
 }
 let navigationStarted=false;
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');
  if(!link||navigationStarted||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.hasAttribute('download')||link.relList.contains('external'))return;
  if(link.target&&link.target.toLowerCase()!=='_self')return;
  let destination;
  try{destination=new URL(link.href,window.location.href)}catch(error){return}
  if(destination.protocol!==window.location.protocol||destination.origin!==window.location.origin)return;
  if(destination.pathname===window.location.pathname&&destination.search===window.location.search)return;
  event.preventDefault();
  navigationStarted=true;
  try{sessionStorage.setItem(transitionKey,'1')}catch(error){}
  if(destination.protocol==='file:')window.name+=transitionNameMarker;
  document.body.classList.add('page-leaving');
  window.setTimeout(()=>window.location.assign(destination.href),360);
 },true);
}
