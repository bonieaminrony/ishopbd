import React from 'react';
import { motion } from 'motion/react';
import { Key, ShieldCheck, Phone, Eye, EyeOff, ArrowUpRight } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface AdminPasswordModalProps {
  isAdmin: boolean;
  isAdminVerified: boolean;
  is2FAPending: boolean;
  adminOTPSent: boolean;
  setAdminOTPSent: (sent: boolean) => void;
  isSendingOTP: boolean;
  handleSendAdminOTP: () => void;
  adminOTPInput: string;
  setAdminOTPInput: (val: string) => void;
  handleVerifyOTP: () => void;
  adminOTPError: string;
  showAdminPassword: boolean;
  setShowAdminPassword: (show: boolean) => void;
  adminPasswordInput: string;
  setAdminPasswordInput: (val: string) => void;
  handleVerifyAdminPassword: () => void;
  adminPasswordError: boolean;
}

export default function AdminPasswordModal({
  isAdmin,
  isAdminVerified,
  is2FAPending,
  adminOTPSent,
  setAdminOTPSent,
  isSendingOTP,
  handleSendAdminOTP,
  adminOTPInput,
  setAdminOTPInput,
  handleVerifyOTP,
  adminOTPError,
  showAdminPassword,
  setShowAdminPassword,
  adminPasswordInput,
  setAdminPasswordInput,
  handleVerifyAdminPassword,
  adminPasswordError,
}: AdminPasswordModalProps) {
  if (!isAdmin || isAdminVerified) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-secondary/95 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] relative"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
        <div className="text-center mb-8 mt-4">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
            {is2FAPending ? <Key size={40} /> : <ShieldCheck size={40} />}
          </div>
          <h3 className="text-2xl font-black text-secondary mb-2">
            {is2FAPending ? "Two-Step Verification" : "Admin Verification"}
          </h3>
          <p className="text-sm text-gray-400 font-medium px-4">
            {is2FAPending 
              ? "Please enter the 6-digit code sent to your phone for security."
              : "Enter your access password to use the admin or moderator panel."}
          </p>
        </div>
        <div className="space-y-4">
          {is2FAPending ? (
            <>
              {!adminOTPSent ? (
                <button
                  onClick={handleSendAdminOTP}
                  disabled={isSendingOTP}
                  className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  {isSendingOTP ? "Sending code..." : "Send Code (SMS)"}
                  {!isSendingOTP && <Phone size={20} />}
                </button>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={adminOTPInput}
                    onChange={(e) => setAdminOTPInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleVerifyOTP()
                    }
                    placeholder="Verification Code"
                    className={`w-full bg-gray-50 border ${adminOTPError ? "border-red-500" : "border-gray-200"} rounded-2xl py-5 px-6 outline-none focus:ring-2 focus:ring-primary font-bold text-center text-lg tracking-widest`}
                  />
                  <button
                    onClick={handleVerifyOTP}
                    className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 mt-4"
                  >
                    Verify Code
                  </button>
                  <button
                    onClick={() => setAdminOTPSent(false)}
                    className="w-full text-center text-xs text-primary font-bold mt-4 underline"
                  >
                    Go Back
                  </button>
                </div>
              )}
              {adminOTPError && (
                <p className="text-xs text-red-500 font-bold text-center mt-2">
                  {adminOTPError}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="relative">
                <input
                  type={showAdminPassword ? "text" : "password"}
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleVerifyAdminPassword()
                  }
                  placeholder="Enter Password..."
                  className={`w-full bg-gray-50 border ${adminPasswordError ? "border-red-500" : "border-gray-200"} rounded-2xl py-5 pl-6 pr-14 outline-none focus:ring-2 focus:ring-primary font-bold text-center text-lg tracking-widest`}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-4 top-[35px] -translate-y-1/2 text-gray-400 hover:text-primary transition-colors p-2 z-10"
                >
                  {showAdminPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {adminPasswordError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 font-bold text-center mt-2"
                  >
                    Incorrect password! Please try again.
                  </motion.p>
                )}
              </div>
              <button
                onClick={handleVerifyAdminPassword}
                className="w-full bg-secondary text-white font-black py-5 rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                Enter Panel
                <ArrowUpRight size={20} />
              </button>
            </>
          )}
          <button
            onClick={() => signOut(auth)}
            className="w-full bg-white text-gray-400 font-bold py-3 hover:text-red-500 transition-all text-xs"
          >
            Log Out
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
