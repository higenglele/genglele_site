import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const app = readFileSync('src/App.tsx', 'utf8');
for (const name of ['HERO_VIDEO', 'WORK_VIDEO']) {
  const source = app.match(new RegExp(`const ${name}\\s*=\\s*"([^"]+)"`))?.[1];
  assert.ok(source, `${name} must have a video source`);
  const url = new URL(source, 'https://genglele.com');
  assert.equal(url.origin, 'https://genglele.com', `${name} must load without the third-party video host`);
  const video = readFileSync(resolve('public', url.pathname.slice(1)));
  assert.ok(video.length < 5 * 1024 * 1024, `${name} exceeds the 5 MB background-video budget`);
  const atoms = [];
  for (let offset = 0; offset + 8 <= video.length;) {
    const size = video.readUInt32BE(offset);
    assert.ok(size >= 8 && offset + size <= video.length, 'MP4 must contain complete atoms');
    atoms.push(video.toString('ascii', offset + 4, offset + 8));
    offset += size;
  }
  assert.ok(atoms.includes('ftyp') && atoms.includes('mdat'), 'Asset must be a playable MP4 container');
  assert.ok(atoms.indexOf('moov') >= 0 && atoms.indexOf('moov') < atoms.indexOf('mdat'), 'Metadata must precede media for progressive playback');
  const poster = readFileSync(resolve('public', url.pathname.slice(1).replace(/\.mp4$/, '.jpg')));
  assert.equal(poster.readUInt16BE(0), 0xffd8, 'A local JPEG fallback must be shipped with each video');
}
console.log('Background video delivery checks passed');
