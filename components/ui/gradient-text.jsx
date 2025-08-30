export default function GradientText({ children }) {
    return(<span className="bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
        {children}
      </span>)
};