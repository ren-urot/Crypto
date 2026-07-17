import Image from "next/image";

type Layer = { src: string; left: number; top: number; width: number; height: number };

// Container is 611.44 x 438.16 (combined bounding box of the coin-spoke + person illustration).
const PERSON_LAYERS: Layer[] = [
  { src: "/assets/grow-profit/layer-45.svg", left: 391.55, top: 100.38, width: 219.89, height: 337.78 },
  { src: "/assets/grow-profit/layer-47.svg", left: 422.04, top: 238.98, width: 81.66, height: 140.39 },
  { src: "/assets/grow-profit/layer-49.svg", left: 452.69, top: 247.3, width: 83.77, height: 146.31 },
  { src: "/assets/grow-profit/layer-51.svg", left: 452.75, top: 247.3, width: 75.67, height: 143.15 },
  { src: "/assets/grow-profit/layer-53.svg", left: 391.55, top: 100.38, width: 219.89, height: 337.78 },
  { src: "/assets/grow-profit/layer-55.svg", left: 441.47, top: 151.18, width: 66.27, height: 79.57 },
  { src: "/assets/grow-profit/layer-57.svg", left: 478.93, top: 151.33, width: 67.0, height: 119.88 },
  { src: "/assets/grow-profit/layer-59.svg", left: 391.55, top: 100.38, width: 219.89, height: 337.78 },
  { src: "/assets/grow-profit/layer-61.svg", left: 480.23, top: 169.87, width: 70.89, height: 86.3 },
  { src: "/assets/grow-profit/layer-63.svg", left: 391.55, top: 100.38, width: 219.89, height: 337.78 },
  { src: "/assets/grow-profit/layer-65.svg", left: 398.13, top: 181.69, width: 76.72, height: 94.46 },
];

const COIN_LAYER: Layer = {
  src: "/assets/grow-profit/layer-125.svg",
  left: 0,
  top: 0,
  width: 341.55,
  height: 417.74,
};

const CONTAINER_W = 611.44;
const CONTAINER_H = 438.16;

function layerStyle(layer: Layer) {
  return {
    left: `${(layer.left / CONTAINER_W) * 100}%`,
    top: `${(layer.top / CONTAINER_H) * 100}%`,
    width: `${(layer.width / CONTAINER_W) * 100}%`,
    height: `${(layer.height / CONTAINER_H) * 100}%`,
  };
}

export default function GrowProfitIllustration() {
  return (
    <div className="relative mx-auto aspect-[611/438] w-full max-w-[611px] md:self-end">
      <div className="absolute" style={layerStyle(COIN_LAYER)}>
        <Image src={COIN_LAYER.src} alt="" fill className="object-contain" sizes="611px" />
      </div>

      <div className="absolute inset-0 translate-y-[30px]">
        {PERSON_LAYERS.map((layer, i) => (
          <div key={i} className="absolute" style={layerStyle(layer)}>
            <Image src={layer.src} alt="" fill className="object-contain" sizes="611px" />
          </div>
        ))}
      </div>
    </div>
  );
}
