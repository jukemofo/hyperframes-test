import { Assets, Sprite, Texture } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { useApplication, useTick } from "@pixi/react";
import gsap from "gsap";

export function BunnySprite() {
  // The Pixi.js `Sprite`
  const spriteRef = useRef<Sprite>(null);

  const [texture, setTexture] = useState(Texture.EMPTY);

  // Preload the sprite if it hasn't been loaded yet
  useEffect(() => {
    if (texture === Texture.EMPTY) {
      Assets.load(
        "https://images.pexels.com/photos/39801685/pexels-photo-39801685.jpeg",
      ).then((result) => {
        setTexture(result);
        const scaleX = 1920 / result.width;
        const scaleY = 1080 / result.height;
        const scale = Math.min(scaleX, scaleY);
        console.log(scale);
        spriteRef.current!.scale.set(scale);
      });
    }
  }, [texture]);

  return (
    <pixiSprite
      ref={spriteRef}
      scale={0.4}
      anchor={0.5}
      eventMode={"none"}
      texture={texture}
      x={1920 / 2}
      y={1080 / 2}
    />
  );
}
