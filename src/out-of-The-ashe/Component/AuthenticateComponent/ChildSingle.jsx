import { useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

// Icons
import { faUpload, faDownload, faDeleteLeft } from "@fortawesome/free-solid-svg-icons";

// Redux & API
import {
  useGetChildByIDQuery,
  useCreateChildOtherFileMutation,
  useUpdateChildMutation,
  useDeleteFileMutation,
  useUploadProfileMutation,
} from "../../Redux/Childes";
import { APi } from "../../Redux/CenteralAPI";

// Components
import { Spinner } from "./ChidlComponent";
import { Childbody } from "./ChildBody";

const ChildSingle = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  // --- Local State Management ---
  const [childInfo, setChildInfo] = useState({});
  const [otherData, setOtherData] = useState([]);
  const [editMode, setEditMode] = useState({ child: true, parent: true });
  const [saving, setSaving] = useState({ child: false, parent: false });
  const [imageIndex, setImageIndex] = useState({ child: 0, parent: 0 });
  const [showImage, setShowImage] = useState({ child: false, parent: false });
  const [showFirstForm, setShowFirstForm] = useState(false);
  const [fileUpload, setFileUpload] = useState({ normalFile: [], tempFile: [] });
  const [isProfileControlDisplay, setIsProfileControlDisplay] = useState(false);
  const [isParentControlDisplay, setParentControlDisplay] = useState(false);
  const [ChildFIlter,setChildFilter]=useState([])

  // Profile Preview Files
  const [fileChild, setFilesChild] = useState(null);
  const [fileParent, setFilesParent] = useState(null);

  // --- Refs ---
  const childInputRef = useRef(null);
  const childTextRef = useRef(null);
  const parentTextRef = useRef(null);
  const selectValueRef = useRef(null);
  const descriptionTextRef = useRef([]);

  // --- Form Hook ---
  const { register, reset, handleSubmit ,formState: { errors }} = useForm();

  // --- API Hooks ---
  const { data: serverData, isLoading: isInitialLoading } = useGetChildByIDQuery(id);
  const [updateChild, { isLoading: isUpdatingChild }] = useUpdateChildMutation();
  const [createOtherFile, { isLoading: isCreatingFile, isSuccess: fileSuccess }] = useCreateChildOtherFileMutation();
  const [deleteFile, { isLoading: isDeletingFile }] = useDeleteFileMutation();
  const [uploadProfile, { isLoading: isUploadingProfile }] = useUploadProfileMutation();

  // --- Memoized Derived Data ---
  const years = useMemo(() => {
    if (!childInfo?.otherChildData) return [];
    return [...new Set(childInfo.otherChildData.map(d => new Date(d.timeStamp).getFullYear()))].sort((a, b) => b - a);
  }, [childInfo?.otherChildData]);

  // --- Sync Server Data to Local State ---
  useEffect(() => {
    if (serverData) {
      
      setChildInfo(serverData);
      setOtherData(serverData.otherChildData );
      setChildFilter(serverData.otherChildData)
    }
  }, [serverData]);


  // Success Feedback
  useEffect(() => {
    if (fileSuccess) {
      toast.success("Record updated successfully");
      setShowFirstForm(false);
      reset();
      setFileUpload({ normalFile: [], tempFile: [] });
    }
  }, [fileSuccess, reset]);
  useEffect(()=>{
    console.log("file Change")
  console.log(fileUpload)

  },[fileUpload])

  // --- Core Handlers ---

  const handleMediaAction = async (imageUrl, public_id, actionType, selectionType) => {
    try {
      if (actionType === "download") {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `profile-${id}.jpg`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else if (actionType === "delet") {
        await deleteFile({ public_id, id, selectionType }).unwrap();
        toast.success("Image removed");
        dispatch(APi.util.invalidateTags([{ type: "ChildSearchById", id: "searchResult" }]));
      } else if (actionType === "upload") {
        const inputId = selectionType === "child" ? "ProfileUpload" : "ProfileUploadParent";
        document.getElementById(inputId)?.click();
      }
    } catch (err) {
      toast.error(err.data?.msg || "Action failed");
    }
  };

  const onSave = async (type) => {
    setSaving(prev => ({ ...prev, [type]: true }));
    try {
      const payload = type === "child" 
        ? {
            childFirstName: childInfo.childFirstName,
            childLastName: childInfo.childLastName,
            childPhone: childInfo.childPhone,
            childBirthDay: childInfo.childBirthDay,
            Grade: childInfo.Grade,
            ChildDescription: childInfo.ChildDescription,
            fullName: `${childInfo.childFirstName} ${childInfo.childLastName}`,
          }
        : {
            parentFirstName: childInfo.parentFirstName,
            parentLastName: childInfo.parentLastName,
            parentPhone: childInfo.parentPhone,
            ParentDescription: childInfo.ParentDescription,
          };

      await updateChild({ data: payload, id }).unwrap();
      toast.success("Profile updated");
      setEditMode(prev => ({ ...prev, [type]: true }));
    } catch (err) {
      console.log(err)
      toast.error(err.data.msg);
    } finally {
      setSaving(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleProfileUpload = async (file, type) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("data", JSON.stringify({ id, type }));
    if(type==='child'){


     formData.append("childPhotos", file);
    }else  if(type==='parent'){

    
    formData.append("parentPhotos", file);
    }
    try {
      await uploadProfile(formData).unwrap();
      toast.success("Profile image updated");
      setFilesChild(null);
      setFilesParent(null);
      dispatch(APi.util.invalidateTags([{ type: "ChildSearchById", id: "searchResult" }]));
    } catch (err) {
      toast.error(err.data.msg);
    }
  };

  const onSearch = useCallback((e) => {
    const term = e.target.value.toLowerCase();
    const original = childInfo.otherChildData || [];
    setChildFilter(term === "" ? original : original.filter(item => item.title.toLowerCase().includes(term)));
  }, [childInfo.otherChildData]);

  const onFilterYear = useCallback(() => {
    const year = selectValueRef.current.value;
    const original = childInfo.otherChildData || [];
    setOtherData(year === "All data" ? original : original.filter(item => new Date(item.timeStamp).getFullYear() === Number(year)));
  }, [childInfo.otherChildData]);

  // --- Auto-height Textarea Support ---
  useLayoutEffect(() => {
    descriptionTextRef.current.forEach((el) => {
      if (el) {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }
    });
  }, [otherData]);

  if (isInitialLoading) return <div className="flex h-screen items-center justify-center bg-white"><Spinner /></div>;

  return (
    <Childbody
      childInfo={childInfo}
      otherData={ChildFIlter}
      checkData={otherData}
      years={years}
      editMode={editMode}
      saving={saving}
      imageIndex={imageIndex}
      setImageIndex={setImageIndex}
      showImage={showImage}
      setShowImage={setShowImage}
      showFirstForm={showFirstForm}
      setShowFirstForm={setShowFirstForm}
      FileUpload={fileUpload}
      setFileUpload={setFileUpload}
      isProfileControlDisplay={isProfileControlDisplay}
      setIsProfileControlDisplay={setIsProfileControlDisplay}
      isParentProfileControlDispaly={isParentControlDisplay}
      setParentControlDisplay={setParentControlDisplay}
      Childupdating={isUpdatingChild}
      uploadProfileLoading={isUploadingProfile}
      isLoadingChildOtherFile={isCreatingFile}
      isLoadingDeleteFile={isDeletingFile}
      fileChild={fileChild}
      setFilesChild={setFilesChild}
      fileParent={fileParent}
      setFilesParent={setFilesParent}
      register={register}
      handleSubmit={handleSubmit}
      reset={reset}
      childInputRef={childInputRef}
      ChildTextRef={childTextRef}
      ParentTextRef={parentTextRef}
      Selectvalue={selectValueRef}
      descriptionTextRef={descriptionTextRef}
      handleChange={(e) => setChildInfo(p => ({ ...p, [e.target.name]: e.target.value }))}
      handleCancel={(type) => { setChildInfo(serverData); setEditMode(p => ({ ...p, [type]: true })); }}
      handleSave={onSave}
      handleEditToggle={(type, status) => {
        setEditMode(p => ({ ...p, [type]: !status }));
        if (!status && type === "child") setTimeout(() => childInputRef.current?.focus(), 50);
      }}
      handleUpload={handleProfileUpload}
      handleUploadParentFile={handleProfileUpload}
      handleImageIcon={(url, pid, action, st) => handleMediaAction(url, pid, action, "child")}
      handleImageIconParent={(url, pid, action, st) => handleMediaAction(url, pid, action, "parent")}
      handleFile={(e) => {
        const f = e.target.files[0];
      
        if (f) setFileUpload(p => ({ ...p, tempFile: [...p.tempFile, f] }));
      }}
      handleStoreFile={(e) => {
        e.preventDefault();
        setFileUpload(p => ({ ...p, normalFile: [...p.tempFile, ...p.normalFile], tempFile: [] }));
      }}
      handleform={async (data) => {
        const fd = new FormData();
        fd.append("data", JSON.stringify({ ...data, id }));
        fileUpload.tempFile.forEach(f => fd.append("otherFile", f));
        setFileUpload((pre)=>({...pre,tempFile:[]}))
        try{
           await createOtherFile(fd).unwrap();
            toast.success("other data add  successfully ");
    
    } catch (err) {
      console.log(err)
      toast.error(err.data.msg);
    } finally {
        }
       
      }}
      handleSearchbyselect={onFilterYear}
      SearchDataBySearch={onSearch}
      calculateAge={(bday) => {
        if (!bday) return "N/A";
        const ageDif = Date.now() - new Date(bday).getTime();
        return Math.abs(new Date(ageDif).getUTCFullYear() - 1970);
      }}
      adjustTextAreaHeight={(el) => {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }}
      ProfileControle={[
        { icon: faUpload, type: "upload", text: "Upload", id: 0 },
        { icon: faDownload, type: "download", text: "Download", id: 1 },
        { icon: faDeleteLeft, type: "delet", text: "Delete", id: 2 },
      ]}
      errors={errors}
    />
  );
};

export default ChildSingle;