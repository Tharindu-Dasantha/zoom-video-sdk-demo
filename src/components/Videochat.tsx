"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ZoomVideo, {
  VideoQuality,
  type VideoClient,
  type Participant,
} from "@zoom/videosdk";
import {
  LogOut,
  Loader2,
  Video,
  UserPlus,
  Mic,
  MicOff,
  VideoOff,
  Users,
} from "lucide-react";
import InviteModal from "./InviteModal";
import Logo from "./Logo";
import KneoxtPill from "./KneoxtPill";
import { attachVideoElement } from "@/lib/zoom-video";
import { cn } from "@/lib/utils";

// Create client once at module level
const client: typeof VideoClient = ZoomVideo.createClient();

// Avatar background colors
const AVATAR_COLORS = [
  "#1e88e5", "#e53935", "#43a047", "#fb8c00",
  "#8e24aa", "#00acc1", "#3949ab", "#d81b60",
  "#00897b", "#6d4c41", "#546e7a", "#7cb342",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface ParticipantTileProps {
  participant: Participant;
  isSelf: boolean;
  videoRef?: React.RefObject<HTMLDivElement | null>;
  fill?: boolean;
}

function ParticipantTile({ participant, isSelf, videoRef, fill }: ParticipantTileProps) {
  const displayName = participant.displayName || "Guest";
  const hasVideo = participant.bVideoOn;
  const isMuted = participant.muted;
  const color = getAvatarColor(displayName);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-lg bg-tl-navy-700 overflow-hidden",
        fill ? "h-full w-full" : "h-full w-full sm:aspect-video sm:h-auto"
      )}
    >
      {/* Video element container (SDK attaches video here) */}
      {hasVideo && <div ref={videoRef} className="absolute inset-0" />}

      {/* Avatar fallback when video is off */}
      {!hasVideo && (
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-medium text-white"
            style={{ backgroundColor: color }}
          >
            {getInitials(displayName)}
          </div>
        </div>
      )}

      {/* Bottom bar: name + mic status */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 py-2.5">
        {isMuted && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-tl-error/90">
            <MicOff className="h-3 w-3 text-white" />
          </div>
        )}
        <span className="truncate text-sm text-white font-medium">
          {displayName}
          {isSelf && " (You)"}
        </span>
      </div>
    </div>
  );
}

