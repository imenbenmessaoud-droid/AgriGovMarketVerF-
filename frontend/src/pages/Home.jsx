import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import farmerHarvest from '../assets/images/Farmer harvesting.jpg';
import freshPotatoes from '../assets/images/Fresh potatoes.jpg';
import leavesImg from '../assets/images/Leaves.jpg';
import vegetablesImg from '../assets/images/Vegetables.jpg';
import fruitsImg from '../assets/images/Fruits.jpg';
import poultryDairyImg from '../assets/images/Poultry and Dairy.jpg';
import impactSprout from '../assets/images/Sprout.jpg';
import impactFarmer from '../assets/images/Farmer Planting.jpg';
import teamSupport from '../assets/images/team-support.jpg';
import farmerHeroBg from '../assets/images/farmer-hero-bg.png';
const Home = () => {
   const { isLoggedIn } = useAuth();
   const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

   return (
      <div className="w-full bg-white selection:bg-solum-green selection:text-white">

         {/* Editorial Hero Section */}
         <section className="bg-gradient-to-br from-[#e3f2ec] via-[#f0f8f5] to-[#fbfdfc] relative pt-16 pb-32 overflow-hidden">
            {/* Decorative Background Curves & Floating Leaves matching the design */}
            <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-white opacity-40 rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#cdeadd] opacity-40 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Floating decorative elements matching the image */}
            {/* Floating decorative elements matching the image */}
            <div className="absolute top-[10%] left-[80%] w-3 h-3 bg-[#a2d3b8] rounded-full opacity-60 rounded-tr-[50%] blur-[1px]"></div>
            <div className="absolute top-[25%] left-[85%] w-10 h-10 bg-[#e3f2ec] rounded-full blur-[2px]"></div>
            <div className="absolute top-[70%] right-[15%] w-4 h-4 bg-[#75b894] rounded-full opacity-40 blur-[1px]"></div>
            <div className="absolute top-[85%] right-[20%] w-6 h-6 bg-[#b2dfc8] rounded-tl-full rounded-br-full opacity-70 blur-[1px] rotate-45"></div>
            <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center relative z-10">

               {/* Left Column Content */}
               <div className="max-w-lg mx-auto lg:mx-0">
                  <h1 className="text-5xl md:text-7xl font-medium text-solum-dark leading-[1.1] tracking-tight mb-8">
                     Crops are <span className="inline-block relative">
                        <span className="absolute -left-6 top-4 w-3 h-3 bg-solum-dark rounded-full"></span>
                        <span className="absolute -right-8 top-12 w-6 h-6 bg-solum-green rounded-full opacity-80"></span>
                     </span><br />
                     the <span className="font-normal text-solum-green">Roots</span> of <br />
                     The Nation
                  </h1>

                  <p className="text-gray-500 text-lg leading-relaxed font-normal mb-10 max-w-sm">
                     The harvest is obscure in the riches of the soil, yet is a part of the trade. Connect directly with farmers through the Ministry's official verified platform.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 mb-14">
                     <Link to="/buyer/products" className="bg-solum-green text-white px-8 py-3 rounded-full font-medium text-sm tracking-wide hover:bg-green-700 transition duration-300 shadow-lg text-center">
                        Shop now
                     </Link>
                     <Link to="/about" className="bg-white text-solum-dark border border-gray-200 px-8 py-3 rounded-full font-medium text-sm tracking-wide hover:border-solum-dark transition duration-300 text-center">
                        Learn more
                     </Link>
                  </div>
               </div>

               {/* Right Column - Editorial Photo Grid */}
               <div className="relative">
                  {/* Grid Layout overlapping images */}
                  <div className="grid grid-cols-2 gap-6 h-[550px] relative">

                     {/* Left Column of Grid */}
                     <div className="flex flex-col gap-6 h-full relative z-10 w-full pt-12">
                        <div className="flex-1 w-full rounded-[2.5rem]  shadow-xl border-2 border-[#e6f0ec] transform translate-y-4">
                           <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
                              <img
                                 src={freshPotatoes}
                                 alt="Fresh potatoes"
                                 className="w-full h-full object-cover transition duration-700 hover:scale-105"
                              />
                           </div>
                        </div>

                     </div>

                     {/* Right Column of Grid */}
                     <div className="flex flex-col gap-6 h-full relative">
                        <div className="flex-1 w-full rounded-[2.5rem] shadow-2xl border-2 border-[#e6f0ec] transform translate-y-12">
                           <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
                              <img
                                 src={farmerHarvest}
                                 alt="Farmer harvesting"
                                 className="w-full h-full object-cover transition duration-700 hover:scale-105 object-center"
                              />
                           </div>
                        </div>
                     </div>

                  </div>
               </div>
            </div>
         </section>

         {/* Categories Section */}
         <section className="py-24 max-w-5xl mx-auto px-6 lg:px-8 bg-white/50">
            <div className="text-center mb-16">
               <h2 className="text-4xl md:text-5xl font-medium text-[#1f2937] mb-6 tracking-tight drop-shadow-sm">
                  Our Produce Categories
               </h2>
               <p className="text-sm md:text-base  text-gray-500 font-normal max-w-xl mx-auto leading-relaxed">
                  Farm-fresh produce sourced directly from verified Algerian farmers across all 69 wilayas.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Category 1 */}
               <div className="relative h-64 md:h-72 rounded-[1.5rem] overflow-hidden group shadow-lg cursor-pointer transform transition-transform duration-500 hover:-translate-y-2">
                  <img src={vegetablesImg} alt="Vegetables" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition duration-500 mix-blend-multiply"></div>
                  <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                     <h3 className="text-white text-2xl md:text-3xl font-medium uppercase tracking-widest drop-shadow-xl" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                        Vegetables
                     </h3>
                  </div>
               </div>

               {/* Category 2 */}
               <div className="relative h-64 md:h-72 rounded-[1.5rem] overflow-hidden group shadow-lg cursor-pointer transform transition-transform duration-500 hover:-translate-y-2">
                  <img src={fruitsImg} alt="Fruits" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition duration-500 mix-blend-multiply"></div>
                  <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                     <h3 className="text-white text-2xl md:text-3xl font-medium uppercase tracking-widest drop-shadow-xl" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                        Fruits
                     </h3>
                  </div>
               </div>

               {/* Category 3 */}
               <div className="relative h-64 md:h-72 rounded-[1.5rem] overflow-hidden group shadow-lg cursor-pointer transform transition-transform duration-500 hover:-translate-y-2">
                  <img src={poultryDairyImg} alt="Poultry and Dairy" className="w-full h-full object-cover transition duration-700 group-hover:scale-105 object-top" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition duration-500 mix-blend-multiply"></div>
                  <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                     <h3 className="text-white text-2xl md:text-3xl font-medium uppercase tracking-widest drop-shadow-xl" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                        Poultry and Dairy
                     </h3>
                  </div>
               </div>
            </div>
         </section>

         {/* Our Services Section */}
         <section className="py-14 bg-[#f2f9f5]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">

               {/* Top Heading Area */}
               <div className="mb-10">
                  <div className="max-w-2xl">
                     <h4 className="text-gray-400 text-xs font-medium uppercase tracking-[0.15em] mb-4">
                        Our Services
                     </h4>
                     <h2 className="text-3xl md:text-3xl lg:text-3xl font-medium text-solum-dark leading-[1.1] tracking-tight">
                        Explore our wide <br className="hidden md:block" />
                        range of <span className="text-solum-green font-medium">services</span>
                     </h2>
                  </div>
               </div>

               {/* Services Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8 lg:gap-x-12">

                  {/* Service 1 */}
                  <div className="border-l-2 border-[#d5eadc] pl-6 lg:pl-8 flex flex-col justify-start">
                     <span className="text-solum-green text-xl font-normal mb-3">01</span>
                     <h3 className="text-[1.5rem] font-medium text-solum-dark mb-4 leading-[1.2]">
                        Smart <br /> Marketplace
                     </h3>
                     <p className="text-gray-500 text-[0.75rem] leading-relaxed font-normal">
                        Easily browse and purchase fresh agricultural products directly from trusted local farmers.
                     </p>
                  </div>

                  {/* Service 2 */}
                  <div className="border-l-2 border-[#d5eadc] pl-6 lg:pl-8 flex flex-col justify-start">
                     <span className="text-solum-green text-xl font-normal mb-3">02</span>
                     <h3 className="text-[1.5rem] font-medium text-solum-dark mb-4 leading-[1.2]">
                        Real-Time <br /> Pricing
                     </h3>
                     <p className="text-gray-500 text-[0.75rem] leading-relaxed font-normal">
                        Stay updated with live market prices to make informed buying decisions every day.
                     </p>
                  </div>

                  {/* Service 3 */}
                  <div className="border-l-2 border-[#d5eadc] pl-6 lg:pl-8 flex flex-col justify-start">
                     <span className="text-solum-green text-xl font-normal mb-3">03</span>
                     <h3 className="text-[1.5rem] font-medium text-solum-dark mb-4 leading-[1.2]">
                        Verified <br /> Sellers
                     </h3>
                     <p className="text-gray-500 text-[0.75rem] leading-relaxed font-normal">
                        All farmers and suppliers are officially verified to ensure quality and trust.
                     </p>
                  </div>

                  {/* Service 4 */}
                  <div className="border-l-2 border-[#d5eadc] pl-6 lg:pl-8 flex flex-col justify-start">
                     <span className="text-solum-green text-xl font-normal mb-3">04</span>
                     <h3 className="text-[1.5rem] font-medium text-solum-dark mb-4 leading-[1.2]">
                        Fast <br /> Logistics
                     </h3>
                     <p className="text-gray-500 text-[0.75rem] leading-relaxed font-normal">
                        Efficient delivery system ensuring your orders arrive fresh and on time.
                     </p>
                  </div>

                  {/* Service 5 */}
                  <div className="border-l-2 border-[#d5eadc] pl-6 lg:pl-8 flex flex-col justify-start">
                     <span className="text-solum-green text-xl font-normal mb-3">05</span>
                     <h3 className="text-[1.5rem] font-medium text-solum-dark mb-4 leading-[1.2]">
                        Secure <br /> Transactions
                     </h3>
                     <p className="text-gray-500 text-[0.75rem] leading-relaxed font-normal">
                        Multiple safe payment options providing a smooth and protected checkout experience.
                     </p>
                  </div>

                  {/* Service 6 */}
                  <div className="border-l-2 border-[#d5eadc] pl-6 lg:pl-8 flex flex-col justify-start">
                     <span className="text-solum-green text-xl font-normal mb-3">06</span>
                     <h3 className="text-[1.5rem] font-medium text-solum-dark mb-4 leading-[1.2]">
                        Nationwide <br /> Access
                     </h3>
                     <p className="text-gray-500 text-[0.75rem] leading-relaxed font-normal">
                        Access products from different regions and support local agriculture across the country.
                     </p>
                  </div>

               </div>
            </div>
         </section>

         {/* Structured Content Block */}
         <section className="py-24 max-w-7xl mx-auto px-6 lg:px-8 border-b border-gray-100">
            <div className="flex flex-col md:flex-row gap-16 items-start">

               <div className="md:w-1/3">
                  <h2 className="text-2xl font-medium text-solum-dark mb-4 leading-snug">
                     How to Conserve<br />Fresh Harvest This Winter
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed font-normal mb-6">
                     The Ministry has released official guidelines regarding proper crop storage. Ensuring minimal loss and maximizing market yield.
                  </p>
                  <a
                     href="https://www.fao.org/3/y4893e/y4893e00.htm"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-block border border-gray-300 text-xs font-medium uppercase tracking-wider px-6 py-2 rounded hover:bg-solum-dark hover:text-white hover:border-solum-dark transition-all text-center"
                  >
                     Read Report →
                  </a>
               </div>

               <div
                  className="md:w-2/3 relative rounded-2xl overflow-hidden h-72 bg-gray-100 group cursor-pointer w-full shadow-lg border border-gray-100"
                  onClick={() => setIsVideoModalOpen(true)}
               >
                  {/* Localized background image for the video card only */}
                  <img
                     src={farmerHeroBg}
                     alt="Agriculture guidelines"
                     className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 text-white group-hover:bg-solum-green group-hover:border-solum-green transition-all shadow-xl">
                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                           <path d="M4 4l12 6-12 6V4z" />
                        </svg>
                     </div>
                  </div>

                  {/* Watch Video Tag */}
                  <div
                     className="absolute bottom-6 left-6 bg-solum-green text-white text-[0.65rem] font-normal uppercase tracking-widest px-4 py-2 rounded shadow-lg hover:bg-green-600 transition-colors"
                     onClick={(e) => {
                        e.stopPropagation();
                        setIsVideoModalOpen(true);
                     }}
                  >
                     Watch Video
                  </div>
               </div>

            </div>
         </section>

         {/* Real Impact Section */}
         <section className="py-24 bg-[#e8eddd] border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">

               {/* Left side text */}
               <div className="lg:w-1/2">
                  <h2 className="text-4xl md:text-5xl font-medium text-solum-dark mb-8 leading-snug tracking-tight">
                     Real Impact on<br />Agriculture
                  </h2>
                  <p className="text-gray-500 font-normal leading-relaxed text-sm md:text-base max-w-md">
                     AgriSouk DZ is transforming the agricultural ecosystem by connecting farmers directly with buyers, reducing waste, and increasing transparency across the supply chain. Our platform empowers local producers while ensuring fresh, high-quality products reach consumers efficiently.
                  </p>
               </div>

               {/* Right side Grid (3x3 checkerboard) */}
               {/* Right side Grid (3x3 staggered to perfectly match design photo) */}
               <div className="lg:w-1/2 w-full grid grid-cols-2 md:grid-cols-3 aspect-square max-w-lg mx-auto lg:mx-0">

                  {/* Row 1 */}
                  <div className="w-full aspect-square p-2 hidden md:flex items-center justify-start pb-4">
                     <p className="text-[#a6bcb1] font-normal text-xs uppercase tracking-widest mt-auto mb-2 opacity-80">AgriSouk<br />DZ</p>
                  </div>
                  <div className="w-full aspect-square bg-[#587e5b] p-4 flex flex-col items-center justify-center text-center border-[0.5px] border-[#4d6a50] shadow-md z-10 transition hover:bg-[#4d6a50]">
                     <p className="text-white font-normal leading-snug lg:text-lg">Farmers<br />Supported</p>
                  </div>
                  <div className="w-full aspect-square bg-white p-4 flex flex-col items-center justify-center text-center border-[0.5px] border-gray-100 shadow-md z-10">
                     <p className="text-[#293d31] font-normal text-3xl md:text-3xl lg:text-4xl mb-1">15K+</p>
                  </div>

                  {/* Row 2 */}
                  <div className="w-full aspect-square bg-[#587e5b] p-4 flex flex-col items-center justify-center text-center border-[0.5px] border-[#4d6a50] shadow-md z-10 transition hover:bg-[#4d6a50]">
                     <p className="text-white font-normal leading-snug lg:text-lg">Orders<br />Delivered</p>
                  </div>
                  <div className="w-full aspect-square bg-white p-4 flex flex-col items-center justify-center text-center border-[0.5px] border-gray-100 shadow-md z-10">
                     <p className="text-[#293d31] font-normal text-3xl md:text-3xl lg:text-4xl mb-1">120K+</p>
                  </div>
                  <div className="w-full aspect-square overflow-hidden bg-white border-[0.5px] border-gray-100 shadow-md z-10">
                     <img src={impactFarmer} alt="Farmer" className="w-full h-full object-cover transition duration-700 hover:scale-110" />
                  </div>

                  {/* Row 3 */}
                  <div className="w-full aspect-square overflow-hidden bg-white border-[0.5px] border-gray-100 shadow-md z-10">
                     <img src={impactSprout} alt="Sprout" className="w-full h-full object-cover transition duration-700 hover:scale-110" />
                  </div>
                  <div className="w-full aspect-square bg-transparent"></div>
                  <div className="w-full aspect-square bg-transparent hidden md:block"></div>

               </div>
            </div>
         </section>

         {/* Steps Component */}
         <section className="py-24 text-center max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-medium text-solum-dark mb-4">
               How It <span className="font-medium text-solum-green">Works</span>
            </h2>
            <p className="text-sm text-gray-400 font-normal max-w-lg mx-auto mb-16">
               A simple and efficient way to connect farmers and buyers across the country
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {[
                  { no: '01', title: 'Create Account', desc: 'Securely register and verify your identity through the platform.' },
                  { no: '02', title: 'Browse Products', desc: 'Explore fresh agricultural products from verified local farmers.' },
                  { no: '03', title: 'Place Order', desc: 'Select your products and confirm your order.' },
                  { no: '04', title: 'Fast Delivery', desc: 'Receive your order quickly with real-time tracking to your location.' },
               ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                     <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center text-xl font-normal text-gray-400 mb-6 hover:border-solum-green hover:text-solum-green hover:shadow-md transition-all cursor-default">
                        {step.no}
                     </div>
                     <h3 className="font-medium text-solum-dark mb-2 text-sm md:text-base uppercase tracking-wider">
                        {step.title}
                     </h3>
                     <p className="text-sm md:text-base text-gray-500 font-normal leading-[1.6] max-w-[260px] text-center">
                        {step.desc}
                     </p>
                  </div>
               ))}
            </div>
         </section>

         {/* Help & Support Section */}
         <section className="py-24 bg-[#eef2e6]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-16">

               {/* Left side text */}
               <div className="lg:w-1/2">
                  <h2 className="text-4xl lg:text-[2.8rem] font-medium text-solum-dark mb-8 leading-[1.2] tracking-tight max-w-lg">
                     We’re Always Here to Help You
                  </h2>
                  <p className="text-gray-500 font-normal text-[0.95rem] leading-relaxed max-w-lg mb-10">
                     AgriSouk DZ is powered by a dedicated team committed to supporting farmers and buyers across Algeria. By combining our expertise, we focus on delivering quality agricultural products and exceptional service. Whether you need help with orders, market prices, or account verification — our team is always ready to assist you. Don't hesitate to reach out, we're here to make your experience smooth and reliable.
                  </p>

                  <div className="flex flex-wrap gap-4">
                     <Link to="/contact" className="bg-solum-dark text-white text-[0.8rem] font-medium px-8 py-4 hover:bg-solum-green transition-colors tracking-widest uppercase rounded text-center inline-block">
                        Contact Us
                     </Link>
                     <Link to="/about" className="bg-transparent text-solum-dark text-[0.8rem] font-medium px-8 py-4 border border-solum-dark hover:bg-gray-50 transition-colors tracking-widest uppercase rounded text-center inline-block">
                        About Us
                     </Link>
                  </div>
               </div>

               {/* Right Image with Mask Effect matching the design */}
               <div className="lg:w-1/2 w-full relative aspect-square lg:aspect-auto lg:h-[600px] flex justify-end items-center">

                  {/* Container */}
                  <div className="relative w-full h-full md:w-[90%] md:h-[90%] ml-auto overflow-hidden bg-gray-100 flex-shrink-0">
                     <img
                        src={teamSupport}
                        alt="Dedicated Team"
                        className="w-full h-full object-cover origin-center"
                     />


                  </div>
               </div>

            </div>
         </section>

         {/* Video Modal Popup */}
         {isVideoModalOpen && (
            <div
               className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300"
               onClick={() => setIsVideoModalOpen(false)}
            >
               <div
                  className="relative w-full max-w-md aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/20"
                  onClick={(e) => e.stopPropagation()}
               >
                  {/* Close button with premium look */}
                  <button
                     className="absolute top-5 right-5 z-20 p-3 bg-black/40 hover:bg-solum-green text-white rounded-full backdrop-blur-xl transition-all border border-white/30 group"
                     onClick={() => setIsVideoModalOpen(false)}
                  >
                     <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>

                  {/* YouTube Shorts Embed - Using aspect-ratio suitable for Shorts */}
                  <div className="w-full h-full bg-black flex items-center justify-center">
                     <iframe
                        className="w-full h-full scale-100 md:scale-[1.01]"
                        src="https://www.youtube.com/embed/yPSI1uWOIs8?autoplay=1&rel=0&modestbranding=1"
                        title="Agriculture Harvest Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                     ></iframe>
                  </div>

                  {/* Bottom Gradient overlay for smoother look */}
                  <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
               </div>
            </div>
         )}
      </div>
   );
};


export default Home;



