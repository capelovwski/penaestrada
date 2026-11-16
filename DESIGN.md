# Pé na Estrada — Direção visual

Viagem missionária da Juventude Cross (Igreja Batista do Bacacheri) a Ponta Grossa, PR, em 2027.

Retrô anos 70, clima de acampamento e de parques nacionais. A página precisa parecer material
impresso: cartaz, flâmula, adesivo, bilhete de viagem. Nada de "app" ou SaaS.

Referências: The Spin Room (blocos chapados, títulos display enormes), Youth Camp / Happy Campers
(script cursivo sobre display, patches e badges), pôster de parques nacionais (tipografia em uma
cor só sobre verde-escuro), press kit Roots (adesivos recortados, flâmula).

## Peças da marca (`assets/marca/`)

| Arquivo | Uso na página |
|---|---|
| `lettering-creme.svg` | Título do hero (h1) e logo do topo |
| `lettering-verde.svg` | Reserva, para fundo claro |
| `logo-original.svg` | Centro do selo do hero (círculo vermelho + lettering) |
| `anel-do-selo.svg` | Anel do selo do hero, girando devagar atrás da logo |
| `selo-completo-original.svg` | Rodapé |
| `logo-completa-texto-invertido.svg` | Reserva |
| `bandeirinha-27-original.svg` | Flâmula no hero |
| `emblema-pedra-original.svg` | Vila Velha (a Taça): hero e seção Destino |
| `onibus.svg` | Ônibus andando na estrada, seção Destino |
| `saleiro-original.svg` | **Saleirinho, o mascote**: hero e Dúvidas |
| `saleiro-silhueta-*.svg` | Marca d'água no rodapé |
| `prancha-original-completa.svg` | Prancha de referência (2,7 MB). Não é usada na página |

## Cores

| Token              | Hex       | Uso |
|--------------------|-----------|-----|
| `--verde`          | `#1c3c25` | Cor da marca. Fundos de seção, texto sobre creme |
| `--verde-escuro`   | `#132a1a` | Destino, rodapé, sombras duras |
| `--creme`          | `#e9e4d2` | Cor da marca. Fundo claro, texto sobre verde |
| `--vermelho`       | `#eb3330` | Cor da marca. Faixas, botões, formas. Texto creme só em tamanho grande |
| `--vermelho-escuro`| `#c4221f` | Quando há texto corrido sobre vermelho (contraste AA) |
| `--areia`          | `#f3e0b7` | Rótulos sobre verde, adesivo claro |
| `--amarelo`        | `#f5d547` | **Só** para marcadores de conteúdo pendente (`.ph`) |

Regras: no máximo 2 cores + creme por bloco. Sem gradiente. Sombra só "dura" (offset sólido),
como adesivo.

## Tipografia

- **Hartman & Richard** (`assets/fonts/`): script de pincel. Palavras curtas sobre títulos,
  versículo, títulos dos cartões de apoio. O "s" alongado faz parte do desenho da fonte.
- **Rhinayza** (`assets/fonts/`): assinatura fina. Legendas de foto. Sempre ≥ 2rem.
- **Fraunces** 900, SOFT 100 (Google Fonts): títulos display em caixa-alta, com cara de Cooper.
- **Jost** (Google Fonts): texto corrido e rótulos espaçados. É a mesma fonte do anel do selo.

As fontes Hartman e Rhinayza são comerciais. Confirmar se a licença cobre uso na web.

## Elementos

- Selo circular, flâmula, emblema em arco, adesivos levemente girados com borda creme.
- Letreiro vermelho rolando entre seções.
- Bilhetes de viagem com recorte lateral (roteiro).
- Grão de filme (SVG `feTurbulence`) por cima de tudo, baixa opacidade.

## Movimento

O anel do selo gira, a flâmula tremula, o saleirinho anda, o ônibus atravessa a estrada e o
letreiro rola. Tudo desliga com `prefers-reduced-motion`.

## Tema

Paleta fixa, sem modo escuro: as seções verdes já fazem o papel do escuro.
