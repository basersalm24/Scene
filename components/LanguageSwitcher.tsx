import React from 'react';
import { useTranslations } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useTranslations();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'ar', name: 'العربية' },
  ];

  return (
    <select
      value={locale}
      onChange={handleLanguageChange}
      className="bg-slate-700/50 text-slate-300 border border-slate-700 rounded-md py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      aria-label="Select language"
    >
      {languages.map(({ code, name }) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
};
