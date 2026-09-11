'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortfolioContent, Project, Experience, Education, Certification, ImpactMetric, SectionVisibility } from '@/types';
import './admin.css';
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiSave,
  FiLogOut,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiCheck,
  FiAlertCircle,
  FiArrowLeft,
  FiHome,
  FiLayers,
  FiUser,
  FiBriefcase,
  FiAward,
  FiSettings,
  FiRefreshCw,
  FiExternalLink,
  FiUpload,
} from 'react-icons/fi';
import {
  ImageUploader,
  GalleryUploader,
  DocumentUploader,
  TagManager,
  FeatureListEditor,
} from '@/components/admin/FileUpload';

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Content State
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'projects' | 'experience' | 'certifications' | 'sections' | 'settings'>('hero');

  // Password Change State
  const [pwChange, setPwChange] = useState({ current: '', next: '', confirm: '' });
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Visibility States (Eye toggle)
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNextPw, setShowNextPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const getAdminPassword = () => localStorage.getItem('admin_auth_pwd') || '';

  // Check existing session token on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_session_token');
    if (token) {
      setIsAuthenticated(true);
    }
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      let localData: (PortfolioContent & { _updatedAt?: number }) | null = null;
      try {
        const stored = localStorage.getItem('portfolio_content_v2');
        if (stored) {
          localData = JSON.parse(stored);
        }
      } catch (e) {}

      const res = await fetch('/api/content', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.data) {
        const serverTime = data.data._updatedAt || 0;
        const localTime = localData?._updatedAt || 0;

        if (localData && localTime > serverTime) {
          setContent(localData);
        } else {
          setContent(data.data);
          try {
            localStorage.setItem('portfolio_content_v2', JSON.stringify(data.data));
          } catch (e) {}
        }
      } else if (localData) {
        setContent(localData);
      }
    } catch (err) {
      console.error('Failed to load portfolio content from server:', err);
      try {
        const stored = localStorage.getItem('portfolio_content_v2');
        if (stored) {
          setContent(JSON.parse(stored));
        }
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('admin_session_token', data.token);
        localStorage.setItem('admin_auth_pwd', passwordInput);
        setIsAuthenticated(true);
        setPasswordInput('');
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setAuthError('Connection error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session_token');
    localStorage.removeItem('admin_auth_pwd');
    setIsAuthenticated(false);
  };

  const handleSaveAll = async () => {
    if (!content) return;
    setSaving(true);
    setSaveSuccess(false);

    const savedPassword = localStorage.getItem('admin_auth_pwd') || '';
    const sessionToken = localStorage.getItem('admin_session_token') || '';
    const stampedContent: PortfolioContent & { _updatedAt: number } = {
      ...content,
      _updatedAt: Date.now(),
    };

    try {
      // 1. Save to localStorage immediately for instant local retention
      try {
        localStorage.setItem('portfolio_content_v2', JSON.stringify(stampedContent));
      } catch (e) {}

      // 2. Broadcast to open portfolio tabs in real-time
      try {
        const channel = new BroadcastChannel('portfolio_cms_channel');
        channel.postMessage({ type: 'CONTENT_UPDATED', content: stampedContent });
        channel.close();
      } catch (e) {}

      const res = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({
          content: stampedContent,
          password: savedPassword,
          token: sessionToken,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setContent(stampedContent);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        alert(`Error saving changes: ${data.error || 'Check your admin credentials'}`);
      }
    } catch (err) {
      alert('Network error while saving changes to server, but changes are saved in local session.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);

    if (!pwChange.current) {
      setPwMessage({ type: 'error', text: 'Please enter your current password' });
      return;
    }

    if (pwChange.next !== pwChange.confirm) {
      setPwMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (pwChange.next.trim().length < 4) {
      setPwMessage({ type: 'error', text: 'New password must be at least 4 characters long' });
      return;
    }

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwChange.current.trim(),
          newPassword: pwChange.next.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('admin_auth_pwd', pwChange.next.trim());
        if (data.token) {
          localStorage.setItem('admin_session_token', data.token);
        }
        setPwMessage({ type: 'success', text: 'Master password updated successfully!' });
        setPwChange({ current: '', next: '', confirm: '' });
      } else {
        setPwMessage({ type: 'error', text: data.error || 'Failed to update password' });
      }
    } catch (e) {
      setPwMessage({ type: 'error', text: 'Error communicating with server' });
    }
  };

  // --- Helpers for updating nested fields ---
  const updateHeroField = (field: keyof PortfolioContent['hero'], value: any) => {
    if (!content) return;
    setContent({
      ...content,
      hero: { ...content.hero, [field]: value },
    });
  };

  const updateSectionVisibility = (key: keyof SectionVisibility, value: boolean) => {
    if (!content) return;
    const updated = {
      ...content,
      sectionVisibility: {
        ...(content.sectionVisibility ?? {}),
        [key]: value,
      },
    };
    setContent(updated);
    try {
      const channel = new BroadcastChannel('portfolio_cms_channel');
      channel.postMessage({ type: 'CONTENT_UPDATED', content: updated });
      channel.close();
    } catch (e) {}
  };

  const updateSocialLink = (network: keyof PortfolioContent['hero']['socialLinks'], url: string) => {
    if (!content) return;
    setContent({
      ...content,
      hero: {
        ...content.hero,
        socialLinks: { ...content.hero.socialLinks, [network]: url },
      },
    });
  };

  // --- Project CRUD Helpers ---
  const handleAddProject = () => {
    if (!content) return;
    const newProj: Project = {
      id: `project-${Date.now().toString().slice(-4)}`,
      title: 'New AI Research Project',
      description: 'Comprehensive overview of architecture, training pipeline, and performance benchmarks.',
      techStack: ['Python', 'PyTorch', 'FastAPI'],
      features: ['Real-time low latency inference', 'Distributed processing pipeline'],
      tags: ['LLM', 'AI'],
      thumbnail: '/assets/images/nexusrag-landingpage.png',
      screenshots: ['/assets/images/nexusrag-landingpage.png'],
      githubLink: 'https://github.com/crazy-scientistt',
      liveLink: '',
    };
    setContent({
      ...content,
      projects: [newProj, ...content.projects],
    });
  };

  const updateProject = (index: number, updated: Project) => {
    if (!content) return;
    const newProjects = [...content.projects];
    newProjects[index] = updated;
    setContent({ ...content, projects: newProjects });
  };

  const deleteProject = (index: number) => {
    if (!content) return;
    if (confirm('Are you sure you want to remove this project?')) {
      setContent({
        ...content,
        projects: content.projects.filter((_, i) => i !== index),
      });
    }
  };

  // --- Experience CRUD Helpers ---
  const handleAddExperience = () => {
    if (!content) return;
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      title: 'Senior AI Engineer',
      company: 'Tech Enterprise',
      period: '2024 - Present',
      description: 'Leading production deployments of generative models and fine-tuned language architectures.',
    };
    setContent({ ...content, experiences: [newExp, ...content.experiences] });
  };

  const updateExperience = (index: number, updated: Experience) => {
    if (!content) return;
    const updatedList = [...content.experiences];
    updatedList[index] = updated;
    setContent({ ...content, experiences: updatedList });
  };

  const deleteExperience = (index: number) => {
    if (!content) return;
    setContent({
      ...content,
      experiences: content.experiences.filter((_, i) => i !== index),
    });
  };

  // --- Education CRUD Helpers ---
  const handleAddEducation = () => {
    if (!content) return;
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      degree: 'High School / College / Degree',
      institution: 'Institution / College / School',
      period: 'Year - Year',
      gpa: '',
    };
    setContent({
      ...content,
      education: [...content.education, newEdu],
    });
  };

  const deleteEducation = (index: number) => {
    if (!content) return;
    setContent({
      ...content,
      education: content.education.filter((_, i) => i !== index),
    });
  };

  // --- Certifications CRUD Helpers ---
  const handleAddCertification = () => {
    if (!content) return;
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      title: 'Advanced AI Architecture Specialization',
      issuer: 'Stanford Online / DeepLearning.AI',
      date: '2025',
      description: 'Specialized mastery in Transformer networks and reinforcement learning.',
      image: '/assets/images/ElementsofAI-Certificate.png',
    };
    setContent({ ...content, certifications: [newCert, ...content.certifications] });
  };

  const updateCertification = (index: number, updated: Certification) => {
    if (!content) return;
    const updatedList = [...content.certifications];
    updatedList[index] = updated;
    setContent({ ...content, certifications: updatedList });
  };

  const deleteCertification = (index: number) => {
    if (!content) return;
    setContent({
      ...content,
      certifications: content.certifications.filter((_, i) => i !== index),
    });
  };

  // --- Export JSON Backup ---
  const exportBackup = () => {
    if (!content) return;
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abdulrehman-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Import JSON Backup ---
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object' && parsed.hero) {
          setContent(parsed);
          alert('Backup loaded into editor! Click "Save Changes" in the top bar to save and persist to disk.');
        } else {
          alert('Invalid backup JSON format. Required fields are missing.');
        }
      } catch (err) {
        alert('Could not parse JSON backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ----------------------------------------------------
  // Render: Login Gate
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="admin-root min-h-screen bg-darker flex items-center justify-center p-6 text-slate-100 font-sans noise-overlay">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl max-w-md w-full border border-white/[0.1] shadow-2xl relative">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4">
              <FiLock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">
              Admin CMS Portal
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-2">
              Protected Management Console // Abdul Rehman Portfolio
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-2 uppercase tracking-wider">
                Master Passkey
              </label>
              <div className="relative">
                <input
                  type={showLoginPw ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Enter admin password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPw(!showLoginPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1"
                  title={showLoginPw ? 'Hide passkey' : 'Show passkey'}
                  aria-label={showLoginPw ? 'Hide passkey' : 'Show passkey'}
                >
                  {showLoginPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400 animate-fade-in">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-darker font-mono text-xs uppercase tracking-wider font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {authLoading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiLock className="w-4 h-4" />}
              <span>{authLoading ? 'Verifying...' : 'Authorize Access'}</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-primary transition-colors"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Portfolio</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Render: Authenticated CMS Dashboard
  // ----------------------------------------------------
  return (
    <div className="admin-root min-h-screen bg-darker text-slate-100 font-sans pb-24 noise-overlay">
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-40 bg-dark/90 backdrop-blur-xl border-b border-white/[0.08] px-6 sm:px-8 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-display font-bold text-sm sm:text-base text-white tracking-wider uppercase">
              ABDUL REHMAN // CMS CONTROL
            </span>
            <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              LIVE_PERSISTENCE
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-xs font-mono text-slate-300 hover:text-white transition-all"
            >
              <FiExternalLink className="w-3.5 h-3.5 text-primary" />
              <span>View Live Site</span>
            </Link>

            <button
              onClick={handleSaveAll}
              disabled={saving}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-lg ${
                saveSuccess
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-primary hover:bg-primary-light text-darker shadow-primary/25'
              }`}
            >
              {saving ? (
                <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : saveSuccess ? (
                <FiCheck className="w-3.5 h-3.5" />
              ) : (
                <FiSave className="w-3.5 h-3.5" />
              )}
              <span>{saving ? 'Saving...' : saveSuccess ? 'Saved to Disk!' : 'Save Changes'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl glass-card text-slate-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-8">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-8">
          {[
            { id: 'hero', label: 'Hero & Profile', icon: FiUser },
            { id: 'projects', label: `Projects (${content?.projects.length || 0})`, icon: FiLayers },
            { id: 'experience', label: `Career & Edu (${(content?.experiences.length || 0) + (content?.education.length || 0)})`, icon: FiBriefcase },
            { id: 'certifications', label: `Certifications (${content?.certifications.length || 0})`, icon: FiAward },
            { id: 'sections', label: 'Sections', icon: FiEyeOff },
            { id: 'settings', label: 'Security & Settings', icon: FiSettings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary text-darker font-bold shadow-md shadow-primary/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Loading State */}
        {loading || !content ? (
          <div className="p-16 text-center text-slate-400 font-mono text-sm flex items-center justify-center gap-3">
            <FiRefreshCw className="w-5 h-5 animate-spin text-primary" />
            <span>Loading content data store...</span>
          </div>
        ) : (
          <div>
            {/* ---------------------------------------------------- */}
            {/* TAB 1: HERO & PROFILE */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'hero' && (
              <div className="space-y-8 animate-fade-in">
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] space-y-6">
                  <h3 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-primary" />
                    Identity & Hero Presentation
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">Full Name</label>
                      <input
                        type="text"
                        value={content.hero.name}
                        onChange={(e) => updateHeroField('name', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">Professional Title</label>
                      <input
                        type="text"
                        value={content.hero.title}
                        onChange={(e) => updateHeroField('title', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">Tagline / Mission</label>
                    <input
                      type="text"
                      value={content.hero.tagline}
                      onChange={(e) => updateHeroField('tagline', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">Bio / Executive Summary</label>
                    <textarea
                      rows={4}
                      value={content.hero.bio}
                      onChange={(e) => updateHeroField('bio', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-primary font-mono resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">Status Pill</label>
                      <input
                        type="text"
                        value={content.hero.status}
                        onChange={(e) => updateHeroField('status', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">Location / Scope</label>
                      <input
                        type="text"
                        value={content.hero.location}
                        onChange={(e) => updateHeroField('location', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Exact Reference Hero Cards Manager */}
                {/* Fields the live site actually renders */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] space-y-6">
                  <h3 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-2">
                    <FiLayers className="w-5 h-5 text-primary" />
                    About & Specialties
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mb-4">
                    About text sits beside the contact block in the Signal section. Specialty tags join your
                    project tags in the scrolling capability band under the metrics.
                  </p>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">About Content Text</label>
                    <textarea
                      rows={3}
                      value={content.hero.aboutText || ''}
                      onChange={(e) => updateHeroField('aboutText', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white font-mono resize-none"
                    />
                  </div>

                  <TagManager
                    label="Specialty Tags"
                    tags={content.hero.specialtiesTags || []}
                    onChange={(tags) => updateHeroField('specialtiesTags', tags)}
                    helperText="Tags displayed in the capability marquee band"
                    placeholder="e.g. LLM Fine-Tuning, Computer Vision..."
                  />
                </div>


                {/* Social Channels */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] space-y-6">
                  <h3 className="text-xl font-display font-bold text-white mb-4">Communication & Social Channels</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">Direct Email</label>
                      <input
                        type="email"
                        value={content.hero.socialLinks?.email || ''}
                        onChange={(e) => updateSocialLink('email', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">GitHub Profile URL</label>
                      <input
                        type="url"
                        value={content.hero.socialLinks?.github || ''}
                        onChange={(e) => updateSocialLink('github', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        value={content.hero.socialLinks?.linkedin || ''}
                        onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">Twitter / X URL</label>
                      <input
                        type="url"
                        value={content.hero.socialLinks?.twitter || ''}
                        onChange={(e) => updateSocialLink('twitter', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">Primary Phone / Contact</label>
                      <input
                        type="text"
                        placeholder="+92 315 4233431"
                        value={content.hero.socialLinks?.phone || ''}
                        onChange={(e) => updateSocialLink('phone', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">Secondary Contact (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Alternate phone or WhatsApp"
                        value={content.hero.socialLinks?.phone2 || ''}
                        onChange={(e) => updateSocialLink('phone2', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06]">
                    <DocumentUploader
                      label="Official Résumé / Curriculum Vitae (PDF)"
                      value="/assets/resume.pdf"
                      onChange={() => {}}
                      passwordGetter={getAdminPassword}
                      isResume={true}
                    />
                  </div>
                </div>

                {/* Impact Metrics Manager */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-display font-bold text-white">Impact & Performance Metrics</h3>
                    <button
                      onClick={() => {
                        const newM: ImpactMetric = {
                          id: `metric-${Date.now()}`,
                          value: '99%',
                          label: 'System Metric',
                          description: 'Key quantifiable architectural achievement',
                        };
                        updateHeroField('impactMetrics', [...(content.hero.impactMetrics || []), newM]);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono hover:bg-primary/20 transition-colors"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                      <span>Add Metric</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {content.hero.impactMetrics?.map((metric, idx) => (
                      <div key={metric.id || idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3 relative group">
                        <button
                          onClick={() => {
                            const filtered = content.hero.impactMetrics.filter((_, i) => i !== idx);
                            updateHeroField('impactMetrics', filtered);
                          }}
                          className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition-colors"
                          title="Remove Metric"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Metric Value</label>
                            <input
                              type="text"
                              value={metric.value}
                              onChange={(e) => {
                                const list = [...content.hero.impactMetrics];
                                list[idx] = { ...list[idx], value: e.target.value };
                                updateHeroField('impactMetrics', list);
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-primary font-bold font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Metric Label</label>
                            <input
                              type="text"
                              value={metric.label}
                              onChange={(e) => {
                                const list = [...content.hero.impactMetrics];
                                list[idx] = { ...list[idx], label: e.target.value };
                                updateHeroField('impactMetrics', list);
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Description / Details</label>
                          <input
                            type="text"
                            value={metric.description}
                            onChange={(e) => {
                              const list = [...content.hero.impactMetrics];
                              list[idx] = { ...list[idx], description: e.target.value };
                              updateHeroField('impactMetrics', list);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 2: PROJECTS MANAGER */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'projects' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-white">
                      Portfolio Projects Manager
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      Add, modify, or remove projects. All updates update the 3D cards and interactive modals.
                    </p>
                  </div>
                  <button
                    onClick={handleAddProject}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-darker font-mono text-xs uppercase font-bold tracking-wider transition-all shadow-md shadow-primary/20"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Create New Project</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {content.projects.map((project, idx) => (
                    <div
                      key={project.id || idx}
                      className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] space-y-6 relative"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                            #{idx + 1}
                          </span>
                          <h4 className="text-lg font-display font-bold text-white truncate max-w-lg">
                            {project.title}
                          </h4>
                        </div>
                        <button
                          onClick={() => deleteProject(idx)}
                          className="flex items-center gap-1.5 text-xs font-mono text-red-400 hover:text-red-300 transition-colors w-fit"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span>Delete Project</span>
                        </button>
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-2 uppercase font-semibold">Project Title</label>
                        <input
                          type="text"
                          value={project.title}
                          onChange={(e) => updateProject(idx, { ...project, title: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white font-mono focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">Project Description</label>
                        <textarea
                          rows={3}
                          value={project.description}
                          onChange={(e) => updateProject(idx, { ...project, description: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white font-mono focus:outline-none focus:border-primary resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TagManager
                          label="Tech Stack"
                          tags={project.techStack}
                          onChange={(tags) => updateProject(idx, { ...project, techStack: tags })}
                          placeholder="Add tech (e.g. PyTorch)..."
                        />
                        <TagManager
                          label="Category Tags"
                          tags={project.tags}
                          onChange={(tags) => updateProject(idx, { ...project, tags })}
                          placeholder="Add category (e.g. LLM)..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">GitHub Link</label>
                          <input
                            type="url"
                            value={project.githubLink || ''}
                            onChange={(e) => updateProject(idx, { ...project, githubLink: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white font-mono focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-2 uppercase">Live Demo Link</label>
                          <input
                            type="url"
                            value={project.liveLink || ''}
                            onChange={(e) => updateProject(idx, { ...project, liveLink: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white font-mono focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-6 pt-2 border-t border-white/[0.06]">
                        <ImageUploader
                          label="Project Thumbnail Image"
                          value={project.thumbnail}
                          onChange={(url) => updateProject(idx, { ...project, thumbnail: url })}
                          passwordGetter={getAdminPassword}
                          aspectRatio="video"
                          helperText="Main cover image shown on 3D gallery panel"
                        />

                        <GalleryUploader
                          label="Project Case Study Screenshots"
                          images={project.screenshots}
                          onChange={(urls) => updateProject(idx, { ...project, screenshots: urls })}
                          passwordGetter={getAdminPassword}
                          helperText="Screenshots displayed inside the interactive case study dialog"
                        />
                      </div>

                      <div className="pt-2 border-t border-white/[0.06]">
                        <FeatureListEditor
                          label="Key Capabilities & Features"
                          features={project.features}
                          onChange={(features) => updateProject(idx, { ...project, features })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 3: CAREER & EDUCATION */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'experience' && (
              <div className="space-y-10 animate-fade-in">
                {/* Experiences List */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                      <FiBriefcase className="w-5 h-5 text-primary" />
                      Professional Experience Milestones
                    </h3>
                    <button
                      onClick={handleAddExperience}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-darker font-mono text-xs font-bold uppercase"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                      <span>Add Role</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {content.experiences.map((exp, idx) => (
                      <div key={exp.id || idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4 relative">
                        <button
                          onClick={() => deleteExperience(idx)}
                          className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors"
                          title="Remove Experience"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Job Title</label>
                            <input
                              type="text"
                              value={exp.title}
                              onChange={(e) => updateExperience(idx, { ...exp, title: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Company / Organization</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateExperience(idx, { ...exp, company: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Period</label>
                            <input
                              type="text"
                              value={exp.period}
                              onChange={(e) => updateExperience(idx, { ...exp, period: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Description of Achievements</label>
                          <textarea
                            rows={3}
                            value={exp.description}
                            onChange={(e) => updateExperience(idx, { ...exp, description: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education List */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-display font-bold text-white">Academic Qualifications & Education</h3>
                      <p className="text-xs font-mono text-slate-400 mt-1">
                        Add university degrees, college, and school education milestones.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-light text-darker font-mono text-xs font-bold uppercase transition-all shadow-md shadow-primary/20"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                      <span>Add Education</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {content.education.map((edu, idx) => (
                      <div key={edu.id || idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4 relative">
                        <button
                          type="button"
                          onClick={() => deleteEducation(idx)}
                          className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors"
                          title="Remove Education"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pr-8">
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Degree / Qualification</label>
                          <input
                            type="text"
                            placeholder="e.g. BS AI, College, High School"
                            value={edu.degree}
                            onChange={(e) => {
                              const list = [...content.education];
                              list[idx] = { ...list[idx], degree: e.target.value };
                              setContent({ ...content, education: list });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Institution / School / College</label>
                          <input
                            type="text"
                            placeholder="e.g. University / College Name"
                            value={edu.institution}
                            onChange={(e) => {
                              const list = [...content.education];
                              list[idx] = { ...list[idx], institution: e.target.value };
                              setContent({ ...content, education: list });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Period / Years</label>
                          <input
                            type="text"
                            placeholder="e.g. 2021 - 2025"
                            value={edu.period}
                            onChange={(e) => {
                              const list = [...content.education];
                              list[idx] = { ...list[idx], period: e.target.value };
                              setContent({ ...content, education: list });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">GPA / Grade / Honors</label>
                          <input
                            type="text"
                            placeholder="e.g. 3.65/4.0 or Grade A"
                            value={edu.gpa || ''}
                            onChange={(e) => {
                              const list = [...content.education];
                              list[idx] = { ...list[idx], gpa: e.target.value };
                              setContent({ ...content, education: list });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white font-mono"
                          />
                        </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 4: CERTIFICATIONS */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'certifications' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                    <FiAward className="w-6 h-6 text-primary" />
                    Verified Certifications & Accreditations
                  </h3>
                  <button
                    onClick={handleAddCertification}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-darker font-mono text-xs uppercase font-bold"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add Certification</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {content.certifications.map((cert, idx) => (
                    <div key={cert.id || idx} className="glass-panel p-6 rounded-3xl border border-white/[0.08] space-y-4 relative">
                      <button
                        onClick={() => deleteCertification(idx)}
                        className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors"
                        title="Remove Certification"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>

                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Certification Title</label>
                        <input
                          type="text"
                          value={cert.title}
                          onChange={(e) => updateCertification(idx, { ...cert, title: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Issuer</label>
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => updateCertification(idx, { ...cert, issuer: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Date</label>
                          <input
                            type="text"
                            value={cert.date}
                            onChange={(e) => updateCertification(idx, { ...cert, date: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white font-mono"
                          />
                        </div>
                      </div>

                      <ImageUploader
                        label="Certification Badge / Document Image"
                        value={cert.image}
                        onChange={(url) => updateCertification(idx, { ...cert, image: url })}
                        passwordGetter={getAdminPassword}
                        aspectRatio="portrait"
                        helperText="Official credential badge or document preview"
                      />

                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">Details / Focus</label>
                        <input
                          type="text"
                          value={cert.description || ''}
                          onChange={(e) => updateCertification(idx, { ...cert, description: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 5: SETTINGS & SECURITY */}
            {/* ---------------------------------------------------- */}
            {/* ---------------------------------------------------- */}
            {/* TAB: SECTION VISIBILITY */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'sections' && (
              <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] space-y-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                      <FiEyeOff className="w-5 h-5 text-primary" />
                      Section Visibility
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-2">
                      Hide or show entire sections of the live site. The hero and the “What I build” statement are always visible.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {([
                      { key: 'impactMetrics', label: 'Impact Metrics', desc: '01 / Index — counting stats band above the capability marquee' },
                      { key: 'projects', label: 'Projects', desc: '02 / Work — horizontal gallery and case-study panels' },
                      { key: 'journey', label: 'Career & Education Journey', desc: '03 / Dossier — the cream “track record” list' },
                      { key: 'certifications', label: 'Certifications', desc: '03 / Dossier — credential cards' },
                      { key: 'contact', label: 'Contact', desc: '04 / Signal — headline, email link and social list' },
                      { key: 'footer', label: 'Footer', desc: '04 / Signal — bottom bar with discreet admin access' },
                    ] as { key: keyof SectionVisibility; label: string; desc: string }[]).map(({ key, label, desc }) => {
                      const isOn = content.sectionVisibility?.[key] ?? true;
                      return (
                        <div
                          key={key}
                          className={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-colors ${
                            isOn
                              ? 'bg-white/[0.03] border-white/[0.10]'
                              : 'bg-white/[0.01] border-white/[0.05]'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-display font-bold text-white flex items-center gap-2">
                              {label}
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                  isOn
                                    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                                    : 'text-red-400 border-red-500/30 bg-red-500/10'
                                }`}
                              >
                                {isOn ? 'Visible' : 'Hidden'}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">{desc}</div>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isOn}
                            aria-label={`Toggle ${label} section`}
                            onClick={() => updateSectionVisibility(key, !isOn)}
                            className={`relative w-12 h-6.5 rounded-full flex-shrink-0 transition-colors duration-200 ${
                              isOn ? 'bg-emerald-500/80' : 'bg-white/[0.12]'
                            }`}
                            style={{ height: 26 }}
                          >
                            <span
                              className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${
                                isOn ? 'left-[26px]' : 'left-[3px]'
                              }`}
                            />
                          </button>
                          <input type="checkbox" className="hidden" checked={isOn} readOnly aria-hidden="true" />
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-[11px] font-mono text-primary-light flex items-start gap-2">
                    <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>
                      Toggle here, then press “Save Changes” to persist. Hidden sections disappear from the live site instantly.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
                {/* Change Master Password */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] space-y-6">
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <FiLock className="w-5 h-5 text-primary" />
                    Modify Master CMS Password
                  </h3>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-1 uppercase">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPw ? 'text' : 'password'}
                          required
                          placeholder="Enter your current password"
                          value={pwChange.current}
                          onChange={(e) => setPwChange({ ...pwChange, current: e.target.value })}
                          className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white font-mono focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1"
                          title={showCurrentPw ? 'Hide password' : 'Show password'}
                          aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
                        >
                          {showCurrentPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-1 uppercase">New Password</label>
                      <div className="relative">
                        <input
                          type={showNextPw ? 'text' : 'password'}
                          required
                          placeholder="At least 4 characters"
                          value={pwChange.next}
                          onChange={(e) => setPwChange({ ...pwChange, next: e.target.value })}
                          className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white font-mono focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNextPw(!showNextPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1"
                          title={showNextPw ? 'Hide password' : 'Show password'}
                          aria-label={showNextPw ? 'Hide password' : 'Show password'}
                        >
                          {showNextPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-1 uppercase">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPw ? 'text' : 'password'}
                          required
                          placeholder="Re-type new password"
                          value={pwChange.confirm}
                          onChange={(e) => setPwChange({ ...pwChange, confirm: e.target.value })}
                          className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white font-mono focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw(!showConfirmPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1"
                          title={showConfirmPw ? 'Hide password' : 'Show password'}
                          aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {pwMessage && (
                      <div
                        className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                          pwMessage.type === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}
                      >
                        <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{pwMessage.text}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-primary text-darker font-mono text-xs uppercase tracking-wider font-bold hover:bg-primary-light transition-colors"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Backup & Export */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] space-y-4">
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <FiSave className="w-5 h-5 text-primary" />
                    Data Export & Backup
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Download an immutable JSON snapshot of your complete portfolio content or restore a previous JSON backup.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      onClick={exportBackup}
                      className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-slate-200 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      Download Content JSON Backup
                    </button>
                    <label className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-slate-200 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer inline-flex items-center gap-2">
                      <FiUpload className="w-3.5 h-3.5 text-primary" />
                      <span>Restore Backup JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleImportBackup}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
