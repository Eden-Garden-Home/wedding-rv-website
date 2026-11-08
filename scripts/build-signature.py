"""Extract the supplied Cherolina outlines; no substitute lettering."""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

root = Path(__file__).resolve().parents[1]
font = TTFont(root / 'public/assets/wedding/cherolina.ttf')
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
scale = 86 / font['head'].unitsPerEm
result = []
for row, word in enumerate(['Valentina', '& Riccardo']):
    width = sum(font['hmtx'][cmap[ord(c)]][0] for c in word) * scale
    x = (360 - width) / 2
    for char in word:
        name = cmap[ord(char)]
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, 70 + row * 74)))
        d = pen.getCommands()
        if d:
            # Separate contours allow lifted pen travel instead of drawing jumps.
            contours = ['M' + part for part in d.split('M') if part]
            result.append({'char': char, 'd': d, 'contours': contours, 'row': row})
        x += font['hmtx'][name][0] * scale
(root / 'src/signature-paths.json').write_text(json.dumps(result), encoding='utf-8')
