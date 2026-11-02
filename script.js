/* ===================== Estado ===================== */
let S;
function nuevoEstado(){
  return {
    reserva:100, energia:3, conciencia:0, dia:1, paso:0, consumoBase:8,
    lavaderoFuga:false, aceraFuga:false, aceraReportada:false, camiloAliado:false, canoSucio:false,
    hernanAcepta:false, patioMojado:false, reunion:false, propuso:false, baldes:false,
    priorizo:false, guardo:false, comite:false, derrota:false,
    historial:[], perdidasFugas:{lavadero:0, acera:0}, gastoDia:0, bonos:[]
  };
}
const MOMENTOS = ["mañana","noche","mañana","noche","mañana","tarde","mañana","tarde","mañana","tarde","mañana","noche","mañana"];
const NIVELES = {1:"La casa",2:"La casa",3:"El barrio",4:"El barrio",5:"La crisis",6:"La crisis",7:"Misión final"};
const NUMNIVEL = {1:1,2:1,3:2,4:2,5:3,6:3,7:4};

/* ===================== Decisiones (GDD punto 10) ===================== */
const D = [
 {dia:1, esc:"casa", noche:false, titulo:"La ducha",
  texto:"Primer día de la semana. Nickole entra a la ducha. El aviso dice que la reserva del barrio solo alcanza para siete días.",
  opciones:[
   {t:"Ducha corta, de menos de 5 minutos", e:false, f:()=>res(-2,5,"Ahorraste agua frente a una ducha larga.")},
   {t:"Ducha larga, sin mirar el reloj", e:false, f:()=>res(-5,0,"Una ducha larga puede gastar varias veces el agua de una corta.")}
 ]},
 {dia:1, esc:"casa", noche:true, titulo:"Antes de dormir",
  texto:"Nickole se cepilla los dientes. El agua corre mientras tanto.",
  opciones:[
   {t:"Cerrar la llave mientras se cepilla", e:false, f:()=>res(0,3,"Cerrar la llave evita que el agua corra sin que nadie la use.")},
   {t:"Dejar la llave abierta", e:false, f:()=>res(-2,0,"La llave abierta gastó agua que nadie usó.")}
 ]},
 {dia:2, esc:"casa", noche:false, titulo:"El patio",
  texto:"Doña Marta saca la manguera para lavar el patio, como todos los martes.",
  opciones:[
   {t:"Proponerle barrer y usar un balde con el agua de la lavadora", e:true, f:()=>{S.patioMojado=false;return res(-1,5,"Doña Marta acepta a regañadientes. El patio quedó limpio con agua reutilizada.")}},
   {t:"No decir nada", e:false, f:()=>{S.patioMojado=true;return res(-6,0,"Una manguera abierta gasta mucha más agua que un balde.")}}
 ]},
 {dia:2, esc:"casa", noche:true, titulo:"Un goteo en la noche",
  texto:"En el silencio de la noche, Nickole escucha que la llave del lavadero gotea.",
  opciones:[
   {t:"Revisarla y cambiarle el empaque", e:true, f:()=>{S.lavaderoFuga=false;return res(0,5,"La llave dejó de gotear.")}},
   {t:"Ignorarla, mañana alguien la arreglará", e:false, f:()=>{S.lavaderoFuga=true;return res(0,0,"La llave seguirá goteando cada día: −3 % de reserva diario.")}}
 ]},
 {dia:3, esc:"calle", noche:false, titulo:"Agua en la acera",
  texto:"Camino a la universidad, Nickole ve agua brotando de la acera. Lleva días así, según los vecinos.",
  opciones:[
   {t:"Reportar la fuga a Emcali", e:true, f:()=>{S.aceraReportada=true;S.aceraFuga=false;return res(0,5,"Emcali registró el reporte y envió una cuadrilla. La fuga quedó controlada.")}},
   {t:"Seguir de largo, ya alguien la habrá reportado", e:false, f:()=>{S.aceraFuga=true;return res(0,0,"Nadie la reportó. La fuga seguirá: −4 % de reserva diario.")}}
 ]},
 {dia:3, esc:"calle", noche:false, titulo:"El caño",
  texto:"De regreso, Nickole ve a Camilo botar una bolsa de basura al caño del barrio.",
  opciones:[
   {t:"Hablarle con calma sobre lo que pasa con la basura en el caño", e:true, f:()=>{S.camiloAliado=true;S.canoSucio=false;return res(0,5,"Camilo no sabía que la basura tapa el caño y termina en el río. Promete no volver a hacerlo.")}},
   {t:"Regañarlo delante de todos", e:false, f:()=>{S.canoSucio=true;return res(0,0,"Camilo se molesta y sigue botando basura. El caño se ensucia más.")}},
   {t:"No decir nada", e:false, f:()=>{S.canoSucio=true;return res(0,0,"El caño se sigue llenando de basura.")}}
 ]},
 {dia:4, esc:"calle", noche:false, titulo:"La tienda",
  texto:"Don Hernán lava la acera de su tienda con manguera, como cada mañana.",
  opciones:[
   {t:"Sugerirle barrer y usar agua reutilizada", e:true, f:()=>{
      if(S.aceraReportada||S.camiloAliado){S.hernanAcepta=true;return res(0,5,"“Si los muchachos del barrio están poniendo de su parte, yo también”, dice Don Hernán, y guarda la manguera.")}
      S.hernanAcepta=false;return res(-3,0,"Don Hernán se niega: “¿Y quién más está ahorrando aquí?”. Sigue con la manguera.")}},
   {t:"No decir nada", e:false, f:()=>res(-3,0,"La acera quedó limpia y el agua terminó en la calle.")}
 ]},
 {dia:4, esc:"casa", noche:false, titulo:"Una visita",
  texto:"Doña Gloria, la líder comunal, toca la puerta: mañana habrá una reunión para organizar el barrio si el agua escasea.",
  opciones:[
   {t:"Aceptar ir a la reunión", e:false, f:()=>{S.reunion=true;return res(0,5,"Doña Gloria anota a Nickole. Mañana habrá reunión en el salón comunal.")}},
   {t:"Decir que no tiene tiempo", e:false, f:()=>{S.reunion=false;return res(0,0,"Otros decidirán cómo se organiza el barrio.")}}
 ]},
 {dia:5, esc:"calle", noche:false, evento:true, titulo:"El río Cauca",
  texto:"Noticia de última hora: el lodo de los deslizamientos llegó al río Cauca y las plantas de tratamiento se detuvieron. Llega un carrotanque al barrio.",
  opciones:[
   {t:"Llenar baldes para la abuela Rosa, que no puede cargar", e:true, f:()=>{S.baldes=true;return res(0,5,"La abuela Rosa tiene agua para el día.")}},
   {t:"Llenar el tanque de su casa hasta el tope", e:false, f:()=>res(-3,0,"El tanque quedó lleno, pero el carrotanque se vació más rápido para los demás.")}
 ]},
 {dia:5, esc:"salon", noche:false, titulo:"La reunión",
  texto:()=>S.reunion?"En el salón comunal, los vecinos discuten cómo repartir el agua que queda.":"Nickole no fue a la reunión. Los vecinos decidieron sin ella.",
  opciones:()=>S.reunion?[
   {t:"Proponer horarios de racionamiento por sectores", e:true, f:()=>{S.propuso=true;S.consumoBase=7;return res(0,5,"Los vecinos aprueban los horarios. Desde mañana el consumo base baja a 7 %.")}},
   {t:"Escuchar sin proponer nada", e:false, f:()=>res(0,0,"La reunión termina sin un plan claro.")}
  ]:[
   {t:"Continuar", e:false, f:()=>res(0,0,"Los vecinos acordaron reglas sin escuchar a Nickole.")}
  ]},
 {dia:6, esc:"salon", noche:false, titulo:"El reparto",
  texto:"Queda poca agua en los tanques comunales. Hay que decidir cómo repartirla.",
  opciones:[
   {t:"Priorizar a la abuela Rosa y a las familias con niños", e:true, f:()=>{S.priorizo=true;return res(0,10,"Nadie vulnerable se quedó sin agua.")}},
   {t:"Repartir igual para todos", e:false, f:()=>res(0,5,"El reparto fue parejo, aunque algunos necesitaban más.")},
   {t:"Guardar más para su casa", e:false, f:()=>{S.guardo=true;return res(0,0,"La casa de Nickole tiene de sobra. Otras no.")}}
 ]},
 {dia:6, esc:"casa", noche:true, titulo:"La ropa",
  texto:"Hay ropa sucia acumulada desde hace días.",
  opciones:[
   {t:"Esperar a tener una carga completa y reutilizar el agua", e:false, f:()=>res(0,5,"Una carga completa ahorra varias lavadas pequeñas.")},
   {t:"Lavar ya, aunque sean pocas prendas", e:false, f:()=>res(-4,0,"Varias lavadas pequeñas gastaron mucho más agua.")}
 ]},
 {dia:7, esc:"calle", noche:false, titulo:"El comité",
  texto:"El barrio sobrevivió a la semana. Doña Gloria propone crear un comité permanente para cuidar el agua.",
  opciones:[
   {t:"Unirse al comité", e:true, f:()=>{S.comite=true;return res(0,10,"Nickole se une al comité del agua del barrio.")}},
   {t:"No unirse", e:false, f:()=>res(0,0,"El comité se forma sin Nickole.")}
 ]}
];

