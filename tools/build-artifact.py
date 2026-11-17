#!/usr/bin/env python3
"""Gera uma versão da página em arquivo único para publicar como artefato no claude.ai.

CSS, JS e fontes vão embutidos no HTML; as imagens de assets/ são publicadas
como arquivos ao lado. Uso: python3 tools/build-artifact.py <pasta-de-saída>
"""
import base64, pathlib, re, shutil, sys

raiz = pathlib.Path(__file__).resolve().parent.parent
saida = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else raiz / "dist-artifact")
saida.mkdir(parents=True, exist_ok=True)

html = (raiz / "index.html").read_text(encoding="utf-8")
css = (raiz / "styles.css").read_text(encoding="utf-8")
js = (raiz / "script.js").read_text(encoding="utf-8")

def fonte_inline(m):
    caminho = raiz / m.group(1)
    dados = base64.b64encode(caminho.read_bytes()).decode()
    return f'url("data:font/woff2;base64,{dados}")'

css = re.sub(r'url\("(assets/fonts/[^"]+\.woff2)"\)', fonte_inline, css)

head = re.search(r"<head>(.*?)</head>", html, re.S).group(1)
body = re.search(r"<body>(.*?)</body>", html, re.S).group(1)
fontes_google = re.search(r'<link href="https://fonts\.googleapis\.com[^>]+>', head).group(0)
descricao = re.search(r'<meta name="description"[^>]+>', head).group(0)

body = re.sub(r'\s*<script src="script\.js"( defer)?></script>', "", body)

pagina = f"""<title>Pé na Estrada</title>
{descricao}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{fontes_google}
<style>
{css}
</style>
{body.strip()}
<script>
{js}
</script>
"""
(saida / "index.html").write_text(pagina, encoding="utf-8")

usados = sorted(set(re.findall(r'(assets/(?:marca|equipes|fotos)/[^"\')\s,]+\.(?:svg|webp))', body + css)))
for rel in usados:
    destino = saida / rel
    destino.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(raiz / rel, destino)
print("\n".join(["index.html"] + usados))
