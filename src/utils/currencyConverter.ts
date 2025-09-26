// Currency conversion utilities
export interface ExchangeRates {
  USD: number;
  NPR: number;
  EUR: number;
  GBP: number;
  JPY: number;
}

export interface CurrencyResponse {
  success: boolean;
  rates: ExchangeRates;
  base: string;
  date: string;
}

// Fallback exchange rates (updated periodically)
const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  NPR: 133.25, // 1 USD = 133.25 NPR (approximate)
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50
};

// Cache for exchange rates
let cachedRates: ExchangeRates | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  // Check if we have cached rates that are still valid
  if (cachedRates && Date.now() - lastFetchTime < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    // Try multiple free APIs for exchange rates
    const apis = [
      'https://api.exchangerate-api.com/v4/latest/USD',
      'https://api.fixer.io/latest?base=USD&access_key=free', // Note: requires API key for production
      'https://open.er-api.com/v6/latest/USD'
    ];

    for (const apiUrl of apis) {
      try {
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          
          if (data.rates) {
            const rates: ExchangeRates = {
              USD: 1,
              NPR: data.rates.NPR || FALLBACK_RATES.NPR,
              EUR: data.rates.EUR || FALLBACK_RATES.EUR,
              GBP: data.rates.GBP || FALLBACK_RATES.GBP,
              JPY: data.rates.JPY || FALLBACK_RATES.JPY
            };
            
            cachedRates = rates;
            lastFetchTime = Date.now();
            
            // Store in localStorage for offline use
            localStorage.setItem('exchangeRates', JSON.stringify({
              rates,
              timestamp: lastFetchTime
            }));
            
            return rates;
          }
        }
      } catch (apiError) {
        console.warn(`Failed to fetch from ${apiUrl}:`, apiError);
        continue;
      }
    }
    
    throw new Error('All APIs failed');
  } catch (error) {
    console.warn('Failed to fetch live exchange rates, using fallback:', error);
    
    // Try to get rates from localStorage
    const stored = localStorage.getItem('exchangeRates');
    if (stored) {
      const { rates, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) { // 24 hours
        cachedRates = rates;
        return rates;
      }
    }
    
    // Use fallback rates
    cachedRates = FALLBACK_RATES;
    return FALLBACK_RATES;
  }
};

export const convertCurrency = async (
  amount: number, 
  fromCurrency: keyof ExchangeRates, 
  toCurrency: keyof ExchangeRates
): Promise<number> => {
  if (fromCurrency === toCurrency) return amount;
  
  const rates = await fetchExchangeRates();
  
  // Convert to USD first, then to target currency
  const usdAmount = fromCurrency === 'USD' ? amount : amount / rates[fromCurrency];
  const convertedAmount = toCurrency === 'USD' ? usdAmount : usdAmount * rates[toCurrency];
  
  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
};

export const formatCurrency = (amount: number, currency: keyof ExchangeRates): string => {
  const formatters = {
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    NPR: new Intl.NumberFormat('ne-NP', { style: 'currency', currency: 'NPR' }),
    EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
    GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
    JPY: new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' })
  };
  
  return formatters[currency].format(amount);
};

export const getCurrencySymbol = (currency: keyof ExchangeRates): string => {
  const symbols = {
    USD: '$',
    NPR: 'रू',
    EUR: '€',
    GBP: '£',
    JPY: '¥'
  };
  
  return symbols[currency];
};