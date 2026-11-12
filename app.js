// Belikes — comparação de altura e peso entre Pokémon e dragões de HTTYD
const POKEAPI = "https://pokeapi.co/api/v2";
const SPRITE = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

const state = {
  aba: "altura",
  humano: true,
  pessoa: null,
  slots: [
    { tipo: "pokemon", data: null, carregando: false },
    { tipo: "dragao", data: null, carregando: false }
  ]
};

let listaPokemon = [];        // { slug, nome, id, url }
let erroListaPokemon = false;
const cachePokemon = {};

// ---------- utilidades ----------
const $ = (sel, el = document) => el.querySelector(sel);
const fmt = (n, d = 1) => n.toLocaleString("pt-BR", { maximumFractionDigits: d });
const nomeBonito = s => s.split("-").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const sorteia = arr => arr[Math.floor(Math.random() * arr.length)];

function pesStr(m) {
  const totalPol = m * 39.3701;
  let pes = Math.floor(totalPol / 12);
  let pol = Math.round(totalPol - pes * 12);
  if (pol === 12) { pes++; pol = 0; }
  return `${pes}'${pol}"`;
}
const alturaStr = m => m < 1 ? `${fmt(m * 100, 0)} cm` : `${fmt(m, m < 10 ? 2 : 1)} m`;
const pesoStr = kg => kg >= 1000 ? `${fmt(kg / 1000, 2)} t` : kg < 1 ? `${fmt(kg * 1000, 0)} g` : `${fmt(kg, 1)} kg`;
function passoBonito(max) {
  const bruto = max / 5;
  const mag = Math.pow(10, Math.floor(Math.log10(bruto)));
  const r = bruto / mag;
  return (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * mag;
}
const miniDragao = url => url ? url + "/scale-to-width-down/96" : "";

// ---------- pessoa de referência (sorteada) ----------
let ultimaPessoa = -1;
function novaPessoa() {
  let n;
  do { n = Math.floor(Math.random() * PESSOAS.length); } while (PESSOAS.length > 1 && n === ultimaPessoa);
  ultimaPessoa = n;
  const p = PESSOAS[n];
  return { tipo: "humano", nome: "Humano", altura: p.altura, img: p.arquivo, cor: "#c7cde8", aproximado: true };
}

// ---------- imagens: recorta a borda transparente (para ficarem no chão) ----------
const cacheImg = {};
function prepararImagem(url) {
  if (!url) return Promise.resolve(null);
  if (cacheImg[url]) return cacheImg[url];
  cacheImg[url] = new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try { resolve(recortar(img)); }
      catch (e) { resolve({ src: url, ratio: img.naturalWidth / img.naturalHeight }); }
    };
    img.onerror = () => {
      const img2 = new Image(); // sem CORS (ex.: arquivo local): carrega sem recortar
      img2.onload = () => resolve({ src: url, ratio: img2.naturalWidth / img2.naturalHeight });
      img2.onerror = () => resolve(null);
      img2.src = url;
    };
    img.src = url;
  });
  return cacheImg[url];
}

function recortar(img) {
  const MAX = 700;
  const k = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (px[(y * w + x) * 4 + 3] > 20) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return { src: c.toDataURL(), ratio: w / h };
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
  const c2 = document.createElement("canvas");
  c2.width = cw; c2.height = ch;
  c2.getContext("2d").drawImage(c, x0, y0, cw, ch, 0, 0, cw, ch);
  return { src: c2.toDataURL("image/png"), ratio: cw / ch };
}

function placeholder(d, w, h, texto = "sem imagem") {
  return `<div class="sem-imagem" style="width:${w}px;height:${h}px;border-color:${d.cor};background:${d.cor}33">
    ${h > 30 && w > 50 ? texto : ""}</div>`;
}

// ---------- dados ----------
async function carregarListaPokemon() {
  try {
    const r = await fetch(`${POKEAPI}/pokemon?limit=1400`);
    const j = await r.json();
    listaPokemon = j.results.map(p => {
      const id = Number(p.url.match(/\/(\d+)\/?$/)[1]);
      return { slug: p.name, nome: nomeBonito(p.name), id, url: p.url };
    });
  } catch (e) {
    erroListaPokemon = true;
  }
}

