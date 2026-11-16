document.documentElement.classList.add("js");

// Revela os blocos ao rolar
const revelaveis = document.querySelectorAll(".revela");
if ("IntersectionObserver" in window) {
  const obs = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visivel");
          obs.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
  );
  revelaveis.forEach((el) => obs.observe(el));
} else {
  revelaveis.forEach((el) => el.classList.add("visivel"));
}

// Aviso rápido (toast)
const aviso = document.querySelector(".aviso");
let avisoTimer;
function avisar(msg) {
  aviso.textContent = msg;
  aviso.classList.add("mostra");
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => aviso.classList.remove("mostra"), 2600);
}

async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}

// Copiar chave PIX
document.querySelectorAll("[data-copiar]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const alvo = document.getElementById(btn.dataset.copiar);
    const ok = await copiar(alvo.textContent.trim());
    avisar(ok ? "Chave PIX copiada!" : "Não deu pra copiar. Selecione a chave e copie.");
  });
});

// Compartilhar página
document.querySelectorAll("[data-compartilhar]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const dados = {
      title: "Pé na Estrada · Ponta Grossa 2027",
      text: "Viagem missionária da Juventude Cross. Vem junto!",
      url: location.href,
    };
    if (navigator.share) {
      try { await navigator.share(dados); } catch { /* cancelado */ }
      return;
    }
    const ok = await copiar(location.href);
    avisar(ok ? "Link copiado!" : "Copie o link na barra do navegador.");
  });
});
