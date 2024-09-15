// src/app/admin/playground/page.tsx

"use client";

import { PlaygroundControls } from "@/components/admin/playground/PlaygroundControls";
import { PlaygroundPreview } from "@/components/admin/playground/preview/PlaygroundPreview";
import styles from "./Playground.module.css";

export default function PlaygroundPage() {
  return (
    <div className="relative h-screen flex">
      {/* Preview area on the left */}
      <main className={styles.previewArea}>
        <PlaygroundPreview />
      </main>

      {/* Floating Controls on the right */}
      <aside className={styles.controlsPopout}>
        <PlaygroundControls />
      </aside>
    </div>
  );
}
