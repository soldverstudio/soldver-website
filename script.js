const menu=document.querySelector('#menu'),nav=document.querySelector('#nav');
function toggle(open){
nav.hidden=!open;
menu.setAttribute('aria-expanded',String(open));
menu.textContent=open?'×':'☰';
document.body.style.overflow=open?'hidden':''
}
menu.onclick=()=>toggle(nav.hidden);
nav.querySelectorAll('a').forEach(a=>a.onclick=()=>toggle(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape')toggle(false)});

const viewer=document.querySelector('#viewer');
document.querySelectorAll('.work').forEach(b=>b.onclick=()=>{
const im=b.querySelector('img');
viewer.querySelector('img').src=im.src;
viewer.querySelector('img').alt=im.alt;
viewer.showModal()
});
viewer.querySelector('button').onclick=()=>viewer.close();

try{
if(!sessionStorage.getItem('svIntro')){
sessionStorage.setItem('svIntro','1');
document.querySelector('#splash').classList.add('play')
}
}catch(e){}

if('IntersectionObserver'in window){
const obs=new IntersectionObserver(es=>es.forEach(e=>{
if(e.isIntersecting){
e.target.classList.add('reveal');
obs.unobserve(e.target)
}
}));
document.querySelectorAll('figure').forEach(f=>obs.observe(f))
}

;(()=>{
const nodes=[...document.querySelectorAll('[data-ru]')];
nodes.forEach(n=>{if(!n.dataset.en)n.dataset.en=n.textContent});
function setLang(lang){
const ru=lang==='ru';
document.documentElement.lang=lang;
nodes.forEach(n=>n.textContent=ru?n.dataset.ru:n.dataset.en);
document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
menu.setAttribute('aria-label',ru?'Меню':'Menu');
viewer.querySelector('button').setAttribute('aria-label',ru?'Закрыть':'Close');
document.querySelectorAll('.work').forEach((b,i)=>b.setAttribute('aria-label',(ru?'Открыть работу ':'View artwork ')+String(i+1).padStart(2,'0')));
try{localStorage.setItem('svLang',lang)}catch(e){}
}
let lang=location.pathname.startsWith('/ru')?'ru':'en';
document.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{
const target=b.dataset.lang==='ru'?'/ru/':'/';
if(b.dataset.lang!==lang)location.href=target+location.hash
});
setLang(lang)
})();

;(()=>{
const form=document.querySelector('#contactform'),button=form.querySelector('button'),status=document.querySelector('#contactstatus');
let state='';
const messages={
sending:['Sending…','Отправка…'],
success:['Your message has been sent.','Ваше сообщение отправлено.'],
error:['Unable to send. Please try again or contact us by email.','Не удалось отправить сообщение. Попробуйте ещё раз или напишите на почту.']
};
function render(){
status.textContent=state?messages[state][document.documentElement.lang==='ru'?1:0]:''
}
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',render));
form.addEventListener('submit',async e=>{
e.preventDefault();
if(button.disabled)return;
button.disabled=true;
state='sending';
render();
try{
const response=await fetch(form.action,{
method:'POST',
body:new FormData(form),
headers:{Accept:'application/json'}
});
if(!response.ok)throw new Error('Submission failed');
form.reset();
state='success';
window.svTrack?.('contact_success')
}catch(e){
state='error'
}finally{
button.disabled=false;
render()
}
})
})();

;(()=>{
const ru=location.pathname.startsWith('/ru'),
t=(en,r)=>ru?r:en,
key='svAnalyticsConsent';

let allowed=false,loaded=false;

function read(){
try{return localStorage.getItem(key)}catch{return null}
}

function save(v){
try{localStorage.setItem(key,v)}catch{}
}

function start(){
allowed=true;
if(loaded)return;
loaded=true;
window.dataLayer=window.dataLayer||[];
window.gtag=function(){window.dataLayer.push(arguments)};
gtag('js',new Date());
gtag('config','G-0MZ6MVMEMS',{
send_page_view:false,
allow_google_signals:false,
allow_ad_personalization_signals:false,
page_location:location.origin+location.pathname,
page_referrer:''
});
gtag('event','page_view',{
page_location:location.origin+location.pathname,
page_referrer:''
});
const tag=document.createElement('script');
tag.async=true;
tag.src='https://www.googletagmanager.com/gtag/js?id=G-0MZ6MVMEMS';
document.head.append(tag)
}

window.svTrack=(name,params={})=>{
if(allowed&&window.gtag)gtag('event',name,params)
};

const panel=document.createElement('aside');
panel.setAttribute('aria-label',t('Analytics preferences','Настройки аналитики'));
panel.style.cssText='position:fixed;bottom:16px;left:16px;right:16px;max-width:520px;margin:auto;z-index:1000;background:#111;color:#ddd;border:1px solid #666;padding:18px;font:14px/1.5 Arial,sans-serif;box-shadow:0 4px 30px #000';

const info=document.createElement('p');
info.textContent=t(
'Optional analytics: Google Analytics uses cookies to measure visits and interactions. You can decline or change your choice at any time.',
'Необязательная аналитика: Google Analytics использует cookies для статистики посещений и взаимодействий. Можно отказаться или изменить выбор в любое время.'
);
panel.append(info);

const link=document.createElement('a');
link.href='https://policies.google.com/privacy';
link.textContent=t('Google privacy policy','Политика конфиденциальности Google');
link.style.cssText='display:block;color:#ccc;text-decoration:underline;margin:8px 0';
panel.append(link);

function choice(v){
save(v);
panel.hidden=true;
if(v==='yes'){
start()
}else if(loaded){
allowed=false;
window['ga-disable-G-0MZ6MVMEMS']=true;
document.cookie.split(';').forEach(c=>{
const n=c.split('=')[0].trim();
if(/^_ga($|_)/.test(n)){
for(const d of ['', ';domain='+location.hostname,';domain=.'+location.hostname])
document.cookie=n+'=;Max-Age=0;path=/'+d
}
});
location.reload()
}
}

for(const [v,label] of [
['yes',t('Accept analytics','Разрешить аналитику')],
['no',t('Decline','Отказаться')]
]){
const b=document.createElement('button');
b.type='button';
b.textContent=label;
b.style.cssText='background:#171717;color:#eee;border:1px solid #888;padding:10px;margin:4px;cursor:pointer';
b.onclick=()=>choice(v);
panel.append(b)
}

document.body.append(panel);

const settings=document.createElement('button');
settings.type='button';
settings.textContent=t('Cookie settings','Настройки cookies');
settings.style.cssText='background:none;color:inherit;border:0;text-decoration:underline;cursor:pointer;font:inherit';
settings.onclick=()=>{panel.hidden=false};
document.querySelector('footer').append(settings);

const pref=read();
panel.hidden=pref==='yes'||pref==='no';
if(pref==='yes')start();

document.querySelectorAll('.work').forEach((b,i)=>b.addEventListener('click',()=>svTrack('artwork_open',{
artwork_id:'NV-'+String(i+1).padStart(2,'0')
})));

document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{
if(b.dataset.lang!==(ru?'ru':'en'))
svTrack('language_switch',{target_language:b.dataset.lang})
},{capture:true}));

})();

