import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Admin from './pages/Admin';
import Status from './pages/Status';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Header />
        
        <main className="flex-grow-1">
          <Routes>
            {/* Page d'accueil avec formulaire client */}
            <Route path="/" element={<Home />} />
            
            {/* Interface administration */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/login" element={<Admin />} />
            
            {/* Suivi de demande */}
            <Route path="/status/:id" element={<Status />} />
            
            {/* Pages de paiement */}
            <Route path="/payment/:id" element={<Payment />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            
            {/* Page 404 */}
            <Route path="*" element={
              <div className="container text-center py-5">
                <h1 className="display-1">404</h1>
                <h2>Page non trouvée</h2>
                <p>La page que vous cherchez n'existe pas.</p>
                <a href="/" className="btn btn-primary">Retour à l'accueil</a>
              </div>
            } />
          </Routes>
        </main>
        
        <Footer />
        
        {/* Notifications toast */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;