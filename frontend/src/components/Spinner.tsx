import { CSSProperties } from "react";

interface SpinnerProps {
  size?: number;
  label?: string;
}

export function Spinner({ size = 36, label = "Loading..." }: SpinnerProps) {
  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
  };

  const ringStyle: CSSProperties = {
    width: size,
    height: size,
    border: "3px solid rgba(37, 99, 235, 0.15)",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  };

  return (
    <div style={containerStyle} role="status" aria-label={label}>
      <div style={ringStyle} />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
}
