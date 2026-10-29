export const getScaleObjectContain = ({
  source,
  target,
}: {
  source: { width: number; height: number };
  target: { width: number; height: number };
}) => {
  const scaleX = target.width / source.width;
  const scaleY = target.height / source.height;
  const scale = Math.min(scaleX, scaleY);

  return scale;
};
