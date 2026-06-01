import React from 'react';
import { FaFilePdf, FaFileExcel, FaSearch, FaTimes } from 'react-icons/fa';

const SidebarActions = ({
  searchTerm,
  setSearchTerm,
  gradeFilter,
  setGradeFilter,
  genderFilter,
  setGenderFilter,
  selectedCount,   // number of checked rows (0 = export all filtered)
  onExportPDF,
  onExportExcel,
}) => {

  const handleClear = () => {
    setSearchTerm('');
    setGradeFilter('All');
    setGenderFilter('All');
  };

  const isFiltered = searchTerm !== '' || gradeFilter !== 'All' || genderFilter !== 'All';

  // Badge shown on export buttons when rows are manually selected
  const SelectionBadge = () =>
    selectedCount > 0 ? (
      <span className="ml-1.5 inline-flex items-center justify-center bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
        {selectedCount}
      </span>
    ) : null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full">

      {/* ── Filters panel ── */}
      <div className="bg-white p-6 w-full lg:w-3/4 rounded-2xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">

          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search name..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primBtn/20 focus:border-primBtn outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primBtn/20 text-slate-600 bg-slate-50 font-medium cursor-pointer"
          >
            <option value="All">All Education Levels</option>
            <optgroup label="General Ranges">
              <option value="Under 8">Under Grade 8</option>
              <option value="9-12">Grade 9 - 12</option>
              <option value="University">University / College</option>
            </optgroup>
            <optgroup label="Specific Grade Level">
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={(i + 1).toString()}>
                  Grade {i + 1}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primBtn/20 text-slate-600 bg-slate-50 font-medium cursor-pointer"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={handleClear}
            disabled={!isFiltered}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border-2 ${
              isFiltered
                ? 'text-red-500 border-red-100 hover:bg-red-50 cursor-pointer'
                : 'text-slate-300 border-transparent cursor-not-allowed opacity-50'
            }`}
          >
            <FaTimes />
            CLEAR FILTERS
          </button>
        </div>

        {/* ── Selection hint ── */}
        {selectedCount > 0 && (
          <p className="mt-4 text-xs text-blue-600 font-medium">
            {selectedCount} row{selectedCount > 1 ? 's' : ''} selected — exports will include only these rows.
          </p>
        )}
        {selectedCount === 0 && (
          <p className="mt-4 text-xs text-slate-400">
            No rows selected — exports will include all filtered results.
          </p>
        )}
      </div>

      {/* ── Export buttons ── */}
      <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto">

        <button
          onClick={onExportPDF}
          className="flex cursor-pointer gap-3 items-center flex-1 lg:w-56 p-3 border-2 border-slate-100 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all group bg-white shadow-sm"
        >
          <div className="bg-red-600 p-2 rounded-lg text-white shadow-md shadow-red-100">
            <FaFilePdf size={18} />
          </div>
          <span className="font-bold text-[10px] text-slate-700 flex items-center">
            PDF REPORT
            <SelectionBadge />
          </span>
        </button>

        <button
          onClick={onExportExcel}
          className="flex items-center cursor-pointer gap-3 flex-1 lg:w-56 p-3 border-2 border-slate-100 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all group bg-white shadow-sm"
        >
          <div className="bg-green-600 p-2 rounded-lg text-white shadow-md shadow-green-100">
            <FaFileExcel size={18} />
          </div>
          <span className="font-bold text-[10px] text-slate-700 flex items-center">
            EXCEL REPORT
            <SelectionBadge />
          </span>
        </button>

      </div>
    </div>
  );
};

export default SidebarActions;