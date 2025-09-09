import axios from './axiosInstance';

// AUTH
export const loginUser = async (email, password) =>
  (await axios.post('/auth/login', { email, password })).data;

// JOBS (public)
export const fetchLatestJobs = async (page = 0, size = 5) =>
  (await axios.get(`/jobs/latest`, { params: { page, size } })).data;

export const fetchCategories = async () =>
  (await axios.get(`/categories`)).data;

export const countJobsByMinSalary = async (filters = {}) => {
  const params = {};
  if (filters.keyword) params.keyword = filters.keyword;
  if (filters.location) params.location = filters.location;
  if (filters.type) params.type = filters.type;
  if (filters.category) params.category = filters.category;
  if (filters.salary) params.salary = filters.salary;
  return (await axios.get('/jobs/count', { params })).data;
};

export const searchJobs = async (filters = {}) => {
  const params = {};
  if (filters.keyword) params.keyword = filters.keyword;
  if (filters.location) params.location = filters.location;
  if (filters.type) params.type = filters.type;
  if (filters.category) params.category = filters.category;
  const minSalary = filters.minSalary ?? filters.salary;
  if (minSalary !== undefined && minSalary !== null && `${minSalary}` !== '') {
    params.minSalary = minSalary;
  }
  return (await axios.get('/jobs/search', { params })).data;
};

// APPLICATIONS (use axios, no raw fetch)
export const fetchMyApplications = async () =>
  (await axios.get('/applications/me')).data;

export const hasAppliedToJob = async (jobId) => {
  const userId = localStorage.getItem('userId');
  if (!userId) return false; // avoid calling with userId=null
  return (await axios.get('/applications/has-applied', { params: { userId, jobId } })).data;
};

// TOKEN UTILS
export function getDecodedToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

// JOB CRUD (authed)
export const getMyJobs = async () => (await axios.get(`/jobs/me`)).data;
export const createJob = async (payload) => (await axios.post(`/jobs`, payload)).data;
export const updateJob = async (id, payload) => (await axios.put(`/jobs/${id}`, payload)).data;
export const deleteJob = async (id) => (await axios.delete(`/jobs/${id}`)).data;

// Applicants / Stats
export const getApplicantsByJob = async (jobId) =>
  (await axios.get(`/applications/jobs/${jobId}/applications`)).data;

export const setApplicationStatus = async (applicationId, status) =>
  (await axios.patch(`/applications/${applicationId}/status`, { status })).data;

export const getEmployerApplications = async () =>
  (await axios.get(`/applications/employer`)).data;

export const getJobStats = async (jobId) =>
  (await axios.get(`/applications/jobs/${jobId}/stats`)).data;

// Companies
export const fetchCompanies = async () =>
  (await axios.get(`/companies`)).data;

// Me
export const fetchMe = async () =>
  (await axios.get('/users/me')).data;

export const setMyPassword = async (newPassword) =>
  (await axios.patch('/users/me/password', { newPassword })).data;

// Files
export const getApplicationFile = async (appId, type) =>
  await axios.get(`/applications/${appId}/${type}`, { responseType: 'blob' });

// Job details + application submit
export const getJobById = async (id) =>
  (await axios.get(`/jobs/${id}`)).data;

export const submitApplication = async (formData) =>
  (await axios.post('/applications', formData)).data;

// Page-specific search (JobList.jsx)
export const searchJobsForList = async ({ keyword, location, category, type, salary } = {}) => {
  const params = {};
  if (keyword) params.keyword = keyword;
  if (location) params.location = location;
  if (category) params.category = category;
  if (type) params.type = type;
  if (salary) params.minSalary = salary;
  return (await axios.get('/jobs/search', { params })).data;
};

// Generic PATCH helper for profile page
export const patchProfileResource = async (url, body) =>
  (await axios.patch(url, body)).data;

// Register
export const registerUser = async (payload) =>
  (await axios.post('/auth/register', payload)).data;


export const updateMyPassword = async (oldPassword, newPassword) =>
  (await axios.patch('/users/me/password', { oldPassword, newPassword })).data;
