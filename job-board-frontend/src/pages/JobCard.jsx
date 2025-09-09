import React from 'react';
import {
  BriefcaseIcon,
  MapPinIcon,
  BanknotesIcon,
  ClockIcon
} from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';


dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

function JobCard({ job }) {
  const postedAgo = job.createdAt
    ? dayjs.tz(job.createdAt, 'Europe/Berlin').fromNow()
    : 'Recently';

  return (
    <Link to={`/jobs/${job.id}`} className="block hover:shadow-lg transition">
      <div className="bg-white border border-blue-100 rounded-lg shadow-sm p-6 mb-6 hover:shadow-md transition-all duration-200">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">{job.title}</h2>

        <div className="flex flex-wrap text-gray-600 text-sm items-center mb-2 gap-x-4 gap-y-2">
          <div className="flex items-center gap-1">
            <BriefcaseIcon className="w-4 h-4 text-red-400" />
            <span>{job.companyName}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPinIcon className="w-4 h-4 text-red-400" />
            <span>{job.location}</span>
          </div>
          {job.category && (
            <div className="flex items-center gap-1">
              <BriefcaseIcon className="w-4 h-4 text-red-400" />
              <span>{job.category}</span>
            </div>
          )}
          {job.type && (
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4 text-red-400" />
              <span>{job.type}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-gray-700 text-sm mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <BanknotesIcon className="w-4 h-4 text-red-400" />
              <span>{job.salaryText || 'Not specified'}</span>
            </div>
            <span className="text-gray-500">• Posted {postedAgo}</span>
          </div>
        </div>

        {job.easyApply && (
          <span className="inline-block bg-blue-100 text-blue-600 px-3 py-1 text-xs rounded-full mb-2">
            Easy Apply
          </span>
        )}

        <div
          className="text-gray-700 text-sm line-clamp-2 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html: job.description || 'No description provided.',
          }}
        />
      </div>
    </Link>
  );
}

export default JobCard;