const DATOS = {
 1:["Una llave que gotea una vez por segundo desperdicia unos 30 litros al día.","Emcali, agosto de 2026"],
 2:["Un sanitario con fuga continua puede perder entre 300 y 500 litros diarios.","Emcali, agosto de 2026"],
 3:["En el primer semestre de 2026, Emcali retiró 84.963 toneladas de residuos y sedimentos de canales y alcantarillado de Cali.","El País, julio de 2026"],
 4:["En septiembre de 2026 el consumo de Cali subió a unos 745.000 m³ diarios, cuando lo normal está entre 680.000 y 710.000.","El País, septiembre de 2026"],
 5:["Las plantas que toman agua del río Cauca abastecen cerca del 80 % de Cali.","El País, abril de 2026"],
 6:["Emcali advirtió que El Niño podría intensificarse hasta febrero de 2027.","El País, septiembre de 2026"]
};

/* ===================== Motor ===================== */
let ultimo = null;
function res(dR,dC,msg){ return {dR,dC,msg}; }
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

function aplicar(op, dec){
  if(op.e){ S.energia -= 1; }
  const r = op.f();
  S.reserva = clamp(S.reserva + r.dR, 0, 100);
  S.conciencia = clamp(S.conciencia + r.dC, 0, 100);
  S.gastoDia += -Math.min(0,r.dR);
  S.historial.push({dia:dec.dia, sit:dec.titulo, op:op.t, dR:r.dR, dC:r.dC});
  ultimo = {r, op, dec};
  if(S.reserva<=0){ S.derrota=true; return pantallaFinal(); }
  pantallaConsecuencia();
}

