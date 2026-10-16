import { Injectable } from "@nestjs/common";
import * as zlib from "node:zlib";
import * as fs from "node:fs";
import * as readline from "node:readline";

export interface ParsedVariant {
    chr: string;
    pos: number;
    ref: string;
    alt: string;
    qual: number;
    filter: string;
    dp: number;
    gt: string;
    ad: [number, number];
    gq: number;
    mq: number;
    qd: number;
    sor: number;
    bqrs: number;
    rprs: number;
}

export interface StreamAnalytics {
    total: number;
    hetCount: number;
    homAltCount: number;
    snpCount: number;
    indelCount: number;
    transitions: number;
    transversions: number;
    variants: ParsedVariant[];
}

const TRANSITIONS = new Set(['AG', 'GA', 'CT', 'TC']);

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

function parseAd(raw: string | undefined, dp: number): [number, number] {
    if (!raw || raw === '.') return [dp, 0];
    const parts = raw.split(',').map((part) => parseNumber(part, 0));
    return [parts[0] ?? 0, parts[1] ?? 0];
}

@Injectable()
export class VcfParserService {
    async parseStream(filePath: string): Promise<StreamAnalytics> {
        const rawStream = fs.createReadStream(filePath);
        const stream = filePath.endsWith('.gz')
            ? rawStream.pipe(zlib.createGunzip())
            : rawStream;

        const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

        const stats: StreamAnalytics = {
            total: 0,
            hetCount: 0,
            homAltCount: 0,
            snpCount: 0,
            indelCount: 0,
            transitions: 0,
            transversions: 0,
            variants: [],
        };

        for await (const rawline of rl) {
            const line = rawline.trim();
            if (!line || line.startsWith('#')) continue;

            const cols = line.split('\t');
            if (cols.length < 8) continue;

            const [chr, posStr, , ref, altRaw, qualStr, filterRaw, infoRaw] = cols;
            const alt = altRaw.split(',')[0];
            if (!chr || !posStr || !ref || !alt) continue;

            const pos = Number(posStr);
            if (!Number.isFinite(pos)) continue;

            const qual = parseNumber(qualStr);
            const filter = filterRaw && filterRaw !== '.' ? filterRaw : '.';
            const info = parseInfo(infoRaw);

            const isSnp = ref.length === 1 && alt.length === 1;
            if (isSnp) {
                stats.snpCount++;
                if (TRANSITIONS.has(ref + alt)) stats.transitions++;
                else stats.transversions++;
            } else {
                stats.indelCount++;
            }

            const sample: Record<string, string> = {};
            if (cols[8] && cols[9]) {
                const fmtKeys = cols[8].split(':');
                const fmtVals = cols[9].split(':');
                fmtKeys.forEach((key, idx) => {
                    sample[key] = fmtVals[idx] ?? '';
                });
            }

            let gt = './.';
            if (sample.GT && sample.GT !== '.') {
                const rawGt = sample.GT.replace(/\|/g, '/');
                gt = rawGt === '1/0' ? '0/1' : rawGt;
            }

            if (gt === '0/1') stats.hetCount++;
            else if (gt === '1/1') stats.homAltCount++;

            stats.total++;

            if (stats.variants.length < 30000) {
                const dp = parseNumber(sample.DP, parseNumber(info.DP));
                const ad = parseAd(sample.AD, dp);
                stats.variants.push({
                    chr,
                    pos,
                    ref,
                    alt,
                    qual,
                    filter,
                    gt,
                    dp,
                    ad,
                    gq: parseNumber(sample.GQ),
                    mq: parseNumber(info.MQ),
                    qd: parseNumber(info.QD),
                    sor: parseNumber(info.SOR),
                    bqrs: parseNumber(info.BaseQRankSum),
                    rprs: parseNumber(info.ReadPosRankSum),
                });
            }
        }

        return stats;
    }
}