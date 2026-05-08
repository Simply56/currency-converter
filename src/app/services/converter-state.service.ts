import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { evaluate } from '../utils/expression';
import { ExchangeRateService } from './exchange-rate.service';

type ActiveField = 'upper' | 'lower';

@Injectable({ providedIn: 'root' })
export class ConverterStateService {
  private readonly rateService = inject(ExchangeRateService);

  readonly upperCurrency = signal<string>(localStorage.getItem('upperCurrency') ?? 'CZK');
  readonly lowerCurrency = signal<string>(localStorage.getItem('lowerCurrency') ?? 'EUR');
  readonly activeField = signal<ActiveField>(
    (localStorage.getItem('activeField') as ActiveField) ?? 'upper',
  );

  private readonly _upperValue = signal('');
  private readonly _lowerValue = signal('');
  readonly upperValue = this._upperValue.asReadonly();
  readonly lowerValue = this._lowerValue.asReadonly();

  private lastAnswer: number | null = null;

  // Only reads the active field's value to avoid circular effects.
  private readonly conversionSource = computed(() => {
    const active = this.activeField();
    return {
      active,
      value: active === 'upper' ? this._upperValue() : this._lowerValue(),
      activeCurrency: active === 'upper' ? this.upperCurrency() : this.lowerCurrency(),
      otherCurrency: active === 'upper' ? this.lowerCurrency() : this.upperCurrency(),
    };
  });

  constructor() {
    effect(() => {
      const { active, value, activeCurrency, otherCurrency } = this.conversionSource();
      const rates = this.rateService.rates();

      const setOther =
        active === 'upper'
          ? (v: string) => this._lowerValue.set(v)
          : (v: string) => this._upperValue.set(v);

      if (!value.trim()) {
        setOther('');
        return;
      }

      const num = evaluate(value);
      if (num === null) return;

      const activeRate = rates[activeCurrency] ?? 1;
      const otherRate = rates[otherCurrency] ?? 1;
      setOther(((num * otherRate) / activeRate).toFixed(2));
    });

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

  setActiveField(field: ActiveField): void {
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
    const active = this.activeField();
    const get = () => (active === 'upper' ? this._upperValue() : this._lowerValue());
    const set = (v: string) =>
      active === 'upper' ? this._upperValue.set(v) : this._lowerValue.set(v);
    const current = get();

    if (key === 'del') {
      set(current.slice(0, -1));
      return;
    }

    if (key === 'clear') {
      this._upperValue.set('');
      this._lowerValue.set('');
      return;
    }

    if (key === '=') {
      const result = evaluate(current);
      if (result !== null) {
        this.lastAnswer = result;
        // Avoid trailing zeros for whole numbers
        set(parseFloat(result.toPrecision(12)).toString());
      }
      return;
    }

    if (key === 'ANS') {
      if (this.lastAnswer !== null) {
        set(current + parseFloat(this.lastAnswer.toPrecision(12)).toString());
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
