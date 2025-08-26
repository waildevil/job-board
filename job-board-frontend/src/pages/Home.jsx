import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinIcon, BriefcaseIcon } from '@heroicons/react/24/solid';
import { getUserRole } from '../utils/auth';
import { fetchCategories, fetchLatestJobs } from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

function Home() {
  const role = getUserRole();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [latestJobs, setLatestJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (location) params.append('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  const handleCategoryClick = (categoryName) => {
    const encodedCategory = categoryName.replace(/\s+/g, '+');
    const params = new URLSearchParams();
    params.set('category', categoryName);
    navigate(`/jobs?${params.toString()}`);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [jobsData, categoriesData] = await Promise.all([
          fetchLatestJobs(0, 5),
          fetchCategories(),
        ]);
        setLatestJobs(jobsData.content);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch initial data', error);
      }
    };

    loadInitialData();
  }, []);

  const loadMore = async () => {
    const nextPage = page + 1;
    try {
      const data = await fetchLatestJobs(nextPage);
      setLatestJobs((prev) => [...prev, ...data.content]);
      setPage(nextPage);
      if (data.last) setHasMore(false);
    } catch (err) {
      console.error('Failed to load more jobs', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Find your dream job</h1>
        <p className="text-lg text-gray-600 mb-8">
          Search thousands of job listings across all industries and cities.
        </p>

        
        <form
          onSubmit={handleSearch}
          className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm">
            <BriefcaseIcon className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Job title or keyword"
              className="w-full focus:outline-none"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm">
            <MapPinIcon className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="City"
              className="w-full focus:outline-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md px-6 py-2 shadow-sm transition"
          >
            Search
          </button>
        </form>
      </section>

      
      <section className="py-16 px-6 bg-white">
        <h2 className="text-2xl font-semibold text-center mb-10">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer text-left"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-all">
                <BriefcaseIcon className="w-6 h-6 text-blue-600 group-hover:text-white transition-all" />
              </div>
              <p className="text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-all">
                {cat.name}
              </p>
            </button>
          ))}
        </div>
      </section>

      
      <section className="py-16 px-6 bg-gray-100">
        <h2 className="text-2xl font-semibold text-center mb-10">Latest Jobs</h2>
        <div className="space-y-6 max-w-3xl mx-auto">
          {latestJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-bold">{job.title}</h3>
              <p className="text-gray-600">
                {job.location} • {job.type} • {job.salaryText || 'Salary not specified'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
              {job.category} • Posted{' '}
              {job.createdAt ? dayjs.tz(job.createdAt, 'Europe/Berlin').fromNow() : 'Date not available'}
            </p>
            </div>
          ))}

          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </section>

      
      {role === 'RECRUITER' && (
        <section className="bg-blue-600 text-white py-16 text-center px-6">
          <h2 className="text-3xl font-semibold mb-4">Hiring? Post a job today.</h2>
          <p className="mb-6">Reach thousands of qualified candidates in minutes.</p>
          <button className="bg-white text-blue-600 px-6 py-2 font-bold rounded-md hover:bg-gray-200 transition">
            Post a Job
          </button>
        </section>
      )}
    </div>
  );
}

export default Home;
