// ...existing code...
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Modal from '../components/Modal';

export default function ModalTestPage() {
  const [open, setOpen] = useState(false);
  const [unsupportedOpen, setUnsupportedOpen] = useState(false);

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
        <button className="btn" onClick={() => setUnsupportedOpen(true)} style={{ marginLeft: 8 }}>
          Show Unsupported Modal
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

      <Modal
        open={unsupportedOpen}
        title="Unsupported — New Common Core"
        displayOnly={true}
        content="This tool is not usable for the new common core. Sorry :( ! "
        backHref="/42-blackhole-calculator"
        onClose={() => setUnsupportedOpen(false)}
        onSubmit={() => {}}
      />

      <div className="footer" style={{ marginTop: 16 }}>
        <Link href="/">
          <a className="btn">Back Home</a>
        </Link>
      </div>
    </div>
  );
}
// ...existing code...