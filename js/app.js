const state = {
  view: "hoje",
  pessoa: localStorage.getItem("isac-pessoa") || "todos",
  cal: "tudo",
  status: "todos",
  slide: 0,
  deck: "tudo",
  legal: "termos",
};

// Textos dos termos já baixados (para não buscar de novo a cada clique)
const LEGAL_CACHE = {};

const SLIDES = [
  { grupo: "Apresentação", titulo: "Capa", texto: "A economia do bairro, organizada, sustentando quem cuida dele.", src: "midia/escopo/01-capa.jpg" },
  { grupo: "Apresentação", titulo: "A visão", texto: "O valor já circula no grupo de WhatsApp. Falta organizar.", src: "midia/escopo/02-visao.jpg" },
  { grupo: "Apresentação", titulo: "O problema", texto: "Comunidade e instituição. A raiz é a mesma.", src: "midia/escopo/03-problema.jpg" },
  { grupo: "Apresentação", titulo: "Em uma frase", texto: "Receita recorrente para o ISAC. A meta mostrada no slide é cerca de R$ 2.000 por mês.", src: "midia/escopo/04-frase.jpg" },
  { grupo: "Apresentação", titulo: "Pilares", texto: "Motor de IA, modelo de dois lados e painel de impacto.", src: "midia/escopo/05-pilares.jpg" },
  { grupo: "Apresentação", titulo: "Como funciona", texto: "Mensagem bruta, IA extrai, card estruturado, vitrine com busca.", src: "midia/escopo/06-como-funciona.jpg" },
  { grupo: "Apresentação", titulo: "Escopo do MVP", texto: "Essencial, se der tempo, e futuro. WhatsApp ao vivo fica fora desta entrega.", src: "midia/escopo/07-escopo.jpg" },
  { grupo: "Apresentação", titulo: "Otimizações", texto: "Importar a conversa, alerta de golpe, dados do Cabo e planos.", src: "midia/escopo/08-otimizacoes.jpg" },
  { grupo: "Apresentação", titulo: "Stack e time", texto: "Front, banco, IA e pagamentos. O slide ainda fala em dez pessoas.", src: "midia/escopo/09-stack.jpg" },
  { grupo: "Apresentação", titulo: "Identidade visual", texto: "Petróleo, oliva, coral e areia. Fonte Inter no produto.", src: "midia/escopo/10-identidade.jpg" },
  { grupo: "Apresentação", titulo: "Onde estamos", texto: "Design pronto. Construção em andamento.", src: "midia/escopo/11-status.jpg" },
  { grupo: "Apresentação", titulo: "Fechamento", texto: "Perguntas e ajustes de escopo.", src: "midia/escopo/12-fechamento.jpg" },
  { grupo: "Figma", titulo: "Vitrine", texto: "Consulta aberta, filtros e destaques.", src: "midia/telas/01-vitrine.png" },
  { grupo: "Figma", titulo: "Vitrine com anúncios", texto: "Lista do bairro, com destaque e anúncios agrupados.", src: "midia/telas/06-vitrine-lista.png" },
  { grupo: "Figma", titulo: "Detalhe importado", texto: "Anúncio vindo do grupo, com o aviso de negociar com segurança.", src: "midia/telas/02-detalhe.png" },
  { grupo: "Figma", titulo: "Detalhe verificado", texto: "Comércio com selo do ISAC.", src: "midia/telas/07-detalhe-verificado.png" },
  { grupo: "Figma", titulo: "Publicar · importar", texto: "Passo 1. Colar uma mensagem ou importar a conversa.", src: "midia/telas/03-publicar-entrada.png" },
  { grupo: "Figma", titulo: "Publicar · morador", texto: "Entrada em texto livre, do jeito que a pessoa falaria no grupo.", src: "midia/telas/08-publicar-morador.png" },
  { grupo: "Figma", titulo: "Publicar · leitura", texto: "Passo 2. A IA separa anúncio, preço, categoria e contato.", src: "midia/telas/04-publicar-leitura.png" },
  { grupo: "Figma", titulo: "Publicar · revisão", texto: "Passo 3. A pessoa confere, descarta o que parece golpe e publica.", src: "midia/telas/05-publicar-revisao.png" },
  { grupo: "Figma", titulo: "Entrar", texto: "Login com e-mail e senha. No protótipo da reta final, morador entra com nome e telefone.", src: "midia/telas/09-login.png" },
  { grupo: "Figma", titulo: "Carregando", texto: "A vitrine enquanto organiza os anúncios.", src: "midia/telas/10-carregando.png" },
  { grupo: "Figma", titulo: "Sem resultados", texto: "Busca vazia, com caminho para limpar os filtros.", src: "midia/telas/11-sem-resultados.png" },
  { grupo: "Figma", titulo: "Erro da IA", texto: "A análise falhou e a pessoa pode tentar de novo.", src: "midia/telas/12-erro-ia.png" },
];

function slidesVisiveis() {
  if (state.deck === "apresentacao") return SLIDES.filter((item) => item.grupo === "Apresentação");
  if (state.deck === "figma") return SLIDES.filter((item) => item.grupo === "Figma");
  return SLIDES;
}

const COR = {
  vanessa: "#c4b5fd",
  matheus: "#f9a8d4",
  james: "#93c5fd",
  kaio: "#6ee7b7",
  demetrius: "#fcd34d",
  joao: "#fdba74",
  thawana: "#67e8f9",
  suedson: "#fda4af",
  luan: "#a5b4fc",
};

const FLUXO = [
  { nome: "Front", texto: "Cola o texto bruto.", pessoas: ["thawana", "suedson"] },
  { nome: "API", texto: "Recebe e chama a IA.", pessoas: ["james"] },
  { nome: "IA", texto: "Extrai campos e marca repetido.", pessoas: ["demetrius", "joao"] },
  { nome: "Banco", texto: "Guarda o anúncio pendente.", pessoas: ["kaio"] },
  { nome: "Moderação", texto: "Aprova, recusa ou pede ajuste.", pessoas: ["luan"] },
  { nome: "Vitrine", texto: "Mostra só o anúncio ativo.", pessoas: ["thawana"] },
];

const $ = (sel, root = document) => root.querySelector(sel);

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]));
}

