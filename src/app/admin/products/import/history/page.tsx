// src/app/admin/products/import/history/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  History,
  ArrowLeft,
  Loader2,
  Download,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "@/lib/api-client";
import { BRAND } from "@/config/brand.config";
import { Badge } from "@/components/admin/ui/Badge";

export default function ImportHistoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["import-jobs"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/products/import/jobs");
      return Array.isArray(response) ? response : [];
    },
    refetchInterval: 5000, // Refetch every 5 seconds to keep track of active imports
  });

  const rollbackMutation = useMutation({
    mutationFn: (jobId: string) => apiClient.post(`/admin/products/import/rollback/${jobId}`, {}),
    onSuccess: () => {
      toast.success("Rollback process triggered!");
      queryClient.invalidateQueries({ queryKey: ["import-jobs"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to trigger rollback");
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "ROLLED_BACK":
        return <Badge variant="warning">Rolled Back</Badge>;
      case "FAILED":
        return <Badge variant="error">Failed</Badge>;
      case "IMPORTING":
      case "ROLLBACK_PENDING":
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {status}
          </span>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleDownloadFailedRows = (jobId: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/products/import/jobs/${jobId}/failed-rows`;
    window.open(url, "_blank");
  };

  return (
    <div
      className="p-4 md:p-8 max-w-[1200px] mx-auto animate-in fade-in duration-300 min-h-screen"
      style={{ backgroundColor: BRAND.theme.accent }}
    >
      <button
        onClick={() => router.push("/admin/products/import")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft size={16} /> Back to Import Wizard
      </button>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <History className="text-[#006044]" /> Import History
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor background jobs, view validation logs, download failed rows or roll back changes.
          </p>
        </div>

        {isLoading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#006044] mb-3" />
            <p className="text-gray-500 font-bold">Loading import history...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-20 text-center border border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
            <p className="text-gray-500 font-bold text-sm mb-1">No imports found</p>
            <p className="text-gray-400 text-xs">Run your first import using the upload button.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job: any) => (
              <div
                key={job.id}
                className="border border-gray-100 bg-white rounded-2xl p-5 shadow-sm hover:border-gray-200 transition-all flex flex-col md:flex-row justify-between gap-6"
              >
                {/* Job Metadata */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-extrabold text-gray-900 text-base max-w-[300px] truncate">
                      {job.originalFileName}
                    </h3>
                    {getStatusBadge(job.status)}
                  </div>
                  <p className="text-xs text-gray-400">
                    Uploaded on: {new Date(job.createdAt).toLocaleString()} | Size: {(job.fileSize / 1024).toFixed(1)} KB
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-gray-50 p-2.5 rounded-xl text-center">
                      <span className="text-sm font-black text-gray-700">{job.totalRows}</span>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total Rows</p>
                    </div>
                    <div className="bg-green-50 p-2.5 rounded-xl text-center">
                      <span className="text-sm font-black text-green-700">{job.successRows}</span>
                      <p className="text-[10px] font-bold text-green-500 uppercase tracking-wide">Success</p>
                    </div>
                    <div className="bg-red-50 p-2.5 rounded-xl text-center">
                      <span className="text-sm font-black text-red-700">{job.failedRows}</span>
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Failed</p>
                    </div>
                    <div className="bg-amber-50 p-2.5 rounded-xl text-center">
                      <span className="text-sm font-black text-amber-700">{job.skippedRows}</span>
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Skipped</p>
                    </div>
                  </div>

                  {job.errors && job.errors.length > 0 && (
                    <div className="bg-red-50/50 border border-red-100 p-3.5 rounded-xl space-y-1 mt-4">
                      <p className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                        <AlertTriangle size={14} /> Sample Errors ({job.errors.length} total)
                      </p>
                      <ul className="list-disc pl-4 text-[11px] text-red-700 space-y-1">
                        {job.errors.slice(0, 3).map((err: any, idx: number) => (
                          <li key={idx}>
                            Row {err.rowNumber} - {err.fieldName}: {err.errorMessage}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-row md:flex-col justify-end gap-3 self-end md:self-start w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                  {job.failedRows > 0 && (
                    <button
                      onClick={() => handleDownloadFailedRows(job.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      <Download size={14} /> Download Failures
                    </button>
                  )}

                  {(job.status === "COMPLETED" || job.status === "FAILED") && job.successRows > 0 && (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to rollback this import? This will delete all created products and revert updated changes."
                          )
                        ) {
                          rollbackMutation.mutate(job.id);
                        }
                      }}
                      disabled={rollbackMutation.isPending}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      <RotateCcw size={14} /> Rollback Import
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
