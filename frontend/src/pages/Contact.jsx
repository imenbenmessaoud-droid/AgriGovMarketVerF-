import React, { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import contactBg from '../assets/images/contact-bg.jpg';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    department: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API connection
    setTimeout(() => {
      console.log('Form data submitted:', formData);
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        fullName: '',
        phone: '',
        department: 'General Inquiry',
        message: ''
      });
    }, 1500);
  };
  return (
    <div className="w-full bg-[#fcfdfd] font-sans pb-32">

      {/* Hero Section */}
      <section
        className="relative bg-[#0f2215] border-b-[0.5px] border-gray-200 h-[60vh] min-h-[400px] flex items-center justify-center"
        style={{
          backgroundImage: `url(${contactBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Dark Overlay exactly like the reference design */}
        <div className="absolute inset-0 bg-black/70"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 lg:px-8 mt-16">
          <h1 className="text-5xl md:text-7xl font-normal text-white mb-6 tracking-tight">
            Contact Us
          </h1>
          <p className='text-white font-normal'>We’re just one message away. Let us help you</p>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white shadow-xl shadow-gray-200/50 flex flex-col md:flex-row overflow-hidden border-[0.5px] border-gray-100 rounded-xl">

          {/* Left Form */}
          <div className="w-full md:w-3/5 p-8 lg:p-12">
            <h1 className="text-3xl font-normal text-[#112a1a] mb-8">Get in Touch</h1>
            <h2 className="text-xl font-normal text-[#112a1a] mb-6">Send a Message</h2>
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <FaCheckCircle className="text-solum-green text-6xl mb-6 animate-bounce" />
                <h3 className="text-2xl font-normal text-[#112a1a] mb-2">Message Sent!</h3>
                <p className="text-gray-500 mb-8 font-normal">Thank you for reaching out. Our team will get back to you shortly.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-[#224233] font-normal uppercase tracking-widest text-[10px] border-b-2 border-[#224233] pb-1"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-[#112a1a]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase font-normal tracking-widest text-[#224233] mb-3">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full border-b-[1.5px] border-gray-200 focus:border-[#224233] py-2 outline-none text-sm transition-colors"
                      placeholder="Ali B."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-normal tracking-widest text-[#224233] mb-3">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full border-b-[1.5px] border-gray-200 focus:border-[#224233] py-2 outline-none text-sm transition-colors"
                      placeholder="+213 555 123 456"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <label className="block text-[10px] uppercase font-normal tracking-widest text-[#224233] mb-3">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full border-b-[1.5px] border-gray-200 focus:border-[#224233] py-2 outline-none text-sm transition-colors text-gray-500 bg-transparent"
                  >
                    <option value="Farmer Verification">Farmer Verification</option>
                    <option value="Buyer Account Setup">Buyer Account Setup</option>
                    <option value="Ministry Oversight">Ministry Oversight</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                <div className="mt-8">
                  <label className="block text-[10px] uppercase font-normal tracking-widest text-[#224233] mb-3">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    required
                    className="w-full border-b-[1.5px] border-gray-200 focus:border-[#224233] py-2 outline-none resize-none text-sm transition-colors"
                    placeholder="How can we help you today?"
                  ></textarea>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-[#224233] text-white px-10 py-4 text-[10px] uppercase font-normal tracking-widest hover:bg-[#112a1a] transition-colors rounded-none w-full md:w-auto ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Message'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Info Panel */}
          <div className="w-full md:w-2/5 bg-[#112a1a] p-8 lg:p-12 text-white flex flex-col justify-center">
            <h3 className="text-xl font-normal mb-10">Contact Information</h3>

            <div className="space-y-10">
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-solum-mint mt-1 mr-5 flex-shrink-0" size={18} />
                <div>
                  <h4 className="text-[10px] uppercase font-normal tracking-widest text-solum-mint mb-2">Headquarters</h4>
                  <p className="text-sm text-gray-400 font-normal leading-relaxed">
                    Ministry of Agriculture Building<br />
                    Avenue Hassan Badi, El Harrach<br />
                    Algiers, Algeria
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <FaPhoneAlt className="text-solum-mint mt-1 mr-5 flex-shrink-0" size={16} />
                <div>
                  <h4 className="text-[10px] uppercase font-normal tracking-widest text-solum-mint mb-2">Direct Line</h4>
                  <p className="text-sm text-gray-400 font-normal">
                    +213 (0) 21 00 00 00<br />
                    Mon-Thu, 8:00 AM - 4:00 PM
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <FaEnvelope className="text-solum-mint mt-1 mr-5 flex-shrink-0" size={16} />
                <div>
                  <h4 className="text-[10px] uppercase font-normal tracking-widest text-solum-mint mb-2">Digital Support</h4>
                  <p className="text-sm text-gray-400 font-normal">
                    support@agrisouk.dz<br />
                    portal@agrisouk.dz
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Map Section */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 mt-8 relative z-10 pb-10">
        <div className="w-full h-80 bg-gray-100 rounded-xl overflow-hidden shadow-xl shadow-gray-200/50 border-[0.5px] border-gray-100">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=Avenue%20Hassan%20Badi,%20El%20Harrach,%20Algiers+(Ministry%20of%20Agriculture)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
            title="Headquarters Location"
            style={{ border: 0 }}
          >
          </iframe>
        </div>
      </section>

    </div>
  );
};

export default Contact;