import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ title, description, onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[88vh] w-full max-w-lg overflow-auto rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-2xl thin-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3 border-b border-neutral-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 leading-snug">{title}</h3>
            {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
