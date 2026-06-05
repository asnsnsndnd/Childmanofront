import { useState, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileExcel, faDownload, faTrash, faCheckCircle,
  faExclamationTriangle, faSpinner, faUpload,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import { useCreateChildMutation } from "../../Redux/Childes";

const REQUIRED_COLUMNS = [
  "childFirstName", "childLastName", "childGrandFather",
  "childRegisterDate", "childBirthDay",
  "Grade", "gender", "ChildDescription",
];

const OPTIONAL_COLUMNS = [
  "childPhone", "parentFirstName", "parentLastName", "parentPhone",
  "parentrelation", "ParentDescription",
];

const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

const parseToDate = (value) => {
  if (!value && value !== 0) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number" && value > 1 && value < 2958466) {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) return new Date(date.y, date.m - 1, date.d);
    return null;
  }
  const str = String(value).trim();
  if (!str) return null;
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const d = new Date(+isoMatch[1], +isoMatch[2] - 1, +isoMatch[3]);
    return isNaN(d.getTime()) ? null : d;
  }
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const d = new Date(+dmyMatch[3], +dmyMatch[2] - 1, +dmyMatch[1]);
    return isNaN(d.getTime()) ? null : d;
  }
  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
};

const formatDateISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const validateRow = (row) => {
  const errors = [];
  REQUIRED_COLUMNS.forEach((col) => {
    if (!row[col] && row[col] !== 0) {
      errors.push(`"${col}" is required`);
    } else if (String(row[col]).trim() === "") {
      errors.push(`"${col}" must not be empty`);
    }
  });
  if (row.gender && !["male", "female"].includes(String(row.gender).toLowerCase())) {
    errors.push(`"gender" must be "male" or "female"`);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (row.childBirthDay || row.childBirthDay === 0) {
    const bd = parseToDate(row.childBirthDay);
    if (!bd) {
      errors.push(`"childBirthDay" is not a valid date (use YYYY-MM-DD)`);
    } else if (bd >= today) {
      errors.push(`"childBirthDay" must be a past date`);
    }
  }
  if (row.childRegisterDate || row.childRegisterDate === 0) {
    const rd = parseToDate(row.childRegisterDate);
    if (!rd) {
      errors.push(`"childRegisterDate" is not a valid date (use YYYY-MM-DD)`);
    } else if (rd > today) {
      errors.push(`"childRegisterDate" cannot be a future date`);
    }
  }
  return errors;
};

// ── Template sample data matches ALL_COLUMNS order exactly ──────────────────
const downloadTemplate = () => {
  const ws = XLSX.utils.aoa_to_sheet([
    ALL_COLUMNS,
    [
      "Sara",                  // childFirstName
      "Ahmed",                 // childLastName
      "Mohammed",              // childGrandFather
      "2025-01-15",            // childRegisterDate
      "2018-03-22",            // childBirthDay
      "Grade 2",               // Grade
      "female",                // gender
      "Healthy, active child", // ChildDescription
      "0912345678",            // childPhone
      "Fatuma",                // parentFirstName
      "Ahmed",                 // parentLastName
      "0911111111",            // parentPhone
      "Mother",                // parentrelation
      "Works nearby school",   // ParentDescription
    ],
  ]);
  ws["!cols"] = ALL_COLUMNS.map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Children");
  XLSX.writeFile(wb, "children_registration_template.xlsx");
};

const StatusBadge = ({ status }) => {
  const map = {
    pending: { cls: "bg-slate-100 text-slate-500",              label: "Pending" },
    valid:   { cls: "bg-emerald-50 text-emerald-600",            label: "Valid" },
    error:   { cls: "bg-rose-50 text-rose-600",                  label: "Errors" },
    loading: { cls: "bg-sky-50 text-sky-600",                    label: "Submitting…" },
    success: { cls: "bg-emerald-100 text-emerald-700 font-bold", label: "✓ Registered" },
    failed:  { cls: "bg-rose-100 text-rose-700 font-bold",       label: "✗ Failed" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`text-xs px-2 py-1 rounded-lg font-medium whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  );
};

const BulkRegisterChildren = () => {
  const [rows, setRows]       = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const [createChild] = useCreateChildMutation();

  const parseFile = useCallback((file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext)) {
      toast.error("Please upload an .xlsx, .xls, or .csv file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "binary", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (raw.length === 0) { toast.warning("The file is empty."); return; }

        const normalised = raw.map((r) => {
          const out = {};
          Object.keys(r).forEach((k) => { out[k.trim()] = r[k]; });
          return out;
        });

        const firstRow = normalised[0];
        const missing = REQUIRED_COLUMNS.filter((c) => !(c in firstRow));
        if (missing.length > 0) {
          toast.error(`Missing columns: ${missing.join(", ")}. Download the template.`);
          return;
        }

        const withDates = normalised.map((row) => {
          const cleaned = { ...row };
          const bd = parseToDate(row.childBirthDay);
          if (bd) cleaned.childBirthDay = formatDateISO(bd);
          const rd = parseToDate(row.childRegisterDate);
          if (rd) cleaned.childRegisterDate = formatDateISO(rd);
          return cleaned;
        });

        const processed = withDates.map((row, i) => {
          const errors = validateRow(row);
          return { id: i, data: row, errors, status: errors.length === 0 ? "valid" : "error", serverMsg: "" };
        });

        setRows(processed);
        const errCount = processed.filter((r) => r.status === "error").length;
        if (errCount > 0) {
          toast.warning(`${processed.length} rows loaded — ${errCount} have validation errors.`);
        } else {
          toast.success(`${processed.length} valid rows ready to submit!`);
        }
      } catch {
        toast.error("Could not read the file. Please use the provided template.");
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  const onFileChange = (e) => parseFile(e.target.files[0]);
  const onDrop = (e) => { e.preventDefault(); setDragging(false); parseFile(e.dataTransfer.files[0]); };

  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));

  const submitRow = async (row) => {
    setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, status: "loading" } : r));
    const formData = new FormData();
    formData.append("Data", JSON.stringify(row.data));
    try {
      const result = await createChild(formData).unwrap();
      setRows((prev) => prev.map((r) =>
        r.id === row.id ? { ...r, status: "success", serverMsg: result.msg || "Registered!" } : r
      ));
    } catch (err) {
      setRows((prev) => prev.map((r) =>
        r.id === row.id ? { ...r, status: "failed", serverMsg: err?.data?.msg || "Failed" } : r
      ));
    }
  };

  const submitAll = async () => {
    const toSubmit = rows.filter((r) => r.status === "valid");
    if (toSubmit.length === 0) { toast.warning("No valid rows to submit."); return; }
    toast.info(`Submitting ${toSubmit.length} children…`);
    for (const row of toSubmit) await submitRow(row);
    toast.success("Batch submission complete!");
  };

  const validCount   = rows.filter((r) => r.status === "valid").length;
  const errorCount   = rows.filter((r) => r.status === "error").length;
  const successCount = rows.filter((r) => r.status === "success").length;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-700 pb-10">
      <ToastContainer position="top-right" theme="colored" />

      <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-[2.5rem] p-6 md:p-12 border border-white/50 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <span className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <FontAwesomeIcon icon={faFileExcel} />
              </span>
              Bulk Register via Excel
            </h2>
            <p className="text-sm text-slate-500 mt-1 ml-1">
              Upload an Excel or CSV file to register multiple children at once.
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-md transition-all text-sm whitespace-nowrap"
          >
            <FontAwesomeIcon icon={faDownload} />
            Download Template
          </button>
        </div>

        {/* ── Drop Zone ── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-[2rem] border-2 border-dashed p-12 flex flex-col items-center gap-4 transition-all duration-300
            ${dragging ? "border-sky-400 bg-sky-50 scale-[1.01]" : "border-slate-200 bg-slate-50 hover:border-primBtn hover:bg-sky-50/40"}`}
        >
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFileChange} />
          <div className="w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center text-primBtn">
            <FontAwesomeIcon icon={faUpload} size="lg" />
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-700">Drag & drop your Excel / CSV file here</p>
            <p className="text-xs text-slate-500 mt-1">or click to browse — .xlsx, .xls, .csv supported</p>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        {rows.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total",      val: rows.length,  cls: "bg-slate-100 text-slate-700" },
              { label: "Valid",      val: validCount,   cls: "bg-emerald-50 text-emerald-700" },
              { label: "Errors",     val: errorCount,   cls: "bg-rose-50 text-rose-700" },
              { label: "Registered", val: successCount, cls: "bg-sky-50 text-sky-700" },
            ].map(({ label, val, cls }) => (
              <div key={label} className={`${cls} rounded-2xl p-4 flex flex-col items-center`}>
                <span className="text-3xl font-black">{val}</span>
                <span className="text-xs font-medium mt-1">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Table ── */}
        {rows.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left font-bold text-slate-600 whitespace-nowrap">#</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 whitespace-nowrap">Child Name</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 whitespace-nowrap">Grade</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 whitespace-nowrap">Gender</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 whitespace-nowrap">Parent</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, i) => (
                    <>
                      {/* ── Main data row ── */}
                      <tr
                        key={row.id}
                        className={`transition-colors ${
                          row.status === "success"    ? "bg-emerald-50/40" :
                          row.status === "failed"     ? "bg-rose-50/40" :
                          row.errors.length > 0       ? "bg-rose-50/30" :
                          "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                          {row.data.childFirstName} {row.data.childLastName}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{row.data.Grade || "—"}</td>
                        <td className="px-4 py-3 capitalize text-slate-600">{row.data.gender || "—"}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {row.data.parentFirstName
                            ? `${row.data.parentFirstName} ${row.data.parentLastName || ""}`
                            : <span className="text-slate-400 italic text-xs">None</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <StatusBadge status={row.status} />
                            {row.serverMsg && (
                              <span className="text-xs text-slate-500">{row.serverMsg}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {(row.status === "valid" || row.status === "failed") && (
                              <button
                                onClick={() => submitRow(row)}
                                title="Submit this row"
                                className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 hover:bg-sky-200 flex items-center justify-center transition-colors"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} size="xs" />
                              </button>
                            )}
                            {row.status === "loading" && (
                              <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
                                <FontAwesomeIcon icon={faSpinner} spin className="text-sky-500 text-xs" />
                              </div>
                            )}
                            {row.status !== "loading" && row.status !== "success" && (
                              <button
                                onClick={() => removeRow(row.id)}
                                title="Remove row"
                                className="w-8 h-8 rounded-xl bg-rose-100 text-rose-500 hover:bg-rose-200 flex items-center justify-center transition-colors"
                              >
                                <FontAwesomeIcon icon={faTrash} size="xs" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* ── Inline error chips — always visible when errors exist ── */}
                      {row.errors.length > 0 && (
                        <tr key={`err-${row.id}`} className="bg-rose-50 border-b-2 border-rose-200">
                          <td colSpan={7} className="px-6 pb-3 pt-1">
                            <div className="flex flex-wrap gap-2">
                              {row.errors.map((e, ei) => (
                                <span
                                  key={ei}
                                  className="inline-flex items-center gap-1.5 text-xs bg-white border border-rose-300 text-rose-600 px-2.5 py-1 rounded-lg"
                                >
                                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-rose-400 text-[10px]" />
                                  {e}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Actions Bar ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => { setRows([]); if (inputRef.current) inputRef.current.value = ""; }}
                className="flex items-center gap-2 text-slate-500 hover:text-rose-500 font-bold transition-colors text-sm"
              >
                <FontAwesomeIcon icon={faTimesCircle} /> Clear All
              </button>

              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">
                  {validCount} of {rows.length} rows ready
                </span>
                <button
                  onClick={submitAll}
                  disabled={validCount === 0}
                  className="bg-primBtn disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-sky-200 hover:bg-Hover hover:scale-105 transition-all flex items-center gap-3"
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Register All ({validCount})
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Column guide ── */}
        <details className="rounded-2xl border border-slate-200 overflow-hidden">
          <summary className="px-5 py-4 cursor-pointer font-bold text-slate-600 text-sm bg-slate-50 hover:bg-slate-100 transition-colors list-none flex items-center justify-between">
            <span>📋 Required Excel column names</span>
            <span className="text-xs font-normal text-slate-400">click to expand</span>
          </summary>
          <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
            {REQUIRED_COLUMNS.map((c) => (
              <div key={c} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></span>
                <code className="bg-slate-100 px-2 py-1 rounded-lg text-slate-700 font-mono">{c}</code>
                <span className="text-rose-500 text-[10px]">required</span>
              </div>
            ))}
            {OPTIONAL_COLUMNS.map((c) => (
              <div key={c} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
                <code className="bg-slate-100 px-2 py-1 rounded-lg text-slate-700 font-mono">{c}</code>
                <span className="text-slate-400 text-[10px]">optional</span>
              </div>
            ))}
          </div>
        </details>

      </div>
    </div>
  );
};

export default BulkRegisterChildren;