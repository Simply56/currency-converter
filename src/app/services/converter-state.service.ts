import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { evaluate } from '../utils/expression';
import { ExchangeRateService } from './exchange-rate.service';

const fmt = (n: number) => parseFloat(n.toPrecision(12)).toString();

type ActiveField = 'upper' | 'lower';

@Injectable({ providedIn: 'root' })
export class ConverterStateService {
  private readonly rateService = inject(ExchangeRateService);

  readonly upperCurrency = signal<string>(localStorage.getItem('upperCurrency') ?? 'CZK');
  readonly lowerCurrency = signal<string>(localStorage.getItem('lowerCurrency') ?? 'EUR');
  readonly activeField = signal<ActiveField>(
    (localStorage.getItem('activeField') as ActiveField) ?? 'upper',
  );

  // The user only ever types into the active field; the other field is derived from it.
  private readonly activeText = signal('');
  // Last text that evaluated (or was empty), so an invalid or incomplete expression keeps the
  // other field's previous value.
  private readonly validText = signal('');
  private readonly otherText = computed(() => {
    const text = this.validText();
    if (!text.trim()) return '';

    const num = evaluate(text);
    if (num === null) return '';

    const rates = this.rateService.rates();
    const activeRate = rates[this.activeCurrencyCode()] ?? 1;
    const otherRate = rates[this.otherCurrencyCode()] ?? 1;
    return ((num * otherRate) / activeRate).toFixed(2);
  });

  readonly upperValue = computed(() =>
    this.activeField() === 'upper' ? this.activeText() : this.otherText(),
  );
  readonly lowerValue = computed(() =>
    this.activeField() === 'lower' ? this.activeText() : this.otherText(),
  );

  private lastAnswer: number | null = null;

  private readonly activeCurrencyCode = computed(() =>
    this.activeField() === 'upper' ? this.upperCurrency() : this.lowerCurrency(),
  );
  private readonly otherCurrencyCode = computed(() =>
    this.activeField() === 'upper' ? this.lowerCurrency() : this.upperCurrency(),
  );

  constructor() {
    effect(() => {
      localStorage.setItem('upperCurrency', this.upperCurrency());
    });
    effect(() => {
      localStorage.setItem('lowerCurrency', this.lowerCurrency());
    });
    effect(() => {
      localStorage.setItem('activeField', this.activeField());
    });
  }

  private setText(text: string): void {
    this.activeText.set(text);
    if (!text.trim() || evaluate(text) !== null) this.validText.set(text);
  }

  setActiveField(field: ActiveField): void {
    if (field === this.activeField()) return;
    // The converted value becomes the text the user continues editing.
    this.setText(this.otherText());
    this.activeField.set(field);
  }

  setUpperCurrency(code: string): void {
    this.upperCurrency.set(code);
  }

  setLowerCurrency(code: string): void {
    this.lowerCurrency.set(code);
  }

  swapCurrencies(): void {
    const upper = this.upperCurrency();
    this.upperCurrency.set(this.lowerCurrency());
    this.lowerCurrency.set(upper);
  }

  handleKey(key: string): void {
    const set = (v: string) => this.setText(v);
    const current = this.activeText();

    if (key === 'del') {
      set(current.slice(0, -1));
      return;
    }

    if (key === 'clear') {
      set('');
      return;
    }

    if (key === '=') {
      const result = evaluate(current);
      if (result !== null) {
        this.lastAnswer = result;
        set(fmt(result));
      }
      return;
    }

    if (key === 'ANS') {
      if (this.lastAnswer !== null) {
        set(current + fmt(this.lastAnswer));
      }
      return;
    }

    // Prevent consecutive duplicate operators
    const operators = ['+', '-', '×', '÷'];
    if (operators.includes(key) && operators.includes(current.slice(-1))) {
      return;
    }

    if (key === '.') {
      const lastSegment = current.split(/[+\-×÷]/).pop() ?? '';
      if (lastSegment.includes('.')) return;
    }

    set(current + key);
  }
}
