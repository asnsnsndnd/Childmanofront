import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash, faExclamationTriangle,
  faCheckCircle, faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';

import { useDeleteChildMutation } from '../../../Redux/Childes';
import { useSelector } from 'react-redux';
import { useGetPermissionsOwnQuery } from '../../../Redux/Employee';

// ── tiny in-component toast ──────────────────────────────────
const Toast = ({ type, message }) => {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    error:   'bg-red-50   border-red-200   text-red-600',
  };
  const icons = {
    success: <FontAwesomeIcon icon={faCheckCircle}  className="text-emerald-500 text-base shrink-0" />,
    error:   <FontAwesomeIcon icon={faTimesCircle}  className="text-red-500 text-base shrink-0" />,
  };
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[600] flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-lg text-sm font-semibold ${styles[type]}`}
      style={{ animation: 'toastUp .25s cubic-bezier(.34,1.56,.64,1) both' }}
    >
      {icons[type]}
      {message}
      <style>{`
        @keyframes toastUp {
          from { opacity:0; transform:translateX(-50%) translateY(12px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
const ChildrenTable = ({ childrenData, selectedIds, onToggleSelect, onToggleAll }) => {
  const [deleteChild]  = useDeleteChildMutation();
  const { role } = useSelector((state) => state.auth);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting,   setIsDeleting]   = useState(false);
  const [toast,        setToast]        = useState(null);
 const {data:newperm}=useGetPermissionsOwnQuery()
  // ── derived selection state ──
  const allSelected =
    childrenData?.length > 0 &&
    childrenData.every((c) => selectedIds.includes(c._id));
  const someSelected =
    childrenData?.some((c) => selectedIds.includes(c._id)) && !allSelected;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };
   const [permissions,Setnewperm]=useState({})
  
  useEffect(()=>{
   
  Setnewperm(newperm?.data)
  },[newperm])

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteChild({ id: deleteTarget._id }).unwrap();
      setDeleteTarget(null);
      showToast('success', `${deleteTarget.childFirstName} ${deleteTarget.childLastName} deleted successfully`);
    } catch (err) {
      showToast('error', err?.data?.msg || 'Delete failed. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  const canDeleteChild    = role === 'Admin' || permissions?.childDelete === true;

  return (
    <>
      {/* ── Toast notification ── */}
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* ══════════════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ══════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          />

          {/* dialog */}
          <div
            className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            style={{ animation: 'ctFadeUp .22s cubic-bezier(.34,1.56,.64,1) both' }}
          >
            {/* red top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-400 to-red-600" />

            <div className="p-8 flex flex-col items-center gap-5">
              {/* icon */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                  <div className="w-[52px] h-[52px] rounded-full bg-red-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faTrash} className="text-red-500 text-xl" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-white text-[10px]" />
                </div>
              </div>

              {/* text */}
              <div className="text-center space-y-2">
                <h3 className="text-[17px] font-extrabold text-slate-900 tracking-tight">
                  Delete Student?
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  You are about to permanently delete{' '}
                  <span className="font-bold text-slate-800">
                    {deleteTarget.childFirstName} {deleteTarget.childLastName}
                  </span>
                  . All records and files will be lost.
                </p>
              </div>

              {/* student mini-card */}
              <div className="flex items-center gap-3 w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                <img
                  src={
                    deleteTarget.Childfile?.[0]?.mediaurl ||
                    `https://ui-avatars.com/api/?name=${deleteTarget.childFirstName}+${deleteTarget.childLastName}&background=random`
                  }
                  alt={deleteTarget.childFirstName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {deleteTarget.childFirstName} {deleteTarget.childLastName}
                  </p>
                  <p className="text-xs text-slate-400">
                    Grade {deleteTarget.Grade} &nbsp;·&nbsp;
                    {deleteTarget.gender === 'female' ? 'Female' : 'Male'}
                  </p>
                </div>
              </div>

              {/* divider */}
              <div className="w-full border-t border-slate-100" />

              {/* loading state message */}
              {isDeleting && (
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-primBtn rounded-full animate-spin" />
                  Deleting student and all associated files…
                </div>
              )}

              {/* actions */}
              <div className="flex gap-3 w-full">
                <button
                  disabled={isDeleting}
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-100 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTrash} className="text-xs" />
                      Yes, Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes ctFadeUp {
              from { opacity:0; transform:translateY(16px) scale(.96); }
              to   { opacity:1; transform:translateY(0)    scale(1);   }
            }
          `}</style>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TABLE
      ══════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 max-md:overflow-auto overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">

              {/* ── SELECT-ALL CHECKBOX ── */}
              <th className="px-4 py-4 flex flex-col w-10">
                <p>All</p>

                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={() =>
                    onToggleAll(childrenData?.map((c) => c._id) ?? [])
                  }
                  className="w-4 h-4 accent-primBtn cursor-pointer rounded"
                  title="Select / deselect all visible rows"
                />
              </th>

              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Photo</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Phone</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Phone</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {childrenData?.map((child) => {
              const isChecked = selectedIds.includes(child._id);
              return (
                <tr
                  key={child._id}
                  className={`transition-colors group ${
                    isChecked
                      ? 'bg-blue-50/70'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* ── ROW CHECKBOX ── */}
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleSelect(child._id)}
                      className="w-4 h-4 accent-primBtn cursor-pointer rounded"
                    />
                  </td>

                  <td className="px-6 py-4">
                    <img
                      src={
                        child.Childfile?.[0]?.mediaurl ||
                        `https://ui-avatars.com/api/?name=${child.childFirstName}+${child.childLastName}&background=random`
                      }
                      alt={child.childFirstName}
                      className="w-10 h-10 rounded-full object-contain border-2 border-white shadow-sm"
                    />
                  </td>

                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {child.childFirstName} {child.childLastName}
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[11px] font-bold border border-blue-100">
                      {child.Grade}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {child.gender === 'female' ? (
                      <span className="text-[11px] font-medium text-pink-600 bg-pink-50 px-2 py-0.5 rounded border border-pink-100">Female</span>
                    ) : (
                      <span className="text-[11px] font-medium text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">Male</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600 tabular-nums">
                    {child.childPhone || 'N/A'}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-slate-800 tabular-nums">
                    {child.parentPhone}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {canDeleteChild && (
                        <button
                          onClick={() => setDeleteTarget(child)}
                          className="w-9 h-9 rounded-lg border border-red-200 bg-white text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center"
                          title="Delete student"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      )}
                      <Link to={`/ChildSingle/${child._id}`}>
                        <button className="bg-primBtn cursor-pointer hover:bg-Hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2">
                          View <span>&rarr;</span>
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {childrenData?.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-400 font-medium">No matching records found.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ChildrenTable;