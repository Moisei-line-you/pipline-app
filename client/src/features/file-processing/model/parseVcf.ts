import type { Genotype, Variant } from '../../variant-dashboard/ui/types';

const MAX_VARIANTS = 2000;

function parseInfo(info: string): Record<string, string> {
    const result: Record<string, string> = {};
    if (!info || info === '.') return result;

    for (const part of info.split(';')) {
        const eq = part.indexOf('=');
        if (eq === -1) continue;
        result[part.slice(0, eq)] = part.slice(eq + 1);
    }
    return result;
}

function parseNumber(value: string | undefined, fallback = 0): number {
    if (value === undefined || value === '' || value === '.') return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeGt(raw: string | undefined): Genotype {
    if (!raw || raw === '.') return './.';
    const g = raw.replace(/\|/g, '/');
    if (g === '1/0') return '0/1';
    if (g === '0/1' || g === '1/1' || g === '0/0' || g === './.') return g;
    return './.';
}

function parseAd(raw: string | undefined, dp: number): [number, number] {
    if (!raw || raw === '.') return [dp, 0];
    const parts = raw.split(',').map((part) => parseNumber(part, 0));
    return [parts[0] ?? 0, parts[1] ?? 0];
}

export function parseVcf(text: string): Variant[] {
    const variants: Variant[] = [];

    for (const rawLine of text.split(/\r?\n/)) {
        if (variants.length >= MAX_VARIANTS) break;

        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;

        const cols = line.split('\t');
        if (cols.length < 8) continue;

        const [chr, posRaw, , ref, altField, qualRaw, filterRaw, infoRaw] = cols;
        const alt = altField.split(',')[0];
        if (!chr || !posRaw || !ref || !alt) continue;

        const pos = Number(posRaw);
        if (!Number.isFinite(pos)) continue;

        const info = parseInfo(infoRaw);
        const formatKeys = cols[8] ? cols[8].split(':') : [];
        const sampleValues = cols[9] ? cols[9].split(':') : [];
        const sample: Record<string, string> = {};
        formatKeys.forEach((key, index) => {
            sample[key] = sampleValues[index] ?? '';
        });

        const dp = parseNumber(sample.DP, parseNumber(info.DP));
        const ad = parseAd(sample.AD, dp);

        variants.push({
            chr,
            pos,
            ref,
            alt,
            qual: parseNumber(qualRaw),
            filter: filterRaw && filterRaw !== '.' ? filterRaw : '.',
            dp,
            gt: normalizeGt(sample.GT),
            ad,
            gq: parseNumber(sample.GQ),
            mq: parseNumber(info.MQ),
            qd: parseNumber(info.QD),
            sor: parseNumber(info.SOR),
            bqrs: parseNumber(info.BaseQRankSum),
            rprs: parseNumber(info.ReadPosRankSum),
        });
    }

    return variants;
}
