import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  value = 0,
  onChange = null,
  readOnly = false,
  size = 'md',
  showText = false,
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const currentDisplay = hoverValue || value || 0;

  return (
    <div className="inline-flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= currentDisplay;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange && onChange(star)}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            onMouseLeave={() => !readOnly && setHoverValue(0)}
            className={`transition-all duration-150 focus:outline-none ${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
            title={`${star} Star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`${starSizes[size] || starSizes.md} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400 filter drop-shadow-sm'
                  : 'fill-slate-100 text-slate-300'
              }`}
            />
          </button>
        );
      })}
      {showText && (
        <span className="ml-2 text-xs font-semibold text-slate-600">
          {value ? `${value}.0` : 'No rating'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