function finDeDia(){
  const partes = [];
  let total = S.consumoBase;
  partes.push(["Consumo base del barrio", -S.consumoBase]);
  if(S.lavaderoFuga){ total+=3; S.perdidasFugas.lavadero+=3; partes.push(["Fuga del lavadero",-3]); }
  if(S.aceraFuga){ total+=4; S.perdidasFugas.acera+=4; partes.push(["Fuga en la acera",-4]); }
  S.reserva = clamp(S.reserva - total, 0, 100);
  S.gastoDia += total;
  return partes;
}

function siguiente(){
  S.paso++;
  const prev = D[S.paso-1];
  const nueva = D[S.paso];
  if(!nueva){ return pantallaFinal(); }
  if(nueva.dia !== prev.dia){
    // termina el día anterior
    const partes = finDeDia();
    if(S.reserva<=0){ S.derrota=true; return pantallaFinal(); }
    return pantallaResumen(prev.dia, partes);
  }
  pantallaDecision();
}

function iniciarDia(){
  const d = D[S.paso].dia;
  if(d>1) S.energia = clamp(S.energia+1,0,3);
  S.gastoDia = 0;
  pantallaDecision();
}

function balance(nivel){
  if(nivel===1){
    const ok = S.reserva>=80;
    if(ok){S.conciencia=clamp(S.conciencia+5,0,100);S.bonos.push("Hogar responsable")}
    return {ok, obj:"Terminar el día 2 con la reserva en 80 % o más.",
      si:"Hogar responsable: +5 de conciencia.", no:`La casa desperdició agua: la reserva quedó en ${S.reserva} %.`};
  }
  if(nivel===2){
    const ok = S.aceraReportada && S.camiloAliado;
    if(ok){S.conciencia=clamp(S.conciencia+5,0,100);S.bonos.push("Barrio unido")}
    return {ok, obj:"Reportar la fuga de la acera y mantener limpio el caño.",
      si:"Barrio unido: +5 de conciencia.", no:"El caño o la fuga quedaron sin atender. La crisis golpeará más fuerte."};
  }
  const ok = (S.baldes||S.priorizo) && S.reserva>20;
  if(ok){S.conciencia=clamp(S.conciencia+5,0,100);S.bonos.push("Nadie se quedó atrás")}
  return {ok, obj:"Que la abuela Rosa tenga agua y la reserva siga por encima del 20 %.",
    si:"Nadie se quedó atrás: +5 de conciencia.", no:"La abuela Rosa o la reserva quedaron en riesgo."};
}

/* ===================== Pantallas ===================== */
const G = document.getElementById('game');
const HUD = document.getElementById('hud');

function hud(on, diaFijo){
  HUD.hidden = !on;
  if(!on) return;
  const dec = diaFijo ? D.find(d=>d.dia===diaFijo) : D[Math.min(S.paso,D.length-1)];
  const pips = [0,1,2].map(i=>`<span class="pip ${i<S.energia?'on':''}"></span>`).join('');
  HUD.innerHTML = `
    <div class="where">Nivel ${NUMNIVEL[dec.dia]}: ${NIVELES[dec.dia]}<small>Día ${dec.dia}, ${diaFijo?'fin del día':(MOMENTOS[S.paso]||'cierre')}</small></div>
    <div class="stats">
      <div class="stat" aria-label="Energía: ${S.energia} de 3">Energía <span class="pips">${pips}</span></div>
      <div class="stat">Conciencia <span class="conc">${S.conciencia}</span></div>
      <button class="exit" id="salir">Salir</button>
    </div>`;
  document.getElementById('salir').onclick = abrirModal;
}

