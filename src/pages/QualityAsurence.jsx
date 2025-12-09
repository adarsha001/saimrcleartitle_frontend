import React, { useState, useEffect, useRef } from 'react';

// NOTE: This component assumes you have Tailwind CSS configured in your project.

export default function QualityAssuranceSection() {
  const [counters, setCounters] = useState({
    years: 0,
    acres: 0,
    clients: 0,
    deals: 0,
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);

  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  // Counter animation logic
  const animateCounters = () => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const targets = {
      years: 15,
      acres: 200,
      clients: 100,
      deals: 65,
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setCounters({
        years: Math.floor(targets.years * progress),
        acres: Math.floor(targets.acres * progress),
        clients: Math.floor(targets.clients * progress),
        deals: Math.floor(targets.deals * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounters(targets); // Ensure final values are exactly the targets
      }
    }, interval);
  };

  const stats = [
    {
      number: `${counters.years}+`,
      label: 'YEARS OF',
      sublabel: 'EXCELLENCE',
    },
    {
      number: `${counters.acres}+`,
      label: 'ACRES OF LAND',
      sublabel: 'DEVELOPED',
    },
    {
      number: `${counters.clients}+`,
      label: 'SATISFIED',
      sublabel: 'CLIENTS',
    },
    {
      number: `${counters.deals}+`,
      label: 'SUCCESSFUL',
      sublabel: 'DEALS',
    },
  ];

  const services = [
    {
      title: 'Joint Development',
      description: 'Strategic partnerships for land development with transparent agreements',
      color: 'border-teal-500',
      bgColor: 'bg-gradient-to-br from-teal-50 to-white',
    },
    {
      title: 'Joint Ventures',
      description: 'Collaborative projects with shared expertise and resources',
      color: 'border-indigo-500',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-white',
    },
    {
      title: 'Outright Sales',
      description: 'Premium land parcels with clear titles in prime locations',
      color: 'border-amber-500',
      bgColor: 'bg-gradient-to-br from-amber-50 to-white',
    },
  ];

  return (
    // The main container with gradient background
    <div 
      ref={sectionRef} 
      className="relative w-full p-4 min-h-[120vh] md:min-h-[100vh] bg-[#F9FAFB]  overflow-hidden"
    >
      
      {/* 🏙️ Background Image Section with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="./logoo.png" 
          alt="Bangalore city skyline" 
          className="w-full h-full object-cover md:object-fill object-[75%_center] md:object-center opacity-30" 
        />
        {/* Color overlay */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-teal-400/10 to-indigo-500/10 mix-blend-multiply"></div> */}
      </div>
      
      {/* 📄 Content Section */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-12">
        
        {/* Header and Description */}
        <div className="max-w-4xl mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-teal-900 mb-6 tracking-tight">
            WHY CHOOSE <strong className="font-bold text-indigo-700">SAIMR GROUPS</strong>
          </h2>
          <p className="text-base sm:text-lg text-teal-800 leading-relaxed max-w-2xl">
            As Bangalore's leading real estate consultants, we specialize in connecting investors and developers 
            with prime land opportunities. Our expertise spans <strong className="text-teal-600 font-semibold">Joint Developments</strong>, <strong className="text-indigo-600 font-semibold">Joint Ventures</strong>, and 
            <strong className="text-amber-600 font-semibold"> Outright Land Sales</strong>, focusing exclusively on clear-title properties in strategic locations across Karnataka.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-20 max-w-4xl">
          {stats.map((stat, idx) => (
            <div 
              key={idx}
              className="group relative border-l-4 border-teal-300 p-3 sm:p-4 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-teal-500 transition-all duration-300 rounded-lg"
              style={{
                animationDelay: `${idx * 150}ms`
              }}
            >
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-light text-teal-700 tracking-tight">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-indigo-700 tracking-wider uppercase">
                  {stat.label}
                </div>
                <div className="text-xs sm:text-sm font-light text-teal-600 tracking-widest uppercase">
                  {stat.sublabel}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Services Section */}
        <div className="max-w-4xl">
          <h3 className="text-2xl sm:text-3xl font-light text-teal-900 mb-8">Our Core Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service, idx) => (
              <div 
                key={idx} 
                className={`${service.bgColor} p-4 sm:p-6 border-l-4 ${service.color} shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm rounded-lg hover:translate-y-[-4px]`}
              >
                <h4 className={`text-lg font-bold mb-2 sm:mb-3 ${service.color.replace('border-', 'text-')}`}>
                  {service.title}
                </h4>
                <p className="text-teal-800 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WhatsApp Button */}
      <a 
        href="https://wa.me/917788999022" 
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
        aria-label="Contact us on WhatsApp"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
}