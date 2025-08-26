import React, { useEffect } from 'react';
import usePlacesAutocomplete from 'use-places-autocomplete';

function AddressInput({ initialValue = '', onSelect }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({ debounce: 300 });

  useEffect(() => {
    if (initialValue) {
      setValue(initialValue, false);
    }
  }, [initialValue, setValue]);

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = (address) => {
    setValue(address, false);
    clearSuggestions();
    onSelect(address);
  };

  return (
    <div className="relative">
      <input
        value={value}
        onChange={handleInput}
        disabled={!ready}
        autoComplete="new-address"
        placeholder="Start typing your address..."
        className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      />

      {status === 'OK' && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto text-sm">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={() => handleSelect(description)}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-800"
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AddressInput;
