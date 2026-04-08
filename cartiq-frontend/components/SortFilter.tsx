import React from "react";
import clsx from "clsx";

interface SortOption {
  value: string;
  label: string;
}

interface FilterOption {
  id: string;
  label: string;
  value: string;
  checked: boolean;
}

interface SortFilterProps {
  sortOptions: SortOption[];
  currentSort: string;
  onSortChange: (sort: string) => void;
  filters?: {
    [key: string]: FilterOption[];
  };
  onFilterChange?: (filterId: string, value: string) => void;
  onClearFilters?: () => void;
}

const SortFilter: React.FC<SortFilterProps> = ({
  sortOptions,
  currentSort,
  onSortChange,
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const hasActiveFilters = filters
    ? Object.values(filters).some((group) =>
        group.some((f) => f.checked)
      )
    : false;

  return (
    <div className="space-y-6">
      {/* Sort Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Sort By</h3>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded"
            >
              <input
                type="radio"
                name="sort"
                value={option.value}
                checked={currentSort === option.value}
                onChange={() => onSortChange(option.value)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-gray-700 text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Filters Section */}
      {filters && Object.keys(filters).length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-6">
            {Object.entries(filters).map(([category, options]) => (
              <div key={category}>
                <h4 className="font-medium text-gray-900 mb-3 capitalize">
                  {category}
                </h4>
                <div className="space-y-2">
                  {options.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={option.checked}
                        onChange={() =>
                          onFilterChange?.(category, option.value)
                        }
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-gray-700 text-sm">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortFilter;
