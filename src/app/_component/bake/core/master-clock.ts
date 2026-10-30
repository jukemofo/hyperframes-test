export class MasterClock {
  private audioCtx: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;

  private _currentTime: number = 0;
  private _timelineStartTime: number = 0;
  private _audioContextStartTime: number = 0;
  private _isPlaying: boolean = false;

  private _volume: number = 1;
  private _isMuted: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      document.removeEventListener(
        "visibilitychange",
        this.handleVisibilityChange,
      );
      document.addEventListener(
        "visibilitychange",
        this.handleVisibilityChange,
      );
    }
  }

  private handleVisibilityChange = () => {
    if (document.hidden && this.audioCtx && this.audioCtx.state === "running") {
      this.stop();
      this.audioCtx.suspend();
    }
  };

  private initAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      this.masterGainNode = this.audioCtx.createGain();
      this.masterGainNode.connect(this.audioCtx.destination);

      // 2. Set giá trị volume khởi tạo
      this.applyGain();
    }

    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  private applyGain() {
    if (!this.masterGainNode) return;
    const actualVolume = this._isMuted ? 0 : this._volume;
    this.masterGainNode.gain.value = actualVolume ** 2;
  }

  public start() {
    if (this._isPlaying) return;
    this.initAudioContext();

    this._isPlaying = true;
    this._timelineStartTime = this._currentTime;
    this._audioContextStartTime = this.audioCtx!.currentTime;
  }

  public stop() {
    if (!this._isPlaying) return;
    this._currentTime = this.getCurrentTime();
    this._isPlaying = false;
  }

  public seek(targetTime: number) {
    this._currentTime = Math.max(0, targetTime);

    if (this._isPlaying && this.audioCtx) {
      this._timelineStartTime = this._currentTime;
      this._audioContextStartTime = this.audioCtx!.currentTime;
    }
  }

  public setVolume(volume: number) {
    this._volume = Math.max(0, Math.min(1, volume));
    if (this._volume > 0) {
      this._isMuted = false;
    }

    this.initAudioContext();
    this.applyGain();
  }

  public setMuted(muted: boolean) {
    this._isMuted = muted;
    this.initAudioContext();
    this.applyGain();
  }

  public toggleMute() {
    this._isMuted = !this._isMuted;
    this.initAudioContext();
    this.applyGain();
  }

  public get volume(): number {
    return this._volume;
  }

  public get isMuted(): boolean {
    return this._isMuted;
  }

  public get masterGain(): GainNode | null {
    return this.masterGainNode;
  }

  public get audioContext(): AudioContext | null {
    return this.audioCtx;
  }

  public getCurrentTime(): number {
    if (!this._isPlaying || !this.audioCtx) {
      return this._currentTime;
    }

    const elapsed = this.audioCtx.currentTime - this._audioContextStartTime;
    return this._timelineStartTime + elapsed;
  }

  public getCurrentFrame(fps: number): number {
    return Math.floor(this.getCurrentTime() * fps);
  }

  public async destroy() {
    if (typeof window !== "undefined") {
      document.removeEventListener(
        "visibilitychange",
        this.handleVisibilityChange,
      );
    }

    this._isPlaying = false;
    this._currentTime = 0;

    if (this.masterGainNode) {
      try {
        this.masterGainNode.disconnect();
      } catch (e) {
        console.error("Error when disconnect GainNode", e);
      } finally {
        this.masterGainNode = null;
      }
    }

    if (this.audioCtx && this.audioCtx.state !== "closed") {
      try {
        await this.audioCtx.close();
      } catch (e) {
        console.error("Error when close AudioContext", e);
      } finally {
        this.audioCtx = null;
      }
    }
  }
}
