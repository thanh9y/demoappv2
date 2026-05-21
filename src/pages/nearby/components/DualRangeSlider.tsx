import React from 'react';
import {Box, Text} from 'zmp-ui';

type DualRangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  minValue: number;
  maxValue: number;
  onChange: (minValue: number, maxValue: number) => void;
  formatValue?: (value: number) => string;
};

export default function DualRangeSlider({
  min,
  max,
  step = 1,
  minValue,
  maxValue,
  onChange,
  formatValue = value => String(value),
}: DualRangeSliderProps) {
  const safeMinValue = Math.max(min, Math.min(minValue, maxValue));
  const safeMaxValue = Math.min(max, Math.max(maxValue, minValue));

  const leftPercent = ((safeMinValue - min) / (max - min)) * 100;
  const rightPercent = ((safeMaxValue - min) / (max - min)) * 100;

  return (
    <Box className="dual-range-slider">
      <Box className="dual-range-track">
        <Box className="dual-range-track-base" />
        <Box
          className="dual-range-track-active"
          style={{
            left: `${leftPercent}%`,
            width: `${rightPercent - leftPercent}%`,
          }}
        />
      </Box>

      <input
        aria-label="Minimum value"
        title="Minimum value"
        className="dual-range-input dual-range-input-min"
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeMinValue}
        onChange={event => {
          const newMin = Number(event.target.value);
          onChange(Math.min(newMin, safeMaxValue), safeMaxValue);
        }}
      />

      <input
        aria-label="Maximum value"
        title="Maximum value"
        className="dual-range-input dual-range-input-max"
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeMaxValue}
        onChange={event => {
          const newMax = Number(event.target.value);
          onChange(safeMinValue, Math.max(newMax, safeMinValue));
        }}
      />

      <Box className="dual-range-values">
        <Text>{formatValue(safeMinValue)}</Text>
        <Text>{formatValue(safeMaxValue)}</Text>
      </Box>
    </Box>
  );
}