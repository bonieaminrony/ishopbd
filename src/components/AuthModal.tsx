import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowRight } from 'lucide-react';

export interface AuthModalProps {
  setIsAuthModalOpen: any;
  authModalType: any;
  handleCustomAuth: any;
  authName: any;
  setAuthName: any;
  authIdentifier: any;
  setAuthIdentifier: any;
  authPassword: any;
  setAuthPassword: any;
  isAuthLoading: any;
  handleLogin: any;
  Facebook: any;
  setAuthModalType: any;
  isAuthModalOpen: any;
}

export default function AuthModal(props: AuthModalProps) {
  const {
    setIsAuthModalOpen,
    authModalType,
    handleCustomAuth,
    authName,
    setAuthName,
    authIdentifier,
    setAuthIdentifier,
    authPassword,
    setAuthPassword,
    isAuthLoading,
    handleLogin,
    Facebook,
    setAuthModalType,
    isAuthModalOpen,
  } = props;

  return (
    <>
      {isAuthModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-secondary/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-[460px] rounded-3xl p-10 shadow-2xl relative z-10 overflow-hidden border border-gray-100"
            >
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-red-50 text-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <User size={24} />
                </div>
                <h3 className="text-2xl font-bold text-secondary tracking-tight">
                  {authModalType === "login" ? "Welcome Back" : "Create Account"}
                </h3>
                <p className="text-sm text-gray-400 font-medium mt-1">
                  {authModalType === "login" ? "Please login to track your orders" : "Create a new account to start shopping"}
                </p>
              </div>
              <form onSubmit={handleCustomAuth} className="space-y-4">
                {authModalType === "signup" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-0.5">
                      Your Name
                    </label>
                    <input
                      required
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-gray-50/50 border border-gray-200/80 rounded-xl py-3 px-4 text-sm font-medium text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-300"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-0.5">
                    Email or Phone Number
                  </label>
                  <input
                    required
                    type="text"
                    value={authIdentifier}
                    onChange={(e) => setAuthIdentifier(e.target.value)}
                    placeholder="example@mail.com or 01xxxxxxxxx"
                    className="w-full bg-gray-50/50 border border-gray-200/80 rounded-xl py-3 px-4 text-sm font-medium text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-0.5">
                    Password
                  </label>
                  <input
                    required
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Your Password"
                    className="w-full bg-gray-50/50 border border-gray-200/80 rounded-xl py-3 px-4 text-sm font-medium text-secondary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full bg-primary text-white py-3.5 rounded-xl text-sm font-semibold shadow-md shadow-primary/10 hover:bg-black transition-all disabled:opacity-50 mt-6 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAuthLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {authModalType === "login" ? "Login" : "Create Account"}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
              <div className="mt-6">
                <div className="relative flex items-center justify-center mb-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                  <div className="relative bg-white px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    OR CONTINUE WITH
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      handleLogin("google");
                    }}
                    className="flex items-center justify-center gap-2 bg-white border border-gray-200 py-2.5 rounded-xl text-xs font-semibold text-secondary hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
                  >
                    <img loading="lazy" src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                    Google 
                  </button>
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      handleLogin("facebook");
                    }}
                    className="flex items-center justify-center gap-2 bg-[#1877F2] text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-[#166fe5] transition-all shadow-sm shadow-[#1877F2]/10 cursor-pointer"
                  >
                    <Facebook size={16} />
                    Facebook
                  </button>
                </div>
              </div>
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setAuthModalType(authModalType === "login" ? "signup" : "login")}
                  className="text-xs font-medium text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                  {authModalType === "login" ? (
                    <>Don't have an account? <span className="text-primary font-semibold ml-1">Register</span></>
                  ) : (
                    <>Already have an account? <span className="text-primary font-semibold ml-1">Login</span></>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
    </>
  );
}
