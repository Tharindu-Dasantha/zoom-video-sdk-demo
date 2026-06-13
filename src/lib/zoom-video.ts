/**
 * The Zoom Video SDK's `attachVideo()` returns a `<video-player>` custom
 * element that must live inside a `<video-player-container>` ancestor, or
 * the SDK throws "The video-player must have a video-player-container as
 * its ancestor element." This wraps the returned element accordingly and
 * sizes both to fill the given container.
 */
export function attachVideoElement(container: HTMLElement, videoEl: HTMLElement) {
  container.innerHTML = "";

  const playerContainer = document.createElement("video-player-container");
  playerContainer.style.cssText = "display:block;width:100%;height:100%;";

  videoEl.style.cssText = "width:100%;height:100%;object-fit:cover;";

  playerContainer.appendChild(videoEl);
  container.appendChild(playerContainer);
}
