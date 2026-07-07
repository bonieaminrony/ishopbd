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
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User size={32} />
                </div>
                <h3 className="text-3xl font-black text-secondary">
                  {authModalType === "login" ? "লগইন করুন" : "নতুন একাউন্ট"}
                </h3>
                <p className="text-base text-gray-500 font-bold mt-2">
                  {authModalType === "login" ? "অর্ডার ট্র‍্যাক করতে লগইন করুন" : "নতুন একাউন্ট তৈরি করে শপিং করুন"}
                </p>
              </div>
              <form onSubmit={handleCustomAuth} className="space-y-5">
                {authModalType === "signup" && (
                  <div>
                    <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                      আপনার নাম
                    </label>
                    <input
                      required
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="পুরো নাম লিখুন"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-base font-bold focus:border-primary outline-none transition-all"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                    ইমেইল বা ফোন নম্বর
                  </label>
                  <input
                    required
                    type="text"
                    value={authIdentifier}
                    onChange={(e) => setAuthIdentifier(e.target.value)}
                    placeholder="example@mail.com বা 01xxxxxxxxx"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-base font-bold focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                    পাসওয়ার্ড
                  </label>
                  <input
                    required
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="আপনার পাসওয়ার্ড"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-base font-bold focus:border-primary outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full bg-primary text-white py-4 rounded-2xl text-lg font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
                >
                  {isAuthLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {authModalType === "login" ? "লগইন" : "একাউন্ট তৈরি করুন"}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
              <div className="mt-8">
                <div className="relative flex items-center justify-center mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                  <div className="relative bg-white px-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                    অথবা
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      handleLogin("google");
                    }}
                    className="flex items-center justify-center gap-2 bg-white border border-gray-100 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <img loading="lazy" src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                    Google 
                  </button>
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      handleLogin("facebook");
                    }}
                    className="flex items-center justify-center gap-2 bg-[#1877F2] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#166fe5] transition-all shadow-sm shadow-[#1877F2]/10"
                  >
                    <Facebook size={18} />
                    Facebook
                  </button>
                </div>
              </div>
              <div className="mt-8 text-center">
                <button
                  onClick={() => setAuthModalType(authModalType === "login" ? "signup" : "login")}
                  className="text-sm font-bold text-gray-500 hover:text-primary transition-colors"
                >
                  {authModalType === "login" ? (
                    <>একাউন্ট নেই? <span className="text-secondary font-black ml-1">রেজিস্ট্রেশন করুন</span></>
                  ) : (
                    <>ইতিমধ্যেই একাউন্ট আছে? <span className="text-secondary font-black ml-1">লগইন করুন</span></>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
    </>
  );
}
