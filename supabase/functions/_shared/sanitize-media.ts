import jpeg from "jpeg-js";
import {
  createFile,
  DataStream,
  type Movie,
  type MP4BoxBuffer,
  type Sample,
  type Track,
} from "mp4box";

export type SanitizedMedia = {
  bytes: Uint8Array;
  width: number;
  height: number;
  seconds?: number;
};
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

function dimensions(width: number, height: number) {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    Math.max(width, height) > 1920
  ) {
    throw new Error("Use media no larger than 1920 pixels on either side.");
  }
}

export function sanitizeJpeg(input: Uint8Array): SanitizedMedia {
  if (
    input.length < 4 ||
    input.length > MAX_IMAGE_BYTES ||
    input[0] !== 0xff ||
    input[1] !== 0xd8 ||
    input[2] !== 0xff
  ) {
    throw new Error("Choose a valid photo under 6 MB.");
  }
  // Decode bounded pixel data and encode a fresh JPEG. No EXIF, ICC, comments,
  // embedded thumbnail, device identifiers or trailing bytes are copied.
  const decoded = jpeg.decode(input, {
    useTArray: true,
    maxResolutionInMP: 4,
    maxMemoryUsageInMB: 96,
    tolerantDecoding: false,
  });
  dimensions(decoded.width, decoded.height);
  const encoded = jpeg.encode(
    { width: decoded.width, height: decoded.height, data: decoded.data },
    82,
  );
  if (encoded.data.length > MAX_IMAGE_BYTES)
    throw new Error("This photo is too large. Choose a smaller photo.");
  return {
    bytes: new Uint8Array(encoded.data),
    width: decoded.width,
    height: decoded.height,
  };
}

/** Drop SEI (which can contain device/location user data) and filler NAL units. */
export function stripAvcMetadata(
  data: Uint8Array,
  lengthSize: number,
): Uint8Array {
  if (![1, 2, 4].includes(lengthSize))
    throw new Error("Unsupported video encoding.");
  const parts: Uint8Array[] = [];
  let offset = 0;
  while (offset < data.length) {
    if (offset + lengthSize >= data.length)
      throw new Error("The video is incomplete.");
    let length = 0;
    for (let i = 0; i < lengthSize; i++)
      length = length * 256 + data[offset + i];
    if (length < 1 || offset + lengthSize + length > data.length)
      throw new Error("The video is incomplete.");
    const type = data[offset + lengthSize] & 31;
    if ([1, 2, 3, 4, 5, 7, 8, 9].includes(type))
      parts.push(data.subarray(offset, offset + lengthSize + length));
    else if (type !== 6 && type !== 12)
      throw new Error("Use a standard H.264 MP4 video.");
    offset += lengthSize + length;
  }
  const clean = new Uint8Array(
    parts.reduce((size, part) => size + part.length, 0),
  );
  offset = 0;
  for (const part of parts) {
    clean.set(part, offset);
    offset += part.length;
  }
  return clean;
}

function aacDescription(track: Track) {
  // Build a canonical AAC-LC descriptor instead of copying arbitrary ES metadata.
  const audio = track.audio!;
  const frequencies = [
    96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025,
    8000, 7350,
  ];
  const frequency = frequencies.indexOf(audio.sample_rate);
  if (
    track.codec !== "mp4a.40.2" ||
    frequency < 0 ||
    audio.channel_count < 1 ||
    audio.channel_count > 2
  ) {
    throw new Error("Use an MP4 video with standard AAC audio.");
  }
  const asc = (2 << 11) | (frequency << 7) | (audio.channel_count << 3);
  const data = new Uint8Array([
    0,
    0,
    0,
    0,
    3,
    25,
    0,
    1,
    0,
    4,
    17,
    0x40,
    0x15,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    2,
    asc >> 8,
    asc & 255,
    6,
    1,
    2,
  ]);
  const serialized = new Uint8Array(data.length + 8);
  new DataView(serialized.buffer).setUint32(0, serialized.length);
  serialized.set(new TextEncoder().encode("esds"), 4);
  serialized.set(data, 8);
  const descriptorFile = createFile();
  const descriptorBuffer = serialized.buffer as MP4BoxBuffer;
  descriptorBuffer.fileStart = 0;
  descriptorFile.appendBuffer(descriptorBuffer);
  return descriptorFile.boxes[0];
}

