import React, { useEffect } from 'react'
// BrowserRouterን በ HashRouter ቀይረነዋል
import { HashRouter as Router, Routes, Route } from 'react-router-dom' 
import HomePage from './out-of-The-ashe/page/HomePage'
import LoginPage from './out-of-The-ashe/page/LoginPage'
import DashbordPage from './out-of-The-ashe/page/DashbordPage'
import ChildRegisterPage from './out-of-The-ashe/page/ChildRegisterPage'
import EmployeeRegisterPage from './out-of-The-ashe/page/EmployeeRegisterPage'

import ProfilePage from './out-of-The-ashe/page/ProfilePage'


import PasswordChangePage from './out-of-The-ashe/page/PasswordChangePage'
import ChildSinglePage from './out-of-The-ashe/page/ChildSinglePage'

import EmployeeSinglePage from './out-of-The-ashe/page/EmployeeSinglePage'
import { useSelector, useDispatch } from 'react-redux'
import { updateOnlineUser } from './out-of-The-ashe/Redux/StateWeb'
import RegisterChildPage from './out-of-The-ashe/page/RegisterChildPage'
import StudentManagement from './out-of-The-ashe/page/StudentManagement'
import ProtectedRoute from './out-of-The-ashe/Component/AuthenticateComponent/ProtectedRoute'
const App = () => {
  const { id } = useSelector((state) => state.auth)
  const Dispatch = useDispatch()

  useEffect(() => {
    if (id) {
      socket.emit('join', id);
      socket.on('onlineUser', (user) => {
        Dispatch(updateOnlineUser(user));
      })
    }
    return () => {
      socket.off('onlineUser') // disconnect ሳይሆን onlineUserን አጥፋው
    }
  }, [id, Dispatch])

  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/loginpage' element={ <LoginPage />} />
        <Route path='/DashboardPage' element={<ProtectedRoute> <DashbordPage /></ProtectedRoute>} />
        <Route path='/EmployeerRgister' element={<ProtectedRoute permission="employeeRegister"><EmployeeRegisterPage /></ProtectedRoute>} />
        <Route path='/ChildRegister' element={ <ProtectedRoute permission="childRegister"><RegisterChildPage /> </ProtectedRoute>} />
        <Route path='/ProfilePage' element={ <ProtectedRoute> <ProfilePage /> </ProtectedRoute>} />
        <Route path='/MessagePage' element={<ProtectedRoute> <MessagePage /> </ProtectedRoute>} />
        <Route path='/Notification' element={<ProtectedRoute> <NotificationPage /> </ProtectedRoute>} />
        <Route path='/PasswordChange' element={<ProtectedRoute> <PasswordChangePage /> </ProtectedRoute>} />
        <Route path='/ChildSingle/:id' element={<ProtectedRoute> <ChildSinglePage /> </ProtectedRoute>} />
        <Route path='/EmployeeSingle/:id' element={ <ProtectedRoute><EmployeeSinglePage /> </ProtectedRoute>} />
        <Route path='/ALLChild' element={<ProtectedRoute> <StudentManagement /> </ProtectedRoute>} />
        
       
      </Routes>
    </Router>
  )
}

export default App