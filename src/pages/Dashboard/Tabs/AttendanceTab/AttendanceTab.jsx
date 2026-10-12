import React, { useState, useCallback, useEffect } from 'react';
import api from '../../../../services/axios.js';
import TakeSectionAttendance from './Components/TakeSectionAttendance';
import { Layers, ArrowUpRight } from 'lucide-react';

export default function AttendanceTab({ isActive = true, staffDetails }) {
    const [sections, setSections] = useState([]);
    const [loadingSections, setLoadingSections] = useState(false);
    const [creationTabOpen, setCreationTabOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);

    const sectionCount = sections.length;

    const fetchSections = useCallback(async (signal) => {
        setLoadingSections(true);
        try {
            const response = await api.get('api/teacher/sections', { signal });
            const fetchedSections = Array.isArray(response.data)
                ? response.data
                : (response.data?.sections || []);
            setSections(fetchedSections);
        } catch (error) {
            if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
                console.error('Failed to load sections:', error);
            }
        } finally {
            setLoadingSections(false);
        }
    }, []);

    useEffect(() => {
        if (!isActive) return;
        const controller = new AbortController();
        fetchSections(controller.signal);
        return () => controller.abort();
    }, [isActive, fetchSections]);

    const handleCloseCreateSection = () => {
        setCreationTabOpen(false);
        fetchSections();
    };

    if (selectedSection) {
        return (
            <TakeSectionAttendance
                section={selectedSection}
                onClose={() => setSelectedSection(null)}
                onSuccess={() => {
                    setSelectedSection(null);
                    fetchSections();
                }}
            />
        );
    }

    if (loadingSections && sections.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                Loading sections...
            </div>
        );
    }

    if (sectionCount === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center text-center max-w-sm px-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm">
                        <Layers size={28} />
                    </div>

                    <h1 className="mt-5 text-xl font-semibold text-[var(--fg)]">
                        No sections yet
                    </h1>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                        Create your first section in 'Sections' Tab to get started.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col items-start justify-start">
            <div className="w-full flex items-center justify-between pb-4 border-b border-[var(--line)]">
                <h1 className="text-xl font-semibold tracking-tight text-[var(--fg)]">
                    Select a Section to Start Attendance
                </h1>
                <span className="text-sm font-medium text-[var(--muted)]">
                    Total Sections - {sectionCount}
                </span>
            </div>

            <div className="w-full flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 pt-6 overflow-y-auto pr-1 items-start content-start">
                {sections.map((section) => (
                    <button
                        key={section.id ?? section._id ?? section.name}
                        type="button"
                        onClick={() => setSelectedSection(section)}
                        className="group relative overflow-hidden text-left rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-line)] hover:shadow-xl cursor-pointer"
                    >
                        <div className="relative flex items-start justify-between gap-3">
                            <span className="inline-flex items-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                                {section.course_code || 'COURSE'}
                            </span>

                            <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--card)] text-[var(--muted)] transition-all duration-300 group-hover:bg-[var(--accent)] group-hover:text-white">
                                <ArrowUpRight size={15} />
                            </span>
                        </div>

                        <h3 className="relative mt-4 text-lg font-semibold text-[var(--fg)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                            {section.name || 'Untitled Section'}
                        </h3>

                        <p className="relative mt-1 text-sm text-[var(--muted)] line-clamp-2">
                            {section.course_name || '—'}
                        </p>

                        <div className="relative mt-5 h-px w-full bg-[var(--line)]" />

                        <div className="relative mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
                                    {(section.name || '?').trim().charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs text-[var(--muted)]">Tap to Start Attendance Session</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}