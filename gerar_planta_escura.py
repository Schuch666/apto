"""Gera a versão escura da planta, nas cores do tema escuro da página (style.css).

Uso: python3 gerar_planta_escura.py [entrada.png] [saida.png]

Remapeia pela luminosidade: branco -> fundo, cinza das paredes -> cor das paredes,
preto (cotas e textos) -> cor do texto. Mantém o tamanho da imagem, então a escala não muda.
"""
import sys

from PIL import Image

ENTRADA = sys.argv[1] if len(sys.argv) > 1 else 'planta_paredes_janelas_cotas.png'
SAIDA = sys.argv[2] if len(sys.argv) > 2 else 'planta_escura.png'

FUNDO = (0x1d, 0x20, 0x26)   # --planta-fundo
PAREDE = (0x9a, 0xa3, 0xb0)  # --planta-parede
TEXTO = (0xd8, 0xdd, 0xe5)   # --texto
CINZA_PAREDE = 55            # luminosidade das paredes na planta original


def mistura(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def cor(lum):
    if lum >= CINZA_PAREDE:
        return mistura(FUNDO, PAREDE, (255 - lum) / (255 - CINZA_PAREDE))
    return mistura(PAREDE, TEXTO, (CINZA_PAREDE - lum) / CINZA_PAREDE)


tabela = [cor(l) for l in range(256)]
cinza = Image.open(ENTRADA).convert('L')
lut = [c[i] for i in range(3) for c in tabela]  # um canal por vez, como Image.point espera
Image.merge('RGB', [cinza] * 3).point(lut).save(SAIDA, optimize=True)
print('gerado:', SAIDA)
