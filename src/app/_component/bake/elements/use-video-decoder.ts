import {
  ALL_FORMATS,
  CanvasSink,
  EncodedPacketSink,
  Input,
  UrlSource,
  WrappedCanvas,
} from "mediabunny";
import { useRef, useCallback, useEffect, useState } from "react";

const QUEUE_BUFFER_SIZE = 5;

type VideoGenerator = AsyncGenerator<WrappedCanvas, void, unknown>;

export function useVideoDecoder({
  src,
  trimStartInSeconds = 0,
}: {
  src: string;
  trimStartInSeconds?: number;
}) {
  const srcRef = useRef<string>("");
  const iteratorRef = useRef<VideoGenerator | null>(null);
  const queueRef = useRef<WrappedCanvas[]>([]);
  const isRefillingRef = useRef(false);
  const canvasSinkRef = useRef<CanvasSink | null>(null);
  const packetSinkRef = useRef<EncodedPacketSink | null>(null);
  const canvasPacketRef = useRef<HTMLCanvasElement | null>(null);
  const videoDecoderRef = useRef<VideoDecoder | null>(null);
  const configDecoderRef = useRef<VideoDecoderConfig | null>(null);
  const isDoneRef = useRef<boolean>(false);

  const [isLoading, setIsLoading] = useState(true);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [durationInSeconds, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const loadSource = useCallback(
    async ({ src, trimStart }: { src: string; trimStart: number }) => {
      setIsLoading(true);
      try {
        void iteratorRef.current?.return();
        queueRef.current = [];

        if (srcRef.current !== src) {
          srcRef.current = src;
          const input = new Input({
            source: new UrlSource(src),
            formats: ALL_FORMATS,
          });

          const videoTrack = (await input.getPrimaryVideoTrack())!;
          const width = await videoTrack?.getDisplayWidth();
          const height = await videoTrack?.getDisplayHeight();
          const duration = await videoTrack.computeDuration();
          setWidth(width);
          setHeight(height);
          setDuration(duration);

          const videoCanBeTransparent = videoTrack
            ? await videoTrack.canBeTransparent()
            : false;
          const canvasSink = new CanvasSink(videoTrack, {
            poolSize: 2,
            fit: "contain",
            alpha: videoCanBeTransparent,
          });
          canvasSinkRef.current = canvasSink;
          packetSinkRef.current = new EncodedPacketSink(videoTrack);
          canvasPacketRef.current = document.createElement("canvas");
          videoDecoderRef.current?.close();
          videoDecoderRef.current = new VideoDecoder({
            output: (frame) => {
              if (!canvasPacketRef.current) return;
              canvasPacketRef.current.width = frame.displayWidth;
              canvasPacketRef.current.height = frame.displayHeight;
              const ctx = canvasPacketRef.current.getContext("2d");
              ctx!.drawImage(
                frame,
                0,
                0,
                canvasPacketRef.current.width,
                canvasPacketRef.current.height,
              );
              frame.close();
            },
            error: (e) => {
              console.error("Decoder error:", e);
            },
          });
          configDecoderRef.current = await videoTrack.getDecoderConfig();
          videoDecoderRef.current.configure(configDecoderRef.current!);
        }

        if (!canvasSinkRef.current) {
          throw new Error("CanvasSink is not generated");
        }
        iteratorRef.current = canvasSinkRef.current.canvases(trimStart);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadSource({ src, trimStart: trimStartInSeconds });
  }, [src, trimStartInSeconds, loadSource]);

  const refill = useCallback(async () => {
    if (isRefillingRef.current || !iteratorRef.current) return;
    isRefillingRef.current = true;

    try {
      while (queueRef.current.length < QUEUE_BUFFER_SIZE) {
        const result = await iteratorRef.current.next();
        if (result.done || !result.value) {
          isDoneRef.current = true;
          break;
        } else {
          isDoneRef.current = false;
        }
        queueRef.current.push(result.value);
      }
    } catch (err) {
      console.error("Lỗi khi nạp frame vào queue:", err);
    } finally {
      isRefillingRef.current = false;
    }
  }, []);

  const getFrame = useCallback(
    async (currentTime: number) => {
      if (queueRef.current.length === 0) {
        await refill();
        if (queueRef.current.length === 0) return null;
      }

      if (queueRef.current[0].timestamp > currentTime) {
        return null;
      }

      let matchedFrame = queueRef.current.shift()!;
      while (
        queueRef.current.length > 0 &&
        queueRef.current[0].timestamp <= currentTime
      ) {
        matchedFrame = queueRef.current.shift()!;
      }

      if (queueRef.current.length < QUEUE_BUFFER_SIZE) {
        refill();
      }

      return matchedFrame;
    },
    [refill],
  );

  const getFirstFrameFromQueue = useCallback(() => {
    if (queueRef.current.length === 0) return null;

    return queueRef.current[0];
  }, []);

  const seek = useCallback(
    async (targetSourceTime: number, isHighQuality?: boolean) => {
      if (isHighQuality) {
        setIsSeeking(true);
        try {
          await loadSource({ src, trimStart: targetSourceTime });
          await refill();
          const frame = getFirstFrameFromQueue();
          if (frame) {
            return frame.canvas;
          }
          return null;
        } finally {
          setIsSeeking(false);
        }
      } else {
        if (!packetSinkRef.current) {
          throw new Error("Not found packet sink");
        }
        if (!videoDecoderRef.current) {
          throw new Error("Not found video decoder");
        }
        const packet =
          await packetSinkRef.current.getKeyPacket(targetSourceTime);
        if (!packet) {
          throw new Error("Not found packet");
        }
        const chunk = packet.toEncodedVideoChunk();
        if (videoDecoderRef.current.decodeQueueSize > 2) {
          videoDecoderRef.current.reset();
          videoDecoderRef.current.configure(configDecoderRef.current!);
        }

        videoDecoderRef.current.decode(chunk);

        try {
          await videoDecoderRef.current.flush();
        } catch (err) {}

        return canvasPacketRef.current!;
      }
    },
    [],
  );

  const isBuffering = useCallback(() => {
    return !isDoneRef.current && queueRef.current.length <= 2;
  }, []);

  return {
    getFrame,
    getFirstFrameFromQueue,
    seek,
    width,
    height,
    durationInSeconds,
    isLoading,
    isSeeking,
    isBuffering,
  };
}
