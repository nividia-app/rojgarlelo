import React, { useState, useEffect } from 'react';
import { Job, Application, User, Company } from '../types';
import { Sparkles, FileText, Upload, Plus, UserCheck, Calendar, ShieldAlert, BadgeInfo, CheckCircle, RefreshCw, Copy, Archive, Trash2, ArrowUpRight, HelpCircle, FileJson, AlertCircle } from 'lucide-react';

interface RecruiterWorkspaceProps {
  token: string | null;
  currentUser: User | null;
}

export default function RecruiterWorkspace({ token, currentUser }: RecruiterWorkspaceProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Switch sub-sections inside workspace
  const [recState, setRecState] = useState<'listings' | 'form' | 'applicants' | 'bulk'>('listings');

  // Job Form States
  const [editJobId, setEditJobId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [salary, setSalary] = useState('');
  const [experience, setExperience] = useState('');
  const [qualification, setQualification] = useState('');
  const [location, setLocation] = useState('');
  const [vacancies, setVacancies] = useState(1);
  const [skillsRequired, setSkillsRequired] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [lastDate, setLastDate] = useState('');
  const [contactInformation, setContactInformation] = useState('');

  // Form States - Benefits
  const [pfDetails, setPfDetails] = useState('');
  const [esiDetails, setEsiDetails] = useState('');
  const [insurance, setInsurance] = useState('');
  const [incentives, setIncentives] = useState('');
  const [bonus, setBonus] = useState('');
  const [otherPerks, setOtherPerks] = useState('');

  // Form States - Recruitment specs
  const [workMode, setWorkMode] = useState<'on-site' | 'remote' | 'hybrid'>('on-site');
  const [shiftInfo, setShiftInfo] = useState('');
  const [bondDetails, setBondDetails] = useState('');
  const [interviewRenders, setInterviewRenders] = useState('Virtual Review, Technical Assessment Live Case, HR Salary Sync');

  // OCR Upload States
  const [ocrFileName, setOcrFileName] = useState('');
  const [ocrBase64, setOcrBase64] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrConsoleOutput, setOcrConsoleOutput] = useState<string[]>([]);
  const [ocrTextManual, setOcrTextManual] = useState('');

  // Evaluation Board scheduling
  const [schedulingAppId, setSchedulingAppId] = useState<string | null>(null);
  const [roundName, setRoundName] = useState('Technical Case Architecture Assessment');
  const [dateTime, setDateTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/abc-defg-hij');
  const [interviewerName, setInterviewerName] = useState(currentUser?.name || '');
  const [roundFeedback, setRoundFeedback] = useState('');

  // Bulk import Area
  const [bulkText, setBulkText] = useState('');

  const fetchJobs = async () => {
    try {
      const url = currentUser?.role === 'super_admin' ? '/api/jobs?status=active' : `/api/jobs?companyId=${currentUser?.companyId || ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setJobs(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setApplications(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      setCompanies(data);
      if (data.length > 0 && !companyId) {
        setCompanyId(currentUser?.companyId || data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchJobs();
      fetchApplications();
      fetchCompanies();
    }
  }, [token, currentUser]);

  // Handle OCR flyer file
  const handleOcrFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrFileName(file.name);
    setOcrConsoleOutput(prev => [...prev, `Selected Flyer Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`]);
    
    const reader = new FileReader();
    reader.onload = () => {
      setOcrBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Dispatch OCR processing
  const handleOcrProcess = async () => {
    if (!ocrBase64 && !ocrTextManual) {
      setError('Please provide a flyer image or some raw job specification text first.');
      return;
    }

    setOcrLoading(true);
    setError('');
    setOcrConsoleOutput(prev => [...prev, "Contacting Gemini 3.5-Flash Multimodal AI Engine...", "Extracting OCR content & formatting schemas..."]);

    try {
      const res = await fetch('/api/jobs/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileData: ocrBase64,
          fileName: ocrFileName,
          manualText: ocrTextManual
        })
      });
      
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || 'AI extraction failed.');

      const data = payload.data;
      setOcrConsoleOutput(prev => [
        ...prev, 
        "OCR Extraction complete!", 
        `Mapped organization: ${data.companyName}`, 
        `Extracted Title: ${data.title}`
      ]);

      // Find matching company in database or select default
      const compMatch = companies.find(c => c.name.toLowerCase().includes(data.companyName.toLowerCase())) || companies[0];
      if (compMatch) setCompanyId(compMatch.id);

      // Map unstructured fields to state
      setTitle(data.title || '');
      setSalary(data.salary || '');
      setExperience(data.experience || '');
      setQualification(data.qualification || '');
      setLocation(data.location || '');
      setVacancies(Number(data.vacancies) || 1);
      setSkillsRequired(Array.isArray(data.skillsRequired) ? data.skillsRequired.join(', ') : '');
      setJobDescription(data.jobDescription || '');
      setLastDate(data.lastDate || '');
      setContactInformation(data.contactInformation || '');

      setPfDetails(data.benefits?.pfDetails || '');
      setEsiDetails(data.benefits?.esiDetails || '');
      setInsurance(data.benefits?.insurance || '');
      setIncentives(data.benefits?.incentives || '');
      setBonus(data.benefits?.bonus || '');
      setOtherPerks(data.benefits?.otherPerks || '');

      if (data.recruitment?.workMode) setWorkMode(data.recruitment.workMode);
      setShiftInfo(data.recruitment?.shiftInfo || '');
      setBondDetails(data.recruitment?.bondDetails || '');
      if (Array.isArray(data.recruitment?.interviewRounds)) {
        setInterviewRenders(data.recruitment.interviewRounds.join(', '));
      }

      setSuccess('Gemini AI successfully mapped matching flyer credentials into the manual form below!');
      setRecState('form'); // Switch tab

    } catch (err: any) {
      setError(err.message);
      setOcrConsoleOutput(prev => [...prev, `Error: ${err.message}`]);
    } finally {
      setOcrLoading(false);
    }
  };

  // Submit Job Save (Create or Modify)
  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !companyId || !location) {
      setError('Please provide vacancy Title, Company allocation and base Location.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const skillsArray = skillsRequired.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const roundsArray = interviewRenders.split(',').map(r => r.trim()).filter(r => r.length > 0);

    const payload = {
      title,
      companyId,
      salary,
      experience,
      qualification,
      location,
      vacancies,
      skillsRequired: skillsArray,
      jobDescription,
      lastDate,
      contactInformation,
      benefits: {
        pfDetails,
        esiDetails,
        insurance,
        incentives,
        bonus,
        otherPerks
      },
      recruitment: {
        interviewRounds: roundsArray,
        workMode,
        shiftInfo,
        bondDetails,
        requiredDocuments: ['Aadhaar Card', 'PAN Card', 'Experience Letter']
      }
    };

    try {
      const url = editJobId ? `/api/jobs/${editJobId}` : '/api/jobs';
      const method = editJobId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not save job specifications.');

      setSuccess(editJobId ? 'Job catalog specs updated.' : 'New listing compiled and published successfully!');
      resetForm();
      fetchJobs();
      setRecState('listings');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditJobId(null);
    setTitle('');
    setSalary('');
    setExperience('');
    setQualification('');
    setLocation('');
    setVacancies(1);
    setSkillsRequired('');
    setJobDescription('');
    setLastDate('');
    setContactInformation('');
    setPfDetails('');
    setEsiDetails('');
    setInsurance('');
    setIncentives('');
    setBonus('');
    setOtherPerks('');
    setShiftInfo('');
    setBondDetails('');
    setInterviewRenders('Virtual Review, Technical Assessment Live Case, HR Salary Sync');
  };

  // Duplicate Job
  const handleDuplicateJob = (job: Job) => {
    setEditJobId(null); // Ensure creation mode
    setTitle(`${job.title} (Copy)`);
    setCompanyId(job.companyId);
    setSalary(job.salary);
    setExperience(job.experience);
    setQualification(job.qualification);
    setLocation(job.location);
    setVacancies(job.vacancies);
    setSkillsRequired(job.skillsRequired.join(', '));
    setJobDescription(job.jobDescription);
    setLastDate(job.lastDate || '');
    setContactInformation(job.contactInformation);
    setPfDetails(job.benefits?.pfDetails || '');
    setEsiDetails(job.benefits?.esiDetails || '');
    setInsurance(job.benefits?.insurance || '');
    setIncentives(job.benefits?.incentives || '');
    setBonus(job.benefits?.bonus || '');
    setOtherPerks(job.benefits?.otherPerks || '');
    setWorkMode(job.recruitment?.workMode || 'on-site');
    setShiftInfo(job.recruitment?.shiftInfo || '');
    setBondDetails(job.recruitment?.bondDetails || '');
    setInterviewRenders(job.recruitment?.interviewRounds?.join(', ') || '');

    setSuccess('Duplicated specs template. Review and submit to save duplicate vacancy.');
    setRecState('form');
  };

  // Archive vacancy
  const handleArchiveJob = async (job: Job) => {
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: job.status === 'active' ? 'archived' : 'active' })
      });
      if (res.ok) {
        setSuccess(`Job post marked ${job.status === 'active' ? 'Archived' : 'Active'}.`);
        fetchJobs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete vacancy matching
  const handleDeleteJob = async (id: string) => {
    if (!confirm('Deconstruct vacancy permanently? Candidate logs will remain archived.')) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSuccess('List post terminated.');
        fetchJobs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Evaluate candidate stage routes
  const handleUpdateApplicantStatus = async (appId: string, status: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setSuccess(`Applicant stage advanced to ${status.toUpperCase()}`);
        fetchApplications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Schedule Interview
  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingAppId) return;

    setLoading(true);
    try {
      const currentApp = applications.find(a => a.id === schedulingAppId);
      const prevSchedule = currentApp?.interviewSchedule || [];
      const newRound = {
        roundName,
        dateTime,
        meetingLink,
        interviewerName,
        feedback: roundFeedback
      };

      const res = await fetch(`/api/applications/${schedulingAppId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'interview', // Auto-promote to interview status
          interviewSchedule: [...prevSchedule, newRound]
        })
      });

      if (!res.ok) throw new Error('Could not reserve interview timeslot.');

      setSuccess('Evaluation round scheduled onto applicant dashboard successfully!');
      setSchedulingAppId(null);
      setRoundFeedback('');
      fetchApplications();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Bulk Import Submit
  const handleBulkImport = async () => {
    if (!bulkText.trim()) {
      setError('Please paste a valid JSON array matching the preset parameters.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const jobsList = JSON.parse(bulkText);
      const res = await fetch('/api/jobs/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jobsList })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Bulk ingestion failed.');

      setSuccess(`Injected ${data.count} vacancy posts into database seamlessly!`);
      setBulkText('');
      fetchJobs();
      setRecState('listings');
    } catch (err: any) {
      setError(`JSON Parsing or Import failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper template paste for tester
  const loadBulkSchemaPreset = () => {
    const preset = [
      {
        title: "Staff Go Engineer",
        companyName: "Nebula Systems",
        salary: "₹24,00,000 - ₹32,00,000 PA",
        experience: "8+ Years",
        location: "Hyderabad, IND",
        vacancies: 2,
        skillsRequired: ["Golang", "Cloud Platforms", "REST APIs", "Microservices"],
        benefits: { pfDetails: "Standard rules matching", esiDetails: "Standard rules matching" },
        workMode: "remote",
        jobDescription: "Construct resilient microservice architectures handling high frequency requests."
      },
      {
        title: "Frontend Developer Champion",
        companyName: "Apex Tech Labs",
        salary: "₹12,05,000 PA",
        experience: "2 - 4 Years",
        location: "Bengaluru, IND",
        vacancies: 4,
        skillsRequired: ["React", "TypeScript", "Tailwind CSS"],
        workMode: "hybrid",
        jobDescription: "Build modular custom interfaces following pristine layouts."
      }
    ];
    setBulkText(JSON.stringify(preset, null, 2));
  };

  return (
    <div id="rec_management_system" className="space-y-6">
      
      {/* Recruiter Navigation Rail */}
      <div className="flex border-b border-zinc-200 pb-2 flex-wrap gap-2 text-xs">
        <button
          id="tab_listings"
          onClick={() => { setRecState('listings'); setError(''); setSuccess(''); }}
          className={`px-3 py-1.5 font-bold rounded-lg cursor-pointer ${recState === 'listings' ? 'bg-zinc-900 text-white' : 'text-zinc-650 hover:bg-zinc-100'}`}
        >
          📂 Managed Vacancies ({jobs.length})
        </button>

        <button
          id="tab_form"
          onClick={() => { setRecState('form'); setError(''); setSuccess(''); }}
          className={`px-3 py-1.5 font-bold rounded-lg cursor-pointer ${recState === 'form' ? 'bg-zinc-900 text-white' : 'text-zinc-650 hover:bg-zinc-100'}`}
        >
          🖋️ Add Job Manually / Edit
        </button>

        <button
          id="tab_applicants"
          onClick={() => { setRecState('applicants'); setError(''); setSuccess(''); }}
          className={`px-3 py-1.5 font-bold rounded-lg cursor-pointer ${recState === 'applicants' ? 'bg-zinc-900 text-white' : 'text-zinc-650 hover:bg-zinc-100'}`}
        >
          👥 Applicant Pipelines ({applications.length})
        </button>

        <button
          id="tab_bulk"
          onClick={() => { setRecState('bulk'); setError(''); setSuccess(''); }}
          className={`px-3 py-1.5 font-bold rounded-lg cursor-pointer ${recState === 'bulk' ? 'bg-zinc-900 text-white' : 'text-zinc-650 hover:bg-zinc-100'}`}
        >
          📂 Ingest Bulk listings
        </button>
      </div>

      {/* RecState: Listings Dashboard */}
      {recState === 'listings' && (
        <div id="rec_listings_grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {jobs.length === 0 ? (
            <div className="md:col-span-2 text-center py-12 rounded-2xl border border-dashed border-zinc-200">
              <RefreshCw className="mx-auto w-6 h-6 text-zinc-400 animate-spin mb-2" />
              <p className="text-xs text-zinc-400 font-bold">Waiting for open listing rosters...</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                id={`rec_job_card_${job.id}`}
                className="bg-white border border-zinc-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                      {job.companyName}
                    </span>
                    
                    <span className={`text-[10px] uppercase font-mono font-black ${
                      job.status === 'archived' ? 'text-zinc-400' : 'text-emerald-600'
                    }`}>
                      ● {job.status || 'Active'}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-zinc-900 tracking-tight mt-2">{job.title}</h4>
                  <p className="text-[11px] text-zinc-500 leading-normal font-semibold mt-1">Location: {job.location} • Mode: <span className="capitalize">{job.recruitment?.workMode}</span></p>
                  
                  <div className="text-[11px] text-zinc-500 font-mono mt-1 flex items-center gap-1">
                    💸 {job.salary}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {job.skillsRequired?.map((s, i) => (
                      <span key={i} className="text-[9px] bg-zinc-50 border border-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded font-extrabold">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] font-extrabold">
                  <span className="text-zinc-400 font-mono">ID: {job.id}</span>
                  
                  <div className="flex items-center gap-3">
                    <button
                      id={`dup_btn_${job.id}`}
                      onClick={() => handleDuplicateJob(job)}
                      className="text-zinc-650 hover:text-zinc-900 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Clone
                    </button>

                    <button
                      id={`archive_btn_${job.id}`}
                      onClick={() => handleArchiveJob(job)}
                      className="text-zinc-650 hover:text-zinc-900 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      {job.status === 'active' ? 'Archive' : 'Activate'}
                    </button>

                    <button
                      id={`del_job_btn_${job.id}`}
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-red-650 hover:text-red-800 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Kill
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

        </div>
      )}

      {/* RecState: Manual Job / OCR Extract form */}
      {recState === 'form' && (
        <div id="rec_form_workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel is the OCR Extractor tool */}
          <div className="lg:col-span-5 bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-sm text-xs">
            <div className="border-b border-zinc-200 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-sm text-zinc-950">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Intelligent Gemini AI OCR Flyer Parser
              </div>
              <p className="text-[10px] text-zinc-500 mt-1 leading-normal font-semibold">Drop or upload a brochure image, scanned document poster or snapshot. The Gemini model extracts job parameters instantly.</p>
            </div>

            {/* Flyer Upload Box */}
            <div className="border border-dashed border-zinc-300 hover:border-zinc-900 rounded-xl p-4 text-center cursor-pointer relative bg-white min-h-[90px] flex flex-col justify-center items-center">
              <input
                id="ocr_flyer_picker"
                type="file"
                accept="image/*"
                onChange={handleOcrFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-5 h-5 text-zinc-400 mb-1" />
              <span className="font-extrabold text-[11px] text-zinc-800">
                {ocrFileName ? `${ocrFileName} (Pinned)` : "Drag flyer photo here"}
              </span>
              <p className="text-[10px] text-zinc-400 mt-0.5">JPG, PNG, WEBP and scanned posters accepted</p>
            </div>

            {/* In case no flyer, manually specify document block */}
            <div className="space-y-1">
              <label className="block font-semibold text-zinc-650">Or Paste Raw Specs draft</label>
              <textarea
                id="raw_plaintext_ocr"
                rows={4}
                value={ocrTextManual}
                onChange={(e) => setOcrTextManual(e.target.value)}
                placeholder="Paste unorganized text coordinates, email notifications, thread snippets..."
                className="w-full bg-white border border-zinc-200 rounded-xl p-2.5"
              />
            </div>

            <button
              id="dispatch_ocr_btn"
              type="button"
              onClick={handleOcrProcess}
              disabled={ocrLoading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {ocrLoading ? "Analyzing brochure..." : "Deploy Gemini AI mapping"}
            </button>

            {ocrConsoleOutput.length > 0 && (
              <div className="bg-zinc-950 text-emerald-400 text-[10px] font-mono p-3 rounded-xl max-h-[140px] overflow-y-auto space-y-1 select-none border border-zinc-800">
                <div className="text-zinc-500 font-bold border-b border-zinc-800 pb-1 mb-1">OCR ANALYSIS LOGS:</div>
                {ocrConsoleOutput.map((l, i) => (
                  <div key={i} className="leading-relaxed">&gt; {l}</div>
                ))}
              </div>
            )}
          </div>

          {/* Right panel is the actual editable job form parameters */}
          <form onSubmit={handleJobSubmit} id="create_job_form" className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-5 text-xs">
            <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-zinc-900">Job Catalog Specifications</h3>
                <p className="text-[10px] text-zinc-400 font-medium">Create open quotas. Form auto-fills when applying AI analysis on flyers.</p>
              </div>
              <button
                id="reset_spec_btn"
                type="button"
                onClick={resetForm}
                className="text-red-650 hover:underline"
              >
                ClearSpecs
              </button>
            </div>

            {/* Group 1: Basic specifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Select Corporate Wallet</label>
                <select
                  id="form_comp_select"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full font-medium"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Vacancy Profile Title</label>
                <input
                  id="form_title_input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lead DevSecOps Architect"
                  className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Estimated Wage band</label>
                <input
                  id="form_salary"
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="₹14,00,000 - ₹18,00,000"
                  className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Job Experience Timeline</label>
                <input
                  id="form_experience"
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="3-5 Years"
                  className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Open Vacancies quota</label>
                <input
                  id="form_vacancies"
                  type="number"
                  min={1}
                  value={vacancies}
                  onChange={(e) => setVacancies(Number(e.target.value))}
                  className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full font-mono text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Base Office Location</label>
                <input
                  id="form_location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Bengaluru, IND"
                  className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Skill stack required (Comma split)</label>
                <input
                  id="form_skills"
                  type="text"
                  value={skillsRequired}
                  onChange={(e) => setSkillsRequired(e.target.value)}
                  placeholder="React, Go, TypeScript, Docker"
                  className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Sourcing Threshold date</label>
                <input
                  id="form_last_date"
                  type="date"
                  value={lastDate}
                  onChange={(e) => setLastDate(e.target.value)}
                  className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Contact dispatch coordinates</label>
                <input
                  id="form_contact"
                  type="text"
                  value={contactInformation}
                  onChange={(e) => setContactInformation(e.target.value)}
                  placeholder="Anjali Gupta (recruiter@example.com)"
                  className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full"
                />
              </div>
            </div>

            {/* Extra Benefits: PF, ESI, Insurance, bonus */}
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <h4 className="font-extrabold text-zinc-700 uppercase tracking-widest text-[10px]">Statutory Benefits & Sourcing Perks</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-650 mb-0.5">PF matching policy</label>
                  <input
                    id="form_pf"
                    type="text"
                    value={pfDetails}
                    onChange={(e) => setPfDetails(e.target.value)}
                    placeholder="Standard statutory matching scheme"
                    className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-650 mb-0.5">ESI Medical provision</label>
                  <input
                    id="form_esi"
                    type="text"
                    value={esiDetails}
                    onChange={(e) => setEsiDetails(e.target.value)}
                    placeholder="Premium health package or ESIC standard"
                    className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-650 mb-0.5">Health Family Insurance</label>
                  <input
                    id="form_insurance"
                    type="text"
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    placeholder="₹5 Lakh medical shield coverage"
                    className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-650 mb-0.5">Other perks (Bonuses/Food/Incentives)</label>
                  <input
                    id="form_other_perks"
                    type="text"
                    value={otherPerks}
                    onChange={(e) => setOtherPerks(e.target.value)}
                    placeholder="Free gourmet cafeteria lunches, gym pass"
                    className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full"
                  />
                </div>
              </div>
            </div>

            {/* Recruitment specifications details */}
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <h4 className="font-extrabold text-zinc-700 uppercase tracking-widest text-[10px]">Recruitment Operational Logistics</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-650 mb-0.5">Work style mode</label>
                  <select
                    id="form_work_mode"
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value as any)}
                    className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full font-medium"
                  >
                    <option value="on-site">On-Site 🏢</option>
                    <option value="hybrid">Hybrid 🏠</option>
                    <option value="remote">Remote 🌐</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-650 mb-0.5">Shifts Info</label>
                  <input
                    id="form_shift"
                    type="text"
                    value={shiftInfo}
                    onChange={(e) => setShiftInfo(e.target.value)}
                    placeholder="9:30 AM - 6:30 PM"
                    className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-650 mb-0.5">Bond requirements</label>
                  <input
                    id="form_bond"
                    type="text"
                    value={bondDetails}
                    onChange={(e) => setBondDetails(e.target.value)}
                    placeholder="None"
                    className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-650 mb-0.5">Interview Pipeline sequence (Comma split)</label>
                <input
                  id="form_rounds"
                  type="text"
                  value={interviewRenders}
                  onChange={(e) => setInterviewRenders(e.target.value)}
                  placeholder="Virtual Screening, Written Code assessment, HR Synthesis"
                  className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full"
                />
              </div>
            </div>

            {/* Group 2: Full description */}
            <div>
              <label className="block font-bold text-zinc-700 uppercase mb-1">Target Qualifications / Role description specifications</label>
              <textarea
                id="form_desc"
                rows={5}
                required
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Briefly state target goals, development stacks, deployment architectures, or required competencies."
                className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full font-medium whitespace-pre-wrap leading-normal"
              />
            </div>

            <button
              id="form_submit_btn"
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-950 text-white py-3 rounded-xl hover:bg-zinc-800 font-extrabold cursor-pointer h-12"
            >
              {loading ? "Saving specs..." : editJobId ? "Apply specs changes" : "Deploy live vacancy listing"}
            </button>
          </form>

        </div>
      )}

      {/* RecState: Applicants Pipelines */}
      {recState === 'applicants' && (
        <div id="rec_applicants_view" className="space-y-6">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Target Applicant Submissions ({applications.length})</div>

          {applications.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-zinc-205 bg-white">
              <p className="text-sm text-zinc-500 font-bold mb-1">No candidate files have applied yet.</p>
              <p className="text-xs text-zinc-400">Share your vacancies or simulate a job seeker account submission to review details.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  id={`pipeline_card_${app.id}`}
                  className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full inline-block">
                        🎯 {app.jobTitle}
                      </div>
                      <h4 id={`app_candidate_${app.candidateName.split(' ')[0]}`} className="font-extrabold text-sm text-zinc-950">{app.candidateName}</h4>
                      <p className="text-xs text-zinc-600 font-mono italic">{app.candidateEmail}</p>
                    </div>

                    {/* Pipeline Stage Controller */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 font-semibold uppercase">Stage:</span>
                      <select
                        id={`stage_select_${app.id}`}
                        value={app.status}
                        onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value)}
                        className="px-2.5 py-1 text-xs font-bold border border-zinc-200 bg-zinc-50 rounded-lg text-zinc-800"
                      >
                        <option value="applied">Applied 🤝</option>
                        <option value="screening">Screening 📂</option>
                        <option value="interview">Interview 🗓️</option>
                        <option value="selected">Selected 🏆</option>
                        <option value="rejected">Rejected ❌</option>
                      </select>
                    </div>
                  </div>

                  {/* Document matching audit panels */}
                  <div className="p-3 bg-zinc-50 border border-zinc-200/50 rounded-xl space-y-2 text-xs">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Documents & Verification status
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="bg-white border p-2 rounded-lg flex items-center justify-between">
                        <span>📜 Resume Sheet</span>
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold underline"
                        >
                          View PDF
                        </a>
                      </div>

                      {app.documents?.map((doc, idx) => (
                        <div key={idx} className="bg-white border p-2 rounded-lg flex flex-col justify-center">
                          <span className="font-semibold">{doc.type}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{doc.fileUrl || "MOCK_VERIFIED"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scheduled rounds display if any */}
                  {app.interviewSchedule && app.interviewSchedule.length > 0 && (
                    <div className="space-y-1 pb-2">
                      <div className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest pl-1">Scheduled Interview loops:</div>
                      <div className="divide-y divide-zinc-100 bg-zinc-50/50 rounded-xl border border-zinc-100 p-3 text-xs">
                        {app.interviewSchedule.map((round, idx) => (
                          <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between items-start gap-4">
                            <div>
                              <div className="font-extrabold text-zinc-950">{round.roundName}</div>
                              <div className="text-zinc-500 leading-normal">Date: {new Date(round.dateTime).toLocaleString()}</div>
                              {round.interviewerName && <div className="text-[11px] text-zinc-700">Evaluator: <b>{round.interviewerName}</b></div>}
                            </div>
                            <span className="text-[9px] bg-indigo-100 border border-indigo-200 text-indigo-805 px-2 py-0.5 rounded font-extrabold uppercase shrink-0">Scheduled</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Button to show Schedule Panel */}
                  <div className="flex justify-end gap-2 text-xs pt-1 border-t border-zinc-100">
                    <button
                      id={`schedule_btn_${app.id}`}
                      type="button"
                      onClick={() => setSchedulingAppId(app.id)}
                      className="bg-zinc-900 text-white rounded-lg px-3 py-1.5 font-bold cursor-pointer"
                    >
                      Schedule Interview Loop
                    </button>
                  </div>

                  {/* Interview Scheduler Modal layout */}
                  {schedulingAppId === app.id && (
                    <form onSubmit={handleScheduleInterview} className="bg-zinc-50 p-4 border rounded-xl space-y-4 text-xs mt-3">
                      <div className="font-bold flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        Assemble Interview Round for {app.candidateName}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold mb-1">Select evaluative round</label>
                          <input
                            type="text"
                            required
                            value={roundName}
                            onChange={(e) => setRoundName(e.target.value)}
                            placeholder="e.g. System Architecture Board"
                            className="p-1 px-3 bg-white border border-zinc-200 rounded-lg w-full"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Round date timetables</label>
                          <input
                            type="datetime-local"
                            required
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            className="p-1 px-3 bg-white border border-zinc-200 rounded-lg w-full font-mono text-center"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold mb-1">Evaluator assign</label>
                          <input
                            type="text"
                            required
                            value={interviewerName}
                            onChange={(e) => setInterviewerName(e.target.value)}
                            className="p-1 px-3 bg-white border border-zinc-200 rounded-lg w-full"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">Virtual Meeting linkages URL</label>
                          <input
                            type="url"
                            required
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            className="p-1 px-3 bg-white border border-zinc-200 rounded-lg w-full font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Pre-assessment notes feedback (Optional)</label>
                        <input
                          type="text"
                          value={roundFeedback}
                          onChange={(e) => setRoundFeedback(e.target.value)}
                          placeholder="e.g. Cleared online screening assessment with robust algorithms output."
                          className="p-1 px-3 bg-white border border-zinc-200 rounded-lg w-full"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-lg cursor-pointer"
                        >
                          Confirm Round
                        </button>
                        <button
                          type="button"
                          onClick={() => setSchedulingAppId(null)}
                          className="bg-white border rounded-lg py-1 px-3 text-zinc-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RecState: Bulk Import sequence */}
      {recState === 'bulk' && (
        <div id="rec_bulk_import_workspace" className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-zinc-100 pb-2 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-zinc-950">Bulk Vacancy Ingestion</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5 leading-normal font-semibold">Perform large-scale logistics operations by uploading array blocks. Paste matching specifications schema to deploy massive job boards.</p>
            </div>
            
            <button
              onClick={loadBulkSchemaPreset}
              className="text-xs text-zinc-900 border border-zinc-200 hover:bg-zinc-50 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
            >
              <FileJson className="w-3.5 h-3.5" />
              Load Sample Data
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <textarea
              id="bulk_json_textarea"
              rows={12}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder='[
  {
    "title": "Backend software specialist",
    "salary": "₹15,00,000",
    "location": "Bengaluru, IND",
    "vacancies": 3,
    "skillsRequired": ["React", "Typescript"]
  }
]'
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 font-mono leading-normal shadow-inner"
            />

            <button
              id="bulk_import_submit_btn"
              onClick={handleBulkImport}
              disabled={loading}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-50"
            >
              {loading ? "Ingesting inventory..." : "Import Vacancy blocks"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
