import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faUsers, 
  faMars, 
  faVenus, 
  faArrowTrendUp,
  faEllipsisH
} from '@fortawesome/free-solid-svg-icons';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const DashbordBody = ({ user, childData, employees }) => {
  // 1. Data Preparation for Graphs
  const pieData = [
    { name: 'Boys', value: childData?.[0]?.male || 0, color: '#3B82F6' },
    { name: 'Girls', value: childData?.[1]?.female || 0, color: '#F43F5E' },
  ];
 

  // Dummy Trend Data - Replace with real timeline data from your API if available
  const trendData = [
    { name: 'Sep', count: 40 }, { name: 'Oct', count: 30 },
    { name: 'Nov', count: 55 }, { name: 'Dec', count: 45 },
    { name: 'Jan', count: 80 }, { name: 'Feb', count: 95 },
  ];
 
 

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
      
      {/* LEFT & MIDDLE CONTENT (9 Columns) */}
      <div className="lg:col-span-9 space-y-8">
        
        {/* Welcome Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Analytics</h1>
            <p className="text-slate-500 font-medium">
              Welcome back, <span className="text-primBtn font-bold">{user?.firstName}</span>. Here is the latest activity.
            </p>
          </div>
          <div className="flex gap-2">
      
          <Link to={'/ALLChild'}>  <button className="bg-primBtn cursor-pointer text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-Hover transition-all">View All Childs</button></Link>
          </div>
        </header>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Students", val: childData?.[2]?.totalChild || 0, icon: faUsers, color: "indigo" },
            { label: "Boys", val: childData?.[0]?.male || 0, icon: faMars, color: "indigo" },
            { label: "Girls", val: childData?.[1]?.female || 0, icon: faVenus, color: "indigo" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-blue-200 transition-all">
              <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Analysis Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Growth Area Chart */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Growth Rate</h3>
                <p className="text-xs font-bold text-green-500 flex items-center gap-1">
                  <FontAwesomeIcon icon={faArrowTrendUp} /> +12.5% this month
                </p>
              </div>
              <button className="text-slate-300 hover:text-slate-600"><FontAwesomeIcon icon={faEllipsisH} /></button>
            </div>
            
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2e0769" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3a0f6e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} dy={10} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="count" stroke="#7456b9" strokeWidth={4} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Demographics Donut Chart */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center">
             <h3 className="font-black text-slate-900 text-lg self-start mb-6">Demographics</h3>
             <div className="h-[200px] w-full relative">
                {/* Center Label for Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-slate-800">{childData?.[2]?.totalChild || 0}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={pieData} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value">
                            {pieData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
             </div>
             {/* Custom Legend */}
             <div className="grid grid-cols-2 gap-4 w-full mt-4">
                {pieData.map((item, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                            <span className="text-xs font-bold text-slate-600">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-slate-900">{item.value}</span>
                    </div>
                ))}
             </div>
          </div>
        </div>
<section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
  <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
    <h2 className="text-xl font-black text-slate-900 tracking-tight">Staff Members</h2>
    <Link to="/AllEmployees" className="text-primBtn text-xs font-black uppercase tracking-widest hover:underline">View Directory</Link>
  </div>
  
  <div className="divide-y divide-slate-50 px-4">
    {employees
      ?.filter((emp) => emp._id !== user?._id) // 1. Remove the current user from the array
      .slice(0, 4)                             // 2. Then take the first 4 remaining staff
      .map((emp) => (
        <div key={emp._id} className="flex items-center justify-between p-4 hover:bg-primBtn/5 rounded-2xl transition-all group">
          <div className="flex items-center gap-4">
            <img 
              src={emp.profile?.mediaurl || emp.profile} 
              className="w-12 h-12 rounded-2xl object-contain ring-4 ring-white shadow-sm transition-transform group-hover:scale-110" 
              alt="" 
            />
            <div>
              <h4 className="font-bold text-slate-800 leading-none mb-1">
                {emp.firstName} {emp.lastName}
              </h4>
              <span className="bg-primBtn/10 text-primBtn text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                {emp.role}
              </span>
            </div>
          </div>
          
          <Link 
            to={`/EmployeeSingle/${emp._id}`} 
            className="bg-white border border-slate-200 text-slate-600 px-5 py-2 rounded-xl text-xs font-bold hover:bg-primBtn hover:text-white hover:border-primBtn transition-all"
          >
            Profile
          </Link>
        </div>
    ))}

    {/* Optional: Show a message if no other staff members exist */}
    {employees?.filter(emp => emp._id !== user?._id).length === 0 && (
      <div className="p-8 text-center text-slate-400 text-sm italic">
        No other staff members found.
      </div>
    )}
  </div>
</section>
      </div>

      {/* RIGHT SIDEBAR (3 Columns) */}
      <aside className="lg:col-span-3 space-y-6">
        <div className="bg-[#0F172A] p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
            <div className="relative z-10">
                <h3 className="font-black text-xl mb-6">Activity Log</h3>
                <div className="space-y-8">
                    {[
                        { title: "New Enrollment", time: "2h ago", color: "bg-blue-500" },
                        { title: "Staff Meeting", time: "5h ago", color: "bg-amber-500" },
                        { title: "System Sync", time: "1d ago", color: "bg-emerald-500" }
                    ].map((act, i) => (
                        <div key={i} className="flex gap-4 group cursor-pointer">
                            <div className={`w-1 h-10 ${act.color} rounded-full transition-all group-hover:w-2`} />
                            <div>
                                <p className="text-sm font-bold group-hover:text-blue-400 transition-colors">{act.title}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{act.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-10 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-xs font-black transition-all">
                    View Full History
                </button>
            </div>
            {/* Decorative Glass Circle */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
        </div>

        {/* Support Card */}
        <div className="bg-gradient-to-br from-primBtn to-primBtn p-8 rounded-[40px] text-white shadow-xl shadow-blue-500/20">
            <p className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-1">Help Center</p>
            <h4 className="text-xl font-black mb-4 leading-tight">Need assistance?</h4>
            <p className="text-sm text-blue-100/80 mb-6 font-medium leading-relaxed">Our support team is available 24/7 to help you with database management.</p>
            <button className="w-full py-3 bg-white text-blue-600 rounded-2xl font-black text-xs hover:shadow-lg transition-all">Contact Us</button>
        </div>
      </aside>
    </div>
  );
};

export default DashbordBody;