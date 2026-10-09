import React, { useCallback, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import ApexCharts from 'apexcharts';
import type { Variant, SortKey, SortDirection } from './types';
import { sampleVariants } from './sampleData';
import { useVariantAnalytics } from './useVariantAnalytics';
import {
  makeBarOptions,
  makeScatterOptions,
  makeDonutOptions,
} from './chartConfig';
import './VariantDashboard.css';

const MUTATION_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#eab308',
];

const GENOTYPE_COLORS = [
  '#3b82f6',
  '#f59e0b',
];

const VARIANT_TYPE_COLORS = [
  '#3b82f6',
  '#f59e0b',
];

export interface VariantDashboardProps {
  variants?: Variant[];
  className?: string;
}

function toCsv(rows: Variant[]): string {
  const header = [
    'chr',
    'pos',
    'ref',
    'alt',
    'qual',
    'filter',
    'dp',
    'gt',
    'ad_ref',
    'ad_alt',
    'gq',
    'mq',
    'qd',
    'sor',
    'bqrs',
    'rprs',
  ];

  const lines = rows.map((v) =>
      [
        v.chr,
        v.pos,
        v.ref,
        v.alt,
        v.qual,
        v.filter,
        v.dp,
        v.gt,
        v.ad[0],
        v.ad[1],
        v.gq,
        v.mq,
        v.qd,
        v.sor,
        v.bqrs,
        v.rprs,
      ].join(',')
  );

  return [
    header.join(','),
    ...lines,
  ].join('\n');
}

