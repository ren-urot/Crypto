import Image from "next/image";

type Layer = { src: string; left: number; top: number; width: number; height: number };

// Container is 568.24 x 411.66 (combined bounding box of the phone + person illustration).
const LAYERS: Layer[] = [
  { src: "/assets/detailed-stats/layer-161.svg", left: 169.23, top: 109.45, width: 399.01, height: 302.21 },
  { src: "/assets/detailed-stats/layer-163.svg", left: 169.96, top: 143.56, width: 397.57, height: 229.54 },
  { src: "/assets/detailed-stats/layer-165.svg", left: 431.07, top: 295.1, width: 136.46, height: 94.03 },
  { src: "/assets/detailed-stats/layer-167.svg", left: 169.96, top: 223.47, width: 261.11, height: 165.66 },
  { src: "/assets/detailed-stats/layer-169.svg", left: 169.23, top: 109.45, width: 399.01, height: 302.21 },
  { src: "/assets/detailed-stats/layer-171.svg", left: 195.5, top: 156.29, width: 325.12, height: 187.71 },
  { src: "/assets/detailed-stats/layer-173.svg", left: 169.23, top: 109.45, width: 399.01, height: 302.21 },
  { src: "/assets/detailed-stats/layer-175.svg", left: 466.11, top: 307.6, width: 36.31, height: 20.97 },
  { src: "/assets/detailed-stats/layer-456.svg", left: 0.73, top: 0.73, width: 110.04, height: 304.09 },
  { src: "/assets/detailed-stats/layer-138.svg", left: 14.31, top: 8.87, width: 110.04, height: 304.09 },
  { src: "/assets/detailed-stats/layer-140.svg", left: 0, top: 0, width: 222.49, height: 348.48 },
  { src: "/assets/detailed-stats/layer-142.svg", left: 0.73, top: 0.73, width: 123.63, height: 71.68 },
  { src: "/assets/detailed-stats/layer-144.svg", left: 0.73, top: 64.26, width: 13.58, height: 248.69 },
  { src: "/assets/detailed-stats/layer-146.svg", left: 0, top: 0, width: 222.49, height: 348.48 },
  { src: "/assets/detailed-stats/layer-148.svg", left: 161.57, top: 217.31, width: 41.88, height: 86.89 },
  { src: "/assets/detailed-stats/layer-150.svg", left: 164.03, top: 217.31, width: 39.41, height: 85.51 },
  { src: "/assets/detailed-stats/layer-152.svg", left: 145.03, top: 221.57, width: 24.39, height: 84.36 },
  { src: "/assets/detailed-stats/layer-154.svg", left: 149.37, top: 221.8, width: 20.74, height: 84.05 },
  { src: "/assets/detailed-stats/layer-156.svg", left: 141.56, top: 153.5, width: 44.93, height: 81.76 },
  { src: "/assets/detailed-stats/layer-158.svg", left: 0, top: 0, width: 222.49, height: 348.48 },
];

const CONTAINER_W = 568.24;
const CONTAINER_H = 411.66;

export default function DetailedStatsIllustration() {
  return (
    <div className="relative mx-auto aspect-[568/412] w-full max-w-[568px] md:self-end">
      {LAYERS.map((layer, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${(layer.left / CONTAINER_W) * 100}%`,
            top: `${(layer.top / CONTAINER_H) * 100}%`,
            width: `${(layer.width / CONTAINER_W) * 100}%`,
            height: `${(layer.height / CONTAINER_H) * 100}%`,
          }}
        >
          <Image src={layer.src} alt="" fill className="object-contain" sizes="568px" />
        </div>
      ))}
    </div>
  );
}
