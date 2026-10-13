import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Video,
} from "remotion";

export interface ReelShot {
  narration: string;
  caption: string;
  durationSec: number;
  videoUrl?: string;
  accent?: string;
}

export interface ReelProps {
  [key: string]: unknown;
  title: string;
  hook: string;
  brand: string;
  shots: ReelShot[];
}

const PALETTE = [
  ["#0b1020", "#2b1055"],
  ["#160b2e", "#4b1d6b"],
  ["#0a1a2f", "#15406b"],
  ["#1a0b1f", "#5a1d3a"],
  ["#0b1a12", "#1d4b34"],
];

const Shot: React.FC<{ shot: ReelShot; index: number; total: number }> = ({
  shot,
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const [a, b] = PALETTE[index % PALETTE.length]!;
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 14 });
  const capY = height * 0.66; // above the IG bottom UI safe zone

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${a} 0%, ${b} 100%)`,
        fontFamily:
          "ui-serif, Georgia, 'Times New Roman', serif",
      }}
    >
      {shot.videoUrl ? (
        <Video
          src={shot.videoUrl}
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.08), transparent 60%)",
        }}
      />

      {shot.caption ? (
        <div
          style={{
            position: "absolute",
            top: capY,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            padding: "0 80px",
            opacity: enter,
            transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px)`,
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
              color: "#fff",
              fontSize: 58,
              lineHeight: 1.25,
              fontWeight: 700,
              textAlign: "center",
              padding: "18px 28px",
              borderRadius: 18,
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
              maxWidth: 900,
            }}
          >
            {shot.caption}
          </div>
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          bottom: 60,
          width: "100%",
          textAlign: "center",
          color: "rgba(255,255,255,0.55)",
          fontSize: 34,
          letterSpacing: 2,
        }}
      >
        SHORTWAVE · {index + 1}/{total}
      </div>
    </AbsoluteFill>
  );
};

/** Sequence start offsets (in frames) for each shot. Pure helper. */
function offsetsFor(shots: ReelShot[], fps: number): number[] {
  const offsets: number[] = [];
  let acc = 0;
  for (const s of shots) {
    offsets.push(acc);
    acc += Math.max(1, Math.round(s.durationSec * fps));
  }
  return offsets;
}

export const ReelVideo: React.FC<ReelProps> = ({ title, hook, brand, shots }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const hookOpacity = interpolate(frame, [0, 10, 60, 80], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  const offsets = offsetsFor(shots, fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05060a" }}>
      {shots.map((shot, i) => {
        const dur = Math.max(1, Math.round(shot.durationSec * fps));
        return (
          <Sequence key={i} from={offsets[i]!} durationInFrames={dur}>
            <Shot shot={shot} index={i} total={shots.length} />
          </Sequence>
        );
      })}

      {hook ? (
        <AbsoluteFill
          style={{
            justifyContent: "flex-start",
            alignItems: "center",
            paddingTop: 220,
            opacity: hookOpacity,
          }}
        >
          <div
            style={{
              fontFamily: "ui-serif, Georgia, serif",
              color: "#fff",
              fontSize: 84,
              fontWeight: 800,
              textAlign: "center",
              padding: "0 90px",
              textShadow: "0 4px 24px rgba(0,0,0,0.8)",
            }}
          >
            {hook}
          </div>
        </AbsoluteFill>
      ) : null}

      <div
        style={{
          position: "absolute",
          top: 90,
          width: "100%",
          textAlign: "center",
          color: "rgba(255,255,255,0.75)",
          fontFamily: "ui-sans-serif, system-ui",
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: 6,
          textTransform: "uppercase",
        }}
      >
        {brand || title}
      </div>
    </AbsoluteFill>
  );
};
