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
            Cultivating a <br /> <span className="font-normal">Modern Market</span>
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
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-2xl font-normal text-[#112a1a] mb-6">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed font-normal mb-6">
                We empower local farmers by providing them with direct access to national buyers, eliminating unnecessary middlemen and stabilizing market prices. By harnessing modern technology, we ensure that the journey from field to shelf is documented, secure, and beneficial for all.
              </p>
              <p className="text-gray-600 leading-relaxed font-normal">
                Our commitment is to create a sustainable, transparent, and rapidly scalable model that supports the heart of our economy: the agricultural sector.
              </p>
            </div>

            <div className="bg-[#f2f9f5] border-[0.5px] border-[#eef2e6] p-10 flex flex-col justify-center">
              <h3 className="text-sm font-normal text-[#224233] uppercase tracking-widest mb-4">Core Principles</h3>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-solum-mint text-[#112a1a] flex items-center justify-center text-xs font-normal mr-4 mt-0.5">1</span>
                  <div>
                    <h4 className="font-normal text-[#112a1a] mb-1">Total Transparency</h4>
                    <p className="text-sm text-gray-500 font-normal">Open pricing models and verifiable transaction ledgers for all parties.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-solum-mint text-[#112a1a] flex items-center justify-center text-xs font-normal mr-4 mt-0.5">2</span>
                  <div>
                    <h4 className="font-normal text-[#112a1a] mb-1">State-Backed Security</h4>
                    <p className="text-sm text-gray-500 font-normal">Guaranteed transactions and secure financial routing backed by the Ministry.</p>
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