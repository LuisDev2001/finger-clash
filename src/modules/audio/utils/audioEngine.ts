export type SoundEffect =
  | 'click'
  | 'select'
  | 'hit'
  | 'knockout'
  | 'split'
  | 'tick'
  | 'timeout'
  | 'win'
  | 'lose'
  | 'draw'
  | 'start'

interface ToneOptions {
  type?: OscillatorType
  frequency: number
  endFrequency?: number
  start?: number
  duration: number
  volume?: number
  destination: AudioNode
}

const BPM = 116
const STEP_SECONDS = 60 / BPM / 2
const SCHEDULE_AHEAD_SECONDS = 0.15
const SCHEDULER_INTERVAL_MS = 25
const MUSIC_LEVEL = 0.35
const SFX_LEVEL = 0.8

const CHORD_ROOTS = [48, 45, 41, 43, 41, 43, 48, 43]
const BASS_PATTERN = [0, 12, 7, 12, 0, 12, 7, 12]
// prettier-ignore
const MELODY: (number | null)[] = [
  72, null, 76, 79, 76, null, 72, 74,
  76, null, 72, 69, 72, null, 76, 77,
  77, null, 81, 77, 76, null, 72, 74,
  74, 76, 79, null, 77, 76, 74, null,
  69, 72, 77, null, 76, 77, 79, null,
  79, null, 77, 76, 74, null, 71, 74,
  72, 76, 79, 84, 79, 76, 72, null,
  74, null, 71, null, 74, 76, 79, null,
]
const HIT_NOTES = [523.25, 587.33, 659.25, 783.99, 880]

let context: AudioContext | null = null
let musicGain: GainNode | null = null
let sfxGain: GainNode | null = null
let noiseBuffer: AudioBuffer | null = null
let musicVolume = 0.4
let sfxVolume = 0.7
let isMuted = false
let wantsMusic = false
let musicTimer: ReturnType<typeof setInterval> | undefined
let nextStepTime = 0
let step = 0

function midiToFrequency(note: number): number {
  return 440 * 2 ** ((note - 69) / 12)
}

export function unlockAudio() {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return
  if (!context) {
    context = new AudioContext()
    musicGain = context.createGain()
    sfxGain = context.createGain()
    musicGain.connect(context.destination)
    sfxGain.connect(context.destination)
    noiseBuffer = createNoiseBuffer(context)
    applyVolumes()
  }
  if (context.state === 'suspended') void context.resume()
  if (wantsMusic && !musicTimer) beginMusic()
}

export function setAudioLevels(levels: { music: number; sfx: number; isMuted: boolean }) {
  musicVolume = levels.music / 100
  sfxVolume = levels.sfx / 100
  isMuted = levels.isMuted
  applyVolumes()
}

export function startMusic() {
  wantsMusic = true
  if (context && !musicTimer) beginMusic()
}

export function stopMusic() {
  wantsMusic = false
  clearInterval(musicTimer)
  musicTimer = undefined
}

