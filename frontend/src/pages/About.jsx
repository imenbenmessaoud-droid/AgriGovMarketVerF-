import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaTrophy, FaUsers, FaChartLine, FaHistory,
  FaShieldAlt, FaLightbulb, FaRocket, FaHandshake,
  FaCheckCircle, FaUserTie, FaTools, FaGem
} from 'react-icons/fa';

import heroImg from '../assets/images/about/hero.png';
import techImg from '../assets/images/about/tech.png';
import logisticsImg from '../assets/images/about/logistics.png';
import agriImg from '../assets/images/about/agriculture.png';

const About = () => {
  const collage1 = techImg;
  const collage2 = logisticsImg;
  const collage3 = agriImg;

  return (
    <div className="w-full bg-white font-['Outfit'] overflow-x-hidden">
      
      {/* Hero Section - Matching Image Style */}
      <section className="relative h-[450px] w-full flex items-center justify-center text-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${heroImg})` }}
        >
          <div className="absolute inset-0 bg-[#0d2113]/75 backdrop-blur-[1px]"></div>
        </div>
        
        <div className="relative z-10 px-4">
          <p className="text-white/70 text-xs font-normal uppercase tracking-[0.4em] mb-4">PROJECT PROFILE</p>
          <h1 className="text-5xl md:text-6xl font-normal text-white mb-4 tracking-tight">ABOUT US</h1>
          <p className="text-white/80 text-sm md:text-base font-normal max-w-2xl mx-auto tracking-wide leading-relaxed">
            Connecting Farmers, Buyers, and Transporters in One Digital Platform
          </p>
        </div>
      </section>

      {/* Mission & Vision Section - Matching Image Collage Layout */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Image Collage */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 rounded-2xl overflow-hidden shadow-2xl">
                  <img src={collage1} alt="Modern Farming" className="w-full h-full object-cover" />
                </div>
                <div className="h-48 rounded-2xl overflow-hidden shadow-xl">
                  <img src={collage2} alt="Logistics" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="pt-12">
                <div className="h-96 rounded-2xl overflow-hidden shadow-2xl">
                  <img src={collage3} alt="Agriculture" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            {/* The Dark Floating Box */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a1a2f] p-8 rounded-2xl shadow-3xl text-center min-w-[200px] border border-white/10">
              <p className="text-white text-2xl font-normal leading-tight">
                Roots, <br/> Resilience, <br/> Results.
              </p>
            </div>
          </div>

          {/* Right: Text Content */}
          <div className="space-y-8 lg:pl-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-normal text-gray-900 leading-tight">
                Let <span className="text-green-700">modernity</span> begin <br/> with our roots.
              </h2>
              <div className="w-16 h-1 bg-amber-400"></div>
            </div>
            
            <p className="text-gray-500 text-sm leading-relaxed font-normal italic">
              "AgriSouk DZ is not just a platform; it is a movement to bridge the gap between our fertile lands and the tables of every Algerian citizen through transparency and technology."
            </p>

            <div className="space-y-6">
              <div className="group">
                <h3 className="text-lg font-normal text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  Our Mission
                </h3>
                <p className="text-gray-500 text-sm font-normal pl-4.5 border-l-2 border-gray-100 group-hover:border-amber-500 transition-colors py-1">
                  To digitalize the Algerian agricultural ecosystem, ensuring farmers receive fair value for their labor while citizens access fresh, traceable produce at regulated prices.
                </p>
              </div>

              <div className="group">
                <h3 className="text-lg font-normal text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  Our Vision
                </h3>
                <p className="text-gray-500 text-sm font-normal pl-4.5 border-l-2 border-gray-100 group-hover:border-amber-500 transition-colors py-1">
                  Creating a unified national market that eliminates middlemen, reduces food waste, and secures Algeria's agricultural independence through innovation.
                </p>
              </div>

              <div className="group">
                <h3 className="text-lg font-normal text-gray-900 mb-2 flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  Our Strategy
                </h3>
                <p className="text-gray-500 text-sm font-normal pl-4.5 border-l-2 border-gray-100 group-hover:border-amber-500 transition-colors py-1">
                  Integrating real-time pricing data with a nationwide logistics network to move goods efficiently from farm gates to consumer hubs across all 58 wilayas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar - Updated to Light Sage */}
      <section className="bg-[#f0f2ec] py-16 px-6 border-y border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div className="space-y-2">
            <FaUsers className="text-amber-500 text-3xl mx-auto mb-4" />
            <h4 className="text-4xl font-normal text-gray-900">1,200+</h4>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-normal">Verified Farms</p>
          </div>
          <div className="space-y-2">
            <FaChartLine className="text-amber-500 text-3xl mx-auto mb-4" />
            <h4 className="text-4xl font-normal text-gray-900">58</h4>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-normal">Wilayas Connected</p>
          </div>
          <div className="space-y-2">
            <FaTrophy className="text-amber-500 text-3xl mx-auto mb-4" />
            <h4 className="text-4xl font-normal text-gray-900">15k</h4>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-normal">Tons Delivered</p>
          </div>
          <div className="space-y-2">
            <FaHistory className="text-amber-500 text-3xl mx-auto mb-4" />
            <h4 className="text-4xl font-normal text-gray-900">24/7</h4>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-normal">Market Oversight</p>
          </div>
        </div>
      </section>

      {/* Why to choose us - Matching Image Grid Style */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-normal text-gray-900 mb-2">Why to choose us</h2>
          <p className="text-gray-400 text-xs font-normal mb-4">A state-backed ecosystem for a modern Algeria</p>
          <div className="w-12 h-0.5 bg-amber-500 mx-auto"></div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
              <FaShieldAlt size={24} />
            </div>
            <h5 className="font-normal text-gray-900 mb-3">State-Backed</h5>
            <p className="text-gray-500 text-xs leading-relaxed font-normal">Official recognition and security for every transaction.</p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
              <FaCheckCircle size={24} />
            </div>
            <h5 className="font-normal text-gray-900 mb-3">Freshness</h5>
            <p className="text-gray-500 text-xs leading-relaxed font-normal">Direct farm access ensures maximum produce freshness.</p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
              <FaChartLine size={24} />
            </div>
            <h5 className="font-normal text-gray-900 mb-3">Fair Prices</h5>
            <p className="text-gray-500 text-xs leading-relaxed font-normal">Regulated pricing eliminates unfair market speculation.</p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
              <FaUserTie size={24} />
            </div>
            <h5 className="font-normal text-gray-900 mb-3">Direct Connect</h5>
            <p className="text-gray-500 text-xs leading-relaxed font-normal">Speak directly with the farmers who grow your food.</p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
              <FaRocket size={24} />
            </div>
            <h5 className="font-normal text-gray-900 mb-3">Efficiency</h5>
            <p className="text-gray-500 text-xs leading-relaxed font-normal">Optimized logistics reducing delivery time and costs.</p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
              <FaLightbulb size={24} />
            </div>
            <h5 className="font-normal text-gray-900 mb-3">Innovation</h5>
            <p className="text-gray-500 text-xs leading-relaxed font-normal">Using data to predict and solve supply challenges.</p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
              <FaTools size={24} />
            </div>
            <h5 className="font-normal text-gray-900 mb-3">Support</h5>
            <p className="text-gray-500 text-xs leading-relaxed font-normal">Dedicated team assisting farmers in digital transition.</p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
              <FaGem size={24} />
            </div>
            <h5 className="font-normal text-gray-900 mb-3">Quality</h5>
            <p className="text-gray-500 text-xs leading-relaxed font-normal">Strict quality standards for all listed produce.</p>
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <section className="py-20 px-6 text-center border-t border-gray-100">
        <h3 className="text-2xl font-normal text-gray-900 mb-4">Ready to support our local harvest?</h3>
        <p className="text-gray-500 text-sm font-normal mb-8 max-w-md mx-auto">
          Join thousands of farmers and buyers in building a more resilient agricultural future for Algeria.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register" className="px-8 py-3 bg-gray-900 text-white rounded-full text-xs font-normal tracking-widest hover:bg-green-700 transition-all shadow-lg">JOIN NOW</Link>
          <Link to="/buyer/products" className="px-8 py-3 border border-gray-200 text-gray-700 rounded-full text-xs font-normal tracking-widest hover:bg-gray-50 transition-all">BROWSE MARKET</Link>
        </div>
      </section>

    </div>
  );
};

export default About;