function tank(){
  return `<div class="tank" aria-label="Reserva de agua del barrio: ${S.reserva} por ciento">
    <div class="label">Reserva del barrio</div>
    <div class="tank-body"><div class="tank-fill" style="height:${S.reserva}%;width:${S.reserva}%"></div>
      <div class="tank-mark" style="bottom:20%;left:20%"><span>20 %</span></div></div>
    <div class="tank-num">${S.reserva} %</div></div>`;
}

function layout(escenaSvg, inner){
  G.innerHTML = `<div class="game"><div><div class="scene">${escenaSvg}</div>${inner}</div>${tank()}</div>`;
  const f = G.querySelector('.tank-fill');
  if(window.matchMedia('(max-width:720px)').matches){ f.style.height=''; } else { f.style.width=''; }
  const first = G.querySelector('.box button'); if(first) first.focus({preventScroll:true});
}

function pantallaMenu(){
  hud(false);
  G.innerHTML = `<div class="title">
      <div class="scene" style="max-width:720px;margin:0 auto 18px">${escena('calle',{menu:true})}</div>
      <span class="drop" aria-hidden="true"></span>
      <h1>Última Gota</h1>
      <p>Siete días. Una reserva de agua para todo el barrio. Lo que decidas en casa termina en la calle.</p>
      <div class="row" style="justify-content:center;margin-top:22px">
        <button class="primary" id="jugar">Jugar</button>
      </div></div>`;
  document.getElementById('jugar').onclick = pantallaInstrucciones;
}

function pantallaInstrucciones(){
  hud(false);
  G.innerHTML = `<div class="box">
    <h2>Antes de empezar</h2>
    <p>Acompañarás a Nickole durante siete días, agrupados en cuatro niveles. Cada día tomas dos decisiones.</p>
    <div class="tablewrap"><table>
      <tr><th>Recurso</th><th>Cómo funciona</th></tr>
      <tr><td>Reserva del barrio</td><td>Empieza en 100 % y baja cada día un 8 % por el consumo base, más tus decisiones y las fugas activas. Si llega a 0 %, pierdes.</td></tr>
      <tr><td>Energía</td><td>Tienes máximo 3. Las acciones marcadas con ⚡ cuestan 1, y solo recuperas 1 cada mañana.</td></tr>
      <tr><td>Conciencia</td><td>Sube con decisiones responsables y con los objetivos de cada nivel. Define tu final.</td></tr>
    </table></div>
    <p style="margin-top:14px"><strong>No hay vuelta atrás ni pausas. Si sales, pierdes todo tu progreso.</strong></p>
    <div class="row"><button class="primary" id="acepto">Acepto, empezar</button><button class="secondary" id="noacepto">No acepto</button></div>
  </div>`;
  document.getElementById('acepto').onclick = ()=>{ S=nuevoEstado(); pantallaAviso(); };
  document.getElementById('noacepto').onclick = pantallaMenu;
  G.querySelector('#acepto').focus();
}

function pantallaAviso(){
  hud(true);
  layout(escena('casa',{}), `<div class="box">
    <h2>Lunes, 6:30 a. m.</h2>
    <p>El celular de Nickole vibra. Es un aviso para el barrio: <em>“Por la temporada seca, la reserva de agua del sector alcanza para siete días si el consumo no baja.”</em></p>
    <p>En la cocina nadie le presta atención.</p>
    <div class="row"><button class="primary" id="go">Empezar el día 1</button></div></div>`);
  document.getElementById('go').onclick = ()=>{ S.gastoDia=0; pantallaDecision(); };
}

function pantallaDecision(){
  hud(true);
  const dec = D[S.paso];
  const texto = typeof dec.texto==='function'?dec.texto():dec.texto;
  const ops = typeof dec.opciones==='function'?dec.opciones():dec.opciones;
  let evento = '';
  if(dec.evento){
    const golpe = S.canoSucio?15:10;
    S.reserva = clamp(S.reserva-golpe,0,100);
    S.gastoDia += golpe;
    S.historial.push({dia:5, sit:"Evento del río Cauca", op:S.canoSucio?"Golpe con el caño contaminado":"Golpe del evento", dR:-golpe, dC:0});
    evento = `<div class="fact"><strong class="neg">−${golpe} % de reserva</strong> por la emergencia${S.canoSucio?', más fuerte porque el caño del barrio está tapado de basura':''}.</div>`;
    dec.evento = false; dec._eventoAplicado = true;
    if(S.reserva<=0){ S.derrota=true; return pantallaFinal(); }
  }
  const botones = ops.map((o,i)=>{
    const sinEnergia = o.e && S.energia<1;
    return `<button class="opt" data-i="${i}" ${sinEnergia?'disabled':''}>
      <span>${o.e?'⚡ ':''}${o.t}</span>${sinEnergia?'<span class="cost">Sin energía</span>':''}</button>`;
  }).join('');
  layout(escena(dec.esc,{noche:dec.noche, dia:dec.dia}), `<div class="box" aria-live="polite">
    <h2>${dec.titulo}</h2>${evento}<p>${texto}</p><div class="opts">${botones}</div></div>`);
  G.querySelectorAll('.opt').forEach(b=>b.onclick=()=>aplicar(ops[+b.dataset.i], dec));
}

