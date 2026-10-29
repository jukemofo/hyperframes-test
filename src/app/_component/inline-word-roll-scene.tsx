import { InlineWordRoll } from "@/components/remocn/inline-word-roll";
import { lightLeak } from "@/components/remocn/light-leak";
import { paperTear } from "@/components/remocn/paper-tear";
import { shaderSpiralPass } from "@/components/remocn/shader-spiral-pass";
import { Video } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill, Series } from "remotion";

export const InlineWordRollScene = () => {
  return (
    <>
      <TransitionSeries>
        {/* SCENE 1: Chữ cuộn (Dài 600 frames) */}
        <TransitionSeries.Sequence durationInFrames={600}>
          <AbsoluteFill className="bg-red-400 flex items-center justify-center">
            <InlineWordRoll
              prefix="Looking for"
              text="leads | customers | subscribers | appointments | demos | quotes | registrants | trials | conversions"
              suffix="?"
              fontSize={60}
              interval={0}
              acceleration={0.9}
              transitionFrames={60}
              color="#f5f5f5"
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        {/* HIỆU ỨNG CHUYỂN CẢNH (Nằm ở giữa 2 Sequence) */}
        <TransitionSeries.Transition
          timing={linearTiming({ durationInFrames: 36 })}
          presentation={shaderSpiralPass({
            speed: 1,
            spirals: 3,
            twist: 0.7,
            zoom: 14,
            softness: 0.12,
            timeOffset: 0,
          })}
        />

        {/* SCENE 2: Video BigBuckBunny (Dài 600 frames) */}
        <TransitionSeries.Sequence durationInFrames={600}>
          {/* <AbsoluteFill>
            <Video
              trimBefore={600}
              src="https://remotion.media/BigBuckBunny.mp4"
              className="w-full h-full object-cover"
            />
          </AbsoluteFill> */}

          <AbsoluteFill className="bg-blue-400 flex items-center justify-center">
            <InlineWordRoll
              prefix="Looking for"
              text="leads | customers | subscribers | appointments | demos | quotes | registrants | trials | conversions"
              suffix="?"
              fontSize={60}
              interval={0}
              acceleration={0.9}
              transitionFrames={60}
              color="#f5f5f5"
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
