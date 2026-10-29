import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePlayerStore } from "./context";
import { FrameListener, PlayerStatus } from "./types";

export const useFrame = (callback: FrameListener) => {
  const store = usePlayerStore();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    return store.subscribeFrame((payload) => callbackRef.current(payload));
  }, [store]);
};

export const usePlayerStatus = (): PlayerStatus => {
  const store = usePlayerStore();
  return useSyncExternalStore(
    store.subscribeStatus,
    store.getStatus,
    () => "PAUSED",
  );
};

export const usePlayerConfig = () => {
  const store = usePlayerStore();
  return useSyncExternalStore(
    store.subscribePlayerConfig,
    () => store.getConfig(),
    () => ({ width: 1920, height: 1080, fps: 60 }),
  );
};
