/* Motor determinista de simulación. Independiente de la interfaz y de WebGL. */
(function (G) {
  'use strict';
  const D = G.SimData;
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const copy = v => JSON.parse(JSON.stringify(v));
  class Simulation {
    constructor(options = {}) {
      const scenario = D.scenarios.find(s=>s.id===options.scenario) || D.scenarios[0];
      this.s = {
        version:1,seed:options.seed || (Date.now() % 2147483646 + 1),name:(options.name||'Álex Martín').slice(0,40),
        partyName:(options.partyName||'Horizonte').slice(0,35),ideology:Number(options.ideology)||0,difficulty:options.difficulty||'normal',
        scenario:scenario.id,startYear:scenario.year,turn:0,term:1,actions:3,capital:65,
        metrics:{approval:52,growth:2.1,unemployment:11.8,inflation:3.2,debt:103,cash:32,stability:64,eu:66,climate:45,health:59,education:58,security:65,housing:38,integrity:68,infrastructure:61,...scenario.metrics},
        groups:{workers:53,youth:44,pensioners:59,business:48,rural:49,public:55},
        parties:copy(D.parties),coalition:['progreso'],regions:copy(D.regions),
        budget:{health:17,education:10,welfare:28,infrastructure:8,security:7,climate:5,incomeTax:24,vat:21,corporateTax:25},
        budgetTurn:-1,lawTurn:-1,campaignTurn:-1,diplomacyTurn:-1,territoryTurn:-1,lastElection:0,
        cabinet:D.ministers.slice(0,6).map((m,i)=>({...m,portfolio:D.portfolios[i].id,fatigue:0})),
        laws:[],seen:[scenario.event],activeEvent:scenario.event,delayed:[],promises:[],missions:[],
        history:[],series:[],campaign:0,election:null,ended:null,briefing:true,
        settings:{audio:true,quality:'auto',motion:true},statistics:{decisions:0,laws:0,elections:0}
      };
      this.s.parties[0].ideology=this.s.ideology;
      this.s.parties[0].name=this.s.partyName;
      this.recalculate();
      this.record('investiture','La investidura',`${this.s.name} asume la presidencia. La coalición reúne 177 escaños. El primer Consejo de Ministros ya tiene trabajo.`);
      this.sample();
    }
    random() { this.s.seed=(this.s.seed*16807)%2147483647; return (this.s.seed-1)/2147483646; }
    get date() { return new Date(this.s.startYear, this.s.turn, 1); }
    get monthsRemaining() { return Math.max(0,48-(this.s.turn-this.s.lastElection)); }
    get event() { return D.events.find(e=>e.id===this.s.activeEvent); }
    get coalitionSeats() { return this.s.parties.filter(p=>p.id==='horizonte'||this.s.coalition.includes(p.id)).reduce((n,p)=>n+p.seats,0); }
    record(type,title,text,extra={}) { this.s.history.unshift({turn:this.s.turn,type,title,text,...extra}); if(this.s.history.length>500)this.s.history.pop(); }
    sample() { const m=this.s.metrics; this.s.series.push({turn:this.s.turn,approval:m.approval,growth:m.growth,unemployment:m.unemployment,debt:m.debt}); if(this.s.series.length>240)this.s.series.shift(); }
    blocked() { return this.s.ended?'La partida ha terminado.':this.s.election?'Resuelve primero la investidura.':this.s.actions<=0?'No quedan acciones este mes. Avanza al siguiente.':null; }
    check(cost=0) { const b=this.blocked(); if(b)return b; if(this.s.capital<cost)return 'No tienes suficiente capital político. Se recupera cada mes.'; return null; }
    spend(cost) { this.s.capital-=cost; this.s.actions--; }
    apply(effects) {
      for(const [key,value] of Object.entries(effects||{})) {
        if(key in this.s.metrics)this.s.metrics[key]+=value;
        else if(key in this.s.groups)this.s.groups[key]+=value;
      }
      this.recalculate();
    }
    recalculate() {
      const m=this.s.metrics;
      for(const key of Object.keys(this.s.groups))this.s.groups[key]=clamp(this.s.groups[key],3,97);
      m.approval=D.groups.reduce((n,g)=>n+this.s.groups[g.id]*g.weight,0);
      for(const key of ['stability','eu','climate','health','education','security','housing','integrity','infrastructure'])m[key]=clamp(m[key],0,100);
      m.growth=clamp(m.growth,-12,12); m.unemployment=clamp(m.unemployment,2,40); m.inflation=clamp(m.inflation,-2,30);
      m.debt=clamp(m.debt,5,220); m.cash=clamp(m.cash,-100,250);this.s.capital=clamp(this.s.capital,0,100);
      for(const r of this.s.regions)r.approval=clamp(r.approval,5,95);
      for(const p of this.s.parties)p.relation=clamp(p.relation,0,100);
      for(const mission of D.missions)if(!this.s.missions.includes(mission.id)&&(mission.reverse?m[mission.metric]<=mission.target:m[mission.metric]>=mission.target)){
        this.s.missions.push(mission.id);this.s.capital=clamp(this.s.capital+7,0,100);this.record('achievement',mission.name,'Objetivo de legado cumplido. +7 de capital político.');
      }
    }
    resolveEvent(index) {
      const ev=this.event;if(!ev)return {error:'No hay un asunto pendiente.'};
      const op=ev.options[index];if(!op)return {error:'Decisión no válida.'};
      const error=this.check(op.cost);if(error)return {error};
      this.spend(op.cost);this.apply(op.effects);
      if(op.delayed)this.s.delayed.push({...copy(op.delayed),due:this.s.turn+op.delayed.months});
      this.record('decision',ev.title,op.label,{effects:op.effects});
      this.s.activeEvent=null;this.s.statistics.decisions++;
      return {ok:true,title:'Decisión tomada',text:op.label,effects:op.effects};
    }
    fiscal(budget=this.s.budget) {
      const b=budget,m=this.s.metrics;
      const revenue=465+(b.incomeTax-24)*5.2+(b.vat-21)*8+(b.corporateTax-25)*2.6+m.growth*4-(m.unemployment-11.8)*3;
      const spending=135+(b.health+b.education+b.welfare+b.infrastructure+b.security+b.climate)*4.5+m.debt*0.37;
      return {revenue,spending,balance:revenue-spending,deficit:(spending-revenue)/15};
    }
    setBudget(b) {
      if(this.s.budgetTurn===this.s.turn)return {error:'Ya has aprobado los presupuestos de este mes.'};
      const error=this.check(15);if(error)return {error};
      const limits={health:[5,30],education:[4,20],welfare:[12,40],infrastructure:[2,18],security:[3,15],climate:[1,15],incomeTax:[15,38],vat:[10,28],corporateTax:[15,35]};
      const clean={};for(const [k,[min,max]] of Object.entries(limits)){if(!Number.isFinite(b[k])||b[k]<min||b[k]>max)return {error:'Hay una partida presupuestaria fuera de rango.'};clean[k]=b[k];}
      const prev=this.s.budget;this.s.budget=clean;this.s.budgetTurn=this.s.turn;this.spend(15);
      this.apply({workers:(prev.vat-clean.vat)*0.5+(prev.incomeTax-clean.incomeTax)*0.25,business:(prev.corporateTax-clean.corporateTax)*0.8,public:(clean.health+clean.education-prev.health-prev.education)*0.4,pensioners:(clean.welfare-prev.welfare)*0.45});
      this.record('budget','Presupuestos aprobados',`Balance anual estimado: ${this.fiscal().balance.toFixed(1)} mil M€. Los niveles de gasto e impuestos se mantienen hasta que los cambies.`);
      return {ok:true,title:'Presupuestos aprobados',text:'Sus efectos se aplicarán cada mes.'};
    }
    supportFor(law) {
      return this.s.parties.map(p=>{
        let support=p.id==='horizonte'?1:clamp(0.68-Math.abs(p.ideology-law.ideology)*0.18+(p.relation-50)/160+(this.s.coalition.includes(p.id)?0.24:0),0.03,0.96);
        if(p.id==='territorial'&&law.area==='TERRITORIOS')support=clamp(support+0.25,0,0.99);
        return {...p,support,yes:Math.round(p.seats*support)};
      });
    }
    voteLaw(id) {
      const law=D.laws.find(l=>l.id===id);if(!law||this.s.laws.includes(id))return {error:'Esta ley no está disponible.'};
      if(this.s.lawTurn===this.s.turn)return {error:'El pleno ya ha votado una ley este mes.'};
      const error=this.check(law.cost);if(error)return {error};
      this.spend(law.cost);this.s.lawTurn=this.s.turn;
      const votes=this.supportFor(law).map(p=>({id:p.id,name:p.name,color:p.color,seats:p.seats,yes:p.id==='horizonte'?p.seats:clamp(p.yes+Math.round((this.random()-0.5)*p.seats*0.12),0,p.seats)}));
      const yes=votes.reduce((n,p)=>n+p.yes,0),pass=yes>=176;
      if(pass){this.s.laws.push(id);this.s.statistics.laws++;this.apply(law.effects);this.apply({stability:3});}
      else {this.apply({stability:-4});}
      this.record('law',`${pass?'Aprobada':'Rechazada'}: ${law.name}`,`${yes} votos a favor y ${350-yes} en contra.`,{yes,pass});
      return {ok:true,title:pass?'La ley sale adelante':'La ley no obtiene mayoría',text:`${yes} a favor · ${350-yes} en contra`,votes,pass,effects:pass?law.effects:{stability:-4}};
    }
    negotiate(id,type='dialogue') {
      const p=this.s.parties.find(p=>p.id===id&&p.id!=='horizonte');if(!p)return {error:'Grupo no válido.'};
      const pact=type==='pact',cost=pact?20:10,error=this.check(cost);if(error)return {error};
      if(pact&&this.s.coalition.includes(id))return {error:'Este grupo ya forma parte de la coalición.'};
      if(pact&&p.relation<55)return {error:'Necesitas al menos 55 de relación. Abre primero un diálogo.'};
      this.spend(cost);
      if(pact){
        this.s.coalition.push(id);p.relation+=10;this.apply({stability:4});
        const metric=p.id==='verde'?'climate':p.id==='progreso'?'health':p.id==='territorial'?'infrastructure':p.id==='voz'?'security':'growth';
        this.s.promises.push({party:id,metric,target:Math.min(metric==='growth'?12:100,this.s.metrics[metric]+(metric==='growth'?0.4:5)),due:this.s.turn+6,done:false});
        this.record('pact',`Pacto con ${p.name}`,`Compromiso a seis meses: mejorar ${D.metrics[metric].name.toLowerCase()}.`);
        return {ok:true,title:'Acuerdo de coalición',text:`${p.name} se une al Gobierno. Revisa el compromiso en el Congreso.`};
      }
      const gain=14+Math.round(this.random()*7);p.relation+=gain;this.recalculate();
      this.record('pact',`Diálogo con ${p.name}`,`La relación mejora ${gain} puntos. Será más fácil acordar leyes.`);
      return {ok:true,title:'Puentes tendidos',text:`Relación con ${p.name}: ${Math.round(p.relation)}/100.`};
    }
    dismissCoalition(id) {
      const error=this.check(8);if(error)return {error};
      if(!this.s.coalition.includes(id))return {error:'Este grupo no está en el Gobierno.'};
      this.spend(8);this.s.coalition=this.s.coalition.filter(p=>p!==id);this.s.parties.find(p=>p.id===id).relation-=18;this.apply({stability:-8});
      this.record('pact','Una alianza se rompe','El Gobierno pierde el apoyo de un socio.');return {ok:true,title:'Coalición modificada',text:`El Gobierno reúne ${this.coalitionSeats} escaños.`};
    }
    campaign(type) {
      const activities={rally:{name:'Encuentro ciudadano',effects:{workers:2,youth:2},boost:1.1,cost:10},debate:{name:'Debate público',effects:{business:2,public:2},boost:1.4,cost:14},rural:{name:'Ruta por los pueblos',effects:{rural:4,pensioners:1},boost:0.8,cost:9},listen:{name:'Escucha ciudadana',effects:{youth:2,workers:1,integrity:1},boost:0.6,cost:7}};
      const a=activities[type];if(!a)return {error:'Acción de campaña no válida.'};
      if(this.s.campaignTurn===this.s.turn)return {error:'Ya has realizado una acción de campaña este mes.'};
      const error=this.check(a.cost);if(error)return {error};this.spend(a.cost);this.s.campaignTurn=this.s.turn;
      this.s.campaign=clamp(this.s.campaign+a.boost,0,12);this.apply(a.effects);this.record('campaign',a.name,'La campaña mejora la movilización de tus votantes.');
      return {ok:true,title:a.name,text:'Mejora el apoyo y la intención de voto.'};
    }
    replaceMinister(index,candidateIndex) {
      const error=this.check(13);if(error)return {error};const candidate=D.ministers[candidateIndex];
      if(!candidate||!this.s.cabinet[index]||this.s.cabinet.some(m=>m.name===candidate.name))return {error:'Candidatura no disponible.'};
      this.spend(13);const old=this.s.cabinet[index];this.s.cabinet[index]={...candidate,portfolio:old.portfolio,fatigue:0};this.apply({stability:-1});
      this.record('cabinet',`Nuevo nombramiento: ${candidate.name}`,D.portfolios[index].name);return {ok:true,title:'Nombramiento confirmado',text:`${candidate.name} se incorpora al Consejo de Ministros.`};
    }
    diplomacy(type) {
      const options={europe:{cost:12,effects:{eu:7,business:2},title:'Cumbre europea'},trade:{cost:12,effects:{cash:-1,growth:0.25,business:3,eu:2},title:'Misión comercial'},climate:{cost:11,effects:{cash:-2,climate:5,eu:4},title:'Alianza por el clima'},aid:{cost:10,effects:{cash:-2,integrity:4,eu:3},title:'Cooperación humanitaria'}};
      const a=options[type];if(!a)return {error:'Acción diplomática no válida.'};if(this.s.diplomacyTurn===this.s.turn)return {error:'Ya has realizado una misión exterior este mes.'};
      const error=this.check(a.cost);if(error)return {error};this.spend(a.cost);this.s.diplomacyTurn=this.s.turn;this.apply(a.effects);this.record('diplomacy',a.title,'La iniciativa refuerza la posición exterior del país.');return {ok:true,title:a.title,text:'La iniciativa diplomática se ha completado.',effects:a.effects};
    }
    investRegion(id) {
      const r=this.s.regions.find(r=>r.id===id);if(!r)return {error:'Territorio no válido.'};if(this.s.territoryTurn===this.s.turn)return {error:'Ya se ha aprobado una inversión territorial este mes.'};
      const error=this.check(10);if(error)return {error};this.spend(10);this.s.territoryTurn=this.s.turn;r.approval=clamp(r.approval+9,5,95);this.apply({cash:-2,infrastructure:2,rural:1});
      this.record('territory',`Inversión en ${r.name}`,'Dos mil millones para servicios e infraestructuras locales.');return {ok:true,title:'Plan territorial aprobado',text:`El apoyo en ${r.name} aumenta 9 puntos.`,effects:{cash:-2,infrastructure:2}};
    }
    poll() {
      const a=this.s.metrics.approval;
      const own=clamp(29+(a-52)*0.54+this.s.campaign*0.55,8,61);
      const rest=this.s.parties.slice(1).map(p=>{const distance=Math.abs(p.ideology-this.s.ideology);return {id:p.id,weight:p.seats*(1+(52-a)*0.004*(distance+0.5))};});
      const total=rest.reduce((n,p)=>n+p.weight,0);
      return this.s.parties.map((p,i)=>({...p,vote:i===0?own:(100-own)*rest[i-1].weight/total}));
    }
    allocate(votes,noise=false) {
      const totals=Object.fromEntries(this.s.parties.map(p=>[p.id,0]));
      const voteTotals=Object.fromEntries(this.s.parties.map(p=>[p.id,0]));
      for(const r of this.s.regions){
        const local=votes.map(p=>({id:p.id,vote:p.vote*(p.id==='horizonte'?clamp(1+(r.approval-50)*0.012,0.35,1.6):p.id==='territorial'&&[8,14,15].includes(r.id)?1.8:1)*(noise?0.94+this.random()*0.12:1),seats:0}));
        const sum=local.reduce((n,p)=>n+p.vote,0);for(const p of local){p.vote=p.vote/sum*100;voteTotals[p.id]+=p.vote*r.seats/350;}
        for(let seat=0;seat<r.seats;seat++){
          const winner=local.filter(p=>p.vote>=3).reduce((best,p)=>!best||p.vote/(p.seats+1)>best.vote/(best.seats+1)?p:best,null);winner.seats++;
        }
        for(const p of local)totals[p.id]+=p.seats;
      }
      return votes.map(p=>({...p,seats:totals[p.id],vote:voteTotals[p.id]}));
    }
    callElection(early=false) {
      if(this.s.ended||this.s.election)return {error:'No puedes convocar elecciones ahora.'};
      if(early&&(this.s.turn-this.s.lastElection<6))return {error:'Debes gobernar al menos seis meses antes de adelantar las elecciones.'};
      if(early){const error=this.check(25);if(error)return {error};this.spend(25);}
      const result=this.allocate(this.poll(),true);for(const p of this.s.parties)p.seats=result.find(v=>v.id===p.id).seats;
      this.s.election={turn:this.s.turn,result};this.s.statistics.elections++;
      this.record('election','Las urnas han hablado',`${this.s.partyName} obtiene ${result[0].seats} escaños. Se abre la investidura.`);
      return {ok:true,election:true,title:'Resultados electorales',text:'Forma una mayoría para un nuevo mandato.'};
    }
    formGovernment(allies) {
      if(!this.s.election)return {error:'No hay una investidura pendiente.'};
      if(!Array.isArray(allies)||allies.some(id=>!this.s.parties.some(p=>p.id===id&&id!=='horizonte')))return {error:'Socios no válidos.'};
      const unique=[...new Set(allies)];let seats=this.s.parties[0].seats;
      for(const id of unique){const p=this.s.parties.find(p=>p.id===id);if(p.relation<45||Math.abs(p.ideology-this.s.ideology)>3)return {error:`${p.name} no acepta la investidura por falta de confianza o distancia ideológica.`};seats+=p.seats;}
      if(seats<176)return {error:`Reúnes ${seats} escaños. Necesitas al menos 176.`};
      this.s.coalition=unique;this.s.election=null;this.s.term++;this.s.lastElection=this.s.turn;this.s.capital=75;this.s.actions=3;this.s.campaign=0;
      this.s.metrics.stability=clamp(this.s.metrics.stability+12,45,90);this.s.promises=[];
      this.record('investiture',`Comienza tu mandato ${this.s.term}`,`Una nueva mayoría de ${seats} escaños respalda al Gobierno.`);
      return {ok:true,title:'Investidura conseguida',text:'Comienza una nueva legislatura. Tu historia continúa.'};
    }
    acceptDefeat() { if(!this.s.election)return {error:'No hay resultados pendientes.'};this.s.election=null;this.s.ended={reason:'Sin mayoría para la investidura',turn:this.s.turn};this.record('ending','El relevo democrático','Otro Gobierno asume la presidencia. Este es tu legado.');return {ok:true,title:'Fin del mandato',text:'Tu legado queda en la crónica.'}; }
    nextTurn() {
      if(this.s.ended)return {error:'Esta partida ha terminado.'};if(this.s.election)return {error:'Resuelve primero la investidura.'};
      if(this.event)return {error:'Resuelve primero el asunto de tu mesa. Si te falta capital, puedes aplazarlo.'};
      this.s.turn++;const m=this.s.metrics,b=this.s.budget,hard=this.s.difficulty==='dificil'?1.4:this.s.difficulty==='relajado'?0.65:1;
      const f=this.fiscal();const balance=f.balance/12;m.cash+=balance;
      if(m.cash<5){const borrowing=5-m.cash;m.debt+=borrowing/15;m.cash=5;}
      // El déficit se cubre primero con tesorería y después con deuda; no se cuenta dos veces.
      m.debt-=m.growth*0.035;
      if(m.cash>60){const repayment=(m.cash-60)*0.15;m.cash-=repayment;m.debt-=repayment/15;}
      const econ=this.s.cabinet[0];const efficiency=(econ.skill-econ.fatigue*0.3)/100;
      m.growth+=((2.1+(b.infrastructure-8)*0.06+(b.education-10)*0.035+(b.corporateTax-25)*-0.035+efficiency*0.2)-m.growth)*0.12+(this.random()-0.5)*0.25*hard;
      m.inflation+=(2.4-m.inflation)*0.075+(this.random()-0.5)*0.2*hard;m.unemployment+=(-m.growth*0.038+0.045)*hard;
      const funding={health:[b.health,17],education:[b.education,10],climate:[b.climate,5],security:[b.security,7],infrastructure:[b.infrastructure,8]};
      for(const [key,[value,base]]of Object.entries(funding))m[key]+=(value-base)*0.11-0.10*hard;
      m.housing-=0.16*hard;
      for(let i=0;i<this.s.cabinet.length;i++){
        const minister=this.s.cabinet[i];minister.fatigue=clamp(minister.fatigue+1.2,0,100);
        const key=D.portfolios[i].metric;if(key!=='growth')m[key]+=(minister.skill-minister.fatigue*0.35-65)*0.009;
        if(minister.loyalty<65&&minister.fatigue>65)m.stability-=0.3;
      }
      const economyMood=clamp((m.growth-1.5)*0.12-(m.inflation-2.5)*0.09-(m.unemployment-10)*0.035,-1,0.65);
      this.s.groups.workers+=economyMood+(m.health-60)*0.005;
      this.s.groups.youth+=economyMood+(m.housing-45)*0.012+(m.education-60)*0.005;
      this.s.groups.pensioners+=(b.welfare-28)*0.055+(m.health-60)*0.008-(m.inflation-2.5)*0.06;
      this.s.groups.business+=(m.growth-2)*0.15-(b.corporateTax-25)*0.025;
      this.s.groups.rural+=(m.infrastructure-60)*0.009;
      this.s.groups.public+=(m.health+m.education-120)*0.004;
      const integrityMood=(m.integrity-65)*0.008;for(const key of Object.keys(this.s.groups))this.s.groups[key]+=integrityMood-0.07*hard;
      this.s.campaign*=0.88;
      this.s.capital=clamp(this.s.capital+28+(m.stability-50)*0.12+(this.s.difficulty==='relajado'?10:0),0,100);this.s.actions=3;
      for(const p of this.s.parties)if(p.id!=='horizonte')p.relation-=this.s.coalition.includes(p.id)?0.35:0.15;
      for(const promise of this.s.promises)if(!promise.done&&this.s.turn>=promise.due){
        const p=this.s.parties.find(p=>p.id===promise.party),met=m[promise.metric]>=promise.target;promise.done=true;promise.met=met;
        p.relation+=met?12:-22;m.stability+=met?4:-8;
        this.record('pact',met?'Compromiso cumplido':'Una promesa pendiente',`${p.name}: ${D.metrics[promise.metric].name}. ${met?'El pacto se refuerza.':'La confianza se deteriora.'}`);
      }
      for(const p of this.s.parties)if(this.s.coalition.includes(p.id)&&p.relation<20){this.s.coalition=this.s.coalition.filter(id=>id!==p.id);m.stability-=10;this.record('crisis',`${p.name} abandona la coalición`,'El Gobierno pierde un socio parlamentario.');}
      m.stability+=(this.coalitionSeats>=176?0.25:-0.65);
      const completed=this.s.delayed.filter(p=>p.due<=this.s.turn);this.s.delayed=this.s.delayed.filter(p=>p.due>this.s.turn);
      for(const project of completed){this.apply(project.effects);this.record('project',project.label,'El proyecto entra en servicio.',{effects:project.effects});}
      for(const r of this.s.regions)r.approval+=(m.approval-r.approval)*0.06;
      this.recalculate();this.sample();
      if(m.stability<15&&this.coalitionSeats<176){this.s.ended={reason:'Una moción de censura pone fin a tu Gobierno',turn:this.s.turn};this.record('ending','El Congreso retira su confianza',this.s.ended.reason);return {ok:true,ended:true,title:'Fin del Gobierno',text:this.s.ended.reason};}
      if(m.debt>190){this.s.ended={reason:'La crisis de deuda obliga al Gobierno a dimitir',turn:this.s.turn};this.record('ending','Una crisis sin salida',this.s.ended.reason);return {ok:true,ended:true,title:'Crisis de deuda',text:this.s.ended.reason};}
      if(this.monthsRemaining===0)return this.callElection(false);
      let pool=D.events.filter(e=>!this.s.seen.slice(-12).includes(e.id)&&(!e.months||e.months.includes(this.date.getMonth())));if(!pool.length)pool=D.events.filter(e=>!e.months);
      const ev=pool[Math.floor(this.random()*pool.length)];this.s.activeEvent=ev.id;this.s.seen.push(ev.id);if(this.s.seen.length>70)this.s.seen.shift();
      return {ok:true,title:'Comienza un nuevo mes',text:completed.length?`${completed.length} proyecto(s) completado(s). Consulta la crónica.`:'Nuevos datos, nuevos desafíos. El Consejo espera tu decisión.'};
    }
    deferEvent() {
      if(!this.event)return {error:'No hay un asunto que aplazar.'};if(this.s.ended||this.s.election)return {error:'No puedes aplazar ahora.'};
      this.record('decision',`Aplazado: ${this.event.title}`,'La falta de respuesta reduce la confianza.');this.s.activeEvent=null;
      this.apply({stability:-3,workers:-1,youth:-1});return {ok:true,title:'Asunto aplazado',text:'La estabilidad baja 3 puntos. Ya puedes avanzar de mes.'};
    }
    export() {return JSON.stringify({game:'la-moncloa',version:1,state:this.s},null,2);}
    static fromJSON(text) {
      if(typeof text!=='string'||text.length>3000000)throw new Error('El archivo de partida es demasiado grande.');
      let payload;try{payload=JSON.parse(text);}catch{throw new Error('El archivo no contiene JSON válido.');}
      const s=payload?.state;
      if(payload?.game!=='la-moncloa'||payload.version!==1||!s||s.version!==1)throw new Error('Este archivo no es una partida compatible.');
      const finite=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
      const str=(v,n)=>typeof v==='string'&&v.length<=n;
      if(!str(s.name,40)||!str(s.partyName,35)||!finite(s.turn,0,2400)||!Number.isInteger(s.turn)||!finite(s.seed,1,2147483646)||!finite(s.capital,0,100)||!finite(s.actions,0,3)||!finite(s.term,1,100)||!finite(s.startYear,1900,2100)||!finite(s.ideology,-2,2)||!['normal','relajado','dificil'].includes(s.difficulty)||!D.scenarios.some(x=>x.id===s.scenario))throw new Error('La partida contiene datos de cabecera no válidos.');
      if(!s.metrics||Object.keys(D.metrics).some(k=>!finite(s.metrics[k],-1000,1000))||!s.groups||D.groups.some(g=>!finite(s.groups[g.id],0,100)))throw new Error('Los indicadores de la partida no son válidos.');
      if(!Array.isArray(s.parties)||s.parties.length!==6||s.parties.some((p,i)=>p.id!==D.parties[i].id||!finite(p.seats,0,350)||!Number.isInteger(p.seats)||!finite(p.relation,0,100)||!finite(p.ideology,-3,3))||s.parties.reduce((n,p)=>n+p.seats,0)!==350)throw new Error('El reparto del Congreso no es válido.');
      if(!Array.isArray(s.regions)||s.regions.length!==19||s.regions.some((r,i)=>r.id!==i||!finite(r.approval,0,100)))throw new Error('Los territorios no son válidos.');
      if(!Array.isArray(s.cabinet)||s.cabinet.length!==6||s.cabinet.some((m,i)=>!D.ministers.some(x=>x.name===m.name)||m.portfolio!==D.portfolios[i].id||!finite(m.fatigue,0,100)||!finite(m.skill,0,100)||!finite(m.loyalty,0,100)))throw new Error('El gabinete no es válido.');
      const numericFields=['lastElection','budgetTurn','lawTurn','campaignTurn','diplomacyTurn','territoryTurn','campaign'];if(numericFields.some(k=>!finite(s[k],-1,2400))||s.lastElection>s.turn)throw new Error('Los turnos no son válidos.');
      if(!s.budget||Object.keys(new Simulation({seed:1}).s.budget).some(k=>!finite(s.budget[k],0,50)))throw new Error('El presupuesto no es válido.');
      const validEffects=e=>e&&typeof e==='object'&&!Array.isArray(e)&&Object.entries(e).every(([k,v])=>(Object.hasOwn(D.metrics,k)||D.groups.some(g=>g.id===k))&&finite(v,-100,100));
      const arr=(v,max)=>Array.isArray(v)&&v.length<=max;
      if(!arr(s.history,500)||s.history.some(h=>!str(h.title,300)||!str(h.text,2000)||!str(h.type,40)||!finite(h.turn,0,2400))||!arr(s.series,240)||s.series.some(v=>!finite(v.turn,0,2400)||['approval','growth','unemployment','debt'].some(k=>!finite(v[k],-100,1000))))throw new Error('La crónica no es válida.');
      if(!arr(s.delayed,100)||s.delayed.some(p=>!finite(p.due,0,2500)||!str(p.label,200)||!validEffects(p.effects))||!arr(s.promises,100)||s.promises.some(p=>!D.parties.some(x=>x.id===p.party)||!(p.metric in D.metrics)||!finite(p.target,-100,1000)||!finite(p.due,0,2500)))throw new Error('Los proyectos o pactos no son válidos.');
      if(!arr(s.laws,20)||s.laws.some(id=>!D.laws.some(l=>l.id===id))||!arr(s.coalition,5)||s.coalition.some(id=>!D.parties.slice(1).some(p=>p.id===id))||!arr(s.missions,10)||s.missions.some(id=>!D.missions.some(m=>m.id===id))||!arr(s.seen,100)||s.seen.some(id=>!D.events.some(e=>e.id===id))||(s.activeEvent!==null&&!D.events.some(e=>e.id===s.activeEvent)))throw new Error('La partida contiene referencias desconocidas.');
      if(!s.settings||!['auto','low','high'].includes(s.settings.quality)||typeof s.settings.audio!=='boolean'||typeof s.settings.motion!=='boolean'||!s.statistics||['decisions','laws','elections'].some(k=>!finite(s.statistics[k],0,100000)))throw new Error('Los ajustes no son válidos.');
      if(s.election&&(!finite(s.election.turn,0,2400)||!arr(s.election.result,6)||s.election.result.length!==6||s.election.result.some((p,i)=>p.id!==D.parties[i].id||p.seats!==s.parties[i].seats||!finite(p.seats,0,350)||!Number.isInteger(p.seats)||!finite(p.vote,0,100))||Math.abs(s.election.result.reduce((n,p)=>n+p.vote,0)-100)>0.001))throw new Error('La elección guardada no es válida.');
      if(s.ended&&(!str(s.ended.reason,300)||!finite(s.ended.turn,0,2400)))throw new Error('El final no es válido.');
      const sim=new Simulation({seed:1});sim.s=s;
      // Restaurar datos estáticos impide que una importación cambie las reglas o el HTML.
      sim.s.metrics=Object.fromEntries(Object.keys(D.metrics).map(k=>[k,s.metrics[k]]));
      sim.s.groups=Object.fromEntries(D.groups.map(g=>[g.id,s.groups[g.id]]));
      sim.s.parties=s.parties.map((p,i)=>({...D.parties[i],seats:p.seats,relation:p.relation,ideology:p.ideology,name:i===0?s.partyName:D.parties[i].name}));
      sim.s.regions=s.regions.map((r,i)=>({...D.regions[i],approval:r.approval}));
      sim.s.cabinet=s.cabinet.map((m,i)=>({...D.ministers.find(x=>x.name===m.name),portfolio:D.portfolios[i].id,fatigue:m.fatigue}));
      sim.s.election=s.election?{turn:s.election.turn,result:s.election.result.map((p,i)=>({...sim.s.parties[i],seats:p.seats,vote:p.vote}))}:null;
      sim.recalculate();return sim;
    }
  }
  G.SimEngine=Simulation;
})(globalThis);
