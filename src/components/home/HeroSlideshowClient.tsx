"use client";

import { HeroSlideshow } from "./HeroSlideshow";
import type { SlideImage } from "@/config/portfolio-images";

interface Props {
  slides: SlideImage[];
}

export function HeroSlideshowClient({ slides }: Props) {
  return <HeroSlideshow slides={slides} />;
}
