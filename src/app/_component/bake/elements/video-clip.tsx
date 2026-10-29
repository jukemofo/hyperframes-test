import { useApplication } from "@pixi/react";
import { CanvasSource, Sprite, Texture } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { useFrame, usePlayerConfig } from "../player/hooks";
import { getScaleObjectContain } from "../utils/resolution";
import { useVideoDecoder } from "./hook";

export const VideoClip = ({
  src,
  from = 0,
  trimStart = 0,
}: {
  src: string;
  from?: number;
  trimStart?: number;
  trimEnd?: number;
}) => {
  const spriteRef = useRef<Sprite>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [texture, setTexture] = useState<Texture>(Texture.EMPTY);
  const { app, isInitialised } = useApplication();

  const { getFrame, width, height, isLoading } = useVideoDecoder({ src });

  const config = usePlayerConfig();

  console.log(config);

  useEffect(() => {
    if (texture === Texture.EMPTY && isInitialised && !isLoading) {
      const load = async () => {
        const value = await getFrame(trimStart);
        const appWidth = app.screen.width;
        const appHeight = app.screen.height;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvasRef.current = canvas;

        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        if (value) {
          ctx!.drawImage(value.canvas, 0, 0, canvas.width, canvas.height);
        }

        const canvasSource = new CanvasSource({ resource: canvas });
        const texture = new Texture({ source: canvasSource });
        setTexture(texture);
        const scale = getScaleObjectContain({
          source: { width: canvas.width, height: canvas.height },
          target: { width: appWidth, height: appHeight },
        });
        spriteRef.current!.scale.set(scale);
        spriteRef.current?.position.set(appWidth / 2, appHeight / 2);

        texture.source.update();
        console.log("Đã vẽ ảnh chú chó lên canvas và cập nhật PixiJS!");
      };

      load();
    }
  }, [texture, isInitialised, isLoading, trimStart]);

  useFrame(async (frame) => {
    if (frame.frame)
      if (frame.isSeeking) {
        // TODO: handle seek here
        return;
      }

    const currentTime = frame.frame / frame.fps;
    const elapsed = currentTime - from;
    const currentSourceTime = elapsed + trimStart;
    const value = await getFrame(currentSourceTime);

    if (!value) {
      return;
    }
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx!.drawImage(value.canvas, 0, 0, canvas.width, canvas.height);

    texture.source.update();
  });

  return <pixiSprite ref={spriteRef} texture={texture} anchor={0.5} />;
};
