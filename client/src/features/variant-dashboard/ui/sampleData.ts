import type { Variant } from './types';

/**
 * Sample variant calls extracted from a VCF (POS, REF, ALT, QUAL, FILTER, plus
 * INFO/FORMAT fields DP, GT, AD, GQ, MQ, QD, SOR, BaseQRankSum, ReadPosRankSum).
 * Replace with real parsed VCF data, or pass your own via the `variants` prop.
 */
export const sampleVariants: Variant[] = [
  { chr: 'chr1', pos: 3069321, ref: 'C', alt: 'G', qual: 356.64, filter: 'PASS', dp: 23, gt: '0/1', ad: [9, 12], gq: 99, mq: 60.0, qd: 16.98, sor: 1.061, bqrs: 0.904, rprs: -0.224 },
  { chr: 'chr1', pos: 3404736, ref: 'C', alt: 'A', qual: 44.64, filter: 'PASS', dp: 9, gt: '0/1', ad: [6, 2], gq: 52, mq: 60.0, qd: 5.58, sor: 0.169, bqrs: -2.100, rprs: -2.100 },
  { chr: 'chr1', pos: 3411794, ref: 'T', alt: 'C', qual: 546.64, filter: 'PASS', dp: 61, gt: '0/1', ad: [36, 24], gq: 99, mq: 60.0, qd: 9.11, sor: 0.435, bqrs: -1.998, rprs: -1.330 },
  { chr: 'chr1', pos: 3414517, ref: 'G', alt: 'A', qual: 155.64, filter: 'PASS', dp: 14, gt: '0/1', ad: [6, 7], gq: 99, mq: 60.0, qd: 11.97, sor: 0.446, bqrs: 0.591, rprs: 1.562 },
  { chr: 'chr1', pos: 3433609, ref: 'T', alt: 'C', qual: 240.64, filter: 'PASS', dp: 13, gt: '0/1', ad: [4, 8], gq: 99, mq: 60.0, qd: 20.05, sor: 1.609, bqrs: -0.295, rprs: -1.712 },
  { chr: 'chr1', pos: 15944765, ref: 'G', alt: 'A', qual: 945.64, filter: 'PASS', dp: 90, gt: '0/1', ad: [45, 44], gq: 99, mq: 60.0, qd: 10.63, sor: 0.437, bqrs: -0.477, rprs: 1.053 },
  { chr: 'chr1', pos: 15945755, ref: 'A', alt: 'G', qual: 557.64, filter: 'PASS', dp: 47, gt: '0/1', ad: [24, 23], gq: 99, mq: 60.0, qd: 11.86, sor: 0.627, bqrs: -0.792, rprs: -0.758 },
  { chr: 'chr1', pos: 15945914, ref: 'C', alt: 'T', qual: 253.64, filter: 'PASS', dp: 20, gt: '0/1', ad: [10, 10], gq: 99, mq: 60.0, qd: 12.68, sor: 0.148, bqrs: -0.681, rprs: 1.551 },
  { chr: 'chr1', pos: 25563141, ref: 'T', alt: 'C', qual: 701.06, filter: 'PASS', dp: 24, gt: '1/1', ad: [0, 24], gq: 72, mq: 60.0, qd: 29.21, sor: 1.270, bqrs: 0.0, rprs: 0.0 },
  { chr: 'chr1', pos: 25563698, ref: 'A', alt: 'G', qual: 1770.06, filter: 'PASS', dp: 68, gt: '1/1', ad: [3, 65], gq: 99, mq: 60.0, qd: 26.03, sor: 0.681, bqrs: -0.610, rprs: -1.648 },
];
