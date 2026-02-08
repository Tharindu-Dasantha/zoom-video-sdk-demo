import { type Dispatch, type SetStateAction } from "react";
import type { VideoClient } from "@zoom/videosdk";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Button } from "./ui/button";

const MicButton = (props: {
  client: typeof VideoClient;
  isAudioMuted: boolean;
  setIsAudioMuted: Dispatch<SetStateAction<boolean>>;
}) => {
  const { client, isAudioMuted, setIsAudioMuted } = props;

  const onMicrophoneClick = async () => {
    try {
      const mediaStream = client.getMediaStream();
      if (isAudioMuted) {
        await mediaStream.unmuteAudio();
      } else {
        await mediaStream.muteAudio();
      }
      setIsAudioMuted(client.getCurrentUserInfo()?.muted ?? true);
    } catch (e) {
      console.error(
        "Error toggling microphone:",
        e instanceof Error ? e.message : String(e)
      );
    }
  };

  return (
    <Button
      onClick={onMicrophoneClick}
      title={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
      variant={isAudioMuted ? "outline" : "default"}
      size="icon"
      className="rounded-full h-12 w-12"
    >
      {isAudioMuted ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
};

const CameraButton = (props: {
  client: typeof VideoClient;
  isVideoMuted: boolean;
  setIsVideoMuted: Dispatch<SetStateAction<boolean>>;
  renderVideo: (event: {
    action: "Start" | "Stop";
    userId: number;
  }) => Promise<void>;
}) => {
  const { client, isVideoMuted, setIsVideoMuted, renderVideo } = props;

  const onCameraClick = async () => {
    try {
      const mediaStream = client.getMediaStream();
      if (isVideoMuted) {
        await mediaStream.startVideo();
        setIsVideoMuted(false);
        await renderVideo({
          action: "Start",
          userId: client.getCurrentUserInfo().userId,
        });
      } else {
        await mediaStream.stopVideo();
        setIsVideoMuted(true);
        await renderVideo({
          action: "Stop",
          userId: client.getCurrentUserInfo().userId,
        });
      }
    } catch (e) {
      console.error(
        "Error toggling camera:",
        e instanceof Error ? e.message : String(e)
      );
    }
  };

  return (
    <Button
      onClick={onCameraClick}
      title={isVideoMuted ? "Turn on camera" : "Turn off camera"}
      variant={isVideoMuted ? "outline" : "default"}
      size="icon"
      className="rounded-full h-12 w-12"
    >
      {isVideoMuted ? (
        <VideoOff className="h-5 w-5" />
      ) : (
        <Video className="h-5 w-5" />
      )}
    </Button>
  );
};

export { MicButton, CameraButton };
