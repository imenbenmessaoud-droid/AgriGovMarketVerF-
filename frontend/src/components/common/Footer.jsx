import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaFacebookF, FaInstagram, FaLinkedinIn, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import logoImg from '../../assets/logo_main.png';

const Footer = () => {
   return (
      <div className="w-full bg-white">


         {/* Farm to Doorstep Text block below Get In Touch with White Background */}
         <section className="bg-[#faf8f0] pt-64 pb-24 text-center relative z-10 border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">
               <h3 className="text-xl md:text-2xl font-normal text-[#224233] mb-4 leading-relaxed">
                  From the heart of Algerian farms to your doorstep  <br className="hidden md:block" /> fresh, trusted, and always in season.
               </h3>
               <p className="text-solum-green font-normal tracking-widest uppercase text-xs md:text-sm">
                  One Platform. Every Farmer. Every Buyer. Every Wilaya.
               </p>
            </div>
         </section>

         {/* Main Footer Block */}
         <footer className="bg-[#0f2215] text-white pt-20 pb-10 relative z-10">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">

               {/* Newsletter Row */}
               <div className="flex flex-col md:flex-row justify-between items-center bg-[#182e1e] border border-white/5 rounded-xl p-6 lg:p-8 mb-16 shadow-lg">
                  <div className="mb-6 md:mb-0 max-w-md">
                     <h3 className="font-normal text-lg text-white mb-2">Stay in the Loop with Special Offers, Ministry Announcements, and More.</h3>
                  </div>
                  <div className="flex w-full md:w-auto flex-1 max-w-md">
                     <input
                        type="email"
                        placeholder="Enter your Email Address"
                        className="bg-transparent border-b border-white/30 py-3 px-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-solum-green w-full"
                     />
                     <button className="bg-solum-green text-white p-3 rounded hover:bg-green-600 transition-colors ml-4 flex items-center justify-center -mb-2">
                        <FaPlay size={10} className="ml-1" />
                     </button>
                  </div>
               </div>

               {/* Links Grid */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-white/10 pb-12 mb-8">

                  {/* Brand */}
                  <div className="md:col-span-1">
                     <Link to="/" className="flex items-center space-x-3 text-white mb-6 group">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                           <img src={logoImg} alt="AgriGov Market" className="w-7 h-7 object-contain" />
                        </div>
                        <span className="font-normal text-lg tracking-tight">AgriGov Market</span>
                     </Link>
                     <p className="text-xs text-white/50 leading-relaxed font-normal mb-6 pe-4">
                        Modernizing Algeria's agricultural supply chain. Connecting farmers directly with the market through a standardized, secure platform.
                     </p>
                     <div className="flex space-x-4 text-white/60">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-solum-green transition-colors"><FaFacebookF size={16} /></a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-solum-green transition-colors"><FaInstagram size={16} /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-solum-green transition-colors"><FaLinkedinIn size={16} /></a>
                     </div>
                  </div>

                  {/* Menus */}
                  <div>
                     <h4 className="font-normal mb-6 text-sm uppercase tracking-wider text-white/90">Quick Links</h4>
                     <ul className="space-y-4 text-xs font-normal text-white/60">
                        <li><Link to="/" className="hover:text-solum-green transition-colors">Home</Link></li>
                        <li><Link to="/buyer" className="hover:text-solum-green transition-colors">Products</Link></li>
                        <li><Link to="/about" className="hover:text-solum-green transition-colors">About Us</Link></li>
                        <li><Link to="/contact" className="hover:text-solum-green transition-colors">Contact</Link></li>
                     </ul>
                  </div>

                  <div>
                     <h4 className="font-normal mb-6 text-sm uppercase tracking-wider text-white/90">Services</h4>
                     <ul className="space-y-4 text-xs font-normal text-white/60">
                        <li><Link to="/farmer/products" className="hover:text-solum-green transition-colors">Sell Products</Link></li>
                        <li><Link to="/buyer/products" className="hover:text-solum-green transition-colors">Buy Products</Link></li>
                        <li><Link to="/transporter" className="hover:text-solum-green transition-colors">Delivery</Link></li>
                     </ul>
                  </div>

                  <div>
                     <h4 className="font-normal mb-6 text-sm uppercase tracking-wider text-white/90">Contact Info</h4>
                     <ul className="space-y-4 text-xs font-normal text-white/60">
                        <li className="flex items-center gap-3">
                           <FaEnvelope className="text-solum-green" />
                           <span>support@agrigov.dz</span>
                        </li>
                        <li className="flex items-center gap-3">
                           <FaPhoneAlt className="text-solum-green" />
                           <span>+213 (0) 23 45 67 89</span>
                        </li>
                        <li className="pt-4 mt-4 border-t border-white/5">
                           <Link to="/privacy" className="hover:text-solum-green transition-colors block mb-3">Privacy Policy</Link>
                           <Link to="/terms" className="hover:text-solum-green transition-colors block">Terms of Service</Link>
                        </li>
                     </ul>
                  </div>

               </div>

               <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-white/40 font-normal">
                  <p>&copy; 2026 AgriGov Market. All Rights Reserved.</p>
                  <p className="flex gap-4">
                     <span className="text-white/20">DZ STATE BACKED</span>
                     <span className="text-white/20">MINISTRY OF AGRICULTURE</span>
                  </p>
               </div>
            </div>
         </footer>
      </div>
   );
};

export default Footer;