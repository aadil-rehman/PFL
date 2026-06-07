// Reusable right-side slide-in drawer (overlay + animated panel).
export default function SidePanel({ open, onClose, label, children }) {
  return (
    <div
      className={`fixed inset-0 z-100 ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#10271a] shadow-2xl shadow-black/50 ring-1 ring-white/10 transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {children}
      </aside>
    </div>
  )
}
