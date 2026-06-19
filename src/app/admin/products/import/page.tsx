"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  ArrowLeft,
  ArrowRight,
  FileSpreadsheet,
  Check,
  AlertTriangle,
  Loader2,
  Settings,
  History,
  HelpCircle,
  FileDown,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "@/lib/api-client";
import { BRAND } from "@/config/brand.config";

const STEPS = [
  { label: "Upload File", desc: "Select CSV or XLSX" },
  { label: "Map Columns", desc: "Match fields & settings" },
  { label: "Validate", desc: "Dry-run validation" },
  { label: "Preview Data", desc: "Verify products" },
  { label: "Import", desc: "Run BullMQ queue" },
];

const TARGET_FIELDS = [
  { name: "name", label: "Product Name *", required: true, type: "text", example: "Organic Aloe Vera Gel" },
  { name: "slug", label: "Product Slug *", required: true, type: "text", example: "organic-aloe-vera-gel" },
  { name: "description", label: "Description", required: false, type: "text", example: "100% pure organic aloe vera gel" },
  { name: "categoryId", label: "Category ID", required: false, type: "text", example: "cat_abc123" },
  { name: "categorySlug", label: "Category Slug", required: false, type: "text", example: "skincare" },
  { name: "store", label: "Store Name", required: false, type: "text", example: "AE Naturals" },
  { name: "brand", label: "Brand", required: false, type: "text", example: "AE Naturals" },
  { name: "isActive", label: "Is Active", required: false, type: "boolean", example: "true / false" },
  { name: "isFeatured", label: "Is Featured", required: false, type: "boolean", example: "true / false" },
  { name: "isCodEnabled", label: "Is COD Enabled", required: false, type: "boolean", example: "true / false" },
  { name: "images", label: "Images (JSON Array)", required: false, type: "json", example: '[{"url":"...","publicId":"...","type":"image"}]' },
  { name: "collections", label: "Collections (JSON Array)", required: false, type: "json", example: '["Best Sellers","New Arrivals"]' },
  { name: "highlightIds", label: "Highlight IDs (JSON Array)", required: false, type: "json", example: '["h1_abc","h2_def"]' },
  { name: "careInstructions", label: "Care Instructions (JSON Array)", required: false, type: "json", example: '["Store in cool place","Keep away from sunlight"]' },
  { name: "deliveryInfo", label: "Delivery Info (JSON Array)", required: false, type: "json", example: '["Ships in 24 hours","Free delivery above ₹500"]' },
  { name: "attributes", label: "Attributes (JSON Array)", required: false, type: "json", example: '[{"name":"Type","value":"Herbal"}]' },
  { name: "variants", label: "Variants (JSON Array)", required: false, type: "json", example: '[{"name":"100gm","sku":"SKU-001","price":599,"stock":20}]' },
  { name: "safetyInfo", label: "Safety Info", required: false, type: "text", example: "For oral use only" },
  { name: "ingredients", label: "Ingredients", required: false, type: "text", example: "Spirulina, Curcumin" },
  { name: "directions", label: "Directions", required: false, type: "text", example: "Take as directed" },
  { name: "legalDisclaimer", label: "Legal Disclaimer", required: false, type: "text", example: "Not evaluated by FDA" },
  { name: "manufacturer", label: "Manufacturer", required: false, type: "text", example: "AE Naturals Pvt Ltd" },
  { name: "countryOfOrigin", label: "Country of Origin", required: false, type: "text", example: "India" },
  { name: "weight", label: "Weight", required: false, type: "text", example: "250g" },
  { name: "dimensions", label: "Dimensions", required: false, type: "text", example: "10x5x5 cm" },
  { name: "genericName", label: "Generic Name", required: false, type: "text", example: "Herbal Supplement" },
  { name: "aPlusContent", label: "A+ Content (JSON Array)", required: false, type: "json", example: '[{"type":"TEXT","content":{"title":"...","description":"..."}}]' },
  { name: "shippingWeightKg", label: "Shipping Weight (Kg)", required: false, type: "number", example: "0.1" },
  { name: "lengthCm", label: "Length (cm)", required: false, type: "number", example: "10" },
  { name: "widthCm", label: "Width (cm)", required: false, type: "number", example: "5" },
  { name: "heightCm", label: "Height (cm)", required: false, type: "number", example: "5" },
  { name: "seoTitle", label: "SEO Title", required: false, type: "text", example: "Organic Aloe Vera Gel - Buy Online" },
  { name: "seoDescription", label: "SEO Description", required: false, type: "text", example: "Get the best organic aloe vera gel..." },
  { name: "seoKeywords", label: "SEO Keywords (JSON Array)", required: false, type: "json", example: '["aloe vera","organic","skincare"]' },
  { name: "shippingCategory", label: "Shipping Category", required: false, type: "text", example: "Standard" },
  { name: "subtitle", label: "Subtitle", required: false, type: "text", example: "Premium wellness supplement" },
  { name: "sku", label: "SKU", required: false, type: "text", example: "SKU-001" },
  { name: "price", label: "Price", required: false, type: "number", example: "599" },
  { name: "stock", label: "Stock", required: false, type: "number", example: "20" },
];

