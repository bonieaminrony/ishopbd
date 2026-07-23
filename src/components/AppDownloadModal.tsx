import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Smartphone, Laptop, Download, Apple, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

export interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: any;
}

export default function AppDownloadModal({ isOpen, onClose, siteConfig }: AppDownloadModalProps) {
  const [deviceOS, setDeviceOS] = useState<string>('Unknown');
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      let os = 'Unknown';
      if (userAgent.indexOf('win') !== -1) os = 'Windows';
      else if (userAgent.indexOf('mac') !== -1 && !/ipad|iphone|ipod/.test(userAgent)) os = 'macOS';
      else if (/ipad|iphone|ipod/.test(userAgent)) os = 'iOS';
      else if (userAgent.indexOf('android') !== -1) os = 'Android';
      else if (userAgent.indexOf('linux') !== -1) os = 'Linux';
      
      setDeviceOS(os);

      // Set matching download url
      if (os === 'Windows' || os === 'macOS' || os === 'Linux') {
        setDownloadUrl(siteConfig?.computerAppUrl || '/apps/ishopbd-setup.exe');
      } else if (os === 'Android') {
        setDownloadUrl(siteConfig?.androidAppUrl || '/apps/ishopbd.apk');
      } else if (os === 'iOS') {
        setDownloadUrl(siteConfig?.iphoneAppUrl || '#');
      } else {
        setDownloadUrl(siteConfig?.computerAppUrl || '/apps/ishopbd-setup.exe');
      }
    }
  }, [siteConfig]);

  const handleSmartDownload = (e: React.MouseEvent) => {
    if (deviceOS === 'iOS' && (!siteConfig?.iphoneAppUrl || siteConfig.iphoneAppUrl === '#')) {
      e.preventDefault();
      alert('আইফোন অ্যাপটি বর্তমানে অ্যাপল অ্যাপ স্টোরে রিভিউতে রয়েছে। খুব শীঘ্রই এটি লাইভ হবে!');
      return;
    }
  };

  const getOSDisplayName = (os: string) => {
    switch (os) {
      case 'Windows': return 'Windows PC';
      case 'macOS': return 'macOS Device';
      case 'Linux': return 'Linux Computer';
      case 'Android': return 'অ্যান্ড্রয়েড ফোন';
      case 'iOS': return 'আইফোন (iOS)';
      default: return 'স্মার্ট ডিভাইস';
    }
  };

  const getOSIcon = (os: string) => {
    switch (os) {
      case 'Windows':
      case 'macOS':
      case 'Linux':
        return <Laptop className="text-primary" size={24} />;
      case 'Android':
        return <Smartphone className="text-primary" size={24} />;
      case 'iOS':
        return <Apple className="text-primary" size={24} />;
      default:
        return <Smartphone className="text-primary" size={24} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      {/* Modal Box */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]"
      >
        {/* Left Banner Column (Visual App Preview) */}
        <div className="md:col-span-5 bg-gradient-to-br from-primary via-red-500 to-rose-600 p-8 flex flex-col justify-between relative overflow-hidden text-white min-h-[250px] md:min-h-auto">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top content */}
          <div className="relative z-10">
            <span className="text-[10px] bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-bold uppercase tracking-wider">i SHOP BD App</span>
            <h4 className="text-2xl font-black mt-3 leading-tight font-ador">শপিং করুন আরও সহজে, যেকোনো সময়!</h4>
          </div>

          {/* CSS Phone Mockup Preview */}
          <div className="relative mx-auto mt-6 md:mt-0 w-[160px] h-[220px] bg-neutral-900 rounded-t-3xl border-4 border-neutral-800 shadow-2xl overflow-hidden flex flex-col pt-3 z-10">
            {/* Phone Notch/Speaker */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-3 bg-neutral-800 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-neutral-900 rounded-full mr-2" />
              <span className="w-6 h-0.5 bg-neutral-900 rounded-full" />
            </div>

            {/* Screen Content */}
            <div className="flex-1 bg-cream p-3 flex flex-col justify-between">
              {/* Fake App Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="text-[8px] font-black text-primary">i SHOP BD</span>
                <span className="w-3 h-3 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                </span>
              </div>
              
              {/* Mini Card */}
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100/50 flex flex-col gap-1">
                <div className="w-full h-10 bg-gray-100 rounded-md animate-pulse" />
                <span className="w-12 h-1.5 bg-gray-300 rounded animate-pulse" />
                <span className="w-8 h-1.5 bg-primary/30 rounded animate-pulse" />
              </div>

              {/* Install Success Check */}
              <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-md p-1">
                <CheckCircle className="text-green-500 shrink-0" size={10} />
                <span className="text-[7px] text-green-700 font-bold leading-none">Fast & Secure Install</span>
              </div>
            </div>
          </div>

          {/* Bottom features list */}
          <div className="relative z-10 hidden md:block space-y-2.5">
            <div className="flex items-center gap-2 text-xs">
              <Zap size={14} className="text-amber-300 shrink-0" />
              <span className="font-bold">সুপার ফাস্ট ট্র্যাকিং সিস্টেম</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck size={14} className="text-emerald-300 shrink-0" />
              <span className="font-bold">১০০% নিরাপদ ডাউনলোড ও পেমেন্ট</span>
            </div>
          </div>
        </div>

        {/* Right Content Column */}
        <div className="md:col-span-7 p-8 flex flex-col justify-between relative bg-white">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-full transition-all active:scale-90"
          >
            <X size={18} />
          </button>

          <div>
            {/* Logo and Headings */}
            <div className="mb-6 pr-8">
              <h3 className="text-2xl font-black text-secondary tracking-tight">অফিশিয়াল অ্যাপ ডাউনলোড</h3>
              <p className="text-xs text-gray-400 mt-1 font-bold">
                আমাদের অফিশিয়াল কাস্টমার মোবাইল ও কম্পিউটার ক্লায়েন্ট অ্যাপ ডাউনলোড করুন।
              </p>
            </div>

            {/* Smart Detection Box */}
            <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                {getOSIcon(deviceOS)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] bg-primary/10 text-primary font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ডিভাইস ডিটেকশন
                </span>
                <h4 className="text-sm font-black text-secondary mt-1">
                  {getOSDisplayName(deviceOS)} প্রস্তুত!
                </h4>
              </div>
            </div>

            {/* Main Download Button */}
            <a
              href={downloadUrl}
              onClick={handleSmartDownload}
              download={deviceOS !== 'iOS' && deviceOS !== 'Unknown'}
              target={deviceOS === 'iOS' ? '_blank' : undefined}
              rel={deviceOS === 'iOS' ? 'noopener noreferrer' : undefined}
              className="w-full bg-primary hover:bg-red-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-sm tracking-widest uppercase mb-8 cursor-pointer"
            >
              <Download size={18} />
              {deviceOS === 'iOS' ? 'অ্যাপ স্টোর থেকে নিন' : 'সরাসরি ডাউনলোড'}
            </a>
          </div>

          {/* Alternative links */}
          <div>
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">অন্যান্য প্ল্যাটফর্ম</h5>
            <div className="grid grid-cols-3 gap-2.5">
              <a
                href={siteConfig?.computerAppUrl || '/apps/ishopbd-setup.exe'}
                download
                className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 text-center hover:bg-gray-50 ${
                  deviceOS === 'Windows' || deviceOS === 'macOS' || deviceOS === 'Linux'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-100'
                }`}
              >
                <Laptop size={18} className={deviceOS === 'Windows' || deviceOS === 'macOS' || deviceOS === 'Linux' ? 'text-primary' : 'text-gray-400'} />
                <span className="text-[9px] font-black text-secondary leading-none">PC / Mac</span>
              </a>

              <a
                href={siteConfig?.androidAppUrl || '/apps/ishopbd.apk'}
                download
                className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 text-center hover:bg-gray-50 ${
                  deviceOS === 'Android' ? 'border-primary bg-primary/5' : 'border-gray-100'
                }`}
              >
                <Smartphone size={18} className={deviceOS === 'Android' ? 'text-primary' : 'text-gray-400'} />
                <span className="text-[9px] font-black text-secondary leading-none">Android</span>
              </a>

              <a
                href={siteConfig?.iphoneAppUrl || '#'}
                onClick={(e) => {
                  if (!siteConfig?.iphoneAppUrl || siteConfig.iphoneAppUrl === '#') {
                    e.preventDefault();
                    alert('আইফোন অ্যাপটি বর্তমানে অ্যাপল অ্যাপ স্টোরে রিভিউতে রয়েছে। খুব শীঘ্রই এটি লাইভ হবে!');
                  }
                }}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 text-center hover:bg-gray-50 ${
                  deviceOS === 'iOS' ? 'border-primary bg-primary/5' : 'border-gray-100'
                }`}
              >
                <Apple size={18} className={deviceOS === 'iOS' ? 'text-primary' : 'text-gray-400'} />
                <span className="text-[9px] font-black text-secondary leading-none">iPhone</span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
