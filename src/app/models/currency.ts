export interface Currency {
  code: string;
  flag: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'CZK', flag: '🇨🇿', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'EUR', flag: '🇪🇺', symbol: '€', name: 'Euro' },
  { code: 'GBP', flag: '🇬🇧', symbol: '£', name: 'British Pound' },
  { code: 'USD', flag: '🇺🇸', symbol: '$', name: 'US Dollar' },
  { code: 'CAD', flag: '🇨🇦', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'HUF', flag: '🇭🇺', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'AUD', flag: '🇦🇺', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', flag: '🇨🇭', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'JPY', flag: '🇯🇵', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', flag: '🇨🇳', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'HKD', flag: '🇭🇰', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'SGD', flag: '🇸🇬', symbol: 'S$', name: 'Singapore Dollar' },
];
