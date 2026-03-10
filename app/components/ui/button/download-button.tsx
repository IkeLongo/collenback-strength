"use client";

import { useRef, useState } from "react";

type Phase = "idle" | "loading" | "done";

export default function DownloadButton({
  href,
  className = "",
  filename,
}: {
  href: string;
  className?: string;
  filename?: string; // optional hint; server should still set Content-Disposition
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const timerRef = useRef<number | null>(null);

  const startDownload = () => {
    // prevent double-clicks while animating
    if (phase !== "idle") return;

    setPhase("loading");

    // 🔽 Trigger a real download without navigating away
    const a = document.createElement("a");
    a.href = href;
    if (filename) a.download = filename; // if omitted, server header decides
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const onSpinnerAnimationEnd = () => {
    setPhase("done");

    // Optional: reset back to idle after a moment
    // so users can download again if needed.
    timerRef.current = window.setTimeout(() => {
      setPhase("idle");
    }, 1800);
  };

  // Basic cleanup if component unmounts
  // (not strictly necessary, but good practice)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  if (timerRef.current && phase === "idle") {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  return (
    <button
      type="button"
      onClick={startDownload}
      className={[
        // base styles (translate your Tailwind tokens here)
        "w-full active:scale-[0.99] hover:scale-[1.01] transition-transform",
        "rounded-lg font-bold tracking-widest px-4 py-3",
        "bg-grey-900 text-white hover:opacity-90",
        "flex items-center justify-center",
        className,
      ].join(" ")}
      aria-busy={phase === "loading"}
      aria-label="Download program PDF"
    >
      <div className="flex justify-center items-center relative">
        <div className="mr-2 flex items-center">
          {/* Download Icon */}
          <svg
            className={[
              "download-icon",
              phase === "idle" ? "block" : "hidden",
            ].join(" ")}
            width="18"
            height="22"
            viewBox="0 0 18 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="download-arrow"
              d="M13 9L9 13M9 13L5 9M9 13V1"
              stroke="#F2F2F2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M1 17V18C1 18.7956 1.31607 19.5587 1.87868 20.1213C2.44129 20.6839 3.20435 21 4 21H14C14.7956 21 15.5587 20.6839 16.1213 20.1213C16.6839 19.5587 17 18.7956 17 18V17"
              stroke="#F2F2F2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Loader */}
          <span
            className={[
              "download-loader",
              phase === "loading" ? "block" : "hidden",
            ].join(" ")}
            onAnimationEnd={onSpinnerAnimationEnd}
          />

          {/* Check Icon */}
          <svg
            className={[
              "check-svg",
              phase === "done" ? "block" : "hidden",
            ].join(" ")}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20ZM15.1071 7.9071C15.4976 7.51658 15.4976 6.88341 15.1071 6.49289C14.7165 6.10237 14.0834 6.10237 13.6929 6.49289L8.68568 11.5001L7.10707 9.92146C6.71655 9.53094 6.08338 9.53094 5.69286 9.92146C5.30233 10.312 5.30233 10.9452 5.69286 11.3357L7.97857 13.6214C8.3691 14.0119 9.00226 14.0119 9.39279 13.6214L15.1071 7.9071Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="button-copy leading-none uppercase text-xs">
          {phase === "idle"
            ? "DOWNLOAD"
            : phase === "loading"
            ? "DOWNLOADING"
            : "DOWNLOADED"}
        </div>
      </div>

      {/* Local CSS for the custom animation */}
      <style jsx>{`
        .download-arrow {
          transition: transform 0.2s linear;
        }
        button:hover .download-arrow {
          transform: translate(0, 3px);
        }
        .check-svg {
          animation: svgScale 0.5s ease-in-out;
        }
        @keyframes svgScale {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
        }
        .download-loader {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top-color: #ffffff;
          border-radius: 50%;
          opacity: 0;
          animation: button-loading-spinner 1s ease 3;
        }
        @keyframes button-loading-spinner {
          from {
            transform: rotate(0turn);
            opacity: 1;
          }
          to {
            transform: rotate(1turn);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
}
