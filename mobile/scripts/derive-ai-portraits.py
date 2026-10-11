"""Derive portraits only from approved art. No generative edits; originals stay unchanged."""
import base64, io, json, os
from pathlib import Path
from PIL import Image, ImageOps
root = Path("mobile/assets/my-corner-ai/characters")
out = Path(os.environ["RUNNER_TEMP"]) / "ai-portraits"
out.mkdir(exist_ok=True)
for name in ("woman-kente", "older-man", "young-man", "woman-purple"):
    source = Image.open(root / f"character-{name}.png").convert("RGBA")
    w, h = source.size
    # Retain head/headwrap/chin and upper shoulders. Reviewed against all four source artworks.
    box = (round(w * .28), 0, round(w * .72), round(h * .33))
    portrait = ImageOps.pad(source.crop(box), (320, 320), method=Image.Resampling.LANCZOS, color=(0,0,0,0))
    path = out / f"character-{name}-portrait.png"
    portrait.save(path, optimize=True)
    print("PORTRAIT " + json.dumps({"name": name, "box": box, "sourceSize": [w,h], "data": base64.b64encode(path.read_bytes()).decode()}))
    preview = source.copy()
    preview.thumbnail((270, 360))
    buffer = io.BytesIO()
    preview.save(buffer, format="PNG")
    print("SOURCE_PREVIEW " + json.dumps({"name": name, "data": base64.b64encode(buffer.getvalue()).decode()}))
