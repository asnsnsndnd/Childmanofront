import { faCamera, faUserEdit, faSave, faTimes, faUserCircle, faEnvelope, faPhone, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useGetUserQuery, useUpdateUserMutation, useUpdateProfileMutation } from "../../Redux/User";
import { toast, ToastContainer } from "react-toastify";
import { APi } from "../../Redux/CenteralAPI";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();

  const [UpdateProfile, { isLoading: isUploading }] = useUpdateProfileMutation();
  const [updateUser, { isLoading: isSaving }] = useUpdateUserMutation();
  const { data: User, isLoading: isFetching } = useGetUserQuery(id);

  const [formInfo, setFormInfo] = useState({
    firstName: "", lastName: "", email: "", phone: "", educationBackground: "", profile: ""
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (User) setFormInfo(User);
  }, [User]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formInfo.firstName || formInfo.firstName.trim() === "") {
      toast.error("First name must not be empty");
      return;
    }
    
    if (!formInfo.lastName || formInfo.lastName.trim()=== "") {
      toast.error("Last name must not be empty");
      return;
    }
    
    if (!formInfo.phone || formInfo.phone.trim() === "") {
      toast.error("Phone number must not be empty");
      return;
    }
    
    if (!formInfo.educationBackground || formInfo.educationBackground.trim() === "") {
      toast.error("Education background must not be empty");
      return;
    }

    try {
      await updateUser({ id, ...formInfo }).unwrap();
      toast.success("Profile updated successfully!");
      dispatch(APi.util.invalidateTags([{ type: 'User', _id: 'List' }]));
      setIsEditing(false);
    } catch (err) {
      toast.error(err?.data?.msg || "Update failed");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Create a promise-ready loader toast instance
    const toastId = toast.loading("Uploading profile image...");

    const formData = new FormData();
    formData.append("id", id);
    formData.append("profile", file);

    try {
      await UpdateProfile(formData).unwrap();
      
      // 2. Update toast to success state
      toast.update(toastId, { 
        render: "Profile picture updated successfully!", 
        type: "success", 
        isLoading: false,
        autoClose: 3000 
      });

      dispatch(APi.util.invalidateTags([{ type: 'User', _id: 'List' }])); // Fixed _id to id mismatch here
    } catch (err) {
      // 3. Update toast to error state
      toast.update(toastId, { 
        render: err?.data?.msg || "Image upload failed", 
        type: "error", 
        isLoading: false, 
        autoClose: 3000 
      });
    }
  };

  if (isFetching) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="h-12 w-12 border-4 border-primBtn rounded-full border-t-transparent animate-spin"></div>
      <p className="mt-4 text-slate-500 font-medium">Loading your profile...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ToastContainer position="top-right" theme="colored" />

      {/* Profile Header Card */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-white">
        <div className="h-32 bg-gradient-to-r from-primBtn to-Hover/30 w-full" />
        <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-16 gap-6">
          <div className="relative group">
            <div className="relative w-40 h-40 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-lg bg-white">
              <img
                src={formInfo?.profile?.mediaurl || formInfo?.profile || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-full h-full object-contain"
              />
              
              {/* Profile Image Uploading Blur Layer */}
              {isUploading && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <button 
              onClick={() => fileInputRef.current.click()}
              disabled={isUploading}
              className="absolute bottom-2 right-2 bg-primBtn text-white p-3 rounded-2xl shadow-xl hover:bg-Hover transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              <FontAwesomeIcon icon={faCamera} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
          
          <div className="flex-grow mb-4 text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-800 capitalize">
              {formInfo?.firstName} {formInfo?.lastName}
            </h1>
            <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-primBtn" /> {formInfo?.email}
            </p>
          </div>

          <div className="mb-4">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-primBtn text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-Hover transition-all shadow-lg"
              >
                <FontAwesomeIcon icon={faUserEdit} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                   Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-primBtn text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-Hover transition-all shadow-lg shadow-primBtn/20"
                >
                  {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FontAwesomeIcon icon={faSave} /> Save Changes</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Information Grid */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-8 border border-white">
        <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
          <div className="w-2 h-8 bg-primBtn rounded-full" />
          Account Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <ProfileInput icon={faUserCircle}  label="First Name" name="firstName" value={formInfo.firstName} onChange={handleInputChange} disabled={!isEditing} />
          <ProfileInput icon={faUserCircle} label="Last Name" name="lastName" value={formInfo.lastName} onChange={handleInputChange} disabled={!isEditing} />
          <ProfileInput icon={faEnvelope} label="Email Address" name="email" value={formInfo.email} onChange={handleInputChange} disabled={true} />
          <ProfileInput icon={faPhone} label="Phone Number" name="phone" value={formInfo.phone} onChange={handleInputChange} disabled={!isEditing} />
          <ProfileInput icon={faGraduationCap} label="Education Background" name="educationBackground" value={formInfo.educationBackground} onChange={handleInputChange} disabled={!isEditing} />
        </div>
      </div>
    </div>
  );
};

const ProfileInput = ({ icon, label, name, value, onChange, disabled }) => (
  <div className="flex flex-col gap-2 group">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${disabled ? 'text-primBtn/40' : 'text-primBtn'}`}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <input
        name={name}
        value={value}
        onChange={onChange}
        required={true}
        disabled={disabled}
        className={`w-full h-14 pl-12 pr-4 rounded-2xl font-bold transition-all outline-none border-2 ${
          disabled 
          ? "bg-slate-50 border-transparent text-slate-500" 
          : "bg-white border-sky-100 text-slate-800 focus:border-primBtn focus:ring-1 focus:ring-primBtn shadow-inner"
        }`}
      />
    </div>
  </div>
);

export default Profile;