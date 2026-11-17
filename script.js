/* Pé na Estrada — interações e animações
   Funciona sem GSAP/Lenis (tudo visível e estático); com eles, ganha movimento. */
(() => {
  /* ====== LINK DO FORMULÁRIO DE INSCRIÇÃO ======
     Cole aqui o link (Google Forms, Typeform etc.). Enquanto estiver vazio,
     os botões de inscrição levam até a seção "Como ir". */
  const LINK_INSCRICAO = "";

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

  /* ---------- fotos: fade curto ao terminar de carregar ---------- */
  document.querySelectorAll(".foto img, .card-foto__in img, .equipe__camisas img").forEach((im) => {
    const pronto = () => im.classList.add("ok");
    if (im.complete && im.naturalWidth) pronto();
    else { im.addEventListener("load", pronto, { once: true }); im.addEventListener("error", pronto, { once: true }); }
  });

  /* ---------- botões de inscrição ---------- */
  document.querySelectorAll("[data-inscricao]").forEach((a) => {
    if (LINK_INSCRICAO) {
      a.href = LINK_INSCRICAO;
      a.target = "_blank";
      a.rel = "noopener";
    } else if (a.closest("#como-ir")) {
      a.href = "#";
    }
  });
  const fixa = document.querySelector(".inscricao-fixa");
  if (fixa && "IntersectionObserver" in window) {
    const visiveis = new Set();
    const alvos = [".hero", "#como-ir", ".fim"].map((q) => document.querySelector(q)).filter(Boolean);
    const obs = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target)));
      fixa.classList.toggle("mostra", visiveis.size === 0);
    }, { threshold: 0.12 });
    alvos.forEach((el) => obs.observe(el));
  }

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
      if (id === "#") { e.preventDefault(); avisar("O link de inscrição sai em breve"); return; }
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
    ultimoY = y;
    temaNav();
  }
  window.addEventListener("scroll", () => requestAnimationFrame(aoRolar), { passive: true });
  temaNav();

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

  /* ---------- luz que contorna o mapa (pixels reais, funciona no Safari) ---------- */
  $$("svg.mapa").forEach((svg) => {
    const base = svg.querySelector("defs path");
    if (!base || !base.getTotalLength) return;
    const L = base.getTotalLength();
    const partes = [...svg.querySelectorAll(".mapa__cauda .c, .mapa__halo, .mapa__luz")];
    if (reduzido || !partes[0].animate) {
      svg.classList.add("luz-js");
      partes.forEach((p) => (p.style.display = "none"));
      const t = svg.querySelector(".mapa__traco");
      if (t) t.style.display = "inline";
      return;
    }
    svg.classList.add("luz-js");
    const T = 7000;
    const cauda = partes.filter((p) => p.classList.contains("c"));
    const N = cauda.length;
    const seg = L / N;
    const anima1 = (el, comp, ini) => {
      el.style.strokeDasharray = `${comp} ${L - comp}`;
      el.animate(
        [{ strokeDashoffset: ini }, { strokeDashoffset: ini - L }],
        { duration: T, iterations: Infinity, easing: "linear", delay: 300 }
      );
    };
    const anims = [];
    const _anima1 = anima1;
    const anima2 = (el, comp, ini) => { _anima1(el, comp, ini); anims.push(...el.getAnimations()); };
    cauda.forEach((el, k) => anima2(el, seg + 0.3, (k + 1) * seg));
    const halo = svg.querySelector(".mapa__halo");
    const luz = svg.querySelector(".mapa__luz");
    if (luz) anima2(luz, L * 0.012, L * 0.012);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => anims.forEach((a) => (e.isIntersecting ? a.play() : a.pause())))
        .observe(svg);
    }
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
      let veu = p.querySelector(":scope > .painel__veu");
      if (!veu) { veu = document.createElement("div"); veu.className = "painel__veu"; p.appendChild(veu); }
      const st = {
        trigger: p,
        start: () => (curto() ? "top top" : "bottom bottom"),
        end: () => "+=" + window.innerHeight,
        scrub: true, invalidateOnRefresh: true,
      };
      gsap.fromTo(veu, { opacity: 0 }, { opacity: 0.5, ease: "none", scrollTrigger: st });
      gsap.fromTo(p, { scale: 1 }, {
        scale: 0.95, ease: "none", transformOrigin: "50% 0%", force3D: true,
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
  gsap.from(".hero-saleiro", { y: 30, scale: 0.85, opacity: 0, duration: 1.6, stagger: 0.15, delay: 1.1 });
  gsap.to(".hero__palco .selo", {
    yPercent: -8, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".mapa", {
    scale: 1.06, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  // cards de foto do topo: entram em sequência e reagem ao mouse e à rolagem
  gsap.from(".hero__cards .card-foto", { opacity: 0, scale: 0.9, y: 30, duration: 1.6, stagger: 0.09, delay: 0.5 });
  $$(".hero__cards .card-foto").forEach((c, i) => {
    const prof = [0.6, 1.3, 1.1, 0.7, 1.4, 0.8][i % 6];
    gsap.to(c, { yPercent: -18 * prof, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  });
  mm.add("(hover: hover) and (pointer: fine)", () => {
    const cs = $$(".hero__cards .card-foto__in");
    const fx = cs.map((c) => gsap.quickTo(c, "x", { duration: 1.2, ease: "power3" }));
    const fy = cs.map((c) => gsap.quickTo(c, "y", { duration: 1.2, ease: "power3" }));
    const mover = (e) => {
      const dx = e.clientX / innerWidth - 0.5, dy = e.clientY / innerHeight - 0.5;
      cs.forEach((_, i) => { const p = [10, 22, 18, 12, 24, 14][i % 6]; fx[i](-dx * p); fy[i](-dy * p); });
    };
    const hero = $(".hero");
    hero.addEventListener("mousemove", mover);
    return () => hero.removeEventListener("mousemove", mover);
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
    scrollTrigger: { trigger: manifesto, start: "top 92%", end: "bottom 74%", scrub: 0.6 },
  });

  entra(".ia", { scale: 0.9, opacity: 0, duration: 1.4, stagger: 0.08 }, ".ideia", "top 70%");
  $$(".ia").forEach((el, i) => {
    const prof = [1.2, 0.8, 1.4, 0.6, 1, 0.9][i % 6];
    gsap.fromTo(el, { y: 50 * prof }, {
      y: -50 * prof, ease: "none",
      scrollTrigger: { trigger: ".ideia", start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  entra(".ideia__fotos .card-foto", { y: 50, opacity: 0, duration: 1.4, stagger: 0.12 }, ".ideia__fotos");

  /* ---------- 03 · destino ---------- */
  entra(".destino__emblema img", { y: 40, opacity: 0, duration: 1.6, delay: 0.15 }, ".destino__mapa");
  entra(".destino__texto > *", { y: 20, opacity: 0, stagger: 0.07 }, ".destino__texto");
  entra(".destino__silhueta", { scale: 0.96, opacity: 0, duration: 1.6 }, ".destino__mapa");
  entra(".dm", { y: 24, opacity: 0, duration: 1.3, stagger: 0.1, delay: 0.3 }, ".destino__mapa");
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
  entra(".adesivo", { scale: 0.92, opacity: 0, duration: 1.4, stagger: 0.06 }, ".mural-adesivos", "top 80%");
  $$(".adesivo").forEach((el, i) => {
    const prof = [0.5, 1.2, 0.8, 1, 1.4, 0.7, 1.1][i % 7];
    gsap.fromTo(el, { y: 36 * prof }, {
      y: -36 * prof, ease: "none",
      scrollTrigger: { trigger: ".mural-adesivos", start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* ---------- 05 · equipes ---------- */
  entra(".equipe", { y: 40, opacity: 0, duration: 1.4, stagger: 0.08 }, ".equipes__grade", "top 88%");

  /* ---------- 06 · roteiro ---------- */
  entra(".passe", { y: 50, opacity: 0, duration: 1.4 }, ".passe");
  entra(".passe__seta", { scaleX: 0, transformOrigin: "left center", duration: 1.6, delay: 0.3 }, ".passe");
  entra(".dia", { y: 18, opacity: 0, stagger: 0.07 }, ".dias");

  /* ---------- 08 · como ir ---------- */
  entra(".ir__chamada > *:not(.ir__foto)", { y: 20, opacity: 0, stagger: 0.07 }, ".ir__chamada");
  entra(".ficha-ir", { y: 40, opacity: 0, duration: 1.4 }, ".ficha-ir");
  entra(".ir__foto", { y: 50, rotation: 0, opacity: 0, duration: 1.4 }, ".ir__foto", "top 92%");


  /* ---------- 10 · apoie / 11 · dúvidas / fim ---------- */
  entra(".apoio", { y: 20, opacity: 0, stagger: 0.08 }, ".apoios");
  entra(".faq details", { y: 14, opacity: 0, duration: 1, stagger: 0.05 }, ".faq");
  entra(".fim .selo", { scale: 0.92, opacity: 0, duration: 1.8 }, ".fim__grade");
  entra(".fim__saleiro", { x: -30, opacity: 0, duration: 1.6, delay: 0.4 }, ".fim__grade");
  entra(".fim__texto > *", { y: 30, opacity: 0, duration: 1.4, stagger: 0.08 }, ".fim__grade");

  /* recalcula depois que fontes e imagens carregam */
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
