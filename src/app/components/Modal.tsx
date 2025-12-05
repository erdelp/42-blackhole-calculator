'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export interface ModalProps {
  open: boolean;
  title?: string;
  initialText?: string;
  onClose: () => void;
  onSubmit?: (text: string) => void;
  // New props:
  displayOnly?: boolean; // when true, show `content` and a back link instead of the text input
  content?: string; // content to display when displayOnly is true
  backHref?: string; // href for the "Back home" link
}

export default function Modal({
  open,
  title = 'Modal',
  initialText = '',
  onClose,
  onSubmit,
  displayOnly = false,
  content = '',
  backHref = '/'
}: ModalProps) {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    setText(initialText);
  }, [initialText, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (!displayOnly && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, text, displayOnly]);

  const handleSubmit = () => {
    onSubmit?.(text);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-card">
        <header className="modal-header">
          <h3>{title}</h3>
          <button className="btn btn-logout" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="modal-body">
          {displayOnly ? (
            <>
              <div style={{ whiteSpace: 'pre-wrap', marginBottom: 12 }}>{content}</div>
              <Link href={backHref}>
                <a className="btn btn-login">Back home</a>
              </Link>
            </>
          ) : (
            <>
              <label className="label">Text</label>
              <input
                className="input"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text..."
                aria-label="Modal text input"
              />
            </>
          )}
        </div>

        {!displayOnly && (
          <footer className="modal-footer">
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-login" onClick={handleSubmit}>Submit</button>
          </footer>
        )}
      </div>
    </div>
  );
}
