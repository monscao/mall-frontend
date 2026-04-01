import { useEffect, useMemo, useRef, useState } from "react";

export function SortDropdown({ onChange, options, value }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value) || options[0];
  }, [options, value]);

  return (
    <div className={`sort-dropdown ${open ? "is-open" : ""}`} ref={rootRef}>
      <span className="sort-dropdown-label">排序</span>
      <button
        aria-expanded={open}
        className="sort-dropdown-trigger"
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <strong className="sort-dropdown-value">{selectedOption?.label}</strong>
        <span className="sort-dropdown-arrow">⌄</span>
      </button>

      {open ? (
        <div className="sort-dropdown-menu">
          {options.map((option) => (
            <button
              className={`sort-dropdown-option ${option.value === value ? "is-selected" : ""}`}
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>
              {option.value === value ? <span>✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
