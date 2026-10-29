export const formatTime = (
  frame: number,
  fps: number,
  forceHours: boolean = false, // Ép hiện 'hh:' nếu tổng video >= 1 tiếng
  includeFrames: boolean = false,
): string => {
  const safeFps = Math.max(1, Math.round(fps));
  const safeFrame = Math.max(0, Math.floor(frame));

  const totalSeconds = Math.floor(safeFrame / safeFps);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const remainingFrames = safeFrame % safeFps;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const ff = String(remainingFrames).padStart(2, "0");

  // Nếu bản thân frame đó >= 1 tiếng HOẶC bị ép hiện từ tổng thời lượng
  const shouldShowHours = hours > 0 || forceHours;
  const hhPrefix = shouldShowHours ? `${String(hours).padStart(2, "0")}:` : "";
  const ffSuffix = includeFrames ? `:${ff}` : "";

  return `${hhPrefix}${mm}:${ss}${ffSuffix}`;
};
