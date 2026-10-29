"use client";

import { Graphics, Text } from "pixi.js";
import { Player } from "./_component/bake/player";
import { KaraokeCaption } from "./_component/karaoke-caption";
import { VideoClip } from "./_component/bake/elements/video-clip";

function drawChicken(g: Graphics, x: number, y: number) {
  g.clear();

  const cx = 100;
  const cy = 100;
  const radius = 65;
  const width = 28;

  g.arc(cx, cy, radius, -2.35, -0.78).stroke({ color: 0xea4335, width });

  g.arc(cx, cy, radius, -0.78, 0.78).stroke({ color: 0x4285f4, width });

  g.arc(cx, cy, radius, 0.78, 2.35).stroke({ color: 0xfbbc05, width });

  g.arc(cx, cy, radius, 2.35, 3.93).stroke({ color: 0x34a853, width });

  g.rect(cx, cy - width / 2, radius + 4, width).fill(0x4285f4);

  g.x = x;
  g.y = y;
}

export default function HyperFramesStudioPreview() {
  return (
    <main className="w-full h-full flex items-center justify-center flex-col">
      <div className="w-200 aspect-video bg-black overflow-hidden flex items-center justify-center">
        <Player width={1920} height={1080} fps={60} durationInFrames={6000}>
          {/* <pixiGraphics
            draw={(graphics) => {
              drawChicken(graphics, 200, 200);
            }}
          /> */}
          <VideoClip src="https://pub-decf4c7e971344158c01d31cc955c10f.r2.dev/How%20To%20Animate%20Your%20Own%20Custom%20Characters%20in%20Premiere%20Pro!%20-%20finzar%20(1080p%2C%20h264).mp4" />
        </Player>
      </div>

      <button onClick={async () => {}}>Render</button>
    </main>
  );
}
