import { useState } from "react";

/** Keep the still image visible until playback actually starts. */
export function BackgroundVideo({
  src,
  poster,
  active = true,
  priority = false,
}: {
  src: string;
  poster: string;
  active?: boolean;
  priority?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <img
        className="absolute inset-0 h-full w-full object-cover"
        src={poster}
        alt=""
        loading={priority ? "eager" : "lazy"}
      />
      {active && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: playing ? 1 : 0 }}
          src={src}
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          preload={priority ? "auto" : "metadata"}
          onPlaying={() => setPlaying(true)}
          onError={() => setPlaying(false)}
          onCanPlay={(event) => {
            const video = event.currentTarget;
            video.muted = true;
            // Some browsers defer autoplay until the media becomes ready.
            if (video.paused) void video.play().catch(() => setPlaying(false));
          }}
        />
      )}
    </div>
  );
}
