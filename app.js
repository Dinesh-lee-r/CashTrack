(()=>{'use strict';
const $=id=>document.getElementById(id), today=()=>{let d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}, dateObj=s=>{let [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}, iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`, minor=n=>Math.round(Number(n)*100);
const built=['Food & Dining','Groceries','Transportation','Fuel','Shopping','Bills & Utilities','Rent & Housing','Health & Medical','Entertainment','Education','Travel','Personal Care','Subscriptions','Investments','Transfers','Other'];
const icons={'Food & Dining':'🍜','Groceries':'🛒','Transportation':'🛵','Fuel':'⛽','Shopping':'🛍️','Bills & Utilities':'💡','Rent & Housing':'🏠','Health & Medical':'🩺','Entertainment':'🎬','Education':'📚','Travel':'✈️','Personal Care':'🧴','Subscriptions':'🔁','Investments':'📈','Transfers':'↔️','Other':'✦'};
const rules={'Food & Dining':'swiggy,zomato,restaurant,pizza,burger,cafe,coffee,food,domino,kfc,mcdonald,bakery,dining','Groceries':'bigbasket,supermarket,grocery,vegetable,milk,blinkit,zepto,dmart,kirana','Transportation':'rapido,uber,ola,bmtc,bus,metro,auto,cab,taxi,train','Fuel':'petrol,diesel,fuel,petrol bunk,gas station,indian oil','Shopping':'amazon,flipkart,shopping,mall,myntra,meesho,ajio,clothes,electronics','Bills & Utilities':'bescom,electricity,water bill,mobile recharge,recharge,broadband,wifi,internet bill,gas bill','Rent & Housing':'rent,landlord,maintenance,hostel fee','Health & Medical':'pharmacy,hospital,medical,doctor,clinic,medicine,apollo,diagnostic','Entertainment':'movie,cinema,pvr,inox,concert,game,gaming,bookmyshow','Education':'course,tuition,college fee,udemy,coursera,books,exam fee','Travel':'flight,hotel booking,makemytrip,irctc,airbnb,trip,visa','Personal Care':'salon,haircut,spa,grooming,cosmetic,skin care','Subscriptions':'netflix,spotify,youtube premium,prime video,subscription,hotstar,icloud','Investments':'mutual fund,sip,stocks,shares,zerodha,groww,investment,nps,ppf','Transfers':'transfer,sent to,bank transfer,imps,neft,upi transfer'};
const palettes=[['Emerald Night','#a3f26b','#0c1217','#131c23'],['Spotify','#1ed760','#101010','#181818'],['Midnight Black','#d7d7d7','#090909','#171717'],['White & Red','#f04452','#f6f7f9','#ffffff'],['Royal Purple','#b99aff','#151020','#21182f'],['Ocean Blue','#5bc0ff','#0b1623','#122337'],['Sunset Orange','#ffad69','#1d1210','#2b1c18'],['Rose Gold','#f1a6bc','#1b1118','#2a1b24'],['Cyber Cyan','#00e5ff','#081519','#102329'],['Orange & Black','#ff9d00','#0c0c0c','#181818'],['Forest Green','#7bdba5','#0e1c17','#172a22'],['Lavender Light','#805ad5','#f5f2ff','#ffffff'],['Saffron','#ffbf47','#1b1608','#29210e'],['Ocean Light','#147dba','#eff8fc','#ffffff'],['Cherry','#ff3158','#1b0c13','#2a111c'],['Monochrome','#b7c0c8','#101317','#1b2026']];
let state={tx:[],settings:{theme:0,mode:'dark',currency:'INR',weekStart:1,custom:[],prefs:{},budgets:{overall:0,categories:{}}},period:'month',sp:'month',sd:today(),page:'home',install:null,selected:new Set()};
const dbp=new Promise((res,rej)=>{let r=indexedDB.open('cashtrack-dynex',1);r.onupgradeneeded=()=>{r.result.createObjectStore('tx',{keyPath:'id'});r.result.createObjectStore('prefs',{keyPath:'key'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
async function req(table,method,key,val){let db=await dbp;return new Promise((res,rej)=>{let t=db.transaction(table,'readwrite'),s=t.objectStore(table),r=method==='getAll'?s.getAll():method==='put'?s.put(val):method==='delete'?s.delete(key):s.clear();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
const savePrefs=()=>req('prefs','put',null,{key:'settings',value:state.settings});
const cats=()=>[...built,...state.settings.custom.filter(x=>!built.includes(x))];
const fmt=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:state.settings.currency||'INR',minimumFractionDigits:2,maximumFractionDigits:2}).format((n||0)/100);
const compact=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:state.settings.currency||'INR',notation:'compact',maximumFractionDigits:1}).format((n||0)/100);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast=s=>{let t=$('toast');t.textContent=s;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2300)};
function suggest(s,type='expense'){s=(s||'').toLowerCase().trim();if(state.settings.prefs[s])return state.settings.prefs[s];if(type==='income')return 'Other';for(let c of Object.keys(rules))if(rules[c].split(',').some(w=>s.includes(w)))return c;return 'Other'}
function eligible(t){return t.type==='expense'&&t.category!=='Transfers'&&t.category!=='Investments'}
function bounds(p,d=dateObj(today())){d=new Date(d.getFullYear(),d.getMonth(),d.getDate());if(p==='day')return[d,new Date(+d+86400000)];if(p==='week'){let shift=(d.getDay()-Number(state.settings.weekStart)+7)%7,s=new Date(+d-shift*86400000);return[s,new Date(+s+7*86400000)]}if(p==='month')return[new Date(d.getFullYear(),d.getMonth(),1),new Date(d.getFullYear(),d.getMonth()+1,1)];return[new Date(d.getFullYear(),0,1),new Date(d.getFullYear()+1,0,1)]}
function within(t,b){let d=dateObj(t.date);return d>=b[0]&&d<b[1]}
function expenses(b){return state.tx.filter(t=>eligible(t)&&within(t,b))}
function sum(a){return a.reduce((n,t)=>n+t.amount,0)}
function previous(p,d){let x=new Date(d);if(p==='day')x.setDate(x.getDate()-1);if(p==='week')x.setDate(x.getDate()-7);if(p==='month')x.setMonth(x.getMonth()-1);if(p==='year')x.setFullYear(x.getFullYear()-1);return bounds(p,x)}
function title(p,d){if(p==='day')return d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});if(p==='month')return d.toLocaleDateString('en-IN',{month:'long',year:'numeric'});if(p==='year')return String(d.getFullYear());let b=bounds('week',d),e=new Date(+b[1]-86400000);return b[0].toLocaleDateString('en-IN',{day:'numeric',month:'short'})+' – '+e.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
function draw(canvas,values,labels){let ctx=canvas.getContext('2d'),w=Math.max(260,canvas.clientWidth),h=canvas.height,ratio=devicePixelRatio||1;canvas.width=w*ratio;canvas.height=h*ratio;ctx.scale(ratio,ratio);let css=getComputedStyle(document.body),accent=css.getPropertyValue('--accent'),muted=css.getPropertyValue('--muted'),line=css.getPropertyValue('--line'),pad={l:8,r:8,t:15,b:25},cw=w-16,ch=h-40,max=Math.max(1,...values),step=cw/Math.max(1,values.length),bar=Math.min(25,step*.55);ctx.clearRect(0,0,w,h);for(let i=0;i<4;i++){let y=pad.t+ch*i/3;ctx.strokeStyle=line;ctx.beginPath();ctx.moveTo(8,y);ctx.lineTo(w-8,y);ctx.stroke()}values.forEach((v,i)=>{let bh=ch*v/max,x=pad.l+i*step+(step-bar)/2,y=pad.t+ch-bh;ctx.fillStyle=accent;ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,bar,Math.max(2,bh),4):ctx.rect(x,y,bar,Math.max(2,bh));ctx.fill();if(values.length<=12||i%Math.ceil(values.length/8)===0||i===values.length-1){ctx.fillStyle=muted;ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(labels[i],x+bar/2,h-7)}})}
function chartData(p,d){let b=bounds(p,d),ts=expenses(b),v=[],l=[];if(p==='day'){for(let h=0;h<24;h++){v.push(sum(ts.filter(t=>+(t.time||'00:00').slice(0,2)===h)));l.push(h%3===0?String(h).padStart(2,'0'):'')}}else if(p==='week'){for(let i=0;i<7;i++){let x=new Date(+b[0]+i*86400000);v.push(sum(ts.filter(t=>t.date===iso(x))));l.push(x.toLocaleDateString('en-IN',{weekday:'short'}))}}else if(p==='month'){let n=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();for(let i=1;i<=n;i++){let x=new Date(d.getFullYear(),d.getMonth(),i);v.push(sum(ts.filter(t=>t.date===iso(x))));l.push(i%5===1||i===n?String(i):'')}}else for(let m=0;m<12;m++){v.push(sum(ts.filter(t=>+t.date.slice(5,7)===m+1)));l.push(new Date(d.getFullYear(),m,1).toLocaleDateString('en-IN',{month:'short'}))}return{v,l,ts,b}}
function breakdown(el,ts){let m={};ts.forEach(t=>m[t.category]=(m[t.category]||0)+t.amount);let entries=Object.entries(m).sort((a,b)=>b[1]-a[1]),total=sum(ts);el.innerHTML=entries.length?entries.map(([c,n])=>`<div class="catrow" data-cat="${esc(c)}"><span class="catIcon">${icons[c]||'✦'}</span><div>${esc(c)}<div class="track"><span style="width:${Math.max(2,n/Math.max(1,total)*100)}%"></span></div></div><div class="catval">${fmt(n)}<small>${Math.round(n/Math.max(1,total)*100)}%</small></div></div>`).join(''):'<div class="empty">No expense records for this period yet.</div>'}
function txHTML(t){return `<article class="tx"><span class="txIcon">${icons[t.category]||'✦'}</span><div class="txMain"><b>${esc(t.description||t.category)}</b><small>${esc(t.category)} · ${esc(t.date)} · ${esc(t.payment)}</small></div><div class="txRight">${t.type==='income'?'+':t.type==='transfer'?'↔ ':'−'}${fmt(t.amount)}</div><div class="txActions"><button data-edit="${esc(t.id)}">Edit</button><button data-del="${esc(t.id)}">×</button></div></article>`}
function renderHome(){let d=new Date(),ts=state.tx,sets=[['day','todayTotal'],['week','weekTotal'],['month','monthTotal'],['year','yearTotal']];$('today').textContent=d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}).toUpperCase();$('greeting').textContent='Good '+(d.getHours()<12?'morning':d.getHours()<17?'afternoon':'evening')+'.';sets.forEach(([p,id])=>$(id).textContent=compact(sum(expenses(bounds(p,d)))));let b=bounds(state.period,d),a=expenses(b);$('periodLabel').textContent='TOTAL SPENT '+({day:'TODAY',week:'THIS WEEK',month:'THIS MONTH',year:'THIS YEAR'}[state.period]);$('periodTotal').textContent=fmt(sum(a));$('periodSub').textContent=`${a.length} transaction${a.length===1?'':'s'} · ${(()=>{let old=sum(expenses(previous(state.period,d))),now=sum(a);return old?`${now>old?'+':''}${((now-old)/old*100).toFixed(0)}% vs previous`:now?'No previous spending':'No previous data'})()}`;let cd=chartData(state.period,d);draw($('chart'),cd.v,cd.l);$('chartEmpty').style.display=a.length?'none':'block';breakdown($('categories'),a);let recent=[...ts].sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time)).slice(0,5);$('recent').innerHTML=recent.length?recent.map(txHTML).join(''):'<div class="empty">No transactions yet. Add your first expense.</div>'}
function renderTx(){let q=$('search').value.toLowerCase(),c=$('filterCat').value,from=$('from').value,to=$('to').value,sort=$('sort').value,a=state.tx.filter(t=>(!q||[t.description,t.notes,t.category,(t.tags||[]).join(' ')].join(' ').toLowerCase().includes(q))&&(!c||t.category===c)&&(!from||t.date>=from)&&(!to||t.date<=to));a.sort((x,y)=>sort==='old'?(x.date+x.time).localeCompare(y.date+y.time):sort==='high'?y.amount-x.amount:sort==='low'?x.amount-y.amount:(y.date+y.time).localeCompare(x.date+x.time));$('allTx').innerHTML=a.length?a.map(txHTML).join(''):'<div class="empty">No transactions match these filters.</div>'}
function renderStats(){let d=dateObj(state.sd),p=state.sp,b=bounds(p,d),a=expenses(b),total=sum(a),old=sum(expenses(previous(p,d))),days=p==='day'?1:Math.max(1,Math.round((b[1]-b[0])/86400000));$('statsLabel').textContent=title(p,d);$('statsTotal').textContent=fmt(total);$('average').textContent=fmt(Math.round(total/days));$('count').textContent=a.length;$('change').textContent=old?`${total>old?'+':''}${((total-old)/old*100).toFixed(0)}%`:total?'—':'0%';let cd=chartData(p,d);draw($('statsChart'),cd.v,cd.l);$('statsEmpty').style.display=a.length?'none':'block';breakdown($('statsCats'),a);let mb=bounds('month',new Date()),m=expenses(mb),bs=state.settings.budgets,items=[];if(bs.overall>0)items.push(['Overall budget',bs.overall,sum(m)]);Object.entries(bs.categories||{}).forEach(([c,n])=>{if(n>0)items.push([c,n,sum(m.filter(t=>t.category===c))])});$('budgetSummary').innerHTML=items.length?items.map(([c,lim,n])=>`<div class="budgetItem"><div>${esc(c)} <b style="float:right">${fmt(n)} / ${fmt(lim)}</b></div><div class="track"><span style="width:${Math.min(100,n/lim*100)}%;background:${n>lim?'var(--danger)':'var(--accent)'}"></span></div><small>${n>lim?'Budget exceeded by '+fmt(n-lim):n>=lim*.8?'You have used over 80% of this budget.':''}</small></div>`).join(''):'No budgets set. Set one in Settings.'}
function fillSelects(){let c=cats();['category','filterCat','budgetCategory'].forEach(id=>{let el=$(id),old=el.value;el.innerHTML=(id==='filterCat'?'<option value="">All categories</option>':id==='budgetCategory'?'<option value="">Choose category</option>':'')+c.map(x=>`<option>${esc(x)}</option>`).join('');if(c.includes(old))el.value=old})}
function applyTheme(){let t=palettes[state.settings.theme]||palettes[0],light=state.settings.mode==='light'||['#f6f7f9','#f5f2ff','#eff8fc'].includes(t[2]);document.body.classList.toggle('light',light);let root=document.documentElement;root.style.setProperty('--accent',t[1]);root.style.setProperty('--bg',light?t[2]:t[2]);root.style.setProperty('--surface',light?'#fff':t[3]);root.style.setProperty('--surface2',light?'#edf2ef':t[3]);root.style.setProperty('--ink',light?'#fff':(t[0]==='Spotify'?'#061b0c':'#14200d'));root.style.setProperty('--line',light?'#dfe7e1':'#293740');document.querySelector('meta[name="theme-color"]').content=t[2]}
function renderSettings(){let t=palettes[state.settings.theme];$('themes').innerHTML=palettes.map((p,i)=>`<button class="theme ${i===state.settings.theme?'active':''}" data-theme="${i}"><span class="swatches"><i style="background:${p[1]}"></i><i style="background:${p[2]}"></i><i style="background:${p[3]}"></i></span>${p[0]}</button>`).join('');$('mode').value=state.settings.mode;$('currency').value=state.settings.currency;$('weekStart').value=state.settings.weekStart;$('overallBudget').value=state.settings.budgets.overall?state.settings.budgets.overall/100:'';$('budgetSettings').innerHTML=Object.entries(state.settings.budgets.categories||{}).filter(([,n])=>n>0).map(([c,n])=>`<p>${esc(c)} · ${fmt(n)} <button data-rmb="${esc(c)}">Remove</button></p>`).join('');$('customCats').innerHTML=(state.settings.custom||[]).map(c=>`<p>${esc(c)} <button data-rmc="${esc(c)}">Remove</button></p>`).join('')||'<p class="muted">No custom categories.</p>';applyTheme()}
function render(){fillSelects();renderHome();renderTx();renderStats();renderSettings()}
function nav(p){state.page=p;document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===p));document.querySelectorAll('[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===p));if(p==='home')renderHome();if(p==='transactions')renderTx();if(p==='stats')renderStats();if(p==='settings')renderSettings();window.scrollTo(0,0)}
function openTx(t){$('modal').classList.remove('hidden');$('modalTitle').textContent=t?'Edit transaction':'Add transaction';$('txId').value=t?.id||'';$('type').value=t?.type||'expense';$('amount').value=t?t.amount/100:'';$('desc').value=t?.description||'';$('category').value=t?.category||'Other';$('payment').value=t?.payment||'UPI';$('date').value=t?.date||today();$('time').value=t?.time||new Date().toTimeString().slice(0,5);$('notes').value=t?.notes||'';$('tags').value=(t?.tags||[]).join(', ');$('hint').textContent='Category is suggested from merchant keywords; you can change it.'}
function closeTx(){$('modal').classList.add('hidden')}
$('txForm').onsubmit=async e=>{e.preventDefault();let n=Number($('amount').value);if(!Number.isFinite(n)||n<=0){toast('Enter an amount greater than zero.');return}let old=state.tx.find(t=>t.id===$('txId').value),desc=$('desc').value.trim(),category=$('category').value,type=$('type').value,t={id:old?.id||crypto.randomUUID(),amount:minor(n),type,description:desc||category,category,payment:$('payment').value,date:$('date').value,time:$('time').value,notes:$('notes').value.trim(),tags:$('tags').value.split(',').map(x=>x.trim()).filter(Boolean),createdAt:old?.createdAt||new Date().toISOString()};if(type==='transfer')t.category='Transfers';if(type==='investment')t.category='Investments';try{await req('tx','put',null,t);state.tx=old?state.tx.map(x=>x.id===old.id?t:x):[...state.tx,t];if(desc&&category!==suggest(desc,type)){state.settings.prefs[desc.toLowerCase()]=category;await savePrefs()}closeTx();render();toast(old?'Transaction updated.':'Saved on this device.')}catch(e){toast('Could not save; browser storage may be unavailable.')}};
$('desc').oninput=()=>{let c=suggest($('desc').value,$('type').value);if(!state.tx.some(t=>t.id===$('txId').value))$('category').value=c;$('hint').textContent=c==='Other'?'No confident match — please confirm category.':'Suggested: '+c};
$('type').onchange=()=>{if($('type').value==='transfer')$('category').value='Transfers';else if($('type').value==='investment')$('category').value='Investments';else $('category').value=suggest($('desc').value,$('type').value)};
document.addEventListener('click',async e=>{let p=e.target.closest('[data-page]');if(p)return nav(p.dataset.page);if(e.target.closest('[data-close]'))return closeTx();let th=e.target.closest('[data-theme]');if(th){state.settings.theme=+th.dataset.theme;await savePrefs();renderSettings();return}let ed=e.target.closest('[data-edit]');if(ed){let t=state.tx.find(x=>x.id===ed.dataset.edit);if(t)openTx(t);return}let del=e.target.closest('[data-del]');if(del){if(!confirm('Delete this transaction?'))return;await req('tx','delete',del.dataset.del);state.tx=state.tx.filter(t=>t.id!==del.dataset.del);render();toast('Transaction deleted.');return}let cat=e.target.closest('[data-cat]');if(cat){nav('transactions');$('filterCat').value=cat.dataset.cat;renderTx();return}let rm=e.target.closest('[data-rmb]');if(rm){delete state.settings.budgets.categories[rm.dataset.rmb];await savePrefs();render();return}let rc=e.target.closest('[data-rmc]');if(rc){let c=rc.dataset.rmc;if(state.tx.some(t=>t.category===c)){toast('Category is in use by existing transactions.');return}state.settings.custom=state.settings.custom.filter(x=>x!==c);await savePrefs();render();return}});
$('add').onclick=$('add2').onclick=()=>openTx();$('themeQuick').onclick=async()=>{state.settings.theme=(state.settings.theme+1)%palettes.length;await savePrefs();renderSettings();renderHome()};
document.querySelectorAll('#homeTabs button').forEach(b=>b.onclick=()=>{state.period=b.dataset.period;document.querySelectorAll('#homeTabs button').forEach(x=>x.classList.toggle('chosen',x===b));renderHome()});
document.querySelectorAll('#statsTabs button').forEach(b=>b.onclick=()=>{state.sp=b.dataset.period;document.querySelectorAll('#statsTabs button').forEach(x=>x.classList.toggle('chosen',x===b));renderStats()});
$('prev').onclick=()=>move(-1);$('next').onclick=()=>move(1);function move(n){let d=dateObj(state.sd);if(state.sp==='day')d.setDate(d.getDate()+n);if(state.sp==='week')d.setDate(d.getDate()+7*n);if(state.sp==='month')d.setMonth(d.getMonth()+n);if(state.sp==='year')d.setFullYear(d.getFullYear()+n);state.sd=iso(d);$('statsDate').value=state.sd;renderStats()}
$('statsDate').value=state.sd;$('statsDate').onchange=()=>{if($('statsDate').value){state.sd=$('statsDate').value;renderStats()}};
['search','filterCat','sort','from','to'].forEach(i=>$(i).addEventListener(i==='search'?'input':'change',renderTx));
$('mode').onchange=async()=>{state.settings.mode=$('mode').value;await savePrefs();applyTheme()};$('currency').onchange=async()=>{state.settings.currency=$('currency').value;await savePrefs();render()};$('weekStart').onchange=async()=>{state.settings.weekStart=+$('weekStart').value;await savePrefs();render()};
$('saveBudgets').onclick=async()=>{state.settings.budgets.overall=minor(+$('overallBudget').value||0);let c=$('budgetCategory').value,n=+$('categoryBudget').value;if(c&&n>0)state.settings.budgets.categories[c]=minor(n);await savePrefs();render();toast('Budgets saved.')};
$('catForm').onsubmit=async e=>{e.preventDefault();let c=$('newCat').value.trim();if(!c)return;if(cats().some(x=>x.toLowerCase()===c.toLowerCase()))return toast('Category already exists.');state.settings.custom.push(c);$('newCat').value='';await savePrefs();render();toast('Category added.')};
function download(name,data,type){let u=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
$('csv').onclick=()=>{let fs=['id','type','amountMinor','description','category','payment','date','time','notes','tags'];let rows=[fs.join(','),...state.tx.map(t=>fs.map(f=>{let v=f==='amountMinor'?t.amount:f==='tags'?(t.tags||[]).join('|'):t[f]??'';return '"'+String(v).replace(/"/g,'""')+'"'}).join(','))];download('cashtrack-'+today()+'.csv',rows.join('\r\n'),'text/csv');toast('CSV exported.')};
$('backup').onclick=()=>download('cashtrack-backup-'+today()+'.json',JSON.stringify({app:'CashTrack',version:2,transactions:state.tx,settings:state.settings,debts:state.debts,emis:state.emis},null,2),'application/json');
$('restore').onchange=async e=>{try{let d=JSON.parse(await e.target.files[0].text());if(!Array.isArray(d.transactions)||!d.settings)throw Error('Invalid backup format');for(let t of d.transactions)if(typeof t.id!=='string'||!Number.isSafeInteger(t.amount)||!/^\d{4}-\d{2}-\d{2}$/.test(t.date))throw Error('Invalid transaction in backup');let merge=confirm('Backup has '+d.transactions.length+' records. OK = merge only new IDs; Cancel = choose replace-all.');if(merge){let ids=new Set(state.tx.map(t=>t.id)),fresh=d.transactions.filter(t=>!ids.has(t.id));for(let t of fresh)await req('tx','put',null,t);state.tx.push(...fresh);toast('Merged '+fresh.length+' new records.')}else if(confirm('Replace ALL current transactions and settings? This cannot be undone.')){let db=await dbp;await new Promise((res,rej)=>{let tr=db.transaction(['tx','prefs'],'readwrite');tr.objectStore('tx').clear();tr.objectStore('prefs').clear();d.transactions.forEach(t=>tr.objectStore('tx').put(t));tr.objectStore('prefs').put({key:'settings',value:d.settings});tr.oncomplete=res;tr.onerror=()=>rej(tr.error)});state.tx=d.transactions;state.settings={...state.settings,...d.settings};toast('Backup restored.')}if(Array.isArray(d.debts)){let ids=new Set(state.debts.map(x=>x.id));state.debts.push(...d.debts.filter(x=>!ids.has(x.id)));await saveExtra('debts',state.debts)}if(Array.isArray(d.emis)){let ids=new Set(state.emis.map(x=>x.id));state.emis.push(...d.emis.filter(x=>!ids.has(x.id)));await saveExtra('emis',state.emis)}await savePrefs();render();renderAllFinance()}catch(err){alert('Restore failed: '+err.message)}finally{$('restore').value=''}};
$('clear').onclick=async()=>{if(!confirm('Delete all local transactions and settings? Export a backup first if needed.'))return;if(!confirm('Final confirmation: permanently erase CashTrack data on this browser?'))return;let db=await dbp;await new Promise((res,rej)=>{let t=db.transaction(['tx','prefs'],'readwrite');t.objectStore('tx').clear();t.objectStore('prefs').clear();t.oncomplete=res;t.onerror=()=>rej(t.error)});state.tx=[];state.settings={theme:0,mode:'dark',currency:'INR',weekStart:1,custom:[],prefs:{},budgets:{overall:0,categories:{}}};await savePrefs();render();toast('All local data deleted.')};
$('install').onclick=async()=>{if(state.install){state.install.prompt();let r=await state.install.userChoice;state.install=null;toast(r.outcome==='accepted'?'Install accepted.':'Install dismissed.')}else alert('On Android Chrome, open this HTTPS website, tap ⋮, then Install app or Add to Home screen. Visit online once first.');};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.install=e;$('install').textContent='＋ Install CashTrack'});window.addEventListener('appinstalled',()=>toast('CashTrack installed.'));
let lastChartWidth = 0;
if ('ResizeObserver' in window) {
    const chartObserver = new ResizeObserver(entries => {
        const entry = entries[0];
        const width = Math.floor(entry.contentRect.width);
        if (!width || width === lastChartWidth) return;
        lastChartWidth = width;
        requestAnimationFrame(() => {
            if (state.page === 'home') drawHomeCategoryChart($('chart'), state.period, dateObj(state.homeDate || today()));
            if (state.page === 'stats') renderStats();
        });
    });
    window.addEventListener('load', () => {
        const homeCanvas = $('chart');
        const statsCanvas = $('statsChart');
        if (homeCanvas) chartObserver.observe(homeCanvas.parentElement);
        if (statsCanvas) chartObserver.observe(statsCanvas.parentElement);
    }, { once: true });
}
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));
async function boot(){try{state.tx=await req('tx','getAll');let ps=await req('prefs','getAll'),s=ps.find(x=>x.key==='settings');if(s?.value)state.settings={...state.settings,...s.value};state.settings.budgets||={overall:0,categories:{}};state.settings.budgets.categories||={};fillSelects();render()}catch(e){toast('IndexedDB unavailable in this browser.');console.error(e)}}

// CashTrack Plus: date-aware category charts, pie statistics, lending ledger and EMI planner.
state.debts = [];
state.emis = [];
state.homeDate = today();
state.pieSlices = [];

function groupByCategory(list){
  const m={}; list.forEach(t=>m[t.category]=(m[t.category]||0)+t.amount);
  return Object.entries(m).sort((a,b)=>b[1]-a[1]);
}
function drawHomeCategoryChart(canvas, period, anchor) {
    if (!canvas) return;

    const list = expenses(bounds(period, anchor));
    const categories = groupByCategory(list);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(240, Math.floor(rect.width || canvas.parentElement.clientWidth || 300));
    const h = 210;
    const ratio = Math.max(1, window.devicePixelRatio || 1);

    // CSS size remains in CSS pixels; backing-store size is only for sharp drawing.
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.maxWidth = '100%';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const css = getComputedStyle(document.body);
    const muted = css.getPropertyValue('--muted').trim() || '#899ba1';
    const line = css.getPropertyValue('--line').trim() || '#293740';

    // A category gets one stable color, so its color does not change by period.
    const categoryColor = category => {
        let hash = 0;
        for (let i = 0; i < category.length; i++) {
            hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
        }
        return `hsl(${hash % 360} 68% 54%)`;
    };

    let groups = [];
    if (period === 'day') {
        groups = categories.map(([category, amount]) => ({
            label: category,
            parts: [[category, amount]]
        }));
    } else {
        const b = bounds(period, anchor);
        const count = period === 'week'
            ? 7
            : period === 'month'
                ? new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate()
                : 12;

        for (let i = 0; i < count; i++) {
            const dt = period === 'year'
                ? new Date(anchor.getFullYear(), i, 1)
                : new Date(b[0].getFullYear(), b[0].getMonth(), b[0].getDate() + i);

            const label = period === 'year'
                ? dt.toLocaleDateString('en-IN', { month: 'short' })
                : period === 'week'
                    ? dt.toLocaleDateString('en-IN', { weekday: 'short' })
                    : String(dt.getDate());

            const dayTransactions = list.filter(t =>
                period === 'year'
                    ? Number(t.date.slice(5, 7)) === i + 1
                    : t.date === iso(dt)
            );

            groups.push({ label, parts: groupByCategory(dayTransactions) });
        }
    }

    const left = 49, right = 9, top = 15, bottom = 38;
    const plotW = Math.max(1, w - left - right);
    const plotH = h - top - bottom;
    const max = Math.max(1, ...groups.map(g =>
        g.parts.reduce((total, part) => total + part[1], 0)
    ));

    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= 3; i++) {
        const y = top + plotH - plotH * i / 3;
        ctx.strokeStyle = line;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(w - right, y);
        ctx.stroke();
        ctx.fillStyle = muted;
        ctx.fillText(compact(max * i / 3), left - 7, y);
    }

    const step = plotW / Math.max(groups.length, 1);
    const barW = Math.max(3, Math.min(period === 'day' ? 30 : 22, step * 0.62));

    groups.forEach((group, i) => {
        const x = left + i * step + (step - barW) / 2;
        let baseY = top + plotH;

        group.parts.forEach(([category, amount]) => {
            const barHeight = amount / max * plotH;
            ctx.fillStyle = categoryColor(category);
            ctx.fillRect(x, baseY - barHeight, barW, barHeight);
            baseY -= barHeight;
        });

        // Monthly charts show labels every five days; all bars are still displayed.
        const showLabel = period === 'month'
            ? (i === 0 || (i + 1) % 5 === 0 || i === groups.length - 1)
            : period === 'day'
                ? (groups.length <= 5 || i % Math.ceil(groups.length / 5) === 0 || i === groups.length - 1)
                : true;

        if (showLabel) {
            ctx.fillStyle = muted;
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            const label = group.label.length > 8
                ? group.label.slice(0, 7) + '…'
                : group.label;
            ctx.fillText(label, x + barW / 2, top + plotH + 7);
        }
    });

    const hint = $('homeChartHint');
    if (hint) {
        hint.textContent = period === 'day'
            ? 'Amount (₹) by category'
            : `Amount (₹) by ${period === 'week' ? 'day' : period === 'month' ? 'date' : 'month'} · category segments`;
    }

    // Explain every chart color and show the total for that category in this period.
    const legend = $('homeChartLegend');
    if (legend) {
        legend.innerHTML = categories.length
            ? categories.map(([category, amount]) => `
                <div class="chartLegendItem">
                    <span class="chartLegendSwatch" style="background:${categoryColor(category)}"></span>
                    <span class="chartLegendName">${esc(category)}</span>
                    <strong>${fmt(amount)}</strong>
                </div>
            `).join('')
            : '<span class="muted">No category spending in this period.</span>';
    }
}
function renderHome(){
  let d=dateObj(state.homeDate||today());
  $('today').textContent=d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase();
  $('greeting').textContent='Your spending overview';
  [['day','todayTotal'],['week','weekTotal'],['month','monthTotal'],['year','yearTotal']].forEach(([p,id])=>$(id).textContent=compact(sum(expenses(bounds(p,d)))));
  let b=bounds(state.period,d),a=expenses(b);
  $('periodLabel').textContent='TOTAL SPENT '+({day:'ON SELECTED DAY',week:'IN SELECTED WEEK',month:'IN SELECTED MONTH',year:'IN SELECTED YEAR'}[state.period]);
  $('periodTotal').textContent=fmt(sum(a));
  let grouped=groupByCategory(a),top=grouped[0];
  $('periodSub').textContent=`${a.length} transactions · ${top?'Highest: '+top[0]+' ('+fmt(top[1])+')':'No spending recorded'}`;
  if($('homeDate'))$('homeDate').value=state.homeDate||today();
  drawHomeCategoryChart($('chart'),state.period,d);
  $('chartEmpty').style.display=a.length?'none':'block';
  breakdown($('categories'),a);
  let recent=[...state.tx].sort((x,y)=>(y.date+y.time).localeCompare(x.date+x.time)).slice(0,5);
  $('recent').innerHTML=recent.length?recent.map(txHTML).join(''):'<div class="empty">No transactions yet. Add your first expense.</div>';
}
function drawPie(canvas,list){
  if(!canvas)return;
  let entries=groupByCategory(list),total=entries.reduce((s,x)=>s+x[1],0),w=Math.max(240,Math.floor(canvas.getBoundingClientRect().width||canvas.parentElement.clientWidth||300)),h=220,ratio=Math.max(1,window.devicePixelRatio||1);
  canvas.style.display='block';canvas.style.width='100%';canvas.style.maxWidth='100%';canvas.style.height=h+'px';canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
  let ctx=canvas.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);
  state.pieSlices=[];if(!entries.length)return;
  let colors=entries.map((_,i)=>`hsl(${(145+i*43)%360} 68% 52%)`),cx=w/2,cy=105,r=Math.min(88,w*.29),inner=r*.56,start=-Math.PI/2;
  entries.forEach(([cat,val],i)=>{let end=start+val/total*Math.PI*2;ctx.beginPath();ctx.arc(cx,cy,r,start,end);ctx.arc(cx,cy,inner,end,start,true);ctx.closePath();ctx.fillStyle=colors[i];ctx.fill();state.pieSlices.push({cat,val,start,end,color:colors[i]});start=end});
  ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--text');ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 13px sans-serif';ctx.fillText(fmt(total),cx,cy-4);ctx.font='10px sans-serif';ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--muted');ctx.fillText('TOTAL SPENT',cx,cy+13);
  let legend=$('pieDetail');if(legend)legend.innerHTML='<div class="pieLegend">'+state.pieSlices.map(s=>`<button data-piecat="${esc(s.cat)}"><i style="background:${s.color}"></i>${esc(s.cat)} · ${Math.round(s.val/total*100)}%</button>`).join('')+'</div>';
}
function renderStats(){
  let d=dateObj(state.sd),p=state.sp,b=bounds(p,d),a=expenses(b),total=sum(a),old=sum(expenses(previous(p,d))),days=p==='day'?1:Math.max(1,Math.round((b[1]-b[0])/86400000));
  $('statsLabel').textContent=title(p,d);$('statsTotal').textContent=fmt(total);$('average').textContent=fmt(Math.round(total/days));$('count').textContent=a.length;$('change').textContent=old?`${total>old?'+':''}${((total-old)/old*100).toFixed(0)}%`:total?'—':'0%';
  drawPie($('statsChart'),a);$('statsEmpty').style.display=a.length?'none':'block';breakdown($('statsCats'),a);
  let mb=bounds('month',new Date()),m=expenses(mb),bs=state.settings.budgets,items=[];
  if(bs.overall>0)items.push(['Overall budget',bs.overall,sum(m)]);
  Object.entries(bs.categories||{}).forEach(([c,n])=>{if(n>0)items.push([c,n,sum(m.filter(t=>t.category===c))])});
  $('budgetSummary').innerHTML=items.length?items.map(([c,lim,n])=>`<div class="budgetItem"><div>${esc(c)} <b style="float:right">${fmt(n)} / ${fmt(lim)}</b></div><div class="track"><span style="width:${Math.min(100,n/lim*100)}%;background:${n>lim?'var(--danger)':'var(--accent)'}"></span></div><small>${n>lim?'Budget exceeded by '+fmt(n-lim):n>=lim*.8?'You have used over 80% of this budget.':''}</small></div>`).join(''):'No budgets set. Set one in Settings.';
}
async function saveExtra(key,value){await req('prefs','put',null,{key,value})}
function dateAddMonths(date,n){let d=new Date(date.getFullYear(),date.getMonth()+n,1);return d}
function emiDueDate(plan,index){let m=dateAddMonths(dateObj(plan.start),index);let day=Math.min(Number(plan.dueDay)||1,new Date(m.getFullYear(),m.getMonth()+1,0).getDate());return iso(new Date(m.getFullYear(),m.getMonth(),day))}
function renderMoney(){
  let borrowed=state.debts.filter(x=>x.direction==='borrowed'&&!x.settled).reduce((s,x)=>s+x.remaining,0),lent=state.debts.filter(x=>x.direction==='lent'&&!x.settled).reduce((s,x)=>s+x.remaining,0);
  $('borrowedTotal').textContent=fmt(borrowed);$('lentTotal').textContent=fmt(lent);
  $('debtList').innerHTML=state.debts.length?[...state.debts].sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')).map(x=>`<article class="moneyRecord"><div class="recordTop"><div><strong>${esc(x.person)}</strong><div class="recordMeta">${x.direction==='borrowed'?'Borrowed from':'Lent to'} · ${esc(x.date)}${x.due?' · Due '+esc(x.due):''}<br>Original: ${fmt(x.amount)} · Remaining: ${fmt(x.remaining)}${x.notes?' · '+esc(x.notes):''}</div></div><span class="statusPill ${x.settled?'':'due'}">${x.settled?'Settled':'Outstanding'}</span></div><div class="recordActions">${x.settled?'':`<button data-repay="${x.id}">Record repayment</button><button data-settle="${x.id}">Mark settled</button>`}<button data-debt-del="${x.id}">Delete</button></div></article>`).join(''):'<div class="empty">No borrowing or lending records yet.</div>';
}
function renderEmis(){
  let active=state.emis.filter(x=>!x.closed);$('emiMonthlyTotal').textContent=fmt(active.reduce((s,x)=>s+x.amount,0));$('emiActiveCount').textContent=active.length;
  $('emiList').innerHTML=state.emis.length?state.emis.map(x=>{let paid=(x.paid||[]).length,next=(x.paid||[]).length,done=paid>=x.tenure,due=done?'Completed':emiDueDate(x,next),isPaid=(x.paid||[]).includes(due);return `<article class="emiRecord"><div class="recordTop"><div><strong>${esc(x.name)}</strong><div class="recordMeta">Loan: ${fmt(x.principal)} · EMI: ${fmt(x.amount)} · Tenure: ${x.tenure} months<br>Paid: ${paid}/${x.tenure} · Remaining: ${x.tenure-paid} · ${done?'All instalments completed':'Next due: '+due}</div></div><span class="statusPill ${!done&&due<today()&&!isPaid?'due':''}">${done?'Completed':isPaid?'Paid':'Active'}</span></div><div class="recordActions">${!done?`<button class="paid" data-emi-paid="${x.id}" data-emi-month="${due}">Mark this month paid</button>`:''}<button data-emi-del="${x.id}">Delete plan</button></div></article>`}).join(''):'<div class="empty">No EMI plans added yet.</div>';
}
async function checkEmiReminders(){
  const todayDate=dateObj(today()),notified=new Set((state.settings.prefs||{}).emiNotified||[]),upcoming=[];
  state.emis.filter(x=>!x.closed).forEach(x=>{let idx=(x.paid||[]).length;if(idx>=x.tenure)return;let due=emiDueDate(x,idx),days=Math.round((dateObj(due)-todayDate)/86400000),key=x.id+':'+due;if(days>=0&&days<=3&&!notified.has(key))upcoming.push({x,due,days,key});});
  if(!upcoming.length)return;
  if('Notification'in window&&Notification.permission==='granted'){
    upcoming.forEach(({x,due,days,key})=>{new Notification('CashTrack EMI reminder',{body:`${x.name}: ${fmt(x.amount)} due ${days===0?'today':`in ${days} day(s)`} (${due}).`});notified.add(key)});
    state.settings.prefs.emiNotified=[...notified];await savePrefs();
  }else if($('notificationStatus'))$('notificationStatus').textContent=`${upcoming.length} EMI reminder(s) due within 3 days. Enable notifications to receive alerts when you open the app.`;
}
function renderAllFinance(){renderMoney();renderEmis()}
document.addEventListener('click',async e=>{
  let repay=e.target.closest('[data-repay]');if(repay){let x=state.debts.find(d=>d.id===repay.dataset.repay);if(!x)return;let n=Number(prompt('How much was repaid? (₹)',(x.remaining/100).toFixed(2)));if(!Number.isFinite(n)||n<=0)return toast('Enter a valid repayment.');x.remaining=Math.max(0,x.remaining-minor(n));x.settled=x.remaining===0;await saveExtra('debts',state.debts);renderMoney();return}
  let settle=e.target.closest('[data-settle]');if(settle){let x=state.debts.find(d=>d.id===settle.dataset.settle);if(x){if(!confirm('Mark this record fully settled?'))return;x.remaining=0;x.settled=true;await saveExtra('debts',state.debts);renderMoney()}return}
  let dd=e.target.closest('[data-debt-del]');if(dd){if(!confirm('Delete this record?'))return;state.debts=state.debts.filter(x=>x.id!==dd.dataset.debtDel);await saveExtra('debts',state.debts);renderMoney();return}
  let paid=e.target.closest('[data-emi-paid]');if(paid){let x=state.emis.find(z=>z.id===paid.dataset.emiPaid);if(x){let due=paid.dataset.emiMonth;if(!confirm(`Mark EMI ${fmt(x.amount)} for ${due} as paid?`))return;x.paid=x.paid||[];if(!x.paid.includes(due))x.paid.push(due);x.paid.sort();await saveExtra('emis',state.emis);renderEmis();toast('EMI payment recorded.')}return}
  let del=e.target.closest('[data-emi-del]');if(del){if(!confirm('Delete this EMI plan and its payment history?'))return;state.emis=state.emis.filter(x=>x.id!==del.dataset.emiDel);await saveExtra('emis',state.emis);renderEmis();return}
  let pc=e.target.closest('[data-piecat]');if(pc){let cat=pc.dataset.piecat;nav('transactions');$('filterCat').value=cat;renderTx();return}
});
$('homeDate').value=state.homeDate;
$('homeDate').addEventListener('change',()=>{if($('homeDate').value){state.homeDate=$('homeDate').value;renderHome()}});
$('debtDate').value=today();$('debtForm').addEventListener('submit',async e=>{e.preventDefault();let n=Number($('debtAmount').value);if(!n||n<=0)return toast('Enter a valid amount.');state.debts.push({id:crypto.randomUUID(),direction:$('debtDirection').value,person:$('debtPerson').value.trim(),amount:minor(n),remaining:minor(n),date:$('debtDate').value,due:$('debtDue').value,notes:$('debtNotes').value.trim(),settled:false});await saveExtra('debts',state.debts);e.target.reset();$('debtDate').value=today();renderMoney();toast('Loan/lending record saved.')});
$('emiStart').value=today();$('emiForm').addEventListener('submit',async e=>{e.preventDefault();let principal=Number($('emiPrincipal').value),amount=Number($('emiAmount').value),tenure=Number($('emiTenure').value),day=Number($('emiDueDay').value);if(principal<=0||amount<=0||tenure<1||day<1||day>28)return toast('Check the EMI details.');state.emis.push({id:crypto.randomUUID(),name:$('emiName').value.trim(),principal:minor(principal),amount:minor(amount),tenure,start:$('emiStart').value,dueDay:day,paid:[],closed:false});await saveExtra('emis',state.emis);e.target.reset();$('emiStart').value=today();$('emiDueDay').value=5;renderEmis();toast('EMI plan saved.')});
$('enableNotifications').onclick=async()=>{if(!('Notification'in window)){ $('notificationStatus').textContent='Notifications are not supported in this browser.';return;}let p=await Notification.requestPermission();$('notificationStatus').textContent=p==='granted'?'Notifications enabled. Reminders are checked when the app opens.':'Notification permission was not granted.';if(p==='granted')checkEmiReminders()};
document.querySelectorAll('#homeTabs button').forEach(b=>b.addEventListener('click',()=>{state.period=b.dataset.period;document.querySelectorAll('#homeTabs button').forEach(x=>x.classList.toggle('chosen',x===b));renderHome()}));
document.querySelectorAll('#statsTabs button').forEach(b=>b.addEventListener('click',()=>{state.sp=b.dataset.period;document.querySelectorAll('#statsTabs button').forEach(x=>x.classList.toggle('chosen',x===b));renderStats()}));
const oldNav=nav;
nav=function(p){state.page=p;document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===p));document.querySelectorAll('[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===p));if(p==='home')renderHome();if(p==='transactions')renderTx();if(p==='stats')renderStats();if(p==='settings')renderSettings();if(p==='money')renderMoney();if(p==='emis')renderEmis();window.scrollTo(0,0)};
document.addEventListener('DOMContentLoaded',()=>{});
(async()=>{try{let ps=await req('prefs','getAll');state.debts=ps.find(x=>x.key==='debts')?.value||[];state.emis=ps.find(x=>x.key==='emis')?.value||[];state.settings.prefs=state.settings.prefs||{};renderAllFinance();checkEmiReminders()}catch(err){console.warn('Finance modules could not load',err)}})();

boot();
})();