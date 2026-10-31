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


def floret(x, y, s, rot, fill, center):
    out = ''
    for i in range(4):
        out += (f'<path d="{PETAL}" transform="translate({f(x)} {f(y)}) rotate({f(rot + i * 90)}) scale({f(s)})" '
                f'fill="{fill}" stroke="#fff" stroke-opacity=".75" stroke-width="{f(1.2 / s)}" stroke-linejoin="round"/>')
    return out + f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(s * .13)}" fill="{center}"/>'


def cluster(cx, cy, R, seed, pal, center):
    r = rng(seed)
    pts = [(0.0, 0.0)]
    pts += [(math.cos(i / 6 * math.pi * 2 + .3) * .52, math.sin(i / 6 * math.pi * 2 + .3) * .5) for i in range(6)]
    pts += [(math.cos(i / 10 * math.pi * 2 + .1) * .98, math.sin(i / 10 * math.pi * 2 + .1) * .9) for i in range(10)]
    pts.sort(key=lambda p: p[1] + p[0] * .1)  # дальние (верх) раньше, ближние (низ) поверх
    out = ''
    for px, py in pts:
        jx, jy = (r() - .5) * .12, (r() - .5) * .12
        depth = (py + 1) / 2
        s = R * (.44 + .1 * depth + (r() - .5) * .06)
        rot = r() * 90
        k = min(len(pal) - 1, max(0, math.floor(depth * (len(pal) - 1) + (r() - .5) * 1.6 + .5)))
        out += floret(cx + (px + jx) * R, cy + (py + jy) * R, s, rot, pal[k], center)
    return out


def leaf(x, y, ln, rot):
    return (f'<g transform="translate({x} {y}) rotate({rot})">'
            f'<path d="M0 0C{f(ln*.35)} {f(-ln*.28)} {f(ln*.8)} {f(-ln*.22)} {ln} 0C{f(ln*.8)} {f(ln*.22)} {f(ln*.35)} {f(ln*.28)} 0 0Z" fill="url(#lf)"/>'
            f'<path d="M{f(ln*.05)} 0H{f(ln*.9)}M{f(ln*.3)} 0l{f(ln*.14)} {f(-ln*.12)}M{f(ln*.5)} 0l{f(ln*.14)} {f(-ln*.11)}'
            f'M{f(ln*.3)} 0l{f(ln*.14)} {f(ln*.12)}M{f(ln*.5)} 0l{f(ln*.14)} {f(ln*.11)}" '
            f'fill="none" stroke="#8fe0d6" stroke-width="1.3" stroke-linecap="round"/></g>')


def icon_svg():
    pal = ['#7f8ff0', '#9aa3ff', '#b3b0ff', '#c6cdff', '#dbe6ff', '#f2f6ff']  # от дальних к ближним
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0e28aa"/><stop offset=".55" stop-color="#1a4fea"/><stop offset="1" stop-color="#10a4ff"/></linearGradient>
<linearGradient id="lf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1aa39a"/><stop offset="1" stop-color="#0b5f6e"/></linearGradient>
<radialGradient id="hl" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="sh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#06134d" stop-opacity=".45"/><stop offset="1" stop-color="#06134d" stop-opacity="0"/></radialGradient>
</defs>
<rect width="180" height="180" fill="url(#bg)"/><circle cx="90" cy="76" r="84" fill="url(#hl)"/>
<ellipse cx="92" cy="136" rx="62" ry="16" fill="url(#sh)"/>
{leaf(62, 126, 50, 152)}{leaf(116, 128, 46, 32)}{leaf(90, 134, 40, 96)}
{cluster(90, 80, 50, 23, pal, '#6a6fd8')}
</svg>
'''


if __name__ == '__main__':
    path = os.path.join(ROOT, 'icons', 'icon.svg')
    with open(path, 'w') as fh:
        fh.write(icon_svg())
    print('saved', path)
