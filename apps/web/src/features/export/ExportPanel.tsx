"use client";

import { useState } from "react";
import { exportApi } from "./export.api.js";

interface ExportPanelProps {
  projectId: string;
}

export function ExportPanel({ projectId }: ExportPanelProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trigger = async (engine: "godot" | "unity") => {
    setLoading(true);
    setError(null);
    setDownloadUrl(null);
    setStatus("Starting export...");

    try {
      await (engine === "godot"
        ? exportApi.triggerGodot(projectId)
        : exportApi.triggerUnity(projectId));

      setStatus("Processing...");

      // Poll for completion
      const poll = async () => {
        const job = await exportApi.getDownload(projectId);
        if (!job) return;

        setStatus(job.status);
        if (job.status === "done" && job.resultUrl) {
          setDownloadUrl(job.resultUrl);
        } else if (job.status === "failed") {
          setError(job.error ?? "Export failed");
        } else if (job.status === "processing" || job.status === "pending") {
          setTimeout(poll, 2000);
        }
      };

      setTimeout(poll, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Export</h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => trigger("godot")}
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          Export for Godot
        </button>
        <button
          onClick={() => trigger("unity")}
          disabled={loading}
          className="rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900 disabled:opacity-60"
        >
          Export for Unity
        </button>
      </div>

      {status && <p className="mt-3 text-sm text-gray-600">Status: {status}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {downloadUrl && (
        <a
          href={downloadUrl}
          download
          className="mt-3 inline-block rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Download ZIP
        </a>
      )}
    </div>
  );
}
