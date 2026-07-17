export default function AboutIllustration() {
  return (
    <svg
      viewBox="0 0 420 380"
      className="mx-auto w-full max-w-[420px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="210" cy="345" rx="150" ry="20" fill="#e4e4e8" />

      <rect x="40" y="220" width="60" height="110" rx="14" fill="#39079e" />
      <rect x="120" y="170" width="60" height="160" rx="14" fill="#5a1fc0" />
      <rect x="200" y="120" width="60" height="210" rx="14" fill="#39079e" />
      <rect x="280" y="60" width="60" height="270" rx="14" fill="#5a1fc0" />

      <path
        d="M55 210 L135 155 L215 105 L310 45"
        stroke="#ffb506"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="55" cy="210" r="8" fill="#ffb506" />
      <circle cx="135" cy="155" r="8" fill="#ffb506" />
      <circle cx="215" cy="105" r="8" fill="#ffb506" />
      <circle cx="310" cy="45" r="8" fill="#ffb506" />

      <circle cx="330" cy="60" r="46" fill="#FFD071" />
      <circle cx="330" cy="60" r="46" fill="#FFE840" fillOpacity="0.6" />
      <circle cx="330" cy="60" r="34" fill="none" stroke="#FF9D4D" strokeWidth="4" />
      <text
        x="330"
        y="72"
        textAnchor="middle"
        fontSize="34"
        fontWeight="700"
        fill="#FF9D4D"
        fontFamily="var(--font-montserrat), Arial, sans-serif"
      >
        B
      </text>
    </svg>
  );
}
