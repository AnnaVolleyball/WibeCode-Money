#!/usr/bin/env python3
"""Рисует иконку приложения — голубая гортензия на кобальтовом фоне — в icons/icon.svg.

PNG для iPhone и Android получаются из SVG так (macOS):
    python3 tools/make_icon.py && tools/render_icons.sh
Тот же алгоритм соцветия (белыми линиями) рисует узор на ярких карточках — hydrangea() в app.js.
"""
import math
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Лепесток гортензии: округлый, чуть заострённый, смотрит вверх, длина 1
PETAL = 'M0 0C-.55-.18-.62-.78-.3-.98C-.12-1.08.12-1.08.3-.98C.62-.78.55-.18 0 0Z'


def rng(seed):
    state = [seed]

    def r():
        state[0] = (state[0] * 16807) % 2147483647
        return (state[0] - 1) / 2147483646
    return r


def f(n):
    return f'{n:.3f}'.rstrip('0').rstrip('.')


def floret(x, y, s, rot):
    # белые линии с лёгкой заливкой — как узор на ярких карточках приложения
    out = ''
    for i in range(4):
        out += (f'<path d="{PETAL}" transform="translate({f(x)} {f(y)}) rotate({f(rot + i * 90)}) scale({f(s)})" '
                f'fill="#fff" fill-opacity=".1" stroke="#fff" stroke-opacity=".78" stroke-width="{f(1.4 / s)}" stroke-linejoin="round"/>')
    return out + f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(s * .13)}" fill="#fff" fill-opacity=".85"/>'


def cluster(cx, cy, R, seed):
    # тот же порядок случайных чисел, что в FLOWER в app.js
    r = rng(seed)
    pts = [(0.0, 0.0)]
    pts += [(math.cos(i / 6 * math.pi * 2 + .3) * .52, math.sin(i / 6 * math.pi * 2 + .3) * .5) for i in range(6)]
    pts += [(math.cos(i / 10 * math.pi * 2 + .1) * .98, math.sin(i / 10 * math.pi * 2 + .1) * .9) for i in range(10)]
    pts.sort(key=lambda p: p[1] + p[0] * .1)  # дальние (верх) раньше, ближние (низ) поверх
    out = ''
    for px, py in pts:
        x = cx + (px + (r() - .5) * .12) * R
        y = cy + (py + (r() - .5) * .12) * R
        s = R * (.44 + .1 * (py + 1) / 2 + (r() - .5) * .06)
        out += floret(x, y, s, r() * 90)
    return out


def leaf(x, y, ln, rot):
    return (f'<g transform="translate({x} {y}) rotate({rot})">'
            f'<path d="M0 0C{f(ln*.35)} {f(-ln*.28)} {f(ln*.8)} {f(-ln*.22)} {ln} 0C{f(ln*.8)} {f(ln*.22)} {f(ln*.35)} {f(ln*.28)} 0 0Z" '
            f'fill="#fff" fill-opacity=".07" stroke="#fff" stroke-opacity=".78" stroke-width="1.6" stroke-linejoin="round"/>'
            f'<path d="M{f(ln*.05)} 0H{f(ln*.9)}M{f(ln*.3)} 0l{f(ln*.14)} {f(-ln*.12)}M{f(ln*.5)} 0l{f(ln*.14)} {f(-ln*.11)}'
            f'M{f(ln*.3)} 0l{f(ln*.14)} {f(ln*.12)}M{f(ln*.5)} 0l{f(ln*.14)} {f(ln*.11)}" '
            f'fill="none" stroke="#fff" stroke-opacity=".65" stroke-width="1.3" stroke-linecap="round"/></g>')


def icon_svg():
    # фон и кайма — как у яркой карточки (--hero), гортензия — как FLOWER, листья целиком
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0e28aa"/><stop offset=".48" stop-color="#1a4fea"/><stop offset="1" stop-color="#10a4ff"/></linearGradient>
</defs>
<rect width="180" height="180" fill="url(#bg)"/>
<rect x="9" y="9" width="162" height="162" rx="32" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="1.6"/>
{leaf(66, 120, 38, 140)}{leaf(111, 123, 34, 52)}
{cluster(90, 76, 44, 7)}
</svg>
'''


if __name__ == '__main__':
    path = os.path.join(ROOT, 'icons', 'icon.svg')
    with open(path, 'w') as fh:
        fh.write(icon_svg())
    print('saved', path)
