import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  CalendarDaysIcon,
  BanknotesIcon
} from '@heroicons/react/24/solid';
import JobApplicationForm from './JobApplicationForm';
import { hasAppliedToJob } from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { API_URL } from '../services/config';

function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/jobs/${id}`);
        const data = await res.json();
        setJob(data);
      } catch (err) {
        console.error('Failed to fetch job details:', err);
      } finally {
        setLoading(false);
      }
    };

    const checkApplicationStatus = async () => {
      try {
        const applied = await hasAppliedToJob(id);
        setHasApplied(applied);
      } catch (err) {
        console.error('Error checking application status:', err);
      } finally {
        setCheckingApplication(false);
      }
    };

    fetchJob();
    checkApplicationStatus();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!job) return <p className="p-6">Job not found.</p>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Link to="/jobs" className="text-blue-600 hover:underline mb-4 inline-block">← Back to jobs</Link>

      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <div className="text-gray-600 mt-1 flex flex-wrap items-center gap-2 text-sm">
              <BriefcaseIcon className="w-4 h-4 text-gray-400" />
              {job.companyName}

              <MapPinIcon className="w-4 h-4 text-gray-400" />
              {job.location}

              <ClockIcon className="w-4 h-4 text-gray-400" />
              {job.type}
            </div>

            <div className="text-gray-600 mt-1 flex flex-wrap items-center gap-2 text-sm">
              <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
              Published:{' '}
              {job.createdAt ? dayjs(job.createdAt).fromNow() : 'N/A'}


              <BanknotesIcon className="w-4 h-4 text-gray-400" />
              {job.salaryText}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          {checkingApplication ? (
            <p>Checking application status...</p>
          ) : hasApplied ? (
            <button
              disabled
              title="You already applied for this job"
              className="bg-gray-300 text-gray-600 px-6 py-2 rounded-full cursor-not-allowed"
            >
              Already Applied
            </button>
          ) : localStorage.getItem('token') ? (
            <Link
              to={`/apply/${job.id}`}
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition text-center inline-block"
            >
              I'm interested →
            </Link>
          ) : (
            <Link
              to={`/login?redirect=/apply/${job.id}`}
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition text-center inline-block"
            >
              Login to Apply →
            </Link>
          )}
        </div>

      </div>

      
      <div className="prose prose-lg max-w-none text-gray-700">
        <div
          dangerouslySetInnerHTML={{ __html: job.description }}
        />
      </div>


      
      {showApplicationForm && (
        <div className="bg-white p-6 rounded shadow mt-6">
          <JobApplicationForm jobId={id} />
        </div>
      )}
    </div>
  );
}

export default JobDetail;
