"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getUserInvoices } from "./db_service";
import { generateInvoicePDF } from "./generateInvoicePDF";
import { 
  Receipt, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download
} from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

interface InvoicesModalProps {
  username: string;
  firstname: string;
  lastname: string;
  onClose: () => void;
}

export default function InvoicesModal({ username, firstname, lastname, onClose }: InvoicesModalProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const perPage = 10;

  const loadInvoices = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    const result = await getUserInvoices(username, page, perPage);
    if (result.success) {
      const paginated = result.data;
      setInvoices(paginated.data || []);
      setCurrentPage(paginated?.current_page || page);
      setTotalPages(paginated?.last_page || 1);
      setTotalRecords(paginated?.total || 0);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [username]);

  useEffect(() => {
    loadInvoices(1);
  }, [loadInvoices]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    loadInvoices(page);
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("ar-IQ", {
      style: "currency",
      currency: "IQD",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const handleDownload = (inv: any) => {
    generateInvoicePDF(inv, { firstname, lastname }, "download");
  };

  const handlePrint = (inv: any) => {
    generateInvoicePDF(inv, { firstname, lastname }, "print");
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages.map((p, idx) =>
      typeof p === "string" ? (
        <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
          …
        </span>
      ) : (
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          disabled={loading}
          className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
            p === currentPage
              ? "bg-orange-500 text-white shadow-sm"
              : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {p}
        </button>
      )
    );
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in duration-200">

        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Receipt className="w-6 h-6 text-orange-500" />
              Invoice History
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Records for <span className="text-orange-600 font-bold">{firstname} {lastname}</span>
              {!loading && totalRecords > 0 && (
                <span className="text-gray-400 ml-2">({totalRecords} total)</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => loadInvoices(currentPage)}
              disabled={loading}
              className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 h-10 w-10"
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 h-10 w-10"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-red-500" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
              <p className="text-sm text-gray-400 font-medium animate-pulse">Fetching transactions...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-8 rounded-2xl text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-red-800 dark:text-red-400 font-bold text-lg">Unable to load history</p>
              <p className="text-red-600 dark:text-red-500 text-sm mt-1 mb-4">{error}</p>
              <Button onClick={() => loadInvoices(currentPage)} className="bg-red-500 hover:bg-red-600 text-white rounded-xl">
                Try Again
              </Button>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-bold">No Invoices Found</p>
              <p className="text-gray-400 text-xs">There are no payment records for this user.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <Card key={inv.id} className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden group hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors">
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      <div className={`w-1.5 ${inv.paid ? "bg-green-500" : "bg-red-500"}`} />
                      <div className="flex-1 p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 flex-shrink-0 group-hover:scale-105 transition-transform">
                              {inv.type === "redeem" ? <CreditCard className="w-6 h-6 text-blue-500" /> : <Receipt className="w-6 h-6 text-orange-500" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                  {inv.invoice_number}
                                </span>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${inv.type === "redeem" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                                  {inv.type}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 italic">
                                &quot;{inv.description}&quot;
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {inv.created_at?.split(" ")[0]}
                                </span>
                                {inv.payment_method && (
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {inv.payment_method}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-gray-50 dark:border-gray-800">
                            <p className="text-xl font-black text-gray-900 dark:text-white">
                              {formatCurrency(inv.amount)}
                            </p>
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest mt-1 ${inv.paid ? "text-green-600" : "text-red-600"}`}>
                              {inv.paid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                              {inv.paid ? "Settled" : "Unpaid"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                          <button
                            onClick={() => handlePrint(inv)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Print
                          </button>

                          <button
                            onClick={() => handleDownload(inv)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800">
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mb-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {renderPageNumbers()}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="w-full max-w-[200px] rounded-xl font-bold uppercase text-xs h-11 border-gray-300 dark:border-gray-600"
            >
              Close History
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}