export function sanitizeMp4(input: Uint8Array): SanitizedMedia {
  if (
    input.length < 16 ||
    input.length > MAX_VIDEO_BYTES ||
    new TextDecoder().decode(input.subarray(4, 8)) !== "ftyp"
  ) {
    throw new Error("Choose an H.264 MP4 video under 20 MB.");
  }
  const source = createFile(true);
  let metadata: Movie | undefined;
  let parseFailure = false;
  source.onError = () => {
    parseFailure = true;
  };
  source.onReady = (info) => {
    metadata = info;
  };
  const buffer = Uint8Array.from(input).buffer as MP4BoxBuffer;
  buffer.fileStart = 0;
  source.appendBuffer(buffer);
  if (
    parseFailure ||
    !metadata ||
    metadata.isFragmented ||
    metadata.videoTracks.length !== 1 ||
    metadata.audioTracks.length > 1
  ) {
    throw new Error("Use a standard MP4 video recorded by your camera.");
  }
  const info: Movie = metadata;
  const video = info.videoTracks[0];
  const width = video.video!.width;
  const height = video.video!.height;
  dimensions(width, height);
  const seconds = Math.max(
    ...info.tracks
      .filter((t) => t.video || t.audio)
      .map((t) => t.duration / t.timescale),
  );
  if (
    !Number.isFinite(seconds) ||
    seconds <= 0 ||
    seconds > 30 ||
    !video.codec.startsWith("avc1.")
  ) {
    throw new Error("Choose an H.264 MP4 video up to 30 seconds long.");
  }
  if (info.tracks.some((t) => t.nb_samples > 4000))
    throw new Error("This video is too complex. Choose a shorter clip.");
  const output = createFile();
  const trackMap = new Map<
    number,
    { id: number; lengthSize?: number; count: number; expected: number }
  >();
  for (const track of [video, ...info.audioTracks]) {
    let avcDecoderConfigRecord: ArrayBuffer | undefined;
    let lengthSize: number | undefined;
    if (track.video) {
      const entry = source.getTrackById(track.id)!.mdia.minf.stbl.stsd
        .entries[0];
      if (entry.type !== "avc1" || !("avcC" in entry) || !entry.avcC)
        throw new Error("Unsupported video encoding.");
      const config = entry.avcC as {
        SPS: { data: Uint8Array }[];
        PPS: { data: Uint8Array }[];
        ext: Uint8Array;
        write: (stream: DataStream) => void;
        lengthSizeMinusOne: number;
      };
      if (
        config.SPS.some((nal) => (nal.data[0] & 31) !== 7) ||
        config.PPS.some((nal) => (nal.data[0] & 31) !== 8)
      )
        throw new Error("Invalid video configuration.");
      // SPS/PPS describe decoding; opaque trailing extension bytes are not copied.
      config.ext = new Uint8Array();
      const stream = new DataStream();
      config.write(stream);
      avcDecoderConfigRecord = stream.buffer.slice(8);
      lengthSize = config.lengthSizeMinusOne + 1;
    }
    const id = output.addTrack({
      type: track.video ? "avc1" : "mp4a",
      hdlr: track.video ? "vide" : "soun",
      name: "My Corner media",
      language: "und",
      timescale: track.timescale,
      width,
      height,
      avcDecoderConfigRecord,
      ...(track.audio
        ? {
            samplerate: track.audio.sample_rate,
            channel_count: track.audio.channel_count,
            samplesize: track.audio.sample_size,
            description: aacDescription(track),
          }
        : {}),
    });
    if (!id) throw new Error("Unsupported video track.");
    // Preserve display rotation only. All device names, dates, location/metadata
    // tracks, user-data atoms, edit metadata and unused bytes are discarded.
    if (track.video) output.getTrackById(id)!.tkhd.matrix = track.matrix;
    trackMap.set(track.id, {
      id,
      lengthSize,
      count: 0,
      expected: track.nb_samples,
    });
    source.setExtractionOptions(track.id, null, { nbSamples: 100 });
  }
  source.onSamples = (id: number, _user: unknown, samples: Sample[]) => {
    const target = trackMap.get(id)!;
    for (const sample of samples) {
      if (
        !sample.data ||
        sample.duration <= 0 ||
        (sample.dts + sample.duration) / sample.timescale > 30.05
      )
        throw new Error("Invalid video timing.");
      const data = target.lengthSize
        ? stripAvcMetadata(sample.data, target.lengthSize)
        : sample.data;
      if (!data.length) throw new Error("Unsupported empty video frame.");
      output.addSample(target.id, Uint8Array.from(data), {
        duration: sample.duration,
        cts: sample.cts,
        dts: sample.dts,
        is_sync: sample.is_sync,
      });
      target.count++;
    }
    source.releaseUsedSamples(id, samples[samples.length - 1].number + 1);
  };
  source.start();
  source.flush();
  if (
    parseFailure ||
    [...trackMap.values()].some((t) => t.count === 0 || t.count !== t.expected)
  )
    throw new Error("The video is incomplete. Choose it again.");
  const clean = new Uint8Array(output.getBuffer().buffer);
  if (clean.length > MAX_VIDEO_BYTES)
    throw new Error("Choose a smaller video under 20 MB.");
  return { bytes: clean, width, height, seconds };
}
