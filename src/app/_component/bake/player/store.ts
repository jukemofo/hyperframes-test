import {
  FrameListener,
  FramePayload,
  PlayerConfigListener,
  PlayerConfigPayload,
  PlayerStatus,
  StatusListener,
} from "./types";

export class PlayerStore {
  private frame = 0;
  private isHighQuality = true;
  private isSeeking = false;
  private status: PlayerStatus = "IDLE";
  private config: PlayerConfigPayload = {
    width: 1920,
    height: 1080,
    fps: 60,
    durationInFrames: 0,
  };

  private frameListeners = new Set<FrameListener>();
  private statusListeners = new Set<StatusListener>();
  private playerConfigListeners = new Set<PlayerConfigListener>();

  public getFrame = (): number => this.frame;
  public getConfig = (): PlayerConfigPayload => this.config;
  public getStatus = (): PlayerStatus => this.status;
  public getIsHighQuality = (): boolean => this.isHighQuality;

  public updateFrame = (
    newFrame: number,
    isHighQuality: boolean,
    isSeeking: boolean,
    fps: number,
  ) => {
    if (this.frame === newFrame && this.isHighQuality === isHighQuality) return;

    this.frame = newFrame;
    this.isHighQuality = isHighQuality;
    this.isSeeking = isSeeking;
    this.config.fps = fps;

    const payload: FramePayload = {
      frame: newFrame,
      isHighQuality,
      isSeeking,
      fps,
    };
    this.frameListeners.forEach((listener) => listener(payload));
  };

  public setStatus = (newStatus: PlayerStatus) => {
    if (this.status === newStatus) return;
    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(newStatus));
  };

  public updateConfig = (config: Partial<PlayerConfigPayload>) => {
    this.config = { ...this.config, ...config };
    this.playerConfigListeners.forEach((listener) => listener(this.config));
  };

  public subscribeFrame = (listener: FrameListener) => {
    this.frameListeners.add(listener);
    listener({
      frame: this.frame,
      isHighQuality: this.isHighQuality,
      isSeeking: this.isSeeking,
      fps: this.config.fps,
    });
    return () => {
      this.frameListeners.delete(listener);
    };
  };

  public subscribeStatus = (listener: StatusListener) => {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  };

  public subscribePlayerConfig = (listener: PlayerConfigListener) => {
    this.playerConfigListeners.add(listener);
    listener(this.config);
    return () => this.playerConfigListeners.delete(listener);
  };
}
