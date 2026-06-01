import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimesCircle, 
  faUpload, 
  faFileLines, 
  faCalendarAlt, 
  faUserPlus, 
  faCheckDouble,
  faChevronDown
} from "@fortawesome/free-solid-svg-icons";

const CreateTask = () => {
  const [files, setFiles] = useState([]);
  const [tempFiles, setTempFiles] = useState([]);

  const handleTempFileChange = (e) => {
    setTempFiles(Array.from(e.target.files));
  };

  const handleAddFiles = () => {
    setFiles((prev) => [...prev, ...tempFiles]);
    setTempFiles([]);
  };

  const handleSetFiles = () => {
    setFiles([...tempFiles]);
    setTempFiles([]);
  };

  const handleCancel = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex justify-center items-start animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <form className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-white shadow-[0_32px_64px_-15px_rgba(0,0,0,0.05)] rounded-[48px] p-8 md:p-12 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-[20px] flex items-center justify-center shadow-lg shadow-blue-200 rotate-3">
            <FontAwesomeIcon icon={faCheckDouble} className="text-2xl" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assign New Task</h1>
          <p className="text-slate-500 font-medium max-w-xs">Fill in the details below to delegate tasks to your staff members.</p>
        </div>

        {/* Input Groups */}
        <div className="space-y-6">
          {/* Title Field */}
          <div className="group space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Task Heading</label>
            <input
              type="text"
              placeholder="e.g. Student Progress Reports"
              className="w-full h-14 px-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assign To */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                <FontAwesomeIcon icon={faUserPlus} className="text-blue-500" /> Assignee
              </label>
              <div className="relative">
                <select className="w-full h-14 px-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-100 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer">
                  <option value="">Select Employee</option>
                  <option value="yimesgen">Yimesgen</option>
                  <option value="tigsten">Tigsten</option>
                  <option value="adanechi">Adanechi</option>
                </select>
                <FontAwesomeIcon icon={faChevronDown} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs" />
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-rose-500" /> Due Date
              </label>
              <input
                type="date"
                className="w-full h-14 px-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-100 outline-none transition-all font-bold text-slate-700"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Task Objectives</label>
            <textarea
              placeholder="Provide clear instructions for this task..."
              className="w-full h-32 px-6 py-4 rounded-[32px] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-100 outline-none transition-all font-medium text-slate-700 resize-none"
            />
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-4">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Attachments</label>
          
          <label
            htmlFor="file"
            className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-200 rounded-[40px] p-10 text-slate-400 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
          >
            <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
              <FontAwesomeIcon icon={faUpload} className="text-lg" />
            </div>
            <div className="text-center">
              <p className="font-black text-slate-700">Drop files here or click</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">PDF, DOCX, PNG (Max 10MB)</p>
            </div>
          </label>

          <input id="file" type="file" multiple onChange={handleTempFileChange} className="hidden" />

          {/* Staging UI (UX Improvement) */}
          {tempFiles.length > 0 && (
            <div className="flex items-center justify-between bg-slate-900 p-4 rounded-3xl animate-in zoom-in-95 shadow-xl shadow-slate-200">
              <div className="flex items-center gap-3 pl-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-white text-xs font-black uppercase tracking-wider">{tempFiles.length} New files ready</span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleSetFiles} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-2xl text-[10px] font-black transition-all">REPLACE</button>
                <button type="button" onClick={handleAddFiles} className="bg-blue-600 text-white px-4 py-2 rounded-2xl text-[10px] font-black transition-all">CONFIRM</button>
              </div>
            </div>
          )}

          {/* File Grid */}
          {files.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-3xl group hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faFileLines} />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-black text-slate-800 truncate">{file.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={() => handleCancel(index)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                    <FontAwesomeIcon icon={faTimesCircle} size="lg" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
          <button type="button" className="text-slate-400 hover:text-slate-900 font-black text-[11px] uppercase tracking-[2px] px-4 transition-all">
            Discard
          </button>
          <button
            type="submit"
            className="h-16 px-10 bg-blue-600 text-white rounded-[24px] font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
          >
            Deploy Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;