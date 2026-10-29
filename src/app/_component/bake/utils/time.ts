export function toFrame(time: number, fps: number) {
  return Math.floor(time * fps);
}

export function toTime(frame: number, fps: number) {
  return frame / fps;
}
