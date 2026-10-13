import React from "react";
import { Composition } from "remotion";
import { ReelVideo, type ReelProps } from "./ReelVideo";

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

const defaultProps: ReelProps = {
  title: "The Secret in Apartment 4B",
  hook: "Nobody warned Mochi…",
  brand: "SHORTWAVE",
  shots: [
    {
      narration: "Mochi heard a noise that night.",
      caption: "Mochi heard a noise.",
      durationSec: 3,
    },
    {
      narration: "It was coming from apartment 4B.",
      caption: "It came from 4B.",
      durationSec: 3,
    },
    {
      narration: "But nobody has lived there for years.",
      caption: "Nobody lived there.",
      durationSec: 3,
    },
  ],
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Reel"
      component={ReelVideo}
      durationInFrames={90}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => {
        const totalSec = props.shots.reduce((n, s) => n + s.durationSec, 0);
        return {
          durationInFrames: Math.max(1, Math.round(totalSec * FPS)),
          fps: FPS,
          width: WIDTH,
          height: HEIGHT,
        };
      }}
    />
  );
};
