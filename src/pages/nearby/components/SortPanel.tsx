import React from 'react';
import {Box, Text} from 'zmp-ui';

import type {SortOption} from '@/types/rsitem';

import {sortOptions} from '../constants';
import {sortLabels} from '../sort';

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
    <Box className="sheet-backdrop" onClick={onClose}>
      <Box className="sort-sheet" onClick={event => event.stopPropagation()}>
        <Box className="sheet-header">
          <Text className="sheet-title">Sắp xếp</Text>

          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </Box>

        <Box className="sheet-content">
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
    </Box>
  );
}
