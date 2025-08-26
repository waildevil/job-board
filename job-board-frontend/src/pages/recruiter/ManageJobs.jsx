import React, { useEffect, useState } from 'react';
import { getMyJobs, deleteJob } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const TYPE_LABELS = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await getMyJobs();
      setJobs(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch your jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await deleteJob(id);
      toast.success('Job deleted');
      setJobs(jobs.filter(j => j.id !== id));
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete');
    }
  };

  const formatType = (type) => {
    if (!type) return '—';
    return TYPE_LABELS[type] || type;
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">My Jobs</h1>
        <button 
          onClick={() => navigate('/recruiter/post')} 
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Post a Job
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="text-gray-600">No jobs yet.</div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="border rounded p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-lg font-medium">{job.title}</h2>
                  <p className="text-sm text-gray-600">
                    {job.companyName} • {job.location} • {formatType(job.type)}
                  </p>
                  {/* FIX: render description as formatted HTML but clamp to 2 lines */}
                  <div
                    className="text-sm text-gray-700 mt-2 line-clamp-2 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: job.description || 'No description provided.' }}
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/recruiter/post/${job.id}`)} 
                    className="px-3 py-1.5 border rounded"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)} 
                    className="px-3 py-1.5 border rounded"
                  >
                    Applicants
                  </button>
                  <button 
                    onClick={() => handleDelete(job.id)} 
                    className="px-3 py-1.5 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
