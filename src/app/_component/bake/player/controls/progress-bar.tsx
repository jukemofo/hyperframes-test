import { useRef } from "react";
import { usePlayerActions } from "../context";
import { useFrame } from "../hooks";

interface ProgressBarProps {
  durationInFrames: number;
}

export const ProgressBar = ({ durationInFrames }: ProgressBarProps) => {
  const { startScrub, scrub, endScrub } = usePlayerActions();
  const progressRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Cập nhật DOM trực tiếp mỗi frame (0% React Re-render)
  useFrame(({ frame }) => {
    if (!progressRef.current) return;
    const percent = Math.min(
      100,
      Math.max(0, (frame / durationInFrames) * 100),
    );
    progressRef.current.style.width = `${percent}%`;
  });

  const calculateFrameFromPointer = (e: React.PointerEvent | PointerEvent) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    return Math.round(ratio * durationInFrames);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    trackRef.current?.setPointerCapture(e.pointerId);
    startScrub();
    scrub(calculateFrameFromPointer(e));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1) return; // Chỉ tính khi đang nhấn chuột trái
    scrub(calculateFrameFromPointer(e));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    trackRef.current?.releasePointerCapture(e.pointerId);
    endScrub();
  };

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-full h-3 flex items-center cursor-pointer group/bar py-1 touch-none"
    >
      {/* Background Track */}
      <div className="w-full h-1 bg-white/30 rounded-full group-hover/bar:h-2 transition-all">
        {/* Progress Filled Bar */}
        <div
          ref={progressRef}
          className="h-full bg-cyan-400 rounded-full relative"
          style={{ width: "0%" }}
        >
          {/* Scrubber Thumb */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover/bar:scale-100 transition-transform shadow " />
        </div>
      </div>
    </div>
  );
};
