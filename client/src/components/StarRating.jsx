import { useState } from 'react';

const StarRating = ({ rating = 0, onRate, size = '1.1rem', interactive = false }) => {
  const [hovered, setHovered] = useState(0);

  const displayRating = hovered || rating;

  return (
    <div
      className={`stars ${interactive ? 'star-interactive' : ''}`}
      onMouseLeave={() => interactive && setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= displayRating ? 'filled' : ''}`}
          style={{ fontSize: size, cursor: interactive ? 'pointer' : 'default' }}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
