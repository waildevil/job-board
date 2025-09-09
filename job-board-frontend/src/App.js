import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar'
import Login from './pages/Login';
import Register from './pages/Register';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import JobApplicationForm from './pages/JobApplicationForm';
import MyApplications from './pages/MyApplications';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MyProfile from './pages/MyProfile';
import OAuthCallback from './pages/OAuthCallback.jsx';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import ManageJobs from './pages/recruiter/ManageJobs';
import PostJob from './pages/recruiter/PostJob';
import JobApplicants from './pages/recruiter/JobApplicants';
import RecruiterHome from './pages/recruiter/RecruiterHome';
import RoleAwareNavbar from './components/RoleAwareNavbar';
import HomeRedirect from './pages/HomeRedirect';


function App() {
  return (
    <Router>
      <RoleAwareNavbar/>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<JobList/>} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/apply/:id" element={<JobApplicationForm />} />
        <Route path="/my-applications" element={<MyApplications/>}/> 
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/oauth2/callback" element={<OAuthCallback />} />

        <Route path="/recruiter" element={<RecruiterHome />} />
        <Route path="/recruiter" element={<RecruiterDashboard />} />
        <Route path="/recruiter/jobs" element={<ManageJobs />} />
        <Route path="/recruiter/post" element={<PostJob />} />
        <Route path="/recruiter/post/:id" element={<PostJob />} />
        <Route path="/recruiter/jobs/:jobId/applicants" element={<JobApplicants />} />

        
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;