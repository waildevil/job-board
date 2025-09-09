import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BriefcaseIcon, MapPinIcon } from '@heroicons/react/24/solid';
import JobCard from './JobCard';
import { fetchCategories, countJobsByMinSalary } from '../services/api';
import SalaryFilter from '../components/SalaryFilter';
import { API_URL } from '../services/config';

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobCountBySalary, setJobCountBySalary] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [salary, setSalary] = useState(searchParams.get('salary') || '');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (keyword) query.append('keyword', keyword);
        if (location) query.append('location', location);
        if (category) query.append('category', category);
        if (type) query.append('type', type);
        if (salary) query.append('minSalary', salary);

        const res = await fetch(`/jobs/search?${query.toString()}`);
        const data = await res.json();
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setJobs(sorted);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchParams]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    loadCategories();
  }, []);

  const handleSalaryRelease = async (val) => {
    try {
      const count = await countJobsByMinSalary(val);
      setJobCountBySalary(count);

      const params = buildParams({ salary: val });
      navigate(`/jobs?${params.toString()}`);
    } catch (err) {
      console.error('Failed to count jobs by salary:', err);
    }
  };

  const buildParams = (override = {}) => {
    const params = new URLSearchParams();
    if (override.keyword !== undefined ? override.keyword : keyword) params.set('keyword', override.keyword ?? keyword);
    if (override.location !== undefined ? override.location : location) params.set('location', override.location ?? location);
    if (override.category !== undefined ? override.category : category) params.set('category', override.category ?? category);
    if (override.type !== undefined ? override.type : type) params.set('type', override.type ?? type);
    if (override.salary !== undefined ? override.salary : salary) params.set('salary', override.salary ?? salary);
    return params;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = buildParams();
    navigate(`/jobs?${params.toString()}`);
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    const params = buildParams({ category: val });
    navigate(`/jobs?${params.toString()}`);
  };

  const handleTypeChange = (val) => {
    setType(val);
    const params = buildParams({ type: val });
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="px-6 py-12 max-w-7xl mx-auto">
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm">
          <BriefcaseIcon className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Job title"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full outline-none"
          />
        </div>
        <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm">
          <MapPinIcon className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="City"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="bg-white border border-gray-300 rounded-md p-4 shadow-sm">
          <h3 className="font-semibold mb-2">Filters</h3>

          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 mb-4"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 mb-4"
          >
            <option value="">All Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Internship">Internship</option>
            <option value="Freelance">Freelance</option>
          </select>

          <SalaryFilter
            value={salary}
            onChange={(val) => setSalary(val)}
            onRelease={handleSalaryRelease}
            filters={{ keyword, location, category, type }}
          />

          <button
            onClick={() => {
              setKeyword('');
              setLocation('');
              setCategory('');
              setType('');
              setSalary('');
              navigate('/jobs');
            }}
            className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium transition"
          >
            Reset Filters
          </button>

        </div>

        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-2">Job Results</h1>
          <p className="text-sm text-gray-500 mb-6">{jobs.length} job(s) found</p>

          {loading ? (
            <p>Loading...</p>
          ) : jobs.length === 0 ? (
            <p>No jobs found.</p>
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default JobList;
