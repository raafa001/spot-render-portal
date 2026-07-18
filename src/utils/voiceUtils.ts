export interface VoiceSettings {
  enabled: boolean;
  voiceURI: string;
  volume: number;
  rate: number;
  pitch: number;
}

const VOICE_SETTINGS_KEY = 'spotinho_voice_settings';

export function saveVoiceSettings(settings: VoiceSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save voice settings:', e);
  }
}

export function loadVoiceSettings(): VoiceSettings {
  const defaults: VoiceSettings = {
    enabled: false,
    voiceURI: '',
    volume: 1,
    rate: 1,
    pitch: 1,
  };

  if (typeof window === 'undefined') return defaults;

  try {
    const stored = localStorage.getItem(VOICE_SETTINGS_KEY);
    if (stored) {
      return { ...defaults, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load voice settings:', e);
  }
  return defaults;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

export function getPortugueseVoices(): SpeechSynthesisVoice[] {
  const voices = getAvailableVoices();
  return voices.filter(v =>
    v.lang.startsWith('pt') ||
    v.name.toLowerCase().includes('portuguese') ||
    v.name.toLowerCase().includes('brasil')
  );
}

export function speak(text: string, settings: VoiceSettings): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  if (!settings.enabled) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = settings.volume;
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;

  if (settings.voiceURI) {
    const voice = getAvailableVoices().find(v => v.voiceURI === settings.voiceURI);
    if (voice) utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isRecognitionSupported(): boolean {
  return typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
}

export interface MediaStreamState {
  audioEnabled: boolean;
  videoEnabled: boolean;
  audioTrack: MediaStreamTrack | null;
  videoTrack: MediaStreamTrack | null;
}

export async function requestMicrophone(): Promise<MediaStreamTrack | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const track = stream.getAudioTracks()[0];
    return track || null;
  } catch (e) {
    console.error('Microphone access denied:', e);
    return null;
  }
}

export async function requestCamera(): Promise<MediaStreamTrack | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const track = stream.getVideoTracks()[0];
    return track || null;
  } catch (e) {
    console.error('Camera access denied:', e);
    return null;
  }
}

export async function requestScreenShare(): Promise<MediaStreamTrack | null> {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const track = stream.getVideoTracks()[0];
    return track || null;
  } catch (e) {
    console.error('Screen share denied:', e);
    return null;
  }
}

export function stopTrack(track: MediaStreamTrack | null): void {
  if (track) {
    track.stop();
  }
}

export function createSpeechRecognition(
  onResult: (transcript: string) => void,
  onError: (error: string) => void
): any {
  if (!isRecognitionSupported()) return null;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'pt-BR';

  recognition.onresult = (event: any) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    onError(event.error);
  };

  return recognition;
}