function deltaHtml(dR,dC){
  const r = dR? `<span class="${dR<0?'neg':'pos'}">${dR>0?'+':''}${dR} % reserva</span>`:'';
  const c = dC? `<span class="pos">+${dC} conciencia</span>`:'';
  return (r||c)? `<div class="delta">${r}${c}</div>`:'';
}

function pantallaConsecuencia(){
  hud(true);
  const {r,dec} = ultimo;
  layout(escena(dec.esc,{noche:dec.noche, dia:dec.dia}), `<div class="box" aria-live="polite">
    <h2>Consecuencia</h2>${deltaHtml(r.dR,r.dC)}<p>${r.msg}</p>
    <div class="row"><button class="primary" id="cont">Continuar</button></div></div>`);
  document.getElementById('cont').onclick = siguiente;
}

function pantallaResumen(dia, partes){
  hud(true, dia);
  const filas = partes.map(p=>`<tr><td>${p[0]}</td><td class="neg">${p[1]} %</td></tr>`).join('');
  const dato = DATOS[dia];
  const finNivel = (dia===2||dia===4||dia===6);
  layout(escena(D[S.paso-1].esc,{noche:true, dia}), `<div class="box">
    <h2>Fin del día ${dia}</h2>
    <p>Hoy el barrio gastó en total <strong>${S.gastoDia} %</strong> de su reserva.</p>
    <div class="tablewrap"><table>${filas}</table></div>
    <div class="fact">${dato[0]}<small>${dato[1]}</small></div>
    <div class="row"><button class="primary" id="cont">${finNivel?'Ver balance del nivel':'Empezar el día '+(dia+1)}</button></div></div>`);
  document.getElementById('cont').onclick = ()=> finNivel? pantallaBalance(NUMNIVEL[dia]) : iniciarDia();
}

function pantallaBalance(nivel){
  hud(true, nivel*2);
  const b = balance(nivel);
  layout(escena(nivel===1?'casa':nivel===2?'calle':'salon',{dia:nivel*2}), `<div class="box">
    <h2>Balance del nivel ${nivel}: ${NIVELES[nivel*2]}</h2>
    <p><strong>Objetivo:</strong> ${b.obj}</p>
    <div class="fact"><strong class="${b.ok?'pos':'neg'}">${b.ok?'Cumplido':'No cumplido'}</strong><br>${b.ok?b.si:b.no}</div>
    <div class="row"><button class="primary" id="cont">Ir al nivel ${nivel+1}</button></div></div>`);
  document.getElementById('cont').onclick = iniciarDia;
}

function tipoFinal(){
  if(S.derrota) return 'derrota';
  if(S.conciencia>=55 && S.reserva>20) return 'bueno';
  if(S.conciencia>=35) return 'intermedio';
  return 'malo';
}

