import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faSearch, 
  faTimes, 
  faHouse, 
  faMessage, 
  faPlus,
  faUserPlus,
  faAddressCard,
  faGear,
  faUnlockKeyhole,
  faCircleQuestion,
  faRightFromBracket,
  faChildReaching
} from '@fortawesome/free-solid-svg-icons';

// Redux & Config
import { logout } from '../../Redux/auth';
import { useGetUserQuery } from '../../Redux/User';
import { useGetChildbyNameQuery } from '../../Redux/Childes';
import { useGetUnreadMessageQuery } from '../../Redux/message';
import { APi } from '../../Redux/CenteralAPI';

import { useGetPermissionsOwnQuery } from '../../Redux/Employee';
const DashbordNav = () => {
  // --- States ---
  const [isDisplayADd, SetIsDisplay] = useState(false);
  const [isDisplayNavList, setIsDisplayNavList] = useState(false);
  const [isDisplaySettingControl, setIsDisplaySettingControl] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [countUnreadMessage, setcountUnreadMessage] = useState(0);

  // --- Refs ---
  const addMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  // --- Redux & Navigation ---
  const Dispatch = useDispatch();
  const navigate = useNavigate();
  const { id,role} = useSelector((state) => state.auth);
  
  const {data:newperm}=useGetPermissionsOwnQuery()
  const { ActiveChatId } = useSelector((state) => state.webState);
  
  const { data: User } = useGetUserQuery(id);
  const { data: childResult, isFetching: isSearching } = useGetChildbyNameQuery(searchValue);
  const { data: unreadMessage } = useGetUnreadMessageQuery(id);

  const [permissions,Setnewperm]=useState({})

useEffect(()=>{
 
Setnewperm(newperm?.data)
},[newperm])
  // --- Configuration Arrays ---
  const NavList = [
    { icon: faHouse, Text: "Dashboard", resposivehidden: true, type: "Dashbord" },
    { icon: faPlus, Text: "Add New", resposivehidden: true, type: "add" },
    { icon: faAddressCard, Text: "Profile", resposivehidden: false, type: "profile" },
    { icon: faGear, Text: "Setting", resposivehidden: false, type: "setting" },
    { icon: faRightFromBracket, Text: "Logout", resposivehidden: false, type: "logout", color: "text-rose-500" }
  ];
  
  // ── Permission-aware visibility ──────────────────────────────────────────
const canRegisterChild    = role === 'Admin' || permissions?.childRegister    === true;
const canRegisterEmployee = role === 'Admin' || permissions?.employeeRegister === true;
const hasAnyAddAction     = canRegisterChild || canRegisterEmployee
console.log(hasAnyAddAction)
const ListAdd = [
  { icon: faChildReaching, Text: "Register New Child", type: 'child',    bg: "bg-black/80", textColor: "text-white", visible: canRegisterChild },
  { icon: faUserPlus,      Text: "Employee Account",   type: 'employee', bg: "bg-black/90", textColor: "text-white", visible: canRegisterEmployee },
];

  const ListSetting = [
    { icon: faUnlockKeyhole, Text: "Change Password", type: 'passwordChange' },
    { icon: faCircleQuestion, Text: "FAQs & Support", type: 'FQA' }
  ];

  // --- Effects ---
  useEffect(() => { setcountUnreadMessage(unreadMessage); }, [unreadMessage]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target)) SetIsDisplay(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsDisplayNavList(false);
        setIsDisplaySettingControl(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---
  const NavListControl = (type, e) => {
    e.stopPropagation();
    if (type === "add") SetIsDisplay(!isDisplayADd);
    else if (type === "setting") setIsDisplaySettingControl(!isDisplaySettingControl);
    else if (type === "Dashbord") navigate("/DashboardPage");
    else if (type === "profile") navigate('/ProfilePage');
    else if (type === "logout") Dispatch(logout());
    
    if (type !== 'add' && type !== 'setting') setIsDisplayNavList(false);
  };

  const handleAction = (type) => {
    if (type === 'child') navigate('/ChildRegister');
    if (type === 'employee') navigate('/EmployeerRgister');
    if (type === 'passwordChange') navigate('/PasswordChange');
    SetIsDisplay(false);
    setIsDisplayNavList(false);
  };

  return (
    <nav className={`fixed top-0 inset-x-0 h-20 z-[100] transition-all duration-500 px-6 flex items-center justify-between
      ${isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm' : 'bg-white/40 backdrop-blur-sm'}`}>
      
      {/* Brand */}
      <Link to="/DashboardPage" className="flex-shrink-0">
        <img src="https://res.cloudinary.com/dkzvlqjp9/image/upload/v1767960857/out_1_ligvau.png" 
             alt="Logo" className="h-10 w-auto object-contain max-sm:hidden" />
      </Link>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-4 md:mx-8 relative">
        <div className="relative group">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primBtn transition-colors" />
          <input 
            type="search" 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search records..." 
            className="w-full bg-primBtn/10 border border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 py-2.5 pl-11 pr-10 rounded-2xl outline-none transition-all text-sm font-medium"
          />
          
        </div>

        {searchValue.length >= 2 && (
          <div className="absolute top-14 inset-x-0 bg-white border border-slate-100 rounded-3xl shadow-2xl p-2 z-[110] animate-in fade-in slide-in-from-top-2">
            {isSearching ? (
              <div className="p-6 text-center text-xs font-bold text-slate-400 animate-pulse uppercase">Searching...</div>
            ) : childResult?.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {childResult.map(child => (
                  <Link key={child._id} to={`/ChildSingle/${child._id}`} onClick={() => setSearchValue('')} className="flex items-center gap-4 p-3 hover:bg-blue-50 rounded-2xl transition-all group">
                    <img src={child.Childfile?.[0]?.mediaurl} className="w-11 h-11 rounded-xl object-contain ring-2 ring-white shadow-sm" alt="" />
                    <div>
                      <p  className="font-bold searchresult  text-slate-800 text-sm">{child.childFirstName} {child.childLastName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Grade {child.Grade}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : <div className="p-6  notfoundseacrhresult text-center text-sm text-slate-400 font-medium">No results found</div>}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-5">
        <Link to="/DashboardPage" className="p-2 text-slate-400 hover:text-Hover transition-all max-md:hidden">
          <FontAwesomeIcon icon={faHouse} size="lg" />
        </Link>

        {/* <Link to="/MessagePage" className="relative p-2 text-slate-400 hover:text-Hover transition-all">
          <FontAwesomeIcon icon={faMessage} size="lg" />
          {countUnreadMessage > 0 && (
            <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-white">
              {countUnreadMessage}
            </span>
          )}
        </Link> */}

        {/* Desktop Add Button */}
        {/* Desktop Add Button */}
<div className="relative max-md:hidden" ref={addMenuRef}>
  {hasAnyAddAction && (           // ← wrap with this
    <button
      onClick={() => SetIsDisplay(!isDisplayADd)}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-slate-200 
      ${isDisplayADd ? 'bg-Hover text-white rotate-45' : 'bg-primBtn text-white'}`}
    >
      <FontAwesomeIcon icon={faPlus} />
    </button>
  )}

  {isDisplayADd && hasAnyAddAction && (
    <div className="absolute right-0 mt-4 w-64 bg-white border border-slate-100 rounded-[28px] shadow-2xl p-2 z-[120] animate-in zoom-in-95">
      <p className="text-[10px] font-black text-slate-400 uppercase p-4 pb-2 tracking-widest">Quick Actions</p>
      {ListAdd.filter(item => item.visible).map((item) => (   // ← filter visible
        <button
          key={item.type}
          onClick={() => handleAction(item.type)}
          className="flex w-full items-center gap-3 p-3 hover:bg-Hover/10 rounded-2xl transition-all group"
        >
          <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.textColor} flex items-center justify-center group-hover:bg-Hover group-hover:text-white transition-all`}>
            <FontAwesomeIcon icon={item.icon} />
          </div>
          <span className="font-bold text-sm text-slate-700">{item.Text}</span>
        </button>
      ))}
    </div>
  )}
</div>

        <div className="h-8 w-[1px] bg-slate-200 mx-2 max-sm:hidden" />

        {/* Profile / Mobile Combined Menu */}
        <div className="relative" ref={profileMenuRef}>
          <button 
            onClick={() => setIsDisplayNavList(!isDisplayNavList)}
            className={`flex items-center gap-2 p-1 rounded-2xl transition-all border border-transparent ${isDisplayNavList ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
          >
            <img src={User?.profile?.mediaurl || User?.profile} className="w-10 h-10 rounded-xl object-contain shadow-sm ring-2 ring-white" alt="profile" />
            <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] text-slate-400 transition-transform duration-300 ${isDisplayNavList ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {isDisplayNavList && (
            <div className="absolute right-0 mt-4 w-64 bg-white border border-slate-100 rounded-[28px] shadow-2xl p-2 z-[120] animate-in zoom-in-95">
              <div className="px-4 py-4 mb-2 bg-slate-50 rounded-2xl text-left border border-slate-100/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Connected as</p>
                <p className="text-sm font-black text-slate-800 truncate">{User?.firstName} {User?.lastName}</p>
                <p className="text-[9px] font-bold text-primBtn uppercase mt-0.5">{User?.role}</p>
              </div>

              {NavList.map((list) => (
                <div key={list.type} className={list.resposivehidden ? 'md:hidden' : 'block'}>
                  <button 
                    onClick={(e) => NavListControl(list.type, e)}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all group"
                  >
                    <div className={`flex items-center gap-3 font-bold text-sm ${list.color || 'text-slate-600 group-hover:text-slate-900'}`}>
                      <FontAwesomeIcon icon={list.icon} className={`${list.color ? 'text-rose-400' : 'text-slate-400 group-hover:text-primBtn'}`} />
                      {list.Text}
                    </div>
                    {(list.type === 'add' || list.type === 'setting') && 
                      <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] transition-transform duration-300 ${((list.type==='add' && isDisplayADd) || (list.type==='setting' && isDisplaySettingControl)) ? 'rotate-180 text-blue-600' : 'text-slate-300'}`} />
                    }
                  </button>

                  {/* Mobile Add Nested */}
                 {list.type === 'add' && isDisplayADd && (
  <div className="mx-2 my-1 space-y-1 animate-in slide-in-from-left-2 bg-slate-50/50 rounded-xl p-1">
    {ListAdd.filter(item => item.visible).map(item => (   // ← filter visible
      <button
        key={item.type}
        onClick={(e) => { e.stopPropagation(); handleAction(item.type); }}
        className="flex w-full items-center gap-3 p-3 text-xs font-bold text-slate-500 hover:text-primBtn hover:bg-white rounded-lg transition-all"
      >
        <FontAwesomeIcon icon={item.icon} className="w-4 opacity-70" /> {item.Text}
      </button>
    ))}
  </div>
)}

                  {/* Setting Nested */}
                  {list.type === 'setting' && isDisplaySettingControl && (
                    <div className="mx-2 my-1 space-y-1 animate-in slide-in-from-left-2 bg-slate-50/50 rounded-xl p-1">
                      {ListSetting.map(st => (
                        <button 
                          key={st.type} 
                          onClick={(e) => { e.stopPropagation(); handleAction(st.type); }} 
                          className="w-full text-left p-3 text-xs font-bold text-slate-500 hover:text-primBtn flex items-center gap-3 hover:bg-white rounded-lg transition-all"
                        >
                          <FontAwesomeIcon icon={st.icon} className="w-4 opacity-70" /> {st.Text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DashbordNav;