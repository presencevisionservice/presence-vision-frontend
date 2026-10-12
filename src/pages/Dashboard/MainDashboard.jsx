import { useEffect, useState } from 'react';
import { LayoutDashboard, Layers, BookOpen, ScanFace, ShieldX, Loader2 } from 'lucide-react';
import OverviewTab from './Tabs/OverviewTab';
import SectionsTab from './Tabs/SectionsTab/SectionsTab';
import EnrollmentTab from './Tabs/EnrollmentTab/EnrollmentTab';
import AttendanceTab from './Tabs/AttendanceTab/AttendanceTab';
import api from '../../services/axios';
import { THEME } from '../../pages/theme';

/* ── Nav config ─────────────────────────────────────────────── */
const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, blurb: 'Welcome back, Instructor' },
  { id: 'sections', label: 'Sections', icon: Layers, blurb: 'Manage your class sections' },
  { id: 'enrollment', label: 'Enrollment', icon: Layers, blurb: 'Enroll Students In Sections' },
  { id: 'attendance', label: 'Attendance', icon: Layers, blurb: 'Strat Section Attendance' },
];

/* ── Tab registry: id → component ───────────────────────────── */
const TAB_COMPONENTS = {
  overview: OverviewTab,
  sections: SectionsTab,
  enrollment: EnrollmentTab,
  attendance: AttendanceTab,
};

function MainDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [staffDetails, setStaffDetails] = useState({});
  const [fetchingStaffDetails, setFetchingStaffDetails] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let canceled = false;

    (async () => {
      try {
        const response = await api.get('api/teacher/details', {
          signal: controller.signal,
        });

        if (canceled) return;

        // Access granted only if the request succeeded
        setStaffDetails(response.data);
        setAccessGranted(true);
      } catch (error) {
        if (canceled) return;

        if (error?.name !== 'CanceledError') {
          console.log(error);

          // Access denied on any real error (401, 403, network, etc.)
          setAccessGranted(false);
        }
      } finally {
        if (!canceled) setFetchingStaffDetails(false);
      }
    })();

    return () => {
      canceled = true;
      controller.abort();
    };
  }, []);

  /* ── 1. LOADING STATE ───────────────────────────────────────── */
  if (fetchingStaffDetails) {
    return (
      <section style={THEME} className="w-full h-screen grid place-items-center bg-[var(--bg)] text-[var(--fg)] antialiased font-['Poppins',sans-serif]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-[var(--accent)] animate-spin" />
          <p className="text-sm text-[var(--muted)] tracking-wide">Fetching Details...</p>
        </div>
      </section>
    );
  }

  /* ── 2. ACCESS DENIED ───────────────────────────────────────── */
  if (!accessGranted) {
    return (
      <section style={THEME} className="w-full h-screen grid place-items-center bg-[var(--bg)] text-[var(--fg)] antialiased font-['Poppins',sans-serif]">
        <div className="flex flex-col items-center gap-5 text-center px-6">
          <div className="h-16 w-16 rounded-2xl grid place-items-center border border-rose-500/20 bg-rose-500/10 shadow-sm">
            <ShieldX size={30} className="text-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">Access Denied</h1>
            <p className="text-sm text-[var(--muted)] mt-1.5 max-w-xs">
              You don't have permission to view this dashboard. Contact your administrator.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ── 3. GRANTED → DASHBOARD ─────────────────────────────────── */
  const activeNav = NAV.find((item) => item.id === activeTab) ?? NAV[0];
  const ActiveTabComponent = TAB_COMPONENTS[activeTab] ?? OverviewTab;

  return (
    <section style={THEME} className="w-full h-screen flex items-stretch bg-[var(--bg)] text-[var(--fg)] antialiased [overflow-x:clip] font-['Poppins',sans-serif]">

      {/* ── Sidebar ── */}
      <aside className="
        w-16 sm:w-20 lg:w-64
        shrink-0 h-full
        border-r border-[var(--line)] bg-white/70 backdrop-blur-xl
        flex flex-col p-3 sm:p-4 lg:p-6
        transition-[width] duration-300
      ">
        <div className="flex items-center justify-center lg:justify-start gap-2.5 mb-8 lg:mb-10 lg:px-2">
          <span className="grid h-9 w-9 place-items-center flex items-center justify-center">
            <img src="/logo.png" className="w-9/10 h-9/10 object-center object-contain" alt="" />
          </span>
          <h2 className="hidden lg:block text-base font-semibold tracking-tight whitespace-nowrap text-[var(--fg)]">
            Presence
          </h2>
        </div>

        <nav className="flex flex-col gap-2">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                title={label}
                className={`group flex items-center justify-center lg:justify-start gap-3 rounded-2xl
                  px-3 lg:px-4 py-3 text-sm font-medium transition-all duration-300 border ${
                    active
                      ? 'border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm'
                      : 'border-transparent text-[var(--muted)] hover:text-[var(--fg)] hover:bg-black/[0.03]'
                  }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 ${
                    active
                      ? 'text-[var(--accent)]'
                      : 'text-[var(--muted)] group-hover:text-[var(--fg)] transition-colors'
                  }`}
                />
                <span className="hidden lg:inline whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main Column ── */}
      <div className="flex-1 h-full flex flex-col min-w-0 bg-[var(--bg)]">

        <header className="h-20 shrink-0 border-b border-[var(--line)] flex items-center justify-between px-8 bg-white/50 backdrop-blur-md">
          <div>
            <h1 className="text-xl font-semibold tracking-tight capitalize text-[var(--fg)]">{activeNav.label}</h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">{activeNav.blurb}</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
              Fall 2026
            </span>
            <div className="h-9 w-9 rounded-full bg-[var(--accent)] text-white grid place-items-center text-sm font-semibold shadow-sm">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-[var(--bg)]">
          <ActiveTabComponent
            isActive
            staffDetails={staffDetails}
            fetchingStaffDetails={fetchingStaffDetails}
          />
        </main>
      </div>
    </section>
  );
}

export default MainDashboard;