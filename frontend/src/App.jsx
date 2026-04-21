import React from 'react';
import AppRoutes from './routes/AppRoutes';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function App() {
   const location = useLocation();
   const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

   return (
      <div className="flex flex-col min-h-screen">
         <Toaster position="top-center" reverseOrder={false} />
         {!isAuthPage && <Header />}
      <main className="flex-grow">
        <AppRoutes />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;
