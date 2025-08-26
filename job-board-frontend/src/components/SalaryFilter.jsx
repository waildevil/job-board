import { useEffect, useState } from 'react';
import { countJobsByMinSalary } from '../services/api';

function SalaryFilter({ value, onChange, onRelease, filters }) {
  const [previewSalary, setPreviewSalary] = useState(value ? Number(value) : 10000);
  const [jobCount, setJobCount] = useState(0);

  useEffect(() => {
    setPreviewSalary(value ? Number(value) : 10000);
    }, [value]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const updatedFilters = {
          keyword: filters?.keyword || null,
          location: filters?.location || null,
          category: filters?.category || null,
          type: filters?.type || null,
          salary: previewSalary
        };

        const count = await countJobsByMinSalary(updatedFilters);
        setJobCount(count);
      } catch (err) {
        console.error('Error fetching job count by salary', err);
      }
    };

    fetchCount();
  }, [previewSalary, filters]);

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Salary From</label>
      <div className="flex justify-between text-xs text-gray-500 font-medium mb-2">
        <span>€10,000</span>
        <span>€100,000</span>
      </div>

      <input
        type="range"
        min="10000"
        max="100000"
        step="1000"
        value={Number(previewSalary)}
        onChange={(e) => {
          const newVal = e.target.value;
          setPreviewSalary(newVal);
          onChange(newVal);
        }}
        onMouseUp={() => onRelease(previewSalary)}
        onTouchEnd={() => onRelease(previewSalary)}
        className="w-full accent-blue-600"
      />

      <div className="mt-2 text-sm flex items-center justify-between">
        <span className="text-gray-700">
          from <span className="font-semibold">€{Number(previewSalary).toLocaleString()}</span> /year
        </span>
        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
          {jobCount} jobs
        </span>
      </div>
    </div>
  );
}

export default SalaryFilter;