const FIELD_DESCRIPTIONS: Record<string, string> = {
  images: 'JSON array: [{"url":"...","publicId":"...","type":"image","posterUrl":null}]',
  variants: 'JSON array: [{"id":"optional","name":"Variant","sku":"SKU-001","optionType":"Size","optionValue":"100gm","price":599,"oldPrice":699,"stock":20,"shippingWeightKg":0.1,"lengthCm":0,"widthCm":0,"heightCm":0}]',
  attributes: 'JSON array: [{"name":"Attribute","value":"Value"}]',
  highlightIds: 'JSON array: ["h1_abc123","h2_def456"]',
  careInstructions: 'JSON array: ["Store in cool place","Keep away from sunlight"]',
  deliveryInfo: 'JSON array: ["Ships in 24 hours","Free delivery above ₹500"]',
  collections: 'JSON array: ["Best Sellers","New Arrivals"]',
  aPlusContent: 'JSON array: [{"type":"TEXT","content":{"title":"Title","description":"<p>HTML</p>"}}]',
  seoKeywords: 'JSON array: ["keyword1","keyword2","keyword3"]',
};

export default function ProductImportPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  // Job state
  const [jobId, setJobId] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [originalFileName, setOriginalFileName] = useState("");

  // Stepper state
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [duplicateStrategy, setDuplicateStrategy] = useState("SKIP_EXISTING");
  const [categoryStrategy, setCategoryStrategy] = useState("FAIL_VALIDATION");
  const [collectionStrategy, setCollectionStrategy] = useState("SKIP_LINK");
  const [highlightStrategy, setHighlightStrategy] = useState("SKIP_LINK");
  const [imageStrategy, setImageStrategy] = useState("DOWNLOAD_IMAGES");
  const [templateName, setTemplateName] = useState("");

  // Validation results
  const [validationSummary, setValidationSummary] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Import Status
  const [importStatus, setImportStatus] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);

  // File drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  // Poll for import progress
  useEffect(() => {
    let interval: any;
    if (activeStep === 4 && jobId && isImporting) {
      interval = setInterval(async () => {
        try {
          const res = await apiClient.get(`/admin/products/import/jobs/${jobId}`);
          setImportStatus(res);
          if (res.status === "COMPLETED" || res.status === "FAILED" || res.status === "ROLLED_BACK") {
            setIsImporting(false);
            clearInterval(interval);
            toast.success(`Import finished with status: ${res.status}`);
          }
        } catch (e) {
          console.error("Failed to poll import job", e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeStep, jobId, isImporting]);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    const toastId = toast.loading("Uploading and parsing file...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res: any = await apiClient.post("/admin/products/import/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setJobId(res.id);
      setHeaders(res.headers || []);
      setSampleRows(res.sampleRows || []);
      setTotalRows(res.totalRows || 0);
      setOriginalFileName(res.originalFileName);

      // Guess initial mappings based on header name similarity
      const guessed: Record<string, string> = {};
      TARGET_FIELDS.forEach((tf) => {
        const match = res.headers.find(
          (h: string) => h.toLowerCase() === tf.name.toLowerCase() || 
          h.toLowerCase().replace(/[^a-z]+/g, "") === tf.name.toLowerCase()
        );
        if (match) guessed[tf.name] = match;
      });
      setMappings(guessed);

      toast.success("File parsed successfully!", { id: toastId });
      setActiveStep(1);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file", { id: toastId });
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Download import template
  const downloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    const toastId = toast.loading("Downloading import template...");
    try {
      const response = await apiClient.get("/admin/products/import/template", {
        responseType: "blob",
      });
      const blob = new Blob([response as any], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "product_import_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Template downloaded successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to download template", { id: toastId });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  // Run dry-run validation
  const runValidation = async () => {
    if (!jobId) return;

    // Check required fields are mapped
    const missingRequired = TARGET_FIELDS.filter(f => f.required && !mappings[f.name]);
    if (missingRequired.length > 0) {
      toast.error(`Please map required fields: ${missingRequired.map(f => f.label).join(", ")}`);
      return;
    }

    setIsValidating(true);
    setActiveStep(2);
    const toastId = toast.loading("Validating rows and settings...");

    try {
      const res: any = await apiClient.post(`/admin/products/import/validate/${jobId}`, {
        mappings,
        duplicateStrategy,
        categoryStrategy,
        collectionStrategy,
        highlightStrategy,
        imageStrategy,
        templateName: templateName || undefined,
      });

      setValidationSummary(res.validationSummary);
      const refreshedJob: any = await apiClient.get(`/admin/products/import/jobs/${jobId}`);
      setValidationErrors(refreshedJob.errors || []);

      toast.success("Validation dry-run complete!", { id: toastId });
      setActiveStep(3);
    } catch (err: any) {
      toast.error(err.message || "Validation failed", { id: toastId });
      setActiveStep(1);
    } finally {
      setIsValidating(false);
    }
  };

  // Start BullMQ queue import
  const startImportExecution = async () => {
    if (!jobId) return;
    const toastId = toast.loading("Starting import queue...");

    try {
      await apiClient.post(`/admin/products/import/start/${jobId}`, {
        mappings,
      });
      setIsImporting(true);
      toast.success("Import processing started!", { id: toastId });
      setActiveStep(4);
    } catch (err: any) {
      toast.error(err.message || "Failed to start import queue", { id: toastId });
    }
  };

  const getFieldTypeColor = (type: string) => {
    switch(type) {
      case 'json': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'boolean': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'number': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getFieldTypeIcon = (type: string) => {
    switch(type) {
      case 'json': return '{ }';
      case 'boolean': return '✓/✗';
      case 'number': return '123';
      default: return 'Aa';
    }
  };

  const renderSampleValue = (row: any, mapping: string) => {
    if (!mapping) return '—';
    const val = row[mapping];
    if (val === undefined || val === null) return '—';
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val).substring(0, 100) + (JSON.stringify(val).length > 100 ? '...' : '');
      } catch {
        return '[Object]';
      }
    }
    if (typeof val === 'string' && val.length > 80) {
      return val.substring(0, 80) + '...';
    }
    return String(val);
  };

  return (
    <div
      className="p-4 md:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-300 min-h-screen"
      style={{ backgroundColor: BRAND.theme.accent }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/admin/products")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
        >
          <ArrowLeft size={16} /> Back to Catalog
        </button>

        <div className="flex gap-2">
          <button
            onClick={downloadTemplate}
            disabled={isDownloadingTemplate}
            className="flex items-center gap-2 bg-[#006044] text-white hover:bg-[#004d36] px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            {isDownloadingTemplate ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Download Template
          </button>
          <button
            onClick={() => router.push("/admin/products/import/history")}
            className="flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <History size={16} /> View History
          </button>
        </div>
      </div>

      {/* Stepper Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 mb-6 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px]">
          {STEPS.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    activeStep > idx
                      ? "bg-[#006044] text-white"
                      : activeStep === idx
                      ? "bg-[#006044] text-white ring-4 ring-green-100"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {activeStep > idx ? <Check size={18} /> : idx + 1}
                </div>
                <div>
                  <p className={`text-sm font-bold ${activeStep === idx ? "text-gray-900" : "text-gray-500"}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">{step.desc}</p>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-4 transition-all ${
                    activeStep > idx ? "bg-[#006044]" : "bg-gray-100"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 1: Upload */}
      {activeStep === 0 && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upload Your Product File</h2>
              <p className="text-sm text-gray-500 mt-1">
                Upload a CSV or Excel file with your product data. Download the template below for the correct format.
              </p>
            </div>
          
          </div>

          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragging
                ? "border-[#006044] bg-green-50/30"
                : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
            }`}
          >
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-[#006044]">
              <Upload size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Drop your file here</h3>
            <p className="text-sm text-gray-500 mb-6">
              Supports .csv, .xlsx, .xls files
            </p>
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              id="product-file-input"
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  handleFileUpload(files[0]);
                }
              }}
            />
            <button
              onClick={() => document.getElementById("product-file-input")?.click()}
              className="bg-[#006044] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#004d36] transition-all shadow-sm"
            >
              Browse Files
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Mapping & Strategies */}
      {activeStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Settings size={20} className="text-[#006044]" /> Column Mapping ({originalFileName})
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Match the columns in your file to our product fields. JSON fields will be parsed automatically.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-bold">JSON</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">Boolean</span>
                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-bold">Number</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TARGET_FIELDS.map((tf) => (
                <div key={tf.name} className="flex flex-col gap-1 border border-gray-100 rounded-xl p-3 bg-gray-50/30 hover:bg-gray-50 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                      {tf.label}
                      {tf.required && <span className="text-red-500">*</span>}
                    </label>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getFieldTypeColor(tf.type)}`}>
                      {getFieldTypeIcon(tf.type)}
                    </span>
                  </div>
                  {tf.example && (
                    <div className="text-[9px] text-gray-400 truncate">
                      <span className="font-bold">Example:</span> {tf.example}
                    </div>
                  )}
                  {FIELD_DESCRIPTIONS[tf.name] && (
                    <div className="flex items-start gap-1 text-[10px] text-gray-400">
                      <HelpCircle size={12} className="shrink-0 mt-0.5" />
                      <span className="break-words">{FIELD_DESCRIPTIONS[tf.name]}</span>
                    </div>
                  )}
                  <select
                    value={mappings[tf.name] || ""}
                    onChange={(e) =>
                      setMappings((prev) => ({ ...prev, [tf.name]: e.target.value }))
                    }
                    className="bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#006044] focus:ring-1 focus:ring-[#006044] font-medium"
                  >
                    <option value="">-- Ignore --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Import Strategy Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Duplicate SKU Strategy
                </label>
                <select
                  value={duplicateStrategy}
                  onChange={(e) => setDuplicateStrategy(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#006044] font-medium"
                >
                  <option value="SKIP_EXISTING">SKIP_EXISTING (Skip duplicate rows)</option>
                  <option value="UPDATE_EXISTING">UPDATE_EXISTING (Overwrite existing details)</option>
                  <option value="CREATE_NEW">CREATE_NEW (Create new item with unique SKU)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Missing Category Strategy
                </label>
                <select
                  value={categoryStrategy}
                  onChange={(e) => setCategoryStrategy(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#006044] font-medium"
                >
                  <option value="FAIL_VALIDATION">FAIL_VALIDATION (Reject missing categories)</option>
                  <option value="CREATE_AUTOMATICALLY">CREATE_AUTOMATICALLY (Create missing category)</option>
                  <option value="SKIP_PRODUCT">SKIP_PRODUCT (Skip importing product)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Missing Collection Strategy
                </label>
                <select
                  value={collectionStrategy}
                  onChange={(e) => setCollectionStrategy(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#006044] font-medium"
                >
                  <option value="SKIP_LINK">SKIP_LINK (Don't map collections)</option>
                  <option value="CREATE_AUTOMATICALLY">CREATE_AUTOMATICALLY (Create collections)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Missing Highlight Strategy
                </label>
                <select
                  value={highlightStrategy}
                  onChange={(e) => setHighlightStrategy(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#006044] font-medium"
                >
                  <option value="SKIP_LINK">SKIP_LINK (Don't link highlights)</option>
                  <option value="CREATE_AUTOMATICALLY">CREATE_AUTOMATICALLY (Create global highlights)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Image Import Strategy
                </label>
                <select
                  value={imageStrategy}
                  onChange={(e) => setImageStrategy(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#006044] font-medium"
                >
                  <option value="DOWNLOAD_IMAGES">DOWNLOAD_IMAGES (Upload URLs to Cloudinary)</option>
                  <option value="USE_URLS_DIRECTLY">USE_URLS_DIRECTLY (Direct linking)</option>
                  <option value="IGNORE_IMAGES">IGNORE_IMAGES (Do not import images)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Save Mapping as Template (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Template Name..."
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#006044] font-medium"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-between items-center mt-6">
              <button
                onClick={() => setActiveStep(0)}
                className="text-gray-500 hover:text-gray-800 text-sm font-bold"
              >
                Back
              </button>
              <button
                onClick={runValidation}
                disabled={isValidating}
                className="flex items-center gap-2 bg-[#006044] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#004d36] transition-all shadow-md shadow-green-900/10 text-sm disabled:opacity-50"
              >
                {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Validate Mapping <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Validation Dry-Run Results */}
      {activeStep === 3 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Validation Summary
            </h2>
            {validationErrors.length > 0 && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const response = await apiClient.get(`/admin/products/import/jobs/${jobId}/failed-rows`, {
                      responseType: "blob",
                    });
                    const blob = new Blob([response as any], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", `failed-rows-${jobId}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode?.removeChild(link);
                  } catch (err) {
                    toast.error("Failed to download error report");
                  }
                }}
                className="bg-red-50 text-red-600 border border-red-150 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
              >
                Download Error Report
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-center">
              <span className="text-3xl font-black text-green-700">{totalRows}</span>
              <p className="text-sm font-bold text-green-900 mt-1">Total Rows Detected</p>
            </div>
            <div
              className={`p-6 rounded-2xl border text-center ${
                validationErrors.length > 0
                  ? "bg-amber-50 border-amber-100 text-amber-900"
                  : "bg-green-50 border-green-100 text-green-900"
              }`}
            >
              <span className={`text-3xl font-black ${validationErrors.length > 0 ? "text-amber-700" : "text-green-700"}`}>
                {validationErrors.length}
              </span>
              <p className="text-sm font-bold mt-1">Validation Errors Found</p>
            </div>
          </div>

          {/* Mapped Data Preview */}
          <div className="mb-6 border border-gray-100 rounded-2xl p-4 bg-gray-50/50 overflow-x-auto">
            <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Mapped Data Preview (First 3 Rows)</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                  {TARGET_FIELDS.slice(0, 6).map(tf => (
                    <th key={tf.name} className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {tf.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 bg-white">
                {sampleRows.slice(0, 3).map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="px-3 py-2 text-xs font-bold text-gray-400">{rIdx + 1}</td>
                    {TARGET_FIELDS.slice(0, 6).map(tf => {
                      const mappedCol = mappings[tf.name];
                      return (
                        <td key={tf.name} className="px-3 py-2 text-xs text-gray-600 truncate max-w-[200px]">
                          {renderSampleValue(row, mappedCol)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {validationErrors.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="text-amber-500" size={18} /> Error Logs ({validationErrors.length})
              </h3>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-2xl p-4 space-y-2.5 bg-gray-50/50">
                {validationErrors.map((err, idx) => (
                  <div key={idx} className="bg-white p-3 border border-gray-100 rounded-xl text-xs">
                    <p className="font-bold text-gray-800">Row {err.rowNumber} - {err.fieldName}</p>
                    <p className="text-gray-500">{err.errorMessage}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-50/50 border border-green-100 p-6 rounded-2xl flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <Check size={24} />
              </div>
              <div>
                <p className="font-bold text-green-900 text-sm">Perfect validation!</p>
                <p className="text-green-700 text-xs">Your spreadsheet matches our columns and contains no syntax errors.</p>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
            <button
              onClick={() => setActiveStep(1)}
              className="text-gray-500 hover:text-gray-800 text-sm font-bold"
            >
              Adjust Mapping
            </button>
            <button
              onClick={startImportExecution}
              className="flex items-center gap-2 bg-[#006044] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#004d36] transition-all shadow-md shadow-green-900/10 text-sm"
            >
              Start Import <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Import Processing Status */}
      {activeStep === 4 && importStatus && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#006044]/10 text-[#006044] mb-4">
              {isImporting ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Check className="w-8 h-8" />
              )}
            </div>
            <h2 className="text-2xl font-black text-gray-900 capitalize">Import Status: {importStatus.status}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isImporting ? "BullMQ queue is processing products in background..." : "Import completed!"}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 h-3 rounded-full mb-8 overflow-hidden">
            <div
              className="bg-[#006044] h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  Math.round(
                    ((importStatus.processedRows || 0) / (importStatus.totalRows || 1)) * 100
                  ),
                  100
                )}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
              <span className="text-2xl font-black text-gray-800">
                {importStatus.processedRows || 0} / {importStatus.totalRows || 0}
              </span>
              <p className="text-xs text-gray-500 mt-1">Processed</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
              <span className="text-2xl font-black text-green-700">{importStatus.successRows || 0}</span>
              <p className="text-xs text-green-700 mt-1">Success</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
              <span className="text-2xl font-black text-red-700">{importStatus.failedRows || 0}</span>
              <p className="text-xs text-red-700 mt-1">Failed</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
              <span className="text-2xl font-black text-amber-700">{importStatus.skippedRows || 0}</span>
              <p className="text-xs text-amber-700 mt-1">Skipped</p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => router.push("/admin/products")}
              className="bg-[#006044] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#004d36] transition-all text-sm"
            >
              Go back to Products
            </button>
          </div>
        </div>
      )}
    </div>
  );
}