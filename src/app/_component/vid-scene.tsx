/** @jsxImportSource @revideo/2d/lib */

import { makeScene2D, Video } from "@revideo/2d";
import { opfsFile } from "./opfs";
import { createRef, waitFor } from "@revideo/core";

export default makeScene2D("vid-scene", function* (view) {
  const file = opfsFile.file!;

  const myVideo = createRef<Video>();

  console.log(file);
  const url = URL.createObjectURL(file);
  view.add(
    <>
      <Video ref={myVideo} src={url} play={true} size={["100%", "100%"]} />
    </>,
  );

  yield* waitFor(1);

  yield* waitFor(myVideo().getDuration());
});
