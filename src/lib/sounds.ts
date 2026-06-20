import rightSound from "../assets/right.mp3";
import wrongSound from "../assets/wrong.mp3";

let rightAudio: HTMLAudioElement | null = null;
let wrongAudio: HTMLAudioElement | null = null;

function getAudio(src: string, cache: "right" | "wrong"): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (cache === "right") {
    if (!rightAudio) rightAudio = new Audio(src);
    return rightAudio;
  }
  if (!wrongAudio) wrongAudio = new Audio(src);
  return wrongAudio;
}

function play(src: string, cache: "right" | "wrong") {
  const audio = getAudio(src, cache);
  if (!audio) return;
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function playCorrectSound() {
  play(rightSound, "right");
}

export function playWrongSound() {
  play(wrongSound, "wrong");
}
