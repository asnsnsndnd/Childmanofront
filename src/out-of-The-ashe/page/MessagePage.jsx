import React, { useEffect } from 'react';
import DashbordNav from '../Component/AuthenticateComponent/DashbordNav';
import Message from '../Component/AuthenticateComponent/Message';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const MessagePage = () => {
  const { isAuthenticate } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticate) navigate('/loginpage');
  }, [isAuthenticate, navigate]);

  return (
    <div className='w-full h-screen flex flex-col bg-[#F0F4F8] overflow-hidden'>
      <DashbordNav />
      {/* Remove pt-25 to allow the chat to fill the viewport below the nav */}
      <main className="flex-grow pt-20 h-full overflow-hidden">
        <Message />
      </main>
    </div>
  );
};

export default MessagePage;