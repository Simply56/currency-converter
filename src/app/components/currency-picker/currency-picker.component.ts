import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { Currency } from '../../models/currency';

@Component({
  selector: 'app-currency-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './currency-picker.component.css',
  host: {
    '(document:keydown.escape)': 'close()',
  },
  template: `
    <div class="overlay">
      <div class="card" role="dialog" aria-modal="true" aria-label="Select currency">
        <div class="handle" aria-hidden="true"></div>

        <div class="card-header">
          <span class="card-title">Select currency</span>
          <button class="close-btn" type="button" (click)="close()" aria-label="Close">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="search-wrapper">
          <svg
            class="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            #searchInput
            class="search-input"
            type="search"
            placeholder="Search code, name, or symbol…"
            autocomplete="off"
            spellcheck="false"
            [value]="search()"
            (input)="onSearchInput($event)"
            aria-label="Search currencies"
          />
          @if (search()) {
            <button
              class="search-clear"
              type="button"
              (click)="clearSearch()"
              aria-label="Clear search"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          }
        </div>

        <div class="currency-list" role="listbox" aria-label="Currencies">
          @for (c of filtered(); track c.code) {
            <button
              class="currency-item"
              [class.currency-item--selected]="c.code === selected()"
              role="option"
              [attr.aria-selected]="c.code === selected()"
              type="button"
              (click)="select(c.code)"
            >
              <span class="item-flag" aria-hidden="true">{{ c.flag }}</span>
              <span class="item-details">
                <span class="item-code">{{ c.code }}</span>
                <span class="item-name">{{ c.name }}</span>
              </span>
              <span class="item-symbol" aria-hidden="true">{{ c.symbol }}</span>
              @if (c.code === selected()) {
                <svg
                  class="item-check"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
            </button>
          } @empty {
            <p class="no-results">No results for "{{ search() }}"</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class CurrencyPickerComponent {
  currencies = input.required<Currency[]>();
  selected = input.required<string>();

  picked = output<string>();
  dismissed = output<void>();

  search = signal('');

  private readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.currencies();
    return this.currencies().filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q),
    );
  });

  constructor() {
    afterNextRender(() => {
      this.searchInputRef()?.nativeElement.focus();
    });
  }

  select(code: string): void {
    this.picked.emit(code);
    this.dismissed.emit();
  }

  close(): void {
    this.dismissed.emit();
  }

  onSearchInput(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.search.set('');
    this.searchInputRef()?.nativeElement.focus();
  }
}