function pantallaFinal(){
  // consumo del último día si se llegó al cierre
  if(!S.derrota && S.paso>=D.length-1){
    finDeDia();
    if(S.reserva<=0) S.derrota=true;
  }
  hud(false);
  const t = tipoFinal();
  const titulos = {
    derrota:"Barrio seco",
    malo:"Final malo",
    intermedio:"Final intermedio",
    bueno:"Final bueno"
  };
  const textos = {
    derrota:"La reserva se agotó antes de terminar la semana. El barrio quedó sin agua y dependiendo de carrotanques.",
    malo:"El barrio sobrevivió a la semana, pero nada cambió: el río sigue contaminado y los hábitos siguen iguales.",
    intermedio:"El barrio superó la crisis y algunos vecinos cambiaron sus hábitos, aunque todavía hay mucho por hacer.",
    bueno:"El barrio se organizó, el río se ve limpio y el comité del agua seguirá trabajando después de la crisis."
  };
  const personajes = [
    ["Abuela Rosa", (S.baldes||S.priorizo)?"Tuvo agua durante la crisis.":"Pasó días difíciles sin agua suficiente."],
    ["Camilo", S.camiloAliado?"Dejó de botar basura y ayuda a limpiar el caño.":"Sigue botando basura al caño."],
    ["Don Hernán", S.hernanAcepta?"Ahora barre su acera en lugar de lavarla.":"Sigue lavando la acera con manguera."],
    ["El barrio", S.comite?"Tiene un comité del agua con Nickole adentro.":(S.propuso?"Tuvo horarios de racionamiento ordenados.":"Se organizó poco.")]
  ];
  let peores = '';
  if(t==='derrota'){
    const lista = S.historial.filter(h=>h.dR<0).map(h=>({n:`Día ${h.dia}: ${h.op}`,v:h.dR}));
    if(S.perdidasFugas.lavadero) lista.push({n:"Fuga del lavadero sin arreglar",v:-S.perdidasFugas.lavadero});
    if(S.perdidasFugas.acera) lista.push({n:"Fuga de la acera sin reportar",v:-S.perdidasFugas.acera});
    lista.sort((a,b)=>a.v-b.v);
    peores = `<h3>Las decisiones que más agua consumieron</h3><div class="tablewrap"><table>${lista.slice(0,4).map(x=>`<tr><td>${x.n}</td><td class="neg">${x.v} %</td></tr>`).join('')}</table></div>`;
  }
  const aprendido = [
    "Los hábitos de cada día se acumulan y afectan a toda la comunidad.",
    "Cali depende casi por completo del río Cauca.",
    "El desperdicio en casa se suma a la sequía y la contaminación.",
    "Duchas cortas, cerrar la llave, arreglar fugas y reutilizar agua sí hacen diferencia.",
    "Cooperar con los vecinos cambia el resultado de una crisis."
  ];
  G.innerHTML = `<div class="game"><div>
    <div class="scene">${escena('mirador',{limpio:t==='bueno'||t==='intermedio', seco:t==='derrota'})}</div>
    <div class="box">
      <h2>${titulos[t]}</h2><p>${textos[t]}</p>
      <div class="delta"><span>Reserva final: ${S.reserva} %</span><span>Conciencia: ${S.conciencia}</span></div>
      ${peores}
      <h3>Qué pasó con cada uno</h3>
      <div class="tablewrap"><table>${personajes.map(p=>`<tr><td><strong>${p[0]}</strong></td><td>${p[1]}</td></tr>`).join('')}</table></div>
      ${S.bonos.length?`<p style="margin-top:12px">Objetivos de nivel cumplidos: ${S.bonos.join(', ')}.</p>`:''}
      <h3>Lo que muestra esta semana</h3>
      <ul>${aprendido.map(a=>`<li>${a}</li>`).join('')}</ul>
      <div class="row">
        <button class="primary" id="copiar">Copiar resumen para la prueba</button>
        <button class="secondary" id="volver">Volver al inicio</button>
      </div>
      <p id="copiado" class="note" aria-live="polite"></p>
    </div></div>${tank()}</div>`;
  const f = G.querySelector('.tank-fill');
  if(window.matchMedia('(max-width:720px)').matches){ f.style.height=''; } else { f.style.width=''; }
  document.getElementById('volver').onclick = reiniciarYMenu;
  document.getElementById('copiar').onclick = copiarResumen;
}

function copiarResumen(){
  const t = tipoFinal();
  const lineas = [
    `Resultado: ${t}`, `Reserva final: ${S.reserva} %`, `Conciencia final: ${S.conciencia}`,
    `Bonos de nivel: ${S.bonos.join(', ')||'ninguno'}`, `Decisiones:`,
    ...S.historial.map(h=>`- Día ${h.dia} (${h.sit}): ${h.op} [reserva ${h.dR}, conciencia +${h.dC}]`)
  ].join('\n');
  const msg = document.getElementById('copiado');
  try{
    navigator.clipboard.writeText(lineas).then(()=>msg.textContent='Resumen copiado. Pégalo en la tabla de pruebas.',
      ()=>{msg.textContent='No se pudo copiar automáticamente. Selecciona el texto:';mostrarTexto(lineas)});
  }catch(e){ msg.textContent='No se pudo copiar automáticamente. Selecciona el texto:'; mostrarTexto(lineas); }
}
function mostrarTexto(t){
  const ta = document.createElement('textarea'); ta.value=t; ta.rows=10; ta.style.width='100%';
  document.getElementById('copiado').after(ta); ta.select();
}

function reiniciarYMenu(){
  D.forEach(d=>{ if(d._eventoAplicado){ d.evento=true; d._eventoAplicado=false; } });
  S = nuevoEstado(); pantallaMenu();
}

/* Modal salir */
const M = document.getElementById('modal');
function abrirModal(){ M.classList.add('show'); document.getElementById('mNo').focus(); }
document.getElementById('mNo').onclick = ()=>M.classList.remove('show');
document.getElementById('mYes').onclick = ()=>{ M.classList.remove('show'); reiniciarYMenu(); };
document.addEventListener('keydown',e=>{ if(e.key==='Escape') M.classList.remove('show'); });

