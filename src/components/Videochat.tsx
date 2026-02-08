"use client";

import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import ZoomVideo, { VideoQuality, type VideoPlayer, type VideoClient } from "@zoom/videosdk";
import { CameraButton, MicButton } from "./MuteButtons";
import { LogOut, Loader2, Video } from "lucide-react";
import { Button } from "./ui/button";

// Create client once at module level — NOT inside the component
const client: typeof VideoClient = ZoomVideo.createClient();

const Videochat = (props: { slug: string; JWT: string }) => {
  const { slug: session, JWT: jwt } = props;
  const [inSession, setInSession] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const renderVideo = useCallback(
    async (event: { action: "Start" | "Stop"; userId: number }) => {
      try {
        const mediaStream = client.getMediaStream();
        if (event.action === "Stop") {
          const element = await mediaStream.detachVideo(event.userId);
          if (Array.isArray(element)) {
            element.forEach((el) => el.remove());
          } else {
            element?.remove();
          }
        } else {
          const userVideo = await mediaStream.attachVideo(
            event.userId,
            VideoQuality.Video_360P
          );
          videoContainerRef.current?.appendChild(userVideo as VideoPlayer);
        }
      } catch (e) {
        console.error(
          "Error rendering video:",
          e instanceof Error ? e.message : String(e)
        );
      }
    },
    []
  );

  const joinSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await client.init("en-US", "Global", { patchJsMedia: true });
      client.on("peer-video-state-change", renderVideo);
      await client.join(session, jwt, userName);
      setInSession(true);

      const mediaStream = client.getMediaStream();

      // Start audio — may fail if no mic permission
      try {
        await mediaStream.startAudio();
        setIsAudioMuted(mediaStream.isAudioMuted());
      } catch (audioErr) {
        console.warn(
          "Could not start audio:",
          audioErr instanceof Error ? audioErr.message : String(audioErr)
        );
        setIsAudioMuted(true);
      }

      // Start video — may fail if no camera permission
      try {
        await mediaStream.startVideo();
        setIsVideoMuted(!mediaStream.isCapturingVideo());
        await renderVideo({
          action: "Start",
          userId: client.getCurrentUserInfo().userId,
        });
      } catch (videoErr) {
        console.warn(
          "Could not start video:",
          videoErr instanceof Error ? videoErr.message : String(videoErr)
        );
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

  const leaveSession = async () => {
    try {
      client.off("peer-video-state-change", renderVideo);
      await client.leave();
    } catch (e) {
      console.warn(
        "Error leaving session:",
        e instanceof Error ? e.message : String(e)
      );
    } finally {
      window.location.href = "/";
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inSession) {
        client.off("peer-video-state-change", renderVideo);
        client.leave().catch(() => {});
      }
    };
  }, [inSession, renderVideo]);

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Jenis Akkage App Eka
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Session:{" "}
          <span className="font-mono font-semibold text-foreground">
            {session}
          </span>
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-auto mb-4 max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Video area (hidden until session joined) */}
      <div
        className="flex w-full flex-1"
        style={inSession ? {} : { display: "none" }}
      >
        {/* @ts-expect-error html component */}
        <video-player-container
          ref={videoContainerRef}
          style={videoPlayerStyle}
        />
      </div>

      {!inSession ? (
        /* Join screen */
        <div className="mx-auto flex w-80 flex-col items-center self-center gap-4 rounded-xl border bg-card p-8 shadow-lg">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Video className="h-7 w-7 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Ready to join? Click below to enter the video session.
          </p>
          <Button
            className="w-full"
            size="lg"
            onClick={joinSession}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Session"
            )}
          </Button>
        </div>
      ) : (
        /* In-session controls */
        <div className="flex w-full flex-col justify-around self-center">
          <div className="mt-4 flex w-full max-w-md flex-1 items-center justify-around self-center rounded-xl border bg-card p-4 shadow-lg">
            <CameraButton
              client={client}
              isVideoMuted={isVideoMuted}
              setIsVideoMuted={setIsVideoMuted}
              renderVideo={renderVideo}
            />
            <MicButton
              isAudioMuted={isAudioMuted}
              client={client}
              setIsAudioMuted={setIsAudioMuted}
            />
            <Button
              onClick={leaveSession}
              variant="destructive"
              size="icon"
              title="Leave session"
              className="rounded-full h-12 w-12"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videochat;

const videoPlayerStyle = {
  height: "75vh",
  marginTop: "1.5rem",
  marginLeft: "3rem",
  marginRight: "3rem",
  alignContent: "center",
  borderRadius: "10px",
  overflow: "hidden",
  backgroundColor: "hsl(222.2 84% 4.9%)",
} as CSSProperties;

const userName = `User-${Date.now().toString().slice(-4)}`;
