// RBUBANK — Dynamic SVG Cashflow & Inflow Visualizer
// Renders high-precision 12-month inflow/outflow charts with tooltips

export function renderCashflowChart(containerId, monthlyData, activePeriod = "1Y") {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Filter data based on period
  let data = monthlyData;
  if (activePeriod === "1M") data = monthlyData.slice(-1);
  else if (activePeriod === "3M") data = monthlyData.slice(-3);
  else if (activePeriod === "6M") data = monthlyData.slice(-6);
  else data = monthlyData.slice(-12);

  const width = 360;
  const height = 130;
  const paddingBottom = 24;
  const paddingTop = 12;
  const chartHeight = height - paddingBottom - paddingTop;
  
  const maxVal = Math.max(...data.map(d => Math.max(d.inflow, d.outflow))) * 1.15 || 9000;
  const colWidth = width / data.length;
  const barWidth = Math.max(8, Math.min(18, colWidth * 0.35));

  let barsHtml = "";
  let labelsHtml = "";

  data.forEach((d, i) => {
    const x = i * colWidth + colWidth / 2;
    const inflowH = (d.inflow / maxVal) * chartHeight;
    const outflowH = (d.outflow / maxVal) * chartHeight;

    const inflowY = height - paddingBottom - inflowH;
    const outflowY = height - paddingBottom - outflowH;

    // Inflow bar (emerald neon)
    barsHtml += `
      <g class="chart-col" data-index="${i}" style="cursor: pointer;">
        <!-- Inflow Bar -->
        <rect 
          x="${x - barWidth - 1}" 
          y="${inflowY}" 
          width="${barWidth}" 
          height="${inflowH}" 
          rx="4" 
          fill="url(#inflowGrad)" 
          opacity="0.9"
        >
          <title>${d.month}: Inflow +$${d.inflow.toLocaleString()}</title>
        </rect>
        
        <!-- Outflow Bar -->
        <rect 
          x="${x + 1}" 
          y="${outflowY}" 
          width="${barWidth}" 
          height="${outflowH}" 
          rx="4" 
          fill="url(#outflowGrad)" 
          opacity="0.65"
        >
          <title>${d.month}: Outflow -$${d.outflow.toLocaleString()}</title>
        </rect>

        <!-- Touch/Click target -->
        <rect x="${x - colWidth/2}" y="0" width="${colWidth}" height="${height}" fill="transparent" />
      </g>
    `;

    // Month label
    labelsHtml += `
      <text 
        x="${x}" 
        y="${height - 6}" 
        fill="rgba(240, 243, 250, 0.4)" 
        font-size="9.5" 
        font-weight="600" 
        text-anchor="middle"
      >
        ${d.month.split(' ')[0]}
      </text>
    `;
  });

  const svg = `
    <svg viewBox="0 0 ${width} ${height}" class="svg-chart" style="width: 100%; height: 100%; overflow: visible;">
      <defs>
        <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00e676" />
          <stop offset="100%" stop-color="#00b0ff" stop-opacity="0.6" />
        </linearGradient>
        <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff3366" />
          <stop offset="100%" stop-color="#ff3366" stop-opacity="0.2" />
        </linearGradient>
      </defs>

      <!-- Horizontal gridlines -->
      <line x1="0" y1="${height - paddingBottom}" x2="${width}" y2="${height - paddingBottom}" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />
      <line x1="0" y1="${height - paddingBottom - chartHeight * 0.5}" x2="${width}" y2="${height - paddingBottom - chartHeight * 0.5}" stroke="rgba(255, 255, 255, 0.04)" stroke-dasharray="3,3" stroke-width="1" />

      ${barsHtml}
      ${labelsHtml}
    </svg>
  `;

  container.innerHTML = svg;

  // Add click listeners to bars for quick tooltip/highlight
  const cols = container.querySelectorAll('.chart-col');
  cols.forEach(col => {
    col.addEventListener('click', () => {
      const idx = parseInt(col.getAttribute('data-index'), 10);
      const item = data[idx];
      if (item && window.showToast) {
        window.showToast(`${item.label}: Inflow +$${item.inflow.toLocaleString()} | Outflow -$${item.outflow.toLocaleString()}`);
      }
    });
  });
}
