import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "logpose_intro_shown";

export function IntroVideo() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    if (alreadyShown) return;

    sessionStorage.setItem(SESSION_KEY, "true");
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;

    // Toca o áudio separado após interação do usuário (login), o que
    // permite autoplay com som sem ser bloqueado pelo browser.
    audioRef.current?.play().catch(() => {});

    const timer = setTimeout(() => {
      setFading(true);
      audioRef.current?.pause();
      setTimeout(() => setVisible(false), 600);
    }, 4000);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="intro-video-overlay"
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 0.6s ease-in-out",
      }}
    >
      <video
        ref={videoRef}
        src="/video/intro-banner.mp4"
        autoPlay
        muted
        playsInline
        className="intro-video-player"
      />

      {/* Áudio separado — toca junto com o vídeo */}
      <audio ref={audioRef} src="/video/intro.mp3" preload="auto" />
    </div>
  );
}
