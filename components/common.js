export function NavItem({ label, active, onClick }) {
    return (
      <button
        onClick={onClick}
        className={`px-3 py-2 text-sm font-medium transition-colors ${
          active ? "text-sky-600 font-semibold" : "text-slate-600 hover:text-sky-600"
        }`}
      >
        {label}
      </button>
    );
  }
  
  export function Badge({ children }) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
        {children}
      </span>
    );
  }
  