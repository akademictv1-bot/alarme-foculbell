import {
  createAudioPlayer,
  setAudioModeAsync,
} from 'expo-audio';

let alarmPlayer: ReturnType<typeof createAudioPlayer> | null = null;
let chimePlayer: ReturnType<typeof createAudioPlayer> | null = null;
let successPlayer: ReturnType<typeof createAudioPlayer> | null = null;

function getAlarmAsset(soundId: string): { uri: string } | number {
  switch (soundId) {
    case 'urgent':
      return require('../../assets/sounds/urgent.wav');
    case 'emergency':
      return require('../../assets/sounds/emergency.wav');
    case 'sharp':
      return require('../../assets/sounds/sharp.wav');
    case 'pulse':
      return require('../../assets/sounds/pulse.wav');
    case 'default':
    default:
      return require('../../assets/sounds/default.wav');
  }
}

function generateAggressiveAlarm(
  sampleRate: number,
  baseFreq: number,
  durationSec: number,
  volume: number,
  style: 'siren' | 'pulse' | 'dual' | 'saw' = 'siren',
): string {
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

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
    view.setInt16(44 + i * 2, clamped * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

function getSource(soundId: string, customUri?: string) {
  if (customUri) return customUri;
  try {
    return getAlarmAsset(soundId) as any;
  } catch {
    return getSyntheticAlarm(soundId);
  }
}

export async function startAlarmSound(soundId: string = 'urgent', customUri?: string) {
  try {
    stopAlarmSound();
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
    const source = getSource(soundId, customUri);
    alarmPlayer = createAudioPlayer(source as any);
    alarmPlayer.loop = true;
    alarmPlayer.volume = 1.0;
    alarmPlayer.play();
  } catch (e) {
    console.warn('Alarm start error:', e);
    try {
      const fallback = getSyntheticAlarm(soundId);
      alarmPlayer = createAudioPlayer(fallback as any);
      alarmPlayer.loop = true;
      alarmPlayer.volume = 1.0;
      alarmPlayer.play();
    } catch (e2) {
      console.warn('Alarm fallback error:', e2);
    }
  }
}

export function stopAlarmSound() {
  try {
    if (alarmPlayer) {
      alarmPlayer.pause();
      alarmPlayer.remove();
      alarmPlayer = null;
    }
  } catch (e) {
    console.warn('Alarm stop error:', e);
  }
}

export async function playTestSound(soundId: string, customUri?: string) {
  let player: ReturnType<typeof createAudioPlayer> | null = null;
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
    const source = getSource(soundId, customUri);
    player = createAudioPlayer(source as any);
    player.volume = 1.0;
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.duration > 0 && status.currentTime >= status.duration - 0.1) {
        player?.remove();
        player = null;
      }
    });
    player.play();
  } catch (e) {
    console.warn('Test sound error:', e);
  }
}

export async function playSuccessChime() {
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
    if (successPlayer) {
      successPlayer.seekTo(0);
      successPlayer.play();
      return;
    }
    const source = generateAggressiveAlarm(44100, 880, 0.3, 0.3, 'pulse');
    successPlayer = createAudioPlayer(source as any);
    successPlayer.volume = 1.0;
    successPlayer.addListener('playbackStatusUpdate', (status) => {
      if (status.duration > 0 && status.currentTime >= status.duration - 0.1) {
        successPlayer?.remove();
        successPlayer = null;
      }
    });
    successPlayer.play();
  } catch (e) {
    console.warn('Sound error:', e);
  }
}

export async function playAlarmChime(volume: number = 0.6) {
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
    if (chimePlayer) {
      chimePlayer.seekTo(0);
      chimePlayer.play();
      return;
    }
    const source = generateAggressiveAlarm(44100, 660, 0.6, volume, 'siren');
    chimePlayer = createAudioPlayer(source as any);
    chimePlayer.volume = 1.0;
    chimePlayer.addListener('playbackStatusUpdate', (status) => {
      if (status.duration > 0 && status.currentTime >= status.duration - 0.1) {
        chimePlayer?.remove();
        chimePlayer = null;
      }
    });
    chimePlayer.play();
  } catch (e) {
    console.warn('Sound error:', e);
  }
}

export function cleanupSounds() {
  [alarmPlayer, chimePlayer, successPlayer].forEach((p) => {
    if (p) {
      try { p.remove(); } catch {}
    }
  });
  alarmPlayer = null;
  chimePlayer = null;
  successPlayer = null;
}

function getSyntheticAlarm(soundId: string): string {
  switch (soundId) {
    case 'urgent':
      return generateAggressiveAlarm(44100, 880, 1.5, 0.85, 'siren');
    case 'emergency':
      return generateAggressiveAlarm(44100, 600, 1.0, 0.90, 'saw');
    case 'sharp':
      return generateAggressiveAlarm(44100, 1200, 1.5, 0.85, 'dual');
    case 'pulse':
      return generateAggressiveAlarm(44100, 440, 1.5, 0.85, 'pulse');
    default:
      return generateAggressiveAlarm(44100, 660, 1.5, 0.85, 'siren');
  }
}
