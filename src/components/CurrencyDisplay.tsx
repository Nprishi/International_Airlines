import React, { useState, useEffect } from 'react';
import { convertCurrency, formatCurrency, getCurrencySymbol } from '../utils/currencyConverter';
import { RefreshCw } from 'lucide-react';

interface CurrencyDisplayProps {
  amount: number;
  baseCurrency?: 'USD' | 'NPR' | 'EUR' | 'GBP' | 'JPY';
  showBoth?: boolean;
  className?: string;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  baseCurrency = 'USD', 
  showBoth = true,
  className = '' 
}) => {
  const [nprAmount, setNprAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNprAmount = async () => {
    if (baseCurrency === 'NPR') {
      setNprAmount(amount);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const converted = await convertCurrency(amount, baseCurrency, 'NPR');
      setNprAmount(converted);
    } catch (err) {
      setError('Failed to fetch exchange rate');
      console.error('Currency conversion error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNprAmount();
  }, [amount, baseCurrency]);

  const handleRefresh = () => {
    fetchNprAmount();
  };

  if (!showBoth) {
    return (
      <span className={className}>
        {formatCurrency(amount, baseCurrency)}
      </span>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center space-x-2">
        <span className="text-lg font-bold">
          {formatCurrency(amount, baseCurrency)}
        </span>
        {baseCurrency !== 'NPR' && (
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh exchange rate"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
      
      {baseCurrency !== 'NPR' && (
        <div className="text-sm text-gray-600">
          {isLoading ? (
            <span className="flex items-center">
              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
              Converting...
            </span>
          ) : error ? (
            <span className="text-red-500">{error}</span>
          ) : nprAmount !== null ? (
            <span>≈ {formatCurrency(nprAmount, 'NPR')}</span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default CurrencyDisplay;