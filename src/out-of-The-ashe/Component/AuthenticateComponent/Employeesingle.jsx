import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  useGetEmployeeByIdQuery, 
  useDeleteEmployeeMutation, 
  useResetEmployeePasswordMutation, // 👈 Added here
  useGetPermissionsOwnQuery
} from "../../Redux/Employee";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEnvelope, faPhone, faGraduationCap, 
  faBriefcase, faArrowLeft, faTrash,
  faEllipsisV, faKey, faTimes, faEye, faEyeSlash, faCheckCircle, faExclamationCircle, faCircle, faSearchPlus
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import "react-toastify/dist/ReactToastify.css";
import { faUnlockKeyhole } from "@fortawesome/free-solid-svg-icons";
import { PermissionsModal } from "./PermissionsModal";

function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
const { role } = useSelector((state) => state.auth);
   const {data:newperm}=useGetPermissionsOwnQuery()
    const [permissions,Setnewperm]=useState({})
  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // State for full image viewing
  const [resetEmployeePassword, { isLoading: isResetting }] = useResetEmployeePasswordMutation();
  // Password Reset States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  
  const menuRef = useRef(null);

  // Queries & Mutations
  const { data: emp, isLoading } = useGetEmployeeByIdQuery(id);
  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();

  const fullName = `${emp?.firstName} ${emp?.lastName}`;
  const profileImgSrc = emp?.profile?.mediaurl || emp?.profile || "https://via.placeholder.com/150";

  // Strong Password Validation Rules
  const requirements = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
    match: newPassword && newPassword === confirmPassword
  };

  const isValid = Object.values(requirements).every(Boolean);

  // Close dropdown menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  
  useEffect(()=>{
   
  Setnewperm(newperm?.data)
  },[newperm])

  // Professional Delete Logic
  const handleConfirmedDelete = async () => {
    setIsModalOpen(false); 

    await toast.promise(
      deleteEmployee(id).unwrap(),
      {
        pending: {
          render: () => "Deleting employee account...",
          icon: true,
        },
        success: {
          render: () => "Account successfully removed.",
          icon: "✅",
        },
        error: {
          render: ({ data }) => data?.data?.msg || "Failed to delete account.",
        }
      }
    );

    setTimeout(() => {
      navigate('/DashboardPage');
    }, 2000);
  };

  const handleResetPasswordSubmit = async (e) => {
  e.preventDefault();
  if (!isValid) return;

  try {
    await toast.promise(
      resetEmployeePassword({ id, password: newPassword }).unwrap(), // 👈 Real API call execution
      {
        pending: "Updating access keys...",
        success: "Password reset successfully! 🔑",
        error: {
          render({ data: err }) {
            return err?.data?.msg || "Failed to reset password.";
          }
        }
      }
    );
    
    setIsResetModalOpen(false);
    setNewPassword("");
    setConfirmPassword("");
  } catch (err) {
    console.error("Password reset failed:", err);
  }
};
const isAdmin = role === "Admin";
const canUpdateEmployee = isAdmin || permissions?.employeeUpdate === true;
const canDeleteEmployee = isAdmin || permissions?.employeeDelete === true;
const canResetPassword  = isAdmin || permissions?.employeeUpdate === true; // reset = update access

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primBtn border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primBtn font-black uppercase tracking-widest text-xs">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-0 relative">
      <ToastContainer position="top-center" theme="colored" autoClose={2000} />
      
      {/* Modal for Admin deletion confirmation */}
      <DeleteConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmedDelete}
        itemName={fullName}
        isDeleting={isDeleting}
      />

      {/* ✅ Professional Full Screen Image Preview Lightbox */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-zoom-out" 
            onClick={() => setIsPreviewOpen(false)} 
          />
          <div className="relative max-w-2xl w-full max-h-[85vh] flex flex-col items-center z-10 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="absolute -top-12 right-0 md:-right-12 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-all"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <img 
              src={profileImgSrc} 
              alt={fullName} 
              className="max-w-full max-h-[80vh] rounded-[2rem] object-contain shadow-2xl border-4 border-white/10"
            />
            <p className="text-white/70 text-xs font-bold tracking-widest uppercase mt-4 bg-white/5 px-4 py-1.5 rounded-full backdrop-blur-sm select-none">
              {fullName} • Profile Preview
            </p>
          </div>
        </div>
      )}
      {/* Permissions Modal — Admin Only */}
{isAdmin && isPermissionsModalOpen && (
  <PermissionsModal
    empId={id}
    empName={fullName}
    onClose={() => setIsPermissionsModalOpen(false)}
  />
)}

      {/* Modern Overlay Modal for Password Reset */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsResetModalOpen(false)} />
          <div className="relative z-10 bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2.5 text-slate-900">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <FontAwesomeIcon icon={faKey} />
                </div>
                <h3 className="text-lg font-black tracking-tight">Reset Password</h3>
              </div>
              <button 
                onClick={() => {
                  setIsResetModalOpen(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }} 
                className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-all"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              {/* Field 1: New Password */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primBtn focus:bg-white transition-all font-medium text-slate-800 pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {/* Field 2: Confirm Password */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:bg-white transition-all font-medium text-slate-800 pr-10 ${
                      confirmPassword ? (requirements.match ? 'border-emerald-200 focus:border-emerald-500' : 'border-rose-200 focus:border-rose-500') : 'border-slate-200 focus:border-primBtn'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {/* Real-time Requirement Checklist UI */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Security Criteria:</p>
                <div className="grid grid-cols-2 gap-2">
                  <CheckItem isMet={requirements.length} text="Min 8 Characters" />
                  <CheckItem isMet={requirements.upper} text="Uppercase (A-Z)" />
                  <CheckItem isMet={requirements.lower} text="Lowercase (a-z)" />
                  <CheckItem isMet={requirements.number} text="Number (0-9)" />
                  <CheckItem isMet={requirements.special} text="Special Char (!@#)" />
                  <CheckItem isMet={requirements.match} text="Passwords Match" />
                </div>
              </div>

              {/* Form Controls */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setNewPassword("");
                    setConfirmPassword("");
                  }} 
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!isValid}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                    isValid 
                      ? 'bg-primBtn text-white hover:opacity-90 shadow-blue-100 cursor-pointer' 
                      : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                  }`}
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex justify-between items-center mb-8 relative">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-primBtn font-bold transition-all group"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform"/>
          <span>Back to Directory</span>
        </button>

        {/* Action Dropdown Menu - Admins Only */}
       {/* Action Dropdown — visible if user has ANY action permission */}
{(isAdmin || canUpdateEmployee || canDeleteEmployee) && (
  <div className="relative" ref={menuRef}>
    <button 
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-primBtn hover:border-primBtn transition-all shadow-sm"
    >
      <FontAwesomeIcon icon={faEllipsisV} />
    </button>

    {isMenuOpen && (
      <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
        
        {/* Reset Password — Admin or employeeUpdate permission */}
        {canResetPassword && (
          <button
            onClick={() => { setIsMenuOpen(false); setIsResetModalOpen(true); }}
            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2.5 transition-colors"
          >
            <FontAwesomeIcon icon={faKey} className="text-slate-400 w-4 text-center" />
            <span>Reset Password</span>
          </button>
        )}

        {/* Permissions — Admin only */}
        {isAdmin && (
          <>
            {canResetPassword && <hr className="border-slate-50 my-1" />}
            <button
              onClick={() => { setIsMenuOpen(false); setIsPermissionsModalOpen(true); }}
              className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2.5 transition-colors"
            >
              <FontAwesomeIcon icon={faUnlockKeyhole} className="text-slate-400 w-4 text-center" />
              <span>Manage Permissions</span>
            </button>
          </>
        )}

        {/* Delete — Admin or employeeDelete permission */}
        {canDeleteEmployee && (
          <>
            <hr className="border-slate-50 my-1" />
            <button
              disabled={isDeleting}
              onClick={() => { setIsMenuOpen(false); setIsModalOpen(true); }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50/50 font-semibold flex items-center gap-2.5 transition-colors"
            >
              <FontAwesomeIcon icon={faTrash} className="text-red-400 w-4 text-center" />
              <span>Delete Staff</span>
            </button>
          </>
        )}
      </div>
    )}
  </div>
)}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-white">
        <div className="h-32 bg-gradient-to-r from-primBtn to-sky-400 opacity-90" />

        <div className="px-6 md:px-12 pb-12">
          {/* Avatar & Basic Info */}
          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-10">
            
            {/* ✅ Interactive Avatar with Hover Preview State triggers */}
            <div 
              onClick={() => setIsPreviewOpen(true)}
              className="relative group cursor-zoom-in"
            >
              <img 
                src={profileImgSrc} 
                alt={fullName} 
                className="w-44 h-44 rounded-[2.5rem] object-cover border-8 border-white shadow-xl bg-slate-100 transition-all duration-300 group-hover:scale-[1.02] group-hover:brightness-90"
              />
              <div className="absolute inset-8 rounded-2xl bg-black/30 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <FontAwesomeIcon icon={faSearchPlus} className="text-white text-xl" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left pb-2">
              <h1 className="text-4xl font-black text-slate-900 capitalize tracking-tight">
                {fullName}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-primBtn font-black uppercase tracking-widest text-[10px] mt-2">
                <div className="w-6 h-6 rounded-lg bg-primBtn/10 flex items-center justify-center">
                  <FontAwesomeIcon icon={faBriefcase} />
                </div>
                <span>{emp?.role || "Team Member"}</span>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 mb-10" />

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoBlock 
              icon={faGraduationCap} 
              label="Academic Background" 
              value={emp?.educationBackground || "No background details"} 
            />
            <InfoBlock 
              icon={faPhone} 
              label="Contact Number" 
              value={emp?.phone || "Private"} 
            />
            <InfoBlock 
              icon={faEnvelope} 
              label="Official Email" 
              value={emp?.email || "No email"} 
              isEmail
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const CheckItem = ({ isMet, text }) => (
  <div className={`flex items-center gap-2 font-medium transition-colors duration-200 ${isMet ? "text-emerald-600" : "text-slate-400"}`}>
    <FontAwesomeIcon icon={isMet ? faCheckCircle : faCircle} className={isMet ? "text-xs" : "text-[6px] opacity-60"} />
    <span>{text}</span>
  </div>
);

const InfoBlock = ({ icon, label, value, isEmail }) => (
  <div className="flex flex-col gap-3 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primBtn shadow-sm border border-slate-50">
      <FontAwesomeIcon icon={icon} />
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className={`font-bold text-slate-700 break-words leading-relaxed ${isEmail ? 'text-primBtn' : ''}`}>
        {value}
      </p>
    </div>
  </div>
);

export default EmployeeProfile;