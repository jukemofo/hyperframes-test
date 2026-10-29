import { ReactNode, RefObject } from "react";

export type PlayerStatus =
  | "IDLE"
  | "PLAYING"
  | "PAUSED"
  | "SCRUBBING"
  | "SEEKING"
  | "BUFFERING";

export interface FramePayload {
  frame: number;
  isHighQuality: boolean;
  isSeeking: boolean;
  fps: number;
}

export interface PlayerConfigPayload {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
}

export type FrameListener = (payload: FramePayload) => void;
export type StatusListener = (status: PlayerStatus) => void;
export type PlayerConfigListener = (payload: PlayerConfigPayload) => void;

export interface PlayerRef {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (frame: number, isHighQuality?: boolean) => void;
  startScrub: () => void;
  scrub: (frame: number) => void;
  endScrub: () => void;
  setBuffering: (isBuffering: boolean) => void;
  getCurrentFrame: () => number;
  getStatus: () => PlayerStatus;
  getAudioContext: () => AudioContext | null;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  toggleMute: () => void;
  isMuted: () => boolean;
}

export interface PlayerProps {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  children: ReactNode;
}

export interface PlayerActions {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (frame: number, isHighQuality?: boolean) => void;
  startScrub: () => void;
  scrub: (frame: number) => void;
  endScrub: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  getVolume: () => number;
  isMuted: () => boolean;
}
