export type Genotype = '0/1' | '1/1' | '0/0' | './.';

/** A single called variant, as decoded from a VCF record's fixed columns + INFO/FORMAT fields. */
export interface Variant {
  chr: string;
  pos: number;
  ref: string;
  alt: string;
  qual: number;
  filter: string;
  /** Total read depth at this site (FORMAT.DP). */
  dp: number;
  /** Genotype call (FORMAT.GT). */
  gt: Genotype;
  /** Allelic depth [refReads, altReads] (FORMAT.AD). */
  ad: [number, number];
  /** Genotype quality, Phred-scaled (FORMAT.GQ). */
  gq: number;
  /** RMS mapping quality (INFO.MQ). */
  mq: number;
  /** Quality normalized by depth (INFO.QD). */
  qd: number;
  /** Strand odds ratio, strand-bias estimator (INFO.SOR). */
  sor: number;
  /** Base quality rank sum test z-score (INFO.BaseQRankSum). */
  bqrs: number;
  /** Read position rank sum test z-score (INFO.ReadPosRankSum). */
  rprs: number;
}

export type SortKey = keyof Pick<
  Variant,
  'pos' | 'qual' | 'dp' | 'gq' | 'mq' | 'qd' | 'sor'
>;

export type SortDirection = 'asc' | 'desc';

export interface BinCount {
  label: string;
  count: number;
}
