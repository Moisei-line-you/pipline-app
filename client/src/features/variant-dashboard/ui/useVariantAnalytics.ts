import { useMemo } from 'react';
import type { Variant } from './types';

const TRANSITIONS = new Set(['AG', 'GA', 'CT', 'TC']);

function emptyBins<T extends string>(labels: readonly T[]): Record<T, number> {
  return labels.reduce((acc, label) => {
    acc[label] = 0;
    return acc;
  }, {} as Record<T, number>);
}

const AB_LABELS = ['0.0-0.2', '0.2-0.4', '0.4-0.6 (het peak)', '0.6-0.8', '0.8-1.0'] as const;
const GQ_LABELS = ['0-49 (low)', '50-98 (medium)', '99+ (high confidence)'] as const;
const MQ_LABELS = ['<30 (poor)', '30-49', '50-59', '60 (perfect)'] as const;
const QD_LABELS = ['<2 (likely artifact)', '2-10', '10-20', '20+ (high)'] as const;
const SOR_LABELS = ['<0.5 (balanced)', '0.5-1.0', '1.0+ (strand bias)'] as const;
const BQRS_LABELS = ['<-1.5 (low qual)', '-1.5-0.0', '0.0+ (good)'] as const;

export interface VariantAnalytics {
  total: number;
  hetCount: number;
  homAltCount: number;
  hetHomRatio: string;
  titvRatio: string;
  snpCount: number;
  indelCount: number;
  avgGq: string;
  avgMq: string;
  avgQd: string;
  avgSor: string;
  chromCounts: Record<string, number>;
  mutationCounts: Record<string, number>;
  abBins: Record<(typeof AB_LABELS)[number], number>;
  gqBins: Record<(typeof GQ_LABELS)[number], number>;
  mqBins: Record<(typeof MQ_LABELS)[number], number>;
  qdBins: Record<(typeof QD_LABELS)[number], number>;
  sorBins: Record<(typeof SOR_LABELS)[number], number>;
  bqrsBins: Record<(typeof BQRS_LABELS)[number], number>;
}

export function useVariantAnalytics(variants: Variant[]): VariantAnalytics {
  return useMemo(() => {
    const total = variants.length;

    let hetCount = 0;
    let homAltCount = 0;
    let snpCount = 0;
    let indelCount = 0;
    let transitions = 0;
    let transversions = 0;
    let sumGq = 0;
    let sumMq = 0;
    let sumQd = 0;
    let sumSor = 0;

    const chromCounts: Record<string, number> = {};
    const mutationCounts: Record<string, number> = {};
    const abBins = emptyBins(AB_LABELS);
    const gqBins = emptyBins(GQ_LABELS);
    const mqBins = emptyBins(MQ_LABELS);
    const qdBins = emptyBins(QD_LABELS);
    const sorBins = emptyBins(SOR_LABELS);
    const bqrsBins = emptyBins(BQRS_LABELS);

    for (const v of variants) {
      if (v.gt === '0/1') hetCount++;
      else if (v.gt === '1/1') homAltCount++;

      const isSnp = v.ref.length === 1 && v.alt.length === 1;
      if (isSnp) {
        snpCount++;
        if (TRANSITIONS.has(v.ref + v.alt)) transitions++;
        else transversions++;
        const label = `${v.ref} \u2192 ${v.alt}`;
        mutationCounts[label] = (mutationCounts[label] ?? 0) + 1;
      } else {
        indelCount++;
      }

      chromCounts[v.chr] = (chromCounts[v.chr] ?? 0) + 1;

      sumGq += v.gq;
      sumMq += v.mq;
      sumQd += v.qd;
      sumSor += v.sor;

      const [refReads, altReads] = v.ad;
      const depth = refReads + altReads;
      const ab = depth === 0 ? 0 : altReads / depth;
      if (ab <= 0.2) abBins['0.0-0.2']++;
      else if (ab <= 0.4) abBins['0.2-0.4']++;
      else if (ab <= 0.6) abBins['0.4-0.6 (het peak)']++;
      else if (ab <= 0.8) abBins['0.6-0.8']++;
      else abBins['0.8-1.0']++;

      if (v.gq < 50) gqBins['0-49 (low)']++;
      else if (v.gq < 99) gqBins['50-98 (medium)']++;
      else gqBins['99+ (high confidence)']++;

      if (v.mq < 30) mqBins['<30 (poor)']++;
      else if (v.mq < 50) mqBins['30-49']++;
      else if (v.mq < 60) mqBins['50-59']++;
      else mqBins['60 (perfect)']++;

      if (v.qd < 2) qdBins['<2 (likely artifact)']++;
      else if (v.qd <= 10) qdBins['2-10']++;
      else if (v.qd <= 20) qdBins['10-20']++;
      else qdBins['20+ (high)']++;

      if (v.sor < 0.5) sorBins['<0.5 (balanced)']++;
      else if (v.sor <= 1.0) sorBins['0.5-1.0']++;
      else sorBins['1.0+ (strand bias)']++;

      if (v.bqrs < -1.5) bqrsBins['<-1.5 (low qual)']++;
      else if (v.bqrs <= 0.0) bqrsBins['-1.5-0.0']++;
      else bqrsBins['0.0+ (good)']++;
    }

    return {
      total,
      hetCount,
      homAltCount,
      hetHomRatio: homAltCount === 0 ? '\u221e' : (hetCount / homAltCount).toFixed(2),
      titvRatio: transversions === 0 ? '\u221e' : (transitions / transversions).toFixed(2),
      snpCount,
      indelCount,
      avgGq: total ? (sumGq / total).toFixed(1) : '0.0',
      avgMq: total ? (sumMq / total).toFixed(1) : '0.0',
      avgQd: total ? (sumQd / total).toFixed(1) : '0.0',
      avgSor: total ? (sumSor / total).toFixed(3) : '0.000',
      chromCounts,
      mutationCounts,
      abBins,
      gqBins,
      mqBins,
      qdBins,
      sorBins,
      bqrsBins,
    };
  }, [variants]);
}