const Videochat = (props: { slug: string; JWT: string; userName: string }) => {
  const { slug: session, JWT: jwt, userName } = props;
  const [inSession, setInSession] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Track video element refs per user
  const videoRefsMap = useRef<Map<number, HTMLDivElement>>(new Map());
  const selfVideoRef = useRef<HTMLDivElement | null>(null);

  const refreshParticipants = useCallback(() => {
    try {
      const users = client.getAllUser();
      setParticipants([...users]);
    } catch {
      // not in session yet
    }
  }, []);

  const attachVideoToTile = useCallback(
    async (userId: number) => {
      try {
        const mediaStream = client.getMediaStream();
        const userVideo = await mediaStream.attachVideo(
          userId,
          VideoQuality.Video_360P
        );

        const currentUser = client.getCurrentUserInfo();
        const isSelf = currentUser?.userId === userId;
        const container = isSelf
          ? selfVideoRef.current
          : videoRefsMap.current.get(userId);

        if (container) {
          attachVideoElement(container, userVideo as unknown as HTMLElement);
        }
      } catch (e) {
        console.error("Error attaching video:", e instanceof Error ? e.message : String(e));
      }
    },
    []
  );

  const detachVideoFromTile = useCallback(async (userId: number) => {
    try {
      const mediaStream = client.getMediaStream();
      const element = await mediaStream.detachVideo(userId);
      if (Array.isArray(element)) {
        element.forEach((el) => el.remove());
      } else {
        element?.remove();
      }
    } catch (e) {
      console.error("Error detaching video:", e instanceof Error ? e.message : String(e));
    }
  }, []);

  const joinSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await client.init("en-US", "Global", { patchJsMedia: true });

      // Listen for participant changes
      client.on(
        "peer-video-state-change",
        (payload: { action: "Start" | "Stop"; userId: number }) => {
          if (payload.action === "Start") {
            attachVideoToTile(payload.userId);
          } else {
            detachVideoFromTile(payload.userId);
          }
          refreshParticipants();
        }
      );
      client.on("user-added", () => refreshParticipants());
      client.on("user-removed", () => refreshParticipants());
      client.on("user-updated", () => refreshParticipants());

      await client.join(session, jwt, userName);
      setInSession(true);
      refreshParticipants();

      const mediaStream = client.getMediaStream();

      // Start audio
      try {
        await mediaStream.startAudio();
        setIsAudioMuted(mediaStream.isAudioMuted());
      } catch (audioErr) {
        console.warn("Could not start audio:", audioErr instanceof Error ? audioErr.message : String(audioErr));
        setIsAudioMuted(true);
      }

      // Start video
      try {
        await mediaStream.startVideo();
        const capturing = mediaStream.isCapturingVideo();
        setIsVideoMuted(!capturing);
        if (capturing) {
          // Short delay for DOM to render the tile
          setTimeout(() => {
            attachVideoToTile(client.getCurrentUserInfo().userId);
            refreshParticipants();
          }, 300);
        }
      } catch (videoErr) {
        console.warn("Could not start video:", videoErr instanceof Error ? videoErr.message : String(videoErr));
        setIsVideoMuted(true);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("Failed to join session:", message);
      setError(`Failed to join session: ${message}`);
      setInSession(false);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVideo = async () => {
    try {
      const mediaStream = client.getMediaStream();
      const userId = client.getCurrentUserInfo().userId;
      if (isVideoMuted) {
        await mediaStream.startVideo();
        setIsVideoMuted(false);
        setTimeout(() => {
          attachVideoToTile(userId);
          refreshParticipants();
        }, 200);
      } else {
        await mediaStream.stopVideo();
        setIsVideoMuted(true);
        await detachVideoFromTile(userId);
        refreshParticipants();
      }
    } catch (e) {
      console.error("Error toggling video:", e instanceof Error ? e.message : String(e));
    }
  };

  const toggleAudio = async () => {
    try {
      const mediaStream = client.getMediaStream();
      if (isAudioMuted) {
        await mediaStream.unmuteAudio();
      } else {
        await mediaStream.muteAudio();
      }
      setIsAudioMuted(client.getCurrentUserInfo()?.muted ?? true);
    } catch (e) {
      console.error("Error toggling audio:", e instanceof Error ? e.message : String(e));
    }
  };

  const leaveSession = async () => {
    try {
      client.off("peer-video-state-change", () => {});
      client.off("user-added", () => {});
      client.off("user-removed", () => {});
      client.off("user-updated", () => {});
      await client.leave();
    } catch (e) {
      console.warn("Error leaving session:", e instanceof Error ? e.message : String(e));
    } finally {
      window.location.href = "/";
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inSession) {
        client.leave().catch(() => {});
      }
    };
  }, [inSession]);

  // Grid columns based on participant count (optimized for mobile stack vs desktop grid).
  // On mobile, `auto-rows-fr` divides the available height evenly across rows so tiles
  // fill the screen with no leftover space and no overflow; desktop reverts to
  // content-sized rows with aspect-video tiles.
  const getGridClass = () => {
    const count = participants.length;
    if (count <= 1) return "grid-cols-1 auto-rows-fr h-full";
    if (count === 2)
      return "grid-cols-1 auto-rows-fr h-full sm:grid-cols-2 sm:auto-rows-auto sm:h-auto sm:max-w-4xl";
    if (count <= 4)
      return "grid-cols-1 auto-rows-fr h-full sm:grid-cols-2 sm:auto-rows-auto sm:h-auto sm:max-w-5xl";
    if (count <= 6)
      return "grid-cols-2 auto-rows-fr h-full sm:grid-cols-3 sm:auto-rows-auto sm:h-auto sm:max-w-6xl";
    return "grid-cols-2 auto-rows-fr h-full sm:grid-cols-4 sm:auto-rows-auto sm:h-auto sm:max-w-7xl";
  };

  const currentUserId = inSession
    ? client.getCurrentUserInfo()?.userId
    : undefined;

  return (
    <div className="flex h-screen w-full flex-col bg-tl-navy">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-2 px-4 py-2 bg-tl-navy border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <Logo size="sm" className="shrink-0" />
          <span className="h-4 w-px bg-white/10 shrink-0" />
          <span className="text-sm text-white/60 font-mono truncate">{session}</span>
        </div>
        {inSession && (
          <div className="flex items-center gap-2 text-sm text-white/60 shrink-0">
            <Users className="h-4 w-4" />
            <span>{participants.length}</span>
          </div>
        )}
      </header>

      {/* Error display */}
      {error && (
        <div className="mx-4 mt-3 rounded-lg bg-tl-error/10 border border-tl-error/20 p-4 text-center">
          <p className="text-sm text-tl-error">{error}</p>
          <button
            className="mt-2 text-xs text-tl-blue hover:underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main content area */}
      <main className="flex flex-1 items-center justify-center overflow-hidden p-4">
        {!inSession ? (
          /* Pre-join screen */
          <div className="flex flex-col items-center gap-6 rounded-lg bg-tl-navy-800 border border-white/[0.08] p-10 shadow-xl max-w-sm w-full">
            {/* Preview avatar */}
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-medium text-white"
              style={{ backgroundColor: getAvatarColor(userName) }}
            >
              {getInitials(userName)}
            </div>
            <div className="text-center">
              <p className="text-lg text-white font-medium">{userName}</p>
              <p className="text-sm text-white/60 mt-1">Ready to join?</p>
            </div>
            <button
              className="w-full flex items-center justify-center gap-2 rounded-sm bg-tl-blue px-6 py-3 text-sm font-medium text-white hover:bg-tl-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={joinSession}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  Join now
                </>
              )}
            </button>
          </div>
        ) : (
          /* Participant grid */
          <div
            className={`mx-auto grid w-full h-full gap-3 ${getGridClass()}`}
          >
            {participants.map((participant) => {
              const isSelf = participant.userId === currentUserId;
              return (
                <ParticipantTile
                  key={participant.userId}
                  participant={participant}
                  isSelf={isSelf}
                  fill={participants.length === 1}
                  videoRef={
                    isSelf
                      ? selfVideoRef
                      : {
                          current: videoRefsMap.current.get(
                            participant.userId
                          ) ?? null,
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } as any
                  }
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom control bar */}
      {inSession && (
        <footer className="flex items-center justify-center gap-2 sm:gap-3 px-3 py-3 sm:px-4 sm:py-4 bg-tl-navy border-t border-white/10">
          {/* Mic toggle */}
          <button
            onClick={toggleAudio}
            title={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-150 ease-out ${
              isAudioMuted
                ? "bg-tl-error hover:bg-tl-error/90 text-white"
                : "bg-tl-navy-700 hover:bg-tl-navy-600 text-white"
            }`}
          >
            {isAudioMuted ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          {/* Camera toggle */}
          <button
            onClick={toggleVideo}
            title={isVideoMuted ? "Turn on camera" : "Turn off camera"}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-150 ease-out ${
              isVideoMuted
                ? "bg-tl-error hover:bg-tl-error/90 text-white"
                : "bg-tl-navy-700 hover:bg-tl-navy-600 text-white"
            }`}
          >
            {isVideoMuted ? (
              <VideoOff className="h-5 w-5" />
            ) : (
              <Video className="h-5 w-5" />
            )}
          </button>

          {/* Invite */}
          <button
            onClick={() => setIsInviteOpen(true)}
            title="Invite via email"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-tl-navy-700 hover:bg-tl-navy-600 text-white transition-colors duration-150 ease-out"
          >
            <UserPlus className="h-5 w-5" />
          </button>

          {/* Separator */}
          <div className="mx-1 sm:mx-2 h-8 w-px bg-white/10" />

          {/* Leave call */}
          <button
            onClick={leaveSession}
            title="Leave call"
            className="flex h-12 w-12 sm:w-auto items-center justify-center sm:justify-start gap-2 rounded-sm bg-tl-error hover:bg-tl-error/90 px-0 sm:px-5 text-white text-sm font-medium transition-colors duration-150 ease-out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </footer>
      )}

      {/* Invite Modal */}
      <InviteModal
        sessionName={session}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />

      {/* Floating Kneoxt Product Pill (hidden on mobile to prevent overlapping controls) */}
      <KneoxtPill className="hidden sm:flex" />
    </div>
  );
};

export default Videochat;
