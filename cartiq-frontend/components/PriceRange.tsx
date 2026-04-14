import React, { useState, useEffect } from "react";

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

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onPriceChange(localMin, localMax);
    }, 300);

    return () => clearTimeout(timeout);
  }, [localMin, localMax]);

  return (
    <div className="space-y-4">
      <div>
        <label>Min Price: ₹{localMin}</label>
        <input
          type="range"
          min={0}
          max={100000}
          value={localMin}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val <= localMax) setLocalMin(val);
          }}
          className="w-full"
        />
      </div>

      <div>
        <label>Max Price: ₹{localMax}</label>
        <input
          type="range"
          min={0}
          max={100000}
          value={localMax}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= localMin) setLocalMax(val);
          }}
          className="w-full"
        />
      </div>

      <p>₹{localMin} - ₹{localMax}</p>
    </div>
  );
};

export default PriceRange;