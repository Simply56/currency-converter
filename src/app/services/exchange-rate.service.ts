import { Injectable, computed, resource } from '@angular/core';
import { CURRENCIES } from '../models/currency';

const NON_EUR_CODES = CURRENCIES.filter((c) => c.code !== 'EUR').map((c) => c.code);
const ECB_URL =
  `https://data-api.ecb.europa.eu/service/data/EXR/D.${NON_EUR_CODES.join('+')}.EUR.SP00.A` +
  `?format=csvdata&lastNObservations=1&detail=dataonly`;

const STORAGE_RATES = 'ratesMap';
const STORAGE_UPDATED = 'lastUpdated';

interface RateSnapshot {
  rates: Record<string, number>;
  updated: number | null;
}

@Injectable({ providedIn: 'root' })
export class ExchangeRateService {
  private readonly cached = this.loadFromCache();

  // The loader never throws: offline or timeout resolves to null and the cached rates remain.
  private readonly live = resource<RateSnapshot | null, unknown>({
    loader: ({ abortSignal }) => this.fetchRates(abortSignal),
  });

  readonly rates = computed(() => this.latest().rates);
  readonly lastUpdated = computed(() => this.latest().updated);

  private readonly latest = computed(
    () => (this.live.hasValue() ? this.live.value() : null) ?? this.cached,
  );

  private loadFromCache(): RateSnapshot {
    const snapshot: RateSnapshot = { rates: { EUR: 1 }, updated: null };
    const raw = localStorage.getItem(STORAGE_RATES);
    const ts = localStorage.getItem(STORAGE_UPDATED);
    if (raw) {
      try {
        snapshot.rates = { EUR: 1, ...(JSON.parse(raw) as Record<string, number>) };
      } catch {
        // ignore corrupt cache
      }
    }
    if (ts) {
      snapshot.updated = Number(ts);
    }
    return snapshot;
  }

  private async fetchRates(abortSignal: AbortSignal): Promise<RateSnapshot | null> {
    try {
      const res = await fetch(ECB_URL, {
        signal: AbortSignal.any([abortSignal, AbortSignal.timeout(10_000)]),
      });
      if (!res.ok) return null;

      const parsed = this.parseCsv(await res.text());
      if (!parsed) return null;

      const now = Date.now();
      localStorage.setItem(STORAGE_RATES, JSON.stringify(parsed));
      localStorage.setItem(STORAGE_UPDATED, String(now));
      return { rates: { EUR: 1, ...parsed }, updated: now };
    } catch {
      return null;
    }
  }

  // CSV format: KEY,FREQ,CURRENCY,CURRENCY_DENOM,EXR_TYPE,EXR_SUFFIX,TIME_PERIOD,OBS_VALUE
  private parseCsv(csv: string): Record<string, number> | null {
    const result: Record<string, number> = {};
    const lines = csv.trim().split('\n').slice(1); // skip header
    for (const line of lines) {
      const cols = line.split(',');
      const currency = cols[2]?.trim();
      const rate = parseFloat(cols[7]?.trim() ?? '');
      if (currency && !isNaN(rate) && rate > 0) {
        result[currency] = rate;
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  }
}
