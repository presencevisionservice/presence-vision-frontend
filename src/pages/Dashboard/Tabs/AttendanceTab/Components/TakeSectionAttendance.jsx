import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../../../../../services/axios.js';
import { 
  ArrowLeft, Users, AlertCircle, CheckCircle2, 
  Loader2, Camera, Radio, Clock, UserCheck, ShieldAlert 
} from 'lucide-react';

function TakeSectionAttendance({ section, onClose, onSuccess }) {
  const [session, setSession] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  
  // Camera & Device State
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(true);

  // Attendance & Warning Logs State
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('present'); // 'present' | 'warnings'

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const intervalRef = useRef(null);

  const sectionId = section?.id || section?._id;

  // 1. Start Class Session & Fetch Existing Logs on Mount
  useEffect(() => {
    const controller = new AbortController();

    const initializeSessionAndLogs = async () => {
      setLoadingSession(true);
      setStatusMessage({ type: 'info', text: 'Initializing attendance session...' });
      
      try {
        // Start active session
        const sessionResponse = await api.post('/api/sessions/start/', {
          section_id: sectionId
        }, {
          signal: controller.signal
        });

        const sessionData = sessionResponse.data;
        setSession(sessionData);
        setSessionActive(true);

        // Fetch pre-existing logs for this session if any
        if (sessionData?.id) {
          try {
            const logsResponse = await api.get(`/api/sessions/${sessionData.id}/logs/`, {
              signal: controller.signal
            });
            if (Array.isArray(logsResponse.data)) {
              const formattedLogs = logsResponse.data.map(log => ({
                student_name: log.student?.name,
                registration_number: log.student?.registration_number,
                department: log.student?.department,
                timestamp: log.timestamp
              }));
              setAttendanceLogs(formattedLogs);
            }
          } catch (logErr) {
            console.warn('Could not fetch existing session logs:', logErr);
          }
        }

        setStatusMessage({ type: 'success', text: 'Session active. AI vision stream running...' });
      } catch (error) {
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return;
        
        console.error('Failed to start session:', error);
        setSession({ id: sectionId || `session_${Date.now()}` });
        setSessionActive(true);
        setStatusMessage({ type: 'success', text: 'Session active (offline fallback). Starting camera...' });
      } finally {
        setLoadingSession(false);
      }
    };

    initializeSessionAndLogs();

    return () => {
      controller.abort();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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

  // 3. Setup WebSocket for real-time attendance feed & broadcasts
  useEffect(() => {
    const sessionId = session?.id;
    if (!sessionId) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.host.includes('localhost') ? 'localhost:8000' : 'presence-backend-hnix.onrender.com';
    const wsUrl = `${wsProtocol}//${wsHost}/ws/attendance/${sessionId}/`;

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'attendance_update') {
            if (data.status === 'success') {
              setAttendanceLogs((prev) => {
                // Prevent duplicate entries for the same student in a session
                if (prev.some((log) => log.registration_number === data.registration_number)) {
                  return prev;
                }
                return [{
                  student_name: data.student_name,
                  registration_number: data.registration_number,
                  department: data.department,
                  timestamp: data.timestamp || new Date().toISOString()
                }, ...prev];
              });
              setStatusMessage({ 
                type: 'success', 
                text: `Attendance marked: ${data.student_name} (${data.registration_number})` 
              });
            } else if (data.status === 'warning') {
              setWarnings((prev) => [
                {
                  student_name: data.student_name || 'Unregistered Person',
                  registration_number: data.registration_number || 'N/A',
                  message: data.message || 'Recognized but not enrolled in section.',
                  timestamp: new Date().toISOString()
                },
                ...prev
              ]);
              setStatusMessage({ 
                type: 'error', 
                text: `Warning: ${data.student_name || 'Unregistered face'} not enrolled in section!` 
              });
            }
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      socket.onerror = (err) => {
        console.error('WebSocket attendance error:', err);
      };

      return () => {
        socket.close();
      };
    } catch (e) {
      console.log('WebSocket connection skipped:', e);
    }
  }, [session]);

  // 4. Continuous Frame Streaming Interval (Every 1.5s)
  useEffect(() => {
    if (!sessionActive || !isStreaming) return;

    intervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || !socketRef.current) return;
      if (socketRef.current.readyState !== WebSocket.OPEN) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = 640;
      canvas.height = 480;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Frame = canvas.toDataURL('image/jpeg', 0.8);

      socketRef.current.send(JSON.stringify({
        action: 'attendance',
        frame: base64Frame
      }));
    }, 1500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionActive, isStreaming]);

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
                {section.name || 'Section Attendance'}
              </h1>
            </div>
            <p className="text-xs text-[var(--muted)] truncate">{section.course_name || 'Vision AI Attendance Session'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
              isStreaming 
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700' 
                : 'border-amber-500/30 bg-amber-500/10 text-amber-700'
            }`}
          >
            {isStreaming ? '● AI Scanning Active' : '○ AI Scanning Paused'}
          </button>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            {sessionActive ? 'Session Live' : 'Initializing...'}
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
        
        {/* LEFT SIDE: 70% - Expanded Webcam Stream & Live Status */}
        <div className="lg:col-span-7 h-full flex flex-col gap-3 overflow-hidden pr-1">
          
          <div className="relative w-full flex-1 min-h-0 rounded-xl border border-[var(--line)] bg-slate-950 overflow-hidden shadow-lg flex items-center justify-center">
            {loadingSession ? (
              <div className="absolute inset-flex flex-col items-center justify-center p-6 text-center text-[var(--accent)] bg-slate-950/90 z-30">
                <Loader2 className="animate-spin w-8 h-8 mb-3 text-[var(--accent)]" />
                <p className="text-sm font-medium text-white">Starting session and preparing face recognition...</p>
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
              <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              {isStreaming ? 'AUTO ATTENDANCE STREAMING' : 'STREAM PAUSED'}
            </div>

            {/* Status Toast Overlay */}
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
              <div className="w-48 h-60 rounded-3xl border-2 border-dashed border-white/30" />
            </div>
          </div>

          {/* Quick Statistics Bar */}
          <div className="rounded-xl border border-[var(--line)] bg-white p-3.5 shrink-0 flex items-center justify-between text-xs">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--fg)]">Present Count:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-bold border border-emerald-500/20">
                  {attendanceLogs.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--fg)]">Unregistered Alerts:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 font-bold border border-rose-500/20">
                  {warnings.length}
                </span>
              </div>
            </div>
            <p className="text-[var(--muted)]">Students marked appear instantly on the right.</p>
          </div>

        </div>

        {/* RIGHT SIDE: 30% - Live Attendance Roster & Warnings */}
        <div className="lg:col-span-3 h-full flex flex-col rounded-[2.5rem] border border-[var(--line)] bg-white p-5 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.08)] overflow-hidden">
          
          {/* Tabs for Present vs Warnings */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[var(--line)]">
            <div className="flex items-center gap-1 bg-[var(--bg)] p-1 rounded-xl border border-[var(--line)]">
              <button
                onClick={() => setActiveTab('present')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'present' 
                    ? 'bg-white text-[var(--fg)] shadow-sm' 
                    : 'text-[var(--muted)] hover:text-[var(--fg)]'
                }`}
              >
                Present ({attendanceLogs.length})
              </button>
              <button
                onClick={() => setActiveTab('warnings')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'warnings' 
                    ? 'bg-white text-[var(--fg)] shadow-sm' 
                    : 'text-[var(--muted)] hover:text-[var(--fg)]'
                }`}
              >
                Alerts ({warnings.length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pt-4 space-y-2.5 pr-1">
            {activeTab === 'present' ? (
              attendanceLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[var(--muted)]">
                  <UserCheck size={32} className="mb-2 opacity-30 text-[var(--accent)]" />
                  <p className="text-xs text-[var(--muted)]">No attendance logged yet.</p>
                  <p className="text-[11px] text-[var(--muted)] mt-1">Recognized students will appear here automatically.</p>
                </div>
              ) : (
                attendanceLogs.map((log, index) => (
                  <div
                    key={log.registration_number || index}
                    className="group relative flex items-center justify-between p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--accent-line)] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
                        {(log.student_name || '?').trim().charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-[var(--fg)] truncate">{log.student_name}</h4>
                        <p className="text-[11px] text-[var(--accent)] font-mono truncate">{log.registration_number}</p>
                        <p className="text-[10px] text-[var(--muted)] flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                      Present
                    </span>
                  </div>
                ))
              )
            ) : (
              warnings.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[var(--muted)]">
                  <ShieldAlert size={32} className="mb-2 opacity-30 text-amber-500" />
                  <p className="text-xs text-[var(--muted)]">No warnings or unrecognized faces.</p>
                </div>
              ) : (
                warnings.map((warn, index) => (
                  <div
                    key={index}
                    className="group relative flex items-start justify-between p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/5 transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-xs font-semibold text-rose-600">
                        !
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-rose-900 truncate">{warn.student_name}</h4>
                        <p className="text-[11px] text-rose-700 font-mono truncate">{warn.message}</p>
                        <p className="text-[10px] text-[var(--muted)] flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          {new Date(warn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default TakeSectionAttendance;