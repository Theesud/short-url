const WIDTH = 640;
const HEIGHT = 260;
const MARGIN = { top: 20, right: 12, bottom: 34, left: 40 };

function formatLabel(isoDate) {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

export default function DailyChart({ data }) {
  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const maxCount = Math.max(0, ...data.map((item) => item.count));
  const axisMax = maxCount <= 4 ? 4 : Math.ceil(maxCount / 4) * 4;
  const ticks = [0, 1, 2, 3, 4].map((i) => (axisMax / 4) * i);

  const step = innerWidth / data.length;
  const barWidth = Math.min(34, step * 0.62);
  const labelEvery = data.length > 16 ? Math.ceil(data.length / 8) : data.length > 8 ? 2 : 1;
  const showValues = data.length <= 16;
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <svg
      className="chart-svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`กราฟจำนวนคลิกรายวัน ${data.length} วันล่าสุด รวม ${total} คลิก`}
    >
      {ticks.map((tick) => {
        const y = MARGIN.top + innerHeight - (tick / axisMax) * innerHeight;
        return (
          <g key={tick}>
            <line
              className="chart-grid"
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={y}
              y2={y}
            />
            <text
              className="chart-axis-text"
              x={MARGIN.left - 8}
              y={y + 4}
              textAnchor="end"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {data.map((item, index) => {
        const x = MARGIN.left + step * index + (step - barWidth) / 2;
        const barHeight = (item.count / axisMax) * innerHeight;
        const y = MARGIN.top + innerHeight - barHeight;
        const showLabel = (data.length - 1 - index) % labelEvery === 0;

        return (
          <g key={item.date}>
            {item.count > 0 && (
              <rect
                className="chart-bar"
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
              >
                <title>{`${formatLabel(item.date)}: ${item.count} คลิก`}</title>
              </rect>
            )}
            {item.count > 0 && showValues && (
              <text className="chart-value" x={x + barWidth / 2} y={y - 6}>
                {item.count}
              </text>
            )}
            {showLabel && (
              <text
                className="chart-axis-text"
                x={x + barWidth / 2}
                y={HEIGHT - 12}
                textAnchor="middle"
              >
                {formatLabel(item.date)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}