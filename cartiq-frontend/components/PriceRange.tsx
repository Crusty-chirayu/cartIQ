import React, { useState } from "react";
import clsx from "clsx";

interface PriceRangeProps {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
}

const PriceRange: React.FC<PriceRangeProps> = ({
  minPrice,
  maxPrice,
  onPriceChange,
}) => {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  const handleMinChange = (value: number) => {
    if (value <= localMax) {
      setLocalMin(value);
      onPriceChange(value, localMax);
    }
  };

  const handleMaxChange = (value: number) => {
    if (value >= localMin) {
      setLocalMax(value);
      onPriceChange(localMin, value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Min Price: ₹{localMin}
        </label>
        <input
          type="range"
          min={0}
          max={maxPrice}
          value={localMin}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Max Price: ₹{localMax}
        </label>
        <input
          type="range"
          min={0}
          max={maxPrice}
          value={localMax}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="pt-2 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          ₹{localMin} - ₹{localMax}
        </p>
      </div>
    </div>
  );
};

export default PriceRange;
