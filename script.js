/* Pé na Estrada — interações e animações
   Funciona sem GSAP/Lenis (tudo visível e estático); com eles, ganha movimento. */
(() => {
  const raiz = document.documentElement;
  raiz.classList.add("js");

  const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const temGsap = !!(window.gsap && window.ScrollTrigger);
  const anima = temGsap && !reduzido;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- trilhos infinitos: duplica o conteúdo ---------- */
  $$(".rolo__trilho, .estrada__frota").forEach((trilho) => {
    [...trilho.children].forEach((filho) => {
      const copia = filho.cloneNode(true);
      copia.setAttribute("aria-hidden", "true");
      trilho.appendChild(copia);
    });
  });

  /* ---------- aviso (toast) ---------- */
  const aviso = $(".aviso");
  let avisoT;
  function avisar(msg) {
    aviso.textContent = msg;
    aviso.classList.add("mostra");
    clearTimeout(avisoT);
    avisoT = setTimeout(() => aviso.classList.remove("mostra"), 2600);
  }
  async function copiar(texto) {
    try { await navigator.clipboard.writeText(texto); return true; } catch { return false; }
  }
  $$("[data-copiar]").forEach((b) =>
    b.addEventListener("click", async () => {
      const ok = await copiar($("#" + b.dataset.copiar).textContent.trim());
      avisar(ok ? "Chave PIX copiada" : "Selecione a chave e copie");
    })
  );
  $$("[data-compartilhar]").forEach((b) =>
    b.addEventListener("click", async () => {
      const ok = await copiar(location.href.split("#")[0]);
      avisar(ok ? "Link copiado" : "Copie o link na barra do navegador");
    })
  );

  /* ---------- rolagem suave (Lenis) ---------- */
  let lenis = null;
  if (anima && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  function irPara(alvo) {
    if (lenis) lenis.scrollTo(alvo, { duration: 1.4 });
    else alvo.scrollIntoView({ behavior: reduzido ? "auto" : "smooth" });
  }

  /* ---------- menu móvel ---------- */
  const menu = $("#menu-movel");
  $$("li", menu).forEach((li, i) => li.style.setProperty("--i", i));
  const botaoMenu = $(".nav__menu");
  function abrirMenu(abrir) {
    botaoMenu.setAttribute("aria-expanded", String(abrir));
    botaoMenu.textContent = abrir ? "Fechar" : "Menu";
    if (abrir) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add("aberto"));
      lenis && lenis.stop();
      nav.dataset.tema = "escuro";
    } else {
      menu.classList.remove("aberto");
      setTimeout(() => (menu.hidden = true), 700);
      lenis && lenis.start();
      temaNav();
    }
  }
  botaoMenu.addEventListener("click", () => abrirMenu(menu.hidden || !menu.classList.contains("aberto")));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) { abrirMenu(false); botaoMenu.focus(); }
  });

  /* ---------- âncoras ---------- */
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id === "#") { e.preventDefault(); avisar("Link de inscrição em breve"); return; }
      const alvo = $(id);
      if (!alvo) return;
      e.preventDefault();
      if (!menu.hidden) abrirMenu(false);
      irPara(alvo);
    })
  );

  /* ---------- navegação: cor por painel + some ao descer ---------- */
  const nav = $(".nav");
  const paineis = $$(".painel");
  let ultimoY = window.scrollY;
  function temaNav() {
    if (!menu.hidden) return;
    let atual = paineis[0];
    for (const p of paineis) {
      const r = p.getBoundingClientRect();
      if (r.top <= 44 && r.bottom > 44) atual = p;
    }
    nav.dataset.tema = atual.dataset.tema || "claro";
  }
  function aoRolar() {
    const y = window.scrollY;
    if (menu.hidden) {
      if (y > ultimoY + 6 && y > 240) nav.classList.add("escondida");
      else if (y < ultimoY - 6) nav.classList.remove("escondida");
    }
    ultimoY = y;
    temaNav();
  }
  window.addEventListener("scroll", () => requestAnimationFrame(aoRolar), { passive: true });
  temaNav();

  /* ---------- Cross Run: abas que avançam sozinhas ---------- */
  const abasConteudo = [
    ["01 · A corrida", "Uma corrida aberta com a juventude.", "Largada uma semana antes da viagem."],
    ["02 · Quem corre", "Divulgada para o UP e o GO.", "Pais e familiares também podem correr e doar."],
    ["03 · Arrecadação", "Arrecadar para a VM.", "O dinheiro financia ações na VM ou é doado a casas de apoio da cidade que acolher o grupo."],
    ["04 · Percursos", "2 km ou 5 km.", "Percurso 01 · 2 km  /  Percurso 02 · 5 km"],
    ["05 · Inscrição", "R$ 20.", "Inclui pulseira e número de peito."],
    ["06 · Doação", "Qualquer valor.", "Doações acima de R$ 50 incluem um kit da Cross Run."],
  ];
  const abas = $(".abas");
  const botoesAba = $$('[role="tab"]', abas);
  const palco = $(".corrida__palco");
  const TEMPO = 5200;
  let abaAtual = 0, abaTimer = null, tocando = false, visivel = false, pausado = false;

  function mostrarAba(i, foco = false) {
    abaAtual = (i + botoesAba.length) % botoesAba.length;
    botoesAba.forEach((b, j) => {
      const sel = j === abaAtual;
      b.setAttribute("aria-selected", String(sel));
      b.tabIndex = sel ? 0 : -1;
      const barra = $(".abas__barra i", b);
      barra.style.animation = "none";
      void barra.offsetWidth;
      barra.style.animation = "";
    });
    if (foco) botoesAba[abaAtual].focus();
    palco.setAttribute("aria-labelledby", botoesAba[abaAtual].id);
    palco.classList.add("trocando");
    setTimeout(() => {
      const [num, frase, sub] = abasConteudo[abaAtual];
      $(".corrida__num", palco).textContent = num;
      $(".corrida__frase", palco).textContent = frase;
      $(".corrida__sub", palco).textContent = sub;
      palco.classList.remove("trocando");
    }, reduzido ? 0 : 280);
    agendar();
  }
  function agendar() {
    clearTimeout(abaTimer);
    tocando = visivel && !pausado && !reduzido;
    abas.classList.toggle("tocando", tocando);
    abas.style.setProperty("--tempo", TEMPO + "ms");
    if (tocando) abaTimer = setTimeout(() => mostrarAba(abaAtual + 1), TEMPO);
  }
  botoesAba.forEach((b, i) => {
    b.addEventListener("click", () => { pausado = true; mostrarAba(i); });
    b.addEventListener("keydown", (e) => {
      const passo = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (passo) { e.preventDefault(); pausado = true; mostrarAba(abaAtual + passo, true); }
      if (e.key === "Home") { e.preventDefault(); pausado = true; mostrarAba(0, true); }
      if (e.key === "End") { e.preventDefault(); pausado = true; mostrarAba(botoesAba.length - 1, true); }
    });
  });
  const corrida = $(".corrida");
  corrida.addEventListener("mouseenter", () => { pausado = true; agendar(); });
  corrida.addEventListener("mouseleave", () => { pausado = false; agendar(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visivel = e.isIntersecting; agendar(); }, { threshold: 0.35 }).observe(corrida);
  }

  /* ---------- FAQ com altura animada ---------- */
  $$(".faq details").forEach((d) => {
    const sum = $("summary", d);
    const resp = $(".faq__resp", d);
    sum.addEventListener("click", (e) => {
      if (reduzido || !resp.animate) return;
      e.preventDefault();
      if (d.open) {
        const a = resp.animate([{ height: resp.offsetHeight + "px" }, { height: "0px" }], { duration: 380, easing: "cubic-bezier(.22,1,.36,1)" });
        d.classList.add("fechando");
        a.onfinish = () => { d.open = false; d.classList.remove("fechando"); temGsap && ScrollTrigger.refresh(); };
      } else {
        d.open = true;
        const h = resp.offsetHeight;
        const a = resp.animate([{ height: "0px" }, { height: h + "px" }], { duration: 480, easing: "cubic-bezier(.22,1,.36,1)" });
        a.onfinish = () => temGsap && ScrollTrigger.refresh();
      }
    });
  });

  if (!anima) return; /* ======= daqui pra baixo, só com movimento ======= */

  raiz.classList.add("anima");
  gsap.registerPlugin(ScrollTrigger);
  if (window.Draggable) gsap.registerPlugin(window.Draggable);
  const mm = gsap.matchMedia();
  const entra = (alvos, vars, gatilho, inicio = "top 85%") =>
    gsap.from(alvos, {
      ...vars,
      immediateRender: false,
      scrollTrigger: { trigger: gatilho || alvos, start: inicio, toggleActions: "play none none none" },
    });

  /* ---------- trilhos com GSAP (aceleram com a rolagem) ---------- */
  const loops = [];
  $$(".rolo__trilho, .estrada__frota").forEach((t) => {
    t.style.animation = "none";
    const volta = t.closest(".rolo__linha--volta");
    const dur = t.classList.contains("estrada__frota") ? 34 : volta ? 80 : 70;
    loops.push(
      volta
        ? gsap.fromTo(t, { xPercent: -50 }, { xPercent: 0, duration: dur, ease: "none", repeat: -1 })
        : gsap.to(t, { xPercent: -50, duration: dur, ease: "none", repeat: -1 })
    );
  });
  $$(".selo__anel").forEach((a) => loops.push(gsap.to(a, { rotation: 360, duration: 48, ease: "none", repeat: -1 })));
  let alvoVel = 1;
  ScrollTrigger.create({
    onUpdate: (st) => { alvoVel = 1 + Math.min(Math.abs(st.getVelocity()) / 260, 9); },
  });
  gsap.ticker.add(() => {
    loops.forEach((l) => l.timeScale(gsap.utils.interpolate(l.timeScale(), alvoVel, 0.08)));
    alvoVel = gsap.utils.interpolate(alvoVel, 1, 0.06);
  });

  /* ---------- painéis empilhados + galeria horizontal ---------- */
  const galeria = $(".galeria");
  const pista = $(".galeria__pista");
  mm.add("(min-width: 900px)", () => {
    paineis.forEach((p, i) => {
      if (p === galeria) {
        galeria.classList.add("galeria--horizontal");
        const dist = () => Math.max(0, pista.scrollWidth - window.innerWidth);
        gsap.to(pista, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: galeria,
            start: "top top",
            end: () => "+=" + dist(),
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        $$(".g-item", galeria).forEach((f, j) =>
          gsap.fromTo(f, { y: j % 2 ? 24 : -18 }, {
            y: j % 2 ? -24 : 18, ease: "none",
            scrollTrigger: { trigger: galeria, start: "top top", end: () => "+=" + dist(), scrub: true },
          })
        );
        return;
      }
      if (i === paineis.length - 1) return;
      const curto = () => p.offsetHeight <= window.innerHeight;
      const st = {
        trigger: p,
        start: () => (curto() ? "top top" : "bottom bottom"),
        end: () => "+=" + window.innerHeight,
        pin: true,
        pinSpacing: false,
        scrub: true,
        invalidateOnRefresh: true,
      };
      gsap.fromTo(p, { scale: 1, "--veu": 0 }, { scale: 0.94, "--veu": 0.55, ease: "none", transformOrigin: "50% 0%", scrollTrigger: st });
    });
    return () => galeria.classList.remove("galeria--horizontal");
  });

  /* ---------- 01 · topo ---------- */
  gsap.from(".hero .selo", { scale: 0.55, rotation: -30, duration: 1.6, ease: "elastic.out(1, 0.55)" });
  gsap.from(".hero__vers, .hero__ref, .hero__acoes", { y: 26, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.25 });
  gsap.from(".rolo__linha", { x: (i) => (i ? -120 : 120), duration: 1.6, ease: "power3.out", delay: 0.2 });
  gsap.to(".hero__centro", {
    yPercent: -14, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* ---------- 02 · ideia ---------- */
  $$(".ideia__titulo .linha").forEach((l) => {
    l.style.overflow = "hidden";
    l.innerHTML = `<span style="display:inline-block">${l.innerHTML}</span>`;
  });
  entra(".ideia__titulo .linha > span", { yPercent: 105, rotation: 3, duration: 1.1, ease: "power4.out", stagger: 0.1 }, ".ideia__titulo");
  entra(".ideia .ficha > div", { x: -24, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.07 }, ".ideia .ficha");

  const manifesto = $("[data-palavras]");
  manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/).map((w) => `<span class="p">${w}</span>`).join(" ");
  gsap.to(".manifesto .p", {
    opacity: 1, ease: "none", stagger: 0.08,
    scrollTrigger: { trigger: manifesto, start: "top 82%", end: "bottom 40%", scrub: true },
  });

  /* ---------- 03 · destino ---------- */
  entra(".destino__emblema img", { scale: 0.7, rotation: -18, duration: 1.4, ease: "elastic.out(1, 0.6)" }, ".destino__emblema");
  entra(".destino__texto > *", { y: 30, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }, ".destino__texto");
  mm.add("(hover: hover) and (pointer: fine)", () => {
    const img = $(".destino__emblema img");
    const rx = gsap.quickTo(img, "rotationX", { duration: 0.6, ease: "power3" });
    const ry = gsap.quickTo(img, "rotationY", { duration: 0.6, ease: "power3" });
    const area = $(".destino__grade");
    const mover = (e) => {
      const r = img.getBoundingClientRect();
      ry(((e.clientX - (r.left + r.width / 2)) / r.width) * 22);
      rx(-((e.clientY - (r.top + r.height / 2)) / r.height) * 22);
    };
    const sair = () => { rx(0); ry(0); };
    area.addEventListener("mousemove", mover);
    area.addEventListener("mouseleave", sair);
    return () => { area.removeEventListener("mousemove", mover); area.removeEventListener("mouseleave", sair); };
  });

  // ônibus percorre o trajeto conforme a rolagem
  const rota = $(".rota");
  const caminho = $(".rota__traco");
  const mapa = $(".rota__mapa");
  const onibus = $(".rota__onibus");
  const km = $("[data-km]");
  const L = caminho.getTotalLength();
  caminho.style.strokeDasharray = `${L} ${L}`;
  function posicionar(p) {
    caminho.style.strokeDashoffset = String(L * (1 - p));
    const rm = mapa.getBoundingClientRect(), rr = rota.getBoundingClientRect();
    const sx = rm.width / 1200, sy = rm.height / 220;
    const topo = rm.top - rr.top, esq = rm.left - rr.left;
    const a = caminho.getPointAtLength(Math.max(0, p * L));
    const b = caminho.getPointAtLength(Math.min(L, p * L + 4));
    const ang = Math.atan2((b.y - a.y) * sy, (b.x - a.x) * sx) * (180 / Math.PI);
    const w = onibus.offsetWidth, h = onibus.offsetHeight;
    gsap.set(onibus, { x: esq + a.x * sx - w / 2, y: topo + a.y * sy - h * 0.92, rotation: ang, transformOrigin: "50% 92%" });
    km.textContent = Math.round(p * 115);
  }
  posicionar(0);
  ScrollTrigger.create({
    trigger: rota, start: "top 78%", end: "bottom 38%", scrub: 0.6,
    onUpdate: (st) => posicionar(st.progress),
    onRefresh: (st) => posicionar(st.progress),
  });

  /* ---------- 04 · na prática: adesivos arrastáveis ---------- */
  entra(".frentes li", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 }, ".frentes");
  entra(".adesivo", { y: -80, scale: 1.25, opacity: 0, duration: 0.9, ease: "back.out(1.6)", stagger: 0.09 }, ".mural-adesivos", "top 75%");
  if (window.Draggable) {
    let z = 10;
    window.Draggable.create(".adesivo", {
      bounds: ".mural-adesivos",
      edgeResistance: 0.75,
      onPress() { this.target.style.zIndex = ++z; gsap.to(this.target, { scale: 1.08, duration: 0.25 }); },
      onRelease() { gsap.to(this.target, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" }); },
    });
  }

  /* ---------- 05 · equipes ---------- */
  entra(".equipe", { yPercent: 18, duration: 1.1, ease: "power4.out", stagger: 0.1 }, ".equipes__cols", "top 90%");

  /* ---------- 06 · roteiro ---------- */
  entra(".passe", { y: 80, rotation: -4, duration: 1.2, ease: "power4.out" }, ".passe");
  entra(".dia", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 }, ".dias");

  /* ---------- 08 · como ir ---------- */
  entra(".ir__script", { scale: 0.6, rotation: -20, opacity: 0, duration: 1.2, ease: "elastic.out(1, 0.6)" }, ".ir__chamada");
  entra(".ficha-ir", { y: 60, duration: 1.1, ease: "power4.out" }, ".ficha-ir");
  mm.add("(hover: hover) and (pointer: fine)", () => {
    const g = $(".girador");
    const gx = gsap.quickTo(g, "x", { duration: 0.5, ease: "power3" });
    const gy = gsap.quickTo(g, "y", { duration: 0.5, ease: "power3" });
    const m = (e) => {
      const r = g.getBoundingClientRect();
      gx((e.clientX - (r.left + r.width / 2)) * 0.3);
      gy((e.clientY - (r.top + r.height / 2)) * 0.3);
    };
    const s = () => { gx(0); gy(0); };
    g.addEventListener("mousemove", m);
    g.addEventListener("mouseleave", s);
    return () => { g.removeEventListener("mousemove", m); g.removeEventListener("mouseleave", s); };
  });

  /* ---------- 09 · cross run ---------- */
  entra(".corrida__cross", { yPercent: 40, opacity: 0, duration: 1, ease: "power4.out" }, ".corrida__logo");
  entra(".corrida__run", { scale: 0.4, rotation: -40, opacity: 0, duration: 1.2, ease: "elastic.out(1, 0.55)", delay: 0.15 }, ".corrida__logo");

  /* ---------- 10 · apoie: o saleiro anda pela trilha ---------- */
  entra(".apoio", { y: 40, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1 }, ".apoios");
  const trilha = $(".trilha-saleiro");
  const saleiro = $("img", trilha);
  gsap.to(saleiro, { y: -8, rotation: 6, duration: 0.32, ease: "sine.inOut", yoyo: true, repeat: -1 });
  ScrollTrigger.create({
    trigger: trilha, start: "top bottom", end: "bottom 25%", scrub: 0.8,
    onUpdate: (st) => {
      const max = trilha.clientWidth - saleiro.offsetWidth - trilha.clientWidth * 0.08;
      gsap.set(saleiro, { x: st.progress * max, scaleX: st.direction < 0 ? -1 : 1 });
    },
  });

  /* ---------- 11 · dúvidas / 12 · fim ---------- */
  entra(".faq details", { y: 24, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.06 }, ".faq");
  entra(".fim .selo", { scale: 0.5, rotation: -40, duration: 1.5, ease: "elastic.out(1, 0.55)" }, ".fim__centro");
  entra(".fim__frase", { y: 50, opacity: 0, duration: 1, ease: "power4.out" }, ".fim__centro");

  /* ---------- cursor ---------- */
  mm.add("(hover: hover) and (pointer: fine)", () => {
    const c = $(".cursor");
    const rot = $("span", c);
    const cx = gsap.quickTo(c, "x", { duration: 0.35, ease: "power3" });
    const cy = gsap.quickTo(c, "y", { duration: 0.35, ease: "power3" });
    const mover = (e) => { c.classList.add("ativo"); cx(e.clientX); cy(e.clientY); };
    const sobre = (e) => {
      const alvo = e.target.closest("[data-cursor]");
      c.classList.toggle("grande", !!alvo);
      rot.textContent = alvo ? alvo.dataset.cursor : "";
    };
    window.addEventListener("mousemove", mover);
    document.addEventListener("mouseover", sobre);
    return () => { window.removeEventListener("mousemove", mover); document.removeEventListener("mouseover", sobre); };
  });

  /* recalcula depois que fontes e imagens carregam */
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
