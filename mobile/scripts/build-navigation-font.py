"""Trace founder-supplied silhouettes into the existing Expo icon-font system.

Optional asset maintenance only: Python with Pillow, numpy, matplotlib, fonttools.
Run from any directory; no Python tooling is needed by the app or its CI build.
"""

from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen


ASSETS = Path(__file__).resolve().parents[1] / "assets" / "navigation"
NAMES = ["hire", "neighborhood"]
glyphs = {".notdef": TTGlyphPen(None).glyph()}

for name in NAMES:
    # Read the originals unchanged; convert their dark contours to vector outlines.
    values = np.asarray(Image.open(ASSETS / "source" / f"{name}.png").convert("L"))
    figure, axes = plt.subplots()
    paths = axes.contour(values, levels=[127.5]).get_paths()
    contours = [polygon for path in paths for polygon in path.to_polygons()]
    plt.close(figure)
    # Ignore isolated scan/compression specks, retaining all meaningful shapes/holes.
    contours = [p for p in contours if abs(np.sum(p[:-1, 0] * p[1:, 1] - p[1:, 0] * p[:-1, 1])) > 16]
    points = np.concatenate(contours)
    low, high = points.min(axis=0), points.max(axis=0)
    scale = 920 / max(high - low)
    offset = (1000 - (high - low) * scale) / 2
    pen = TTGlyphPen(None)
    for contour in contours:
        coords = (contour - low) * scale + offset
        coords[:, 1] = 1000 - coords[:, 1]
        rounded = np.rint(coords).astype(int)
        pen.moveTo(tuple(rounded[0]))
        previous = rounded[0]
        for point in rounded[1:-1]:
            if not np.array_equal(point, previous):
                pen.lineTo(tuple(point))
                previous = point
        pen.closePath()
    glyphs[name] = pen.glyph()

font = FontBuilder(1000, isTTF=True)
font.setupGlyphOrder([".notdef", *NAMES])
font.setupCharacterMap({0xE900 + i: name for i, name in enumerate(NAMES)})
font.setupGlyf(glyphs)
font.setupHorizontalMetrics({name: (1000, getattr(glyph, "xMin", 0)) for name, glyph in glyphs.items()})
font.setupHorizontalHeader(ascent=1000, descent=0)
font.setupNameTable({
    "familyName": "MyCornerNavigation",
    "styleName": "Regular",
    "uniqueFontIdentifier": "MyCornerNavigation-Regular-1",
    "fullName": "MyCornerNavigation Regular",
    "psName": "MyCornerNavigation-Regular",
    "version": "Version 1.000",
})
font.setupOS2(sTypoAscender=1000, sTypoDescender=0, usWinAscent=1000, usWinDescent=0)
font.setupPost()
font.setupMaxp()
font.font["head"].created = font.font["head"].modified = 3872793600
font.save(ASSETS / "MyCornerNavigation.ttf")
print("Built", ASSETS / "MyCornerNavigation.ttf")
