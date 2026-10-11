import React from 'react';
import { BookOpen, Users, TrendingUp, ArrowUpRight } from 'lucide-react';

const MOCK_SECTIONS = [
  {
    id: 1,
    name: '2026 Fall Morning Section A',
    course: { code: 'CS-301', name: 'Data Science' },
    enrolled_count: 45,
  },
  {
    id: 2,
    name: '2026 Fall Afternoon Section B',
    course: { code: 'CS-302', name: 'Software Engineering' },
    enrolled_count: 38,
  },
];

export default function OverviewTab({ onSelectSection }) {
  const totalEnrolled = MOCK_SECTIONS.reduce((a, s) => a + s.enrolled_count, 0);

  const METRICS = [
    { label: 'Assigned Classes', value: MOCK_SECTIONS.length, icon: BookOpen, valueClass: 'text-[var(--fg)]' },
    { label: 'Total Enrolled Students', value: totalEnrolled, icon: Users, valueClass: 'text-[var(--fg)]' },
    { label: 'Avg. Attendance Rate', value: '91.4%', icon: TrendingUp, valueClass: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-10">

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {METRICS.map(({ label, value, icon: Icon, valueClass }) => (
          <div
            key={label}
            className="group relative rounded-[2rem] border border-[var(--line)] bg-white/70 p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-[var(--accent-line)] hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                {label}
              </p>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)] transition-transform group-hover:scale-110">
                <Icon size={20} />
              </span>
            </div>
            <p className={`mt-4 text-4xl font-semibold tracking-tight ${valueClass}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Sections Grid ── */}
      <div>
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
              Your Courses
            </span>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--fg)]">
              Taught Sections
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_SECTIONS.map((sec) => (
            <div
              key={sec.id}
              className="group rounded-[2.5rem] border border-[var(--line)] bg-white p-8 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.08)] transition-all duration-300 hover:border-[var(--accent-line)] hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold px-3 py-1 bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)] rounded-full tracking-wide">
                      {sec.course.code}
                    </span>
                    <h4 className="text-xl font-semibold text-[var(--fg)] mt-3 group-hover:text-[var(--accent)] transition-colors">
                      {sec.course.name}
                    </h4>
                    <p className="text-sm text-[var(--muted)] mt-1">{sec.name}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] bg-[var(--card)] px-3 py-1 rounded-full border border-[var(--line)]">
                    <Users size={13} className="text-[var(--accent)]" />
                    {sec.enrolled_count} students
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => onSelectSection?.(sec)}
                  className="group/btn w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] text-sm font-medium transition-transform hover:scale-[1.02] shadow-sm"
                >
                  <span>Manage Roster</span>
                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}