import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faShieldAlt, faCheckCircle, faCircle } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useUpdatePasswordMutation } from "../../Redux/User";
import { useSelector } from "react-redux";

const PasswordChange = () => {
  const { id } = useSelector((state) => state.auth);
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  // Field States
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
  const [formData, setFormData] = useState({ oldPassword: "", newpassword: "", confirmPassword: "" });

  // Validation State
  const [validations, setValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "newpassword") {
      setValidations({
        length: value.length >= 6,
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*()_+\-=\[\]{}|\\:;"'<>,.?\/]/.test(value),
      });
    }
  };

  const isFormValid = Object.values(validations).every(Boolean) && 
                     formData.newpassword === formData.confirmPassword && 
                     formData.oldPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      await updatePassword({ ...formData, id }).unwrap();
      toast.success("Password changed successfully!");
      setFormData({ oldPassword: "", newpassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.data?.msg || "Failed to update password");
    }
  };

  const toggleVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-8 md:p-12 border border-white animate-in fade-in zoom-in-95 duration-500">
      <ToastContainer />

      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-primBtn/20 text-primBtn rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
          <FontAwesomeIcon icon={faShieldAlt} />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Security Settings</h2>
        <p className="text-slate-500 font-medium">Update your password to keep your account secure</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Old Password */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
          <div className="relative">
            <input
              type={showPasswords.old ? "text" : "password"}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleInputChange}
              className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primBtn focus:bg-white outline-none transition-all font-bold text-slate-700"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => toggleVisibility('old')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors"
            >
              <FontAwesomeIcon icon={showPasswords.old ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-100 my-8" />

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              name="newpassword"
              value={formData.newpassword}
              onChange={handleInputChange}
              className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primBtn focus:bg-white outline-none transition-all font-bold text-slate-700"
              placeholder="Minimum 8 characters"
            />
            <button
              type="button"
              onClick={() => toggleVisibility('new')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors"
            >
              <FontAwesomeIcon icon={showPasswords.new ? faEyeSlash : faEye} />
            </button>
          </div>
          
          {/* Validation Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 p-4 bg-slate-50 rounded-2xl">
            <ValidationItem isMet={validations.length} label="8+ Characters" />
            <ValidationItem isMet={validations.upper} label="Uppercase Letter" />
            <ValidationItem isMet={validations.lower} label="Lowercase Letter" />
            <ValidationItem isMet={validations.number} label="A Number" />
            <ValidationItem isMet={validations.special} label="Special Character" />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full h-14 px-5 rounded-2xl border-2 outline-none transition-all font-bold ${
                formData.confirmPassword && formData.newpassword !== formData.confirmPassword
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-transparent bg-slate-50 focus:border-primBtn focus:bg-white text-slate-700"
              }`}
              placeholder="Repeat new password"
            />
          </div>
          {formData.confirmPassword && formData.newpassword !== formData.confirmPassword && (
            <p className="text-xs font-bold text-red-500 ml-1">Passwords do not match</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full h-14 bg-primBtn text-white rounded-[1.25rem] font-black text-lg shadow-lg shadow-primBtn/10 hover:bg-Hover hover:shadow-primBtn/10 disabled:bg-slate-200 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-8"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Update Password"
          )}
        </button>
      </form>
    </div>
  );
};

// Helper Component for Validation Items
const ValidationItem = ({ isMet, label }) => (
  <div className={`flex items-center gap-2 transition-colors ${isMet ? 'text-green-600' : 'text-slate-400'}`}>
    <FontAwesomeIcon icon={isMet ? faCheckCircle : faCircle} className={isMet ? "text-green-500" : "text-slate-300"} />
    <span className="text-[11px] font-black uppercase tracking-wider">{label}</span>
  </div>
);

export default PasswordChange;