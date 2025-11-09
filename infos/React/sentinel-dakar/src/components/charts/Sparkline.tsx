import * as React from "react";

type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string; // tailwind color token or raw color
  strokeWidth?: number;
  showArea?: boolean;
  className?: string;
};

export function Sparkline({
  data,
  width = 300,
  height = 80,
  stroke = "hsl(var(--primary))",
  strokeWidth = 2,
  showArea = true,
  className,
}: SparklineProps) {
  const paddingX = 4;
  const paddingY = 4;
  const innerWidth = Math.max(1, width - paddingX * 2);
  const innerHeight = Math.max(1, height - paddingY * 2);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1 || 1)) * innerWidth + paddingX;
    const y = height - paddingY - ((value - min) / range) * innerHeight;
    return [x, y] as const;
  });

  const pathD = points
    .map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`))
    .join(" ");

  const areaD = `${pathD} L ${paddingX + innerWidth},${height - paddingY} L ${paddingX},${height - paddingY} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
    >
      {showArea && (
        <path d={areaD} fill="hsl(var(--primary)/.12)" stroke="none" />
      )}
      <path d={pathD} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  );
}

export default Sparkline;






