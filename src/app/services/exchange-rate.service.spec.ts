import { TestBed } from '@angular/core/testing';
import { ExchangeRateService } from './exchange-rate.service';

const CSV = [
  'KEY,FREQ,CURRENCY,CURRENCY_DENOM,EXR_TYPE,EXR_SUFFIX,TIME_PERIOD,OBS_VALUE',
  'EXR.D.USD.EUR.SP00.A,D,USD,EUR,SP00,A,2026-10-20,1.2',
  'EXR.D.CZK.EUR.SP00.A,D,CZK,EUR,SP00,A,2026-10-20,24.5',
].join('\n');

async function settle(): Promise<void> {
  TestBed.tick();
  await new Promise((resolve) => setTimeout(resolve));
  TestBed.tick();
}

describe('ExchangeRateService', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('uses fetched rates and caches them', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(CSV)));
    const service = TestBed.inject(ExchangeRateService);
    await settle();

    expect(service.rates()).toEqual({ EUR: 1, USD: 1.2, CZK: 24.5 });
    expect(service.lastUpdated()).not.toBeNull();
    expect(JSON.parse(localStorage.getItem('ratesMap')!)).toEqual({ USD: 1.2, CZK: 24.5 });
  });

  it('keeps cached rates when the fetch fails', async () => {
    localStorage.setItem('ratesMap', JSON.stringify({ USD: 1.1 }));
    localStorage.setItem('lastUpdated', '123');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    const service = TestBed.inject(ExchangeRateService);
    await settle();

    expect(service.rates()).toEqual({ EUR: 1, USD: 1.1 });
    expect(service.lastUpdated()).toBe(123);
  });

  it('falls back to EUR only without a cache or network', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })));
    const service = TestBed.inject(ExchangeRateService);
    await settle();

    expect(service.rates()).toEqual({ EUR: 1 });
    expect(service.lastUpdated()).toBeNull();
  });
});
