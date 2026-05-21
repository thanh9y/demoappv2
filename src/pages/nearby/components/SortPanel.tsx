import React from 'react';
import {Box, Text} from 'zmp-ui';

import type {SortOption} from '@/types/rsitem';

import {sortLabels} from '../sort';
import {sortOptions} from '../constants';

type SortPanelProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
  onClose: () => void;
};

export default function SortPanel({
  value,
  onChange,
  onClose,
}: SortPanelProps) {
  return (
    <Box className="sheet-backdrop">
      <Box className="sort-sheet">
        <Box className="sheet-header">
          <Text className="sheet-title">Sort Properties</Text>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </Box>

        {sortOptions.map(option => (
          <button
            type="button"
            key={option}
            className={`sort-option ${value === option ? 'active' : ''}`}
            onClick={() => onChange(option)}>
            {sortLabels[option]}
          </button>
        ))}
      </Box>
    </Box>
  );
}