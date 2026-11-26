import { useEffect, useState } from "react";

/**
 * GenZ Cursor Follower
 * Features floating aesthetic GenZ sparkles / cyber-star / flame / aura vibes
 * with smooth easing that trails slightly behind the mouse cursor.
 */
export default function GenZCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      const target = e.target;
      setIsPointer(
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a")
      );
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Smooth trail animation loop
  useEffect(() => {
    let animId;
    const animate = () => {
      setTrailingPos((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.18,
        y: prev.y + (pos.y - prev.y) * 0.18,
      }));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [pos]);

  if (pos.x < 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 99999,
        transform: `translate3d(${trailingPos.x + 14}px, ${trailingPos.y + 14}px, 0)`,
        transition: "transform 0.04s linear",
        filter: "drop-shadow(0 2px 8px rgba(176, 141, 87, 0.45))",
      }}
      aria-hidden="true"
    >
      {/* GenZ Cyber Sparkle / Star Emoji Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "3px 8px",
          background: isPointer ? "rgba(28, 25, 23, 0.9)" : "rgba(255, 255, 255, 0.85)",
          color: isPointer ? "#D4AF37" : "#1C1917",
          border: "1.5px solid #B08D57",
          borderRadius: 999,
          fontSize: "12px",
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "-0.02em",
          backdropFilter: "blur(6px)",
          boxShadow: isPointer
            ? "0 0 16px rgba(212, 175, 55, 0.6)"
            : "0 2px 10px rgba(0, 0, 0, 0.08)",
          transform: isPointer ? "scale(1.15) rotate(-4deg)" : "scale(1)",
          transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s, color 0.2s",
        }}
      >
        <span style={{ fontSize: "14px" }}>{isPointer ? "⚡" : "✨"}</span>
        <span>{isPointer ? "slay" : "vibes"}</span>
      </div>
    </div>
  );
}