function parseISO(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function fimDoDia(iso) {
  const date = parseISO(iso);
  date.setHours(23, 59, 59, 0);
  return date;
}

function today() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function capital(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

function daysBetween(from, to) {
  return Math.round((to - from) / 86400000);
}

function fmt(date, style = "long") {
  const options = style === "short"
    ? { weekday: "short", day: "numeric", month: "short" }
    : { weekday: "long", day: "numeric", month: "long" };
  return new Intl.DateTimeFormat("pt-BR", options).format(date);
}

function periodoCurto(fase) {
  const mes = (date) => new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "");
  const ini = parseISO(fase.inicio);
  const fim = parseISO(fase.fim);
  if (fase.inicio === fase.fim) return `${ini.getDate()} ${mes(ini)}`;
  if (ini.getMonth() === fim.getMonth()) return `${ini.getDate()}–${fim.getDate()} ${mes(ini)}`;
  return `${ini.getDate()} ${mes(ini)} – ${fim.getDate()} ${mes(fim)}`;
}

function quando(date, base = today()) {
  const diff = daysBetween(base, date);
  if (diff < 0) return `há ${Math.abs(diff)} ${Math.abs(diff) === 1 ? "dia" : "dias"}`;
  if (diff === 0) return "hoje";
  if (diff === 1) return "amanhã";
  return `em ${diff} dias`;
}

function pessoa(id) {
  return PLANO.pessoas.find((item) => item.id === id);
}

function nomes(ids) {
  if (!ids || ids.includes("todos")) return "Todos";
  return ids.map((id) => pessoa(id)?.nome || id).join(", ");
}

function situacaoDe(item) {
  if (item.situacao === "pronto" || item.situacao === "parcial" || item.situacao === "falta") return item.situacao;
  const prazo = item.prazo || item.data;
  if (prazo && parseISO(prazo) < today()) return "atrasado";
  return "pendente";
}

function rotulo(status) {
  return { pronto: "Pronto", parcial: "Parcial", falta: "Em aberto", pendente: "A fazer", atrasado: "Atrasado" }[status];
}

function passaStatus(status) {
  if (state.status === "todos") return true;
  if (state.status === "aberto") return status === "falta" || status === "pendente" || status === "atrasado";
  return status === state.status;
}

function iniciais(nome) {
  const partes = nome.split(" ").filter(Boolean);
  if (partes.length < 2) return partes[0].slice(0, 1).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function badge(id) {
  const item = pessoa(id);
  if (!item) return "";
  return `<span class="badge" style="--c:${COR[id] || "#a7b3c7"}"><i>${esc(iniciais(item.nome))}</i>${esc(item.nome)}</span>`;
}

function badges(ids) {
  if (!ids || ids.includes("todos")) return `<span class="badge todos">Grupo todo</span>`;
  return ids.map(badge).join("");
}

function foco(ids) {
  if (state.pessoa === "todos") return "";
  const lista = Array.isArray(ids) ? ids : [ids];
  return lista.includes(state.pessoa) ? "foco" : "dim";
}

function icon(tipo) {
  const pasta = '<path d="M3.2 7.4c0-1.3 1-2.4 2.4-2.4h3.4l1.7 1.9h7.7c1.3 0 2.4 1.1 2.4 2.4v8.2c0 1.3-1.1 2.4-2.4 2.4H5.6c-1.3 0-2.4-1.1-2.4-2.4V7.4z"/>';
  const paths = {
    front: pasta,
    api: pasta,
    db: pasta,
    docs: pasta,
    ia: '<path d="M12 2.2 13.6 8.4 20 10l-6.4 1.6L12 17.8 10.4 11.6 4 10l6.4-1.6L12 2.2z"/>',
    design: '<path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"/>',
    alerta: '<path d="M12 3.2 2.8 20h18.4L12 3.2zm0 6.2a.9.9 0 0 1 .9.9v4.2a.9.9 0 0 1-1.8 0v-4.2a.9.9 0 0 1 .9-.9zM12 17.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z"/>',
  };
  // Ícones de traço (linha), usados nos títulos e nos blocos novos
  const linhas = {
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/>',
    pessoas: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5S14.4 16 15 19"/><circle cx="17" cy="9" r="2.2"/><path d="M16 14.5c2.2.2 3.8 1.4 4.5 3.5"/>',
    chave: '<path d="M14.5 6.5a3.5 3.5 0 1 1-1 5L6 19H4v-2l7.5-7.5"/><path d="M8 17l1.5 1.5"/>',
    lampada: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    caminho: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.5"/>',
    pasta: '<path d="M3 7.5A2 2 0 0 1 5 5.5h4l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-10z"/>',
    etapas: '<path d="M4 6h16M4 12h10M4 18h6"/>',
    alvo: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    reuniao: '<path d="M4 6h16v10H8l-4 4V6z"/><path d="M8 10h8M8 13h5"/>',
    sino: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    trofeu: '<path d="M6 4h12v3a6 6 0 0 1-12 0V4z"/><path d="M6 6H4.5A2.5 2.5 0 0 0 7 10M18 6h1.5A2.5 2.5 0 0 1 17 10"/><path d="M12 13v3M9 20h6M10 16h4"/>',
    escudo: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
    par: '<path d="M4 12h14M13 7l5 5-5 5"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>',
    dinheiro: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  };
  if (linhas[tipo]) return `<span class="glyph glyph-${tipo}"><svg class="traco" viewBox="0 0 24 24" aria-hidden="true">${linhas[tipo]}</svg></span>`;
  return `<span class="glyph glyph-${tipo}"><svg viewBox="0 0 24 24" aria-hidden="true">${paths[tipo] || pasta}</svg></span>`;
}

// Título de seção com ícone, para dar hierarquia visual a cada bloco
function tituloSecao(tipo, texto) {
  return `<h3 class="titulo-icone">${icon(tipo)}<span>${esc(texto)}</span></h3>`;
}

// Pílula de status no estilo Monday: bloco de cor cheia, fácil de ler de longe
function pill(status, texto) {
  return `<span class="pill ${status}">${esc(texto || rotulo(status))}</span>`;
}

function entregasDaPessoa(id) {
  return PLANO.entregas
    .filter((item) => item.pessoa === id || item.pessoa === "todos")
    .sort((a, b) => a.prazo.localeCompare(b.prazo));
}

function resumo(itens) {
  let pontos = 0;
  let prontos = 0;
  let parciais = 0;
  let abertos = 0;
  itens.forEach((item) => {
    const status = situacaoDe(item);
    if (status === "pronto") { pontos += 1; prontos += 1; }
    else if (status === "parcial") { pontos += 0.5; parciais += 1; }
    else abertos += 1;
  });
  const total = itens.length || 1;
  return { total: itens.length, prontos, parciais, abertos, pct: Math.round((pontos / total) * 100) };
}

function pessoaAtiva() {
  return state.pessoa === "todos" ? null : pessoa(state.pessoa);
}

function relogio(instante) {
  const diff = instante.getTime() - Date.now();
  const abs = Math.abs(diff);
  const total = Math.floor(abs / 1000);
  return {
    atrasado: diff < 0,
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

function fraseRelogio(partes) {
  if (partes.atrasado) {
    if (partes.d === 0) return "O prazo deste dia já passou.";
    return `Atrasado há ${partes.d} ${partes.d === 1 ? "dia" : "dias"}.`;
  }
  if (partes.d === 0 && partes.h === 0 && partes.m === 0) return "Falta menos de 1 minuto.";
  const pedacos = [];
  if (partes.d > 0) pedacos.push(`${partes.d} ${partes.d === 1 ? "dia" : "dias"}`);
  if (partes.h > 0) pedacos.push(`${partes.h} ${partes.h === 1 ? "hora" : "horas"}`);
  if (partes.m > 0) pedacos.push(`${partes.m} ${partes.m === 1 ? "minuto" : "minutos"}`);
  if (pedacos.length === 1) return `Falta ${pedacos[0]}.`;
  const ultimo = pedacos.pop();
  return `Faltam ${pedacos.join(", ")} e ${ultimo}.`;
}

function alvoEtapa() {
  const agora = new Date();
  const futura = PLANO.fases.find((fase) => parseISO(fase.inicio) > agora);
  if (futura) return { fase: futura, instante: parseISO(futura.inicio), modo: "começa" };
  const aberta = PLANO.fases.find((fase) => agora >= parseISO(fase.inicio) && agora <= fimDoDia(fase.fim));
  if (aberta) return { fase: aberta, instante: fimDoDia(aberta.fim), modo: "fecha" };
  return null;
}

function alvoEntrega() {
  const agora = new Date();
  const atual = pessoaAtiva();
  if (atual) {
    const tarefas = PLANO.entregas
      .filter((item) => item.pessoa === atual.id && situacaoDe(item) !== "pronto")
      .sort((a, b) => a.prazo.localeCompare(b.prazo));
    const proxima = tarefas.find((item) => fimDoDia(item.prazo) > agora) || tarefas[0];
    if (!proxima) return null;
    return {
      titulo: proxima.titulo,
      detalhe: proxima.detalhe,
      pessoas: [atual.id],
      instante: fimDoDia(proxima.prazo),
      data: proxima.prazo,
      onde: atual.frente,
    };
  }
  return PLANO.marcos
    .map((item) => ({ ...item, instante: fimDoDia(item.data) }))
    .filter((item) => (item.tipo === "cobranca" || item.tipo === "reuniao") && item.instante > agora)
    .sort((a, b) => a.instante - b.instante)[0] || null;
}

function clockHTML(instante) {
  const partes = relogio(instante);
  const n = (valor) => String(valor).padStart(2, "0");
  return `
    <div class="clock${partes.atrasado ? " atrasado" : ""}" data-ts="${instante.getTime()}">
      <div class="unit"><b data-d>${n(partes.d)}</b><span>dias</span></div>
      <div class="unit"><b data-h>${n(partes.h)}</b><span>horas</span></div>
      <div class="unit"><b data-m>${n(partes.m)}</b><span>min</span></div>
      <div class="unit"><b data-s>${n(partes.s)}</b><span>seg</span></div>
    </div>
    <p class="clock-frase" data-frase>${esc(fraseRelogio(partes))}</p>`;
}

function tick() {
  document.querySelectorAll(".clock[data-ts]").forEach((clock) => {
    const partes = relogio(new Date(Number(clock.dataset.ts)));
    const n = (valor) => String(valor).padStart(2, "0");
    clock.querySelector("[data-d]").textContent = n(partes.d);
    clock.querySelector("[data-h]").textContent = n(partes.h);
    clock.querySelector("[data-m]").textContent = n(partes.m);
    const segundos = clock.querySelector("[data-s]");
    if (segundos.textContent !== n(partes.s)) {
      segundos.textContent = n(partes.s);
      segundos.classList.remove("pulso");
      void segundos.offsetWidth;
      segundos.classList.add("pulso");
    }
    clock.classList.toggle("atrasado", partes.atrasado);
    const frase = clock.nextElementSibling;
    if (!frase || !frase.dataset.frase) return;
    const texto = fraseRelogio(partes);
    if (frase.textContent !== texto) frase.textContent = texto;
  });
}

function arvore() {
  const repo = (id) => PLANO.repos.find((item) => item.id === id);
  return [
    {
      tipo: "front",
      nome: repo("front").repo,
      dono: ["thawana"],
      nota: repo("front").nota,
      links: [],
      filhos: [
        { nome: "Vitrine", nota: "Consulta aberta, filtros e card.", dono: ["thawana"] },
        { nome: "Publicar", nota: "Três passos. Depende do contrato.", dono: ["suedson"] },
        { nome: "Meus anúncios", nota: "Editar, excluir, encerrar e ver o retorno.", dono: ["suedson"] },
        { nome: "Equipe", nota: "Entrar, moderar, admin e impacto.", dono: ["luan"] },
      ],
    },
    {
      tipo: "api",
      nome: "api-isac-conecta",
      dono: ["james"],
      nota: repo("api").nota,
      links: PLANO.links.api ? [{ href: PLANO.links.api, rotulo: "Abrir repositório" }] : [],
      filhos: [
        { nome: "src/main.ts", nota: "Porta e CORS.", dono: ["james"] },
        { nome: "src/ads", nota: "Listar, classificar e moderar.", dono: ["james"] },
        { nome: "src/impact", nota: "Soma a parte do ISAC e compara com R$ 2.000.", dono: ["james"] },
        { nome: "src/ia", nota: "Extração, plano B, repetido e golpe.", dono: ["demetrius", "joao"] },
      ],
    },
    {
      tipo: "db",
      nome: "Supabase",
      dono: ["kaio"],
      nota: "Categorias, perfis, anúncios e regras de acesso.",
      links: [],
      filhos: [
        { nome: "Categorias", nota: "Seis fixas.", dono: ["kaio"] },
        { nome: "Perfis", nota: "Plano, selo e aceite dos termos.", dono: ["kaio"] },
        { nome: "Anúncios", nota: "Cinco status e campos da moderação.", dono: ["kaio"] },
      ],
    },
    {
      tipo: "docs",
      nome: repo("docs").repo,
      dono: ["vanessa"],
      nota: repo("docs").nota,
      links: [],
      filhos: [
        { nome: "docs/legal", nota: "Termos e privacidade v1.0 escritos. Ainda falta publicar nesta pasta.", dono: ["vanessa"] },
        { nome: "docs/testes", nota: "Registros das três rodadas.", dono: ["vanessa"] },
        { nome: "docs/relatorios", nota: "Um arquivo por dia.", dono: ["vanessa"] },
        { nome: "docs/design/telas", nota: "PNGs e a tabela de telas.", dono: ["matheus"] },
      ],
    },
    {
      tipo: "design",
      nome: "Figma",
      dono: ["matheus", "vanessa"],
      nota: "Plano do grupo e telas do app. As primeiras telas foram feitas por Vanessa e Matheus.",
      links: [
        { href: PLANO.links.figmaPlano, rotulo: "Figma do plano" },
        { href: PLANO.links.figmaTelas, rotulo: "Figma das telas" },
      ],
      filhos: [],
    },
  ];
}

function fluxoHTML() {
  return `<div class="flow">${FLUXO.map((passo, index) => `
    <article class="passo ${foco(passo.pessoas)}" style="--c:${COR[passo.pessoas[0]]}">
      <span class="num">${String(index + 1).padStart(2, "0")}</span>
      <strong>${esc(passo.nome)}</strong>
      <p>${esc(passo.texto)}</p>
      <div class="badges">${badges(passo.pessoas)}</div>
    </article>`).join("")}</div>`;
}

function arvoreHTML() {
  return `<div class="tree">${arvore().map((pasta) => `
    <article class="node ${foco(pasta.dono)}" style="--c:${COR[pasta.dono[0]]}">
      <div class="node-main">
        ${icon(pasta.tipo)}
        <div>
          <strong>${esc(pasta.nome)}</strong>
          <p>${esc(pasta.nota)}</p>
        </div>
        <div class="badges">${badges(pasta.dono)}</div>
      </div>
      ${pasta.links.length ? `<div class="node-links">${pasta.links.map((link) => `<a href="${esc(link.href)}">${esc(link.rotulo)}</a>`).join("")}</div>` : ""}
      ${pasta.filhos.length ? `<div class="children">${pasta.filhos.map((filho) => `
        <div class="child ${foco(filho.dono)}" style="--c:${COR[filho.dono[0]]}">
          ${icon(filho.nome === "src/ia" ? "ia" : pasta.tipo)}
          <div>
            <strong>${esc(filho.nome)}</strong>
            <p>${esc(filho.nota)}</p>
          </div>
          <div class="badges">${badges(filho.dono)}</div>
        </div>`).join("")}</div>` : ""}
    </article>`).join("")}</div>`;
}

function avisos() {
  const lista = [{
    nivel: "critico",
    titulo: "O Publicar não funciona",
    texto: PLANO.bloqueio,
    pessoas: ["todos"],
  }];
  PLANO.marcos
    .filter((item) => item.necessaria && item.confirmada === false)
    .forEach((item) => lista.push({
      nivel: "atencao",
      titulo: item.titulo,
      texto: `${fmt(parseISO(item.data), "short")} ${item.trazer}`,
      pessoas: item.pessoas,
    }));
  const ronaldo = PLANO.instrutor.filter((item) => item.situacao !== "pronto");
  if (ronaldo.length) {
    lista.push({
      nivel: "atencao",
      titulo: `${ronaldo.length} pedidos do Ronaldo ainda abertos`,
      texto: "O texto dos termos e da política está pronto (aba Termos). Falta a caixa de aceite no front, gravar data e versão no banco e a API recusar quem não aceitou.",
      pessoas: [...new Set(ronaldo.flatMap((item) => item.pessoas))],
    });
  }
  const perto = PLANO.correcoes.filter((item) => {
    const dias = daysBetween(today(), parseISO(item.prazo));
    return dias >= 0 && dias <= 3;
  });
  if (perto.length) {
    lista.push({
      nivel: "atencao",
      titulo: `${perto.length} ${perto.length === 1 ? "correção" : "correções"} nos próximos dias`,
      texto: perto.map((item) => `${item.titulo} (${quando(parseISO(item.prazo))})`).join(" · "),
      pessoas: [...new Set(perto.flatMap((item) => item.pessoas))],
    });
  }
  if (state.pessoa === "todos") return lista;
  return lista.filter((item) => item.nivel === "critico" || item.pessoas.includes("todos") || item.pessoas.includes(state.pessoa));
}

// Recado da coordenação, no topo do painel
function avisoInicialHTML() {
  const aviso = PLANO.aviso;
  if (!aviso) return "";
  return `
    <section class="recado" aria-label="Recado da coordenação">
      ${icon("info")}
      <div>
        <h3>${esc(aviso.titulo)}</h3>
        ${aviso.paragrafos.map((texto) => `<p>${esc(texto)}</p>`).join("")}
        <p class="assinatura">— Vanessa</p>
      </div>
    </section>`;
}

// Destaque vermelho: o que trava o projeto, quem resolve e como
function bloqueioHTML() {
  const passos = PLANO.bloqueioComo || [];
  const ate = PLANO.bloqueioAte ? parseISO(PLANO.bloqueioAte) : null;
  return `
    <section class="bloqueio" aria-label="Bloqueio principal">
      <div class="bloqueio-topo">
        <span class="sirene" aria-hidden="true"></span>
        <div>
          <p class="kicker">Bloqueio principal</p>
          <h3>O Publicar não funciona</h3>
        </div>
        ${ate ? `<div class="bloqueio-prazo"><b>${esc(quando(ate))}</b><span>${esc(fmt(ate, "short"))}</span></div>` : ""}
      </div>
      <p class="bloqueio-texto">${esc(PLANO.bloqueio)}</p>
      <div class="bloqueio-grade">
        <div>
          <p class="rotulo">${icon("pessoas")}Quem resolve</p>
          <div class="badges">${badges(PLANO.bloqueioQuem)}</div>
        </div>
        <div>
          <p class="rotulo">${icon("chave")}Como resolver</p>
          <ol class="bloqueio-passos">${passos.map((passo) => `
            <li class="${foco(passo.pessoa)}">
              ${badge(passo.pessoa)}
              <span>${esc(passo.texto)}</span>
              <time>até ${esc(fmt(parseISO(passo.ate), "short"))}</time>
            </li>`).join("")}</ol>
        </div>
      </div>
    </section>`;
}

function avisosHTML() {
  // o crítico já aparece no bloco vermelho grande; aqui ficam só os de atenção
  const lista = avisos().filter((item) => item.nivel !== "critico");
  if (!lista.length) return `<p class="vazio">Nenhum aviso para este filtro.</p>`;
  return `<div class="aviso-grid">${lista.map((item) => `
    <article class="aviso ${item.nivel}">
      ${icon("alerta")}
      <div>
        <strong>${esc(item.titulo)}</strong>
        <p>${esc(item.texto)}</p>
        <div class="badges">${badges(item.pessoas)}</div>
      </div>
    </article>`).join("")}</div>`;
}

function faseEstado(fase) {
  const agora = new Date();
  if (agora > fimDoDia(fase.fim)) return "passou";
  if (agora >= parseISO(fase.inicio) && agora <= fimDoDia(fase.fim)) return "agora";
  return "futura";
}

function fasesHTML(comTexto) {
  const primeiraFutura = PLANO.fases.find((fase) => faseEstado(fase) === "futura");
  return `<div class="fases">${PLANO.fases.map((fase) => {
    const estado = faseEstado(fase);
    const classe = estado === "futura" && fase === primeiraFutura ? "proxima" : estado;
    return `<article class="fase ${classe}"><small>${esc(periodoCurto(fase))}</small><strong>${esc(fase.nome)}</strong>${comTexto ? `<p>${esc(fase.texto)}</p>` : ""}</article>`;
  }).join("")}</div>`;
}

function linha({ tempo, titulo, detalhe, pessoas, status, tag, porque, statusTexto }) {
  return `
    <div class="row">
      <time>${tempo ? esc(tempo) : ""}</time>
      <div>
        <strong>${esc(titulo)}${tag ? `<span class="tag">${esc(tag)}</span>` : ""}</strong>
        ${detalhe ? `<p>${esc(detalhe)}</p>` : ""}
        ${porque ? `<p class="porque"><b>Por quê:</b> ${esc(porque)}</p>` : ""}
        ${pessoas ? `<div class="badges">${badges(pessoas)}</div>` : ""}
      </div>
      ${status ? pill(status, statusTexto) : ""}
    </div>`;
}

function kpisHTML() {
  const grupo = resumo(PLANO.entregas);
  const desafio = resumo(PLANO.desafio);
  const entrega = alvoEntrega();
  const dias = entrega ? Math.max(0, daysBetween(today(), parseISO(entrega.data))) : 0;
  return `<div class="kpis">
    <article class="kpi"><span>Entregas do grupo</span><b>${grupo.pct}%</b><small>${grupo.prontos} ${grupo.prontos === 1 ? "pronta" : "prontas"} · ${grupo.parciais} ${grupo.parciais === 1 ? "parcial" : "parciais"} · ${grupo.abertos} em aberto</small></article>
    <article class="kpi"><span>Desafio</span><b>${desafio.prontos} + ${desafio.parciais}</b><small>${desafio.prontos === 1 ? "pronta" : "prontas"} e parciais · ${desafio.abertos} em aberto</small></article>
    <article class="kpi"><span>Em aberto no grupo</span><b>${grupo.abertos}</b><small>de ${grupo.total} entregas da reta final</small></article>
    <article class="kpi"><span>Até a próxima entrega</span><b>${dias}</b><small>${dias === 1 ? "dia" : "dias"} no calendário, fora as horas do relógio</small></article>
  </div>`;
}

function filaEntregas() {
  const agora = new Date();
  const atual = pessoaAtiva();
  if (atual) {
    return PLANO.entregas
      .filter((item) => item.pessoa === atual.id)
      .filter((item) => passaStatus(situacaoDe(item)))
      .sort((a, b) => a.prazo.localeCompare(b.prazo))
      .map((item) => ({
        tempo: fmt(parseISO(item.prazo), "short"),
        titulo: item.titulo,
        detalhe: item.detalhe,
        pessoas: [atual.id],
        status: situacaoDe(item),
        instante: fimDoDia(item.prazo),
      }));
  }
  return PLANO.marcos
    .filter((item) => item.tipo === "cobranca" || item.tipo === "reuniao")
    .filter((item) => fimDoDia(item.data) > agora)
    .filter((item) => passaStatus(situacaoDe(item)))
    .sort((a, b) => a.data.localeCompare(b.data))
    .map((item) => ({
      tempo: fmt(parseISO(item.data), "short"),
      titulo: item.titulo,
      detalhe: item.trazer,
      pessoas: item.pessoas,
      status: situacaoDe(item),
      tag: item.onde,
    }));
}

function renderSidebar() {
  const grupo = resumo(PLANO.entregas);
  const desafio = resumo(PLANO.desafio);
  const linhasPessoa = PLANO.pessoas.map((item) => {
    const conta = resumo(entregasDaPessoa(item.id).filter((tarefa) => tarefa.pessoa === item.id));
    return `<button type="button" class="pessoa-row" data-pessoa="${item.id}" aria-pressed="${state.pessoa === item.id}" style="--c:${COR[item.id]}">
      <i class="dot"></i><span class="nome">${esc(item.nome)}</span><span class="abertos">${conta.abertos}</span>
    </button>`;
  }).join("");
  $("#painel").innerHTML = `
    <div class="meter">
      <div class="meter-top"><span>Entregas</span><b>${grupo.pct}%</b></div>
      <div class="bar" aria-hidden="true"><i style="width:${grupo.pct}%"></i></div>
      <p>${grupo.prontos} ${grupo.prontos === 1 ? "pronta" : "prontas"} · ${grupo.parciais} ${grupo.parciais === 1 ? "parcial" : "parciais"} · ${grupo.abertos} em aberto</p>
    </div>
    <div class="meter">
      <div class="meter-top"><span>Desafio</span><b>${desafio.pct}%</b></div>
      <div class="bar" aria-hidden="true"><i style="width:${desafio.pct}%"></i></div>
      <p>${desafio.prontos} ${desafio.prontos === 1 ? "pronta" : "prontas"} · ${desafio.parciais} parciais · ${desafio.abertos} em aberto</p>
    </div>
    <p class="grupo-label">Em aberto</p>
    <div class="pessoa-lista">
      <button type="button" class="pessoa-row" data-pessoa="todos" aria-pressed="${state.pessoa === "todos"}" style="--c:#8eb4ff">
        <i class="dot"></i><span class="nome">Todos</span><span class="abertos">${grupo.abertos}</span>
      </button>
      ${linhasPessoa}
    </div>`;
  $("#hoje-label").textContent = capital(fmt(today(), "short"));
}

function filtrosHTML() {
  const pessoas = [`<button type="button" data-pessoa="todos" aria-pressed="${state.pessoa === "todos"}" style="--c:#8eb4ff"><i class="dot"></i>Todos</button>`]
    .concat(PLANO.pessoas.map((item) => `<button type="button" data-pessoa="${item.id}" aria-pressed="${state.pessoa === item.id}" style="--c:${COR[item.id]}"><i class="dot"></i>${esc(item.nome)}</button>`))
    .join("");
  const statusOpcoes = [["todos", "Tudo"], ["aberto", "Em aberto"], ["parcial", "Parciais"], ["pronto", "Prontos"]];
  const status = ["hoje", "frentes", "desafio"].includes(state.view)
    ? `<div class="filtro-linha"><span class="filtro-nome">Estado</span><div class="chips">${statusOpcoes.map(([id, nome]) => `<button type="button" data-status="${id}" aria-pressed="${state.status === id}" style="--c:#8eb4ff">${nome}</button>`).join("")}</div></div>`
    : "";
  const calOpcoes = [["tudo", "Tudo"], ["cobranca", "Entregas"], ["reuniao", "Reuniões"]];
  const cal = state.view === "calendario"
    ? `<div class="filtro-linha"><span class="filtro-nome">Tipo</span><div class="chips">${calOpcoes.map(([id, nome]) => `<button type="button" data-cal="${id}" aria-pressed="${state.cal === id}" style="--c:#8eb4ff">${nome}</button>`).join("")}</div></div>`
    : "";
  return `
    <div class="filtro-linha"><span class="filtro-nome">Pessoa</span><div class="chips">${pessoas}</div></div>
    ${status}${cal}`;
}

function ajudaHTML() {
  const atual = pessoaAtiva();
  return `
    <section class="help">
      <div>
        <h3>Se travar</h3>
        <p>Se passar um dia parado, avise no grupo o que você tentou. Se a entrega trava outra pessoa, fale com ela no privado. Chave e senha também vão no privado.</p>
      </div>
      <div class="help-acoes">
        <button class="btn" type="button" id="ajuda">Copiar pedido de ajuda</button>
        ${atual ? `<button class="btn" type="button" id="copiar">Copiar confirmação</button>` : ""}
      </div>
    </section>`;
}

function ligarCopias() {
  const atual = pessoaAtiva();
  const minhas = atual
    ? entregasDaPessoa(atual.id).filter((item) => item.pessoa === atual.id && situacaoDe(item) !== "pronto")
    : [];
  copiar("ajuda", [
    "Travei na minha entrega.",
    atual ? `Sou ${atual.nome}.` : "Sou: ",
    "Tentei: ",
    "Preciso de: ",
  ].join("\n"));
  if (!atual) return;
  copiar("copiar", [
    "Conferi o plano da reta final.",
    `Sou ${atual.nome} — ${atual.frente}.`,
    minhas[0] ? `Próxima entrega: ${fmt(parseISO(minhas[0].prazo))} — ${minhas[0].titulo}.` : "Não tenho entrega em aberto.",
    "Confirmo a frente.",
  ].join("\n"));
}

function copiar(id, texto) {
  const botao = document.getElementById(id);
  if (!botao) return;
  botao.addEventListener("click", () => {
    const original = botao.textContent;
    navigator.clipboard?.writeText(texto).then(
      () => { botao.textContent = "Copiado"; },
      () => { botao.textContent = "Não consegui copiar"; },
    );
    setTimeout(() => { botao.textContent = original; }, 1600);
  });
}

function renderHoje() {
  const etapa = alvoEtapa();
  const entrega = alvoEntrega();
  const fila = filaEntregas();
  const micros = PLANO.micros.filter((grupo) => state.pessoa === "todos" || grupo.pessoas.includes(state.pessoa));
  $("#conteudo").innerHTML = `
    <div class="stack">
      ${avisoInicialHTML()}
      ${bloqueioHTML()}
      <section class="hero" aria-label="Contagem até a próxima etapa e a próxima entrega">
        <div class="hero-col">
          <p class="kicker">Próxima etapa</p>
          <h3>${etapa ? esc(etapa.fase.nome) : "Sem etapa à frente"}</h3>
          <p class="meta">${etapa ? `${esc(periodoCurto(etapa.fase))} · ${etapa.modo === "começa" ? "começa à meia-noite" : "fecha no fim do dia"}` : ""}</p>
          ${etapa ? clockHTML(etapa.instante) : ""}
          ${etapa ? `<p class="meta">${esc(etapa.fase.texto)}</p>` : ""}
        </div>
        <div class="hero-col">
          <p class="kicker">${pessoaAtiva() ? `Próxima entrega de ${pessoaAtiva().nome}` : "Próxima entrega"}</p>
          <h3>${entrega ? esc(entrega.titulo) : "Nada em aberto"}</h3>
          ${entrega ? `<div class="badges">${badges(entrega.pessoas)}</div>` : ""}
          <p class="meta">${entrega ? `${esc(fmt(parseISO(entrega.data), "short"))}${entrega.onde ? ` · ${esc(entrega.onde)}` : ""} · prazo no fim do dia` : ""}</p>
          ${entrega ? clockHTML(entrega.instante) : ""}
          ${entrega && entrega.trazer ? `<p class="meta">${esc(entrega.trazer)}</p>` : ""}
          ${entrega && entrega.detalhe ? `<p class="meta">${esc(entrega.detalhe)}</p>` : ""}
        </div>
      </section>
      ${kpisHTML()}
      <button type="button" class="capa" data-view="escopo">
        <img src="midia/escopo/01-capa.jpg" alt="Capa da apresentação de escopo do ISAC Conecta">
        <span>
          <span class="kicker">Escopo</span>
          <strong>${SLIDES.length} slides para consultar</strong>
          <span>Apresentação de hoje e as telas que já estão prontas no Figma. As setas do teclado passam os slides.</span>
        </span>
      </button>
      <section class="secao">
        ${tituloSecao("sino", "Também precisa de atenção")}
        ${avisosHTML()}
      </section>
      <section class="secao">
        <div class="secao-head">${tituloSecao("caminho", "Como o anúncio atravessa o projeto")}<button type="button" class="text-btn" data-view="arquitetura">Abrir a arquitetura</button></div>
        ${fluxoHTML()}
      </section>
      <section class="split">
        <div class="secao">
          ${tituloSecao("pasta", "Pastas")}
          ${arvoreHTML()}
        </div>
        <div class="secao">
          ${tituloSecao("pessoas", pessoaAtiva() ? `Fila de ${pessoaAtiva().nome}` : "Quem entrega")}
          ${fila.length ? `<div class="lista">${fila.slice(0, 6).map(linha).join("")}</div>` : `<p class="vazio">Nada neste filtro.</p>`}
        </div>
      </section>
      <section class="secao">
        ${tituloSecao("etapas", "Etapas")}
        ${fasesHTML(false)}
      </section>
      <section class="secao">
        <div class="secao-head">${tituloSecao("reuniao", "Micro-reuniões")}<button type="button" class="text-btn" data-view="reunioes">Abrir reuniões e testes</button></div>
        <div class="micros">${micros.map((grupo) => {
          const proxima = grupo.quando.map(parseISO).filter((data) => data >= today()).sort((a, b) => a - b)[0];
          return `<article class="micro ${foco(grupo.pessoas)}">
            <p class="kicker">${proxima ? esc(quando(proxima)) : "Encerrada"}</p>
            <h3>${esc(grupo.nome)}</h3>
            <div class="badges">${badges(grupo.pessoas)}</div>
            <p>${esc(grupo.pauta)} Relato de ${esc(pessoa(grupo.relator).nome)}.</p>
          </article>`;
        }).join("")}</div>
      </section>
      ${ajudaHTML()}
    </div>`;
}

function renderFrentes() {
  const lista = state.pessoa === "todos" ? PLANO.pessoas : [pessoa(state.pessoa)];
  const blocos = lista.map((item) => {
    const tarefas = entregasDaPessoa(item.id).filter((tarefa) => passaStatus(situacaoDe(tarefa)));
    const conta = resumo(entregasDaPessoa(item.id).filter((tarefa) => tarefa.pessoa === item.id));
    const grupos = PLANO.micros.filter((grupo) => grupo.pessoas.includes(item.id));
    return `
      <article class="pessoa-card" style="--c:${COR[item.id]}">
        <div class="who">
          <div>
            ${badge(item.id)}
            <h3>${esc(item.frente)}</h3>
            <p class="frente">${esc(item.entrega)}</p>
            ${item.porque ? `<p class="porque-frente">${icon("lampada")}<span><b>Por que esta frente existe:</b> ${esc(item.porque)}</span></p>` : ""}
            <p class="passa">Recebe de ${esc(item.recebe)}. Passa para: ${esc(item.passa)}.</p>
          </div>
          <div class="who-stat"><b>${conta.abertos}</b><span>em aberto</span></div>
        </div>
        <div class="bar" aria-hidden="true"><i style="width:${conta.pct}%"></i></div>
        ${tarefas.length ? `<div class="lista">${tarefas.map((tarefa) => linha({
          tempo: fmt(parseISO(tarefa.prazo), "short"),
          titulo: tarefa.titulo,
          detalhe: tarefa.detalhe,
          status: situacaoDe(tarefa),
        })).join("")}</div>` : `<p class="vazio">Nada neste filtro.</p>`}
        ${grupos.map((grupo) => `<p class="passa">${esc(grupo.nome)}: ${esc(grupo.trazer[item.id] || grupo.pauta)}</p>`).join("")}
      </article>`;
  }).join("");
  $("#conteudo").innerHTML = `<div class="stack">${blocos}${ajudaHTML()}</div>`;
}

function renderCalendario() {
  const tipos = state.cal === "tudo" ? ["cobranca", "reuniao"] : [state.cal];
  const itens = PLANO.marcos
    .filter((item) => tipos.includes(item.tipo))
    .filter((item) => state.pessoa === "todos" || item.pessoas.includes("todos") || item.pessoas.includes(state.pessoa));
  $("#conteudo").innerHTML = `
    <div class="stack">
      <section class="secao">${fasesHTML(true)}</section>
      <section class="secao">
        ${tituloSecao("relogio", "Cobranças")}
        <div class="lista">${itens.map((item) => linha({
          tempo: fmt(parseISO(item.data), "short"),
          titulo: item.titulo,
          detalhe: item.trazer,
          pessoas: item.pessoas,
          status: situacaoDe(item),
          tag: item.onde,
        })).join("")}</div>
      </section>
      <section class="secao">
        ${tituloSecao("escudo", "Três rodadas de teste")}
        <div class="lista">${PLANO.rodadas.map((rodada) => linha({
          tempo: fmt(parseISO(rodada.data), "short"),
          titulo: rodada.titulo,
          detalhe: rodada.texto,
          pessoas: ["todos"],
          status: situacaoDe({ prazo: rodada.data, situacao: "pendente" }),
        })).join("")}</div>
      </section>
    </div>`;
}

function renderEscopo() {
  const lista = slidesVisiveis();
  if (state.slide >= lista.length) state.slide = 0;
  const slide = lista[state.slide];
  const telas = slide.grupo === "Figma";
  const filtros = [["tudo", "Tudo"], ["apresentacao", "Apresentação de hoje"], ["figma", "Telas no Figma"]]
    .map(([id, nome]) => `<button type="button" data-deck="${id}" aria-pressed="${state.deck === id}" style="--c:#c6d46a">${nome}</button>`).join("");
  $("#conteudo").innerHTML = `
    <div class="stack">
      <div class="chips">${filtros}</div>
      <section class="deck" aria-roledescription="carrossel" aria-label="Slides do escopo">
        <div class="stage ${telas ? "tela" : ""}">
          <button type="button" class="deck-seta anterior" data-slide-dir="-1" aria-label="Slide anterior">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>
          </button>
          <img src="${esc(slide.src)}" alt="${esc(slide.titulo)}. ${esc(slide.texto)}">
          <button type="button" class="deck-seta proxima" data-slide-dir="1" aria-label="Próximo slide">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>
          </button>
        </div>
        <div class="deck-meta">
          <div>
            <p class="kicker">${esc(slide.grupo)} · ${String(state.slide + 1).padStart(2, "0")} / ${String(lista.length).padStart(2, "0")}</p>
            <h3>${esc(slide.titulo)}</h3>
            <p>${esc(slide.texto)}</p>
          </div>
          <p class="deck-dica">Setas do teclado, ou clique na miniatura.</p>
        </div>
        <div class="thumbs" role="list">
          ${lista.map((item, index) => `
            <button type="button" class="thumb ${index === state.slide ? "ativo" : ""}" data-slide="${index}" aria-label="${esc(item.titulo)}" ${index === state.slide ? 'aria-current="true"' : ""}>
              <img src="${esc(item.src)}" alt="">
              <span>${esc(item.titulo)}</span>
            </button>`).join("")}
        </div>
      </section>
      <p class="nota">A apresentação é de hoje, 15 de outubro. As telas prontas no Figma foram feitas por Vanessa e Matheus. Ainda faltam desenhar moderação, os admins, Meus anúncios, área do comércio, card premium, painel de impacto e termos. Para a reta final, vale o Painel e o Desafio.</p>
    </div>`;
  const faixa = document.querySelector(".thumbs");
  const ativo = document.querySelector(".thumb.ativo");
  if (faixa && ativo) faixa.scrollTo({ left: ativo.offsetLeft - 16, behavior: "smooth" });
}

function renderArquitetura() {
  $("#conteudo").innerHTML = `
    <div class="stack">
      <section class="secao">
        ${tituloSecao("caminho", "Caminho de um anúncio")}
        ${fluxoHTML()}
      </section>
      <section class="secao">
        ${tituloSecao("pasta", "Onde cada parte mora")}
        ${arvoreHTML()}
      </section>
      <section class="grid-2">
        <article class="card">
          <h3>A API já faz</h3>
          <div class="lista sem-tempo">${PLANO.apiAgora.jaFaz.map((item) => linha({ titulo: item })).join("")}</div>
        </article>
        <article class="card">
          <h3>A API ainda não faz</h3>
          <div class="lista sem-tempo">${PLANO.apiAgora.aindaNao.map((item) => linha({ titulo: item, status: "falta" })).join("")}</div>
        </article>
      </section>
    </div>`;
}

function blocoDesafio(item) {
  const status = item.situacao;
  if (!passaStatus(status)) return "";
  return linha({
    titulo: item.titulo,
    detalhe: [item.pedido, item.quemTexto, item.falta || item.fazer].filter(Boolean).join(" "),
    porque: item.porque,
    pessoas: item.pessoas,
    status,
  });
}

function renderDesafio() {
  const itens = PLANO.desafio.map(blocoDesafio).filter(Boolean);
  const ronaldo = PLANO.instrutor.map(blocoDesafio).filter(Boolean);
  const duplicado = blocoDesafio(PLANO.duplicidade);
  $("#conteudo").innerHTML = `
    <div class="stack">
      ${kpisHTML()}
      <section class="secao">
        ${tituloSecao("trofeu", "Nove pedidos do desafio")}
        ${itens.length ? `<div class="lista sem-tempo">${itens.join("")}</div>` : `<p class="vazio">Nada neste filtro.</p>`}
      </section>
      <section class="secao">
        ${tituloSecao("escudo", "Pedidos do Ronaldo (ISAC)")}
        <p class="lede">Termos, verificação do anúncio, selo de quem publica e retorno quando recusa.</p>
        ${ronaldo.length ? `<div class="lista sem-tempo" style="margin-top:12px">${ronaldo.join("")}</div>` : `<p class="vazio">Nada neste filtro.</p>`}
      </section>
      ${duplicado ? `<section class="secao">${tituloSecao("alvo", "Duplicidade")}<div class="lista sem-tempo">${duplicado}</div></section>` : ""}
      <section class="secao">
        ${tituloSecao("dinheiro", "Modelo de negócio")}
        <p class="lede">Diferencial oficial do desafio: um Business Model Canvas com a viabilidade técnica, operacional e financeira. ${esc(PLANO.meta.metaOrigem)} ${esc(PLANO.mudas)}</p>
        <div class="grid-3" style="margin-top:12px">
          ${PLANO.bmc.map((item) => `<article class="card"><h3>${esc(item.bloco)}</h3><p>${esc(item.texto)}</p></article>`).join("")}
        </div>
      </section>
    </div>`;
}

function renderCombinados() {
  const testes = PLANO.testes.filter((teste) => state.pessoa === "todos" || teste.quem === state.pessoa || teste.testa === state.pessoa || teste.testa === "todos");
  $("#conteudo").innerHTML = `
    <div class="stack">
      <section class="secao">
        ${tituloSecao("chave", "Contrato")}
        <ol class="contrato">${PLANO.contrato.map((passo) => `<li>${esc(passo)}</li>`).join("")}</ol>
      </section>
      <section class="secao">
        <div class="secao-head">${tituloSecao("escudo", "Quem testa a entrega de quem")}<button type="button" class="text-btn" data-view="reunioes">Abrir reuniões e testes</button></div>
        <p class="lede">${testes.length} ${testes.length === 1 ? "dupla" : "duplas"} neste filtro. A lista completa, com as rodadas e as reuniões, está na aba Reuniões e testes.</p>
      </section>
      <section class="grid-2">
        ${PLANO.regras.map((regra) => `<article class="card"><h3>${esc(regra.titulo)}</h3><p>${esc(regra.texto)}</p></article>`).join("")}
      </section>
      <section class="secao">
        ${tituloSecao("pasta", "Repositórios")}
        ${arvoreHTML()}
      </section>
      ${ajudaHTML()}
    </div>`;
}

/* ---------------------------------------------------------------
   TERMOS — mostra os textos legais que ficam em legal/*.md
   --------------------------------------------------------------- */

// Converte o markdown simples dos termos em HTML.
// SEGURANÇA: escapa todo o texto primeiro (esc) e só depois aplica
// negrito e títulos, então nenhum texto do arquivo vira código na página.
function inlineMd(texto) {
  return esc(texto)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function markdownParaHTML(md) {
  const linhas = md.replace(/\r/g, "").split("\n");
  let html = "";
  let lista = null;          // "ul" ou "ol" enquanto estiver dentro de uma lista
  let tabela = null;         // linhas da tabela sendo montada
  const fecharLista = () => { if (lista) { html += `</${lista}>`; lista = null; } };
  const fecharTabela = () => {
    if (!tabela) return;
    const [cab, , ...corpo] = tabela;
    const celulas = (linha) => linha.split("|").slice(1, -1).map((c) => c.trim());
    html += `<div class="tabela-legal"><table><thead><tr>${celulas(cab).map((c) => `<th>${inlineMd(c)}</th>`).join("")}</tr></thead><tbody>${corpo.map((linha) => `<tr>${celulas(linha).map((c) => `<td>${inlineMd(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    tabela = null;
  };
  linhas.forEach((linha) => {
    const t = linha.trim();
    if (t.startsWith("|")) { fecharLista(); (tabela = tabela || []).push(t); return; }
    fecharTabela();
    if (!t) { fecharLista(); return; }
    if (t === "---") { fecharLista(); html += "<hr>"; return; }
    if (t.startsWith("# ")) { fecharLista(); html += `<h1>${inlineMd(t.slice(2))}</h1>`; return; }
    if (t.startsWith("## ")) { fecharLista(); html += `<h2>${inlineMd(t.slice(3))}</h2>`; return; }
    if (t.startsWith("> ")) { fecharLista(); html += `<blockquote>${inlineMd(t.slice(2))}</blockquote>`; return; }
    const ul = t.match(/^- (.*)/);
    const ol = t.match(/^\d+\. (.*)/);
    if (ul || ol) {
      const tipo = ul ? "ul" : "ol";
      if (lista !== tipo) { fecharLista(); html += `<${tipo}>`; lista = tipo; }
      html += `<li>${inlineMd((ul || ol)[1])}</li>`;
      return;
    }
    fecharLista();
    html += `<p>${inlineMd(t)}</p>`;
  });
  fecharLista();
  fecharTabela();
  return html;
}

// Busca o arquivo .md (uma vez só) e mostra na tela
function carregarLegal(item) {
  const alvo = document.getElementById("texto-legal");
  if (!alvo) return;
  if (LEGAL_CACHE[item.id]) { alvo.innerHTML = LEGAL_CACHE[item.id]; return; }
  fetch(item.arquivo)
    .then((resposta) => { if (!resposta.ok) throw new Error(resposta.status); return resposta.text(); })
    .then((md) => {
      LEGAL_CACHE[item.id] = markdownParaHTML(md);
      const atual = document.getElementById("texto-legal");
      if (atual && state.legal === item.id) atual.innerHTML = LEGAL_CACHE[item.id];
    })
    .catch(() => {
      const atual = document.getElementById("texto-legal");
      if (atual) atual.innerHTML = `<p class="vazio">Não consegui abrir ${esc(item.arquivo)}. Abra direto no repositório.</p>`;
    });
}

function renderTermos() {
  const legal = PLANO.legal;
  const item = legal.arquivos.find((a) => a.id === state.legal) || legal.arquivos[0];
  const abas = legal.arquivos
    .map((a) => `<button type="button" data-legal="${a.id}" aria-pressed="${a.id === item.id}" style="--c:#8b7cff">${esc(a.nome)}</button>`)
    .join("");
  const ronaldo = PLANO.instrutor.find((i) => i.id === "i1");
  $("#conteudo").innerHTML = `
    <div class="stack">
      <section class="secao">
        ${tituloSecao("escudo", "Para a equipe de desenvolvimento")}
        <div class="grid-2">
          <article class="card">
            <h3>Caixa de aceite</h3>
            <label class="aceite-demo"><input type="checkbox" disabled> <span>${esc(legal.caixaAceite)}</span></label>
            <p class="dica">“Termos de Uso” e “Política de Privacidade” viram links para as páginas /termos e /privacidade.</p>
          </article>
          <article class="card">
            <h3>O que salvar no perfil</h3>
            <div class="lista sem-tempo">${legal.salvar.map((s) => linha({ titulo: s.campo, detalhe: s.texto })).join("")}</div>
          </article>
        </div>
        <div class="lista sem-tempo" style="margin-top:12px">${legal.regras.map((r) => linha({ titulo: r })).join("")}</div>
        ${ronaldo ? `<div class="lista sem-tempo" style="margin-top:12px">${blocoDesafio({ ...ronaldo, situacao: ronaldo.situacao }) || ""}</div>` : ""}
        <p class="nota">Falta preencher nos textos: ${esc(legal.faltaPreencher.join(", "))}. Estão marcados entre colchetes.</p>
      </section>
      <section class="secao">
        <div class="secao-head">${tituloSecao("pasta", "Textos completos")}<div class="chips">${abas}</div></div>
        <article class="legal" id="texto-legal"><p class="vazio">Carregando…</p></article>
      </section>
    </div>`;
  carregarLegal(item);
}

/* ---------------------------------------------------------------
   REUNIÕES E TESTES — tudo de encontro e de teste num lugar só
   --------------------------------------------------------------- */

// Mostra a pessoa em destaque ou apagada, conforme o filtro de pessoa
function passaPessoa(ids) {
  return state.pessoa === "todos" || ids.includes("todos") || ids.includes(state.pessoa);
}

// Estado de uma data: já passou, é hoje ou ainda vem
function estadoData(iso) {
  const diff = daysBetween(today(), parseISO(iso));
  if (diff < 0) return "passou";
  if (diff === 0) return "agora";
  return "futura";
}

// Bloco 1: a próxima reunião com o instrutor, com relógio
function proximaReuniaoHTML() {
  const reunioes = PLANO.marcos
    .filter((m) => m.tipo === "reuniao")
    .sort((a, b) => a.data.localeCompare(b.data));
  const proxima = reunioes.find((m) => fimDoDia(m.data) > new Date());
  if (!proxima) return "";
  return `
    <section class="hero" aria-label="Próxima reunião">
      <div class="hero-col">
        <p class="kicker">Próxima reunião com o instrutor</p>
        <h3>${esc(proxima.titulo)}</h3>
        <p class="meta">${esc(capital(fmt(parseISO(proxima.data))))} · ${proxima.confirmada ? "confirmada" : "a confirmar"} · a hora sai no grupo</p>
        ${clockHTML(parseISO(proxima.data))}
      </div>
      <div class="hero-col">
        <p class="kicker">O que levar</p>
        <p class="levar">${esc(proxima.trazer)}</p>
        <div class="lista sem-tempo" style="margin-top:14px">${reunioes.map((m) => linha({
          titulo: `${capital(fmt(parseISO(m.data), "short"))} · ${m.titulo}`,
          detalhe: m.confirmada ? "Com o instrutor." : "Necessária. A data ainda depende do instrutor.",
          status: estadoData(m.data) === "passou" ? "pendente" : (m.confirmada ? "pronto" : "parcial"),
          statusTexto: estadoData(m.data) === "passou" ? "Aconteceu" : (m.confirmada ? "Confirmada" : "A confirmar"),
        })).join("")}</div>
      </div>
    </section>`;
}

// Bloco 2: micro-reuniões por frente, com o que cada pessoa leva
function microsHTML() {
  return `<div class="micros">${PLANO.micros.map((grupo) => {
    const proxima = grupo.quando.find((d) => estadoData(d) !== "passou");
    return `
      <article class="micro micro-full ${foco(grupo.pessoas)}">
        <p class="kicker">${proxima ? esc(quando(parseISO(proxima))) : "Encerrada"}</p>
        <h3>${esc(grupo.nome)}</h3>
        <div class="datas">${grupo.quando.map((d) => `<span class="data-chip ${estadoData(d)}">${esc(fmt(parseISO(d), "short"))}</span>`).join("")}</div>
        <p>${esc(grupo.pauta)}</p>
        <p class="rotulo-mini">Cada um leva</p>
        <ul class="leva">${grupo.pessoas.map((id) => `
          <li class="${foco(id)}">${badge(id)}<span>${esc(grupo.trazer[id] || "")}</span></li>`).join("")}</ul>
        <p class="relator">${icon("reuniao")}<span>Relato no grupo: <b>${esc(pessoa(grupo.relator).nome)}</b></span></p>
      </article>`;
  }).join("")}</div>`;
}

// Bloco 3: testes em dupla — ninguém testa a própria entrega
function testesHTML() {
  const testes = PLANO.testes.filter((t) => passaPessoa([t.quem, t.testa]));
  if (!testes.length) return `<p class="vazio">Nada neste filtro.</p>`;
  return `<div class="lista sem-tempo">${testes.map((t) => `
    <div class="row teste-row">
      <div>
        <div class="par">
          ${badge(t.quem)}
          <span class="seta-par" aria-label="testa">${icon("par")}</span>
          ${t.testa === "todos" ? `<span class="badge todos">O conjunto</span>` : badge(t.testa)}
        </div>
        <strong>${esc(t.oque)}</strong>
      </div>
      ${pill("pendente")}
    </div>`).join("")}</div>`;
}

// Bloco 4: as três rodadas de teste do grupo
function rodadasHTML() {
  const proximaId = PLANO.rodadas.find((r) => estadoData(r.data) !== "passou");
  return `<div class="rodadas">${PLANO.rodadas.map((r, i) => {
    const estado = estadoData(r.data);
    const classe = estado === "futura" && r === proximaId ? "proxima" : estado;
    return `
      <article class="fase rodada ${classe}">
        <span class="rodada-num">${i + 1}</span>
        <small>${esc(capital(fmt(parseISO(r.data), "short")))} · ${esc(quando(parseISO(r.data)))}</small>
        <strong>${esc(r.titulo)}</strong>
        <p>${esc(r.texto)}</p>
      </article>`;
  }).join("")}</div>`;
}

function renderReunioes() {
  const regra = (titulo) => PLANO.regras.find((r) => r.titulo === titulo);
  const rapida = regra("Atualização rápida");
  const travou = regra("Travou");
  $("#conteudo").innerHTML = `
    <div class="stack">
      ${proximaReuniaoHTML()}
      <section class="secao">
        ${tituloSecao("reuniao", "Micro-reuniões por frente")}
        <p class="porque-frente">${icon("lampada")}<span><b>Por quê:</b> o grupo tem dificuldade de reunir todo mundo ao mesmo tempo. Reuniões pequenas, só com quem depende um do outro, resolvem rápido. Quem relata conta no grupo o que ficou combinado.</span></p>
        <div style="margin-top:14px">${microsHTML()}</div>
      </section>
      <section class="secao">
        ${tituloSecao("escudo", "Testes em dupla")}
        <p class="porque-frente">${icon("lampada")}<span><b>Por quê:</b> quem fez a entrega não enxerga o próprio erro. Outra pessoa testando acha o que quebra antes do Ronaldo achar.</span></p>
        <div style="margin-top:14px">${testesHTML()}</div>
        <p class="nota">${icon("check")}<span><b>Pronto</b> significa que funcionou duas vezes seguidas, no celular e no computador, testado por outra pessoa.</span></p>
      </section>
      <section class="secao">
        ${tituloSecao("relogio", "Três rodadas de teste do grupo")}
        ${rodadasHTML()}
      </section>
      <section class="grid-2">
        ${rapida ? `<article class="card"><h3>${esc(rapida.titulo)}</h3><p>${esc(rapida.texto)}</p></article>` : ""}
        ${travou ? `<article class="card"><h3>${esc(travou.titulo)}</h3><p>${esc(travou.texto)} Para a Vanessa ajudar, avise com um dia de antecedência.</p></article>` : ""}
      </section>
      ${ajudaHTML()}
    </div>`;
}

const views = {
  hoje: renderHoje,
  frentes: renderFrentes,
  calendario: renderCalendario,
  arquitetura: renderArquitetura,
  escopo: renderEscopo,
  desafio: renderDesafio,
  combinados: renderCombinados,
  termos: renderTermos,
  reunioes: renderReunioes,
};

function metaDaView() {
  const atual = pessoaAtiva();
  const mapa = {
    hoje: ["Painel", capital(fmt(today())), atual ? `Filtro em ${atual.nome}. O relógio segue a próxima entrega desta pessoa.` : "O que falta, quem entrega e onde cada parte do projeto mora."],
    frentes: ["Frentes", "O que ainda falta por pessoa", "Nove pessoas. O Bernardo saiu. Os testes no celular e o modelo de negócio ficaram com a Vanessa."],
    calendario: ["Calendário", "Cobranças, inclusive as do privado", "A visão Tudo mostra o grupo e o privado. A quarta de 28 de outubro é necessária e ainda não está confirmada."],
    arquitetura: ["Arquitetura", "Pastas, donos e o caminho do anúncio", "A IA entra em src/ia, dentro da API. O Publicar só fecha quando o front, a API e a IA usam o mesmo contrato."],
    escopo: ["Escopo", "Apresentação de hoje e telas do Figma", "A apresentação foi feita em 15 de outubro. As telas são as que já estão prontas no Figma."],
    desafio: ["Desafio", "O que a banca espera ver", "Nove entregas do PDF de 16 de setembro. O Business Model Canvas é o diferencial oficial."],
    combinados: ["Combinados", "Contrato, testes e onde mora cada parte", "Quem mudar o formato avisa no grupo antes."],
    reunioes: ["Reuniões e testes", "Quem se reúne, quando, e quem testa quem", "Reunião de quarta com o instrutor, micro-reuniões por frente e testes em dupla. Ninguém testa a própria entrega."],
    termos: ["Termos", "Termos de uso e política de privacidade", `Versão ${PLANO.legal.versao}, de 15 de outubro. Pedido do Ronaldo: quem anuncia responde pelo conteúdo, não o ISAC. Rascunho do MVP: antes de abrir de verdade, o ISAC pede a revisão de um advogado.`],
  };
  return mapa[state.view] || mapa.hoje;
}

function render() {
  const [kicker, titulo, lede] = metaDaView();
  $("#kicker").textContent = kicker;
  $("#titulo").textContent = titulo;
  $("#resumo").textContent = lede;
  document.title = `${titulo} — ISAC Conecta`;
  $("#filtros").innerHTML = filtrosHTML();
  document.querySelectorAll("nav button").forEach((button) => {
    if (button.dataset.view === state.view) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  renderSidebar();
  views[state.view]();
  ligarCopias();
}

function setView(view) {
  state.view = views[view] ? view : "hoje";
  if (location.hash !== `#${state.view}`) history.replaceState(null, "", `#${state.view}`);
  render();
}

document.body.addEventListener("click", (event) => {
  const view = event.target.closest("[data-view]");
  if (view) setView(view.dataset.view);
  const pessoaBtn = event.target.closest("[data-pessoa]");
  if (pessoaBtn) {
    state.pessoa = pessoaBtn.dataset.pessoa;
    localStorage.setItem("isac-pessoa", state.pessoa);
    render();
  }
  const cal = event.target.closest("[data-cal]");
  if (cal) {
    state.cal = cal.dataset.cal;
    render();
  }
  const status = event.target.closest("[data-status]");
  if (status) {
    state.status = status.dataset.status;
    render();
  }
  const deck = event.target.closest("[data-deck]");
  if (deck) {
    state.deck = deck.dataset.deck;
    state.slide = 0;
    render();
  }
  const dir = event.target.closest("[data-slide-dir]");
  if (dir) {
    const total = slidesVisiveis().length;
    state.slide = (state.slide + Number(dir.dataset.slideDir) + total) % total;
    render();
  }
  const legalBtn = event.target.closest("[data-legal]");
  if (legalBtn) {
    state.legal = legalBtn.dataset.legal;
    render();
  }
  const slide = event.target.closest("[data-slide]");
  if (slide) {
    state.slide = Number(slide.dataset.slide);
    render();
  }
});

document.addEventListener("keydown", (event) => {
  if (state.view !== "escopo") return;
  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
  event.preventDefault();
  const delta = event.key === "ArrowRight" ? 1 : -1;
  const total = slidesVisiveis().length;
  state.slide = (state.slide + delta + total) % total;
  render();
});

window.addEventListener("hashchange", () => setView(location.hash.slice(1)));

if (state.pessoa !== "todos" && !pessoa(state.pessoa)) state.pessoa = "todos";
setView(location.hash.slice(1) || "hoje");
setInterval(tick, 1000);
