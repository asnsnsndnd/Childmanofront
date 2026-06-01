import React from 'react';
import DashbordNav from '../Component/AuthenticateComponent/DashbordNav';
import { FooterComponent } from '../Component/FooterComponent';
import CreateTask from '../Component/AuthenticateComponent/CreateTask';

const CreateTaskPage = () => {
  return (
    <div className='w-full min-h-screen flex flex-col bg-[#F9FAFB] selection:bg-blue-100'>
      <DashbordNav />
      {/* Main Content Area */}
      <main className="flex-grow pt-32 pb-20 px-4">
        <CreateTask />
      </main>
  
    </div>
  );
}

export default CreateTaskPage;