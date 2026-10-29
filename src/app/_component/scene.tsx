/** @jsxImportSource @revideo/2d/lib */
import { makeScene2D, Path, Node, Txt } from "@revideo/2d";
import {
  createRef,
  createSignal,
  easeInOutCubic,
  waitFor,
  useTime,
  map,
  tween,
  usePlayback,
} from "@revideo/core";

export default makeScene2D("car_scene", function* (view) {
  view.fill("#18181b");

  const path = createRef<Path>();
  const textRef = createRef<Txt>();
  const progress = createSignal(0);

  // Đường cong
  const roadData = "M -500 200 C -250 -300, 250 300, 500 -200";

  // 👉 BÍ QUYẾT MƯỢT MÀ: Tính toán điểm 1 lần duy nhất mỗi frame
  const currentPoint = createSignal(() =>
    path()
      ? path().getPointAtPercentage(progress())
      : { position: { x: 0, y: 0 }, tangent: { degrees: 0 } },
  );

  view.add(
    <>
      <Path
        ref={path}
        data={roadData}
        stroke={"#3f3f46"}
        lineWidth={2}
        lineDash={[15, 10]}
      />

      {/* Node xe chỉ đọc giá trị đã tính sẵn từ currentPoint */}
      <Node
        position={() => currentPoint().position}
        rotation={() => currentPoint().tangent.degrees}
      >
        <Txt text={"🏎️"} fontSize={80} offset={[0.2, 0.5]} />
      </Node>
    </>,
  );

  // yield* tween(2, (value) => {
  //   textRef().position.x(map(-300, 300, easeInOutCubic(value)));
  // });
  //

  yield* progress(1, 2);
  yield* waitFor(4);
});