/* ===================== Escenarios en pixel art (SVG) ===================== */
function persona(x,y,camisa,pelo,piel='#C68B59'){
  return `<rect x="${x+2}" y="${y}" width="8" height="3" fill="${pelo}"/>
  <rect x="${x+2}" y="${y+3}" width="8" height="6" fill="${piel}"/>
  <rect x="${x}" y="${y+9}" width="12" height="12" fill="${camisa}"/>
  <rect x="${x+2}" y="${y+21}" width="3" height="8" fill="#2B2B3A"/>
  <rect x="${x+7}" y="${y+21}" width="3" height="8" fill="#2B2B3A"/>`;
}
const NICKOLE = (x,y)=>persona(x,y,'#2E8B8B','#3A2416') + `<rect x="${x+1}" y="${y+1}" width="2" height="10" fill="#3A2416"/><rect x="${x+9}" y="${y+1}" width="2" height="10" fill="#3A2416"/>`;

function escena(tipo,o){
  o=o||{};
  const head = `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" role="img" aria-label="Escena: ${tipo}">`;
  let s='';
  if(tipo==='casa'){
    const n=o.noche;
    s+=`<rect width="320" height="180" fill="${n?'#3B4A63':'#E9D9B8'}"/>`;
    s+=`<rect x="0" y="140" width="320" height="40" fill="${n?'#4A3B33':'#A9805A'}"/>`;
    // ventana
    s+=`<rect x="130" y="24" width="60" height="44" fill="#5A4030"/><rect x="134" y="28" width="52" height="36" fill="${n?'#152238':'#8FD0F0'}"/>`;
    s+= n?`<rect x="168" y="34" width="8" height="8" fill="#F2E8B0"/>`:`<rect x="140" y="34" width="10" height="10" fill="#F5C842"/>`;
    // ducha
    s+=`<rect x="14" y="40" width="70" height="100" fill="${n?'#55657A':'#CFE6EE'}"/><rect x="40" y="44" width="16" height="4" fill="#8A9AA6"/>`;
    s+=`<rect x="44" y="48" width="2" height="6" fill="#5BB0E0"/><rect x="50" y="50" width="2" height="6" fill="#5BB0E0"/>`;
    // lavadero
    s+=`<rect x="226" y="96" width="60" height="44" fill="#8C8C8C"/><rect x="232" y="100" width="48" height="12" fill="#6F6F6F"/><rect x="250" y="86" width="8" height="10" fill="#B0B0B0"/>`;
    if(S && S.lavaderoFuga){ s+=`<rect x="253" y="98" width="2" height="3" fill="#5BB0E0"/><rect x="253" y="104" width="2" height="3" fill="#5BB0E0"/><rect x="246" y="110" width="16" height="2" fill="#5BB0E0"/>`; }
    // patio
    if(S && S.patioMojado){ s+=`<rect x="190" y="150" width="120" height="6" fill="#5B8FB0" opacity=".8"/><rect x="210" y="160" width="70" height="4" fill="#5B8FB0" opacity=".8"/>`; }
    s+=NICKOLE(110,111);
    if(n) s+=`<rect width="320" height="180" fill="#0A1530" opacity=".25"/>`;
  }
  else if(tipo==='calle'){
    const st = S||{};
    s+=`<rect width="320" height="180" fill="${o.menu?'#F0C26A':'#9BD3EE'}"/>`;
    // Farallones al fondo
    s+=`<polygon points="0,90 40,50 80,80 130,40 180,78 230,46 280,82 320,60 320,100 0,100" fill="#5E8C6A"/>`;
    // casas
    s+=`<rect x="10" y="70" width="70" height="56" fill="#E7A65A"/><rect x="10" y="62" width="70" height="8" fill="#9C4A2E"/><rect x="24" y="84" width="14" height="14" fill="#6EB7D8"/><rect x="52" y="96" width="14" height="30" fill="#5A3A22"/>`;
    s+=`<rect x="90" y="78" width="60" height="48" fill="#EDE1C9"/><rect x="90" y="70" width="60" height="8" fill="#3C6E8C"/><rect x="104" y="92" width="12" height="12" fill="#6EB7D8"/>`;
    // tienda
    s+=`<rect x="160" y="66" width="90" height="60" fill="#D9573B"/><rect x="160" y="58" width="90" height="10" fill="#F4E2B0"/><text x="205" y="66" font-family="monospace" font-size="7" text-anchor="middle" fill="#7A2A18">TIENDA DON HERNÁN</text><rect x="174" y="84" width="62" height="42" fill="#3A2A20"/>`;
    s+=`<rect x="262" y="76" width="54" height="50" fill="#9FC48A"/><rect x="262" y="68" width="54" height="8" fill="#55704A"/>`;
    // acera y calle
    s+=`<rect x="0" y="126" width="320" height="12" fill="#B8B2A6"/><rect x="0" y="138" width="320" height="22" fill="#6C6C70"/>`;
    // acera mojada tienda
    if(o.dia===4 && !st.hernanAcepta && st.paso!==undefined && D[st.paso] && D[st.paso].dia===4){ s+=`<rect x="160" y="128" width="90" height="6" fill="#5B8FB0" opacity=".7"/>`; }
    // fuga acera
    if(st.aceraFuga || (o.dia===3 && !st.aceraReportada && D[st.paso] && D[st.paso].titulo==="Agua en la acera")){
      s+=`<rect x="120" y="122" width="4" height="6" fill="#5BB0E0"/><rect x="116" y="118" width="2" height="4" fill="#5BB0E0"/><rect x="126" y="118" width="2" height="4" fill="#5BB0E0"/><rect x="100" y="130" width="50" height="4" fill="#5BB0E0" opacity=".8"/>`;
    }
    // caño
    const sucio = st.canoSucio || o.menu;
    s+=`<rect x="0" y="160" width="320" height="20" fill="${sucio?'#6B5233':'#3F8FC8'}"/>`;
    if(sucio){ s+=`<rect x="30" y="164" width="10" height="6" fill="#DADADA"/><rect x="90" y="166" width="8" height="8" fill="#2F2F2F"/><rect x="150" y="163" width="12" height="6" fill="#C24A3A"/><rect x="230" y="166" width="10" height="7" fill="#E0D060"/><rect x="280" y="164" width="8" height="6" fill="#2F2F2F"/>`; }
    else { s+=`<rect x="40" y="168" width="20" height="2" fill="#8FD0F0"/><rect x="180" y="166" width="24" height="2" fill="#8FD0F0"/>`; }
    // personajes
    if(!o.menu){
      s+=NICKOLE(60,97);
      if(st.camiloAliado){ s+=persona(250,97,'#E0B030','#1E1E1E'); s+=`<rect x="264" y="104" width="2" height="22" fill="#8A6A3A"/>`; }
      else if(o.dia>=3){ s+=persona(250,97,'#E0B030','#1E1E1E'); s+=`<rect x="263" y="114" width="8" height="10" fill="#2F2F2F"/>`; }
      if(o.dia===5){ s+=`<rect x="190" y="104" width="80" height="26" fill="#2F6FA8"/><rect x="270" y="110" width="22" height="20" fill="#E8E8E8"/><rect x="198" y="126" width="12" height="10" fill="#1E1E1E"/><rect x="252" y="126" width="12" height="10" fill="#1E1E1E"/><text x="230" y="120" font-family="monospace" font-size="7" text-anchor="middle" fill="#fff">AGUA</text>`;
        s+=persona(150,97,'#8E5BA8','#CCCCCC') + persona(168,97,'#4F8A3C','#3A2416'); }
      if(o.dia===7 && st.comite){ s+=`<rect x="92" y="40" width="140" height="16" fill="#FFFFFF"/><text x="162" y="51" font-family="monospace" font-size="8" text-anchor="middle" fill="#2370AD">COMITÉ DEL AGUA</text>`; }
    }
  }
  else if(tipo==='salon'){
    const st=S||{};
    s+=`<rect width="320" height="180" fill="#D6CBB2"/><rect x="0" y="130" width="320" height="50" fill="#8A6B4A"/>`;
    s+=`<rect x="20" y="20" width="120" height="40" fill="#2F4F3A"/><text x="80" y="44" font-family="monospace" font-size="8" text-anchor="middle" fill="#F0F0E0">SALÓN COMUNAL</text>`;
    s+=`<rect x="200" y="70" width="34" height="60" fill="#2F6FA8"/><rect x="244" y="70" width="34" height="60" fill="#2F6FA8"/><rect x="200" y="${st.paso>=10?100:80}" width="34" height="2" fill="#8FD0F0"/>`;
    const n = st.reunion?6:2;
    const colores=['#8E5BA8','#4F8A3C','#C24A3A','#E0B030','#3C6E8C','#7A5230'];
    for(let i=0;i<n;i++){ s+=persona(20+i*26,101,colores[i],i%2?'#CCCCCC':'#1E1E1E'); }
    s+=NICKOLE(170,101);
  }
  else if(tipo==='mirador'){
    const limpio=o.limpio, seco=o.seco;
    s+=`<rect width="320" height="180" fill="${seco?'#E8B860':'#8CCBEA'}"/>`;
    s+=`<polygon points="0,90 50,40 100,76 160,30 220,70 270,44 320,80 320,110 0,110" fill="${seco?'#8A7A4A':'#4F7D5A'}"/>`;
    s+=`<rect x="0" y="110" width="320" height="70" fill="${seco?'#B08A50':'#6FA048'}"/>`;
    s+=`<polygon points="120,180 150,120 190,120 230,180" fill="${seco?'#8A6A3A':limpio?'#3F8FC8':'#6B5233'}"/>`;
    if(!limpio && !seco){ s+=`<rect x="160" y="140" width="8" height="5" fill="#DADADA"/><rect x="180" y="160" width="10" height="6" fill="#2F2F2F"/>`; }
    s+=NICKOLE(60,130);
  }
  return head + s + `</svg>`;
}

S = nuevoEstado();
pantallaMenu();
