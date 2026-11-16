# Pé na Estrada — Direção visual (v2)

Viagem missionária da Juventude Cross (Igreja Batista do Bacacheri) a Ponta Grossa, PR, em 2027.
Identidade visual: Lovwski (Murilo Capelo). O site segue a linguagem do estudo de caso do projeto.

## Princípios

- **Painéis de cor chapada** (creme, verde, vermelho, carvão) com cantos arredondados no topo,
  que deslizam por cima do anterior. O painel de trás encolhe e escurece (empilhamento).
- **Títulos grandes e redondos**, rótulos em **mono pequeno, caixa alta e numerados**
  ("02 · A ideia"), texto em sans neutro, fichas técnicas com linhas finas.
- **Adesivos da marca com sombra macia** (nada de sombra dura).
- **Fotos das VMs anteriores** como protagonistas: rolos no topo e galeria horizontal.
- **Movimento sóbrio**: entradas suaves (expo), sem quiques elásticos, sem cursor
  personalizado, sem elementos "de brinquedo". O que se move conta algo da viagem:
  o contorno do município se desenhando, o selo girando devagar, os rolos de fotos.

## Cores

| Token        | Hex       | Uso |
|--------------|-----------|-----|
| `--verde`    | `#1c3c25` | Marca, títulos sobre creme, painéis escuros |
| `--creme`    | `#e9e4d2` | Fundo base, texto sobre cores |
| `--vermelho` | `#eb3330` | Destaque: centro do selo, sol, botões em hover, painel "Como ir" |
| `--carvao`   | `#262626` | Painel da Cross Run e equipe Staff |
| `--fundo`    | `#121412` | Fundo atrás dos painéis (aparece nos cantos arredondados) |

## Tipografia

| Papel | Fonte no site | Fonte da identidade |
|---|---|---|
| Títulos | Bricolage Grotesque 800, largura 92 (Google Fonts) | Choldem Rosther |
| Destaques | Hartman & Richard (`assets/fonts/`) | Nikey Vintage |
| Texto | Inter | — |
| Rótulos | JetBrains Mono, 12px, caixa alta | mono |

Quando os arquivos de Choldem Rosther e Nikey Vintage estiverem disponíveis, basta trocar
`--f-display` e `--f-script` em `styles.css`.

## Seções

01 Topo (contorno do município de Ponta Grossa se desenhando atrás do selo + versículo +
rolos de fotos) · 02 A ideia · 03 Destino (emblema + faixa de dados) · 04 Na prática
(frentes + composição de adesivos com profundidade) ·
05 Equipes (Geral, Staff, Saúde) · 06 Roteiro (cartão de embarque + dias) · 07 Outras VMs
(galeria horizontal) · 08 Como ir · 09 Cross Run (abas automáticas) · 10 Apoie · 11 Dúvidas · Fim.

## Movimento

GSAP 3.12.5 (ScrollTrigger) e Lenis 1.1.13, por CDN. O contorno do mapa é CSS puro
(máscara SVG que se desenha em ~4 s e pontilhado que corre devagar pela borda), então
funciona mesmo sem as bibliotecas. O traçado foi extraído da divisa do município no mapa
de referência e suavizado. Sem eles, ou com
"reduzir movimento", a página continua completa e estática. Empilhamento e galeria
horizontal só a partir de 900px; no celular, a galeria rola com o dedo.

## Conteúdo pendente

Aparece como `<span class="ph">[...]</span>` (borda tracejada, fonte mono).
Espaços de foto: `<div class="foto" data-foto="...">` — ver `assets/fotos/LEIA-ME.md`.
