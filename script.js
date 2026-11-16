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
  gsap.defaults({ ease: "expo.out" });
  const mm = gsap.matchMedia();
  // anima a partir de um estado visível: só salta para o início quando entra na tela
  const entra = (alvos, vars, gatilho, inicio = "top 85%") =>
    gsap.from(alvos, {
      duration: 1.2,
      ...vars,
      immediateRender: false,
      scrollTrigger: { trigger: gatilho || alvos, start: inicio, toggleActions: "play none none none" },
    });

  /* ---------- rolos de fotos e selos (aceleram de leve com a rolagem) ---------- */
  const loops = [];
  $$(".rolo__trilho").forEach((t) => {
    t.style.animation = "none";
    const volta = t.closest(".rolo__linha--volta");
    const dur = volta ? 90 : 80;
    loops.push(
      volta
        ? gsap.fromTo(t, { xPercent: -50 }, { xPercent: 0, duration: dur, ease: "none", repeat: -1 })
        : gsap.to(t, { xPercent: -50, duration: dur, ease: "none", repeat: -1 })
    );
  });
  $$(".selo__anel").forEach((a) => loops.push(gsap.to(a, { rotation: 360, duration: 60, ease: "none", repeat: -1 })));
  let alvoVel = 1;
  ScrollTrigger.create({
    onUpdate: (st) => { alvoVel = 1 + Math.min(Math.abs(st.getVelocity()) / 700, 2.5); },
  });
  gsap.ticker.add(() => {
    loops.forEach((l) => l.timeScale(gsap.utils.interpolate(l.timeScale(), alvoVel, 0.06)));
    alvoVel = gsap.utils.interpolate(alvoVel, 1, 0.05);
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
            trigger: galeria, start: "top top", end: () => "+=" + dist(),
            pin: true, scrub: 0.8, invalidateOnRefresh: true,
          },
        });
        $$(".g-item", galeria).forEach((f, j) =>
          gsap.fromTo(f, { y: j % 2 ? 16 : -12 }, {
            y: j % 2 ? -16 : 12, ease: "none",
            scrollTrigger: { trigger: galeria, start: "top top", end: () => "+=" + dist(), scrub: true },
          })
        );
        return;
      }
      if (i === paineis.length - 1) return;
      const curto = () => p.offsetHeight <= window.innerHeight;
      gsap.fromTo(p, { scale: 1, "--veu": 0 }, {
        scale: 0.95, "--veu": 0.5, ease: "none", transformOrigin: "50% 0%",
        scrollTrigger: {
          trigger: p,
          start: () => (curto() ? "top top" : "bottom bottom"),
          end: () => "+=" + window.innerHeight,
          pin: true, pinSpacing: false, scrub: true, invalidateOnRefresh: true,
        },
      });
    });
    return () => galeria.classList.remove("galeria--horizontal");
  });

  /* ---------- 01 · topo ---------- */
  gsap.from(".hero__palco .selo", { scale: 0.94, opacity: 0, duration: 1.8, delay: 0.6 });
  gsap.from(".hero__vers, .hero__ref, .hero__acoes", { y: 16, duration: 1.4, stagger: 0.08, delay: 0.9 });
  gsap.from(".mapa__nota", { opacity: 0, duration: 1.2, stagger: 0.15, delay: 2.4 });
  gsap.from(".rolo__linha", { x: (i) => (i ? -60 : 60), duration: 2, delay: 0.4 });
  gsap.to(".hero__palco .selo", {
    yPercent: -8, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".mapa", {
    scale: 1.06, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* ---------- 02 · ideia ---------- */
  $$(".ideia__titulo .linha").forEach((l) => {
    l.style.overflow = "hidden";
    l.innerHTML = `<span style="display:inline-block">${l.innerHTML}</span>`;
  });
  entra(".ideia__titulo .linha > span", { yPercent: 105, duration: 1.3, stagger: 0.1 }, ".ideia__titulo");
  entra(".ideia .ficha > div", { y: 14, opacity: 0, duration: 1, stagger: 0.06 }, ".ideia .ficha");

  const manifesto = $("[data-palavras]");
  manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/).map((w) => `<span class="p">${w}</span>`).join(" ");
  gsap.to(".manifesto .p", {
    opacity: 1, ease: "none", stagger: 0.08,
    scrollTrigger: { trigger: manifesto, start: "top 82%", end: "bottom 40%", scrub: true },
  });

  /* ---------- 03 · destino ---------- */
  entra(".destino__emblema img", { y: 50, opacity: 0, duration: 1.6 }, ".destino__emblema");
  entra(".destino__texto > *", { y: 20, opacity: 0, stagger: 0.07 }, ".destino__texto");
  entra(".dados > div", { y: 16, opacity: 0, stagger: 0.07 }, ".dados", "top 90%");
  const km = $("[data-km]");
  const cont = { v: 0 };
  ScrollTrigger.create({
    trigger: ".dados", start: "top 90%", once: true,
    onEnter: () => gsap.fromTo(cont, { v: 0 }, { v: 115, duration: 2, ease: "power2.out", onUpdate: () => (km.textContent = Math.round(cont.v)) }),
  });
  mm.add("(hover: hover) and (pointer: fine)", () => {
    const img = $(".destino__emblema img");
    const rx = gsap.quickTo(img, "rotationX", { duration: 0.9, ease: "power3" });
    const ry = gsap.quickTo(img, "rotationY", { duration: 0.9, ease: "power3" });
    const area = $(".destino__grade");
    const mover = (e) => {
      const r = img.getBoundingClientRect();
      ry(((e.clientX - (r.left + r.width / 2)) / r.width) * 10);
      rx(-((e.clientY - (r.top + r.height / 2)) / r.height) * 10);
    };
    const sair = () => { rx(0); ry(0); };
    area.addEventListener("mousemove", mover);
    area.addEventListener("mouseleave", sair);
    return () => { area.removeEventListener("mousemove", mover); area.removeEventListener("mouseleave", sair); };
  });

  /* ---------- 04 · na prática: adesivos com profundidade ---------- */
  entra(".frentes li", { y: 18, opacity: 0, duration: 1, stagger: 0.07 }, ".frentes");
  entra(".adesivo", { y: 24, opacity: 0, duration: 1.4, stagger: 0.06 }, ".mural-adesivos", "top 80%");
  $$(".adesivo").forEach((el, i) => {
    const prof = [0.5, 1.2, 0.8, 1, 1.4, 0.7, 1.1][i % 7];
    gsap.fromTo(el, { y: 36 * prof }, {
      y: -36 * prof, ease: "none", immediateRender: false,
      scrollTrigger: { trigger: ".mural-adesivos", start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* ---------- 05 · equipes ---------- */
  entra(".equipe", { yPercent: 8, duration: 1.4, stagger: 0.08 }, ".equipes__cols", "top 92%");

  /* ---------- 06 · roteiro ---------- */
  entra(".passe", { y: 50, opacity: 0, duration: 1.4 }, ".passe");
  entra(".passe__seta", { scaleX: 0, transformOrigin: "left center", duration: 1.6, delay: 0.3 }, ".passe");
  entra(".dia", { y: 18, opacity: 0, stagger: 0.07 }, ".dias");

  /* ---------- 08 · como ir ---------- */
  entra(".ir__chamada > *", { y: 20, opacity: 0, stagger: 0.07 }, ".ir__chamada");
  entra(".ficha-ir", { y: 40, opacity: 0, duration: 1.4 }, ".ficha-ir");

  /* ---------- 09 · cross run ---------- */
  entra(".corrida__cross", { yPercent: 30, opacity: 0, duration: 1.3 }, ".corrida__logo");
  entra(".corrida__run", { x: -16, opacity: 0, duration: 1.3, delay: 0.15 }, ".corrida__logo");

  /* ---------- 10 · apoie / 11 · dúvidas / fim ---------- */
  entra(".apoio", { y: 20, opacity: 0, stagger: 0.08 }, ".apoios");
  entra(".faq details", { y: 14, opacity: 0, duration: 1, stagger: 0.05 }, ".faq");
  entra(".fim .selo", { scale: 0.94, opacity: 0, duration: 1.6 }, ".fim__centro");
  entra(".fim__frase", { y: 30, opacity: 0, duration: 1.4 }, ".fim__centro");

  /* recalcula depois que fontes e imagens carregam */
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
