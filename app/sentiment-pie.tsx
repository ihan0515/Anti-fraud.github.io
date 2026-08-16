"use client";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

/**
 * 纯 SVG 环形占比图（无第三方依赖）。
 * 每个扇区按 value 占全部 value 之和的比例绘制，
 * 中心可展示标题 / 主数值 / 副说明。
 */
export default function DonutChart({
  slices,
  size = 230,
  thickness = 34,
  centerTop,
  centerValue,
  centerSub,
  ariaLabel = "占比环形图",
}: {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  centerTop?: string;
  centerValue: string;
  centerSub?: string;
  ariaLabel?: string;
}) {
  const total = slices.reduce((s, x) => s + Math.max(0, x.value), 0);
  const r = (size - thickness) / 2;
  const ri = Math.max(r - thickness, 2);
  const cx = size / 2;
  const cy = size / 2;
  let acc = 0;
  const arcs =
    total > 0
      ? slices
          .filter((s) => s.value > 0)
          .map((s) => {
            const a0 = (acc / total) * Math.PI * 2 - Math.PI / 2;
            acc += s.value;
            // 单个扇区接近 100% 时避免首尾重合导致的退化圆弧
            const a1 =
              acc >= total * 0.999
                ? a0 + Math.PI * 2 - 0.001
                : (acc / total) * Math.PI * 2 - Math.PI / 2;
            const large = a1 - a0 > Math.PI ? 1 : 0;
            const x0 = cx + r * Math.cos(a0);
            const y0 = cy + r * Math.sin(a0);
            const x1 = cx + r * Math.cos(a1);
            const y1 = cy + r * Math.sin(a1);
            const x0i = cx + ri * Math.cos(a0);
            const y0i = cy + ri * Math.sin(a0);
            const x1i = cx + ri * Math.cos(a1);
            const y1i = cy + ri * Math.sin(a1);
            const d = `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${x1i} ${y1i} A ${ri} ${ri} 0 ${large} 0 ${x0i} ${y0i} Z`;
            return { d, color: s.color, label: s.label, value: s.value, share: s.value / total };
          })
      : [];
  const hasCenter = Boolean(centerTop || centerSub);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={ariaLabel} className="donut-svg">
      {arcs.length ? (
        arcs.map((a, i) => (
          <path key={i} d={a.d} fill={a.color}>
            <title>{`${a.label} ${a.value.toFixed(1)}（${(a.share * 100).toFixed(1)}%）`}</title>
          </path>
        ))
      ) : (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line)" strokeWidth={thickness} strokeDasharray="3 7" />
      )}
      <g className="donut-center">
        {centerTop ? (
          <text x={cx} y={cy - (hasCenter ? 20 : 6)} className="donut-top">
            {centerTop}
          </text>
        ) : null}
        <text x={cx} y={cy + (centerTop ? 8 : 0)} className="donut-main">
          {centerValue}
        </text>
        {centerSub ? (
          <text x={cx} y={cy + 26} className="donut-sub">
            {centerSub}
          </text>
        ) : null}
      </g>
    </svg>
  );
}
