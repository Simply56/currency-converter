import { Injectable, signal } from '@angular/core';

const CURRENCIES = ['CZK', 'GBP', 'USD', 'CAD', 'HUF', 'AUD', 'CHF', 'JPY', 'CNY', 'HKD', 'SGD'];
const ECB_URL =
  `https://data-api.ecb.europa.eu/service/data/EXR/D.${CURRENCIES.join('+')}.EUR.SP00.A` +
  `?format=csvdata&lastNObservations=1&detail=dataonly`;

const STORAGE_RATES = 'ratesMap';
const STORAGE_UPDATED = 'lastUpdated';

@Injectable({ providedIn: 'root' })
export class ExchangeRateService {
  readonly rates = signal<Record<string, number>>({ EUR: 1 });
  readonly lastUpdated = signal<number | null>(null);

  constructor() {
    this.loadFromCache();
    this.fetchRates();
  }

  private loadFromCache(): void {
    const raw = localStorage.getItem(STORAGE_RATES);
    const ts = localStorage.getItem(STORAGE_UPDATED);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Record<string, number>;
        this.rates.set({ EUR: 1, ...parsed });
      } catch {
        // ignore corrupt cache
      }
    }
    if (ts) {
      this.lastUpdated.set(Number(ts));
    }
  }

  async fetchRates(): Promise<void> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(ECB_URL, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) return;

      const text = await res.text();
      const parsed = this.parseCsv(text);
      if (!parsed) return;

      const now = Date.now();
      localStorage.setItem(STORAGE_RATES, JSON.stringify(parsed));
      localStorage.setItem(STORAGE_UPDATED, String(now));
      this.rates.set({ EUR: 1, ...parsed });
      this.lastUpdated.set(now);
    } catch {
      // offline or timeout — cached rates remain
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