async function carregarPokemon(item) {
  if (cachePokemon[item.slug]) return cachePokemon[item.slug];
  const r = await fetch(item.url);
  const j = await r.json();
  const d = {
    tipo: "pokemon",
    nome: item.nome,
    sub: `#${j.id < 10000 ? j.id : "forma"} · ${j.types.map(t => nomeBonito(t.type.name)).join(" / ")}`,
    altura: j.height / 10,
    peso: j.weight / 10,
    img: j.sprites?.other?.["official-artwork"]?.front_default || j.sprites?.front_default || "",
    cor: "#ee4035"
  };
  cachePokemon[item.slug] = d;
  return d;
}

function dadosDragao(dr) {
  return {
    tipo: "dragao",
    nome: dr.pt || dr.nome,
    sub: `${dr.pt ? dr.nome + " · " : ""}Classe ${dr.classe}${dr.tamanho ? " · " + dr.tamanho : ""}`,
    comprimento: dr.comprimento,
    alturaOficial: dr.altura,
    dimensao: dr.dimensao,
    semAltura: dr.altura == null,
    envergadura: dr.envergadura,
    peso: dr.peso,
    fonte: dr.fonte,
    nota: dr.nota,
    img: dr.img,
    cor: CLASSES[dr.classe] || CLASSES["Desconhecida"],
    wiki: dr.wiki
  };
}

// Calcula altura e largura (em metros) do desenho de cada figura
async function medir(d) {
  if (d.semAltura) return { ...d, indefinido: true };
  const im = await prepararImagem(d.img);
  const ratio = im ? im.ratio : null;
  let h, w, alturaCalculada = false;
  if (d.tipo === "pokemon" || d.tipo === "humano") {
    h = d.altura; w = h * (ratio || 1);
  } else {
    h = d.alturaOficial; w = ratio ? h * ratio : h * 1.5; // só altura oficial
  }
  return { ...d, im, h, w, alturaCalculada };
}

// ---------- busca com sugestões ----------
function candidatos(tipo) {
  if (tipo === "pokemon") {
    return listaPokemon.map(p => ({ chave: p.slug, nome: p.nome, sub: p.id < 10000 ? `#${p.id}` : "forma especial", img: SPRITE(p.id), busca: [norm(p.nome)] }));
  }
  return DRAGOES.map((d, i) => ({ chave: i, nome: d.pt || d.nome, sub: (d.pt ? d.nome + " · " : "") + d.classe, img: miniDragao(d.img), busca: [norm(d.nome), norm(d.pt || "")].filter(Boolean) }));
}

function filtrar(tipo, texto) {
  const q = norm(texto);
  const todos = candidatos(tipo);
  if (!q) return todos.slice(0, 40);
  const comeca = [], contem = [];
  for (const c of todos) {
    if (c.busca.some(b => b.startsWith(q))) comeca.push(c);
    else if (c.busca.some(b => b.includes(q))) contem.push(c);
  }
  return [...comeca, ...contem].slice(0, 40);
}

