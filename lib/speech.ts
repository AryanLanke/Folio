// Cleanup for the browser's speech-to-text, used by "Build with AI". Results arrive in pieces
// that overlap, and Chrome on Android repeats earlier words in later ones ("Honestly.",
// "honestly I didn't", ...), so words are compared without case or punctuation when joining.

const wordKey = (word: string) => word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

const startsWithWords = (words: string[], start: string[]) => start.every((w, i) => words[i] === w);

// Adds `next` onto `prev`, dropping the words `next` repeats
function mergeWords(prev: string[], next: string[]): string[] {
  const a = prev.map(wordKey);
  const b = next.map(wordKey);
  // `next` is everything so far and more, or just a repeat of words we already have
  if (startsWithWords(b, a)) return next;
  if (startsWithWords(a, b)) return prev;
  // `next` picks up partway: skip the words where the end of `prev` and the start of `next` overlap
  for (let k = Math.min(a.length, b.length) - 1; k > 0; k--) {
    if (startsWithWords(b, a.slice(a.length - k))) return [...prev, ...next.slice(k)];
  }
  return [...prev, ...next];
}

// Joins a listening session's results into one transcript
export function joinResults(results: ArrayLike<ArrayLike<{ transcript: string }>>): string {
  let words: string[] = [];
  for (let i = 0; i < results.length; i++) {
    words = mergeWords(words, results[i][0].transcript.split(/\s+/).filter(Boolean));
  }
  return words.join(" ");
}

// Puts a session's words after text that was typed or spoken earlier
export const joinSpoken = (before: string, spoken: string) => {
  const words = spoken.trim();
  if (!words) return before;
  return before ? `${before.trimEnd()} ${words}` : words;
};
