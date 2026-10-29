// Interface do dashboard; os dados são carregados antes por report-data.js.
(()=>{
const root=document.getElementById('omotor-report');
const data=window.OMOTOR_REPORT_DATA;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(v,d=0)=>v===null||v===undefined?'n.d.':Number(v).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const pct=(v,d=1)=>v===null||v===undefined?'n.d.':fmt(v*100,d)+'%';
const hours=v=>fmt(v,1)+' h';
const stat=(label,value,note)=>`<div class="or-stat"><span class="or-label">${esc(label)}</span><span class="or-value">${esc(value)}</span><span class="or-stat-note">${esc(note)}</span></div>`;
const bars=(rows,total)=>`<div class="or-bars">${rows.map(r=>`<div><div class="or-bar-label"><span>${esc(r.label)}</span><span class="or-number">${fmt(r.value)}${total?' · '+pct(r.value/total):''}</span></div><div class="or-track"><div class="or-fill" style="width:${Math.min(100,100*r.value/(total||Math.max(...rows.map(x=>x.value),1)))}%"></div></div></div>`).join('')}</div>`;
const table=(headers,rows)=>`<div class="or-table-wrap"><table><thead><tr>${headers.map((h,i)=>`<th${i?' class="or-num"':''}>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td${i?' class="or-num"':''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const sourceNote=(d)=>`<details><summary class="cursor-interaction">Fontes e critérios desta visão</summary><div>${d.notes.map(n=>`<p class="or-note">${esc(n)}</p>`).join('')}<p class="or-note">Fonte: ${esc(d.source)}.</p></div></details>`;
function periodView(key){
 const d=data[key],k=d.kpis,t=d.times,isAnnual=key==='annual';
 let html=`<div class="or-section-head"><h2>Atendimento ${isAnnual?'no período':'no mês'}</h2><span class="or-context">Situação registrada na base</span></div><div class="or-stats">${stat('Chamados registrados',fmt(k.tickets),isAnnual?'Abertos de out/25 a set/26':'Abertos em setembro')}${stat('Finalizados',fmt(k.closed),pct(k.closed/k.tickets)+' dos chamados')}${stat('Em aberto',fmt(k.open),'No recorte desta visão')}${stat('Taxa de finalização',pct(k.closed/k.tickets),fmt(k.closed)+' de '+fmt(k.tickets)+' chamados')}</div><div class="or-strip"><span>Incidentes: <strong>${fmt(k.incidents)}</strong></span><span>Problemas: <strong>${fmt(k.problems)}</strong></span><span>Projetos com chamados: <strong>${fmt(d.projects.length)}</strong></span></div>`;
 if(isAnnual){
   const max=Math.max(...d.timeline.map(x=>x.tickets),1);
   html+=`<div class="or-grid"><section><h3>Chamados ao longo dos 12 meses</h3><div class="or-timeline"><div class="or-time-row or-time-header"><span>Mês</span><span>Volume de chamados</span><span>Total</span><span>Incid.</span></div>${d.timeline.map(r=>`<div class="or-time-row"><span>${esc(r.month)}</span><div class="or-track"><div class="or-fill" style="width:${r.tickets/max*100}%"></div></div><span class="or-num">${fmt(r.tickets)}</span><span class="or-num">${fmt(r.incidents)}</span></div>`).join('')}</div></section><section class="or-panel"><h3>Composição das demandas</h3>${bars(d.categories,k.tickets)}</section></div>`;
 }else{
   html+=`<div class="or-grid"><section><h3>Composição das demandas</h3>${bars(d.categories,k.tickets)}</section><section class="or-panel"><h3>Incidentes e problemas</h3>${d.incidentFacts.map(r=>`<div class="or-fact-row"><span>${esc(r.label)}</span><span class="or-number">${esc(r.value)}</span></div>`).join('')}<div class="or-attention">${esc(d.attention)}</div></section></div>`;
 }
 html+=`<section class="or-section"><div class="or-section-head"><h2>Tempos de atendimento</h2><span class="or-context">Tempos corridos · horas</span></div><div class="or-stats three">${stat('1ª resposta · mediana',hours(t.firstMedian),'P90: '+hours(t.firstP90))}${stat('Resolução · mediana',hours(t.resolutionMedian),'P90: '+hours(t.resolutionP90))}${stat('Resolução · média',hours(t.resolutionMean),'Base: '+fmt(k.closed)+' finalizados')}</div><p class="or-note">Tempo decorrido, sem equivalência com horas trabalhadas. O arquivo não estabelece meta de SLA.</p><details><summary class="cursor-interaction">Detalhar tempos por categoria</summary><div>${table(['Categoria','Chamados','Resolução média (h)','Tempo decorrido somado (h)'],d.categories.map(r=>[esc(r.label),fmt(r.value),fmt(r.resolutionMeanHours,1),fmt(r.resolutionAccumulatedHours,1)]))}<p class="or-note">1ª resposta média: ${hours(t.firstMean)}. Tempos de resolução somados: ${hours(t.resolutionAccumulated)}. A soma representa durações dos chamados, não esforço de trabalho. P90 é o tempo em que 90% das observações ficam abaixo ou igual.</p></div></details></section>`;
 html+=`<section class="or-section"><div class="or-section-head"><h2>Distribuição do atendimento</h2><span class="or-context">${fmt(d.projects.length)} projetos com chamados</span></div><div class="or-grid"><div class="or-panel"><h3>Chamados por projeto · 5 maiores</h3>${bars(d.projects.slice(0,5),k.tickets)}</div><div class="or-panel"><h3>Nível dos chamados finalizados</h3>${bars(d.levels,k.closed)}${isAnnual?'<p class="or-note">635 finalizados sem classificação de nível.</p>':''}</div></div><details><summary class="cursor-interaction">Detalhamento dos ${d.projects.length} projetos de atendimento</summary><div>${table(['Projeto','Chamados','Finalizados','Abertos','Resolução média (h)'],d.projects.map(r=>[esc(r.label),fmt(r.value),fmt(r.closed),fmt(r.open),fmt(r.resolutionMeanHours,1)]))}</div></details><details><summary class="cursor-interaction">Sistemas informados</summary><div>${table(['Sistema','Chamados','Resolução média (h)'],d.systems.map(r=>[esc(r.label),fmt(r.value),fmt(r.resolutionMeanHours,1)]))}${isAnnual?'<p class="or-note">748 de 867 chamados não têm sistema informado.</p>':''}</div></details><details><summary class="cursor-interaction">Incidentes, problemas e soluções por projeto</summary><div>${isAnnual?d.incidentFacts.map(r=>`<div class="or-fact-row"><span>${esc(r.label)}</span><span class="or-number">${esc(r.value)}</span></div>`).join(''):''}${table(['Projeto','Incidentes','Problemas','Resolução média · incidentes (h)'],d.issueProjects.map(r=>[esc(r.project),fmt(r.incidents),fmt(r.problems),fmt(r.incidentResolutionMeanHours,1)]))}</div></details></section>`;
 html+=`<section class="or-section"><div class="or-section-head"><h2>Utilização ${isAnnual?'nos últimos 12 meses':'em setembro'}</h2><span class="or-context">Consolidado do dashboard · ${d.usage.projects} projetos</span></div><div class="or-stats three">${stat('Mensagens de usuário',fmt(d.usage.messages),isAnnual?'Soma no período':'Soma dos projetos no mês')}${stat(isAnnual?'Soma de usuários mensais':'Usuários por projeto · soma',fmt(d.usage.users),isAnnual?'Sem deduplicação entre meses/projetos':'Sem deduplicação entre projetos')}${stat('Projetos com dados de uso',fmt(d.usage.projects),'Escopo desta aba do arquivo')}</div>`;
 if(isAnnual)html+=`<details><summary class="cursor-interaction">Ver utilização mês a mês</summary><div>${table(['Mês','Mensagens','Usuários · soma','Msg./usuário'],d.usage.timeline.map(r=>[esc(r.month),fmt(r.messages),fmt(r.users),fmt(r.messages/r.users,2)]))}</div></details>`;
 html+=sourceNote(d)+'</section>';
 root.querySelector('#or-'+key).innerHTML=html;
}
periodView('monthly');periodView('annual');
const selector=root.querySelector('#or-project-selector');
data.projects.projects.forEach((p,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=p.name;selector.appendChild(option);});
const periodSelect=root.querySelector('#or-project-period');
let active='monthly';
function renderProjects(){
 const period=periodSelect.value,annual=period==='total_12m',chosen=selector.value,all=chosen==='all',ps=all?data.projects.projects:[data.projects.projects[Number(chosen)]];
 const sum=(field)=>ps.reduce((a,p)=>a+(p.kpis[field][period]??0),0),messages=sum('messages'),users=sum('users');
 const name=all?'Uso dos 18 projetos':ps[0].name;
 let html=`<div class="or-project-summary"><h2>${esc(name)}</h2><span class="or-context">${annual?'Outubro/2025 a setembro/2026':'Setembro/2026'} · fonte exclusiva: aba Uso por Projeto</span></div><div class="or-stats three">${stat('Mensagens de usuário',fmt(messages),annual?'Acumulado dos meses disponíveis':'Volume do mês selecionado')}${stat(annual?'Soma de usuários mensais':all?'Usuários por projeto · soma':'Usuários do projeto',fmt(users),annual?'Não representa pessoas únicas no ano':all?'Sem deduplicação entre projetos':'Contagem mensal deste projeto')}${stat(all?'Projetos neste recorte':annual?'Meses com dados':'Mensagens por usuário',all?fmt(ps.length):annual?fmt(ps[0].months_available.messages)+' de 12':fmt(messages/users,2),all?'Escopo da aba Uso por Projeto':annual?'Meses indisponíveis preservados':'Mensagens ÷ usuários do projeto')}</div>`;
 if(all){
  const sorted=ps.map((p,i)=>({p,i})).sort((a,b)=>(b.p.kpis.messages[period]??0)-(a.p.kpis.messages[period]??0));
  const max=Math.max(...ps.map(p=>p.kpis.messages[period]??0),1);
  html+=`<section class="or-section"><div class="or-section-head"><h2>Mensagens por projeto</h2><span class="or-context">Selecione um projeto para abrir seus dados</span></div>${table(['Projeto','Mensagens',annual?'Usuários · soma mensal':'Usuários','Msg./usuário'],sorted.map(({p,i})=>{const m=p.kpis.messages[period],u=p.kpis.users[period];return [`<button type="button" class="or-project-name cursor-interaction" data-project-index="${i}">${esc(p.name)}</button>`,`${fmt(m)}<div class="or-mini" aria-hidden="true"><span style="width:${100*m/max}%"></span></div>`,fmt(u),u?fmt(m/u,2):'n.d.'];}))}</section>`;
 }else if(annual){
  const p=ps[0];
  html+=`<section class="or-section"><div class="or-section-head"><h2>Histórico mensal do projeto</h2><span class="or-context">n.d. = dado não disponível</span></div>${table(['Mês','Mensagens','Usuários','Msg./usuário'],p.history.map(r=>[esc(r.month),fmt(r.messages),fmt(r.users),fmt(r.messages_per_user,2)]))}<details><summary class="cursor-interaction">Referência mensal do período</summary><div>${table(['Indicador','Referência mensal'],[['Mensagens',fmt(p.kpis.messages.monthly_reference_12m,1)],['Usuários',fmt(p.kpis.users.monthly_reference_12m,1)],['Mensagens por usuário',fmt(p.kpis.messages_per_user.monthly_reference_12m,2)]] )}<p class="or-note">Mensagens e usuários: média dos meses com dados. Mensagens por usuário: razão dos totais disponíveis.</p></div></details></section>`;
 }else{
  const p=ps[0];html+=`<section class="or-section or-panel"><h3>Indicadores de setembro</h3><div class="or-fact-row"><span>Participação nas mensagens dos 18 projetos</span><span class="or-number">${pct(messages/data.projects.projects.reduce((a,x)=>a+(x.kpis.messages.september??0),0))}</span></div><p class="or-note">Esta seleção exibe apenas setembro. O histórico do projeto está na opção “Últimos 12 meses” do seletor de período.</p></section>`;
 }
 html+=`<details><summary class="cursor-interaction">Escopo, fontes e critérios</summary><div><p class="or-note">Esta visão preserva os 18 projetos da aba Uso por Projeto. O dashboard dos últimos 12 meses contém 19 projetos; seus totais pertencem a outro escopo.</p><p class="or-note">Usuários somados entre projetos ou meses não equivalem a pessoas únicas. Valores indisponíveis são apresentados como n.d., sem conversão em zero.</p>${!all&&ps[0].name.includes('Checklist')&&annual?'<p class="or-note">Março/2026 registra 28.291 usuários no projeto Checklist. O valor foi preservado e requer validação antes de interpretar variações.</p>':''}<p class="or-note">Fonte: Relatório Setembro(1).xlsx · Uso por Projeto.</p></div></details>`;
 root.querySelector('#or-project-content').innerHTML=html;
 root.querySelectorAll('[data-project-index]').forEach(b=>b.addEventListener('click',()=>{selector.value=b.dataset.projectIndex;renderProjects();}));
 if(active==='projects')setHero('projects');
}
function setHero(key){
 const titles={monthly:['Visão mensal','Setembro em perspectiva.','Atendimento e utilização no mês de setembro.','01 a 30 de setembro de 2026'],annual:['Visão histórica','Doze meses em perspectiva.','Indicadores acumulados e evolução ao longo do período.','Outubro/2025 a setembro/2026'],projects:['Visão por projeto','Mensagens por projeto.','Utilização detalhada dos 18 projetos desta aba.',periodSelect.value==='september'?'Setembro de 2026':'Outubro/2025 a setembro/2026']};
 const v=titles[key];['or-eyebrow','or-title','or-sub','or-period'].forEach((id,i)=>root.querySelector('#'+id).textContent=v[i]);
 root.querySelector('#or-footer').textContent='Fonte: Relatório Setembro(1).xlsx · '+(key==='monthly'?'Dashboard - Setembro':key==='annual'?'Dashboard - Últimos 12 meses':'Uso por Projeto')+'.';
}
const tabs=Array.from(root.querySelectorAll('[role="tab"]'));
function show(tab){active=tab.id.replace('or-tab-','');tabs.forEach(b=>b.setAttribute('aria-selected',String(b===tab)));root.querySelectorAll('[role="tabpanel"]').forEach(p=>p.hidden=p.id!=='or-'+active);setHero(active);}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>show(tab));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();show(tabs[n]);tabs[n].focus();});});
selector.addEventListener('change',renderProjects);periodSelect.addEventListener('change',renderProjects);renderProjects();setHero('monthly');
})();

