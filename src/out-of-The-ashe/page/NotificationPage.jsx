import React from 'react'
import DashbordNav from '../Component/AuthenticateComponent/DashbordNav'
import { FooterComponent } from '../Component/FooterComponent'
import Notification from '../Component/AuthenticateComponent/Notification'


const NotificationPage = () => {
  
  return (
    <div className='w-full pt-25 gap-10 flex flex-col bg-[#D6E2ED]  min-h-screen'>
      <DashbordNav></DashbordNav>

     <Notification></Notification>

    

    </div>
  )
}

export default NotificationPage
