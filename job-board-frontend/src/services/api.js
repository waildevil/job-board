import axios from './axiosInstance';
import { API_URL, BACKEND_URL } from './config';



export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

export const fetchLatestJobs = async (page = 0, size = 5) => {
  const response = await axios.get(`${API_URL}/jobs/latest?page=${page}&size=${size}`);
  return response.data;
};

export const fetchCategories = async () => {
  const response = await axios.get(`${API_URL}/categories`);
  return response.data;
};

export const countJobsByMinSalary = async (filters) => {
  const params = new URLSearchParams();
  if (filters.keyword) params.append('keyword', filters.keyword);
  if (filters.location) params.append('location', filters.location);
  if (filters.type) params.append('type', filters.type);
  if (filters.category) params.append('category', filters.category);
  if (filters.salary) params.append('salary', filters.salary);

  const res = await axios.get(`${API_URL}/jobs/count?${params.toString()}`);
  return res.data;
};



export const searchJobs = async (filters) => {
  const params = new URLSearchParams();

  if (filters.keyword) params.append('keyword', filters.keyword);
  if (filters.location) params.append('location', filters.location);
  if (filters.type) params.append('type', filters.type);
  if (filters.category) params.append('category', filters.category);
  if (filters.minSalary) params.append('minSalary', filters.minSalary);

  const res = await fetch(`/api/jobs/search?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to search jobs');
  return res.json();
};


export async function fetchMyApplications() {
  const res = await fetch(`${API_URL}/applications/me`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch applications');
  }

  return await res.json();
}


export const hasAppliedToJob = async (jobId) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId'); 

  const res = await fetch(
    `${API_URL}/applications/has-applied?userId=${userId}&jobId=${jobId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to check application status');
  }

  return await res.json(); 
};


export function getDecodedToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}



// Jobs
export const getMyJobs = async () => (await axios.get(`${API_URL}/jobs/me`)).data;
export const createJob = async (payload) => (await axios.post(`${API_URL}/jobs`, payload)).data;
export const updateJob = async (id, payload) => (await axios.put(`${API_URL}/jobs/${id}`, payload)).data;
export const deleteJob = async (id) => (await axios.delete(`${API_URL}/jobs/${id}`)).data;

// Applications
export const getApplicantsByJob = async (jobId) => (await axios.get(`${API_URL}/applications/jobs/${jobId}/applications`)).data;
export const setApplicationStatus = async (applicationId, status) => (
  await axios.patch(`${API_URL}/applications/${applicationId}/status`, { status })
).data;
export const getEmployerApplications = async () => (await axios.get(`${API_URL}/applications/employer`)).data;
export const getJobStats = async (jobId) => (await axios.get(`${API_URL}/applications/jobs/${jobId}/stats`)).data;

// Companies & Categories
export const fetchCompanies = async () => (await axios.get(`${API_URL}/companies`)).data;







