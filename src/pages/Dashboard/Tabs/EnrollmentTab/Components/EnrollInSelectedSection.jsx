import React, { useState, useRef, useEffect } from 'react';
import api from '../../../../../services/axios.js';
import { ArrowLeft, UserPlus, Users, AlertCircle, CheckCircle2, Loader2, Camera, ShieldCheck, Radio } from 'lucide-react';

function EnrollInSelectedSection({ section, onClose, onSuccess }) {
  const [session, setSession] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  
  // Student Form State
  const [studentName, setStudentName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [department, setDepartment] = useState('');
  
  // Camera & Device State
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [cameraError, setCameraError] = useState(null);

  // Feedback & Roster State
  const [enrolledStudents, setEnrolledStudents] = useState(section?.enrolled_students || []);
  const [enrolling, setEnrolling] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);

  const sectionId = section?.id || section?._id;

  // 1. Start Class Session via Django API on Mount
  useEffect(() => {
    const controller = new AbortController();

    const startSession = async () => {
      setLoadingSession(true);
      setStatusMessage({ type: 'info', text: 'Initializing session with server...' });
      
      try {
        const response = await api.post('/api/sessions/start/', {
          section_id: sectionId
        }, {
          signal: controller.signal
        });

        const sessionData = response.data;
        setSession(sessionData);
        setSessionActive(true);
        setStatusMessage({ type: 'success', text: 'Session created successfully! Starting camera feed...' });

        if (sessionData?.section?.enrolled_students) {
          setEnrolledStudents(sessionData.section.enrolled_students);
        }
      } catch (error) {
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return;
        
        console.error('Failed to start session:', error);
        setSession({ id: sectionId || `session_${Date.now()}` });
        setSessionActive(true);
        setStatusMessage({ type: 'success', text: 'Session active (offline fallback). Starting camera feed...' });
      } finally {
        setLoadingSession(false);
      }
    };

    startSession();

    return () => {
      controller.abort();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [sectionId]);

  // 2. Initialize Webcam Feed & Enumerate Devices
  useEffect(() => {
    if (!sessionActive) return;

    let activeStream = null;

    const startCamera = async () => {
      try {
        setCameraError(null);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const constraints = {
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = stream;
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.error('Video autoplay error:', playErr);
          }
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((device) => device.kind === 'videoinput');
        
        setVideoDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
          const currentTrackSettings = stream.getVideoTracks()[0]?.getSettings();
          setSelectedDeviceId(currentTrackSettings?.deviceId || videoInputs[0].deviceId);
        }

      } catch (err) {
        console.error('Webcam access error:', err);
        setCameraError('Unable to access webcam. Please check browser camera permissions.');
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [sessionActive, selectedDeviceId]);

  // 3. Setup WebSocket for real-time enrollment broadcast
  useEffect(() => {
    const sessionId = session?.id;
    if (!sessionId) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = 'presence-backend-hnix.onrender.com';
    const wsUrl = `${wsProtocol}//${wsHost}/ws/session/${sessionId}/`;

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'enrollment_event') {
            if (data.status === 'success' && data.student_data) {
              setEnrolledStudents((prev) => {
                const sUuid = data.student_data.uuid || data.student_data.id;
                if (prev.some((s) => (s.uuid === sUuid || s.id === sUuid))) return prev;
                return [data.student_data, ...prev];
              });
              setStatusMessage({ type: 'success', text: data.message || 'Student enrolled successfully!' });
              setStudentName('');
              setRegistrationNumber('');
              setDepartment('');
            } else if (data.status === 'failed') {
              setStatusMessage({ type: 'error', text: data.message || 'Enrollment check failed.' });
            }
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      socket.onerror = (err) => {
        console.error('WebSocket error:', err);
      };

      return () => {
        socket.close();
      };
    } catch (e) {
      console.log('WebSocket connection skipped:', e);
    }
  }, [session]);

  // 4. Capture Frame & Push to Redis Queue via Django
  const handleCaptureAndEnroll = async (e) => {
    e.preventDefault();
    if (!studentName || !registrationNumber) {
      setStatusMessage({ type: 'error', text: 'Please enter Student Name and Registration Number.' });
      return;
    }

    if (!videoRef.current || !canvasRef.current) {
      setStatusMessage({ type: 'error', text: 'Webcam feed not ready.' });
      return;
    }

    setEnrolling(true);
    setStatusMessage({ type: 'info', text: 'Capturing frame and queueing for AI verification...' });

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Frame = canvas.toDataURL('image/jpeg', 0.85);

      const payload = {
        action: 'enroll',
        session_id: session?.id,
        student_name: studentName.trim(),
        registration_number: registrationNumber.trim(),
        department: department.trim() || 'General',
        frame_data: base64Frame
      };

      await api.post('/api/enroll/', payload);
      setStatusMessage({ type: 'info', text: 'Task queued. Awaiting AI worker validation...' });
    } catch (err) {
      console.error('Enrollment submission error:', err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to queue task.';
      setStatusMessage({ type: 'error', text: errMsg });
    } finally {
      setEnrolling(false);
    }
  };

  // 5. End Session
  const handleEndSession = async () => {
    try {
      if (session?.id && !String(session.id).startsWith('session_')) {
        await api.post(`/api/sessions/${session.id}/end/`);
      }
    } catch (err) {
      console.error('Error ending session:', err);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    onSuccess();
  };

  return (
    <div className="w-full h-full flex flex-col items-start justify-start text-[var(--fg)] bg-[var(--bg)] overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header Bar */}
      <div className="w-full h-[10%] min-h-[64px] flex items-center justify-between px-6 border-b border-[var(--line)] bg-white/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--line)] bg-white text-sm font-medium text-[var(--fg)] hover:border-[var(--accent-line)] transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Sections</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                {section.course_code || 'COURSE'}
              </span>
              <h1 className="text-base font-semibold tracking-tight text-[var(--fg)] truncate max-w-md">
                {section.name || 'Section Enrollment'}
              </h1>
            </div>
            <p className="text-xs text-[var(--muted)] truncate">{section.course_name || 'Secure Face Enrollment'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {sessionActive ? 'Session Active' : 'Initializing Session...'}
          </div>
          <button
            onClick={handleEndSession}
            className="px-4 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-700 text-xs font-medium hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            Finish & Close Session
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full h-[90%] grid grid-cols-1 lg:grid-cols-10 gap-5 pt-5 overflow-hidden px-6 pb-6">
        
        {/* LEFT SIDE: 70% - Expanded Webcam & Compact Single-Row Form (No Scrolling) */}
        <div className="lg:col-span-7 h-full flex flex-col gap-3 overflow-hidden pr-1">
          
          {/* Webcam Box & Device Selector */}
          <div className="relative w-full flex-1 min-h-0 rounded-xl border border-[var(--line)] bg-slate-950 overflow-hidden shadow-lg flex items-center justify-center">
            {loadingSession ? (
              <div className="absolute inset-flex flex-col items-center justify-center p-6 text-center text-[var(--accent)] bg-slate-950/90 z-30">
                <Loader2 className="animate-spin w-8 h-8 mb-3 text-[var(--accent)]" />
                <p className="text-sm font-medium text-white">Creating session and establishing camera feed...</p>
              </div>
            ) : cameraError ? (
              <div className="absolute inset-flex flex-col items-center justify-center p-6 text-center text-rose-400 bg-slate-950/90 z-20">
                <AlertCircle className="w-10 h-10 mb-2 opacity-80" />
                <p className="text-sm font-medium">{cameraError}</p>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            )}

            <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-xs text-white font-mono z-10">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
              LIVE AI FEED (1 FACE REQ.)
            </div>

            {/* Broadcasting Status Toast Overlay (Bottom-Left of Video) */}
            {statusMessage.text && (
              <div className={`absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md p-2.5 rounded-xl text-xs font-medium border flex items-center gap-2 backdrop-blur-md z-20 shadow-lg ${
                statusMessage.type === 'error' 
                  ? 'border-rose-500/30 bg-slate-900/90 text-rose-300' 
                  : statusMessage.type === 'success'
                  ? 'border-emerald-500/30 bg-slate-900/90 text-emerald-300'
                  : 'border-[var(--accent-line)] bg-slate-900/90 text-[var(--accent)]'
              }`}>
                <Radio size={14} className={statusMessage.type === 'success' ? 'animate-pulse text-emerald-400' : 'text-[var(--accent)]'} />
                <span className="truncate">{statusMessage.text}</span>
              </div>
            )}

            {/* Camera Selection Dropdown */}
            {videoDevices.length > 0 && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/20 backdrop-blur-md z-20 shadow-lg">
                <Camera size={14} className="text-white shrink-0" />
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer max-w-[160px] truncate"
                >
                  {videoDevices.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId} className="bg-slate-900 text-white">
                      {device.label || `Camera ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-36 h-48 rounded-3xl border-2 border-dashed border-white/40" />
            </div>
          </div>

          {/* Compact Student Form in Single Row */}
          <div className="rounded-xl border border-[var(--line)] bg-white p-3 shrink-0">
            <form onSubmit={handleCaptureAndEnroll} className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  required
                  placeholder="Student Name *"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-xs text-[var(--fg)] placeholder-[var(--muted)] outline-none transition focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent-soft)]"
                />
              </div>

              <div className="flex-1 w-full">
                <input
                  type="text"
                  required
                  placeholder="Registration No. *"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-xs text-[var(--fg)] placeholder-[var(--muted)] outline-none transition focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent-soft)]"
                />
              </div>

              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-xs text-[var(--fg)] placeholder-[var(--muted)] outline-none transition focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent-soft)]"
                />
              </div>

              <button
                type="submit"
                disabled={enrolling || loadingSession}
                className="w-full sm:w-auto shrink-0 px-5 py-2.5 rounded-xl bg-[var(--btn-bg)] text-[var(--btn-fg)] font-medium text-xs transition-transform hover:scale-[1.02] shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {enrolling ? (
                  <>
                    <Loader2 className="animate-spin h-3.5 w-3.5 text-white" />
                    <span>Queueing...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={14} />
                    <span>Enroll</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT SIDE: 30% - Enrolled Roster */}
        <div className="lg:col-span-3 h-full flex flex-col rounded-[2.5rem] border border-[var(--line)] bg-white p-5 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.08)] overflow-hidden">
          
          <div className="flex items-center justify-between pb-3.5 border-b border-[var(--line)]">
            <h3 className="text-sm font-semibold text-[var(--fg)] flex items-center gap-2">
              <Users size={16} className="text-[var(--accent)]" />
              <span>Enrolled in Session</span>
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]">
              {enrolledStudents.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pt-4 space-y-2.5 pr-1">
            {enrolledStudents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[var(--muted)]">
                <Users size={32} className="mb-2 opacity-30 text-[var(--accent)]" />
                <p className="text-xs text-[var(--muted)]">No students enrolled yet.</p>
                <p className="text-[11px] text-[var(--muted)] mt-1">Captured students will appear here instantly.</p>
              </div>
            ) : (
              enrolledStudents.map((student) => (
                <div
                  key={student.uuid || student.id || student.registration_number}
                  className="group relative flex items-center justify-between p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--accent-line)] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
                      {(student.name || '?').trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[var(--fg)] truncate">{student.name}</h4>
                      <p className="text-[11px] text-[var(--accent)] font-mono truncate">{student.registration_number}</p>
                      <p className="text-[10px] text-[var(--muted)] truncate">{student.department || 'General'}</p>
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                    Enrolled
                  </span>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default EnrollInSelectedSection;