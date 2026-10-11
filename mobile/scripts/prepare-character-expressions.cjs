/* global __dirname */
// Export expression cells from imagegen atlases. No repainting, warping, or changes to approved source art.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const crypto = require('node:crypto');
const sources = [
  ['woman-kente', 'exec-2ca29437-08aa-4d8d-aa8b-0f78fe73a463.png'],
  ['older-man', 'exec-1095a14b-4b31-4b17-8fb5-f771ac251a7a.png'],
  ['woman-purple', 'exec-ddbdf558-3e28-4bc5-bff6-82607d1ca6e8.png'],
  ['young-man', 'exec-f6a52879-86d1-4320-beed-9ac9ea468c40.png'],
];
const directory = process.argv[2];
if (!directory) throw new Error('Pass the directory containing the four generated expression atlases.');
const output = path.resolve(__dirname, '../assets/my-corner-ai/characters/expressions');
(async () => {
  const manifest = [];
  for (const [id, name] of sources) {
    const source = fs.readFileSync(path.join(directory, name));
    const { width, height } = await sharp(source).metadata();
    for (const [i, expression] of ['happy', 'blink', 'speaking', 'surprised'].entries()) {
      const cell = {
        left: (i % 2) * Math.floor(width / 2),
        top: Math.floor(i / 2) * Math.floor(height / 2),
        width: Math.floor(width / 2),
        height: Math.floor(height / 2),
      };
      await sharp(await sharp(source).extract(cell).toBuffer())
        .trim({ threshold: 30 })
        .resize(192, 224, { fit: 'contain', background: '#00000000' })
        .png({ compressionLevel: 9, palette: true, colours: 192, dither: 0.4 })
        .toFile(path.join(output, `${id}-${expression}.png`));
    }
    manifest.push({
      id,
      input: name,
      sha256: crypto.createHash('sha256').update(source).digest('hex'),
      frames: ['happy', 'blink', 'speaking', 'surprised'],
      frameSize: [192, 224],
    });
  }
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
})();
