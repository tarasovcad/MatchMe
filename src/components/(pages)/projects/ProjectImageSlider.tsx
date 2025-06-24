import React, {useRef, useEffect, useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {Navigation} from "swiper/modules";
import {ChevronLeft, ChevronRight} from "lucide-react";
import type {Swiper as SwiperType} from "swiper";
import {Fancybox} from "@fancyapps/ui/dist/fancybox/";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";
import {Button} from "@/components/shadcn/button";

const ProjectImageSlider = ({demo}: {demo: string[]}) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Initialize Fancybox
  useEffect(() => {
    Fancybox.bind('[data-fancybox="gallery"]');

    // Cleanup
    return () => {
      Fancybox.destroy();
    };
  }, [demo]);

  const handlePrevSlide = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleNextSlide = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Swiper
          modules={[Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="rounded-[6px] overflow-hidden border border-border"
          style={{
            width: "100%",
            height: "clamp(400px, 20vw, 156px)",
          }}>
          {demo.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full">
                <a
                  href={image}
                  data-fancybox="gallery"
                  className="block w-full h-full cursor-pointer">
                  <Image
                    src={image}
                    width={1000}
                    height={1000}
                    quality={100}
                    alt={`Project demo ${index + 1}`}
                    className="w-full h-full object-cover  transition-transform duration-300"
                  />
                </a>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
            {activeIndex + 1}/{demo.length}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-4 gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 flex-shrink-0"
          onClick={handlePrevSlide}
          disabled={activeIndex === 0}
          aria-label="Previous image">
          <ChevronLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </Button>

        {/* Thumbnail Images */}
        <div className="flex gap-1 overflow-x-auto flex-1 justify-center items-center">
          {demo.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                if (swiperRef.current) {
                  swiperRef.current.slideTo(index);
                }
              }}
              className={`relative flex-shrink-0 rounded border-2 transition-all duration-300 ease-in-out overflow-hidden ${
                activeIndex === index
                  ? "border-primary shadow-md w-[94px]"
                  : "border-border hover:border-primary/50 w-[30px] hover:w-[36px]"
              }`}
              aria-label={`Go to image ${index + 1}`}>
              <Image
                src={image}
                width={94}
                height={50}
                alt={`Thumbnail ${index + 1}`}
                className="h-[50px] object-cover rounded transition-all duration-300 ease-in-out"
                style={{
                  width: activeIndex === index ? "94px" : "94px",
                  objectPosition: activeIndex === index ? "center" : "center",
                }}
              />
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 flex-shrink-0"
          onClick={handleNextSlide}
          disabled={activeIndex === demo.length - 1}
          aria-label="Next image">
          <ChevronRight size={20} className="text-gray-700 dark:text-gray-300" />
        </Button>
      </div>
    </div>
  );
};

export default ProjectImageSlider;
