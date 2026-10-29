import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Application, extend } from "@pixi/react";
import {
  Container,
  Graphics,
  HTMLText as HtmlText,
  Sprite,
  Text,
} from "pixi.js";
import { PlayerStore } from "./store";
import { PlayerActionsContext, PlayerContext } from "./context";
import { PlayerActions, PlayerProps, PlayerRef } from "./types";
import { MasterClock } from "../core/master-clock";
import { Controls } from "./controls";
import { DevtoolsBridge } from "./devtool";

extend({ Container, Graphics, Sprite, Text, HtmlText });

export const Player = forwardRef<PlayerRef, PlayerProps>(
  ({ width, height, fps, durationInFrames, children }, ref) => {
    const clockRef = useRef(new MasterClock());
    const storeRef = useRef(new PlayerStore());
    const rafIdRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const wasPlayingBeforeInterruptRef = useRef(false);

    const fpsRef = useRef(fps);
    fpsRef.current = fps;
    const durationRef = useRef(durationInFrames);
    durationRef.current = durationInFrames;

    useEffect(() => {
      storeRef.current.updateConfig({
        width: width,
        height: height,
        fps: fps,
        durationInFrames: durationInFrames,
      });
    }, [width, height, fps, durationInFrames]);

    // --- Loop Engine ---
    const stopPlaybackLoop = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    const onLoopTick = () => {
      const currentFrame = clockRef.current.getCurrentFrame(fpsRef.current);

      if (currentFrame >= durationRef.current) {
        pause();
        seek(durationRef.current, true);
        return;
      }

      storeRef.current.updateFrame(currentFrame, true, false, fpsRef.current);

      if (storeRef.current.getStatus() === "PLAYING") {
        rafIdRef.current = requestAnimationFrame(onLoopTick);
      }
    };

    const startPlaybackLoop = () => {
      stopPlaybackLoop();
      rafIdRef.current = requestAnimationFrame(onLoopTick);
    };

    // --- Core Controls ---
    const play = () => {
      if (storeRef.current.getStatus() === "PLAYING") return;

      if (storeRef.current.getFrame() >= durationRef.current) {
        seek(0, true);
      }

      storeRef.current.setStatus("PLAYING");
      clockRef.current.start();
      startPlaybackLoop();
    };

    const pause = () => {
      if (storeRef.current.getStatus() === "PAUSED") return;

      storeRef.current.setStatus("PAUSED");
      clockRef.current.stop();
      stopPlaybackLoop();
    };

    const toggle = () => {
      if (storeRef.current.getStatus() === "PLAYING") {
        pause();
      } else {
        play();
      }
    };

    const seek = (frame: number, isHighQuality = true) => {
      const clampedFrame = Math.max(0, Math.min(frame, durationRef.current));
      const targetTime = clampedFrame / fpsRef.current;

      clockRef.current.seek(targetTime);
      storeRef.current.updateFrame(
        clampedFrame,
        isHighQuality,
        true,
        fpsRef.current,
      );
    };

    // --- Scrubbing Controls ---
    const startScrub = () => {
      wasPlayingBeforeInterruptRef.current =
        storeRef.current.getStatus() === "PLAYING";

      clockRef.current.stop();
      stopPlaybackLoop();
      storeRef.current.setStatus("SCRUBBING");
    };

    const scrub = (frame: number) => {
      seek(frame, false);
    };

    const endScrub = () => {
      const currentFrame = storeRef.current.getFrame();
      seek(currentFrame, true);

      if (wasPlayingBeforeInterruptRef.current) {
        play();
      } else {
        storeRef.current.setStatus("PAUSED");
      }
    };

    // --- Buffering Handler ---
    const setBuffering = (isBuffering: boolean) => {
      if (isBuffering) {
        if (storeRef.current.getStatus() === "BUFFERING") return;
        wasPlayingBeforeInterruptRef.current =
          storeRef.current.getStatus() === "PLAYING";
        clockRef.current.stop();
        stopPlaybackLoop();
        storeRef.current.setStatus("BUFFERING");
      } else {
        if (storeRef.current.getStatus() !== "BUFFERING") return;
        if (wasPlayingBeforeInterruptRef.current) {
          play();
        } else {
          storeRef.current.setStatus("PAUSED");
        }
      }
    };

    const setVolume = (val: number) => {
      clockRef.current.setVolume(val);
    };

    const toggleMute = () => {
      clockRef.current.toggleMute();
    };

    useEffect(() => {
      return () => {
        stopPlaybackLoop();
        clockRef.current.destroy();
      };
    }, []);

    useImperativeHandle(ref, () => ({
      play,
      pause,
      toggle,
      seek,
      startScrub,
      scrub,
      endScrub,
      setBuffering,
      getCurrentFrame: () => storeRef.current.getFrame(),
      getStatus: () => storeRef.current.getStatus(),
      getAudioContext: () => clockRef.current.audioContext,
      setVolume,
      getVolume: () => clockRef.current.volume,
      toggleMute,
      isMuted: () => clockRef.current.isMuted,
      getMasterGain: () => clockRef.current.masterGain,
    }));

    const actions: PlayerActions = useMemo(
      () => ({
        play,
        pause,
        toggle,
        seek,
        startScrub,
        scrub,
        endScrub,
        containerRef,
        setVolume,
        toggleMute,
        getVolume: () => clockRef.current.volume,
        isMuted: () => clockRef.current.isMuted,
      }),
      [],
    );

    return (
      <PlayerContext.Provider value={storeRef.current}>
        <PlayerActionsContext.Provider value={actions}>
          <div
            ref={containerRef}
            style={{ aspectRatio: `${width}/${height}` }}
            className="relative w-full overflow-hidden group select-none bg-black"
          >
            <Application
              width={width}
              height={height}
              backgroundColor={"#1099bb"}
              className="block w-full h-full object-contain"
            >
              <DevtoolsBridge />
              {children}
            </Application>

            <Controls fps={fps} durationInFrames={durationInFrames} />
          </div>
        </PlayerActionsContext.Provider>
      </PlayerContext.Provider>
    );
  },
);

Player.displayName = "Player";
