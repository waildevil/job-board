import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../services/axiosInstance';
import { getApplicantsByJob, setApplicationStatus, getJobStats, getApplicationFile  } from '../../services/api';
import { toast } from 'react-toastify';
import { API_URL } from '../../services/config';

export default function JobApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeId = (v) => (typeof v === 'string' ? parseInt(v, 10) : v);


  const openApplicationFile = async (appId, type) => {
    try {
      const res = await getApplicationFile(appId, type);

 
      const mime = res.headers["content-type"] || "application/pdf";
      const blob = new Blob([res.data], { type: mime });
      const fileURL = window.URL.createObjectURL(blob);

  
      const win = window.open(fileURL, "_blank");
      if (!win) {
        
        const link = document.createElement("a");
        link.href = fileURL;
        link.download = `${type}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to open file");
    }
  };

  const derivedStats = useMemo(() => {
    const accepted = apps.filter((a) => a.status === 'ACCEPTED').length;
    return {
      acceptedCount: stats?.acceptedCount ?? accepted,
      remainingPositions: stats?.remainingPositions ?? 0,
    };
  }, [apps, stats]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [a, s] = await Promise.all([
          getApplicantsByJob(jobId),
          getJobStats(jobId),
        ]);
        const sorted = [...a].sort(
          (x, y) => new Date(y.appliedAt) - new Date(x.appliedAt)
        );
        setApps(sorted);
        setStats(s ?? null);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load applicants');
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  const onStatusChange = async (id, nextStatus) => {
    const appId = normalizeId(id);
    const snapshot = apps;

    setApps((curr) =>
      curr.map((ap) =>
        normalizeId(ap.id) === appId ? { ...ap, status: nextStatus } : ap
      )
    );

    try {
      await setApplicationStatus(appId, nextStatus);
      toast.success(`Status updated to ${nextStatus}`);
    } catch (e) {
      console.error(e);
      setApps(snapshot); 
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Applicants</h1>
        <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded">
          Back
        </button>
      </div>

      <div className="mb-4 text-sm text-gray-700 flex gap-6">
        <div>Accepted: {derivedStats.acceptedCount}</div>
        <div>Remaining positions: {derivedStats.remainingPositions}</div>
      </div>

      {apps.length === 0 ? (
        <div className="text-gray-600">No applications yet.</div>
      ) : (
        <div className="space-y-4">
          {apps.map((ap) => (
            <div key={ap.id} className="border rounded p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">
                    {ap.candidate?.name || 'Unknown'} ({ap.candidate?.email || 'N/A'})
                  </div>
                  <div className="text-sm text-gray-600">
                    Applied at: {new Date(ap.appliedAt).toLocaleString()}
                  </div>
                  <div className="text-sm mt-2 flex items-center gap-2">
                    Status: <StatusBadge status={ap.status} />
                  </div>

                  <div className="flex gap-3 mt-3">
                    {ap.resume && (
                      <button
                        type="button"
                        className="underline text-blue-600"
                        onClick={() => openApplicationFile(ap.id, "resume")}
                      >
                        View Resume
                      </button>
                    )}
                    {ap.coverLetter && (
                      <button
                        type="button"
                        className="underline text-blue-600"
                        onClick={() => openApplicationFile(ap.id, "cover-letter")}
                      >
                        View Cover Letter
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onStatusChange(ap.id, 'PENDING')}
                    className="px-3 py-1.5 border rounded"
                  >
                    Mark Pending
                  </button>
                  <button
                    onClick={() => onStatusChange(ap.id, 'ACCEPTED')}
                    className="px-3 py-1.5 bg-green-600 text-white rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onStatusChange(ap.id, 'REJECTED')}
                    className="px-3 py-1.5 bg-red-600 text-white rounded"
                  >
                    Reject
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

function StatusBadge({ status }) {
  let color = 'bg-gray-200 text-gray-800';
  if (status === 'ACCEPTED') color = 'bg-green-500 text-white';
  if (status === 'REJECTED') color = 'bg-red-500 text-white';
  if (status === 'PENDING') color = 'bg-yellow-400 text-black';

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}
