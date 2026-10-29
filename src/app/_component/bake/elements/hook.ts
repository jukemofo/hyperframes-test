import {
  ALL_FORMATS,
  CanvasSink,
  Input,
  UrlSource,
  WrappedCanvas,
} from "mediabunny";
import { useRef, useCallback, useEffect, useState } from "react";

const QUEUE_BUFFER_SIZE = 5;

type VideoGenerator = AsyncGenerator<WrappedCanvas, void, unknown>;

export function useVideoDecoder({
  src,
  trimStart = 0,
}: {
  src: string;
  trimStart?: number;
}) {
  const srcRef = useRef<string>("");
  const iteratorRef = useRef<VideoGenerator | null>(null);
  const queueRef = useRef<WrappedCanvas[]>([]);
  const isRefillingRef = useRef(false);
  const canvasSinkRef = useRef<CanvasSink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

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
          setWidth(width);
          setHeight(height);

          const videoCanBeTransparent = videoTrack
            ? await videoTrack.canBeTransparent()
            : false;
          const canvasSink = new CanvasSink(videoTrack, {
            poolSize: 2,
            fit: "contain",
            alpha: videoCanBeTransparent,
          });
          canvasSinkRef.current = canvasSink;
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
    loadSource({ src, trimStart });
  }, [src, trimStart, loadSource]);

  // 1. Hàm nạp frame vào queue (chạy background)
  const refill = useCallback(async () => {
    if (isRefillingRef.current || !iteratorRef.current) return;
    isRefillingRef.current = true;

    try {
      while (queueRef.current.length < QUEUE_BUFFER_SIZE) {
        const result = await iteratorRef.current.next();
        if (result.done || !result.value) break;
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
      // Nếu queue đang rỗng (lúc mới khởi động), nạp đợt đầu tiên
      if (queueRef.current.length === 0) {
        await refill();
        if (queueRef.current.length === 0) return null;
      }

      // ĐIỀU KIỆN 1: Chưa đến lúc đổi frame
      // Timestamp frame đầu queue vẫn lớn hơn thời gian hiện tại => đứng yên
      if (queueRef.current[0].timestamp > currentTime) {
        return null;
      }

      // ĐIỀU KIỆN 2: Đã đến thời điểm hiển thị
      // Xử lý cả tình huống lag/tụt FPS: bỏ qua các frame cũ nếu timeline nhảy vọt
      let matchedFrame = queueRef.current.shift()!;
      while (
        queueRef.current.length > 0 &&
        queueRef.current[0].timestamp <= currentTime
      ) {
        matchedFrame = queueRef.current.shift()!;
      }

      // Kích hoạt refill ngầm để bù đắp các frame vừa lấy ra (không await để tránh block frame render)
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

  return { getFrame, getFirstFrameFromQueue, width, height, isLoading };
}
