import {Injectable} from "@nestjs/common";
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


@Injectable()
export class VcfParserService {
    async parseStream(filePath: string): Promise<StreamAnalytics> {
        const rawStream = fs.createReadStream(filePath);
        const stream = filePath.endsWith('.gz')
        ? rawStream.pipe(zlib.createGunzip())
            : rawStream;

        const rl = readline.createInterface({input: stream, crlfDelay: Infinity});

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

            const [chr, posStr, , ref, altRaw, qualStr, filter] = cols;
            const alt = altRaw.split(',')[0];
            const pos = Number(posStr);
            const qual = Number(qualStr) || 0;

            const isSnp = ref.length === 1 && alt.length === 1;
            if (isSnp) {
                stats.snpCount++;
                if (TRANSITIONS.has(ref + alt)) stats.transitions++;
                else stats.transversions++;
            } else {
                stats.indelCount++;
            }

            let gt = './.';
            if (cols[8] && cols[9]) {
                const fmtKeys = cols[8].split(':');
                const fmtVals = cols[9].split(':');
                const gdIdx = fmtKeys.indexOf('GT');
                if (gdIdx !== -1 && fmtVals[gdIdx]) {
                    const rawGt = fmtVals[gdIdx].replace(/\|/g, '/');
                    gt = rawGt === '1/0' ? '0/1' : rawGt;
                }
            }

            if (gt === '0/1') stats.hetCount++;
            else if (gt === '1/1') stats.homAltCount++;

            stats.total++;

            if (stats.variants.length < 30000) {
                stats.variants.push({chr, pos, ref, alt, qual, filter, gt, dp: 0});
            }
        }

        return stats;
    }
}