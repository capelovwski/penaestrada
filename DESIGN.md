# Pé na Estrada — Direção visual

Retrô anos 70, clima de acampamento e de parques nacionais. Parece material impresso:
cartaz, flâmula, adesivo, cartão-postal. Nada de "app" ou SaaS.

Referências: The Spin Room (blocos chapados de verde/laranja, títulos display enormes),
Youth Camp / Happy Campers (script cursivo sobre display, patches e badges),
pôster de parques nacionais (tipografia variada em uma cor só sobre verde-escuro),
press kit Roots (adesivos recortados, flâmula, pulseira).

## Cores

| Token            | Hex       | Uso                                              |
|------------------|-----------|--------------------------------------------------|
| `--verde`        | `#1F4A2C` | Cor principal, fundos de seção, texto sobre creme |
| `--verde-escuro` | `#14321D` | Rodapé, seções de contraste                     |
| `--laranja`      | `#E3612B` | Destaques, faixas, botões principais            |
| `--creme`        | `#F2E8CF` | Fundo claro, texto sobre verde/laranja          |
| `--mostarda`     | `#F0C94A` | Detalhe pontual (selos, sublinhados). Pouco.    |
| `--salvia`       | `#A9C98A` | Tipografia monocromática sobre verde-escuro     |
| `--tinta`        | `#1C1A15` | Texto longo sobre creme                         |

Regra: cada bloco usa no máximo 2 cores + creme. Sem gradiente. Sem sombra difusa —
sombra só "dura" (offset sólido), como adesivo.

## Tipografia

Fontes da identidade (arquivos em `assets/fonts/`, woff2):

- **Hartman & Richard** (normal/itálico): script de pincel forte. É a "assinatura" do projeto:
  "Pé na Estrada", palavras-chave sobre títulos display. No máximo 1 por bloco.
- **Rhinayza** (normal/itálico): script fino de assinatura. Notas à mão, legendas de foto,
  "assinado: equipe". Sempre grande (≥ 2rem), porque o traço é fino demais pra tamanho pequeno.

Complementares (Google Fonts):

- **Fraunces** 800–900, eixo SOFT alto: títulos display em bloco, com cara de Cooper/anos 70.
- **Archivo** (variável, largura 62–125): rótulos condensados em caixa-alta e espaçados
  ("EST. 2027", "EDIÇÃO #01"), e texto corrido em largura normal.

Escala: display em `clamp()` grande (até ~10rem no hero); corpo 1.0625rem / 1.55.

## Elementos

- Badges circulares com texto em caminho (SVG), patches em arco, flâmula.
- Cartões "adesivo": borda creme grossa, leve rotação, sombra dura.
- Faixa letreiro (marquee) laranja entre seções.
- Textura de grão (SVG `feTurbulence`) por cima de tudo, baixa opacidade.
- Ícones em traço único: pinheiro, montanha, sol, fogueira, estrada.
- Fotos com tratamento quente (sépia leve + contraste), como filme.

## Movimento

Pouco e lento: o letreiro rola, os badges giram devagar, e há um leve fade/slide ao rolar a página.
Tudo desliga com `prefers-reduced-motion`.

## Tema

Paleta fixa e intencional, sem modo escuro: as seções verdes já fazem o papel de escuro.