export function playSfx(effect: SoundEffect, options: { delay?: number; level?: number } = {}) {
  if (!context || !sfxGain || isMuted || sfxVolume === 0) return
  const start = context.currentTime + (options.delay ?? 0)
  const destination = sfxGain

  switch (effect) {
    case 'click':
      tone({
        type: 'square',
        frequency: 660,
        endFrequency: 880,
        start,
        duration: 0.06,
        volume: 0.25,
        destination,
      })
      break
    case 'select':
      tone({
        type: 'triangle',
        frequency: 520,
        endFrequency: 780,
        start,
        duration: 0.09,
        volume: 0.5,
        destination,
      })
      break
    case 'hit': {
      const note = HIT_NOTES[Math.min(HIT_NOTES.length - 1, Math.max(0, options.level ?? 0))]!
      tone({
        type: 'sine',
        frequency: note / 2,
        endFrequency: note,
        start,
        duration: 0.12,
        volume: 0.7,
        destination,
      })
      tone({
        type: 'triangle',
        frequency: note,
        start: start + 0.05,
        duration: 0.18,
        volume: 0.35,
        destination,
      })
      noise({ start, duration: 0.05, volume: 0.25, destination })
      break
    }
    case 'knockout':
      tone({
        type: 'sawtooth',
        frequency: 420,
        endFrequency: 70,
        start,
        duration: 0.45,
        volume: 0.35,
        destination,
      })
      noise({ start, duration: 0.25, volume: 0.35, destination })
      break
    case 'split':
      tone({ type: 'triangle', frequency: 523.25, start, duration: 0.1, volume: 0.45, destination })
      tone({
        type: 'triangle',
        frequency: 783.99,
        start: start + 0.1,
        duration: 0.14,
        volume: 0.45,
        destination,
      })
      break
    case 'tick':
      tone({ type: 'square', frequency: 1200, start, duration: 0.035, volume: 0.18, destination })
      break
    case 'timeout':
      tone({ type: 'square', frequency: 200, start, duration: 0.14, volume: 0.3, destination })
      tone({
        type: 'square',
        frequency: 150,
        start: start + 0.18,
        duration: 0.24,
        volume: 0.3,
        destination,
      })
      break
    case 'start':
      ;[60, 64, 67, 72].forEach((note, index) =>
        tone({
          type: 'square',
          frequency: midiToFrequency(note),
          start: start + index * 0.07,
          duration: 0.1,
          volume: 0.22,
          destination,
        }),
      )
      break
    case 'win':
      ;[72, 76, 79, 84, 79, 84].forEach((note, index) =>
        tone({
          type: 'triangle',
          frequency: midiToFrequency(note),
          start: start + index * 0.11,
          duration: index === 5 ? 0.5 : 0.12,
          volume: 0.5,
          destination,
        }),
      )
      break
    case 'draw':
      ;[64, 67, 64].forEach((note, index) =>
        tone({
          type: 'triangle',
          frequency: midiToFrequency(note),
          start: start + index * 0.16,
          duration: index === 2 ? 0.4 : 0.14,
          volume: 0.4,
          destination,
        }),
      )
      break
    case 'lose':
      ;[67, 64, 60, 55].forEach((note, index) =>
        tone({
          type: 'triangle',
          frequency: midiToFrequency(note),
          start: start + index * 0.18,
          duration: index === 3 ? 0.6 : 0.18,
          volume: 0.45,
          destination,
        }),
      )
      break
  }
}

function applyVolumes() {
  if (!context || !musicGain || !sfxGain) return
  const now = context.currentTime
  musicGain.gain.setTargetAtTime(isMuted ? 0 : musicVolume * MUSIC_LEVEL, now, 0.05)
  sfxGain.gain.setTargetAtTime(isMuted ? 0 : sfxVolume * SFX_LEVEL, now, 0.02)
}

function beginMusic() {
  if (!context) return
  nextStepTime = context.currentTime + 0.1
  step = 0
  musicTimer = setInterval(scheduleMusic, SCHEDULER_INTERVAL_MS)
}

function scheduleMusic() {
  if (!context || !musicGain) return
  while (nextStepTime < context.currentTime + SCHEDULE_AHEAD_SECONDS) {
    scheduleStep(step, nextStepTime, musicGain)
    nextStepTime += STEP_SECONDS
    step = (step + 1) % MELODY.length
  }
}

function scheduleStep(index: number, time: number, destination: AudioNode) {
  const bar = Math.floor(index / 8)
  const beat = index % 8
  const root = CHORD_ROOTS[bar]!

  tone({
    type: 'triangle',
    frequency: midiToFrequency(root + BASS_PATTERN[beat]!),
    start: time,
    duration: STEP_SECONDS * 0.9,
    volume: 0.55,
    destination,
  })

  const note = MELODY[index]
  if (note) {
    tone({
      type: 'square',
      frequency: midiToFrequency(note),
      start: time,
      duration: STEP_SECONDS * 0.85,
      volume: 0.16,
      destination,
    })
  }

  if (beat % 4 === 0) {
    tone({
      type: 'sine',
      frequency: 150,
      endFrequency: 45,
      start: time,
      duration: 0.12,
      volume: 0.6,
      destination,
    })
  }
  noise({
    start: time,
    duration: beat % 2 === 1 ? 0.05 : 0.02,
    volume: beat % 2 === 1 ? 0.12 : 0.06,
    destination,
  })
}

function tone({
  type = 'sine',
  frequency,
  endFrequency,
  start = 0,
  duration,
  volume = 0.5,
  destination,
}: ToneOptions) {
  if (!context) return
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, start)
  if (endFrequency)
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration)

  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  oscillator.connect(gain).connect(destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

function noise({
  start,
  duration,
  volume,
  destination,
}: {
  start: number
  duration: number
  volume: number
  destination: AudioNode
}) {
  if (!context || !noiseBuffer) return
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  source.buffer = noiseBuffer
  filter.type = 'highpass'
  filter.frequency.value = 6000
  gain.gain.setValueAtTime(volume, start)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  source.connect(filter).connect(gain).connect(destination)
  source.start(start)
  source.stop(start + duration + 0.02)
}

function createNoiseBuffer(audioContext: AudioContext): AudioBuffer {
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < data.length; index++) data[index] = Math.random() * 2 - 1
  return buffer
}
