"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ZoomVideo, { VideoQuality, type VideoClient } from "@zoom/videosdk";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Circle,
} from "lucide-react";
import KneoxtPill from "@/components/KneoxtPill";
import { attachVideoElement } from "@/lib/zoom-video";
import engageLogo from "../../../../public/engage/logo.png";

type Stage =
  | "loading"      // fetching session details
  | "completed"    // already recorded
  | "invalid"      // bad token
  | "device-check" // test cam + mic
  | "joining"      // connecting to Zoom
  | "recording"    // live recording
  | "done"         // session ended
  | "error";       // unrecoverable error

interface SessionData {
  recipientName: string;
  sessionName: string;
  jwt: string;
}

const zoomClient: typeof VideoClient = ZoomVideo.createClient();

// Simple mic level meter using Web Audio API
function MicMeter({ stream }: { stream: MediaStream | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!stream) return;
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      const level = Math.min(avg / 80, 1);

      const canvas = canvasRef.current;
      if (canvas) {
        const c = canvas.getContext("2d")!;
        c.clearRect(0, 0, canvas.width, canvas.height);
        // Light theme: pale gray track with a green active fill.
        c.fillStyle = "#E5E7EB";
        c.fillRect(0, 0, canvas.width, canvas.height);
        const active = level > 0.05 ? "#10B981" : "#D1D5DB";
        c.fillStyle = active;
        c.fillRect(0, 0, canvas.width * level, canvas.height);
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      source.disconnect();
      ctx.close();
    };
  }, [stream]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={8}
      className="w-24 sm:w-48 h-2 rounded-full overflow-hidden"
    />
  );
}

