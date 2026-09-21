# Navigation artwork

The founder supplied `source/hire.png` (person and checkmark) and
`source/neighborhood.png` (hands around a heart) on 2026-09-21. These originals
are preserved unchanged. The artwork replaces the Hire and Community footer
glyphs, respectively; routes and screen-reader labels retain their existing names.

`MyCornerNavigation.ttf` contains vector contours traced from those images,
with the surrounding white margins removed and the internal white cutouts
left transparent. Both glyphs fit a 1000-unit square with a 40-unit margin.
The font uses the existing `@expo/vector-icons` loader, so no native dependency
or runtime image transformation is needed. Selected icons inherit white;
unselected icons inherit the navigation's secondary text color.

To regenerate only when changing the artwork, install Python packages Pillow,
numpy, matplotlib and fonttools, then run `python mobile/scripts/build-navigation-font.py`
from the repository root. The app consumes the committed TTF directly.

Glyph map: Hire U+E900; Neighborhood U+E901.
