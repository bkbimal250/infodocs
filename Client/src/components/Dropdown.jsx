import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

// Simple portal dropdown anchored to a trigger element. Keeps menu out of overflow-hidden parents.
export default function Dropdown({ trigger, children, menuClassName = '' }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    function onEsc(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => { document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onEsc); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    // position menu using viewport right offset so we can align right edge to trigger
    const right = Math.max(8, Math.round(window.innerWidth - rect.right));
    const top = Math.round(rect.bottom + scrollY + 6);
    setPos({ top, right });
  }, [open]);

  const button = (
    <span ref={triggerRef} onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>
      {trigger}
    </span>
  );

  return (
    <>
      {button}
      {open && ReactDOM.createPortal(
          <div ref={menuRef} style={{ position: 'absolute', top: pos.top + 'px', right: pos.right + 'px', zIndex: 9999 }}>
            <div onClick={() => setOpen(false)} className={`rounded-md border bg-white shadow-lg ${menuClassName} transform-gpu transition duration-150 ease-out`}>{children}</div>
          </div>,
          document.body
        )}
    </>
  );
}
