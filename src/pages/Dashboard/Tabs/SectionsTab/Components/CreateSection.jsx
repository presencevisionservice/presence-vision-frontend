import React, { useState } from 'react';
import { BarLoader } from 'react-spinners';
import api from '../../../../../services/axios';
import { Plus, X } from 'lucide-react';

function CreateSection({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    try {
      await api.post('api/teacher/sections/', data);
      onClose();
    } catch (err) {
      console.log(err);
      setError('Failed to create section. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-[var(--bg)] text-[var(--fg)]">
      {/* ---------- Hero / Header ---------- */}
      <div className="relative overflow-hidden border-b border-[var(--line)] bg-white/50 backdrop-blur-md">
        <div className="relative px-8 pt-7 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--muted)]">
              <span>Sections</span>
              <span className="text-[var(--line)]">/</span>
              <span className="text-[var(--accent)] font-semibold">Create</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="group inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--fg)] transition-transform hover:scale-[1.04] disabled:opacity-40 shadow-sm"
            >
              <X size={15} className="transition-transform group-hover:rotate-90" />
              <span>Close</span>
            </button>
          </div>

          <div className="mt-6 flex items-start gap-5">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm">
              <Plus size={28} />
            </div>

            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                New Section
              </span>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--fg)]">
                Create a Section
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Fill in the details below to add a new section.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Form Body ---------- */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col px-8 py-8 gap-6 max-w-full"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field
            label="Course Code"
            name="course_code"
            id="coursecode"
            placeholder="e.g. CS-XXX"
            disabled={loading}
          />
          <Field
            label="Course Name"
            name="course_name"
            id="coursename"
            placeholder="e.g. Programming Fundamentals"
            disabled={loading}
          />
          <Field
            label="Section Name"
            name="name"
            id="name"
            placeholder="e.g. BS DS Fall 2026 – Afternoon – B"
            disabled={loading}
            className="md:col-span-2"
          />
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
            <span>{error}</span>
          </div>
        )}

        {/* ---------- Action Bar ---------- */}
        <div className="mt-auto flex items-center justify-end gap-4 border-t border-[var(--line)] pt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full px-5 py-3 text-sm font-medium text-[var(--muted)] transition-all hover:text-[var(--fg)] disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--btn-bg)] px-7 py-3 text-sm font-medium text-[var(--btn-fg)] transition-transform hover:scale-[1.02] shadow-sm disabled:opacity-80"
          >
            {loading ? (
              <BarLoader color="#009ae7" width={80} height={3} />
            ) : (
              <>
                <Plus size={16} />
                <span>Create</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, id, placeholder, disabled, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        htmlFor={id || name}
        className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
      >
        {label}
      </label>
      <input
        id={id || name}
        name={name}
        type="text"
        placeholder={placeholder}
        required
        disabled={disabled}
        autoComplete="off"
        className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-sm text-[var(--fg)] placeholder-[var(--muted)] outline-none transition-all focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent-soft)] disabled:opacity-60"
      />
    </div>
  );
}

export default CreateSection;