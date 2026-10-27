import React from 'react';
import { useAgency } from '../../context/AgencyContext';
import { CurrencyCode } from '../../types';

interface CurrencySelectorProps {
  className?: string;
  variant?: 'pills' | 'dropdown';
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ className = '', variant = 'pills' }) => {
  const { currentCurrency, setCurrency, data } = useAgency();

  const currencies = data?.currencies?.filter(c => c.enabled) || [
    { code: 'PKR', symbol: 'Rs.', name: 'Pakistani Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'GBP', symbol: '£', name: 'British Pound' }
  ];

  if (variant === 'dropdown') {
    return (
      <select
        value={currentCurrency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        className={`bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl px-2.5 py-2 hover:border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors shadow-sm ${className}`}
        aria-label="Select pricing currency"
      >
        {currencies.map(c => (
          <option key={c.code} value={c.code} className="bg-slate-900 text-slate-200">
            {c.code} ({c.symbol})
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className={`inline-flex items-center p-0.5 bg-slate-900/90 border border-slate-800 rounded-full shadow-inner ${className}`}>
      {currencies.map((curr) => {
        const isActive = currentCurrency === curr.code;
        return (
          <button
            key={curr.code}
            onClick={() => setCurrency(curr.code as CurrencyCode)}
            type="button"
            className={`relative px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title={curr.name}
          >
            <span className="flex items-center gap-1">
              <span className="opacity-75 text-[10px]">{curr.symbol}</span>
              <span>{curr.code}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};
