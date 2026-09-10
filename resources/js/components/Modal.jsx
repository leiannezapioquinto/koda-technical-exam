import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export default function Modal({ title, subtitle, onClose, busy = false, children }) {
    const ref = useRef(null);
    useEffect(() => {
        const previouslyFocused = document.activeElement;
        ref.current.showModal();
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = overflow; previouslyFocused?.focus(); };
    }, []);
    return <dialog ref={ref} className="modal" aria-labelledby="modal-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => { if (event.target === ref.current && !busy) { const rect = ref.current.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}>
        <header className="modal-header"><div><h2 id="modal-title">{title}</h2>{subtitle && <p className="muted">{subtitle}</p>}</div><button type="button" aria-label="Close dialog" className="icon-button" onClick={onClose} disabled={busy}><X size={20} /></button></header>
        {children}
    </dialog>;
}

