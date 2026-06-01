
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleArrowLeft,
  faCircleArrowRight,
  faEllipsis,
  faTimes,
  faEllipsisVertical,
  faXmark,
  faCamera, 
  faChevronLeft,
  faChevronRight,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";

// --- Simple UI Components ---

export const Spinner = () => (
  <div className="w-10 h-10 border-4 border-primBtn border-t-transparent rounded-full animate-spin" />
);

export const SectionTitle = ({ title }) => (
  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
    {title}
  </h2>
);

// Refined Input with White Background and Subtle Shadows
export const LabelInput = forwardRef(({ label, ...props }, ref) => (
  <div className="flex flex-col w-full mb-4">
    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1 mb-1.5">
      {label}
    </label>
    <input
      {...props}
      ref={ref}
      className="h-11 rounded-lg px-4 border border-gray-200 bg-white text-gray-800 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primBtn focus:border-primBtn disabled:bg-gray-50 disabled:text-gray-600"
    />
  </div>
));



export const Textarea = forwardRef(({ label, ...props }, ref) => {
  const innerRef = useRef(null);

  // Combine the forwarded ref with our local internal ref
  const setRefs = (node) => {
    innerRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const handleAutoResize = (e) => {
    const target = e.target;
    // Reset height to auto to allow it to shrink if text is deleted
    target.style.height = "auto";
    // Set height to the scroll height (the total height of content)
    target.style.height = `${target.scrollHeight}px`;
  };

  // Initial resize on mount (if there is default text)
  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.style.height = "auto";
      innerRef.current.style.height = `${innerRef.current.scrollHeight}px`;
    }
  }, [props.value, props.defaultValue]);

  return (
    <div className="flex flex-col w-full mb-4">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-900 ml-1 mb-1.5">
        {label}
      </label>
      <textarea
        {...props}
        ref={setRefs}
        onInput={handleAutoResize}
        style={{ overflowY: "hidden" }} // Prevents scrollbar flickering
        className={`
          w-full min-h-[100px] rounded-lg border border-gray-200 bg-white 
          px-4 py-3 text-gray-800 shadow-sm transition-all 
          focus:outline-none focus:ring-2 focus:ring-primBtn focus:border-primBtn
          disabled:bg-gray-50 disabled:text-gray-600 resize-none
        `}
      />
    </div>
  );
});

// --- Image Slider Component ---