function downloadCsv(
    csv: string,
    filename: string
) {
  const blob = new Blob(
      [csv],
      {
        type: 'text/csv;charset=utf-8;',
      }
  );

  const url =
      URL.createObjectURL(blob);

  const link =
      document.createElement('a');

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export const VariantDashboard: React.FC<
    VariantDashboardProps
> = ({
       variants = sampleVariants,
       className,
     }) => {
  const [search, setSearch] =
      useState('');

  const [chromFilter, setChromFilter] =
      useState<string>('all');

  const [passOnly, setPassOnly] =
      useState(false);

  const [minQual, setMinQual] =
      useState<number>(0);

  const [sortKey, setSortKey] =
      useState<SortKey>('pos');

  const [sortDir, setSortDir] =
      useState<SortDirection>('asc');

  // График, открытый в модальном окне
  const [activeChartKey, setActiveChartKey] =
      useState<string | null>(null);

  const chromosomes = useMemo(
      () =>
          Array.from(
              new Set(
                  variants.map(
                      (v) => v.chr
                  )
              )
          ).sort(),
      [variants]
  );

  const filteredVariants =
      useMemo(() => {
        const query =
            search.trim();

        return variants.filter(
            (v) => {
              if (
                  chromFilter !==
                  'all' &&
                  v.chr !==
                  chromFilter
              ) {
                return false;
              }

              if (
                  passOnly &&
                  v.filter !==
                  'PASS'
              ) {
                return false;
              }

              if (
                  v.qual <
                  minQual
              ) {
                return false;
              }

              if (
                  query &&
                  !String(
                      v.pos
                  ).includes(query)
              ) {
                return false;
              }

              return true;
            }
        );
      }, [
        variants,
        search,
        chromFilter,
        passOnly,
        minQual,
      ]);

  const sortedVariants =
      useMemo(() => {
        const copy = [
          ...filteredVariants,
        ];

        copy.sort(
            (a, b) => {
              const diff =
                  a[sortKey] -
                  b[sortKey];

              return sortDir ===
              'asc'
                  ? diff
                  : -diff;
            }
        );

        return copy;
      }, [
        filteredVariants,
        sortKey,
        sortDir,
      ]);

  const analytics =
      useVariantAnalytics(
          filteredVariants
      );

  const handleSort =
      useCallback(
          (key: SortKey) => {
            if (
                key ===
                sortKey
            ) {
              setSortDir(
                  (d) =>
                      d === 'asc'
                          ? 'desc'
                          : 'asc'
              );
            } else {
              setSortKey(
                  key
              );

              setSortDir(
                  'asc'
              );
            }
          },
          [sortKey]
      );

  const resetFilters =
      useCallback(() => {
        setSearch('');
        setChromFilter(
            'all'
        );
        setPassOnly(false);
        setMinQual(0);
      }, []);

  const positions =
      filteredVariants.map(
          (v) => v.pos
      );

  const mutationLabels =
      Object.keys(
          analytics.mutationCounts
      );

  const chromLabels =
      Object.keys(
          analytics.chromCounts
      );

  /*
   * Все графики dashboard.
   */
  // Все графики dashboard с описаниями
  const charts = useMemo(
      () => [
        {
          key: 'qual',
          title: 'Quality Score (QUAL) by Position',
          description: 'Показывает оценку качества (QUAL) для каждого варианта в зависимости от его позиции в геноме. Высокие значения (>30) указывают на высокую достоверность вызова.',
          type: 'bar' as const,
          options: makeBarOptions(positions, '#3b82f6', 'dark'),
          series: [{ name: 'QUAL', data: filteredVariants.map((v) => Number(v.qual.toFixed(1))) }],
        },
        {
          key: 'dp',
          title: 'Read Depth (DP) by Position',
          description: 'Отражает глубину покрытия (Read Depth) — количество считываний секвенирования, приходящихся на данную позицию. Помогает выявить участки с низким или избыточным покрытием.',
          type: 'scatter' as const,
          options: makeScatterOptions(positions, '#10b981', 'dark', 'Depth'),
          series: [{ name: 'Depth', data: filteredVariants.map((v) => [v.pos, v.dp]) }],
        },
        {
          key: 'rprs',
          title: 'Read Position Rank Sum (RPRS)',
          description: 'Z-оценка разницы в позициях ридов для альтернативных и референсных аллелей. Значения сильно отклоняющиеся от нуля могут указывать на технологические артефакты секвенирования.',
          type: 'scatter' as const,
          options: makeScatterOptions(positions, '#a855f7', 'dark', 'RPRS z-score'),
          series: [{ name: 'ReadPosRankSum', data: filteredVariants.map((v) => [v.pos, v.rprs]) }],
        },
        {
          key: 'mutations',
          title: 'Mutation Spectrum (SNPs)',
          description: 'Спектр мутаций (типы замен нуклеотидов, например, A>G, C>T). Позволяет оценить преобладающие мутационные паттерны в исследованном образце.',
          type: 'donut' as const,
          options: makeDonutOptions(mutationLabels, MUTATION_COLORS, 'dark'),
          series: mutationLabels.map((label) => analytics.mutationCounts[label]),
        },
        {
          key: 'genotype',
          title: 'Genotype Distribution',
          description: 'Соотношение генотипов среди обнаруженных вариантов: гетерозиготные (0/1) и гомозиготные по альтернативному аллелю (1/1) вызовы.',
          type: 'donut' as const,
          options: makeDonutOptions(['Heterozygous (0/1)', 'Homozygous alt (1/1)'], GENOTYPE_COLORS, 'dark'),
          series: [analytics.hetCount, analytics.homAltCount],
        },
        {
          key: 'variantType',
          title: 'Variant Type (SNP vs InDel)',
          description: 'Пропорция между точечными мутациями (SNP — Single Nucleotide Polymorphism) и инсерциями/делециями (InDel).',
          type: 'donut' as const,
          options: makeDonutOptions(['SNP', 'InDel'], VARIANT_TYPE_COLORS, 'dark'),
          series: [analytics.snpCount, analytics.indelCount],
        },
        {
          key: 'ab',
          title: 'Allele Balance Spectrum',
          description: 'Баланс аллелей (Allele Balance) для гетерозиготных позиций — доля считываний, поддерживающих альтернативный аллель (в норме близко к 0.5).',
          type: 'bar' as const,
          options: makeBarOptions(Object.keys(analytics.abBins), '#8b5cf6', 'dark'),
          series: [{ name: 'Variants', data: Object.values(analytics.abBins) }],
        },
        {
          key: 'gq',
          title: 'Genotype Quality (GQ) Distribution',
          description: 'Распределение качества генотипа (Genotype Quality). Показывает уверенность алгоритма в правильно определенном зиготном наборе.',
          type: 'bar' as const,
          options: makeBarOptions(Object.keys(analytics.gqBins), '#06b6d4', 'dark'),
          series: [{ name: 'Variants', data: Object.values(analytics.gqBins) }],
        },
        {
          key: 'mq',
          title: 'Mapping Quality (MQ) Profile',
          description: 'Качество картирования (Mapping Quality). Оценивает, насколько уверенно риды были сопоставлены с референсным геномом в данной позиции.',
          type: 'bar' as const,
          options: makeBarOptions(Object.keys(analytics.mqBins), '#f43f5e', 'dark'),
          series: [{ name: 'Variants', data: Object.values(analytics.mqBins) }],
        },
        {
          key: 'qd',
          title: 'Quality by Depth (QD) Distribution',
          description: 'Качество, нормализованное по глубине покрытия (Variant Quality / Depth). Помогает нивелировать влияние высокого покрытия на метрику QUAL.',
          type: 'bar' as const,
          options: makeBarOptions(Object.keys(analytics.qdBins), '#eab308', 'dark'),
          series: [{ name: 'Variants', data: Object.values(analytics.qdBins) }],
        },
        {
          key: 'sor',
          title: 'Strand Bias Distribution (SOR)',
          description: 'Смещение цепи (Strand Odds Ratio). Мера предвзятости цепи секвенирования: высокие значения часто указывают на ложноположительные варианты.',
          type: 'bar' as const,
          options: makeBarOptions(Object.keys(analytics.sorBins), '#14b8a6', 'dark'),
          series: [{ name: 'Variants', data: Object.values(analytics.sorBins) }],
        },
        {
          key: 'bqrs',
          title: 'Base Quality Rank Sum Profile',
          description: 'Сравнение качества базовых нуклеотидов между референсными и альтернативными ридами (BaseQualityRankSum).',
          type: 'bar' as const,
          options: makeBarOptions(Object.keys(analytics.bqrsBins), '#ec4899', 'dark'),
          series: [{ name: 'Variants', data: Object.values(analytics.bqrsBins) }],
        },
        {
          key: 'chrom',
          title: 'Variants by Chromosome',
          description: 'Количество обнаруженных генетических вариантов в разрезе по хромосомам.',
          type: 'bar' as const,
          options: makeBarOptions(chromLabels, '#6366f1', 'dark', { yFormatter: (v) => Math.floor(v).toString() }),
          series: [{ name: 'Variants', data: Object.values(analytics.chromCounts) }],
        },
      ],
      [analytics, filteredVariants, positions, mutationLabels, chromLabels]
  );

  /*
   * Скачивание графика в PNG.
   *
   * Используем официальный ApexCharts API:
   *
   * ApexCharts.exec(chartId, 'dataURI')
   *
   * Здесь НЕ используется:
   * - window.ApexCharts
   * - canvas.toBlob()
   * - SVG -> Canvas
   */
  const handleDownloadPng =
      useCallback(
          async (
              chartKey: string
          ) => {
            const chartId =
                `modal-${chartKey}`;

            try {
              /*
               * Небольшая пауза нужна,
               * чтобы ApexCharts успел
               * полностью отрисовать
               * график после открытия modal.
               */
              await new Promise(
                  (resolve) =>
                      setTimeout(
                          resolve,
                          100
                      )
              );

              const result =
                  await ApexCharts.exec(
                      chartId,
                      'dataURI',
                      {
                        scale: 2,
                      }
                  );

              if (
                  !result ||
                  !result.imgURI
              ) {
                throw new Error(
                    'ApexCharts did not return PNG image data.'
                );
              }

              /*
               * ApexCharts dataURI()
               * возвращает data URI.
               *
               * Создаём ссылку напрямую,
               * без canvas.
               */
              const link =
                  document.createElement(
                      'a'
                  );

              link.href =
                  result.imgURI;

              link.download =
                  `${chartKey}-chart.png`;

              link.style.display =
                  'none';

              document.body.appendChild(
                  link
              );

              link.click();

              document.body.removeChild(
                  link
              );
            } catch (error) {
              console.error(
                  'Failed to download chart as PNG:',
                  error
              );

              /*
               * Дополнительная проверка:
               * существует ли вообще
               * график с таким ID.
               */
              const chartElement =
                  document.querySelector(
                      `#chart-modal-${chartKey} .apexcharts-canvas`
                  );

              if (
                  !chartElement
              ) {
                alert(
                    'График ещё не успел загрузиться. Попробуй нажать Download PNG ещё раз.'
                );
              } else {
                alert(
                    'Не удалось скачать график в PNG. Проверь консоль браузера (F12 → Console).'
                );
              }
            }
          },
          []
      );

  const activeChart =
      charts.find(
          (c) =>
              c.key ===
              activeChartKey
      );

  return (
      <div
          className={`vd-container${
              className
                  ? ` ${className}`
                  : ''
          }`}
      >
        {/* HEADER */}
        <header className="vd-header">
          <div>
            <h2 className="vd-title">
              Genomic Variants Dashboard
            </h2>

            <p className="vd-subtitle">
              {variants.length.toLocaleString()}{' '}
              variants loaded

              {filteredVariants.length !==
                  variants.length && (
                      <>
                        {' '}
                        &middot;{' '}
                        {filteredVariants.length.toLocaleString()}{' '}
                        shown after filters
                      </>
                  )}
            </p>
          </div>

          <div className="vd-header-actions">
            <button
                type="button"
                className="vd-btn"
                onClick={() =>
                    downloadCsv(
                        toCsv(
                            filteredVariants
                        ),
                        'variants.csv'
                    )
                }
                disabled={
                    filteredVariants.length ===
                    0
                }
            >
              Export CSV
            </button>
          </div>
        </header>

        {/* FILTER BAR */}
        <div
            className="vd-filters"
            role="search"
        >
          <label className="vd-field">
          <span>
            Search position
          </span>

            <input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 3069321"
                value={search}
                onChange={(e) =>
                    setSearch(
                        e.target.value
                    )
                }
            />
          </label>

          <label className="vd-field">
          <span>
            Chromosome
          </span>

            <select
                value={chromFilter}
                onChange={(e) =>
                    setChromFilter(
                        e.target.value
                    )
                }
            >
              <option value="all">
                All
              </option>

              {chromosomes.map(
                  (c) => (
                      <option
                          key={c}
                          value={c}
                      >
                        {c}
                      </option>
                  )
              )}
            </select>
          </label>

          <label className="vd-field">
          <span>
            Min QUAL
          </span>

            <input
                type="number"
                min={0}
                step={10}
                value={minQual}
                onChange={(e) =>
                    setMinQual(
                        Number(
                            e.target.value
                        ) || 0
                    )
                }
            />
          </label>

          <label className="vd-field vd-field-checkbox">
            <input
                type="checkbox"
                checked={
                  passOnly
                }
                onChange={(e) =>
                    setPassOnly(
                        e.target.checked
                    )
                }
            />

            <span>
            PASS only
          </span>
          </label>

          <button
              type="button"
              className="vd-btn vd-btn-ghost"
              onClick={
                resetFilters
              }
          >
            Reset
          </button>
        </div>

        {/* EMPTY STATE */}
        {filteredVariants.length ===
        0 ? (
            <div
                className="vd-empty"
                role="status"
            >
              <p>
                No variants match the
                current filters.
              </p>

              <button
                  type="button"
                  className="vd-btn"
                  onClick={
                    resetFilters
                  }
              >
                Clear filters
              </button>
            </div>
        ) : (
            <>
              {/* METRICS */}
              <div className="vd-metrics-grid">
                <MetricCard
                    label="Total variants"
                    value={analytics.total.toString()}
                />

                <MetricCard
                    label="Het/Hom ratio"
                    value={
                      analytics.hetHomRatio
                    }
                    hint="0/1 calls : 1/1 calls"
                />

                <MetricCard
                    label="Ti/Tv ratio"
                    value={
                      analytics.titvRatio
                    }
                    hint="Transitions : transversions"
                />

                <MetricCard
                    label="SNP : InDel"
                    value={`${analytics.snpCount} : ${analytics.indelCount}`}
                />

                <MetricCard
                    label="Avg GQ"
                    value={
                      analytics.avgGq
                    }
                />

                <MetricCard
                    label="Avg MQ"
                    value={
                      analytics.avgMq
                    }
                />

                <MetricCard
                    label="Avg QD"
                    value={
                      analytics.avgQd
                    }
                />

                <MetricCard
                    label="Avg SOR"
                    value={
                      analytics.avgSor
                    }
                />
              </div>

              {/* CHARTS */}
              <div className="vd-charts-grid">
                {charts.map(
                    (c) => (
                        <div
                            className="vd-chart-card"
                            key={c.key}
                            onClick={() =>
                                setActiveChartKey(
                                    c.key
                                )
                            }
                            title="Click to enlarge and download the PNG."
                        >
                          <h3>
                            {c.title}
                          </h3>

                          <div
                              className="vd-chart-wrapper"
                              id={`chart-${c.key}`}
                          >
                            <Chart
                                options={
                                  c.options
                                }
                                series={
                                  c.series
                                }
                                type={
                                  c.type
                                }
                                height="100%"
                            />
                          </div>
                        </div>
                    )
                )}
              </div>

              {/* VARIANT TABLE */}
              <div className="vd-table-card">
                <h3>
                  Variant Calls (
                  {
                    sortedVariants.length
                  }
                  )
                </h3>

                <div className="vd-table-scroll">
                  <table className="vd-table">
                    <thead>
                    <tr>
                      <SortableHeader
                          label="Chr"
                      />

                      <SortableHeader
                          label="Position"
                          sortKey="pos"
                          active={
                            sortKey
                          }
                          dir={
                            sortDir
                          }
                          onSort={
                            handleSort
                          }
                      />

                      <SortableHeader
                          label="Change"
                      />

                      <SortableHeader
                          label="QUAL"
                          sortKey="qual"
                          active={
                            sortKey
                          }
                          dir={
                            sortDir
                          }
                          onSort={
                            handleSort
                          }
                      />

                      <SortableHeader
                          label="DP"
                          sortKey="dp"
                          active={
                            sortKey
                          }
                          dir={
                            sortDir
                          }
                          onSort={
                            handleSort
                          }
                      />

                      <SortableHeader
                          label="GT"
                      />

                      <SortableHeader
                          label="GQ"
                          sortKey="gq"
                          active={
                            sortKey
                          }
                          dir={
                            sortDir
                          }
                          onSort={
                            handleSort
                          }
                      />

                      <SortableHeader
                          label="MQ"
                          sortKey="mq"
                          active={
                            sortKey
                          }
                          dir={
                            sortDir
                          }
                          onSort={
                            handleSort
                          }
                      />

                      <SortableHeader
                          label="QD"
                          sortKey="qd"
                          active={
                            sortKey
                          }
                          dir={
                            sortDir
                          }
                          onSort={
                            handleSort
                          }
                      />

                      <SortableHeader
                          label="SOR"
                          sortKey="sor"
                          active={
                            sortKey
                          }
                          dir={
                            sortDir
                          }
                          onSort={
                            handleSort
                          }
                      />

                      <SortableHeader
                          label="Filter"
                      />
                    </tr>
                    </thead>

                    <tbody>
                    {sortedVariants.map(
                        (v) => (
                            <tr
                                key={`${v.chr}-${v.pos}-${v.ref}-${v.alt}`}
                            >
                              <td>
                                {v.chr}
                              </td>

                              <td>
                                {v.pos.toLocaleString()}
                              </td>

                              <td>
                                {v.ref}
                                &rarr;
                                {v.alt}
                              </td>

                              <td>
                                {v.qual.toFixed(
                                    1
                                )}
                              </td>

                              <td>
                                {v.dp}
                              </td>

                              <td>
                                {v.gt}
                              </td>

                              <td>
                                {v.gq}
                              </td>

                              <td>
                                {v.mq.toFixed(
                                    1
                                )}
                              </td>

                              <td>
                                {v.qd.toFixed(
                                    2
                                )}
                              </td>

                              <td>
                                {v.sor.toFixed(
                                    3
                                )}
                              </td>

                              <td>
                          <span
                              className={`vd-badge${
                                  v.filter ===
                                  'PASS'
                                      ? ' vd-badge-pass'
                                      : ' vd-badge-fail'
                              }`}
                          >
                            {
                              v.filter
                            }
                          </span>
                              </td>
                            </tr>
                        )
                    )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
        )}

        {/* MODAL */}
        {activeChart && (
            <div
                className="vd-modal-overlay"
                onClick={() =>
                    setActiveChartKey(
                        null
                    )
                }
            >
              <div
                  className="vd-modal-content"
                  onClick={(e) =>
                      e.stopPropagation()
                  }
              >
                <div className="vd-modal-header">
                  <h3>
                    {
                      activeChart.title
                    }
                  </h3>

                  <div className="vd-modal-actions">
                    <button
                        type="button"
                        className="vd-btn"
                        onClick={() =>
                            handleDownloadPng(
                                activeChart.key
                            )
                        }
                    >
                      Download PNG
                    </button>

                    <button
                        type="button"
                        className="vd-btn vd-btn-ghost"
                        onClick={() =>
                            setActiveChartKey(
                                null
                            )
                        }
                    >
                      ✕ Закрыть
                    </button>
                  </div>
                </div>
                <div
                    className="vd-modal-body"
                    id={`chart-modal-${activeChart.key}`}
                >
                  <Chart
                      options={{
                        ...activeChart.options,

                        chart: {
                          ...activeChart.options.chart,

                          id: `modal-${activeChart.key}`,

                          toolbar: {
                            ...activeChart.options
                                .chart
                                ?.toolbar,
                            show: false,
                          },
                        },
                      }}
                      series={
                        activeChart.series
                      }
                      type={
                        activeChart.type
                      }
                      height={600}
                      width="100%"
                  />
                </div>
                    {activeChart.description && (
                    <div className="vd-modal-description">
                      <strong>Описание:</strong> {activeChart.description}
                    </div>
                        )}
              </div>
            </div>
        )}
      </div>
  );
};

const MetricCard: React.FC<{
  label: string;
  value: string;
  hint?: string;
}> = ({
        label,
        value,
        hint,
      }) => (
    <div className="vd-metric-card">
      <h3>
        {label}
      </h3>

      <p className="vd-metric-value">
        {value}
      </p>

      {hint && (
          <p className="vd-metric-hint">
            {hint}
          </p>
      )}
    </div>
);

const SortableHeader: React.FC<{
  label: string;
  sortKey?: SortKey;
  active?: SortKey;
  dir?: SortDirection;
  onSort?: (
      key: SortKey
  ) => void;
}> = ({
        label,
        sortKey,
        active,
        dir,
        onSort,
      }) => {
  if (
      !sortKey ||
      !onSort
  ) {
    return (
        <th scope="col">
          {label}
        </th>
    );
  }

  const isActive =
      active ===
      sortKey;

  return (
      <th scope="col">
        <button
            type="button"
            className="vd-th-sort"
            onClick={() =>
                onSort(
                    sortKey
                )
            }
            aria-sort={
              isActive
                  ? dir ===
                  'asc'
                      ? 'ascending'
                      : 'descending'
                  : 'none'
            }
        >
          {label}

          <span
              className="vd-sort-icon"
              aria-hidden="true"
          >
          {isActive
              ? dir ===
              'asc'
                  ? ' ↑'
                  : ' ↓'
              : ''}
        </span>
        </button>
      </th>
  );
};

