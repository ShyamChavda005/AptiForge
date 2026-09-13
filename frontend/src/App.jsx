import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/user/Dashboard'
import AdminDashboard from './pages/admin/AdminDashboard';
import CommingSoon from './components/CommingSoon'
import WhyChooseUs from './components/WhyChooseUs'
import Ready from './components/Ready'
import Logout from './pages/Logout'
import Instruction from './pages/user/Instruction'
import Profile from './pages/user/Profile'
import Question from './pages/user/Questions'
import PageNotFound from './components/PageNotFound'
import OTP from './pages/Otp'
import AdminQuestions from './pages/admin/AdminQuestions'
import AdminAddQuestion from './pages/admin/AdminAddQuestion'
import AdminTopics from './pages/admin/AdminTopics'
import AdminAddTopic from './pages/admin/AdminAddTopic'
import AdminViewUser from './pages/admin/AdminViewUser'
import AdminProfile from './pages/admin/AdminProfile'
import GenerateQuestion from './pages/admin/GenerateQuestion'

function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <WhyChooseUs />
      <CommingSoon />
      <Ready />
    </>
  )
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Normal Web Route */}
          <Route path="/" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/login/otp" element={<OTP />}></Route>
          <Route path="/signup" element={<Register />}></Route>
          <Route path="/logout" element={<Logout />}></Route>
          <Route path="*" element={<PageNotFound />} />

          {/* User Route */}
          <Route path="/user/dashboard" element={<Dashboard />} />
          <Route path="/user/dashboard/profile" element={<Profile />} />
          <Route path="/user/dashboard/instruction" element={<Instruction />} />
          <Route path="/user/dashboard/Questions" element={<Question />} />

          {/* Admin Route */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/dashboard/questions" element={<AdminQuestions />} />
          <Route path="/admin/dashboard/add-questions" element={<AdminAddQuestion />} />
          <Route path="/admin/dashboard/add-questions/generate-question" element={<GenerateQuestion />} />
          <Route path="/admin/dashboard/add-questions/generate-questions" element={<GenerateQuestion />} />
          <Route path="/admin/dashboard/topics" element={<AdminTopics />} />
          <Route path="/admin/dashboard/add-topic" element={<AdminAddTopic />} />
          <Route path="/admin/dashboard/users" element={<AdminViewUser />} />
          <Route path="/admin/dashboard/profile" element={<AdminProfile />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
