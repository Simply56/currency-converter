import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConverterStateService } from './converter-state.service';
import { ExchangeRateService } from './exchange-rate.service';

describe('ConverterStateService', () => {
  const rates = signal<Record<string, number>>({ EUR: 1, CZK: 25, USD: 1.1 });

  function create(): ConverterStateService {
    localStorage.clear();
    localStorage.setItem('upperCurrency', 'CZK');
    localStorage.setItem('lowerCurrency', 'EUR');
    localStorage.setItem('activeField', 'upper');
    rates.set({ EUR: 1, CZK: 25, USD: 1.1 });
    TestBed.configureTestingModule({
      providers: [{ provide: ExchangeRateService, useValue: { rates } }],
    });
    const state = TestBed.inject(ConverterStateService);
    TestBed.tick();
    return state;
  }

  function press(state: ConverterStateService, ...keys: string[]): void {
    for (const key of keys) state.handleKey(key);
    TestBed.tick();
  }

  it('converts the active field into the other field', () => {
    const state = create();
    press(state, '5', '0');
    expect(state.upperValue()).toBe('50');
    expect(state.lowerValue()).toBe('2.00');
  });

  it('evaluates expressions', () => {
    const state = create();
    press(state, '1', '0', '+', '4', '0');
    expect(state.lowerValue()).toBe('2.00');
  });

  it('leaves the other field unchanged for an incomplete expression', () => {
    const state = create();
    press(state, '5', '0');
    press(state, '+');
    expect(state.upperValue()).toBe('50+');
    expect(state.lowerValue()).toBe('2.00');
  });

  it('clears the other field when the active field is emptied', () => {
    const state = create();
    press(state, '5', '0', 'del');
    expect(state.lowerValue()).toBe('0.20');
    press(state, 'del');
    expect(state.upperValue()).toBe('');
    expect(state.lowerValue()).toBe('');
  });

  it('reconverts when rates or currencies change', () => {
    const state = create();
    press(state, '5', '0');
    rates.set({ EUR: 1, CZK: 50, USD: 1.1 });
    TestBed.tick();
    expect(state.lowerValue()).toBe('1.00');
    state.setLowerCurrency('USD');
    TestBed.tick();
    expect(state.lowerValue()).toBe('1.10');
  });

  it('keeps the converted value as the new input when switching the active field', () => {
    const state = create();
    press(state, '5', '0');
    state.setActiveField('lower');
    TestBed.tick();
    expect(state.lowerValue()).toBe('2.00');
    expect(state.upperValue()).toBe('50.00');
    press(state, '5');
    expect(state.lowerValue()).toBe('2.005');
    expect(state.upperValue()).toBe('50.13');
  });

  it('clear empties both fields', () => {
    const state = create();
    press(state, '5', 'clear');
    expect(state.upperValue()).toBe('');
    expect(state.lowerValue()).toBe('');
  });

  it('ANS appends the last answer', () => {
    const state = create();
    press(state, '2', '+', '3', '=');
    expect(state.upperValue()).toBe('5');
    press(state, '+', 'ANS');
    expect(state.upperValue()).toBe('5+5');
  });

  it('ignores consecutive operators and duplicate decimal points', () => {
    const state = create();
    press(state, '1', '+', '×', '.', '5', '.');
    expect(state.upperValue()).toBe('1+.5');
  });
});
