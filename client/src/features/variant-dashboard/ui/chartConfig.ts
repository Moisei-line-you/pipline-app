import type { ApexOptions } from 'apexcharts';

export type ThemeMode = 'dark';

const PALETTES = { text: '#9ca3af', grid: '#374151'};

const baseChart: ApexOptions['chart'] = {
  background: 'transparent',
  toolbar: { show: false },
  animations: { speed: 250 },
  fontFamily: 'inherit',
};

export function makeBarOptions(
    categories: (string | number)[],
    color: string,
    theme: ThemeMode = 'dark',
    opts: { horizontal?: boolean; yFormatter?: (v: number) => string } = {}
): ApexOptions {
  return {
    chart: { ...baseChart, type: 'bar' },
    theme: { mode: "dark" },
    colors: [color],
    xaxis: {
      categories,
      labels: { style: { colors: PALETTES.text, fontSize: '11px' }, rotate: -35, trim: true },
    },
    yaxis: {
      labels: {
        style: { colors: PALETTES.text },
        formatter: opts.yFormatter ?? ((v: number) => Math.round(v).toString()),
      },
    },
    grid: { borderColor: PALETTES.grid, strokeDashArray: 3 },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%', horizontal: opts.horizontal ?? false } },
    dataLabels: { enabled: false },
    tooltip: { theme },
  };
}

export function makeScatterOptions(
    categories: (string | number)[],
    color: string,
    theme: ThemeMode = 'dark',
    yTitle?: string
): ApexOptions {
  return {
    chart: { ...baseChart, type: 'scatter', zoom: { enabled: true, type: 'xy' } },
    theme: { mode: 'dark' },
    colors: [color],
    xaxis: {
      categories,
      labels: { style: { colors: PALETTES.text }, formatter: (v: string) => Number(v).toLocaleString() },
      title: { text: 'Position', style: { color: PALETTES.text } },
    },
    yaxis: {
      labels: { style: { colors: PALETTES.text } },
      title: yTitle ? { text: yTitle, style: { color: PALETTES.text } } : undefined,
    },
    grid: { borderColor: PALETTES.grid, strokeDashArray: 3 },
    markers: { size: 5, strokeWidth: 0 },
    tooltip: { theme },
  };
}

export function makeDonutOptions(labels: string[], colors: string[], theme: ThemeMode): ApexOptions {
  return {
    chart: { ...baseChart, type: 'donut' },
    labels,
    theme: { mode: 'dark' },
    colors,
    legend: { position: 'bottom', labels: { colors: PALETTES.text }, fontSize: '12px' },
    dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(0)}%` },
    stroke: { width: 0 },
    tooltip: { theme },
    plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, color: PALETTES.text } } } } },
  };
}