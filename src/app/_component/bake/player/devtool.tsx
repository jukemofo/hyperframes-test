import { useApplication } from "@pixi/react";
import { useEffect } from "react";

export const DevtoolsBridge = () => {
  const { app } = useApplication();

  useEffect(() => {
    if (app) {
      (globalThis as any).__PIXI_APP__ = app;
      (globalThis as any).__PIXI_DEVTOOLS__ = { app };
    }
  }, [app]);

  return null;
};
