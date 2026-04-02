export function AppLink({ className, navigate, onClick, to, children }) {
  return (
    <a
      className={className}
      href={to}
      onClick={(event) => {
        event.preventDefault();
        if (onClick) {
          onClick(event);
        }
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
