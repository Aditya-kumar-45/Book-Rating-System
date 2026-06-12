import React, { useState } from 'react';

export default function RatingStars({
  value = 0,
  max = 5,
  interactive = false,
  onChange,
  size = '1.1rem',
}) {
  const [hoverValue, setHoverValue] = useState(0);
  const [pulseStar, setPulseStar] = useState(null);

  const handleClick = (starValue) => {
    if (!interactive || !onChange) return;
    setPulseStar(starValue);
    onChange(starValue);
    setTimeout(() => setPulseStar(null), 300);
  };

  const displayValue = interactive && hoverValue > 0 ? hoverValue : value;

  const renderStar = (index) => {
    const starValue = index + 1;
    const filled = displayValue >= starValue;
    const halfFilled = !filled && displayValue >= starValue - 0.5;
    const isPulsing = pulseStar === starValue;

    return (
      <span
        key={index}
        className={`star ${filled ? 'filled' : ''} ${halfFilled ? 'half' : ''} ${interactive ? 'interactive' : ''} ${isPulsing ? 'pulse' : ''}`}
        style={{ fontSize: size }}
        onClick={() => handleClick(starValue)}
        onMouseEnter={() => interactive && setHoverValue(starValue)}
        onMouseLeave={() => interactive && setHoverValue(0)}
        role={interactive ? 'button' : 'presentation'}
        aria-label={interactive ? `Rate ${starValue} star${starValue > 1 ? 's' : ''}` : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={(e) => {
          if (interactive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick(starValue);
          }
        }}
      >
        {filled ? '★' : halfFilled ? '★' : '☆'}
      </span>
    );
  };

  return (
    <div className="stars" aria-label={`Rating: ${value} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => renderStar(i))}
    </div>
  );
}
