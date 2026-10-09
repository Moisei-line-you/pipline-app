import type { ApexOptions } from 'apexcharts';
export const makeBarOptions = (
    categories: string[],
    color: string,
    extra?: { yFormatter?: (v: number) => string }
): ApexOptions => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    parentHeightOffset: 0,
  },
  colors: [color],
  grid: {
    padding: { top: 10, right: 15, bottom: 10, left: 15 },
  },
  xaxis: {
    categories,
    labels: {
      rotate: -45,
      rotateAlways: false,
      hideOverlappingLabels: true,
      style: { fontSize: '11px' },
    },
  },
  yaxis: {
    labels: {
      formatter: extra?.yFormatter,
      style: { fontSize: '11px' },
    },
  },
  plotOptions: {
    bar: {
      columnWidth: '50%',
      borderRadius: 4,
    },
  },
});

export const makeScatterOptions = (
    color: string,
    yTitle: string
): ApexOptions => ({
  chart: {
    type: 'scatter',
    toolbar: { show: false },
    parentHeightOffset: 0,
    zoom: { enabled: true },
  },
  colors: [color],
  grid: {
    padding: { top: 10, right: 15, bottom: 10, left: 15 },
  },
  xaxis: {
    type: 'numeric',
    tickAmount: 6,
    labels: {
      formatter: (val: number) => (val ? Math.round(val).toLocaleString() : ''),
      style: { fontSize: '11px' },
    },
    title: {
      text: 'Position',
      style: { color: '#9ca3af', fontSize: '12px' },
    },
  },
  yaxis: {
    title: {
      text: yTitle,
      style: { color: '#9ca3af', fontSize: '12px' },
    },
    labels: {
      style: { fontSize: '11px' },
    },
  },
  markers: {
    size: 4,
  },
});

export const makeDonutOptions = (
    labels: string[],
    colors: string[],
): ApexOptions => ({
  chart: {
    type: 'donut',
  },
  labels,
  colors,
  legend: {
    position: 'bottom',
    fontSize: '12px',
    itemMargin: { horizontal: 8, vertical: 4 },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
      },
    },
  },
});

export const makeAreaOptions = (
    color: string,
): ApexOptions => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    parentHeightOffset: 0,
    zoom: { enabled: true },
  },
  dataLabels: {
    enabled: false,
  },
  colors: [color],
  stroke: {
    curve: 'straight',
    width: 1.5,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
    },
  },
  grid: {
    padding: { top: 10, right: 20, bottom: 10, left: 15 },
  },
  xaxis: {
    type: 'numeric',
    tickAmount: 6,
    labels: {
      formatter: (val: number) => (val ? Math.round(val).toLocaleString() : ''),
      style: { fontSize: '11px' },
    },
    title: {
      text: 'Position',
      style: { color: '#9ca3af', fontSize: '12px' },
    },
  },
  yaxis: {
    labels: {
      style: { fontSize: '11px' },
    },
    title: {
      text: 'QUAL',
      style: { color: '#9ca3af', fontSize: '12px' },
    },
  },
  tooltip: {
    x: {
      formatter: (val: number) => `Pos: ${val?.toLocaleString()}`,
    },
  },
});