export default function Card({ children, className = "" }) {
  return <div className={`glass-card rounded-2xl p-5 ${className}`}>{children}</div>;
}

