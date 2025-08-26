import React, { useEffect, useMemo, useState } from 'react';
import { createJob, updateJob, fetchCompanies, fetchCategories } from '../../services/api';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiBriefcase, FiMapPin, FiTag } from 'react-icons/fi';
import { FaEuroSign } from 'react-icons/fa';
import { Editor } from '@tinymce/tinymce-react';

const TYPE_LABELS = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
};
const TYPES = Object.keys(TYPE_LABELS);

export default function PostJob() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeId } = useParams(); 
  const stateJob = location.state?.job || null;

  const [editingJob, setEditingJob] = useState(stateJob);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [jobLoading, setJobLoading] = useState(Boolean(routeId) && !stateJob);
  const [saving, setSaving] = useState(false);

  const isEditing = useMemo(() => Boolean(routeId || editingJob?.id), [routeId, editingJob]);

  const [form, setForm] = useState({
    title: stateJob?.title || '',
    description: stateJob?.description || '',
    location: stateJob?.location || '',
    type: stateJob?.type || 'FULL_TIME',
    minSalary: stateJob?.minSalary ?? '',
    maxSalary: stateJob?.maxSalary ?? '',
    salaryText: stateJob?.salaryText || '',
    companyId: stateJob?.companyId || '',
    categoryId: stateJob?.categoryId || '',
  });

  useEffect(() => {
    (async () => {
      try {
        const [co, ca] = await Promise.all([fetchCompanies(), fetchCategories()]);
        setCompanies(co || []);
        setCategories(ca || []);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load companies/categories');
      } finally {
        setListsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!routeId || stateJob) return;
    (async () => {
      try {
        setJobLoading(true);
        const res = await fetch(`http://localhost:8080/api/jobs/${routeId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        });
        if (!res.ok) throw new Error('Failed to load job');
        const job = await res.json();
        setEditingJob(job);
        setForm((f) => ({
          ...f,
          title: job.title || '',
          description: job.description || '',
          location: job.location || '',
          type: job.type || 'FULL_TIME',
          minSalary: job.minSalary ?? '',
          maxSalary: job.maxSalary ?? '',
          salaryText: job.salaryText || '',
        }));
      } catch (e) {
        console.error(e);
        toast.error('Could not load job for editing');
      } finally {
        setJobLoading(false);
      }
    })();
  }, [routeId, stateJob]);

  useEffect(() => {
    if (listsLoading) return;
    if (!editingJob) return;

    setForm((f) => {
      let next = { ...f };
      if (!next.companyId && editingJob.companyName && companies.length) {
        const matchCo = companies.find((c) => c.name === editingJob.companyName);
        if (matchCo) next.companyId = matchCo.id;
      }
      if (!next.categoryId && editingJob.category && categories.length) {
        const matchCat = categories.find((c) => c.name === editingJob.category);
        if (matchCat) next.categoryId = matchCat.id;
      }
      return next;
    });
  }, [listsLoading, editingJob, companies, categories]);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.description || !form.description.trim()) return toast.error('Description is required');
    if (!form.categoryId) return toast.error('Please choose a category');

    setSaving(true);
    try {
      const payload = {
        ...form,
        minSalary: form.minSalary !== '' ? Number(form.minSalary) : null,
        maxSalary: form.maxSalary !== '' ? Number(form.maxSalary) : null,
        companyId: form.companyId ? Number(form.companyId) : null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      };

      if (isEditing) {
        const idToUse = routeId || editingJob?.id;
        await updateJob(idToUse, payload);
        toast.success('Job updated');
      } else {
        await createJob(payload);
        toast.success('Job created');
      }
      navigate('/recruiter/jobs');
    } catch (e2) {
      console.error(e2);
      toast.error(e2?.response?.data?.message || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  if (listsLoading || jobLoading) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <form onSubmit={submit} className="max-w-6xl mx-auto px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Job' : 'Post a Job'}
          </h1>
          <p className="text-gray-600 mt-1">Provide clear details to attract the right candidates.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Job Basics">
              <LabeledInput
                icon={<FiBriefcase />}
                label="Job Title"
                required
                placeholder="e.g., Senior Backend Developer"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
              />

              <div>
                <Label>Job Description</Label>
                <Editor
                  apiKey="2uwei5gq71kjr6oqzynzss18c5fzdoadtgoftiwyjv5uvypz"
                  value={form.description}
                  onEditorChange={(content) => set('description', content)}
                  init={{
                    height: 260,
                    menubar: false,
                    statusbar: false,
                    branding: false,
                    plugins: 'lists link',
                    toolbar:
                      'undo redo | blocks | bold italic underline | bullist numlist | link | removeformat',
                  
                    block_formats: 'Paragraph=p; Heading 2=h2; Heading 3=h3; Heading 4=h4',
                    
                    valid_elements: '*[*]',
                    content_style: `
                      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; color:#111827; }
                      h2,h3,h4 { margin: 0.75rem 0 0.25rem; }
                      p { margin: 0.5rem 0; }
                      ul,ol { margin: 0.5rem 0 0.75rem 1.25rem; }
                      li { margin: 0.25rem 0; }
                      a { color:#2563eb; text-decoration:underline; }
                      strong { font-weight:600; }
                    `,
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledInput
                  icon={<FiMapPin />}
                  label="Location"
                  placeholder="City, Country (or Remote)"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                />
                <div>
                  <Label>Employment Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => set('type', t)}
                        className={`px-3 py-2 rounded-lg border text-sm ${
                          form.type === t
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        {TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Compensation">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LabeledInput
                  icon={<FaEuroSign />}
                  type="number"
                  min={0}
                  label="Min Salary (€)"
                  placeholder="e.g., 50000"
                  value={form.minSalary}
                  onChange={(e) => set('minSalary', e.target.value)}
                />
                <LabeledInput
                  icon={<FaEuroSign />}
                  type="number"
                  min={0}
                  label="Max Salary (€)"
                  placeholder="e.g., 70000"
                  value={form.maxSalary}
                  onChange={(e) => set('maxSalary', e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tip: If you fill min &amp; max, we’ll format a clean range. Use “Salary Text” for extras.
              </p>
            </Card>
          </div>

          
          <div className="space-y-6">
            <Card title="Company & Category">
              <LabeledSelect
                icon={<FiBriefcase />}
                label="Company"
                value={form.companyId}
                onChange={(e) => set('companyId', e.target.value)}
                options={[{ value: '', label: 'Select company' }, ...companies.map(c => ({ value: c.id, label: c.name }))]}
              />
              <LabeledSelect
                icon={<FiTag />}
                label="Category"
                value={form.categoryId}
                onChange={(e) => set('categoryId', e.target.value)}
                options={[{ value: '', label: 'Select category' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
              />
            </Card>

            <div className="bg-white/70 backdrop-blur rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Preview</div>
              <div className="font-semibold">{form.title || 'Job Title'}</div>
              <div className="text-sm text-gray-600">
                {form.location || '—'} • {formatType(form.type)} {form.salaryText ? `• ${form.salaryText}` : ''}
              </div>
              
              <div
                className="prose prose-sm max-w-none text-gray-700 mt-2"
                dangerouslySetInnerHTML={{ __html: form.description || 'Job description will appear here…' }}
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 mt-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {isEditing ? 'Update your job posting' : 'Ready to publish your new job?'}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  {saving ? 'Saving…' : isEditing ? 'Update Job' : 'Create Job'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}


function Card({ title, children }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="font-semibold mb-3">{title}</div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
function Label({ children }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
}
function FieldWrap({ icon, children }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200">
      {icon && <div className="text-gray-400">{icon}</div>}
      <div className="flex-1">{children}</div>
    </div>
  );
}
function LabeledInput({ icon, label, ...props }) {
  return (
    <div>
      <Label>{label}</Label>
      <FieldWrap icon={icon}>
        <input className="w-full outline-none bg-transparent" {...props} />
      </FieldWrap>
    </div>
  );
}
function LabeledSelect({ icon, label, options = [], ...props }) {
  return (
    <div>
      <Label>{label}</Label>
      <FieldWrap icon={icon}>
        <select className="w-full outline-none bg-transparent" {...props}>
          {options.map((o) => (
            <option key={`${o.value}`} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FieldWrap>
    </div>
  );
}
function formatType(t) {
  return t.replace('_', '-').toLowerCase().replace(/^\w/, (m) => m.toUpperCase());
}
