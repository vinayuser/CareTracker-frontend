import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DemoRequestModal from './DemoRequestModal';

const DemoRequestContext = createContext(null);

export function DemoRequestProvider({ children }) {
  const [open, setOpen] = useState(false);
  const { hash } = useLocation();
  const openDemo = useCallback(() => setOpen(true), []);
  const closeDemo = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ openDemo, closeDemo, isOpen: open }), [openDemo, closeDemo, open]);

  useEffect(() => {
    if (hash === '#demo') openDemo();
  }, [hash, openDemo]);

  return (
    <DemoRequestContext.Provider value={value}>
      {children}
      <DemoRequestModal open={open} onClose={closeDemo} />
    </DemoRequestContext.Provider>
  );
}

export function useDemoRequest() {
  const ctx = useContext(DemoRequestContext);
  if (!ctx) {
    throw new Error('useDemoRequest must be used within DemoRequestProvider');
  }
  return ctx;
}

export function RequestDemoButton({ className, children = 'Request a Demo', onClick, ...props }) {
  const { openDemo } = useDemoRequest();
  return (
    <button
      type="button"
      className={['cursor-pointer', className].filter(Boolean).join(' ')}
      onClick={(e) => {
        onClick?.(e);
        openDemo();
      }}
      {...props}
    >
      {children}
    </button>
  );
}
