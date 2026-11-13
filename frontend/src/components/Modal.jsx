import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ title, description, onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="glass-panel max-h-[88vh] w-full max-w-lg overflow-auto rounded-2xl p-6 thin-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>
            {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
