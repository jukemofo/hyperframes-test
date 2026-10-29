import { useState, useRef } from "react";
import { usePlayerActions } from "../context";

export const VolumeControl = () => {
  const { setVolume, toggleMute, getVolume, isMuted } = usePlayerActions();

  const [vol, setVol] = useState(getVolume());
  const [muted, setMuted] = useState(isMuted());
  const [isDragging, setIsDragging] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const isMutedRef = useRef(muted);
  isMutedRef.current = muted;

  const currentPercent = muted ? 0 : Math.round(vol * 100);

  // Cập nhật DOM trực tiếp 0ms delay (không qua React state)
  const applyDom = (percent: number) => {
    if (fillRef.current) {
      fillRef.current.style.width = `${percent}%`;
    }
    if (thumbRef.current) {
      thumbRef.current.style.left = `${percent}%`;
      // Công thức vàng: 0% dạt sát lề trong, 100% lùi sát lề trong, không bao giờ bị cắt nửa hình
      thumbRef.current.style.transform = `translate(-${percent}%, -50%)`;
    }
  };

  const updateVolumeFromPointer = (e: React.PointerEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    const percent = ratio * 100;

    // 1. Cập nhật DOM ngay lập tức -> Mượt như bơ 144Hz/60Hz
    applyDom(percent);

    // 2. Cập nhật âm lượng Web Audio Engine
    setVolume(ratio);

    // 3. Tự động đổi icon Mute nếu kéo sát về 0
    const isZero = ratio === 0;
    if (isMutedRef.current !== isZero) {
      setMuted(isZero);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    trackRef.current?.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateVolumeFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();
    updateVolumeFromPointer(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();
    trackRef.current?.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    // Đồng bộ lại React state sau khi đã nhả chuột
    const finalVol = getVolume();
    setVol(finalVol);
    setMuted(isMuted());
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMute();
    const nextMuted = isMuted();
    setMuted(nextMuted);

    const nextPercent = nextMuted ? 0 : Math.round(getVolume() * 100);
    applyDom(nextPercent);
  };

  return (
    <div
      className="flex items-center group/volume select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. NÚT LOA */}
      <button
        onClick={handleToggleMute}
        className="text-white hover:text-cyan-400 p-2 transition flex items-center justify-center cursor-pointer"
        aria-label="Toggle Mute"
      >
        {muted || vol === 0 ? (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        )}
      </button>

      {/* 2. KHUNG CHỨA (Có padding px-2 để nút tròn không bao giờ chạm mép overflow) */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-out flex items-center h-8 ${
          isDragging
            ? "w-20 px-2 opacity-100"
            : "w-0 px-0 group-hover/volume:w-20 group-hover/volume:px-2 opacity-0 group-hover/volume:opacity-100"
        }`}
      >
        {/* VÙNG CLICK / DRAG (Tăng chiều cao h-4 để dễ bắt ngón tay/chuột) */}
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-16 h-4 flex items-center cursor-pointer touch-none relative"
        >
          {/* THANH RAY NỀN */}
          <div className="w-full h-1 bg-white/25 rounded-full relative">
            {/* VẠCH CYAN (BỎ HẲN transition để di chuột đến đâu dính ngay đến đó) */}
            <div
              ref={fillRef}
              className="h-full bg-cyan-400 rounded-full"
              style={{ width: `${currentPercent}%` }}
            />

            {/* NÚT TRÒN (THUMB) NGUYÊN VẸN 100% */}
            <div
              ref={thumbRef}
              className="absolute top-1/2 w-2.5 h-2.5 bg-white rounded-full shadow pointer-events-none"
              style={{
                left: `${currentPercent}%`,
                transform: `translate(-${currentPercent}%, -50%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
