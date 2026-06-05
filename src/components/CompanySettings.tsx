import React, { useState, useEffect } from 'react';
import { Company, User } from '../types';
import { Building2, MapPin, Mail, Phone, Plus, Trash2, Edit2, CheckCircle, RefreshCw, Layers } from 'lucide-react';

interface CompanySettingsProps {
  token: string | null;
  currentUser: User | null;
}

export default function CompanySettings({ token, currentUser }: CompanySettingsProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form States for creating/modifying
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contacts, setContacts] = useState<{ name: string; email: string; phone?: string }[]>([]);
  const [teamInput, setTeamInput] = useState('');
  const [teams, setTeams] = useState<string[]>([]);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/companies');
      if (!res.ok) throw new Error('Failed to retrieve companies.');
      const data = await res.json();
      setCompanies(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleAddLocation = () => {
    if (locationInput.trim()) {
      setLocations([...locations, locationInput.trim()]);
      setLocationInput('');
    }
  };

  const handleRemoveLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const handleAddContact = () => {
    if (contactName.trim() && contactEmail.trim()) {
      setContacts([...contacts, { name: contactName.trim(), email: contactEmail.trim(), phone: contactPhone.trim() }]);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
    }
  };

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleAddTeam = () => {
    if (teamInput.trim()) {
      setTeams([...teams, teamInput.trim()]);
      setTeamInput('');
    }
  };

  const handleRemoveTeam = (index: number) => {
    setTeams(teams.filter((_, i) => i !== index));
  };

  const startEdit = (company: Company) => {
    setIsEditing(true);
    setEditId(company.id);
    setName(company.name);
    setLogoUrl(company.logoUrl || '');
    setDescription(company.description);
    setLocations(company.branchLocations || []);
    setContacts(company.hrContacts || []);
    setTeams(company.recruitmentTeams || []);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setLogoUrl('');
    setDescription('');
    setLocations([]);
    setContacts([]);
    setTeams([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      setError('Company name and descriptive profiles are mandatory.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      name,
      logoUrl: logoUrl || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&h=120&q=80",
      description,
      branchLocations: locations.length ? locations : ["Main Office"],
      hrContacts: contacts.length ? contacts : [{ name: currentUser?.name || 'Admin', email: currentUser?.email || 'admin@example.com' }],
      recruitmentTeams: teams.length ? teams : ["Talent Management"]
    };

    try {
      const url = editId ? `/api/companies/${editId}` : '/api/companies';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');

      setSuccess(editId ? 'Company workspace profiles updated.' : 'Company workspace successfully provisioned!');
      resetForm();
      fetchCompanies();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to decommission this company and terminate its vacancy networks? This action cannot be reversed.')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Deletion failed');

      setSuccess('Account decommissioned successfully.');
      fetchCompanies();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div id="company_workspace_manager" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Form interface - visible to super_admin or related recruiter/HR editing context */}
      <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
          <h3 className="font-bold text-sm tracking-tight text-zinc-950">
            {editId ? 'Modify Company Workspace' : 'Add New Corporate Entity'}
          </h3>
          {(isEditing || editId) && (
            <button onClick={resetForm} className="text-xs text-zinc-500 hover:text-zinc-900 border border-zinc-200 px-2 py-1 rounded cursor-pointer">
              Cancel
            </button>
          )}
        </div>

        {/* Access validation advice */}
        {!isSuperAdmin && !isEditing && (
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-500 leading-relaxed font-semibold">
            ⚡ As a standard HR/Recruiter user, your permission authorizes you to update existing employer settings click "Edit Setup" on your company file to start corrections. Super Admins hold power to add or delete custom listings.
          </div>
        )}

        {(isSuperAdmin || (editId && (currentUser?.role === 'hr' || currentUser?.role === 'recruiter') && currentUser?.companyId === editId)) ? (
          <form onSubmit={handleSubmit} id="company_form" className="space-y-4 text-xs">
            
            <div>
              <label className="block font-bold text-zinc-700 uppercase tracking-widest mb-1">Company legal name</label>
              <input
                id="company_name_input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Apex Software Consortium Inc."
                className="px-3 py-2 w-full bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-800 transition"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase tracking-widest mb-1">Logo URL identifier</label>
              <input
                id="company_logo_input"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="px-3 py-2 w-full bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-800 transition"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 uppercase tracking-widest mb-1">Company Profile & Sourcing Description</label>
              <textarea
                id="company_desc_input"
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline company core values, industry fields, software packages, or background parameters."
                className="px-3 py-2 w-full bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-800 transition leading-normal"
              />
            </div>

            {/* Geographical tags builder */}
            <div className="space-y-2 border-t border-zinc-100 pt-3">
              <label className="block font-bold text-zinc-700 uppercase tracking-widest">Branch Offices & Locations</label>
              <div className="flex gap-2">
                <input
                  id="company_location_input"
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Bengaluru, IND"
                  className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs leading-none w-full"
                />
                <button
                  id="company_add_location_btn"
                  type="button"
                  onClick={handleAddLocation}
                  className="bg-zinc-900 text-white rounded-lg px-3 py-1 font-bold cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {locations.map((loc, i) => (
                  <span key={i} className="bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    {loc}
                    <button type="button" onClick={() => handleRemoveLocation(i)} className="text-zinc-400 hover:text-zinc-900 font-black">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Sourcing teams section */}
            <div className="space-y-2 border-t border-zinc-100 pt-3">
              <label className="block font-bold text-zinc-700 uppercase tracking-widest">Active Recruiting Teams</label>
              <div className="flex gap-2">
                <input
                  id="company_team_input"
                  type="text"
                  value={teamInput}
                  onChange={(e) => setTeamInput(e.target.value)}
                  placeholder="Main Sourcing Pod"
                  className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs leading-none w-full"
                />
                <button
                  id="company_add_team_btn"
                  type="button"
                  onClick={handleAddTeam}
                  className="bg-zinc-900 text-white rounded-lg px-3 py-1 font-bold cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {teams.map((t, i) => (
                  <span key={i} className="bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    {t}
                    <button type="button" onClick={() => handleRemoveTeam(i)} className="text-zinc-400 hover:text-zinc-900 font-black">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* HR Contacts Manager */}
            <div className="space-y-2 border-t border-zinc-100 pt-3">
              <label className="block font-bold text-zinc-700 uppercase tracking-widest">HR & Recruiter Roster</label>
              <div className="space-y-1.5">
                <input
                  id="company_contact_name"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Staffer Name"
                  className="px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs w-full"
                />
                <div className="flex gap-1.5">
                  <input
                    id="company_contact_email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="email@address.com"
                    className="px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs w-full"
                  />
                  <input
                    id="company_contact_phone"
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Mobile number"
                    className="px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs w-full"
                  />
                </div>
                <button
                  id="company_add_contact_btn"
                  type="button"
                  onClick={handleAddContact}
                  className="w-full border border-dashed border-zinc-300 hover:border-zinc-900 text-zinc-700 py-1 font-bold text-center rounded-lg cursor-pointer"
                >
                  + Add Contact Profile
                </button>
              </div>
              {contacts.length > 0 && (
                <div className="pt-2 divide-y divide-zinc-100 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                  {contacts.map((c, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 first:pt-0 last:pb-0">
                      <div>
                        <div className="font-bold text-zinc-850">{c.name}</div>
                        <div className="text-zinc-500">{c.email} {c.phone && `• ${c.phone}`}</div>
                      </div>
                      <button type="button" onClick={() => handleRemoveContact(i)} className="text-red-600 hover:underline">Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              id="company_submit_btn"
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-950 text-white font-bold tracking-wide py-2.5 rounded-xl cursor-pointer hover:bg-zinc-800"
            >
              {loading ? 'Processing Configuration...' : editId ? 'Publish Core Updates' : 'Publish Corporate profile'}
            </button>
          </form>
        ) : (
          <div className="p-4 text-center rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-455 font-semibold text-xs leading-relaxed">
            🔐 Form parameters locked. Only Super Administrator permissions allow creating arbitrary company profiles, or you can edit your own pre-selected employee configuration in columns on the right.
          </div>
        )}
      </div>

      {/* Corporate profile indexes */}
      <div className="lg:col-span-7 space-y-4">
        <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2 border-b border-zinc-100 pb-3">
          <Building2 className="w-4 h-4 text-zinc-700" />
          Active Employer Ecosystem ({companies.length})
        </h3>

        {companies.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-250">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400 mb-2" />
            <p className="text-xs text-zinc-400 font-bold">Waiting for company records to sync from db...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {companies.map((company) => {
              const matchesOwnUser = currentUser?.companyId === company.id;
              
              return (
                <div
                  key={company.id}
                  id={`comp_card_${company.id}`}
                  className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 transition ${
                    matchesOwnUser ? 'border-zinc-900 border-2' : 'border-zinc-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={company.logoUrl || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&h=120&q=80"}
                      alt={company.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-100 shadow-sm"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-zinc-950">{company.name}</h4>
                        {matchesOwnUser && (
                          <span className="bg-zinc-900 text-white text-[9px] px-2 py-0.5 rounded font-extrabold uppercase">Your Employer</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-650 leading-relaxed font-semibold">{company.description}</p>
                    </div>
                  </div>

                  {/* Locations, Teams */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 text-[11px]">
                    <div className="space-y-1">
                      <div className="font-bold text-zinc-900 flex items-center gap-1 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        Offices & Branches
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {company.branchLocations?.map((loc, idx) => (
                          <span key={idx} className="bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded text-zinc-700 font-bold">{loc}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="font-bold text-zinc-900 flex items-center gap-1 uppercase tracking-wider">
                        <Layers className="w-3.5 h-3.5 text-zinc-400" />
                        Recruiting Team Pods
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {company.recruitmentTeams?.map((team, idx) => (
                          <span key={idx} className="bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded text-zinc-700 font-bold">{team}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Contacts */}
                  <div className="space-y-1.5 pt-3 border-t border-zinc-100 text-[11px]">
                    <div className="font-bold text-zinc-900 mb-1 uppercase tracking-wider">
                      Management Contacts
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {company.hrContacts?.map((c, idx) => (
                        <div key={idx} className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 space-y-1">
                          <div className="font-extrabold text-zinc-800">{c.name}</div>
                          <div className="text-zinc-500 font-mono flex items-center gap-1 text-[10px]">
                            <Mail className="w-3 h-3" />
                            {c.email}
                          </div>
                          {c.phone && (
                            <div className="text-zinc-500 font-mono flex items-center gap-1 text-[10px]">
                              <Phone className="w-3 h-3" />
                              {c.phone}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Edit/Delete Actions */}
                  {(isSuperAdmin || matchesOwnUser) && (
                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2 text-xs">
                      <button
                        id={`edit_comp_btn_${company.id}`}
                        onClick={() => startEdit(company)}
                        className="flex items-center gap-1 text-zinc-700 hover:text-zinc-950 font-bold cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Setup
                      </button>
                      
                      {isSuperAdmin && (
                        <button
                          id={`del_comp_btn_${company.id}`}
                          onClick={() => handleDelete(company.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 font-bold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Decommission
                        </button>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
