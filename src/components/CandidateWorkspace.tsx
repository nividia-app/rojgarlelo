import React, { useState, useEffect } from 'react';
import { Job, Application, User, Company } from '../types';
import { Search, MapPin, DollarSign, Calendar, FileText, CheckCircle2, Award, Briefcase, FileCheck, Layers, ClipboardList, Info, Milestone, Sparkles } from 'lucide-react';

interface CandidateWorkspaceProps {
  token: string | null;
  currentUser: User | null;
}

export default function CandidateWorkspace({ token, currentUser }: CandidateWorkspaceProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Apply Form state
  const [isApplying, setIsApplying] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [resumeBase64, setResumeBase64] = useState('');
  const [aacCode, setAacCode] = useState('');
  const [panCode, setPanCode] = useState('');
  const [certificateName, setCertificateName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sourcing coordinates
  const fetchJobs = async () => {
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.append('search', searchTerm);
      if (workModeFilter) query.append('workMode', workModeFilter);
      if (locationFilter) query.append('location', locationFilter);

      const res = await fetch(`/api/jobs?${query.toString()}`);
      if (!res.ok) throw new Error('Could not pull jobs list.');
      const data = await res.json();
      setJobs(data);
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const fetchApplications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchTerm, workModeFilter, locationFilter]);

  useEffect(() => {
    fetchApplications();
  }, [token]);

  // Handle uploading simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setResumeBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      jobId: selectedJob.id,
      resumeUrl: resumeBase64 || "https://pdfobject.com/pdf/sample.pdf",
      resumeFileName: resumeName || "Resume_Rohan_Patel.pdf",
      documents: [
        { name: "Aadhaar Card Verification Document", type: "Aadhaar", fileUrl: aacCode || "AADHAAR_MOCK_VERIFIED", uploadedAt: new Date().toISOString() },
        { name: "PAN Card Registration Proof", type: "PAN", fileUrl: panCode || "PAN_MOCK_VERIFIED", uploadedAt: new Date().toISOString() },
        { name: certificateName || "Educational Degree Certificate", type: "Certificate", fileUrl: "DEGREE_MOCK_VERIFIED", uploadedAt: new Date().toISOString() }
      ]
    };

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Application delivery failure');

      setSuccess(`Your profile applied successfully for ${selectedJob.title}!`);
      setIsApplying(false);
      setSelectedJob(null);
      
      // Refresh list
      fetchApplications();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-zinc-100 text-zinc-800 border-zinc-200';
      case 'screening': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'interview': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'selected': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  return (
    <div id="candidate_workspace_panel" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Filtering, Search & Vacancy matching feed column */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* Profile overview */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Seeker Terminal</div>
          <h4 className="font-extrabold text-sm text-zinc-900">{currentUser?.name}</h4>
          <p className="text-xs text-zinc-500 font-mono">{currentUser?.email}</p>
        </div>

        {/* Filters Box */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="text-xs font-bold text-zinc-850">High-Precision Vacancy Search</div>
          
          <div className="relative text-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              id="search_jobs_input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="React, Golang, Developer, Cyber..."
              className="pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <select
              id="mode_filter_select"
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
              className="px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700"
            >
              <option value="">Work Mode</option>
              <option value="remote">Remote 🌐</option>
              <option value="hybrid">Hybrid 🏠</option>
              <option value="on-site">On-Site 🏢</option>
            </select>

            <select
              id="loc_filter_select"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700"
            >
              <option value="">Offices</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Mumbai">Mumbai</option>
            </select>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Matching Vacancies ({jobs.length})</div>
          
          {jobs.length === 0 ? (
            <div className="p-6 text-center text-zinc-400 text-xs font-semibold bg-white border border-dashed border-zinc-200 rounded-2xl">
              No vacancies are compiling this coordinate filters. Try broadening keywords.
            </div>
          ) : (
            jobs.map((job) => (
              <button
                key={job.id}
                id={`job_feed_card_${job.id}`}
                type="button"
                onClick={() => {
                  setSelectedJob(job);
                  setIsApplying(false);
                  setError('');
                }}
                className={`p-4 rounded-2xl text-left transition w-full cursor-pointer border bg-white hover:border-zinc-900 ${
                  selectedJob?.id === job.id ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200'
                }`}
              >
                <div className="text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-bold uppercase w-fit inline-block mb-2">
                  {job.companyName}
                </div>
                <h4 id={`job_feed_title_${job.id}`} className="font-extrabold text-sm text-zinc-900 tracking-tight leading-snug">{job.title}</h4>
                <div className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location} • <span className="capitalize">{job.recruitment?.workMode}</span>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono mt-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                  {job.salary}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {job.skillsRequired.slice(0, 3).map((s, i) => (
                    <span key={i} className="text-[9px] bg-zinc-50 border border-zinc-200 text-zinc-650 px-1.5 py-0.5 rounded font-extrabold">{s}</span>
                  ))}
                  {job.skillsRequired.length > 3 && (
                    <span className="text-[9px] text-zinc-400 font-bold">+{job.skillsRequired.length - 3}</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

      </div>

      {/* Main interaction workspace (Job profile or application sequence) */}
      <div className="lg:col-span-8 space-y-6">

        {selectedJob ? (
          <div id="candidate_job_details" className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* Header */}
            <div className="flex justify-between items-start gap-4 border-b border-zinc-100 pb-4">
              <div className="space-y-1.5">
                <span className="bg-zinc-950 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider block w-fit">
                  {selectedJob.companyName}
                </span>
                <h2 id="job_details_title" className="text-2xl font-black text-zinc-950 tracking-tight leading-none pt-1">
                  {selectedJob.title}
                </h2>
                <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  {selectedJob.location} • <span className="capitalize font-bold">{selectedJob.recruitment?.workMode}</span> • {selectedJob.experience} Experience preferred
                </p>
              </div>

              {!isApplying && (
                <button
                  id="apply_init_btn"
                  onClick={() => setIsApplying(true)}
                  className="bg-zinc-950 text-white text-xs font-black tracking-wider uppercase px-4 py-2.5 rounded-xl hover:bg-zinc-800 cursor-pointer text-center"
                >
                  Apply Online
                </button>
              )}
            </div>

            {isApplying ? (
              /* Custom Apply Form */
              <form onSubmit={submitApplication} id="apply_form" className="space-y-5 text-xs">
                <div className="border-b border-zinc-100 pb-2">
                  <h3 id="form_apply_title" className="font-bold text-sm text-zinc-900">Application File Setup</h3>
                  <p className="text-[11px] text-zinc-500 leading-normal">Submit your legal verification proof credentials to match {selectedJob.companyName} assessment SLAs.</p>
                </div>

                <div className="space-y-4">
                  
                  {/* File Upload System - Resume */}
                  <div>
                    <label className="block font-bold text-zinc-700 uppercase tracking-widest mb-1.5">
                      Upload Resume Document (PDF / JPG)
                    </label>
                    <div className="border-2 border-dashed border-zinc-200 hover:border-zinc-900 rounded-xl p-4 text-center cursor-pointer relative bg-zinc-50 min-h-[80px] flex flex-col justify-center items-center">
                      <input
                        id="apply_resume_file"
                        type="file"
                        required
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileChange(e, 'resume')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <FileText className="w-6 h-6 text-zinc-400 mb-1" />
                      <span className="font-bold text-zinc-700 text-[11px]">
                        {resumeName ? `${resumeName} (Attached)` : "Drag & drop file or tap to select"}
                      </span>
                      <p className="text-[10px] text-zinc-400 mt-1">Accepts industry PDF or JPG formats</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-zinc-700 uppercase tracking-widest mb-1">
                        Aadhaar verification number
                      </label>
                      <input
                        id="apply_aadhaar_input"
                        type="text"
                        maxLength={12}
                        required
                        value={aacCode}
                        onChange={(e) => setAacCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="12-digit Aadhaar number"
                        className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full font-mono text-center tracking-[0.2em]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-zinc-700 uppercase tracking-widest mb-1">
                        PAN registration identifier
                      </label>
                      <input
                        id="apply_pan_input"
                        type="text"
                        maxLength={10}
                        required
                        value={panCode}
                        onChange={(e) => setPanCode(e.target.value.toUpperCase())}
                        placeholder="10-digit alphanumeric PAN"
                        className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full font-mono text-center uppercase tracking-[0.2em]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 uppercase tracking-widest mb-1">
                      Academic Degree / Prior Experience Verification Certificate (Optional)
                    </label>
                    <input
                      id="apply_cert_input"
                      type="text"
                      value={certificateName}
                      onChange={(e) => setCertificateName(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science Engineering Provisional Certificate"
                      className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg w-full font-semibold"
                    />
                  </div>

                </div>

                <div className="flex gap-2 pt-3 border-t border-zinc-100">
                  <button
                    id="apply_submit_btn"
                    type="submit"
                    disabled={loading}
                    className="bg-zinc-950 text-white font-bold py-2 px-4 rounded-xl cursor-pointer hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {loading ? "Transmitting..." : "Transmit Verified Application"}
                  </button>
                  <button
                    id="apply_cancel_btn"
                    type="button"
                    onClick={() => setIsApplying(false)}
                    className="border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold py-2 px-4 rounded-xl cursor-pointer"
                  >
                    Back to specs
                  </button>
                </div>
              </form>
            ) : (
              /* Specs of Selected Job */
              <div className="space-y-6 text-xs text-zinc-750 font-medium leading-relaxed">
                
                {/* Description */}
                <div>
                  <h3 className="font-extrabold text-[11px] text-zinc-900 uppercase tracking-widest mb-1">Job Core description</h3>
                  <p className="bg-zinc-50 p-4 border border-zinc-250 rounded-2xl text-zinc-700 leading-normal">
                    {selectedJob.jobDescription || "No custom description cataloged. This vacancy was structured dynamically via flyer analysis."}
                  </p>
                </div>

                {/* Grid matrix: Skills, Qualification, Vacancy quotas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-50/50 p-3.5 border border-zinc-100 rounded-2xl space-y-1">
                    <h4 className="font-bold text-[10px] text-zinc-550 uppercase tracking-widest">Required Skill Core</h4>
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {selectedJob.skillsRequired.map((s, idx) => (
                        <span key={idx} className="bg-white border border-zinc-200 text-zinc-805 px-2 py-0.5 rounded font-extrabold">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-50/50 p-3.5 border border-zinc-100 rounded-2xl space-y-2">
                    <div>
                      <h4 className="font-bold text-[10px] text-zinc-550 uppercase tracking-widest">Target Qualification</h4>
                      <div className="font-extrabold pt-1 text-zinc-800 leading-snug">{selectedJob.qualification}</div>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span>Open quotas:</span>
                      <span className="font-extrabold bg-zinc-900 text-white px-2 py-0.5 rounded font-mono">{selectedJob.vacancies} vacancies</span>
                    </div>
                  </div>
                </div>

                {/* Sourcing details: Shift, mode, duration details */}
                <div className="space-y-2.5">
                  <h3 className="font-extrabold text-[11px] text-zinc-500 uppercase tracking-widest">Operational Logistics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="border border-zinc-100 p-3 rounded-xl bg-white space-y-1">
                      <div className="text-[10px] text-zinc-455 font-bold uppercase">Shifts</div>
                      <div className="font-extrabold text-zinc-800 leading-tight">{selectedJob.recruitment?.shiftInfo || "Regular general day shift"}</div>
                    </div>
                    <div className="border border-zinc-100 p-3 rounded-xl bg-white space-y-1">
                      <div className="text-[10px] text-zinc-455 font-bold uppercase">Bond requirements</div>
                      <div className="font-extrabold text-zinc-850 leading-tight">{selectedJob.recruitment?.bondDetails || "No bond liabilities"}</div>
                    </div>
                    <div className="border border-zinc-100 p-3 rounded-xl bg-white space-y-1">
                      <div className="text-[10px] text-zinc-455 font-bold uppercase">Hiring threshold</div>
                      <div className="font-extrabold text-zinc-800 leading-tight">Until {selectedJob.lastDate || "Filled matches"}</div>
                    </div>
                  </div>
                </div>

                {/* Benefits: PF, ESI, Allowances */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-[11px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-zinc-500" />
                    Structured Perks & Statutory Benefits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedJob.benefits?.pfDetails && (
                      <div className="p-3 bg-zinc-50/50 rounded-xl space-y-0.5 text-zinc-650">
                        <div className="font-bold text-zinc-800 uppercase tracking-wider text-[9px]">PF Scheme details</div>
                        <div className="leading-snug">{selectedJob.benefits.pfDetails}</div>
                      </div>
                    )}
                    {selectedJob.benefits?.esiDetails && (
                      <div className="p-3 bg-zinc-50/50 rounded-xl space-y-0.5 text-zinc-650">
                        <div className="font-bold text-zinc-800 uppercase tracking-wider text-[9px]">ESI medical coverage</div>
                        <div className="leading-snug">{selectedJob.benefits.esiDetails}</div>
                      </div>
                    )}
                    {selectedJob.benefits?.insurance && (
                      <div className="p-3 bg-zinc-50/50 rounded-xl space-y-0.5 text-zinc-650">
                        <div className="font-bold text-zinc-800 uppercase tracking-wider text-[9px]">Indemnity Medical Insurance</div>
                        <div className="leading-snug">{selectedJob.benefits.insurance}</div>
                      </div>
                    )}
                    {selectedJob.benefits?.otherPerks && (
                      <div className="p-3 bg-zinc-50/50 rounded-xl space-y-0.5 text-zinc-650">
                        <div className="font-bold text-zinc-800 uppercase tracking-wider text-[9px]">Additional Sourcing Perks</div>
                        <div className="leading-snug">{selectedJob.benefits.otherPerks}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selection stages validation sequence */}
                <div className="space-y-2">
                  <h3 className="font-extrabold text-[11px] text-zinc-500 uppercase tracking-widest">Evaluative Assessment Sequence</h3>
                  <div className="flex flex-col gap-2 bg-zinc-50 p-4 border border-zinc-150 rounded-2xl">
                    {selectedJob.recruitment?.interviewRounds?.map((round, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <span className="w-5 h-5 bg-zinc-900 text-white rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0">
                          {index + 1}
                        </span>
                        <span className="font-extrabold text-zinc-800 text-xs leading-none">{round}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty state - Candidate Workspace details: Active Application tracker */
          <div className="space-y-6">
            
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 flex items-center gap-4">
              <Sparkles className="w-8 h-8 text-zinc-800 bg-white p-1.5 border border-zinc-200 rounded-xl shrink-0 shadow-sm" />
              <div>
                <h3 className="font-bold text-sm text-zinc-950">Looking for a professional fit?</h3>
                <p className="text-xs text-zinc-500 leading-normal font-semibold">Select a listed vacancy in the left pane to explore statutory perks, recruitment timelines, interview rounds, and submit verify credentials.</p>
              </div>
            </div>

            {/* Applications history cards */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-1 border-b border-zinc-100 pb-3">
                <ClipboardList className="w-4 h-4 text-zinc-650" />
                Active Sourcing Pipelines Tracker
              </h3>

              {applications.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-200 bg-white">
                  <p className="text-xs text-zinc-500 font-semibold mb-1">You haven't submitted records against listings.</p>
                  <p className="text-[10px] text-zinc-400">Select any active job advertisement in directories to submit your Aadhaar/PAN validation vectors.</p>
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4"
                  >
                    <div className="flex justify-between items-start gap-3 flex-wrap">
                      <div className="space-y-1">
                        <div className="bg-zinc-900 text-white text-[9px] px-2 py-0.5 rounded font-extrabold uppercase w-fit">
                          {app.companyName}
                        </div>
                        <h4 className="font-extrabold text-sm text-zinc-950">{app.jobTitle}</h4>
                        <span className="text-[10px] font-mono text-zinc-400 font-bold">App Identifier: {app.id}</span>
                      </div>

                      <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>

                    {/* Interview timeline schedule blocks */}
                    {app.interviewSchedule && app.interviewSchedule.length > 0 && (
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-2 text-xs">
                        <div className="font-extrabold text-blue-900 flex items-center gap-1 uppercase tracking-wide">
                          <Calendar className="w-3.5 h-3.5" />
                          Virtual Assessment Board Scheduled!
                        </div>
                        {app.interviewSchedule.map((round, idx) => (
                          <div key={idx} className="space-y-2 border-t border-blue-200/50 pt-2 first:border-0 first:pt-0">
                            <div>
                              <span className="font-bold text-blue-950">{round.roundName}</span>
                              <p className="text-blue-700 font-medium">Timetable code: {new Date(round.dateTime).toLocaleString()}</p>
                            </div>
                            
                            {round.interviewerName && (
                              <div className="text-blue-800">Assigned Evaluator: <b>{round.interviewerName}</b></div>
                            )}

                            {round.meetingLink && (
                              <a
                                href={round.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 bg-zinc-900 text-white font-bold px-2.5 py-1 rounded hover:bg-zinc-800 text-[10px] uppercase font-mono tracking-wider mt-1 cursor-pointer"
                              >
                                Join Virtual Room
                              </a>
                            )}

                            {round.feedback && (
                              <p className="p-2 bg-white rounded border border-blue-100/50 text-blue-900 leading-normal italic">
                                " {round.feedback} "
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Document list audit log */}
                    <div className="space-y-1.5 pt-3 border-t border-zinc-100">
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-zinc-400" />
                        Audited Verification payloads ({app.documents?.length})
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                        <span className="bg-zinc-50 border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded font-mono font-bold">
                          📜 {app.resumeFileName || "Resume_Submitted.pdf"}
                        </span>
                        {app.documents?.map((doc, i) => (
                          <span key={i} className="bg-zinc-50 border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded font-mono font-bold">
                            🔒 {doc.type}: {doc.fileUrl || "VERIFIED"}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
