import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { GoArrowRight } from "react-icons/go";
import { RiUserLine } from "react-icons/ri";
import PrimaryButton from "./buttons/PrimaryButton";
import SecondaryButton from "./buttons/SecondaryButton";

const CardSlider = ({ title, cards }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const cardWidth = 350;
  const gap = 16;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1 < cards.length ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
  };

  const scrollToCard = (index) => {
    if (scrollRef.current) {
      const scrollAmount = (cardWidth + gap) * index;
      scrollRef.current.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToCard(currentIndex);
  }, [currentIndex]);

  const handleCardClick = (ca) => {
    if (ca) {
      navigate(`/coins/${ca}`);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Title */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            className="p-2 bg-[#1a1a24] rounded-full hover:bg-[#27272a] transition-colors"
          >
            <BiChevronLeft className="text-white" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 bg-[#1a1a24] rounded-full hover:bg-[#27272a] transition-colors"
          >
            <BiChevronRight className="text-white" />
          </button>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-2 pb-2"
        style={{
          scrollSnapType: "x mandatory",
        }}
      >
        {cards.map((item, index) => (
          <div
            key={item.id || index}
            onClick={() => handleCardClick(item.ca)}
            className="flex-shrink-0 cursor-pointer p-4 bg-white shadow-md flex flex-row gap-4 items-center justify-left rounded-3xl scroll-snap-align-start bg-radial-[at_-300%_25%] md:bg-radial-[at_-300%_70%] from-[#FF860A] to-[#161616] to-65% hover:opacity-90 transition-opacity"
            style={{
              width: cardWidth,
              scrollSnapAlign: "start",
            }}
          >
            {/* Image */}
            <div className="w-32 h-32 flex items-center justify-center overflow-hidden rounded-xl bg-gray-200 flex-shrink-0">
              <img
                src={item.image}
                alt="Memecoin"
                className="w-full h-full object-cover object-center"
                draggable="false"
              />
            </div>
            {/* Content */}
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-lg font-medium text-white truncate">{item.name}</p>
              <div className="flex items-center gap-1">
                <p className="text-xs text-gray-400 truncate">
                  {item.ca?.slice(0, 6)}....{item.ca?.slice(-4)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-lg font-bold text-purple-400">${item.marketCap}K</p>
                <p className="text-xs text-green-400">{item.marketPercent}</p>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-[#380C69] flex items-center justify-center">
                  <RiUserLine className="text-xs text-purple-200" />
                </div>
                <p className="text-xs text-gray-300">{item.buyersPercent}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardSlider;
