import React, { useState, useEffect, useRef } from 'react';
import type { CasteDto } from '../features/master/caste/api/casteApi';

interface CasteAutocompleteProps {
  value: string;
  onChange: (casteName: string, categoryCode?: string) => void;
  castes: CasteDto[];
  hasError?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export const CasteAutocomplete: React.FC<CasteAutocompleteProps> = ({
  value,
  onChange,
  castes,
  hasError,
  placeholder = 'Type to search caste...',
  disabled = false,
}) => {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Filter castes by query (English only)
  const filteredCastes = query.trim()
    ? castes.filter((c) => {
        const name = (c.casteName || c.name || '').toLowerCase();
        return name.includes(query.trim().toLowerCase());
      })
    : castes;

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (caste: CasteDto) => {
    const selectedName = caste.casteName || caste.name || '';
    setQuery(selectedName);
    onChange(selectedName, caste.categoryCode);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    setHighlightedIndex(-1);
    // User can type free text even if not in master list
    onChange(val, undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredCastes.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCastes.length - 1
      );
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && filteredCastes[highlightedIndex]) {
        e.preventDefault();
        handleSelect(filteredCastes[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    onChange('', undefined);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          className={hasError ? 'input-error' : ''}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
          style={{
            width: '100%',
            paddingRight: query ? '54px' : '30px',
          }}
        />
        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '28px',
              background: 'none',
              border: 'none',
              color: '#a0aec0',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '0 4px',
            }}
            title="Clear"
          >
            ×
          </button>
        )}
        <i
          className="ti ti-search"
          style={{
            position: 'absolute',
            right: '10px',
            color: '#a0aec0',
            pointerEvents: 'none',
            fontSize: '14px',
          }}
        />
      </div>

      {isOpen && !disabled && filteredCastes.length > 0 && (
        <ul
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            maxHeight: '220px',
            overflowY: 'auto',
            background: '#ffffff',
            border: '1px solid #cbd5e0',
            borderRadius: '6px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
            zIndex: 1050,
            padding: '4px 0',
            margin: 0,
            listStyle: 'none',
          }}
        >
          {filteredCastes.map((c, idx) => {
            const isHighlighted = idx === highlightedIndex;
            const displayName = c.casteName || c.name;
            return (
              <li
                key={c.id || c.casteId || idx}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(c);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '13.5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: isHighlighted ? '#edf2f7' : 'transparent',
                  color: '#2d3748',
                }}
              >
                <span style={{ fontWeight: 500 }}>{displayName}</span>
                {c.categoryCode && (
                  <span
                    style={{
                      fontSize: '11px',
                      background: '#ebf8ff',
                      color: '#2b6cb0',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}
                  >
                    {c.categoryCode}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
