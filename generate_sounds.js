const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'assets', 'sounds');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function generateWav(sampleRate, durationSec, volume, style, baseFreq) {
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = Buffer.alloc(44 + numSamples * 2);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = t / durationSec;
    let sample = 0;

    switch (style) {
      case 'siren':
        sample = Math.sin(2 * Math.PI * (baseFreq + Math.sin(2 * Math.PI * 4 * t) * 200) * t)
               + Math.sin(2 * Math.PI * (baseFreq * 1.5 + Math.sin(2 * Math.PI * 4 * t) * 150) * t) * 0.5;
        break;
      case 'pulse': {
        const pulse = Math.sin(2 * Math.PI * 6 * t) > 0 ? 1.0 : 0.15;
        sample = Math.sin(2 * Math.PI * baseFreq * t) * pulse
               + Math.sin(2 * Math.PI * baseFreq * 2 * t) * pulse * 0.4;
        break;
      }
      case 'dual':
        sample = Math.sin(2 * Math.PI * baseFreq * t)
               + Math.sin(2 * Math.PI * baseFreq * 1.25 * t) * 0.7
               + Math.sin(2 * Math.PI * baseFreq * 1.5 * t) * 0.3;
        break;
      case 'saw': {
        const saw = 2 * ((baseFreq * t) % 1) - 1;
        sample = saw * 0.6 + Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.3;
        break;
      }
    }

    const envelope = Math.min(1, Math.min(t * 10, (durationSec - t) * 10));
    const clamped = Math.max(-1, Math.min(1, sample * volume * envelope));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  return buffer;
}

const SOUNDS = [
  { id: 'default',   style: 'siren', freq: 660,  dur: 2.0, vol: 0.85 },
  { id: 'urgent',    style: 'siren', freq: 880,  dur: 2.0, vol: 0.90 },
  { id: 'emergency', style: 'saw',   freq: 600,  dur: 1.5, vol: 0.95 },
  { id: 'sharp',     style: 'dual',  freq: 1200, dur: 1.8, vol: 0.85 },
  { id: 'pulse',     style: 'pulse', freq: 440,  dur: 2.0, vol: 0.85 },
];

for (const s of SOUNDS) {
  const wav = generateWav(44100, s.dur, s.vol, s.style, s.freq);
  const outPath = path.join(OUT_DIR, s.id + '.wav');
  fs.writeFileSync(outPath, wav);
  console.log('Gerado: ' + s.id + '.wav (' + (wav.length / 1024).toFixed(1) + ' KB)');
}

console.log('Todos os sons gerados em assets/sounds/');
