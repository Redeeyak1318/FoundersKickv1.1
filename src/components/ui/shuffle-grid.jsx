import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

const squareData = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&h=500&fit=crop",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&h=500&fit=crop",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&h=500&fit=crop",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=500&h=500&fit=crop",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=500&h=500&fit=crop",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&h=500&fit=crop",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=500&fit=crop",
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&h=500&fit=crop",
  },
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=500&h=500&fit=crop",
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=500&fit=crop",
  },
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&h=500&fit=crop",
  },
  {
    id: 13,
    src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&h=500&fit=crop",
  },
  {
    id: 14,
    src: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=500&h=500&fit=crop",
  },
  {
    id: 15,
    src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=500&h=500&fit=crop",
  },
  {
    id: 16,
    src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=500&fit=crop",
  },
];

const generateSquares = () => {
  return shuffle([...squareData]).map((sq) => (
    <motion.div
      key={sq.id}
      layout
      transition={{ duration: 1.5, type: "spring" }}
      className="shuffle-grid-square"
      style={{
        backgroundImage: `url(${sq.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  ));
};

const ShuffleGrid = () => {
  const timeoutRef = useRef(null);
  const [squares, setSquares] = useState(generateSquares());

  const shuffleSquares = useCallback(() => {
    setSquares(generateSquares());
    timeoutRef.current = setTimeout(shuffleSquares, 3000);
  }, []);

  useEffect(() => {
    shuffleSquares();
    return () => clearTimeout(timeoutRef.current);
  }, [shuffleSquares]);

  return (
    <div className="shuffle-grid-container">
      {squares}
    </div>
  );
};

export const ShuffleHero = () => {
  return (
    <section className="shuffle-hero-section">
      <div className="shuffle-hero-inner">
        {/* Left content */}
        <div className="shuffle-hero-content">
          <span className="shuffle-hero-label">The Ecosystem</span>
          <h2 className="shuffle-hero-heading">
            Three pillars of{" "}
            <span className="shuffle-hero-heading-accent">FoundersKick</span>
          </h2>
          <p className="shuffle-hero-paragraph">
            Built for founders, builders, and operators who want to move faster
            with the right people, structure, and momentum.
          </p>
          <button className="shuffle-hero-cta">
            Explore the network
            <svg
              className="shuffle-hero-cta-arrow"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 3L11 8L6 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {/* Right grid */}
        <div className="shuffle-hero-grid-wrapper">
          <ShuffleGrid />
        </div>
      </div>
    </section>
  );
};
