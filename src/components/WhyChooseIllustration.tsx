import Image from "next/image";

type Layer = {
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

// Container is 493.01 x 502.926 (the illustration's original bounding box).
const LAYERS: Layer[] = [
  { src: "/assets/why-choose/layer-69.svg", left: 0, top: 0, width: 493.01, height: 502.93 },
  { src: "/assets/why-choose/layer-71.svg", left: 194.24, top: 0, width: 296.1, height: 181.54 },
  { src: "/assets/why-choose/layer-73.svg", left: 188.3, top: 153.05, width: 61.33, height: 252.67 },
  { src: "/assets/why-choose/layer-75.svg", left: 0, top: 0, width: 493.01, height: 502.93 },
  { src: "/assets/why-choose/layer-77.svg", left: 223.11, top: 20.05, width: 269.9, height: 423.52 },
  { src: "/assets/why-choose/layer-79.svg", left: 243.53, top: 52.11, width: 229.05, height: 359.41 },
  { src: "/assets/why-choose/layer-81.svg", left: 280.33, top: 125.58, width: 11.98, height: 13.84 },
  { src: "/assets/why-choose/layer-83.svg", left: 318.46, top: 95.63, width: 11.98, height: 13.84 },
  { src: "/assets/why-choose/layer-85.svg", left: 356.58, top: 71.5, width: 11.98, height: 13.84 },
  { src: "/assets/why-choose/layer-87.svg", left: 394.71, top: 52.88, width: 11.98, height: 13.84 },
  { src: "/assets/why-choose/layer-89.svg", left: 432.83, top: 40.35, width: 11.98, height: 13.84 },
  { src: "/assets/why-choose/layer-91.svg", left: 315.47, top: 120.05, width: 113.96, height: 214.64 },
];

export default function WhyChooseIllustration() {
  return (
    <div className="relative mx-auto aspect-[493/503] w-full max-w-[493px]">
      {LAYERS.map((layer, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${(layer.left / 493.01) * 100}%`,
            top: `${(layer.top / 502.93) * 100}%`,
            width: `${(layer.width / 493.01) * 100}%`,
            height: `${(layer.height / 502.93) * 100}%`,
          }}
        >
          <Image src={layer.src} alt="" fill className="object-contain" sizes="493px" />
        </div>
      ))}
    </div>
  );
}
