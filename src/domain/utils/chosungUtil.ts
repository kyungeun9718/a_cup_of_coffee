export function getChosung(text: string): string {
  const CHO_SEONG = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];
  const HANGUL_BASE = 44032; // '가'의 유니코드 값
  const HANGUL_UNIT = 588; // 초성 한 칸의 유니코드 간격

  return text
    .split('')
    .map(char => {
      const code = char.charCodeAt(0);
      if (code >= HANGUL_BASE && code <= (HANGUL_BASE + 11171)) {
        return CHO_SEONG[Math.floor((code - HANGUL_BASE) / HANGUL_UNIT)];
      }
      return char;
    })
    .join('');
}
