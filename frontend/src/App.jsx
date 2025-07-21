import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy } from "react";

import Login from './pages/authentification/Login';
import Register from './pages/authentification/Register';
import ForgotPassword from './pages/authentification/ForgotPassword';
import ResetPassword from './pages/authentification/ResetPassword';
import VerifyEmail from './pages/authentification/VerifyEmail';
import EmailVerified from './pages/authentification/EmailVerified';
import EmailVerificationSent from './pages/authentification/EmailVerificationSent';

import { SidebarProvider } from "./components/layout/SidebarContext";
import { ThemeProvider } from "./components/common/themeContext";

import MainPage from './pages/Landing page/MainPage';
import HelloVelya from './pages/HelloVelya';
import Home from './components/home/Home';
import UserProfilePage from './pages/UserProfilePage';
import ClientDashboard from './pages/AdminDashboard/ClientDashboard';
import AppLayout from './components/layout/AppLayout';
import Slider from "./components/Landing page/vousQuestion";


const ImportData = lazy(() => import("./pages/Excel/ImportData"));
const ListOrdersPage = lazy(() => import("./pages/Data/ListOrdersPage"));
const WhatsAppConnectionPage = lazy(() => import("./pages/WhatsApp/WhatsAppConnectionPage"));
const CreateOfferPage = lazy(() => import("./pages/Offer/CreateOfferPage"));
const OffersListPage = lazy(() => import("./pages/Offer/OffersListPage"));
const CreateMessages = lazy(() => import("./pages/Message/CreateMessages"));
const MessagesListPage = lazy(() => import("./pages/Message/MessagesListPage"));
const Produit = lazy(() => import("./pages/Product/Produit"));
const Detail = lazy(() => import("./pages/Product/Detail"));
const Productl = lazy(() => import("./pages/Product/DetailProductPage"));
const CreateProductPage = lazy(() => import("./pages/Product/CreateProductPage"));
const FaqManager = lazy(() => import("./pages/FAQ/FaqManager"));
const ContactPage = lazy(() => import("./pages/Contact/ContactPage"));

const isAuthentifcated = () => {
  const storedToken = localStorage.getItem('token');
  console.log('isAuthenticated check : Token in localStorage?', !!storedToken);
  return !!storedToken;

};
const isAdmin = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const isUserAdmin = user && user.role === 'admin';
    console.log('isAdmin check:parsed user from localStorage :', user);
    console.log('isAdmin check:is user an admin :', isUserAdmin);
    return isUserAdmin;


  } catch (e) {
    console.log("error parsing user from localStorage for isAdmin: ", e);
    return false;
  }
};
const PrivateRoute = ({ children }) => {
  if (!isAuthentifcated()) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin()) {
    console.warn("Access Denied : User is not an admin");
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const handleLogin = (newToken, userData) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify({ token: newToken, role: userData.role }));
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <ThemeProvider>

      <Router>
        <SidebarProvider>
          <main className="relative min-h-screen w-screen overflow-x-hidden">

            <Routes>

              <Route index element={<MainPage />} />


              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/email-verified" element={<EmailVerified />} />
              <Route path="/email-verification-sent" element={<EmailVerificationSent />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/Slider" element={<Slider />} />







              <Route element={<AppLayout token={token} onLogout={handleLogout} />}>
                <Route path="/dashboard" element={<HelloVelya />} />
                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<UserProfilePage token={token} />} />
                <Route path="/users/:userId" element={<UserProfilePage token={token} />} />

                {/* Data Routes */}
                <Route path="importData" element={<ImportData />} />
                <Route path="listOrdersPage" element={<ListOrdersPage />} />

                {/* WhatsApp Route */}
                <Route path="whatsapp" element={<WhatsAppConnectionPage />} />

                {/* Offer Routes */}
                <Route path="createOffer" element={<CreateOfferPage />} />
                <Route path="offers/edit/:id" element={<CreateOfferPage />} />
                <Route path="offersListPage" element={<OffersListPage />} />

                {/* Message Routes */}
                <Route path="createMessages" element={<CreateMessages />} />
                <Route path="messages/edit/:id" element={<CreateMessages />} />
                <Route path="MessagesListPage" element={<MessagesListPage />} />

                {/* Product Routes */}
                <Route path="produitDetail/:SKU" element={<Productl />} />
                <Route path="produit" element={<Produit />} />
                <Route path="produit/:SKU" element={<Detail />} />
                <Route path="createProduct" element={<CreateProductPage />} />

                {/* FAQ Route */}
                <Route path="faq" element={<FaqManager />} />
                <Route path='/admin/clients' element={
                  <PrivateRoute><ClientDashboard /></PrivateRoute>
                } />


              </Route>
            </Routes>
          </main>
        </SidebarProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;