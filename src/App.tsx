import { FormEvent, useCallback, useEffect, useRef } from "react";
import { ArrowRight, Globe, Instagram, Twitter } from "lucide-react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const loopTimeoutRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);

  const fadeVideoTo = useCallback((targetOpacity: number, duration = 500) => {
    const video = videoRef.current;
    if (!video) return;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const startOpacity = Number.parseFloat(video.style.opacity || "0");
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      video.style.opacity = String(
        startOpacity + (targetOpacity - startOpacity) * progress,
      );

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const handleVideoReady = useCallback(() => {
    fadingOutRef.current = false;
    fadeVideoTo(1, 500);
  }, [fadeVideoTo]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;

    const timeRemaining = video.duration - video.currentTime;
    if (timeRemaining <= 0.55 && !fadingOutRef.current) {
      fadingOutRef.current = true;
      fadeVideoTo(0, 500);
    }
  }, [fadeVideoTo]);

  const handleEnded = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    video.style.opacity = "0";

    if (loopTimeoutRef.current !== null) {
      window.clearTimeout(loopTimeoutRef.current);
    }

    loopTimeoutRef.current = window.setTimeout(() => {
      const currentVideo = videoRef.current;
      if (!currentVideo) return;

      currentVideo.currentTime = 0;
      fadingOutRef.current = false;
      void currentVideo.play();
      fadeVideoTo(1, 500);
    }, 100);
  }, [fadeVideoTo]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (loopTimeoutRef.current !== null) {
        window.clearTimeout(loopTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full translate-y-[17%] object-cover"
        src={VIDEO_URL}
        muted
        autoPlay
        playsInline
        preload="auto"
        style={{ opacity: 0 }}
        onLoadedData={handleVideoReady}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        aria-hidden="true"
      />

      <nav className="relative z-20 px-6 py-6" aria-label="Main navigation">
        <div className="liquid-glass mx-auto flex max-w-5xl items-center justify-between rounded-full px-6 py-3">
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-2 text-lg font-semibold text-white">
              <Globe size={24} aria-hidden="true" />
              <span>Asme</span>
            </a>

            <div className="hidden items-center gap-8 md:flex">
              <a
                href="#features"
                className="text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                Pricing
              </a>
              <a
                href="#about"
                className="text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                About
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button type="button" className="text-sm font-medium text-white">
              Sign Up
            </button>
            <button
              type="button"
              className="liquid-glass rounded-full px-6 py-2 text-sm font-medium text-white"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex flex-1 -translate-y-[20%] flex-col items-center justify-center px-6 py-12 text-center">
        <h1
          className="mb-8 whitespace-nowrap text-5xl tracking-tight text-white md:text-6xl lg:text-7xl"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Built for the curious
        </h1>

        <div className="w-full max-w-xl space-y-4">
          <form
            className="liquid-glass flex items-center gap-3 rounded-full py-2 pl-6 pr-2"
            onSubmit={handleSubmit}
          >
            <input
              type="email"
              placeholder="Enter your email"
              aria-label="Email address"
              className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/40"
            />
            <button
              type="submit"
              className="rounded-full bg-white p-3 text-black"
              aria-label="Submit email"
            >
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </form>

          <p className="px-4 text-sm leading-relaxed text-white">
            Stay updated with the latest news and insights. Subscribe to our
            newsletter today and never miss out on exciting updates.
          </p>

          <button
            type="button"
            className="liquid-glass rounded-full px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
          >
            Manifesto
          </button>
        </div>
      </main>

      <footer className="relative z-10 flex justify-center gap-4 pb-12">
        <button
          type="button"
          className="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
          aria-label="Instagram"
        >
          <Instagram size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
          aria-label="Twitter"
        >
          <Twitter size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
          aria-label="Website"
        >
          <Globe size={20} aria-hidden="true" />
        </button>
      </footer>
    </div>
  );
}
