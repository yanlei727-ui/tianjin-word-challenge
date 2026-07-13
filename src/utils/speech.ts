let englishVoice: SpeechSynthesisVoice | null = null;

function getEnglishVoice(): SpeechSynthesisVoice | null {
  if (englishVoice) return englishVoice;

  const voices = window.speechSynthesis?.getVoices() || [];

  // 按优先级选择英文语音
  englishVoice =
    voices.find((v) => v.lang === 'en-US' && v.name.includes('Female')) ||
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang === 'en-GB') ||
    voices.find((v) => v.lang.startsWith('en')) ||
    voices[0] ||
    null;

  return englishVoice;
}

export function speak(text: string, rate = 0.85): void {
  if (!window.speechSynthesis) {
    console.warn('您的浏览器不支持语音朗读功能');
    return;
  }

  // 取消之前的朗读
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);

  // 尝试设置英文语音
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

  // 错误处理
  utter.onerror = (event) => {
    console.error('语音朗读错误:', event.error);
  };

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

// 预加载语音列表
if (typeof window !== 'undefined' && window.speechSynthesis) {
  // 立即尝试获取语音
  window.speechSynthesis.getVoices();

  // 监听语音加载完成
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
    englishVoice = null; // 重新选择语音
  };
}
