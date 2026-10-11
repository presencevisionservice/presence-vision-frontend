import React, { useMemo, useRef, useState, useEffect } from 'react';
import api from '../../../../../services/axios';
import { ArrowLeft, Trash2, AlertTriangle, Save, Users, UserCheck } from 'lucide-react';

const HOLD_DURATION = 1500;

function SectionDetails({ section, onClose, onSuccess }) {
  const originalValues = useMemo(
    () => ({
      name: section.name ?? '',
      course_code: section.course_code ?? '',
      course_name: section.course_name ?? '',
    }),
    [section]
  );

  const [form, setForm] = useState(originalValues);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState(null);

  const sectionId = section.id ?? section._id;
  const enrolledStudents = section.enrolled_students || [];

  const isDirty = Object.keys(originalValues).some(
    (key) => form[key] !== originalValues[key]
  );
  const isBusy = saving || deleting;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e?.preventDefault();
    if (!isDirty || isBusy) return;

    setSaving(true);
    setError(null);
    try {
      await api.put(`api/teacher/sections/${sectionId}/`, form);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to update section:', err);
      setError('Failed to update section. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const performDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await api.delete(`api/teacher/sections/${sectionId}/`);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to delete section:', err);
      setError('Failed to delete section. Please try again.');
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const initial = (originalValues.name || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-[var(--bg)] text-[var(--fg)]">
      {/* ---------- Hero / Header ---------- */}
      <div className="relative overflow-hidden border-b border-[var(--line)] bg-white/50 backdrop-blur-md">
        <div className="relative px-8 pt-7 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--muted)]">
              <span>Sections</span>
              <span className="text-[var(--line)]">/</span>
              <span className="text-[var(--accent)] font-semibold">Details</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="group inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--fg)] transition-transform hover:scale-[1.04] disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
            >
              <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
              <span>Back</span>
            </button>
          </div>

          <div className="mt-6 flex items-start gap-5">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent-line)] bg-[var(--accent-soft)] text-2xl font-semibold text-[var(--accent)] shadow-sm">
              {initial}
              {isDirty && (
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {originalValues.course_code && (
                  <span className="inline-flex items-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                    {originalValues.course_code}
                  </span>
                )}
                {isDirty && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-xs font-medium text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Unsaved changes
                  </span>
                )}
              </div>

              <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-[var(--fg)]">
                {originalValues.name || 'Untitled Section'}
              </h1>
              {originalValues.course_name && (
                <p className="mt-1 truncate text-sm text-[var(--muted)]">
                  {originalValues.course_name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Form Body & Roster ---------- */}
      <form
        onSubmit={handleUpdate}
        className="flex flex-1 flex-col px-8 py-8 gap-8 max-w-full"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field
            label="Section Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={isBusy}
            placeholder="e.g. BS DS Fall 2026 – Afternoon – B"
            className="md:col-span-2"
          />
          <Field
            label="Course Code"
            name="course_code"
            value={form.course_code}
            onChange={handleChange}
            disabled={isBusy}
            placeholder="e.g. DS-207"
          />
          <Field
            label="Course Name"
            name="course_name"
            value={form.course_name}
            onChange={handleChange}
            disabled={isBusy}
            placeholder="e.g. Intro To Data Science"
          />
        </div>

        {/* ---------- Enrolled Students Roster ---------- */}
        <div className="pt-6 border-t border-[var(--line)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--fg)] flex items-center gap-2">
              <Users size={18} className="text-[var(--accent)]" />
              <span>Enrolled Students</span>
            </h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]">
              {enrolledStudents.length} {enrolledStudents.length === 1 ? 'Student' : 'Students'}
            </span>
          </div>

          {enrolledStudents.length === 0 ? (
            <div className="rounded-[2rem] border border-[var(--line)] bg-white p-8 text-center text-[var(--muted)] shadow-sm">
              <Users size={32} className="mx-auto mb-2 opacity-30 text-[var(--accent)]" />
              <p className="text-sm font-medium">No students enrolled in this section yet.</p>
              <p className="text-xs text-[var(--muted)] mt-1">Enroll students using the Enrollment tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledStudents.map((student) => (
                <div
                  key={student.id || student.registration_number}
                  className="group relative flex items-center justify-between p-4 rounded-2xl border border-[var(--line)] bg-white shadow-sm hover:border-[var(--accent-line)] transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                      {(student.name || '?').trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[var(--fg)] truncate">{student.name}</h4>
                      <p className="text-xs text-[var(--accent)] font-mono truncate">{student.registration_number}</p>
                      <p className="text-[11px] text-[var(--muted)] truncate">{student.department || 'General'}</p>
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                    <UserCheck size={12} />
                    Enrolled
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* ---------- Action Bar ---------- */}
        <div className="mt-auto flex flex-col-reverse items-stretch justify-between gap-4 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={isBusy}
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/5 px-6 py-3 text-sm font-medium text-rose-600 transition-all hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={16} />
            <span>Delete Section</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm(originalValues)}
              disabled={!isDirty || isBusy}
              className="rounded-full px-5 py-3 text-sm font-medium text-[var(--muted)] transition-all hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={!isDirty || isBusy}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--btn-bg)] px-7 py-3 text-sm font-medium text-[var(--btn-fg)] transition-transform hover:scale-[1.02] shadow-sm disabled:cursor-not-allowed disabled:bg-[var(--card)] disabled:text-[var(--muted)] disabled:shadow-none"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Update</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {confirmOpen && (
        <DeleteConfirmModal
          sectionName={originalValues.name}
          deleting={deleting}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={performDelete}
        />
      )}
    </div>
  );
}

function DeleteConfirmModal({ sectionName, deleting, onCancel, onConfirm }) {
  const [holding, setHolding] = useState(false);
  const timeoutRef = useRef(null);

  const clearHold = () => {
    setHolding(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startHold = (e) => {
    if (deleting) return;
    e?.preventDefault?.();
    setHolding(true);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      onConfirm();
    }, HOLD_DURATION);
  };

  useEffect(() => {
    const handleUp = () => clearHold();
    const handleKey = (e) => {
      if (e.key === 'Escape' && !deleting) onCancel();
    };
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    window.addEventListener('touchcancel', handleUp);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
      window.removeEventListener('touchcancel', handleUp);
      window.removeEventListener('keydown', handleKey);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [deleting, onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !deleting) onCancel();
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-[var(--line)] bg-white p-8 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-600">
            <AlertTriangle size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-[var(--fg)]">
              Delete this section?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              You're about to permanently delete{' '}
              <span className="font-semibold text-[var(--fg)]">
                {sectionName || 'this section'}
              </span>
              . This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-full bg-[var(--card)] px-6 py-3 text-sm font-medium text-[var(--fg)] transition-transform hover:scale-[1.02] disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="button"
            onMouseDown={startHold}
            onMouseLeave={clearHold}
            onTouchStart={startHold}
            onTouchEnd={clearHold}
            disabled={deleting}
            className="relative overflow-hidden rounded-full border border-rose-500/40 bg-rose-500/10 px-7 py-3 text-sm font-medium text-rose-600 transition-all hover:bg-rose-500/20 disabled:opacity-80"
          >
            <span
              className="absolute inset-y-0 left-0 bg-rose-500/30 pointer-events-none"
              style={{
                width: holding ? '100%' : '0%',
                transition: holding
                  ? `width ${HOLD_DURATION}ms linear`
                  : 'none',
              }}
            />
            <span className="relative z-10 font-semibold">
              {deleting ? 'Deleting…' : 'Hold to Delete'}
            </span>
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--muted)] font-mono">
          Hold for {HOLD_DURATION / 1000}s to confirm
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, disabled, placeholder, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        htmlFor={name}
        className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-sm text-[var(--fg)] placeholder-[var(--muted)] outline-none transition-all focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent-soft)] disabled:opacity-60"
      />
    </div>
  );
}

export default SectionDetails;