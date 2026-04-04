export function BrandMark({ className = "", title = "MONSCAO" }) {
  const classes = ["brand-mark-svg", className].filter(Boolean).join(" ");

  return (
    <svg
      aria-label={title}
      className={classes}
      fill="none"
      role="img"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="currentColor" height="11" rx="2.5" width="8" x="7" y="10" />
      <rect fill="currentColor" height="11" rx="2.5" width="8" x="33" y="10" />
      <rect fill="currentColor" height="28" rx="2.5" width="8" x="7" y="10" />
      <rect fill="currentColor" height="28" rx="2.5" width="8" x="33" y="10" />
      <path
        d="M15 14.5C15 12.8431 16.3431 11.5 18 11.5H19.0354C20.1831 11.5 21.2332 12.1482 21.7489 13.1747L24 17.6569L26.2511 13.1747C26.7668 12.1482 27.8169 11.5 28.9646 11.5H30C31.6569 11.5 33 12.8431 33 14.5V18.0682C33 18.5334 32.8918 18.9921 32.684 19.4083L26.684 31.4321C26.1759 32.4502 25.1354 33.0938 23.9975 33.0938C22.8596 33.0938 21.8191 32.4502 21.311 31.4321L15.311 19.4083C15.1032 18.9921 14.995 18.5334 14.995 18.0682L15 14.5Z"
        fill="currentColor"
      />
      <path
        d="M20.25 24L24 31.5L27.75 24"
        stroke="#0B1220"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
