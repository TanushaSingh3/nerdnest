export default function Pill ({ children }) {
    return ( <span className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-50 to-emerald-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-100">
        {children}
      </span>)
} ;