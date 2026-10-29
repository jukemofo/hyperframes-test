import { useEffect, useRef } from "react";
import gsap from "gsap";
import { usePlayerActions } from "../context";
import { usePlayerStatus } from "../hooks";
import { PlayPauseButton } from "./play-pause-button";
import { ProgressBar } from "./progress-bar";
import { TimeDisplay } from "./time-display";
import { FullscreenButton } from "./fullscreen-button";
import { VolumeControl } from "./volume-control";

interface ControlsProps {
  fps: number;
  durationInFrames: number;
}

export const Controls = ({ fps, durationInFrames }: ControlsProps) => {
  const { toggle, containerRef } = usePlayerActions();
  const status = usePlayerStatus();

  const controlsBarRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // GSAP: Hiện thanh controls và con chuột
  const showControls = () => {
    if (containerRef.current) {
      containerRef.current.style.cursor = "default";
    }
    if (controlsBarRef.current) {
      gsap.to(controlsBarRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  // GSAP: Ẩn thanh controls và con chuột
  const hideControls = () => {
    if (status === "SCRUBBING") return;

    if (containerRef.current) {
      containerRef.current.style.cursor = "none";
    }
    if (controlsBarRef.current) {
      gsap.to(controlsBarRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.35,
        ease: "power2.in",
        overwrite: "auto",
      });
    }
  };

  const resetInactivityTimer = () => {
    showControls();
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    hideTimerRef.current = setTimeout(() => {
      hideControls();
    }, 2500);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = () => resetInactivityTimer();
    const handleMouseLeave = () => {
      if (status === "PLAYING") {
        hideControls();
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    resetInactivityTimer();

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (container) container.style.cursor = "default";
    };
  }, [containerRef, status]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end overflow-hidden">
      {/* 1. Lớp tàng hình click màn hình để Play/Pause */}
      <div
        className="absolute inset-0 pointer-events-auto cursor-pointer"
        onClick={toggle}
      />

      {/* 2. Dải gradient tối phía đáy (style cũ) được GSAP ẩn/hiện */}
      <div
        ref={controlsBarRef}
        onClick={(e) => e.stopPropagation()}
        className="pointer-events-auto bg-linear-to-t from-black/80 via-black/40 to-transparent p-3 pt-6 flex flex-col gap-1 z-10"
      >
        <ProgressBar durationInFrames={durationInFrames} />

        <div className="flex items-center gap-1">
          <PlayPauseButton />
          <VolumeControl />
          <TimeDisplay fps={fps} durationInFrames={durationInFrames} />
          <FullscreenButton />
        </div>
      </div>
    </div>
  );
};
