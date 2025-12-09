import React, { useState, useRef, useEffect } from 'react';
import FeaturedProperties from '../pages/FeaturedProperties';
import PropertyList from '../pages/PropertyList';
import VerifiedProperties from '../pages/VerifiedProperties';
import QualityAssurance from '../pages/QualityAsurence';
import Footer from '../pages/Footer';

const Home = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const sectionRefs = useRef([]);

  const sections = [
    { name: 'Properties', component: PropertyList },
    { name: 'Featured', component: FeaturedProperties },
    { name: 'Verified', component: VerifiedProperties },
    { name: 'Quality', component: QualityAssurance }
  ];

  // ✅ EXACT WORKING LOGIC FROM YOUR WORKING VERSION
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',  // middle of screen detection
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sectionRefs.current.indexOf(entry.target);
          if (index !== -1) {
            setCurrentSection(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const scrollToSection = (index) => {
    if (sectionRefs.current[index]) {
      sectionRefs.current[index].scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const scrollToNext = () => {
    const next = (currentSection + 1) % sections.length;
    scrollToSection(next);
  };

  const scrollToPrev = () => {
    const prev = currentSection === 0 ? sections.length - 1 : currentSection - 1;
    scrollToSection(prev);
  };

  return (
    <div className="relative">

      {/* Navigation Controls */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col items-center space-y-2">

        <button
          onClick={scrollToPrev}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 shadow-md"
        >
          ↑
        </button>

        {/* Dots */}
        <div className="flex flex-col items-center space-y-3">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSection === index
                  ? 'bg-blue-600 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={section.name}
            />
          ))}
        </div>

        <button
          onClick={scrollToNext}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 shadow-md"
        >
          ↓
        </button>
      </div>

      {/* Progress Indicator
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white px-4 py-2 rounded-full shadow-lg">
        <span className="text-sm font-medium">
          {sections[currentSection].name} ({currentSection + 1} / {sections.length})
        </span>
      </div> */}

      {/* Sections */}
      {sections.map((section, index) => {
        const Component = section.component;
        return (
          <section
            key={index}
            ref={(el) => (sectionRefs.current[index] = el)}
            className="min-h-screen"
          >
            <Component />
          </section>
        );
      })}

      <Footer />
    </div>
  );
};

export default Home;
