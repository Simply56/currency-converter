import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CURRENCIES } from './models/currency';
import { ExchangeRateService } from './services/exchange-rate.service';
import { ConverterStateService } from './services/converter-state.service';
import { CurrencyPickerComponent } from './components/currency-picker/currency-picker.component';

const KEYS = [
  'del',
  '(',
  ')',
  '÷',
  '7',
  '8',
  '9',
  '×',
  '4',
  '5',
  '6',
  '-',
  '1',
  '2',
  '3',
  '+',
  'ans',
  '0',
  '.',
  '=',
] as const;

const OPERATOR_KEYS = new Set(['+', '-', '×', '÷', '(', ')', '=']);
const ACCENT_KEYS = new Set(['del', 'ans']);

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPickerComponent],
})
export class App {
  protected readonly rateService = inject(ExchangeRateService);
  protected readonly state = inject(ConverterStateService);

  protected readonly currencies = CURRENCIES;
  protected readonly keys = KEYS;

  protected readonly swapping = signal(false);
  protected readonly upperPickerOpen = signal(false);
  protected readonly lowerPickerOpen = signal(false);

  protected readonly upperCurrencyData = computed(
    () => this.currencies.find((c) => c.code === this.state.upperCurrency())!,
  );
  protected readonly lowerCurrencyData = computed(
    () => this.currencies.find((c) => c.code === this.state.lowerCurrency())!,
  );

  protected readonly updatedLabel = computed(() => {
    const ts = this.rateService.lastUpdated();
    if (ts === null) return 'never updated';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 10) return 'updated just now';
    if (diff < 60) return `updated ${diff} seconds ago`;
    if (diff < 3600) return `updated ${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `updated ${Math.floor(diff / 3600)} hours ago`;
    return `updated ${Math.floor(diff / 86400)} days ago`;
  });

  protected readonly rateLabel = computed(() => {
    const upper = this.state.upperCurrency();
    const lower = this.state.lowerCurrency();
    const rates = this.rateService.rates();
    const upperRate = rates[upper] ?? 1;
    const lowerRate = rates[lower] ?? 1;
    const upperCurrency = this.currencies.find((c) => c.code === upper);
    const lowerCurrency = this.currencies.find((c) => c.code === lower);
    const value = lowerRate / upperRate;
    return `1 ${upperCurrency?.symbol ?? upper} = ${value.toFixed(4).replace(/\.?0+$/, '') || '0'} ${lowerCurrency?.symbol ?? lower}`;
  });

  // Formats the integer part of each number in an expression with thin spaces
  // e.g. "1500+200" → "1 500+200", "1234567.89" → "1 234 567.89"
  protected format(value: string): string {
    return value.replace(
      /(\d+)(\.\d*)?/g,
      (_, int, dec) => int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (dec ?? ''),
    );
  }

  protected keyClass(key: string): string {
    if (OPERATOR_KEYS.has(key)) return 'key key--operator';
    if (ACCENT_KEYS.has(key)) return 'key key--accent';
    return 'key key--digit';
  }

  protected keyLabel(key: string): string {
    if (key === 'del') return '⌫';
    return key;
  }

  protected keyAriaLabel(key: string): string {
    const labels: Record<string, string> = {
      del: 'Delete',
      ans: 'Insert last answer',
      '=': 'Evaluate',
      '÷': 'Divide',
      '×': 'Multiply',
      '(': 'Open parenthesis',
      ')': 'Close parenthesis',
    };
    return labels[key] ?? key;
  }

  protected onFieldKeydown(field: 'upper' | 'lower', event: Event): void {
    event.preventDefault();
    this.state.setActiveField(field);
  }

  protected swap(): void {
    this.state.swapCurrencies();
    this.swapping.set(true);
    setTimeout(() => this.swapping.set(false), 300);
  }

  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private longPressFired = false;

  protected onPointerDown(key: string): void {
    if (key !== 'del') return;
    this.longPressTimer = setTimeout(() => {
      this.state.handleKey('clear');
      this.longPressTimer = null;
      this.longPressFired = true;
    }, 600);
  }

  protected onPointerUp(): void {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  protected onKeyPress(key: string): void {
    if (key === 'del' && this.longPressFired) {
      this.longPressFired = false;
      return;
    }
    this.state.handleKey(key);
  }
}