export const ImageSlider = ({
  type,
  uploadProfileLoading,
  images,
  ProfileControle,
  file,
  setFiles,
  handleUpload,
  isProfileControlDisplay,
  setIsProfileControlDisplay,
  currentIndex,
  onPrev,
  onNext,
  showFull,
  handleImageIcon,
  isLoadingDeleteFile,
  toggleShow,
  canEditChild,
  canDeleteChild
}) => {

  const hasImages = images && images.length > 0;
  const currentImage = hasImages ? images[currentIndex] : null;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteData, setPendingDeleteData] = useState(null);

  const { role, permissions } = useSelector((state) => state.auth);

  // ── Permission flags ──────────────────────────────────────────────────────

  const canUpload      = canEditChild;
  const canDeleteFile  =  canDeleteChild;

  // ── Filter dropdown controls based on permissions ─────────────────────────
  const visibleControls = (ProfileControle || []).filter((control) => {
    if (control.type === "delet")  return canDeleteFile;
    if (control.type === "upload") return canUpload;
    return true; // show any other control types always
  });

  // --- Empty State ---
  if (!hasImages) {
    return (
      <div className="w-48 h-48 md:w-64 md:h-64 mx-auto relative group">
        {canUpload ? (
          <label
            htmlFor={type === "parent" ? "ProfileUploadParent" : "ProfileUpload"}
            className="flex flex-col items-center justify-center w-full h-full rounded-[2.5rem] border-4 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-primBtn transition-all duration-300 shadow-inner"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-blue-100 text-primBtn">
                <FontAwesomeIcon icon={faCamera} className="text-xl" />
              </div>
              <p className="text-sm font-bold text-slate-500">No Photo</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter mt-1">Click to Upload</p>
            </div>
            <input
              type="file"
              id={type === "parent" ? "ProfileUploadParent" : "ProfileUpload"}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files[0]) setFiles(e.target.files[0]);
              }}
            />
          </label>
        ) : (
          // No permission — show plain placeholder, no upload affordance
          <div className="flex flex-col items-center justify-center w-full h-full rounded-[2.5rem] border-4 border-dashed border-slate-200 bg-slate-50 shadow-inner">
            <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FontAwesomeIcon icon={faCamera} className="text-xl" />
            </div>
            <p className="text-sm font-bold text-slate-400">No Photo</p>
          </div>
        )}

        {file && (
          <UploadPreviewModal
            file={file}
            setFiles={setFiles}
            uploadProfileLoading={uploadProfileLoading}
            handleUpload={handleUpload}
            type={type}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-500 ease-in-out ${
        showFull
          ? "fixed inset-0 p-4 md:p-10 bg-black/50 backdrop-blur-xl z-[999] flex items-center justify-center"
          : "w-48 h-48 md:w-64 md:h-64 mx-auto relative"
      }`}
    >
      <div
        className={`relative group w-full h-full overflow-hidden shadow-2xl transition-all duration-300 ${
          showFull ? "max-w-4xl max-h-[90vh]" : "rounded-[2.5rem] border-4 border-white"
        }`}
      >
        <img
          src={currentImage?.mediaurl}
          alt="Profile"
          onClick={toggleShow}
          className="w-full h-full cursor-pointer transition-transform duration-700 hover:scale-105 object-contain"
        />

        {!showFull && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        )}

        {/* Navigation Buttons */}
        {images.length > 1 && currentIndex > 0 && (
          <button
            type="button"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/50 hover:scale-110 transition-all shadow-lg"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        )}

        {images.length > 0 && currentIndex < images.length - 1 && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/50 hover:scale-110 transition-all shadow-lg"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        )}

        {/* Menu Button — only show if employee has at least one permission */}
        {(canUpload || canDeleteFile) && (
          <div className="absolute top-4 right-4 z-30 flex gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileControlDisplay(!isProfileControlDisplay);
              }}
              className="w-10 h-10 rounded-full bg-primBtn backdrop-blur-md text-white hover:bg-Hover cursor-pointer transition-all flex items-center justify-center shadow-lg"
            >
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>

            {showFull && (
              <button
                onClick={toggleShow}
                className="w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faXmark} className="text-2xl" />
              </button>
            )}
          </div>
        )}

        {/* Close button when fullscreen but no menu button shown */}
        {!(canUpload || canDeleteFile) && showFull && (
          <button
            onClick={toggleShow}
            className="absolute top-4 right-4 z-30 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faXmark} className="text-2xl" />
          </button>
        )}

        {/* Dropdown Menu */}
        {isProfileControlDisplay && visibleControls.length > 0 && (
          <div className="absolute right-4 top-16 z-50 bg-white/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl w-48 overflow-hidden">
            {visibleControls.map((control) => (
              <button
                key={control.id}
                type="button"
                onClick={() => {
                  if (control.type === "delet") {
                    setPendingDeleteData({
                      mediaurl:    currentImage?.mediaurl,
                      public_id:   currentImage?.public_id,
                      controlType: control.type,
                      itemType:    type,
                    });
                    setIsDeleteModalOpen(true);
                  } else {
                    handleImageIcon(currentImage?.mediaurl, currentImage?.public_id, control.type, type);
                  }
                  setIsProfileControlDisplay(false);
                }}
                className={`w-full flex px-5 py-3.5 items-center gap-3 transition-all text-sm font-bold
                  ${control.type === "delet"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-700 hover:bg-primBtn hover:text-white"}`}
              >
                <FontAwesomeIcon icon={control.icon} className="w-4 opacity-70" />
                {control.text}
              </button>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-50 text-red-600 mb-4">
                <FontAwesomeIcon icon={faTrash} className="text-xl" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Permanently delete file?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Once you delete this file, you will not be able to recover it. Are you sure you want to proceed?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setPendingDeleteData(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-all w-full"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (pendingDeleteData) {
                      const { mediaurl, public_id, controlType, itemType } = pendingDeleteData;
                      handleImageIcon(mediaurl, public_id, controlType, itemType);
                    }
                    setIsDeleteModalOpen(false);
                    setPendingDeleteData(null);
                  }}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-red-600/20 transition-all w-full"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Loading Overlay */}
        {isLoadingDeleteFile && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="text-white text-[10px] font-black mt-3 uppercase tracking-widest text-center">Deleting...</span>
          </div>
        )}
      </div>

      {/* Hidden File Input — only rendered if canUpload */}
      {canUpload && (
        <input
          type="file"
          id={type === "parent" ? "ProfileUploadParent" : "ProfileUpload"}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files[0]) {
              setFiles(e.target.files[0]);
              setIsProfileControlDisplay(false);
            }
          }}
        />
      )}

      {/* Upload Preview Modal */}
      {file && (
        <UploadPreviewModal
          file={file}
          setFiles={setFiles}
          uploadProfileLoading={uploadProfileLoading}
          handleUpload={handleUpload}
          type={type}
        />
      )}
    </div>
  );
};

// ── Upload Preview Modal ──────────────────────────────────────────────────────
const UploadPreviewModal = ({ file, setFiles, uploadProfileLoading, handleUpload, type }) => (
  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[1000] p-6">
    <div className="bg-white rounded-[3rem] p-8 max-w-sm w-full shadow-2xl transform animate-in slide-in-from-bottom-12">
      <h3 className="text-2xl font-black text-slate-900 text-center mb-6">Preview Photo</h3>
      <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-8 ring-8 ring-slate-50 shadow-inner">
        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
        {uploadProfileLoading && (
          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primBtn border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <button
          disabled={uploadProfileLoading}
          onClick={() => setFiles(null)}
          className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl"
        >
          Cancel
        </button>
        <button
          disabled={uploadProfileLoading}
          onClick={() => handleUpload(file, type)}
          className="flex-[2] py-4 bg-primBtn text-white font-bold rounded-2xl shadow-xl"
        >
          {uploadProfileLoading ? "Saving..." : "Save Photo"}
        </button>
      </div>
    </div>
  </div>
);
export const MyProfileImage = (props) => {
  return <ImageSlider {...props} type="parent" handleUpload={props.handleUploadParentFile} handleImageIcon={props.handleImageIconParent} />;
};