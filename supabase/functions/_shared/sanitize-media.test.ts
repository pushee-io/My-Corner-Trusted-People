import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import jpeg from "jpeg-js";
import {
  sanitizeJpeg,
  sanitizeMp4,
  stripAvcMetadata,
} from "./sanitize-media.ts";

const sentinel = "PRIVATE_CAMERA_GPS_05.1234_-000.4567";
function photo(width = 8, height = 8) {
  return new Uint8Array(
    jpeg.encode(
      { width, height, data: new Uint8Array(width * height * 4).fill(255) },
      80,
    ).data,
  );
}

test("JPEG pixel re-encoding removes EXIF, camera comments and appended payload", () => {
  const source = photo();
  const comment = Buffer.from(sentinel);
  const tagged = Buffer.concat([
    source.subarray(0, 2),
    Buffer.from([255, 254, 0, comment.length + 2]),
    comment,
    source.subarray(2),
    comment,
  ]);
  const clean = sanitizeJpeg(tagged);
  assert.equal(clean.width, 8);
  assert.equal(clean.height, 8);
  assert.equal(Buffer.from(clean.bytes).includes(comment), false);
  assert.equal(jpeg.decode(clean.bytes).width, 8);
});
test("rejects spoofed photo bytes, oversized files and dimensions", () => {
  assert.throws(() =>
    sanitizeJpeg(new TextEncoder().encode("image/jpeg; actually text")),
  );
  assert.throws(() => sanitizeJpeg(new Uint8Array(6 * 1024 * 1024 + 1)));
  assert.throws(() => sanitizeJpeg(photo(1921, 2)), /1920/);
});
test("drops AVC user data and filler while preserving picture NALs; rejects malformed lengths", () => {
  const sei = Buffer.from(sentinel);
  const encoded = Buffer.concat([
    Buffer.from([0, 0, 0, sei.length + 1, 6]),
    sei,
    Buffer.from([0, 0, 0, 3, 0x65, 1, 2]),
  ]);
  assert.deepEqual(
    stripAvcMetadata(encoded, 4),
    new Uint8Array([0, 0, 0, 3, 0x65, 1, 2]),
  );
  assert.throws(() => stripAvcMetadata(new Uint8Array([0, 0, 0, 255, 6]), 4));
  assert.throws(() => stripAvcMetadata(encoded, 3));
});
test("MP4 rebuild removes location/device metadata, retains playable audio/video and rejects truncation", () => {
  const directory = mkdtempSync(join(tmpdir(), "my-corner-media-"));
  try {
    const original = join(directory, "camera.mp4"),
      cleanPath = join(directory, "clean.mp4");
    execFileSync("ffmpeg", [
      "-y",
      "-v",
      "error",
      "-f",
      "lavfi",
      "-i",
      "testsrc2=size=160x120:rate=10",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:sample_rate=44100",
      "-t",
      "2",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-metadata",
      "location=+05.1234-000.4567/",
      "-metadata",
      `comment=${sentinel}`,
      original,
    ]);
    const bytes = readFileSync(original);
    assert.ok(bytes.includes(Buffer.from(sentinel)));
    const clean = sanitizeMp4(bytes);
    writeFileSync(cleanPath, clean.bytes);
    assert.equal(clean.width, 160);
    assert.equal(clean.height, 120);
    assert.ok(clean.seconds! >= 2 && clean.seconds! < 2.1);
    assert.equal(
      Buffer.from(clean.bytes).includes(Buffer.from(sentinel)),
      false,
    );
    assert.equal(
      Buffer.from(clean.bytes).includes(Buffer.from("+05.1234")),
      false,
    );
    assert.equal(
      Buffer.from(clean.bytes).includes(Buffer.from("x264 - core")),
      false,
    );
    const probe = JSON.parse(
      execFileSync(
        "ffprobe",
        [
          "-v",
          "error",
          "-show_entries",
          "stream=codec_name,width,height",
          "-show_entries",
          "format_tags",
          "-of",
          "json",
          cleanPath,
        ],
        { encoding: "utf8" },
      ),
    );
    assert.deepEqual(
      probe.streams.map((s: { codec_name: string }) => s.codec_name),
      ["h264", "aac"],
    );
    assert.equal(probe.format.tags.location, undefined);
    execFileSync("ffmpeg", [
      "-v",
      "error",
      "-xerror",
      "-i",
      cleanPath,
      "-f",
      "null",
      "-",
    ]);
    assert.throws(() =>
      sanitizeMp4(bytes.subarray(0, Math.floor(bytes.length / 2))),
    );
    assert.throws(() => sanitizeMp4(Buffer.from("not an MP4")));
    assert.throws(() => sanitizeMp4(new Uint8Array(20 * 1024 * 1024 + 1)));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
