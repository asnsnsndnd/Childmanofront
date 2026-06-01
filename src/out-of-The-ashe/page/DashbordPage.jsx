import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashbordNav from '../Component/AuthenticateComponent/DashbordNav';
import DashbordBody from '../Component/AuthenticateComponent/DashbordBody';
import { FooterComponent } from '../Component/FooterComponent';
import { useGetUserQuery } from '../Redux/User';
import { useGetChildsQuery } from '../Redux/Childes';
import { useGetEmployeesQuery } from '../Redux/Employee';

const Spinner = () => (
  <div className="flex flex-col items-center gap-4">
    <div className="w-12 h-12 border-4 border-primBtn border-t-transparent rounded-full animate-spin" />
    <p className="text-primBtn font-bold animate-pulse">Loading Workspace...</p>
  </div>
);

const DashbordPage = () => {
  const { id, isAuthenticate } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const { data: user, isLoading: userLoad } = useGetUserQuery(id);
  const { data: childData, isLoading: childLoad } = useGetChildsQuery();
  const { data: employees, isLoading: empLoad } = useGetEmployeesQuery();

  useEffect(() => {
    if (!isAuthenticate) navigate('/loginpage');
    window.scrollTo(0, 0);
  }, [isAuthenticate, navigate]);

  const isLoading = userLoad || childLoad || empLoad;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen ">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <DashbordNav user={user} />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <DashbordBody 
          user={user} 
          childData={childData} 
          employees={employees} 
        />
      </main>
    
    </div>
  );
};

export default DashbordPage;