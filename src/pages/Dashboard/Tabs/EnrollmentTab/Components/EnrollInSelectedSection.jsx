import React, { useState, useRef, useEffect } from 'react';
import api from '../../../../../services/axios.js';

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

  // 1. Start Class Session via Django API on Mount (using AbortController)
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
        // Fallback session so testing camera/enrollment can still proceed
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

  // 2. Initialize Webcam Feed & Enumerate Devices upon Session Activation
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

        // Enumerate video input devices after permission is granted
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
    const wsHost = '127.0.0.1:8000';
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
    <div className="w-full h-full flex flex-col items-start justify-start text-slate-100 overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header Bar */}
      <div className="w-full h-[10%] min-h-[60px] flex items-center justify-between px-4 border-b border-cyan-400/20 bg-slate-900/40">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 text-sm font-medium hover:bg-cyan-400/20 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Sections
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-200">
                {section.course_code || 'COURSE'}
              </span>
              <h1 className="text-lg font-bold tracking-tight text-slate-100 truncate max-w-md">
                {section.name || 'Section Enrollment'}
              </h1>
            </div>
            <p className="text-xs text-slate-400 truncate">{section.course_name || 'Secure Face Enrollment'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {sessionActive ? 'Session Active' : 'Initializing Session...'}
          </div>
          <button
            onClick={handleEndSession}
            className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm font-medium hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            Finish & Close Session
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full h-[90%] grid grid-cols-1 lg:grid-cols-10 gap-5 pt-4 overflow-hidden px-4 pb-4">
        
        {/* LEFT SIDE: 70% */}
        <div className="lg:col-span-7 h-full flex flex-col gap-4 overflow-y-auto pr-1">
          
          {/* Webcam Box & Device Selector */}
          <div className="relative w-full aspect-video max-h-[340px] rounded-2xl border border-cyan-400/30 bg-slate-950 overflow-hidden shadow-[0_10px_40px_-10px_rgba(34,211,238,0.15)] flex items-center justify-center">
            {loadingSession ? (
              <div className="absolute inset-flex flex-col items-center justify-center p-6 text-center text-cyan-300 bg-slate-950/90 z-30">
                <svg className="animate-spin w-8 h-8 mb-3 text-cyan-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm font-medium">Creating session and establishing camera feed...</p>
              </div>
            ) : cameraError ? (
              <div className="absolute inset-flex flex-col items-center justify-center p-6 text-center text-rose-400 bg-slate-950/90 z-20">
                <svg className="w-10 h-10 mb-2 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
                </svg>
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

            <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-cyan-400/30 backdrop-blur-md text-[11px] text-cyan-200 font-mono z-10">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              LIVE AI FEED (1 FACE REQ.)
            </div>

            {/* Camera Selection Dropdown */}
            {videoDevices.length > 0 && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/85 border border-cyan-400/30 backdrop-blur-md z-20 shadow-lg">
                <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="bg-transparent text-xs text-cyan-200 focus:outline-none cursor-pointer max-w-[180px] truncate"
                >
                  {videoDevices.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId} className="bg-slate-900 text-slate-100">
                      {device.label || `Camera ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-36 h-48 rounded-3xl border-2 border-dashed border-cyan-400/40" />
            </div>
          </div>

          {/* Student Form */}
          <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 p-5 backdrop-blur-sm">
            <h2 className="text-base font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              Student Enrollment Details
            </h2>

            <form onSubmit={handleCaptureAndEnroll} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Student Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full rounded-xl border border-cyan-400/25 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Registration No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BSCS-2021-042"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full rounded-xl border border-cyan-400/25 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-cyan-400/25 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {statusMessage.text && (
                <div className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                  statusMessage.type === 'error' 
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' 
                    : statusMessage.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    statusMessage.type === 'error' 
                      ? 'bg-rose-400' 
                      : statusMessage.type === 'success'
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-cyan-400 animate-ping'
                  }`} />
                  <span className="truncate">{statusMessage.text}</span>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={enrolling || loadingSession}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-semibold text-sm shadow-[0_4px_20px_rgba(34,211,238,0.3)] hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {enrolling ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Queueing Task for AI Worker...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      Capture & Enroll Student
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* RIGHT SIDE: 30% - Enrolled Roster */}
        <div className="lg:col-span-3 h-full flex flex-col rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 p-4 backdrop-blur-sm overflow-hidden">
          
          <div className="flex items-center justify-between pb-3 border-b border-cyan-400/20">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Enrolled in Session
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">
              {enrolledStudents.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pt-3 space-y-2.5 pr-1">
            {enrolledStudents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                <svg className="w-8 h-8 mb-2 opacity-40 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <p className="text-xs text-slate-400">No students enrolled yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">Captured students will appear here instantly.</p>
              </div>
            ) : (
              enrolledStudents.map((student) => (
                <div
                  key={student.uuid || student.id || student.registration_number}
                  className="group relative flex items-center justify-between p-3 rounded-xl border border-cyan-400/20 bg-slate-950/60 hover:border-cyan-400/40 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-xs font-bold text-cyan-200">
                      {(student.name || '?').trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-100 truncate">{student.name}</h4>
                      <p className="text-[11px] text-cyan-400/80 font-mono truncate">{student.registration_number}</p>
                      <p className="text-[10px] text-slate-400 truncate">{student.department || 'General'}</p>
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
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