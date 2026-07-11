let englishVoice: SpeechSynthesisVoice | null = null;

function getEnglishVoice(): SpeechSynthesisVoice | null {
  if (englishVoice) return englishVoice;
  const voices = window.speechSynthesis?.getVoices() || [];
  englishVoice =
    voices.find((v) => v.lang.startsWith('en') && v.name.includes('Female')) ||
    voices.find((v) => v.lang.startsWith('en-GB')) ||
    voices.find((v) => v.lang.startsWith('en-US')) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    null;
  return englishVoice;
}

export function speak(text: string, rate = 0.85): void {
  if (!window.speechSynthesis) {
    alert('您的浏览器不支持语音朗读功能，请使用 Chrome 或 Safari 浏览器。');
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voice = getEnglishVoice();
  if (voice) utter.voice = voice;
  utter.lang = 'en-US';
  utter.rate = rate;
  utter.pitch = 1;
  utter.volume = 1;
  window.speechSynthesis.speak(utter);
}

export function speakWord(word: string): void {
  speak(word, 0.8);
}

export function speakSentence(sentence: string): void {
  speak(sentence, 0.85);
}

export function stopSpeaking(): void {
  window.speechSynthesis?.cancel();
}

// Preload voices
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
    englishVoice = null; // reset to re-pick
  };
}