function montarBusca(i) {
  const el = $(`.slot[data-slot="${i}"]`);
  const input = $("input", el), lista = $(".sugestoes", el);
  let itens = [], ativo = -1;

  const fechar = () => { lista.hidden = true; ativo = -1; };
  const destacar = n => {
    ativo = n;
    lista.querySelectorAll("li").forEach((li, k) => li.classList.toggle("ativo", k === n));
    lista.children[n]?.scrollIntoView({ block: "nearest" });
  };
  const abrir = () => {
    itens = filtrar(state.slots[i].tipo, input.value);
    if (!itens.length) { lista.innerHTML = `<li class="vazio">Nada encontrado</li>`; lista.hidden = false; return; }
    lista.innerHTML = itens.map((c, k) => `<li data-k="${k}">
        ${c.img ? `<img src="${c.img}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'mini-vazia',textContent:'?'}))">` : `<span class="mini-vazia">?</span>`}
        <span class="txt"><b>${c.nome}</b><small>${c.sub}</small></span>
      </li>`).join("");
    lista.hidden = false;
    destacar(0);
  };
  const escolher = c => { fechar(); escolherItem(i, c); };

  input.addEventListener("input", abrir);
  input.addEventListener("focus", () => { input.select(); abrir(); });
  input.addEventListener("keydown", e => {
    if (lista.hidden && (e.key === "ArrowDown" || e.key === "Enter")) abrir();
    if (e.key === "ArrowDown") { e.preventDefault(); destacar(Math.min(ativo + 1, itens.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); destacar(Math.max(ativo - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (itens[ativo]) escolher(itens[ativo]); }
    else if (e.key === "Escape") fechar();
  });
  lista.addEventListener("mousedown", e => {
    const li = e.target.closest("li[data-k]");
    if (li) { e.preventDefault(); escolher(itens[Number(li.dataset.k)]); }
  });
  input.addEventListener("blur", () => setTimeout(fechar, 100));
}

async function escolherItem(i, c) {
  const slot = state.slots[i];
  const input = $(`.slot[data-slot="${i}"] input`);
  input.value = c.nome;
  if (slot.tipo === "pokemon") {
    const item = listaPokemon.find(p => p.slug === c.chave);
    slot.carregando = true; renderResumo(i);
    try { slot.data = await carregarPokemon(item); }
    catch (e) { slot.carregando = false; return mostrarErro(i, "Não consegui carregar da PokeAPI (sem internet?)."); }
    slot.carregando = false;
  } else {
    slot.data = dadosDragao(DRAGOES[c.chave]);
  }
  input.blur();
  renderTudo();
}

function aleatorio(i) {
  const lista = candidatos(state.slots[i].tipo);
  if (lista.length) escolherItem(i, sorteia(lista));
}

function mudarTipo(i, tipo) {
  state.slots[i].tipo = tipo;
  state.slots[i].data = null;
  const input = $(`.slot[data-slot="${i}"] input`);
  input.value = "";
  input.placeholder = tipo === "pokemon" ? "Digite um Pokémon..." : "Digite um dragão...";
  renderTudo();
}

// ---------- render ----------
function mostrarErro(i, msg) {
  $(`.slot[data-slot="${i}"] .resumo`).innerHTML = `<span class="erro">${msg}</span>`;
}

function renderResumo(i) {
  const slot = state.slots[i];
  const el = $(`.slot[data-slot="${i}"]`);
  el.querySelectorAll(".tipo-toggle button").forEach(b => b.classList.toggle("ativo", b.dataset.tipo === slot.tipo));
  const res = $(".resumo", el);
  if (slot.carregando) { res.textContent = "Carregando..."; return; }
  if (slot.tipo === "pokemon" && erroListaPokemon) {
    res.innerHTML = `<span class="erro">Não consegui acessar a PokeAPI. Verifique a internet e recarregue.</span>`;
    return;
  }
  const d = slot.data;
  if (!d) { res.textContent = "Escolha alguém para comparar."; return; }
  const peso = d.peso != null ? `⚖️ ${pesoStr(d.peso)} (${fmt(d.peso * 2.20462, d.peso * 2.20462 < 10 ? 1 : 0)} lb)` : `⚖️ sem peso oficial`;
  if (d.tipo === "pokemon") {
    res.innerHTML = `<strong>${d.nome}</strong><br>${d.sub}<br>📏 ${alturaStr(d.altura)} (${pesStr(d.altura)}) · ${peso}`;
  } else {
    const medidas = [];
    if (d.alturaOficial != null) medidas.push(`${alturaStr(d.alturaOficial)} de altura`);
    if (d.comprimento != null) medidas.push(`${alturaStr(d.comprimento)} de ${d.dimensao || "comprimento"}`);
    if (d.envergadura != null) medidas.push(`${alturaStr(d.envergadura)} de envergadura`);
    let info = "";
    if (d.fonte) info = `<div class="nota-est"><span class="selo">fonte</span> ${d.fonte}${d.nota ? `. <i>Obs.: ${d.nota}.</i>` : ""}</div>`;
    res.innerHTML = `<strong>${d.nome}</strong> <a class="selo" href="${d.wiki}" target="_blank" rel="noopener">wiki ↗</a><br>${d.sub}<br>
      📏 ${medidas.length ? medidas.join(" · ") : "sem medidas oficiais"}<br>${peso}
      ${d.alturaOficial == null ? `<div class="nota-est">Sem altura oficial: não entra na comparação de altura.</div>` : ""}
      ${info}`;
  }
}

function fraseComparacao(a, b, va, vb, maior) {
  if (!va || !vb) return "";
  if (Math.abs(va - vb) / Math.max(va, vb) < 0.02) return `<b>${a.nome}</b> e <b>${b.nome}</b> estão praticamente empatados!`;
  const [g, p, r] = va > vb ? [a, b, va / vb] : [b, a, vb / va];
  return `<b>${g.nome}</b> é <b>${fmt(r, r < 10 ? 1 : 0)}×</b> ${maior} que <b>${p.nome}</b>`;
}

let tokenAltura = 0;
async function renderAltura() {
  const meu = ++tokenAltura;
  const palco = $("#palco-altura");
  const lista = [];
  if (state.slots[0].data) lista.push(state.slots[0].data);
  if (state.humano && state.pessoa) lista.push(state.pessoa);
  if (state.slots[1].data) lista.push(state.slots[1].data);
  if (!lista.length) { palco.innerHTML = ""; $("#frase-altura").innerHTML = ""; return; }

  const figs = await Promise.all(lista.map(medir));
  if (meu !== tokenAltura) return;

  const medidas = figs.filter(f => !f.indefinido);
  const alturaChao = palco.clientHeight * 0.15;
  const espacoUtil = palco.clientHeight - alturaChao - 70;
  const maxH = medidas.length ? Math.max(...medidas.map(f => f.h)) : 1;
  const escala = espacoUtil / maxH;

  let html = "";
  if (medidas.length) {
    const passo = passoBonito(maxH);
    for (let v = passo; v <= maxH * 1.02; v += passo) {
      html += `<div class="regua-linha" style="bottom:${alturaChao + v * escala}px"><span>${alturaStr(v)}</span></div>`;
    }
  }
  html += `<div class="figuras" style="bottom:${alturaChao}px">`;
  for (const f of figs) {
    if (f.indefinido) {
      const extra = f.comprimento != null ? `<br><small>${alturaStr(f.comprimento)} de ${f.dimensao || "comprimento"} (oficial)</small>` : "";
      html += `<div class="figura"><div class="rotulo"><b>${f.nome}</b>altura não informada${extra}</div>${placeholder(f, 90, 90, "?")}</div>`;
      continue;
    }
    const hp = Math.max(2, f.h * escala), wp = Math.max(2, f.w * escala);
    let visual;
    if (f.im) visual = `<img src="${f.im.src}" alt="${f.nome}" style="height:${hp}px;width:${wp}px">`;
    else visual = placeholder(f, wp, hp);
    let txt = (f.alturaCalculada || f.aproximado ? "≈ " : "") + alturaStr(f.h);
    html += `<div class="figura">
      <div class="rotulo"><b>${f.nome}</b>${txt}${hp < 14 ? '<div class="minusculo">▼ está aqui!</div>' : ""}</div>
      ${visual}
    </div>`;
  }
  html += `</div>`;
  palco.innerHTML = html;

  const [a, b] = [figs[0], figs[figs.length - 1]];
  let frase = "";
  if (state.slots[0].data && state.slots[1].data) {
    frase = a.indefinido || b.indefinido
      ? `Não dá pra comparar a altura: <b>${(a.indefinido ? a : b).nome}</b> não tem altura oficial.`
      : fraseComparacao(a, b, a.h, b.h, "mais alto");
  }
  $("#frase-altura").innerHTML = frase;
}

function equivalenciasDe(kg) {
  const refs = [
    { nome: "bolas de futebol", emoji: "⚽", kg: 0.43 },
    { nome: "gatos", emoji: "🐈", kg: 4.5 },
    { nome: "pessoas adultas", emoji: "🧍", kg: 70 },
    { nome: "carros populares", emoji: "🚗", kg: 1100 },
    { nome: "elefantes-africanos", emoji: "🐘", kg: 6000 },
    { nome: "baleias-azuis", emoji: "🐋", kg: 150000 }
  ];
  return refs
    .map(r => ({ ...r, qtd: kg / r.kg }))
    .filter(r => r.qtd >= 0.1 && r.qtd <= 5000)
    .map(r => `<li>≈ ${fmt(r.qtd, r.qtd < 10 ? 1 : 0)} ${r.nome} ${r.emoji}</li>`)
    .join("");
}

let tokenPeso = 0;
async function renderPeso() {
  const meu = ++tokenPeso;
  const palco = $("#palco-peso");
  const [a, b] = [state.slots[0].data, state.slots[1].data];
  const [ia, ib] = await Promise.all([a ? prepararImagem(a.img) : null, b ? prepararImagem(b.img) : null]);
  if (meu !== tokenPeso) return;

  const pa = a?.peso ?? 0, pb = b?.peso ?? 0;
  const ambosDefinidos = a?.peso != null && b?.peso != null;
  const angulo = ambosDefinidos ? ((pb - pa) / (pa + pb)) * 16 : 0;
  const caixa = (d, im) => {
    if (!im) return placeholder(d, 130, 90);
    const [w, h] = im.ratio >= 1 ? [130, 130 / im.ratio] : [130 * im.ratio, 130];
    return `<img src="${im.src}" alt="${d.nome}" style="width:${w}px;height:${h}px">`;
  };
  const prato = (d, im, lado) => d
    ? `<div class="prato ${lado}" style="transform:rotate(${-angulo}deg)">${caixa(d, im)}<div class="rotulo"><b>${d.nome}</b><br>${d.peso != null ? pesoStr(d.peso) : "sem peso oficial"}</div></div>`
    : `<div class="prato ${lado}"><div class="rotulo">vazio</div></div>`;

  palco.innerHTML = `<div class="gangorra">
      <div class="apoio"></div>
      <div class="viga" style="transform:rotate(${angulo}deg)">${prato(a, ia, "esq")}${prato(b, ib, "dir")}</div>
    </div>`;

  let frase = "";
  if (a && b) {
    frase = ambosDefinidos
      ? fraseComparacao(a, b, a.peso, b.peso, "mais pesado")
      : `Não dá pra comparar o peso: <b>${(a.peso == null ? a : b).nome}</b> não tem peso oficial.`;
  }
  $("#frase-peso").innerHTML = frase;

  const lista = [a, b].filter(d => d && d.peso != null);
  const max = Math.max(1, ...lista.map(d => d.peso));
  $("#barras-peso").innerHTML = lista.map(d => `
    <div class="barra">
      <span class="nome">${d.nome}</span>
      <div class="trilho"><div class="preenchido" style="width:${(d.peso / max) * 100}%;background:${d.cor}"></div></div>
      <span class="valor">${pesoStr(d.peso)}</span>
    </div>`).join("");

  $("#equivalencias").innerHTML = lista.map(d => `
    <div class="equiv"><h3>${d.nome} pesa o mesmo que...</h3><ul>${equivalenciasDe(d.peso) || "<li>algo bem leve!</li>"}</ul></div>`).join("");
}

function renderTudo() {
  renderResumo(0);
  renderResumo(1);
  if (state.aba === "altura") renderAltura(); else renderPeso();
}

// ---------- eventos ----------
function ligarEventos() {
  document.querySelectorAll(".aba").forEach(btn => btn.addEventListener("click", () => {
    state.aba = btn.dataset.aba;
    document.querySelectorAll(".aba").forEach(b => b.classList.toggle("ativa", b === btn));
    $("#painel-altura").hidden = state.aba !== "altura";
    $("#painel-peso").hidden = state.aba !== "peso";
    renderTudo();
  }));

  $("#mostrar-humano").addEventListener("change", e => {
    state.humano = e.target.checked;
    if (state.humano) state.pessoa = novaPessoa(); // pessoa nova a cada vez que liga
    renderAltura();
  });

  document.querySelectorAll(".slot").forEach(el => {
    const i = Number(el.dataset.slot);
    el.querySelectorAll(".tipo-toggle button").forEach(b => b.addEventListener("click", () => mudarTipo(i, b.dataset.tipo)));
    $(".aleatorio", el).addEventListener("click", () => aleatorio(i));
    montarBusca(i);
  });

  let t;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(renderTudo, 150); });
}

// ---------- início ----------
(async function iniciar() {
  $("#total-dragoes").textContent = DRAGOES.length;
  state.pessoa = novaPessoa();
  ligarEventos();
  mudarTipo(0, "pokemon");
  mudarTipo(1, "dragao");
  await carregarListaPokemon();
  const chari = candidatos("pokemon").find(c => c.chave === "charizard");
  if (chari) await escolherItem(0, chari);
  const nf = candidatos("dragao").find(c => c.nome === "Fúria da Noite");
  if (nf) await escolherItem(1, nf);
})();
