let englishVoice: SpeechSynthesisVoice | null = null;

// 高质量语音优先列表
const PREFERRED_VOICES = [
  'Samantha',    // macOS - 高质量女声
  'Alex',        // macOS - 高质量男声
  'Karen',       // macOS - 澳洲英语
  'Daniel',      // macOS - 英式男声
  'Moira',       // macOS - 爱尔兰英语
  'Tessa',       // macOS - 南非英语
  'Google UK English Female',
  'Google UK English Male',
  'Google US English',
  'Microsoft Zira',  // Windows
  'Microsoft David', // Windows
];

function getEnglishVoice(): SpeechSynthesisVoice | null {
  if (englishVoice) return englishVoice;

  const voices = window.speechSynthesis?.getVoices() || [];
  if (voices.length === 0) return null;

  // 1. 尝试找到首选的高质量语音
  for (const preferred of PREFERRED_VOICES) {
    const found = voices.find(
      (v) => v.name.includes(preferred) && v.lang.startsWith('en')
    );
    if (found) {
      englishVoice = found;
      return englishVoice;
    }
  }

  // 2. 选择 en-US 女声
  const usFemale = voices.find(
    (v) => v.lang === 'en-US' && v.name.toLowerCase().includes('female')
  );
  if (usFemale) {
    englishVoice = usFemale;
    return englishVoice;
  }

  // 3. 选择 en-US 语音
  const usVoice = voices.find((v) => v.lang === 'en-US');
  if (usVoice) {
    englishVoice = usVoice;
    return englishVoice;
  }

  // 4. 选择任何英文语音
  const anyEn = voices.find((v) => v.lang.startsWith('en'));
  if (anyEn) {
    englishVoice = anyEn;
    return englishVoice;
  }

  return null;
}

export function speak(text: string, rate = 0.85): void {
  if (!window.speechSynthesis) {
    console.warn('您的浏览器不支持语音朗读功能');
    return;
  }

  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  const voice = getEnglishVoice();

  if (voice) {
    utter.voice = voice;
    utter.lang = voice.lang;
  } else {
    utter.lang = 'en-US';
  }

  utter.rate = rate;
  utter.pitch = 1;
  utter.volume = 1;

  utter.onerror = (event) => {
    console.error('语音朗读错误:', event.error);
  };

  window.speechSynthesis.speak(utter);
}

export function speakWord(word: string): void {
  speak(word, 0.75);
}

export function speakSentence(sentence: string): void {
  speak(sentence, 0.85);
}

export function stopSpeaking(): void {
  window.speechSynthesis?.cancel();
}

// 预加载语音列表
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
    englishVoice = null;
  };
}
