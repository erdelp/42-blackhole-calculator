'use client';

import Modal from '../components/Modal';

export default function ModalTestPage() {
  // This page only shows the unsupported/display-only modal.
  return (
    <Modal
      open={true}
      title="Unsupported — New Common Core"
      displayOnly={true}
      content={"This tool is not usable for the new common core. Please visit the homepage for updates."}
      backHref="/"
      onClose={() => { /* no-op: leaving page to the back link */ }}
      onSubmit={() => {}}
    />
  );
}
