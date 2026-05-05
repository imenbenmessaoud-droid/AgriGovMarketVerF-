import React from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ChatWidget from './components/common/ChatWidget';

function App() {
   const location = useLocation();
   const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

   return (
      <div className="flex flex-col min-h-screen">
         <Toaster position="top-center" reverseOrder={false} />
         {!isAuthPage && !location.pathname.startsWith('/transporter') && !location.pathname.startsWith('/farmer') && !location.pathname.startsWith('/ministry') && <Header />}
      <main className="flex-grow">
        <AppRoutes />
      </main>
      {!isAuthPage && !location.pathname.startsWith('/transporter') && !location.pathname.startsWith('/farmer') && !location.pathname.startsWith('/ministry') && <Footer />}
      <ChatWidget />
    </div>

  );
}

export default App;