(()=>{
  const root=document.getElementById('omotor-report');
  const template=root.querySelector('#or-focus-template');
  const monthly=root.querySelector('#or-monthly');
  monthly.querySelector('.or-strip').after(template.content.cloneNode(true));
})();

(()=>{
  const root=document.getElementById('omotor-report');
  const template=root.querySelector('#or-annual-focus-template');
  const annual=root.querySelector('#or-annual');
  annual.querySelector('.or-strip').after(template.content.cloneNode(true));
  root.querySelector('#or-tab-annual').click();
})();

(()=>{
  const root=document.getElementById('omotor-report');
  const data=window.OMOTOR_REPORT_DATA.projects.projects;
  const selector=root.querySelector('#or-project-selector');
  const content=root.querySelector('#or-project-content');
  const template=root.querySelector('#or-project-charts-template');
  const valid=v=>v!==null&&v!==undefined&&Number.isFinite(v);
  const fmt=(v,d=0)=>valid(v)?v.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d}):'n.d.';
  const compact=v=>Math.abs(v)>=1000000?fmt(v/1000000,1)+' mi':Math.abs(v)>=1000?fmt(v/1000,Math.abs(v)<10000?1:0)+' mil':fmt(v,Math.abs(v)>0&&Math.abs(v)<1?1:0);
  const signed=v=>(v>=0?'+':'')+fmt(v,1)+'%';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let resizeObserver=null,drawQueued=false;
  const visible={messages:true,users:true,messages_per_user:true};
  function installCharts(){
    if(selector.value==='all'){
      if(resizeObserver)resizeObserver.disconnect();
      return;
    }
    if(content.querySelector('#or-project-chart-block'))return;
    if(resizeObserver)resizeObserver.disconnect();
    const p=data[Number(selector.value)];
    if(!p)return;
    const monthNote=content.querySelector('.or-section.or-panel .or-note');
    if(monthNote)monthNote.textContent='Os cartões desta seleção exibem setembro. A tabela do histórico mensal está na opção “Últimos 12 meses” do seletor de período.';
    content.querySelector('.or-stats').after(template.content.cloneNode(true));
    const block=content.querySelector('#or-project-chart-block');
    const tip=block.querySelector('.or-project-chart-tip');
    let pinned=false;
    const comparison=block.querySelector('[data-project-chart="comparison"]');
    const history=block.querySelector('[data-project-chart="history"]');
    block.querySelector('[data-chart-source-note]').textContent='Referência: média mensal de mensagens e usuários nos meses disponíveis; msg./usuário = razão dos totais. Meses sem dados permanecem como n.d.'+(p.name.includes('Checklist')?' Março/2026: 28.291 usuários, conforme o arquivo.':'');
    function hideTip(){if(!pinned)tip.hidden=true;}
    function showTip(event,title,rows){
      tip.innerHTML='<strong>'+esc(title)+'</strong>'+rows.map(([label,value])=>'<div class="or-project-chart-tip-row"><span>'+esc(label)+'</span><span>'+esc(value)+'</span></div>').join('');
      tip.hidden=false;
      const bounds=block.getBoundingClientRect();
      tip.style.left=Math.max(6,Math.min(event.clientX-bounds.left+12,bounds.width-tip.offsetWidth-6))+'px';
      tip.style.top=Math.max(0,Math.min(event.clientY-bounds.top-tip.offsetHeight-12,bounds.height-tip.offsetHeight))+'px';
    }
    function svgFor(target,height,label){
      const width=target.getBoundingClientRect().width;
      if(width<100)return null;
      target.replaceChildren();
      const svg=d3.select(target).append('svg').attr('viewBox','0 0 '+width+' '+height).attr('role','img').attr('aria-label',label);
      svg.append('title').text(label);
      return {svg,width,height};
    }
    function frame(svg,l,t,w,h){
      svg.append('rect').attr('data-chart-frame','').attr('x',l).attr('y',t).attr('width',w).attr('height',h).attr('fill','none').attr('stroke','var(--or-line)');
    }
    function grid(svg,scale,left,right){
      const g=svg.append('g').attr('class','or-chart-grid');
      scale.ticks(4).forEach(v=>g.append('line').attr('x1',left).attr('x2',right).attr('y1',scale(v)).attr('y2',scale(v)));
    }
    function axisTitle(svg,text,x,y,axis,anchor='start'){
      svg.append('text').attr('class','axis-title').attr('data-axis',axis).attr('x',x).attr('y',y).attr('text-anchor',anchor).text(text);
    }
    function drawComparison(){
      const chart=svgFor(comparison,310,'Comparativo de setembro de 2026 com a referência dos últimos 12 meses: '+p.name+'.');
      if(!chart)return;
      const {svg,width,height}=chart;
      const margin={top:40,right:12,bottom:54,left:56},bottom=height-margin.bottom,right=width-margin.right;
      const metrics=[['messages_per_user','Msg./usuário',2],['messages','Mensagens',0],['users','Usuários',0]].map(([key,label,decimals])=>{
        const k=p.kpis[key],index=valid(k.september)&&valid(k.monthly_reference_12m)&&k.monthly_reference_12m>0?k.september/k.monthly_reference_12m*100:null;
        return {key,label,decimals,current:k.september,reference:k.monthly_reference_12m,index,delta:valid(index)?index-100:null};
      });
      const x=d3.scaleBand().domain(metrics.map(m=>m.key)).range([margin.left,right]).padding(.18);
      const sub=d3.scaleBand().domain(['current','reference']).range([0,x.bandwidth()]).padding(.1);
      const y=d3.scaleLinear().domain([0,Math.max(100,d3.max(metrics,m=>m.index)||0)*1.28]).nice(4).range([bottom,margin.top]);
      grid(svg,y,margin.left,right);frame(svg,margin.left,margin.top,right-margin.left,bottom-margin.top);
      svg.append('g').attr('class','or-chart-axis').attr('transform','translate('+margin.left+',0)').call(d3.axisLeft(y).ticks(4).tickFormat(v=>fmt(v)+'%').tickSize(0).tickPadding(8));
      const xaxis=svg.append('g').attr('class','or-chart-axis').attr('transform','translate(0,'+bottom+')').call(d3.axisBottom(x).tickSize(0).tickPadding(12).tickFormat(key=>metrics.find(m=>m.key===key).label));
      xaxis.selectAll('.domain').remove();
      if(width<370)xaxis.selectAll('.tick text').filter(key=>key==='messages_per_user').text('Msg./').append('tspan').attr('x',0).attr('dy',12).text('usuário');
      axisTitle(svg,'Índice (%)',margin.left,18,'y');
      metrics.forEach(m=>{
        const center=x(m.key)+x.bandwidth()/2;
        for(const kind of ['current','reference']){
          const value=kind==='current'?m.index:100;
          if(!valid(value))continue;
          const bx=x(m.key)+sub(kind),bw=sub.bandwidth(),by=y(value);
          svg.append('rect').attr('x',bx).attr('y',by).attr('width',bw).attr('height',bottom-by).attr('fill',kind==='current'?'var(--or-chart-blue)':'var(--or-chart-reference)');
          const absolute=kind==='current'?fmt(m.current,m.decimals):fmt(m.reference,m.decimals===2?2:1);
          const text=width>=490?absolute:fmt(value,1)+'%';
          svg.append('text').attr('x',bx+bw/2).attr('y',Math.max(margin.top+12,by-(kind==='current'&&width>=490?23:8))).attr('text-anchor','middle').text(text);
          if(kind==='current'&&width>=490)svg.append('text').attr('x',bx+bw/2).attr('y',by-8).attr('text-anchor','middle').text(signed(m.delta));
        }
        const hit=svg.append('rect').attr('data-chart-hit','').attr('x',Math.max(margin.left,center-Math.max(x.bandwidth(),44)/2)).attr('y',margin.top).attr('width',Math.max(x.bandwidth(),44)).attr('height',bottom-margin.top).attr('fill','transparent');
        const show=event=>showTip(event,m.label,[['Setembro/2026',fmt(m.current,m.decimals)],['Referência 12 meses',fmt(m.reference,m.decimals===2?2:1)],['Variação',valid(m.delta)?signed(m.delta):'n.d.']]);
        hit.on('pointermove',event=>{if(!pinned)show(event)}).on('pointerleave',hideTip).on('click',event=>{pinned=!pinned;show(event)});
      });
      axisTitle(svg,'Indicadores',margin.left+(right-margin.left)/2,height-4,'x','middle');
    }
    function drawHistory(){
      const chart=svgFor(history,360,'Mensagens de usuário, usuários únicos e média de mensagens por usuário, de outubro de 2025 a setembro de 2026, para '+p.name+'. Meses indisponíveis são preservados.');
      if(!chart)return;
      const {svg,width,height}=chart,rows=p.history;
      const margin={top:36,right:50,bottom:55,left:60},bottom=height-margin.bottom,right=width-margin.right,plotWidth=right-margin.left,slot=plotWidth/rows.length;
      const indices=rows.map((r,i)=>i);
      const x=d3.scalePoint().domain(indices).range([margin.left+slot/2,right-slot/2]);
      const volumes=rows.flatMap(r=>[visible.messages?r.messages:null,visible.users?r.users:null]).filter(valid);
      const ratios=rows.map(r=>r.messages_per_user).filter(valid);
      const y=d3.scaleLinear().domain([0,Math.max(1,d3.max(volumes)||0)*1.2]).nice(4).range([bottom,margin.top]);
      const yr=d3.scaleLinear().domain([0,Math.max(1,d3.max(ratios)||0)*1.18]).nice(4).range([bottom,margin.top]);
      grid(svg,y,margin.left,right);frame(svg,margin.left,margin.top,plotWidth,bottom-margin.top);
      svg.append('g').attr('class','or-chart-axis').attr('transform','translate('+margin.left+',0)').call(d3.axisLeft(y).ticks(4).tickSize(0).tickPadding(7).tickFormat(compact));
      svg.append('g').attr('class','or-chart-axis').attr('transform','translate('+right+',0)').call(d3.axisRight(yr).ticks(4).tickSize(0).tickPadding(7).tickFormat(v=>fmt(v,v<1?1:0)));
      const ticks=width>=700?indices:width>=450?indices.filter(i=>i%2===0||i===11):[0,4,8,11];
      svg.append('g').attr('class','or-chart-axis').attr('transform','translate(0,'+bottom+')').call(d3.axisBottom(x).tickValues(ticks).tickSize(0).tickPadding(12).tickFormat(i=>rows[i].month.replace('/20','/')));
      axisTitle(svg,'Quantidade',margin.left,16,'y');axisTitle(svg,'Msg./usuário',right,16,'y-right','end');axisTitle(svg,'Mês',margin.left+plotWidth/2,height-5,'x','middle');
      const used=[],pendingLabels=[];
      function label(text,cx,cy){
        if(width<740)return;
        pendingLabels.push({text,cx,cy});
      }
      if(visible.messages)rows.forEach((r,i)=>{
        if(!valid(r.messages)){svg.append('text').attr('x',x(i)).attr('y',bottom-8).attr('text-anchor','middle').text('n.d.');return;}
        const bw=Math.max(3,slot*.68);
        svg.append('rect').attr('x',x(i)-bw/2).attr('y',y(r.messages)).attr('width',bw).attr('height',bottom-y(r.messages)).attr('fill','var(--or-chart-blue)');
        label(fmt(r.messages),x(i),y(r.messages)-9);
      });
      for(const [key,scale,color,shape] of [['users',y,'var(--or-chart-users)','circle'],['messages_per_user',yr,'var(--or-chart-ratio)','diamond']]){
        if(!visible[key])continue;
        const line=d3.line().defined(r=>valid(r[key])).x((r,i)=>x(i)).y(r=>scale(r[key]));
        svg.append('path').datum(rows).attr('d',line).attr('fill','none').attr('stroke',color).attr('stroke-width',2.5);
        rows.forEach((r,i)=>{
          if(!valid(r[key]))return;
          if(shape==='circle')svg.append('circle').attr('cx',x(i)).attr('cy',scale(r[key])).attr('r',2.5).attr('fill',color);
          else svg.append('path').attr('d',d3.symbol().type(d3.symbolDiamond).size(24)()).attr('transform','translate('+x(i)+','+scale(r[key])+')').attr('fill',color);
          label(fmt(r[key],key==='messages_per_user'?2:0),x(i),scale(r[key])-10);
        });
      }
      pendingLabels.forEach(({text,cx,cy})=>{
        const node=svg.append('text').attr('x',cx).attr('text-anchor','middle').text(text);
        for(const candidate of [cy,cy+26]){
          node.attr('y',candidate);
          const box=node.node().getBBox();
          if(box.x<margin.left||box.x+box.width>right||box.y<margin.top||box.y+box.height>bottom||used.some(b=>box.x<b.x+b.width+4&&box.x+box.width+4>b.x&&box.y<b.y+b.height+3&&box.y+box.height+3>b.y))continue;
          used.push(box);node.attr('paint-order','stroke').attr('stroke','var(--or-panel)').attr('stroke-width',4).attr('stroke-linejoin','round');return;
        }
        node.remove();
      });
      const guide=svg.append('line').attr('y1',margin.top).attr('y2',bottom).attr('stroke','var(--or-muted)').attr('stroke-width',1).attr('stroke-dasharray','3 3').attr('visibility','hidden');
      rows.forEach((r,i)=>{
        const hit=svg.append('rect').attr('data-chart-hit','').attr('x',margin.left+i*slot).attr('y',margin.top).attr('width',slot).attr('height',bottom-margin.top).attr('fill','transparent');
        const show=event=>{
          guide.attr('x1',x(i)).attr('x2',x(i)).attr('visibility','visible');
          const values=[];
          if(visible.messages)values.push(['Mensagens',fmt(r.messages)]);
          if(visible.users)values.push(['Usuários únicos',fmt(r.users)]);
          if(visible.messages_per_user)values.push(['Msg./usuário',fmt(r.messages_per_user,2)]);
          showTip(event,r.month,values);
        };
        hit.on('pointermove',event=>{if(!pinned)show(event)}).on('pointerleave',()=>{if(!pinned)guide.attr('visibility','hidden');hideTip()}).on('click',event=>{pinned=!pinned;show(event)});
      });
    }
    function redraw(){if(!block.isConnected)return;pinned=false;tip.hidden=true;drawComparison();drawHistory();}
    block.querySelectorAll('[data-chart-series]').forEach(button=>{
      button.setAttribute('aria-pressed',String(visible[button.dataset.chartSeries]));
      button.addEventListener('click',()=>{
        const key=button.dataset.chartSeries;
        if(visible[key]&&Object.values(visible).filter(Boolean).length===1)return;
        visible[key]=!visible[key];button.setAttribute('aria-pressed',String(visible[key]));pinned=false;tip.hidden=true;drawHistory();
      });
    });
    let lastWidth=0;
    resizeObserver=new ResizeObserver(()=>{
      const width=block.getBoundingClientRect().width;
      if(width===lastWidth||width<100)return;lastWidth=width;
      if(drawQueued)return;drawQueued=true;
      requestAnimationFrame(()=>{drawQueued=false;redraw()});
    });
    resizeObserver.observe(block);
    redraw();
  }
  const observer=new MutationObserver(installCharts);
  observer.observe(content,{childList:true});
  selector.value='0';
  selector.dispatchEvent(new Event('change',{bubbles:true}));
  root.querySelector('#or-tab-projects').click();
  installCharts();
})();

