import styles from "./WindDirectionArrow.module.css";

interface WindDirectionArrowProps {
  direction: number;
  size?: number;
  className?: string;
  color?: string;
}

export default function WindDirectionArrow({
  direction,
  size = 24,
  className = "",
  color = "#000000",
}: WindDirectionArrowProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={`${styles.windArrow} transition-transform duration-200 ease-in-out`}
        style={{
          transform: `rotate(${direction}deg)`, // No rotation offset needed
          transformOrigin: "center",
        }}
        aria-label={`Wind direction: ${direction}°`}
      >
        {/* Gradient for the arrow head */}
        <defs>
          <linearGradient id="windArrow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>

        {/* Arrow head */}
        <path
          d="M12 22L8 12L12 14L16 12L12 22Z"
          fill={color}
        />
        {/* Arrow shaft */}
        <line
          x1="12"
          y1="14"
          x2="12"
          y2="2"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
