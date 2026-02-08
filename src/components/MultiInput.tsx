'use client';

import { useState } from 'react';

interface Props {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  minItems?: number;
}

/**
 * Reusable multi-input component.
 * Shows a list of text inputs with add/remove controls.
 */
export default function MultiInput({
  values,
  onChange,
  placeholder = '',
  maxItems = 5,
  minItems = 1,
}: Props) {
  const handleChange = (index: number, value: string) => {
    const updated = [...values];
    updated[index] = value;
    onChange(updated);
  };

  const addItem = () => {
    if (values.length < maxItems) {
      onChange([...values, '']);
    }
  };

  const removeItem = (index: number) => {
    if (values.length > minItems) {
      const updated = values.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  return (
    <div className="space-y-2">
      {values.map((val, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={val}
            onChange={(e) => handleChange(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-honey-300 focus:border-honey-300 transition-all"
          />
          {values.length > minItems && (
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      {values.length < maxItems && (
        <button
          type="button"
          onClick={addItem}
          className="text-sm text-honey-600 hover:text-honey-700 font-medium flex items-center gap-1 px-1 py-1 transition-all"
        >
          <span className="text-base leading-none">+</span> Hinzufügen
        </button>
      )}
    </div>
  );
}
