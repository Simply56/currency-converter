export interface Currency {
  code: string;
  flag: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'AUD', flag: '🇦🇺', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'BRL', flag: '🇧🇷', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'CAD', flag: '🇨🇦', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', flag: '🇨🇭', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', flag: '🇨🇳', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'CZK', flag: '🇨🇿', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'DKK', flag: '🇩🇰', symbol: 'kr', name: 'Danish Krone' },
  { code: 'EUR', flag: '🇪🇺', symbol: '€', name: 'Euro' },
  { code: 'GBP', flag: '🇬🇧', symbol: '£', name: 'British Pound' },
  { code: 'HKD', flag: '🇭🇰', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'HUF', flag: '🇭🇺', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'IDR', flag: '🇮🇩', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'ILS', flag: '🇮🇱', symbol: '₪', name: 'Israeli New Shekel' },
  { code: 'INR', flag: '🇮🇳', symbol: '₹', name: 'Indian Rupee' },
  { code: 'ISK', flag: '🇮🇸', symbol: 'kr', name: 'Icelandic Króna' },
  { code: 'JPY', flag: '🇯🇵', symbol: '¥', name: 'Japanese Yen' },
  { code: 'KRW', flag: '🇰🇷', symbol: '₩', name: 'South Korean Won' },
  { code: 'MXN', flag: '🇲🇽', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'MYR', flag: '🇲🇾', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'NOK', flag: '🇳🇴', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'NZD', flag: '🇳🇿', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'PHP', flag: '🇵🇭', symbol: '₱', name: 'Philippine Peso' },
  { code: 'PLN', flag: '🇵🇱', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'RON', flag: '🇷🇴', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'SEK', flag: '🇸🇪', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'SGD', flag: '🇸🇬', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'THB', flag: '🇹🇭', symbol: '฿', name: 'Thai Baht' },
  { code: 'TRY', flag: '🇹🇷', symbol: '₺', name: 'Turkish Lira' },
  { code: 'USD', flag: '🇺🇸', symbol: '$', name: 'US Dollar' },
  { code: 'ZAR', flag: '🇿🇦', symbol: 'R', name: 'South African Rand' },
];
