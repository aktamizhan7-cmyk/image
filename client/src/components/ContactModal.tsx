import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  MessageSquare,
  Building,
  HelpCircle,
  Copy,
  Check,
  Shield,
  Sparkles,
  ChevronDown,
  Paperclip,
  Trash2,
  Search,
  Clock,
  Users,
  AlertCircle,
} from 'lucide-react';
import { ApiClient } from '../services/apiClient';
import {
  ContactPriority,
  ContactTicketResponse,
  ContactTopicInfo,
} from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  defaultTopic = 'enterprise',
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'tracker'>('form');

  // Form Fields
  const [topic, setTopic] = useState<string>(defaultTopic);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  const [priority, setPriority] = useState<ContactPriority>('normal');
  const [message, setMessage] = useState<string>('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  // Status & Dynamic Data
  const [topicsList, setTopicsList] = useState<ContactTopicInfo[]>([
    {
      id: 'enterprise',
      label: 'Enterprise Node & GPU Cluster',
      description: 'Dedicated GPU instances, multi-node Vulkan clustering, custom high-throughput batch pipelines',
      defaultSlaHours: 2,
      team: 'Infrastructure & GPU Engineering',
    },
    {
      id: 'melanin-tuning',
      label: 'Custom Melanin Dataset Fine-Tuning',
      description: 'Fitzpatrick scale calibration, proprietary studio LUT creation, anti-whitewash neural model fine-tuning',
      defaultSlaHours: 4,
      team: 'Color Science & Neural Research',
    },
    {
      id: 'api-integration',
      label: 'REST / Batch CLI Integration',
      description: 'Headless Docker execution, webhook callbacks, Python/Node SDK bindings',
      defaultSlaHours: 6,
      team: 'Platform & SDK Integration',
    },
    {
      id: 'billing',
      label: 'Pro License & Billing',
      description: 'Seat provisioning, perpetual enterprise licenses, custom purchase orders and invoices',
      defaultSlaHours: 8,
      team: 'Commercial & Accounts',
    },
    {
      id: 'bug-support',
      label: 'Technical Support & Feedback',
      description: 'Bug reports, memory buffer optimization, WebAssembly/Vulkan driver diagnosis',
      defaultSlaHours: 12,
      team: 'Customer Engineering',
    },
  ]);
  const [avgReplyMinutes, setAvgReplyMinutes] = useState<number>(18);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedTicket, setSubmittedTicket] = useState<ContactTicketResponse | null>(null);

  // Ticket Lookup State
  const [lookupId, setLookupId] = useState<string>('');
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [lookedUpTicket, setLookedUpTicket] = useState<ContactTicketResponse | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Copy States
  const [hasCopiedEmail, setHasCopiedEmail] = useState<boolean>(false);
  const [hasCopiedTicket, setHasCopiedTicket] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Fetch backend topic catalog & response metrics on mount
  useEffect(() => {
    if (!isOpen) return;

    ApiClient.getContactTopics()
      .then((data) => {
        if (data.topics && data.topics.length > 0) {
          setTopicsList(data.topics);
        }
        if (data.teamStatus?.averageResponseMinutes) {
          setAvgReplyMinutes(data.teamStatus.averageResponseMinutes);
        }
      })
      .catch((err) => {
        console.warn('Could not load topics from backend, using defaults:', err);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Does SPIDY Enhancer store or retain our images on external servers?',
      a: 'No. All Vulkan NCNN super-resolution passes and Melanin Guard color transforms execute 100% locally within your browser and memory buffer. For custom private cloud deployments, we provide isolated VPC containers.',
    },
    {
      q: 'What is the turnaround time for enterprise support?',
      a: 'Enterprise Node accounts receive dedicated slack/discord channels with guaranteed sub-2-hour SLA response times. Standard inquiries are answered within 24 hours.',
    },
    {
      q: 'Can we license Melanin Guard color science for our internal studio pipeline?',
      a: 'Yes! We offer SDK bindings and standalone headless Docker CLI binaries for commercial video and portrait post-production workflows.',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await ApiClient.submitContact(
        {
          name,
          email,
          organization: organization || undefined,
          priority,
          topic,
          message,
        },
        attachedFile
      );

      setSubmittedTicket(response.ticket);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('[ContactModal] submission failed:', err);
      setSubmitError(err.message || 'Failed to submit inquiry to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookupTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);
    setLookedUpTicket(null);

    try {
      const res = await ApiClient.getContactTicket(lookupId.trim());
      setLookedUpTicket(res.ticket);
    } catch (err: any) {
      setLookupError(err.message || 'Ticket not found.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleCopySupportEmail = () => {
    navigator.clipboard.writeText('support@spidyenhancer.com');
    setHasCopiedEmail(true);
    setTimeout(() => setHasCopiedEmail(false), 2000);
  };

  const handleCopyTicket = (id: string) => {
    navigator.clipboard.writeText(id);
    setHasCopiedTicket(true);
    setTimeout(() => setHasCopiedTicket(false), 2000);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubmittedTicket(null);
    setMessage('');
    setAttachedFile(null);
    setSubmitError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 transition-opacity duration-300 select-none overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-obsidian-900 border border-obsidian-700/90 rounded-3xl p-5 sm:p-7 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 rounded-t-3xl"></div>

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-400 p-0.5 shadow-glow-blue flex items-center justify-center text-white shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Contact SPIDY Enhancer Studio</h3>
              <span className="flex items-center gap-1 text-[10px] font-mono bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Team Online (Avg reply ~{avgReplyMinutes}m)</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Backend ticket dispatch for Enterprise deployment, Melanin Guard fine-tuning, or API support.
            </p>
          </div>
        </div>

        {/* Top Navigation Tabs: Send Inquiry vs Track Ticket */}
        <div className="flex items-center gap-2 border-b border-obsidian-800 pb-3 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'form'
                ? 'bg-blue-600 text-white shadow-glow-blue'
                : 'bg-obsidian-850 text-slate-400 hover:text-slate-200 border border-obsidian-750'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Inquiry</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tracker')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'tracker'
                ? 'bg-blue-600 text-white shadow-glow-blue'
                : 'bg-obsidian-850 text-slate-400 hover:text-slate-200 border border-obsidian-750'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Existing Ticket</span>
          </button>
        </div>

        {/* TAB 1: SEND INQUIRY */}
        {activeTab === 'form' && (
          <>
            {isSubmitted && submittedTicket ? (
              /* ================= SUCCESS CONFIRMATION STATE ================= */
              <div className="text-center py-6 px-4 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-xl font-bold text-white">Ticket Registered with Server</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                    Thank you, <strong className="text-slate-200">{name}</strong>. Your inquiry has been logged in our backend support system and assigned to{' '}
                    <strong className="text-blue-400">{submittedTicket.assignedTeam}</strong>.
                  </p>
                </div>

                {/* Ticket Details Card */}
                <div className="max-w-md mx-auto bg-obsidian-950/90 border border-obsidian-800 rounded-2xl p-4 text-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-obsidian-850">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Ticket Reference</span>
                      <span className="font-mono font-bold text-amber-400 text-sm tracking-wider">
                        {submittedTicket.id}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyTicket(submittedTicket.id)}
                      className="flex items-center gap-1 bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-obsidian-700 transition"
                    >
                      {hasCopiedTicket ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Assigned SLA</span>
                      <span className="font-medium text-emerald-400">
                        Sub-{submittedTicket.slaResponseHours}h Guaranteed
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Status</span>
                      <span className="font-medium text-blue-400 uppercase tracking-wider text-[11px]">
                        ● {submittedTicket.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-700 text-xs text-slate-300 font-medium transition"
                  >
                    Send Another Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow-blue transition active:scale-95"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* ================= MAIN INTERACTIVE CONTACT FORM ================= */
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                  <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl flex items-center gap-2 text-xs text-rose-300 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Topic Selector Pills */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Select Inquiry Topic
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {topicsList.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTopic(t.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          topic === t.id
                            ? 'border-blue-500 bg-blue-950/40 text-blue-300 shadow-sm font-semibold'
                            : 'border-obsidian-700 bg-obsidian-850/60 text-slate-400 hover:text-slate-200 hover:border-obsidian-600'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>Your Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-obsidian-950 border border-obsidian-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@photostudio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-obsidian-950 border border-obsidian-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Organization & Urgency Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>Studio / Organization</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SPIDY Creative Labs (Optional)"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full bg-obsidian-950 border border-obsidian-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">
                      Priority SLA
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPriority('normal')}
                        className={`py-2 text-[11px] font-medium rounded-xl border transition ${
                          priority === 'normal'
                            ? 'border-blue-500 bg-blue-950/40 text-blue-300 font-semibold'
                            : 'border-obsidian-700 bg-obsidian-850 text-slate-400'
                        }`}
                      >
                        Standard
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriority('high')}
                        className={`py-2 text-[11px] font-medium rounded-xl border transition ${
                          priority === 'high'
                            ? 'border-amber-500 bg-amber-950/40 text-amber-300 font-semibold'
                            : 'border-obsidian-700 bg-obsidian-850 text-slate-400'
                        }`}
                      >
                        Priority
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriority('urgent')}
                        className={`py-2 text-[11px] font-medium rounded-xl border transition ${
                          priority === 'urgent'
                            ? 'border-rose-500 bg-rose-950/40 text-rose-300 font-semibold'
                            : 'border-obsidian-700 bg-obsidian-850 text-slate-400'
                        }`}
                      >
                        Urgent SLA
                      </button>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span>Message & Pipeline Requirements *</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {message.length} chars
                    </span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your project, desired batch volumes, custom skin-tone requirements, or system environment..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-obsidian-950 border border-obsidian-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
                  ></textarea>
                </div>

                {/* Attachment & Direct Support Helper */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-obsidian-950/70 border border-obsidian-800 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 px-3 py-1.5 rounded-lg border border-obsidian-700 transition">
                      <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                      <span>{attachedFile ? 'Change File' : 'Attach Sample / Spec'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf,.txt,.json,.zip"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setAttachedFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    {attachedFile && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <span className="truncate max-w-[140px]">{attachedFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setAttachedFile(null)}
                          className="text-slate-500 hover:text-rose-400 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[11px]">Direct Email:</span>
                    <button
                      type="button"
                      onClick={handleCopySupportEmail}
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-mono text-[11px] bg-blue-950/30 px-2 py-0.5 rounded border border-blue-900/40"
                    >
                      <Mail className="w-3 h-3" />
                      <span>support@spidyenhancer.com</span>
                      {hasCopiedEmail ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Accordion FAQs */}
                <div className="border-t border-obsidian-800 pt-3 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Frequently Asked Questions
                  </span>
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="bg-obsidian-950/50 border border-obsidian-800/80 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        className="w-full text-left px-3 py-2 flex items-center justify-between text-xs text-slate-300 hover:text-white transition"
                      >
                        <span className="font-medium flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{faq.q}</span>
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                            activeFaq === idx ? 'rotate-180 text-blue-400' : ''
                          }`}
                        />
                      </button>
                      {activeFaq === idx && (
                        <div className="px-3 pb-2.5 text-[11px] text-slate-400 border-t border-obsidian-800/50 pt-1.5 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer Form Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-obsidian-800">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                    <Shield className="w-3.5 h-3.5" />
                    <span>256-bit Encrypted Server Route (/api/contact)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 text-xs font-semibold border border-obsidian-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-brand-500 hover:from-blue-500 hover:to-brand-400 text-white text-xs font-semibold shadow-glow-blue transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting to Server...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Inquiry</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </>
        )}

        {/* TAB 2: TICKET STATUS TRACKER */}
        {activeTab === 'tracker' && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-300">
              Enter your ticket reference ID below to query real-time assignment and response SLA directly from the server.
            </p>

            <form onSubmit={handleLookupTicket} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. LMN-2026-X841"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value.toUpperCase())}
                className="flex-1 bg-obsidian-950 border border-obsidian-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase"
              />
              <button
                type="submit"
                disabled={isLookingUp}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow-blue transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLookingUp ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Check Status</span>
              </button>
            </form>

            {lookupError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            {lookedUpTicket && (
              <div className="bg-obsidian-950 border border-obsidian-800 rounded-2xl p-4 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-obsidian-850">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Ticket Reference</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">{lookedUpTicket.id}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-blue-950/80 text-blue-300 border border-blue-800/60">
                    ● {lookedUpTicket.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Assigned Team</span>
                    </span>
                    <span className="font-medium text-slate-200">{lookedUpTicket.assignedTeam}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Response SLA</span>
                    </span>
                    <span className="font-medium text-emerald-400">Sub-{lookedUpTicket.slaResponseHours} Hours</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Created On</span>
                    <span className="text-slate-300 text-[11px]">
                      {new Date(lookedUpTicket.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Priority</span>
                    <span className="uppercase text-amber-300 font-mono text-[11px]">{lookedUpTicket.priority}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-obsidian-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 text-xs font-semibold border border-obsidian-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
