// project.ts
import { makeProject } from "@revideo/core";
import vidScene from "./vid-scene";

export default makeProject({
  scenes: [vidScene],
  settings: {
    shared: {
      size: { x: 1920, y: 1080 },
    },
    preview: {
      fps: 60,
    },
    rendering: {
      exporter: {
        name: "@revideo/core/ffmpeg",
        options: {
          format: "mp4",
        },
      },
    },
  },
});