(()=>{
  const root=document.getElementById('omotor-report');
  const annual=root.querySelector('#or-annual');
  const data=window.OMOTOR_REPORT_DATA.annual;
  annual.querySelector('.or-focus-area').after(root.querySelector('#or-annual-issues-template').content.cloneNode(true));
  const valid=v=>v!==null&&v!==undefined&&Number.isFinite(v);
  const fmt=(v,d=0)=>valid(v)?v.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d}):'n.d.';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const blocks=[root.querySelector('#or-annual-issues-block')];
  function tooltip(block){
    const tip=block.querySelector('[role="tooltip"]');let pinned=false;
    return {
      reset(){pinned=false;tip.hidden=true;},
      bind(hit,title,rows){
        const show=event=>{
          tip.innerHTML='<strong>'+esc(title)+'</strong>'+rows().map(([label,value])=>'<div class="or-project-chart-tip-row"><span>'+esc(label)+'</span><span>'+esc(value)+'</span></div>').join('');
          tip.hidden=false;const bounds=block.getBoundingClientRect();
          tip.style.left=Math.max(6,Math.min(event.clientX-bounds.left+12,bounds.width-tip.offsetWidth-6))+'px';
          tip.style.top=Math.max(0,Math.min(event.clientY-bounds.top-tip.offsetHeight-12,bounds.height-tip.offsetHeight))+'px';
        };
        hit.on('pointermove',event=>{if(!pinned)show(event)}).on('pointerleave',()=>{if(!pinned)tip.hidden=true}).on('click',event=>{pinned=!pinned;show(event)});
      }
    };
  }
  const tips=blocks.map(tooltip);
  function setup(target,rows,title,withRightAxis=false){
    const width=target.getBoundingClientRect().width;
    if(width<150)return null;
    target.replaceChildren();
    const height=withRightAxis?350:300;
    const m={left:64,right:withRightAxis?48:14,top:34,bottom:50};
    const right=width-m.right,bottom=height-m.bottom,plotWidth=right-m.left,slot=plotWidth/rows.length;
    const svg=d3.select(target).append('svg').attr('viewBox','0 0 '+width+' '+height).attr('role','img').attr('aria-label',title);
    svg.append('title').text(title);
    const x=d3.scalePoint().domain(rows.map((r,i)=>i)).range([m.left+slot/2,right-slot/2]);
    svg.append('rect').attr('data-chart-frame','').attr('x',m.left).attr('y',m.top).attr('width',plotWidth).attr('height',bottom-m.top).attr('fill','none').attr('stroke','var(--or-line)');
    const ticks=width>=700?rows.map((r,i)=>i):width>=450?[0,2,4,6,8,11]:[0,4,8,11];
    svg.append('g').attr('class','or-chart-axis').attr('transform','translate(0,'+bottom+')').call(d3.axisBottom(x).tickValues(ticks).tickSize(0).tickPadding(12).tickFormat(i=>rows[i].month));
    svg.append('text').attr('class','axis-title').attr('data-axis','x').attr('x',m.left+plotWidth/2).attr('y',height-4).attr('text-anchor','middle').text('Mês');
    return {svg,width,height,m,right,bottom,plotWidth,slot,x};
  }
  function yAxis(c,scale,title,formatter){
    const {svg,m,right}=c;
    const grid=svg.append('g').attr('class','or-chart-grid');
    scale.ticks(4).forEach(v=>grid.append('line').attr('x1',m.left).attr('x2',right).attr('y1',scale(v)).attr('y2',scale(v)));
    svg.append('g').attr('class','or-chart-axis').attr('transform','translate('+m.left+',0)').call(d3.axisLeft(scale).ticks(4).tickSize(0).tickPadding(8).tickFormat(formatter));
    svg.append('text').attr('class','axis-title').attr('data-axis','y').attr('x',m.left).attr('y',15).text(title);
  }
  function drawIssues(){
    tips[0].reset();const rows=data.timeline;
    const c=setup(blocks[0].querySelector('[data-annual-chart="issues"]'),rows,'Incidentes e problemas abertos em cada mês, de outubro de 2025 a setembro de 2026. Total: 168 incidentes e 5 problemas.');
    if(!c)return;
    const {svg,width,m,right,bottom,slot,x}=c;
    const extent=d3.extent(rows.flatMap(r=>[r.incidents,r.problems]));
    const y=d3.scaleLinear().domain([0,Math.max(1,extent[1])*1.2]).nice(4).range([bottom,m.top]);
    yAxis(c,y,'Chamados',v=>fmt(v));
    svg.append('desc').text(rows.map(r=>r.month+': '+r.incidents+' incidentes, '+r.problems+' problemas').join('; '));
    rows.forEach((r,i)=>{
      const barWidth=Math.max(3,slot*.31),gap=Math.max(1,slot*.06);
      for(const [key,label,color,offset] of [['incidents','Incidentes','var(--or-teal)',-barWidth-gap/2],['problems','Problemas','var(--or-gold)',gap/2]]){
        const value=r[key],bx=x(i)+offset;
        svg.append('rect').attr('data-annual-bar',key).attr('data-value',value).attr('x',bx).attr('y',y(value)).attr('width',barWidth).attr('height',bottom-y(value)).attr('fill',color);
        if(width>=650&&(key==='incidents'||value>0))svg.append('text').attr('x',bx+barWidth/2).attr('y',y(value)-8).attr('text-anchor','middle').text(fmt(value));
      }
      const hit=svg.append('rect').attr('data-chart-hit','').attr('x',m.left+i*slot).attr('y',m.top).attr('width',slot).attr('height',bottom-m.top).attr('fill','transparent');
      tips[0].bind(hit,r.month,()=>[['Incidentes',fmt(r.incidents)],['Problemas',fmt(r.problems)],['Chamados no mês',fmt(r.tickets)]]);
    });
  }
  let lastWidth=0;
  const observer=new ResizeObserver(()=>{
    const width=annual.getBoundingClientRect().width;
    if(width<150||width===lastWidth)return;lastWidth=width;
    drawIssues();
  });
  observer.observe(annual);
  root.querySelector('#or-tab-annual').click();
  drawIssues();
})();

