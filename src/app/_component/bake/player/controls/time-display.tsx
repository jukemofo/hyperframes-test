import { useRef } from "react";
import { useFrame } from "../hooks";
import { formatTime } from "./utils";

interface TimeDisplayProps {
  fps: number;
  durationInFrames: number;
}

export const TimeDisplay = ({ fps, durationInFrames }: TimeDisplayProps) => {
  const currentRef = useRef<HTMLSpanElement>(null);
  const hasHours = durationInFrames >= fps * 3600;
  const totalFormatted = formatTime(durationInFrames, fps, hasHours, true);

  useFrame(({ frame }) => {
    if (currentRef.current) {
      currentRef.current.innerText = formatTime(frame, fps, hasHours, true);
    }
  });

  return (
    <div className="text-white text-xs font-mono select-none px-2 flex items-center">
      <span ref={currentRef}>00:00</span>
      <span className="mx-1 text-white/50">/</span>
      <span className="text-white/70">{totalFormatted}</span>
    </div>
  );
};
