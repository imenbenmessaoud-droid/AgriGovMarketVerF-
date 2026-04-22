import logoImg from '../assets/logo_main.png';
import aboutHeroBg from '../assets/images/about-hero-bg.png';

const About = () => {
  return (
    <div className="w-full bg-[#fcfdfd] font-sans">
      
      {/* Hero Section */}
      <section 
         className="relative bg-[#112a1a] text-white pt-32 pb-20 px-4 lg:px-6 overflow-hidden"
         style={{
            backgroundImage: `url(${aboutHeroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
         }}
      >
        {/* Dark Premium Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-4xl font-normal mb-8 tracking-tight drop-shadow-lg">
            Cultivating a <br/> <span className="font-normal">Modern Market</span>
          </h1>
          <p className="text-xl text-white/90 max-w-lg mx-auto leading-relaxed font-normal mb-9 drop-shadow-md">
            AgriSouk DZ is an official state-backed initiative designed to revolutionize the agricultural supply chain in Algeria by bringing transparency, efficiency, and a unified digital infrastructure to all wilayas.
          </p>
          <div className="flex justify-center space-x-6">
            <div className="w-12 h-[1px] bg-solum-green mt-3 opacity-50"></div>
            <span className="text-solum-green text-[10px] uppercase font-normal tracking-[0.3em] drop-shadow-sm">ABOUT THE PROJECT</span>
            <div className="w-12 h-[1px] bg-solum-green mt-3 opacity-50"></div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
            
            <div className="space-y-8">
              <div className="inline-block relative">
                <h2 className="text-[28px] font-normal text-[#112a1a] tracking-tight">
                  Our <span className="relative">Mission
                    <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-solum-green opacity-40"></span>
                  </span>
                </h2>
              </div>
              
              <div className="space-y-6 text-gray-600 text-sm leading-[1.8] font-normal max-w-md">
                <p>
                  We empower local farmers by providing them with direct access to national buyers, eliminating unnecessary middlemen and stabilizing market prices. By harnessing modern technology, we ensure that the journey from field to shelf is documented, secure, and beneficial for all.
                </p>
                <p>
                  Our commitment is to create a sustainable, transparent, and rapidly scalable model that supports the heart of our economy: the agricultural sector.
                </p>
              </div>
            </div>
            
            <div className="bg-[#f6f8f4] border border-[#eff2ec] p-10 lg:p-14 rounded-sm">
              <h3 className="text-[10px] font-normal text-[#224233]/60 uppercase tracking-[0.25em] mb-10">Core Principles</h3>
              <ul className="space-y-10">
                <li className="flex items-start gap-6">
                  <span className="text-[11px] font-normal text-[#224233]/40 mt-1">1.</span>
                  <div>
                    <h4 className="text-sm font-normal text-[#112a1a] mb-2">Total Transparency</h4>
                    <p className="text-[13px] text-gray-500 font-normal leading-relaxed">
                      Open pricing models and verifiable transaction ledgers for all parties.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-6">
                  <span className="text-[11px] font-normal text-[#224233]/40 mt-1">2.</span>
                  <div>
                    <h4 className="text-sm font-normal text-[#112a1a] mb-2">State-Backed Security</h4>
                    <p className="text-[13px] text-gray-500 font-normal leading-relaxed">
                      Guaranteed transactions and secure financial routing backed by the Ministry.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
export default About;