(()=>{
  const root=document.getElementById('omotor-report');
  const projects=window.OMOTOR_REPORT_DATA.projects.projects;
  const selector=root.querySelector('#or-project-selector');
  const period=root.querySelector('#or-project-period');
  const content=root.querySelector('#or-project-content');
  const template=root.querySelector('#or-projects-annual-template');
  const valid=v=>v!==null&&v!==undefined&&Number.isFinite(v);
  const fmt=(v,d=0)=>valid(v)?v.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d}):'n.d.';
  const compact=v=>Math.abs(v)>=1000000?fmt(v/1000000,1)+' mi':Math.abs(v)>=1000?fmt(v/1000,Math.abs(v)<10000?1:0)+' mil':fmt(v);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const months=projects[0].history.map(r=>r.month);
  const history=months.map(month=>{
    const records=projects.map(p=>p.history.find(r=>r.month===month)).filter(Boolean);
    const knownMessages=records.filter(r=>valid(r.messages));
    const knownUsers=records.filter(r=>valid(r.users));
    const messages=knownMessages.length?d3.sum(knownMessages,r=>r.messages):null;
    const users=knownUsers.length?d3.sum(knownUsers,r=>r.users):null;
    return {month,messages,users,ratio:valid(messages)&&users>0?messages/users:null,coverage:records.filter(r=>valid(r.messages)&&valid(r.users)).length};
  });
  const totals={messages:d3.sum(history,r=>r.messages),users:d3.sum(history,r=>r.users)};
  const reference={messages:totals.messages/history.length,users:totals.users/history.length,ratio:totals.users>0?totals.messages/totals.users:null};
  const september=history.find(r=>r.month==='set/2026');
  const comparisonMetrics=[['ratio','Msg./usuário',2],['messages','Mensagens',0],['users','Usuários',0]].map(([key,label,decimals])=>{
    const current=september?.[key],base=reference[key];
    const index=valid(current)&&valid(base)&&base>0?current/base*100:null;
    return {key,label,decimals,current,reference:base,index,delta:valid(index)?index-100:null};
  });
  const signed=v=>(v>=0?'+':'')+fmt(v,1)+'%';
  const visible={messages:true,users:true,ratio:true};
  let resizeObserver=null;
  function install(){
    if(selector.value!=='all'||period.value!=='total_12m'){
      if(resizeObserver)resizeObserver.disconnect();
      return;
    }
    if(content.querySelector('#or-projects-annual-charts'))return;
    if(resizeObserver)resizeObserver.disconnect();
    content.querySelector('.or-stats').after(template.content.cloneNode(true));
    const block=content.querySelector('#or-projects-annual-charts');
    const tip=block.querySelector('[role="tooltip"]');let pinned=false;
    function resetTip(){pinned=false;tip.hidden=true;}
    function bindTip(hit,title,rows){
      const show=event=>{
        tip.innerHTML='<strong>'+esc(title)+'</strong>'+rows().map(([label,value])=>'<div class="or-project-chart-tip-row"><span>'+esc(label)+'</span><span>'+esc(value)+'</span></div>').join('');
        tip.hidden=false;const b=block.getBoundingClientRect();
        tip.style.left=Math.max(6,Math.min(event.clientX-b.left+12,b.width-tip.offsetWidth-6))+'px';
        tip.style.top=Math.max(0,Math.min(event.clientY-b.top-tip.offsetHeight-12,b.height-tip.offsetHeight))+'px';
      };
      hit.on('pointermove',event=>{if(!pinned)show(event)}).on('pointerleave',()=>{if(!pinned)tip.hidden=true}).on('click',event=>{pinned=!pinned;show(event)});
    }
    function svgFor(target,height,label){
      const width=target.getBoundingClientRect().width;
      if(width<150)return null;
      target.replaceChildren();
      const svg=d3.select(target).append('svg').attr('viewBox','0 0 '+width+' '+height).attr('role','img').attr('aria-label',label);
      svg.append('title').text(label);
      return {svg,width,height};
    }
    function drawComparison(){
      const c=svgFor(block.querySelector('[data-projects-annual-chart="comparison"]'),310,'Setembro de 2026 comparado à referência dos últimos 12 meses, no consolidado dos 18 projetos. Cada referência corresponde a 100%.');
      if(!c)return;
      const {svg,width,height}=c,m={left:64,right:14,top:40,bottom:54};
      const right=width-m.right,bottom=height-m.bottom;
      const x=d3.scaleBand().domain(comparisonMetrics.map(r=>r.key)).range([m.left,right]).padding(.18);
      const sub=d3.scaleBand().domain(['current','reference']).range([0,x.bandwidth()]).padding(.1);
      const y=d3.scaleLinear().domain([0,Math.max(100,d3.max(comparisonMetrics,r=>r.index)||0)*1.28]).nice(4).range([bottom,m.top]);
      svg.append('desc').text(comparisonMetrics.map(r=>r.label+': setembro '+fmt(r.current,r.decimals)+', referência '+fmt(r.reference,r.decimals===2?2:1)+', variação '+signed(r.delta)).join('; '));
      const grid=svg.append('g').attr('class','or-chart-grid');
      y.ticks(4).forEach(v=>grid.append('line').attr('x1',m.left).attr('x2',right).attr('y1',y(v)).attr('y2',y(v)));
      svg.append('rect').attr('data-chart-frame','').attr('x',m.left).attr('y',m.top).attr('width',right-m.left).attr('height',bottom-m.top).attr('fill','none').attr('stroke','var(--or-line)');
      svg.append('g').attr('class','or-chart-axis').attr('transform','translate('+m.left+',0)').call(d3.axisLeft(y).ticks(4).tickSize(0).tickPadding(8).tickFormat(v=>fmt(v)+'%'));
      const axis=svg.append('g').attr('class','or-chart-axis').attr('transform','translate(0,'+bottom+')').call(d3.axisBottom(x).tickSize(0).tickPadding(12).tickFormat(key=>comparisonMetrics.find(r=>r.key===key).label));
      axis.selectAll('.domain').remove();
      if(width<370){
        axis.selectAll('.tick text').filter(key=>key==='ratio').text('Msg./').append('tspan').attr('x',0).attr('dy',12).text('usuário');
        axis.selectAll('.tick text').filter(key=>key==='messages').text('Msgs.');
      }
      svg.append('text').attr('class','axis-title').attr('data-axis','y').attr('x',m.left).attr('y',18).text('Índice (%)');
      svg.append('text').attr('class','axis-title').attr('data-axis','x').attr('x',m.left+(right-m.left)/2).attr('y',height-4).attr('text-anchor','middle').text('Indicadores');
      comparisonMetrics.forEach(r=>{
        const center=x(r.key)+x.bandwidth()/2;
        for(const kind of ['current','reference']){
          const value=kind==='current'?r.index:100;
          if(!valid(value))continue;
          const bx=x(r.key)+sub(kind),bw=sub.bandwidth(),by=y(value);
          svg.append('rect').attr('data-projects-comparison-bar',r.key).attr('data-kind',kind).attr('data-index',value).attr('data-value',kind==='current'?r.current:r.reference).attr('x',bx).attr('y',by).attr('width',bw).attr('height',bottom-by).attr('fill',kind==='current'?'var(--or-chart-blue)':'var(--or-chart-reference)');
          if(width>=640){
            const absolute=kind==='current'?fmt(r.current,r.decimals):fmt(r.reference,r.decimals===2?2:1);
            svg.append('text').attr('x',bx+bw/2).attr('y',by-(kind==='current'?23:8)).attr('text-anchor','middle').text(absolute);
            if(kind==='current')svg.append('text').attr('x',bx+bw/2).attr('y',by-8).attr('text-anchor','middle').text(signed(r.delta));
          }
        }
        if(width<640&&valid(r.index))svg.append('text').attr('x',center).attr('y',y(Math.max(100,r.index))-10).attr('text-anchor','middle').text(fmt(r.index,1)+'%');
        const hit=svg.append('rect').attr('data-chart-hit','').attr('data-comparison-metric',r.key).attr('x',Math.max(m.left,center-Math.max(x.bandwidth(),44)/2)).attr('y',m.top).attr('width',Math.max(x.bandwidth(),44)).attr('height',bottom-m.top).attr('fill','transparent');
        bindTip(hit,r.label,()=>[['Setembro/2026',fmt(r.current,r.decimals)],['Referência 12 meses',fmt(r.reference,r.decimals===2?2:1)],['Variação',valid(r.delta)?signed(r.delta):'n.d.']]);
      });
    }
    function drawHistory(){
      resetTip();
      const c=svgFor(block.querySelector('[data-projects-annual-chart="history"]'),350,'Histórico dos 18 projetos da aba Uso por Projeto, de outubro de 2025 a setembro de 2026. Total: 8.966.493 mensagens e 723.015 usuários somados entre meses e projetos.');
      if(!c)return;
      const {svg,width,height}=c,m={left:64,right:48,top:34,bottom:50};
      const right=width-m.right,bottom=height-m.bottom,plotWidth=right-m.left,slot=plotWidth/history.length;
      const x=d3.scalePoint().domain(history.map((r,i)=>i)).range([m.left+slot/2,right-slot/2]);
      const values=history.flatMap(r=>[visible.messages?r.messages:null,visible.users?r.users:null]).filter(valid);
      const extent=d3.extent(values),ratioExtent=d3.extent(history,r=>r.ratio);
      const y=d3.scaleLinear().domain([0,Math.max(1,extent[1]||0)*1.2]).nice(4).range([bottom,m.top]);
      const yr=d3.scaleLinear().domain([0,Math.max(1,ratioExtent[1]||0)*1.18]).nice(4).range([bottom,m.top]);
      svg.append('rect').attr('data-chart-frame','').attr('x',m.left).attr('y',m.top).attr('width',plotWidth).attr('height',bottom-m.top).attr('fill','none').attr('stroke','var(--or-line)');
      const grid=svg.append('g').attr('class','or-chart-grid');
      y.ticks(4).forEach(v=>grid.append('line').attr('x1',m.left).attr('x2',right).attr('y1',y(v)).attr('y2',y(v)));
      svg.append('g').attr('class','or-chart-axis').attr('transform','translate('+m.left+',0)').call(d3.axisLeft(y).ticks(4).tickSize(0).tickPadding(8).tickFormat(compact));
      svg.append('g').attr('class','or-chart-axis').attr('transform','translate('+right+',0)').call(d3.axisRight(yr).ticks(4).tickSize(0).tickPadding(7).tickFormat(v=>fmt(v)));
      const ticks=width>=700?history.map((r,i)=>i):width>=450?[0,2,4,6,8,11]:[0,4,8,11];
      svg.append('g').attr('class','or-chart-axis').attr('transform','translate(0,'+bottom+')').call(d3.axisBottom(x).tickValues(ticks).tickSize(0).tickPadding(12).tickFormat(i=>history[i].month.replace('/20','/')));
      svg.append('text').attr('class','axis-title').attr('data-axis','y').attr('x',m.left).attr('y',15).text('Quantidade');
      svg.append('text').attr('class','axis-title').attr('data-axis','y-right').attr('x',right).attr('y',15).attr('text-anchor','end').text('Msg./usuário');
      svg.append('text').attr('class','axis-title').attr('data-axis','x').attr('x',m.left+plotWidth/2).attr('y',height-4).attr('text-anchor','middle').text('Mês');
      const labels=[];
      if(visible.messages)history.forEach((r,i)=>{
        if(!valid(r.messages))return;
        const bw=slot*.68;
        svg.append('rect').attr('data-projects-total-bar','messages').attr('data-value',r.messages).attr('x',x(i)-bw/2).attr('y',y(r.messages)).attr('width',bw).attr('height',bottom-y(r.messages)).attr('fill','var(--or-chart-blue)');
        labels.push({text:width>=880?fmt(r.messages):compact(r.messages),x:x(i),y:y(r.messages)-9});
      });
      for(const [key,scale,color,shape] of [['users',y,'var(--or-chart-users)','circle'],['ratio',yr,'var(--or-chart-ratio)','diamond']]){
        if(!visible[key])continue;
        svg.append('path').datum(history).attr('data-projects-total-line',key).attr('d',d3.line().defined(r=>valid(r[key])).x((r,i)=>x(i)).y(r=>scale(r[key]))).attr('fill','none').attr('stroke',color).attr('stroke-width',2.5);
        history.forEach((r,i)=>{
          if(!valid(r[key]))return;
          if(shape==='circle')svg.append('circle').attr('cx',x(i)).attr('cy',scale(r[key])).attr('r',2.5).attr('fill',color);
          else svg.append('path').attr('d',d3.symbol().type(d3.symbolDiamond).size(24)()).attr('transform','translate('+x(i)+','+scale(r[key])+')').attr('fill',color);
          labels.push({text:key==='ratio'?fmt(r[key],2):width>=880?fmt(r[key]):compact(r[key]),x:x(i),y:scale(r[key])-10});
        });
      }
      if(width>=740){
        const used=[];
        labels.forEach(label=>{
          const node=svg.append('text').attr('x',label.x).attr('text-anchor','middle').text(label.text);
          for(const candidate of [label.y,label.y+26]){
            node.attr('y',candidate);const box=node.node().getBBox();
            if(box.x<m.left||box.x+box.width>right||box.y<m.top||box.y+box.height>bottom||used.some(b=>box.x<b.x+b.width+4&&box.x+box.width+4>b.x&&box.y<b.y+b.height+3&&box.y+box.height+3>b.y))continue;
            used.push(box);node.attr('paint-order','stroke').attr('stroke','var(--or-panel)').attr('stroke-width',4).attr('stroke-linejoin','round');return;
          }
          node.remove();
        });
      }
      history.forEach((r,i)=>{
        const hit=svg.append('rect').attr('data-chart-hit','').attr('x',m.left+i*slot).attr('y',m.top).attr('width',slot).attr('height',bottom-m.top).attr('fill','transparent');
        bindTip(hit,r.month,()=>{
          const rows=[];
          if(visible.messages)rows.push(['Mensagens',fmt(r.messages)]);
          if(visible.users)rows.push(['Usuários · soma',fmt(r.users)]);
          if(visible.ratio)rows.push(['Msg./usuário',fmt(r.ratio,2)]);
          rows.push(['Projetos com dados',r.coverage+' de 18']);return rows;
        });
      });
    }
    block.querySelectorAll('[data-projects-annual-series]').forEach(button=>{
      button.setAttribute('aria-pressed',String(visible[button.dataset.projectsAnnualSeries]));
      button.addEventListener('click',()=>{
        const key=button.dataset.projectsAnnualSeries;
        if(visible[key]&&Object.values(visible).filter(Boolean).length===1)return;
        visible[key]=!visible[key];button.setAttribute('aria-pressed',String(visible[key]));drawHistory();
      });
    });
    let lastWidth=0;
    resizeObserver=new ResizeObserver(()=>{
      const width=block.getBoundingClientRect().width;
      if(width<150||width===lastWidth)return;lastWidth=width;resetTip();drawComparison();drawHistory();
    });
    resizeObserver.observe(block);drawComparison();drawHistory();
  }
  new MutationObserver(install).observe(content,{childList:true});
  selector.value='all';period.value='total_12m';
  period.dispatchEvent(new Event('change',{bubbles:true}));
  root.querySelector('#or-tab-projects').click();
  install();
  root.querySelector('#or-tab-monthly').click();
})();
