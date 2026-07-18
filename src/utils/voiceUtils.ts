export interface VoiceSettings {
  enabled: boolean;
  voiceURI: string;
  volume: number;
  rate: number;
  pitch: number;
  language: string;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  voiceLang: string;
  recognitionLang: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'pt-BR',
    name: 'Português (Brasil)',
    nativeName: 'Português (Brasil)',
    voiceLang: 'pt-BR',
    recognitionLang: 'pt-BR',
    flag: '🇧🇷',
  },
  {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English (US)',
    voiceLang: 'en-US',
    recognitionLang: 'en-US',
    flag: '🇺🇸',
  },
  {
    code: 'es-ES',
    name: 'Español',
    nativeName: 'Español',
    voiceLang: 'es-ES',
    recognitionLang: 'es-ES',
    flag: '🇪🇸',
  },
];

export function getLanguageByCode(code: string): LanguageConfig {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
}

export function detectLanguageFromBrowser(): string {
  if (typeof window === 'undefined') return 'pt-BR';

  const browserLang = navigator.language || (navigator as any).userLanguage || 'pt-BR';

  if (browserLang.startsWith('pt')) return 'pt-BR';
  if (browserLang.startsWith('en')) return 'en-US';
  if (browserLang.startsWith('es')) return 'es-ES';

  return 'pt-BR';
}

export function detectLanguageFromGeolocation(): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve(detectLanguageFromBrowser());
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://ipapi.co/${position.coords.latitude},${position.coords.longitude}/json/`,
            { signal: AbortSignal.timeout(5000) }
          );
          if (response.ok) {
            const data = await response.json();
            const country = data.country_code || data.country;

            const langMap: Record<string, string> = {
              'BR': 'pt-BR',
              'US': 'en-US',
              'GB': 'en-US',
              'ES': 'es-ES',
              'MX': 'es-ES',
              'AR': 'es-ES',
              'CO': 'es-ES',
            };

            resolve(langMap[country] || detectLanguageFromBrowser());
          } else {
            resolve(detectLanguageFromBrowser());
          }
        } catch {
          resolve(detectLanguageFromBrowser());
        }
      },
      () => {
        resolve(detectLanguageFromBrowser());
      },
      { timeout: 5000 }
    );
  });
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
    language: detectLanguageFromBrowser(),
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

export function getVoicesByLanguage(lang: string): SpeechSynthesisVoice[] {
  const voices = getAvailableVoices();
  return voices.filter(v =>
    v.lang.startsWith(lang.split('-')[0]) ||
    v.lang === lang
  );
}

export function getMasculineVoices(lang: string): SpeechSynthesisVoice[] {
  const voices = getVoicesByLanguage(lang);

  const masculinePatterns = [
    'male', 'masculine', 'homem', ' homem', 'maschio',
    'masculin', 'pria', 'varonil', 'garoto',
  ];

  return voices.filter(v => {
    const nameLower = v.name.toLowerCase();
    const langLower = v.lang.toLowerCase();

    const isMasculine = masculinePatterns.some(p => nameLower.includes(p));
    const isDefaultOrGoogle = nameLower.includes('google') && !nameLower.includes('female');
    const isNotFemale = !nameLower.includes('female') && !nameLower.includes('femin') && !nameLower.includes('mulher');

    return (isMasculine || isDefaultOrGoogle) && isNotFemale;
  });
}

export function getBestVoiceForLanguage(lang: string): SpeechSynthesisVoice | null {
  const voices = getMasculineVoices(lang);

  if (voices.length > 0) {
    const googleVoice = voices.find(v => v.name.toLowerCase().includes('google'));
    if (googleVoice) return googleVoice;
    return voices[0];
  }

  const allVoices = getVoicesByLanguage(lang);
  if (allVoices.length > 0) {
    return allVoices[0];
  }

  return null;
}

export function speak(text: string, settings: VoiceSettings): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  if (!settings.enabled) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = settings.volume;
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;
  utterance.lang = settings.language || 'pt-BR';

  if (settings.voiceURI) {
    const voice = getAvailableVoices().find(v => v.voiceURI === settings.voiceURI);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
  } else {
    const bestVoice = getBestVoiceForLanguage(settings.language || 'pt-BR');
    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    }
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
  onError: (error: string) => void,
  lang: string = 'pt-BR'
): any {
  if (!isRecognitionSupported()) return null;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = lang;

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
