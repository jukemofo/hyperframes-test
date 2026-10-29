// components/VideoPlayer.tsx
"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import project from "./project";
import {
  Output,
  Mp4OutputFormat,
  BufferTarget,
  CanvasSource,
  Quality,
} from "mediabunny";
import { Player as PlayerType, Renderer } from "@revideo/core";

const Player = dynamic(
  () => import("@revideo/player-react").then((mod) => mod.Player),
  { ssr: false },
);

// 👉 HÀM TÌM CANVAS XUYÊN QUA SHADOW DOM
function getRevideoCanvas(
  container: HTMLElement | null,
): HTMLCanvasElement | null {
  if (!container) return null;

  // 1. Thử tìm thông thường (nếu là Light DOM)
  const directCanvas =
    container.querySelector("canvas") || document.querySelector("canvas");
  if (directCanvas) return directCanvas;

  // 2. Quét tất cả các thẻ con xem thẻ nào có Shadow Root
  const allElements = container.querySelectorAll("*");
  for (const el of allElements) {
    if (el.shadowRoot) {
      const shadowCanvas = el.shadowRoot.querySelector("canvas");
      if (shadowCanvas) return shadowCanvas;
    }
  }

  // 3. Quét toàn bộ trang web nếu container bọc chưa tới
  const globalElements = document.querySelectorAll("*");
  for (const el of globalElements) {
    if (el.shadowRoot) {
      const shadowCanvas = el.shadowRoot.querySelector("canvas");
      if (shadowCanvas) return shadowCanvas;
    }
  }

  return null;
}

export default function VideoPlayerWithExport() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExportMP4 = async () => {
    // 1. Tìm element Player
    const playerEl = (containerRef.current?.querySelector("revideo-player") ||
      containerRef.current?.querySelector("motion-canvas-player") ||
      document.querySelector("revideo-player") ||
      document.querySelector("motion-canvas-player")) as any;

    if (!playerEl || !playerEl.player) {
      alert("Không tìm thấy Revideo Player Controller!");
      return;
    }

    const revideoPlayer = playerEl.player as PlayerType;
    const playback = revideoPlayer.playback;
    const canvas = getRevideoCanvas(containerRef.current);

    if (!canvas) {
      alert("Không tìm thấy Canvas!");
      return;
    }

    setIsExporting(true);
    setProgress(0);

    const fps = playback.fps;
    const duration = playback.duration;

    const seekToTimeAndWait = (targetTimeInSeconds: number) => {
      return new Promise<void>((resolve) => {
        if (!revideoPlayer) return resolve();

        const fps = 60; // Đảm bảo khớp với cấu hình project của bạn
        const targetFrame = Math.round(targetTimeInSeconds * fps);

        let unsubscribe = () => {};
        // 1. Tạo một listener để bắt sự kiện khi frame thay đổi thành công
        unsubscribe = revideoPlayer.onFrameChanged.subscribe((currentFrame) => {
          unsubscribe(); // Huỷ lắng nghe để tránh rò rỉ bộ nhớ (memory leak)
          resolve();
        });

        revideoPlayer.requestSeek(targetFrame);
      });
    };

    const nextFrame = async () => {
      await revideoPlayer.playback.seek(playback.frame + 1);
      const promise = new Promise<void>((resolve) => {
        if (!revideoPlayer) return resolve();

        let unsubscribe = () => {};
        unsubscribe = revideoPlayer.onRender.subscribe(async () => {
          unsubscribe(); // Huỷ lắng nghe để tránh rò rỉ bộ nhớ (memory leak)
          resolve(); // Giải phóng Promise -> Kết thúc await
        });
      });
      revideoPlayer.requestRender();
      await promise;
    };

    try {
      // 2. TẠM DỪNG PLAYER BẰNG HÀM CHUẨN CỦA REVIDEO
      if (typeof revideoPlayer.togglePlayback === "function") {
        revideoPlayer.togglePlayback(false); // Pause
      }

      // 3. Khởi tạo Mediabunny
      const output = new Output({
        format: new Mp4OutputFormat(),
        target: new BufferTarget(),
      });

      const videoSource = new CanvasSource(canvas, {
        codec: "avc",
        bitrate: new Quality("high"),
      });

      output.addVideoTrack(videoSource);
      await output.start();

      const totalFrames = duration;

      let frame = 0;
      while (frame < totalFrames) {
        const timestamp = playback.frame / playback.fps;
        await videoSource.add(timestamp, 1 / playback.fps);
        // Cập nhật % tiến độ
        setProgress(Math.round(((frame + 1) / totalFrames) * 100));
        await nextFrame();
        frame = playback.frame;
      }

      // for (let frame = 0; frame < totalFrames; frame++) {
      //   const timestamp = frame / fps;
      //   const frameDuration = 1 / fps;

      //   const currentFrame = await nextFrame();
      //   console.log(currentFrame, frame);

      //   // if (typeof revideoPlayer.requestRender === "function") {
      //   //   revideoPlayer.requestRender();
      //   // }

      //   // await new Promise((resolve) => {
      //   //   requestAnimationFrame(() => {
      //   //     requestAnimationFrame(resolve);
      //   //   });
      //   // });
      //   // console.log(revideoPlayer.status.frame, frame);

      //   await videoSource.add(timestamp, frameDuration);

      //   // Cập nhật % tiến độ
      //   setProgress(Math.round(((frame + 1) / totalFrames) * 100));
      //   if (frame === 10) {
      //     break;
      //   }
      // }

      // 5. Kết thúc đóng gói file MP4
      await output.finalize();

      const buffer = output.target.buffer;
      const blob = new Blob([buffer], { type: "video/mp4" });
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "revideo-export.mp4";
      a.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Lỗi khi render:", err);
      alert("Có lỗi xảy ra khi xuất MP4!");
    } finally {
      setIsExporting(false);
      // Xuất xong thì trả timeline về frame đầu tiên
      revideoPlayer.requestReset?.();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Revideo + Mediabunny Export</h1>

      <div
        ref={containerRef}
        className="w-full max-w-[50%] aspect-video rounded-xl overflow-hidden shadow-2xl border border-neutral-800 bg-black mb-6"
      >
        <Player project={project} controls={false} fps={60} />
      </div>

      <div>
        <button
          onClick={async () => {
            const playerEl = (containerRef.current?.querySelector(
              "revideo-player",
            ) ||
              containerRef.current?.querySelector("motion-canvas-player") ||
              document.querySelector("revideo-player") ||
              document.querySelector("motion-canvas-player")) as any;

            if (!playerEl || !playerEl.player) {
              alert("Không tìm thấy Revideo Player Controller!");
              return;
            }

            const revideoPlayer = playerEl.player as PlayerType;
            revideoPlayer.togglePlayback(true);
          }}
        >
          Play
        </button>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleExportMP4}
          disabled={isExporting}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            isExporting
              ? "bg-neutral-700 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-black"
          }`}
        >
          {isExporting
            ? `Đang xuất MP4 (${progress}%)...`
            : "Xuất MP4 ngay trên Client"}
        </button>

        {isExporting && (
          <div className="w-64 bg-neutral-800 rounded-full h-2 overflow-hidden mt-2">
            <div
              className="bg-emerald-400 h-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
