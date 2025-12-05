 'use client';

import { useState } from 'react';
import Link from 'next/link';
import Modal from '../components/Modal';

export default function ModalTestPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="card">
      <h2>Modal Test Page</h2>
      <p>Use this page to test the reusable `Modal` component locally.</p>

      <div className="input-group">
        <button className="btn btn-login" onClick={() => setOpen(true)}>
          Open Modal
        </button>
        <button className="btn" onClick={() => setOpen(true)}>
          Open Modal (alt)
        </button>
      </div>

      <Modal
        open={open}
        title="Test Modal"
        initialText="Hello from modal test"
        onClose={() => setOpen(false)}
        onSubmit={(text) => {
          // Simple test handler — shows the submitted text and closes modal
          alert('Modal submitted: ' + text);
          setOpen(false);
        }}
      />

      <div className="footer" style={{ marginTop: 16 }}>
        <Link href="/">
          <a className="btn">Back Home</a>
        </Link>
      </div>
    </div>
  );
}
