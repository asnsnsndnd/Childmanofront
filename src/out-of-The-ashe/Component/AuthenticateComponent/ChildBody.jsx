import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FileGallery } from "./FileGalleryChild";
import { 
  faSearch, 
  faUpload, 
  faTimes, 
  faEdit, 
  faSave, 
  faChevronDown,
  faPlus,
  faHistory,
  faTrash
} from "@fortawesome/free-solid-svg-icons";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ImageSlider, SectionTitle, LabelInput, Textarea, MyProfileImage } from "./ChidlComponent";
import {
  useEditOtherRecordMutation,
  useDeleteOtherRecordMutation,
  useDeleteOtherRecordFileMutation,
  useUploadOtherRecordFilesMutation,
} from '../../Redux/Childes';

import ChildOtherForm from "./ChildOtherForm";
import { useSelector } from "react-redux";
import { useGetPermissionsOwnQuery } from "../../Redux/Employee";

export const Childbody = ({
  childInfo,
  otherData,
  checkData,
  years,
  editMode,
  saving,
  imageIndex,
  setImageIndex,
  showImage,
  setShowImage,
  showFirstForm,
  setShowFirstForm,
  FileUpload,
  setFileUpload,
  isProfileControlDisplay,
  setIsProfileControlDisplay,
  isParentProfileControlDispaly,
  setParentControlDisplay,
  Childupdating,
  uploadProfileLoading,
  isLoadingChildOtherFile,
  isLoadingDeleteFile,
  fileChild,
  setFilesChild,
  fileParent,
  setFilesParent,
  register,
  handleSubmit,
  reset,
  childInputRef,
  ChildTextRef,
  ParentTextRef,
  Selectvalue,
  descriptionTextRef,
  handleChange,
  handleCancel,
  handleSave,
  handleEditToggle,
  handleUpload,
  handleUploadParentFile,
  handleImageIcon,
  handleImageIconParent,
  handleFile,
  handleStoreFile,
  handleform,
  handleSearchbyselect,
  SearchDataBySearch,
  calculateAge,
  adjustTextAreaHeight,
  ProfileControle,
  errors
}) => {
  
  const [filterData, setFilterData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ title: "", description: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { role} = useSelector((state) => state.auth);
  const {data:newperm}=useGetPermissionsOwnQuery()
  const [permissions,Setnewperm]=useState({})

useEffect(()=>{
 
Setnewperm(newperm?.data)
},[newperm])
  // ── Permission flags ──────────────────────────────────────────────────────
  const isAdmin        = role === "Admin";
  const canEditChild   = isAdmin || permissions?.childUpdate   === true;
  const canDeleteChild = isAdmin || permissions?.childDelete   === true;
  const canAddRecord   = isAdmin || permissions?.childRegister === true;


  // RTK Mutations Setup
  const [editOtherRecord,   { isLoading: isEditing }]       = useEditOtherRecordMutation();
  const [deleteOtherRecord, { isLoading: isDeletingRecord }] = useDeleteOtherRecordMutation();
  const [deleteOtherRecordFile, { isLoading: isDeletingFile }] = useDeleteOtherRecordFileMutation();
  const [uploadOtherRecordFiles, { isLoading: isUploading }] = useUploadOtherRecordFilesMutation();

  const isLoading = 
    Childupdating || 
    uploadProfileLoading || 
    isLoadingChildOtherFile || 
    isEditing || 
    isDeletingRecord || 
    isDeletingFile || 
    isUploading;

  const handleEditStart = (data, index) => {
    setEditingId(index);
    setEditValues({ title: data.title || "", description: data.description || "" });
  };

  // ── 1. Edit Record ───────────────────────────────────────────
  const handleEditSave = async (data) => {
    const editPromise = editOtherRecord({
      childId:     childInfo._id,
      recordId:    data._id,
      title:       editValues.title,
      description: editValues.description,
    }).unwrap();

    toast.promise(editPromise, {
      pending: 'Updating record information... ⏳',
      success: 'Record updated successfully! 🎉',
      error: {
        render({ data: err }) {
        
          
          return `❌ Error: ${err?.data?.msg || err?.message || 'Could not update record'}`;
        }
      }
    });

    try {
      await editPromise;
      setEditingId(null);
    } catch (err) {
      console.error('Edit save failed:', err);
    }
  };

  // ── 2. Delete Entire Record ──────────────────────────────────
  const handleDeleteRecord = async (data) => {
    const deletePromise = deleteOtherRecord({
      childId:  childInfo._id,
      recordId: data._id,
    }).unwrap();

    toast.promise(deletePromise, {
      pending: 'Deleting record and all associated files... ⏳',
      success: 'Record deleted successfully! 🗑️',
      error: {
        render({ data: err }) {
          return `❌ Error: ${err?.data?.msg || err?.message || 'Could not delete record'}`;
        }
      }
    });

    try {
      await deletePromise;
      setFilterData(prev => prev.filter(d => d._id !== data._id));
    } catch (err) {
      console.error('Delete record failed:', err);
    }
  };

  // ── 3. Delete Single File Inside Record ──────────────────────
  const handleDeleteOtherFile = async (fil, recordId) => {
    const deleteFilePromise = deleteOtherRecordFile({
      public_id: fil.public_id,
      recordId,
    }).unwrap();

    toast.promise(deleteFilePromise, {
      pending: 'Deleting file... ⏳',
      success: 'File deleted successfully! 📄',
      error: {
        render({ data: err }) {
          return `❌ Error: ${err?.data?.msg || err?.message || 'Could not delete file'}`;
        }
      }
    });

    try {
      await deleteFilePromise;
    } catch (err) {
      console.error('Delete file failed:', err);
    }
  };

  // ── 4. Upload Files Into Existing Record ─────────────────────
  const handleUploadOtherFiles = async (files, recordId) => {
    const formData = new FormData();
    formData.append('childId',  childInfo._id);
    formData.append('recordId', recordId);
    files.forEach(f => formData.append('files', f));

    const uploadPromise = uploadOtherRecordFiles(formData).unwrap();

    toast.promise(uploadPromise, {
      pending: 'Uploading new files to server... 📤',
      success: 'Files uploaded successfully! ✅',
      error: {
        render({ data: err }) {
          return `❌ Error: ${err?.data?.msg || err?.message || 'Could not upload files'}`;
        }
      }
    });

    try {
      await uploadPromise;
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValues({ title: "", description: "" });
  };

  useEffect(() => {
    console.log(childInfo);
  }, [childInfo]);

  useEffect(() => {
    setFilterData(otherData);
  }, [otherData]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 selection:bg-blue-100">

      {/* Loading Backdrop */}
      {isLoading && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-all">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primBtn border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-lg font-semibold text-primBtn animate-pulse">Processing Data...</p>
        </div>
      )}

      <ToastContainer theme="light" position="top-center" autoClose={3000} />

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-10">
        
        {/* Header / Profile Card */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="shrink-0">
              <ImageSlider
                type={"child"}
                uploadProfileLoading={uploadProfileLoading}
                images={(childInfo?.Childfile || []).slice().reverse()}
                ProfileControle={ProfileControle}
                file={fileChild}
                setFiles={setFilesChild}
                handleUpload={handleUpload}
                currentIndex={imageIndex.child}
                isProfileControlDisplay={isProfileControlDisplay}
                setIsProfileControlDisplay={setIsProfileControlDisplay}
                onPrev={() => setImageIndex((prev) => ({ ...prev, child: Math.max(0, prev.child - 1) }))}
                onNext={() => setImageIndex((prev) => ({
                  ...prev,
                  child: Math.min((childInfo?.Childfile?.length || 1) - 1, prev.child + 1),
                }))}
                showFull={showImage.child}
                handleImageIcon={handleImageIcon}
                isLoadingDeleteFile={isLoadingDeleteFile}
                toggleShow={() => setShowImage((prev) => ({ ...prev, child: !prev.child }))}
                canEditChild={canEditChild}
                canDeleteChild={ canDeleteChild}
                

              />
            </div>

            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-primBtn text-xs font-bold uppercase tracking-widest mb-2">
                Student Profile
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight capitalize">
                {childInfo?.childFirstName} {childInfo?.childLastName}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500 text-sm">
                <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <span className="text-slate-400 mr-2">Age</span>
                  <span className="text-slate-900 font-semibold">{calculateAge(childInfo?.childBirthDay)} yrs</span>
                </div>
                <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <span className="text-slate-400 mr-2">Grade</span>
                  <span className="text-slate-900 font-semibold">{childInfo?.Grade}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Grid */}
        <div className={`${childInfo.parentFirstName ? "lg:grid-cols-2 grid" : "flex"} grid-cols-1 lg:grid-cols-2 gap-8`}>

          {/* Child Details Form */}
          <div className="bg-white w-full border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <SectionTitle title="Child Details" />
              <div className="flex gap-2">
                {!editMode.child ? (
                  <>
                    <button
                      className="text-xs font-bold bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 transition-all"
                      onClick={() => handleCancel("child")}
                    >
                      Cancel
                    </button>
                    <button
                      className="text-xs font-bold bg-primBtn text-white px-4 py-2 rounded-lg hover:bg-Hover transition-all shadow-md shadow-blue-200"
                      onClick={() => handleSave("child")}
                      disabled={saving.child}
                    >
                      {saving.child ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : canEditChild ? (
                  <button
                    className="text-xs font-bold bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:border-primBtn hover:text-primBtn transition-all flex items-center gap-2"
                    onClick={() => handleEditToggle("child", editMode.child)}
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-[10px]" /> Edit
                  </button>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LabelInput label="First Name"           name="childFirstName"    value={childInfo?.childFirstName    || ""} disabled={editMode.child}  onChange={handleChange} ref={childInputRef} />
              <LabelInput label="Last Name"            name="childLastName"     value={childInfo?.childLastName     || ""} disabled={editMode.child}  onChange={handleChange} />
              <LabelInput label="Gender"               name="gender"            value={childInfo?.gender            || ""} disabled={editMode.child}  onChange={handleChange} />
              <LabelInput label="Birth Day"  type="date" name="BirthDay"        value={childInfo?.childBirthDay     || ""} disabled={editMode.child}  onChange={handleChange} />
              <LabelInput label="Phone Number"         name="childPhone"        value={childInfo?.childPhone        || ""} disabled={editMode.child}  onChange={handleChange} />
              <LabelInput label="Child Register Date" type="date" name="childRegisterDate" value={childInfo?.childRegisterDate || ""} disabled={editMode.child} onChange={handleChange} />
              <LabelInput label="Grade Level"          name="Grade"             value={childInfo?.Grade             || ""} disabled={editMode.child}  onChange={handleChange} />
            </div>

            <Textarea
              label="Internal Medical/Growth Notes"
              name="ChildDescription"
              value={childInfo?.ChildDescription || ""}
              disabled={editMode.child}
              onChange={handleChange}
              ref={ChildTextRef}
            />
          </div>

          {/* Parent Details Form */}
          {(childInfo.parentFirstName || childInfo?.parentLastName || childInfo?.parentPhone || childInfo?.parentrelation )&&  (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <SectionTitle title="Guardian Details" />
                <div className="flex gap-2">
                  {!editMode.parent ? (
                    <>
                      <button
                        className="text-xs font-bold bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200"
                        onClick={() => handleCancel("parent")}
                      >
                        Cancel
                      </button>
                      <button
                        className="text-xs font-bold bg-primBtn text-white px-4 py-2 rounded-lg hover:bg-Hover shadow-md shadow-blue-200"
                        onClick={() => handleSave("parent")}
                        disabled={saving.parent}
                      >
                        {saving.parent ? "Saving..." : "Save Change"}
                      </button>
                    </>
                  ) : canEditChild ? (
                    <button
                      className="text-xs font-bold bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:text-blue-600 transition-all"
                      onClick={() => handleEditToggle("parent", editMode.parent)}
                    >
                      Edit
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-center md:justify-start mb-4">
                <MyProfileImage
                  type={"parent"}
                  uploadProfileLoading={uploadProfileLoading}
                  images={(childInfo?.Parentfile || []).slice().reverse()}
                  currentIndex={imageIndex.parent}
                  ProfileControle={ProfileControle}
                  file={fileParent}
                  setFiles={setFilesParent}
                  handleUploadParentFile={handleUploadParentFile}
                  isProfileControlDisplay={isParentProfileControlDispaly}
                  setIsProfileControlDisplay={setParentControlDisplay}
                  onPrev={() => setImageIndex((prev) => ({ ...prev, parent: Math.max(0, prev.parent - 1) }))}
                  onNext={() => setImageIndex((prev) => ({
                    ...prev,
                    parent: Math.min((childInfo?.Parentfile?.length || 1) - 1, prev.parent + 1),
                  }))}
                  showFull={showImage.parent}
                  handleImageIconParent={handleImageIconParent}
                  isLoadingDeleteFile={isLoadingDeleteFile}
                  toggleShow={() => setShowImage((prev) => ({ ...prev, parent: !prev.parent }))}
                   canEditChild={canEditChild}
                  canDeleteChild={ canDeleteChild}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LabelInput label="First Name"           name="parentFirstName" value={`${childInfo?.parentFirstName}`} disabled={editMode.parent} onChange={handleChange} />
                <LabelInput label="Last Name"               name="parentLastName" value={`${childInfo?.parentLastName}`} disabled={editMode.parent} onChange={handleChange} />
                <LabelInput label="Contact Phone"           name="parentPhone"     value={childInfo?.parentPhone    || ""} disabled={editMode.parent} onChange={handleChange} />
                <LabelInput label="Child and Parent Relation" name="parentrelation" value={childInfo?.parentrelation || ""} disabled={editMode.parent} onChange={handleChange} />
              </div>
              <Textarea
                label="Guardian Background Notes"
                name="ParentDescription"
                value={childInfo?.ParentDescription || ""}
                disabled={editMode.parent}
                onChange={handleChange}
                ref={ParentTextRef}
              />
            </div>
          )}
        </div>

        {checkData?.length > 0 && (
          <section className="space-y-8 pt-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <FontAwesomeIcon icon={faHistory} className="text-primBtn text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Other Data</h2>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search records..."
                    onChange={SearchDataBySearch}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primBtn outline-none transition-all"
                  />
                </div>
                <div className="flex items-center gap-2 bg-white p-1 border border-slate-200 rounded-xl shadow-sm">
                  <select ref={Selectvalue} className="bg-transparent pl-4 pr-8 py-1.5 outline-none font-medium text-sm text-slate-700">
                    <option value="All data">All Years</option>
                    {years?.map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>
                  <button
                    className="bg-primBtn text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-Hover transition-all"
                    onClick={handleSearchbyselect}
                  >
                    Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
              <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <FontAwesomeIcon icon={faTrash} className="text-red-500 text-2xl" />
                  </div>
                  <div className="text-center space-y-1.5">
                    <h3 className="text-lg font-extrabold text-slate-900">Delete Record?</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      <span className="font-semibold text-slate-700">"{deleteConfirm.data.title || 'Record Update'}"</span> will be permanently removed.
                    </p>
                  </div>
                  <div className="flex gap-3 w-full pt-1">
                    <button
                      className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                      onClick={() => {
                        handleDeleteRecord(deleteConfirm.data);
                        setDeleteConfirm(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-xs" /> Yes, Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {filterData?.length > 0 ? (
              <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
                {filterData
                  .slice()
                  .sort((a, b) => new Date(b.timeStamp) - new Date(a.timeStamp))
                  .map((data, indeo) => (
                    <div key={indeo} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-primBtn text-white shadow-lg shrink-0 z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>

                      <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 rounded-3xl bg-white border border-slate-200 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                          {editingId === indeo ? (
                            <input
                              autoFocus
                              className="text-lg font-bold text-slate-900 border-b-2 border-primBtn outline-none w-full mr-2 bg-transparent"
                              value={editValues.title}
                              onChange={(e) => setEditValues((prev) => ({ ...prev, title: e.target.value }))}
                              placeholder="Record title..."
                            />
                          ) : (
                            <h4 className="font-bold text-lg text-slate-900">{data.title || "Record Update"}</h4>
                          )}

                          <div className="flex items-center gap-2 shrink-0">
                            <time className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                              {new Date(data.timeStamp).toLocaleDateString()}
                            </time>

                            {editingId === indeo ? (
                              <>
                                <button
                                  className="text-xs font-bold bg-primBtn text-white px-3 py-1.5 rounded-lg hover:bg-Hover transition-all flex items-center gap-1"
                                  onClick={() => handleEditSave(data, indeo)}
                                >
                                  <FontAwesomeIcon icon={faSave} className="text-[10px]" /> Save
                                </button>
                                <button
                                  className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-all"
                                  onClick={handleEditCancel}
                                >
                                  <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                </button>
                              </>
                            ) : (
                              <>
                                {/* Edit button — needs childUpdate permission */}
                                {canEditChild && (
                                  <button
                                    className="text-xs font-bold bg-white border border-slate-200 text-slate-500 px-3 py-1.5 rounded-lg hover:border-primBtn hover:text-primBtn transition-all"
                                    onClick={() => handleEditStart(data, indeo)}
                                  >
                                    <FontAwesomeIcon icon={faEdit} className="text-[10px]" />
                                  </button>
                                )}

                                {/* Delete button — needs childDelete permission */}
                                {canDeleteChild && (
                                  <button
                                    className="text-xs font-bold bg-white border border-red-200 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                                    onClick={() => setDeleteConfirm({ data, indeo })}
                                  >
                                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <FileGallery
                          data={data}
                          setFileUpload={setFileUpload}
                          onDeleteFile={(fil) => handleDeleteOtherFile(fil, data._id)}
                          onUploadFiles={(files) => handleUploadOtherFiles(files, data._id)}
                          canDeleteChild={canDeleteChild}
                          canEditChild={canEditChild}
                    
                        />

                        {editingId === indeo ? (
                          <textarea
                            className="w-full text-slate-600 text-sm leading-relaxed border-l-4 border-primBtn pl-4 bg-slate-50 rounded-r-xl outline-none resize-none p-2 min-h-[80px] mt-4"
                            value={editValues.description}
                            onChange={(e) => setEditValues((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Add description..."
                          />
                        ) : (
                          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line border-l-4 border-blue-100 pl-4 italic mt-4">
                            {data.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center font-bold text-xl">empty data</div>
            )}
          </section>
        )}

        {/* Floating Action Button — needs childRegister permission */}
        <div className="sticky bottom-8 z-50 flex justify-center">
          {!showFirstForm ? (
            canAddRecord ? (
              <button
                className="group flex items-center gap-3 px-8 py-4 bg-primBtn text-white rounded-full shadow-xl hover:bg-Hover hover:-translate-y-1 transition-all"
                onClick={() => setShowFirstForm(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="group-hover:rotate-90 transition-transform" />
                <span className="font-bold tracking-tight">Add Record</span>
              </button>
            ) : null
          ) : (
            <ChildOtherForm
              register={register}
              handleSubmit={handleSubmit}
              handleform={handleform}
              setShowFirstForm={setShowFirstForm}
              handleFile={handleFile}
              FileUpload={FileUpload}
              setFileUpload={setFileUpload}
              errors={errors}
            />
          )}
        </div>

      </div>
    </div>
  );
};