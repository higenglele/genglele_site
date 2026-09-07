import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server.browser';
import {BackgroundVideo} from '../src/BackgroundVideo';

const props = {src: '/videos/hero.mp4', poster: '/videos/hero.jpg'};
const pending = renderToStaticMarkup(createElement(BackgroundVideo, props));
assert.match(pending, /<img[^>]+src="\/videos\/hero.jpg"/, 'A separate fallback image is present before playback');
assert.match(pending, /<video[^>]+style="opacity:0"/, 'Unready video must not obscure its fallback image');
assert.match(pending, /muted=""/, 'Autoplay video must be muted');
assert.match(pending, /playsinline=""/, 'Playback must stay inline on mobile');
const deferred = renderToStaticMarkup(createElement(BackgroundVideo, {...props, active:false}));
assert.doesNotMatch(deferred, /<video/, 'Offscreen video must not initiate a media request');
assert.match(deferred, /<img/, 'Offscreen section retains its poster');
console.log('Background video initial and deferred rendering checks passed');