;(()=>{
const ru=location.pathname.startsWith('/ru');
const footer=document.querySelector('footer');
if(!footer)return;

const privacy=document.createElement('a');
privacy.href=ru?'/privacy/?lang=ru':'/privacy/';
privacy.textContent=ru
?'Политика конфиденциальности'
:'Privacy Policy';

privacy.style.cssText=
'display:inline-block;color:inherit;font-size:11px;margin:10px 0;';

footer.appendChild(privacy);
})();
;(()=>{
const footer=document.querySelector('footer');
if(!footer)return;
if(document.getElementById('sv-instagram'))return;

const ru=location.pathname.startsWith('/ru');

const social=document.createElement('div');
social.id='sv-instagram';
social.style.cssText='margin:18px 0;';

const link=document.createElement('a');

link.href='https://www.instagram.com/soldver.official/';
link.target='_blank';
link.rel='noopener noreferrer';
link.textContent='INSTAGRAM* ↗';

link.style.cssText=`
display:inline-block;
color:inherit;
font-size:11px;
letter-spacing:2px;
text-decoration:none;
opacity:0.8;
transition:opacity 0.3s ease;
`;

link.addEventListener('mouseenter',()=>{
link.style.opacity='1';
});

link.addEventListener('mouseleave',()=>{
link.style.opacity='0.8';
});

const note=document.createElement('p');

note.style.cssText=`
font-size:9px;
opacity:0.45;
line-height:1.5;
margin-top:8px;
`;

note.textContent=ru
?'*Instagram принадлежит Meta, деятельность которой признана экстремистской и запрещена в РФ.'
:'*Instagram is owned by Meta, whose activities are designated extremist and prohibited in Russia.';

social.appendChild(link);
social.appendChild(note);
footer.appendChild(social);
})();