export default function RecordingFlow({ token }: { token: string }) {
  const [stage, setStage] = useState<Stage>("loading");
  const [session, setSession] = useState<SessionData | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Device check state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [camOk, setCamOk] = useState(false);
  const [micOk, setMicOk] = useState(false);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  // Recording state
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [recordingStarted, setRecordingStarted] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const selfVideoRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const peerVideoHandlerRef = useRef<
    ((payload: { action: "Start" | "Stop"; userId: number }) => void) | null
  >(null);

  // Fetch session details on mount
  useEffect(() => {
    fetch(`/api/record/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error === "COMPLETED") {
          setRecipientName(data.recipientName);
          setStage("completed");
        } else if (data.error) {
          setErrorMsg(data.error);
          setStage("invalid");
        } else {
          setSession(data);
          setRecipientName(data.recipientName);
          setStage("device-check");
        }
      })
      .catch(() => {
        setErrorMsg("Could not load session. Please check your link.");
        setStage("invalid");
      });
  }, [token]);

  // Request camera + mic and start preview
  const requestDevices = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setLocalStream(stream);
      setCamOk(true);
      setMicOk(true);
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("video")) setCamOk(false);
      if (msg.includes("audio")) setMicOk(false);
      setErrorMsg("Could not access camera or microphone. Please allow access and refresh.");
    }
  }, []);

  useEffect(() => {
    if (stage === "device-check") {
      requestDevices();
    }
    return () => {
      if (stage !== "recording") {
        localStream?.getTracks().forEach((t) => t.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const startRecording = async () => {
    if (!session) return;
    setStage("joining");

    // Stop preview stream — Zoom will take over the camera
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);

    try {
      await zoomClient.init("en-US", "Global", { patchJsMedia: true });

      const handlePeerVideo = async (payload: {
        action: "Start" | "Stop";
        userId: number;
      }) => {
        if (payload.action === "Start") {
          try {
            const ms = zoomClient.getMediaStream();
            const el = await ms.attachVideo(payload.userId, VideoQuality.Video_720P);
            const currentId = zoomClient.getCurrentUserInfo()?.userId;
            if (payload.userId === currentId && selfVideoRef.current) {
              attachVideoElement(selfVideoRef.current, el as unknown as HTMLElement);
            }
          } catch (err) {
            console.warn("attach video error", err);
          }
        }
      };
      peerVideoHandlerRef.current = handlePeerVideo;
      zoomClient.on("peer-video-state-change", handlePeerVideo);

      await zoomClient.join(session.sessionName, session.jwt, session.recipientName);

      // Mark link as IN_PROGRESS
      fetch(`/api/record/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      }).catch(() => {});

      const mediaStream = zoomClient.getMediaStream();

      await mediaStream.startAudio();
      setIsAudioMuted(false);

      await mediaStream.startVideo();
      setIsVideoMuted(false);
      // The self-view is attached by an effect once we're in the "recording"
      // stage (so selfVideoRef's container is mounted) — see below.

      // Start cloud recording. This is the entire point of the session, so a
      // failure here must NOT silently continue — otherwise the attendee would
      // record, press Done, the link would be marked COMPLETED, and the admin
      // would be left with a completed link and no video. Surface the error and
      // bail; the link stays IN_PROGRESS (re-enterable) so they can refresh and
      // retry.
      try {
        const recordingClient = zoomClient.getRecordingClient();
        await recordingClient.startCloudRecording();
        setRecordingStarted(true);
      } catch (recErr) {
        console.error("Cloud recording start failed:", recErr);
        if (peerVideoHandlerRef.current) {
          zoomClient.off("peer-video-state-change", peerVideoHandlerRef.current);
          peerVideoHandlerRef.current = null;
        }
        try {
          await zoomClient.leave();
        } catch {
          // ignore teardown errors
        }
        setErrorMsg(
          "We couldn't start the recording. Please refresh the page and try again."
        );
        setStage("error");
        return;
      }

      // Start elapsed timer
      setElapsedSec(0);
      timerRef.current = setInterval(() => {
        setElapsedSec((s) => s + 1);
      }, 1000);

      setStage("recording");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorMsg(`Failed to join session: ${msg}`);
      setStage("error");
    }
  };

  const toggleVideo = async () => {
    try {
      const ms = zoomClient.getMediaStream();
      if (isVideoMuted) {
        await ms.startVideo();
        // Re-attaching the self-view is handled by the effect keyed on
        // [stage, isVideoMuted] once this flips false.
        setIsVideoMuted(false);
      } else {
        await ms.stopVideo();
        setIsVideoMuted(true);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const toggleAudio = async () => {
    try {
      const ms = zoomClient.getMediaStream();
      if (isAudioMuted) {
        await ms.unmuteAudio();
        setIsAudioMuted(false);
      } else {
        await ms.muteAudio();
        setIsAudioMuted(true);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const finishRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Show the thank-you screen immediately; teardown happens in the background.
    setStage("done");

    // Burn the link the moment the user finishes — single-use, enforced here
    // rather than waiting on Zoom's recording.completed webhook.
    fetch(`/api/record/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete" }),
    }).catch(() => {});

    if (recordingStarted) {
      try {
        await zoomClient.getRecordingClient().stopCloudRecording();
      } catch (err) {
        console.warn("stop recording error", err);
      }
    }

    try {
      if (peerVideoHandlerRef.current) {
        zoomClient.off("peer-video-state-change", peerVideoHandlerRef.current);
        peerVideoHandlerRef.current = null;
      }
      await zoomClient.leave();
    } catch (err) {
      console.warn(err);
    }
  };

  // Attach the local self-view once we're actually on the recording screen.
  // Attaching from startRecording via setTimeout was racy — the timeout often
  // fired while still on the "joining" screen (before startCloudRecording
  // resolved and setStage("recording") ran), so selfVideoRef.current was null
  // and the feed never showed until the camera was toggled off/on. Keying off
  // `stage` guarantees the container div is mounted before we attach, and the
  // `isVideoMuted` dependency re-attaches when the camera is toggled back on.
  useEffect(() => {
    if (stage !== "recording" || isVideoMuted) return;
    let cancelled = false;
    const id = setTimeout(async () => {
      try {
        const ms = zoomClient.getMediaStream();
        const userId = zoomClient.getCurrentUserInfo().userId;
        const el = await ms.attachVideo(userId, VideoQuality.Video_720P);
        if (!cancelled && selfVideoRef.current) {
          attachVideoElement(selfVideoRef.current, el as unknown as HTMLElement);
        }
      } catch (err) {
        console.warn("self attach error", err);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [stage, isVideoMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      localStream?.getTracks().forEach((t) => t.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ─── Stages ────────────────────────────────────────────────────────────────

  if (stage === "loading") {
    return (
      <FullPage>
        <Loader2 className="h-8 w-8 animate-spin text-tl-blue" />
        <p className="mt-3 text-sm text-white/60">Loading your session…</p>
      </FullPage>
    );
  }

  if (stage === "invalid" || stage === "error") {
    return (
      <FullPage>
        <AlertCircle className="h-10 w-10 text-tl-error" />
        <h2 className="mt-4 text-lg font-semibold text-white">Something went wrong</h2>
        <p className="mt-2 max-w-sm text-center text-sm text-white/60">{errorMsg}</p>
      </FullPage>
    );
  }

  if (stage === "completed") {
    return (
      <FullPage>
        <CheckCircle2 className="h-12 w-12 text-tl-success" />
        <h2 className="mt-4 text-xl font-semibold text-white">
          Already recorded — thank you{recipientName ? `, ${recipientName}` : ""}!
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Your testimonial has been received. You can close this window.
        </p>
      </FullPage>
    );
  }

  if (stage === "done") {
    return (
      <FullPage>
        <CheckCircle2 className="h-14 w-14 text-tl-success" />
        <h2 className="mt-5 text-2xl font-semibold text-white">
          Thank you{recipientName ? `, ${recipientName}` : ""}!
        </h2>
        <p className="mt-3 max-w-sm text-center text-sm text-white/60">
          Your testimonial is being processed. You can close this window — everything
          is saved automatically.
        </p>
      </FullPage>
    );
  }

  if (stage === "device-check") {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Engage Financial Solutions branding */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-lg border border-gray-200 bg-white px-5 py-3 shadow-sm">
              <Image
                src={engageLogo}
                alt="Engage Financial Solutions"
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </div>
            <p className="max-w-md text-sm text-gray-500">
              You&apos;re recording a video message for Engage Financial Solutions&apos;{" "}
              <span className="font-medium text-gray-900">25th Anniversary</span> celebration.
            </p>
          </div>

          <div className="mt-7 text-center sm:mt-9">
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
              Hi{recipientName ? `, ${recipientName}` : ""}! Let&apos;s get you set up
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Make sure your camera and microphone are working before recording.
            </p>
          </div>

          {/* Two columns on desktop, stacked rows on mobile */}
          <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-2 lg:items-start lg:gap-10">
            {/* Camera preview */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm">
              <video
                ref={previewVideoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover scale-x-[-1]"
              />
              {!camOk && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <VideoOff className="h-12 w-12 text-gray-300" />
                </div>
              )}
            </div>

            {/* Controls column */}
            <div className="flex flex-col gap-5">
              {/* Device status */}
              <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Video className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Camera</span>
                  </div>
                  {camOk ? (
                    <CheckCircle2 className="h-5 w-5 text-tl-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-tl-error" />
                  )}
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Mic className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Microphone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {micOk && <MicMeter stream={localStream} />}
                    {micOk ? (
                      <CheckCircle2 className="h-5 w-5 text-tl-success" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-tl-error" />
                    )}
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="rounded-lg border border-tl-error/20 bg-tl-error/5 px-4 py-3 text-sm text-tl-error">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={startRecording}
                disabled={!camOk || !micOk}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-tl-blue px-6 py-4 text-base font-medium text-white transition-colors hover:bg-tl-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Circle className="h-4 w-4 fill-tl-error text-tl-error" />
                Start Recording
              </button>

              <p className="text-center text-xs text-gray-400">
                Recording begins as soon as you join. Make sure you&apos;re in a quiet place.
              </p>
            </div>
          </div>
        </div>
        {/* Hidden on mobile — on short viewports the fixed pill overlaps the controls */}
        <KneoxtPill className="hidden sm:flex" />
      </div>
    );
  }

  if (stage === "joining") {
    return (
      <FullPage>
        <Loader2 className="h-8 w-8 animate-spin text-tl-blue" />
        <p className="mt-3 text-sm text-white/60">Starting your recording session…</p>
      </FullPage>
    );
  }

  // ─── Recording stage ────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col bg-black">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4">
        {recordingStarted ? (
          <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tl-error opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-tl-error" />
            </span>
            <span className="text-xs font-semibold text-white">REC</span>
            <span className="text-xs text-white/60 tabular-nums">{formatTime(elapsedSec)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
            <Loader2 className="h-3 w-3 animate-spin text-tl-warning" />
            <span className="text-xs text-tl-warning">Starting recording…</span>
          </div>
        )}
      </div>

      {/* Self-view video */}
      <div className="relative flex-1 overflow-hidden">
        <div ref={selfVideoRef} className="h-full w-full" />
        {isVideoMuted && (
          <div className="absolute inset-0 flex items-center justify-center bg-tl-navy">
            <VideoOff className="h-16 w-16 text-white/30" />
          </div>
        )}
      </div>

      {/* Error recovery tip (offset clears the controls bar with a visible gap) */}
      <div className="absolute bottom-24 sm:bottom-28 left-4 right-4 z-10 flex justify-center">
        <div className="rounded-lg bg-black/70 px-4 py-2.5 backdrop-blur-sm max-w-md text-center">
          <p className="text-xs text-white/60">
            Made a mistake?{" "}
            <span className="text-white font-medium">
              Wait 2 seconds, then continue from your last sentence.
            </span>{" "}
            The team will edit it out.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-3 sm:gap-4 bg-gradient-to-t from-black/80 to-transparent px-3 py-4 sm:py-6">
        {/* Mic toggle */}
        <button
          onClick={toggleAudio}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-150 ease-out ${
            isAudioMuted
              ? "bg-tl-error hover:bg-tl-error/90 text-white"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
          title={isAudioMuted ? "Unmute" : "Mute"}
        >
          {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {/* Camera toggle */}
        <button
          onClick={toggleVideo}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-150 ease-out ${
            isVideoMuted
              ? "bg-tl-error hover:bg-tl-error/90 text-white"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
          title={isVideoMuted ? "Turn on camera" : "Turn off camera"}
        >
          {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </button>

        {/* Separator */}
        <div className="h-8 w-px bg-white/20" />

        {/* Done button */}
        <button
          onClick={finishRecording}
          className="flex h-12 items-center gap-2 rounded-sm bg-tl-blue px-6 text-sm font-medium text-white hover:bg-tl-blue-700 transition-colors"
        >
          Done
        </button>
      </div>
      {/* Floating Kneoxt Product Pill (hidden on mobile to prevent overlapping controls) */}
      <KneoxtPill className="hidden sm:flex" />
    </div>
  );
}

function FullPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-tl-navy p-6">
      <div className="flex flex-col items-center text-center">{children}</div>
      <KneoxtPill />
    </div>
  );
}
