import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Smartphone, Laptop, Download, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

export interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: any;
  deferredPrompt?: any;
  handleInstallPWA?: () => void;
}

export default function AppDownloadModal({ isOpen, onClose, siteConfig, deferredPrompt, handleInstallPWA }: AppDownloadModalProps) {
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
        setDownloadUrl(siteConfig?.computerAppUrl || '');
      } else if (os === 'Android') {
        setDownloadUrl(siteConfig?.androidAppUrl || '');
      } else if (os === 'iOS') {
        setDownloadUrl(siteConfig?.iphoneAppUrl || '');
      } else {
        setDownloadUrl(siteConfig?.computerAppUrl || '');
      }
    }
  }, [siteConfig]);

  const downloadDesktopShortcut = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rokomariponnohari.com';
    const content = `[InternetShortcut]\r\nURL=${origin}\r\nIconIndex=0\r\nIconFile=${origin}/icon-192x192.png\r\n`;
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Rokomari Ponno Hari App.url';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSmartDownload = (e: React.MouseEvent) => {
    if (deviceOS === 'iOS') {
      if (!siteConfig?.iphoneAppUrl || siteConfig.iphoneAppUrl === '#' || siteConfig.iphoneAppUrl.trim() === '') {
        e.preventDefault();
        alert('The iPhone app is currently undergoing Apple App Store review. It will be live soon!');
        return;
      }
      return;
    }

    const currentUrl = (
      deviceOS === 'Android' 
        ? siteConfig?.androidAppUrl 
        : siteConfig?.computerAppUrl
    )?.trim() || '';

    // If an explicit external download URL is provided (Google Drive, Dropbox, Play Store, Mediafire, etc.)
    if (currentUrl && currentUrl !== '#' && !currentUrl.startsWith('/apps/')) {
      return;
    }

    // 1. If PWA installation is available, trigger native app installation!
    if (deferredPrompt && handleInstallPWA) {
      e.preventDefault();
      handleInstallPWA();
      onClose();
      return;
    }

    // 2. If on PC / Windows, download official Desktop App shortcut instantly!
    if (deviceOS === 'Windows' || deviceOS === 'macOS' || deviceOS === 'Linux' || deviceOS === 'Unknown') {
      e.preventDefault();
      downloadDesktopShortcut();
      onClose();
      return;
    }

    // 3. If on Android without PWA event, instruct to install from browser menu
    if (deviceOS === 'Android') {
      e.preventDefault();
      alert('To install on your phone, open the browser menu (⋮) and tap "Add to Home screen" or "Install app".');
      return;
    }
  };

  const handlePlatformClick = (platform: 'pc' | 'android' | 'ios', e: React.MouseEvent) => {
    if (platform === 'ios') {
      if (!siteConfig?.iphoneAppUrl || siteConfig.iphoneAppUrl === '#' || siteConfig.iphoneAppUrl.trim() === '') {
        e.preventDefault();
        alert('The iPhone app is currently undergoing Apple App Store review. It will be live soon!');
        return;
      }
      return;
    }

    const currentUrl = (platform === 'android' ? siteConfig?.androidAppUrl : siteConfig?.computerAppUrl)?.trim() || '';
    if (currentUrl && currentUrl !== '#' && !currentUrl.startsWith('/apps/')) {
      return;
    }

    if (deferredPrompt && handleInstallPWA) {
      e.preventDefault();
      handleInstallPWA();
      onClose();
      return;
    }

    if (platform === 'pc') {
      e.preventDefault();
      downloadDesktopShortcut();
      onClose();
      return;
    }

    if (platform === 'android') {
      e.preventDefault();
      alert('To install on your phone, open the browser menu (⋮) and tap "Add to Home screen" or "Install app".');
      return;
    }
  };

  const getOSDisplayName = (os: string) => {
    switch (os) {
      case 'Windows': return 'Windows PC';
      case 'macOS': return 'macOS Device';
      case 'Linux': return 'Linux Computer';
      case 'Android': return 'Android Phone';
      case 'iOS': return 'iPhone (iOS)';
      default: return 'Smart Device';
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
        return <img src="/icon-192x192.png" alt="iOS App" className="w-6 h-6 object-contain" />;
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
        <div className="md:col-span-5 bg-gradient-to-br from-emerald-800 via-emerald-700 to-amber-700 p-8 flex flex-col justify-between relative overflow-hidden text-white min-h-[250px] md:min-h-auto">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top content */}
          <div className="relative z-10">
            <span className="text-[10px] bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-bold uppercase tracking-wider">রকমারি পণ্য হাড়ি অ্যাপ</span>
            <h4 className="text-2xl font-black mt-3 leading-tight">Shop Smarter, Anytime, Anywhere!</h4>
          </div>

          {/* CSS Phone Mockup Preview */}
          <div className="relative mx-auto mt-6 md:mt-0 w-[160px] h-[220px] bg-neutral-900 rounded-t-3xl border-4 border-neutral-800 shadow-2xl overflow-hidden flex flex-col pt-3 z-10">
            {/* Phone Notch/Speaker */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-3 bg-neutral-800 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-neutral-900 rounded-full mr-2" />
              <span className="w-6 h-0.5 bg-neutral-900 rounded-full" />
            </div>

            {/* Screen Content */}
            <div className="flex-1 bg-[#FAF7F0] p-3 flex flex-col justify-between">
              {/* Fake App Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="text-[9px] font-black text-emerald-800">রকমারি পণ্য হাড়ি</span>
                <span className="w-3 h-3 bg-emerald-700/10 rounded-full flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-emerald-700 rounded-full animate-ping" />
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
              <span className="font-bold">Super Fast Order Tracking</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck size={14} className="text-emerald-300 shrink-0" />
              <span className="font-bold">100% Safe Download & Payments</span>
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
              <h3 className="text-2xl font-black text-secondary tracking-tight">Download Official App</h3>
              <p className="text-xs text-gray-400 mt-1 font-bold">
                Download our official mobile and desktop application for faster shopping.
              </p>
            </div>

            {/* Smart Detection Box */}
            <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                {getOSIcon(deviceOS)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] bg-primary/10 text-primary font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Device Detection
                </span>
                <h4 className="text-sm font-black text-secondary mt-1">
                  {getOSDisplayName(deviceOS)} Ready!
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
              {deviceOS === 'iOS' ? 'Get on App Store' : 'Direct Download'}
            </a>
          </div>

          {/* Alternative links */}
          <div>
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Other Platforms</h5>
            <div className="grid grid-cols-3 gap-2.5">
              <a
                href={siteConfig?.computerAppUrl || '#'}
                onClick={(e) => handlePlatformClick('pc', e)}
                download={!!(siteConfig?.computerAppUrl && !siteConfig.computerAppUrl.startsWith('http'))}
                target={siteConfig?.computerAppUrl?.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 text-center hover:bg-gray-50 cursor-pointer ${
                  deviceOS === 'Windows' || deviceOS === 'macOS' || deviceOS === 'Linux'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-100'
                }`}
              >
                <Laptop size={18} className={deviceOS === 'Windows' || deviceOS === 'macOS' || deviceOS === 'Linux' ? 'text-primary' : 'text-gray-400'} />
                <span className="text-[9px] font-black text-secondary leading-none">PC / Mac</span>
              </a>

              <a
                href={siteConfig?.androidAppUrl || '#'}
                onClick={(e) => handlePlatformClick('android', e)}
                download={!!(siteConfig?.androidAppUrl && !siteConfig.androidAppUrl.startsWith('http'))}
                target={siteConfig?.androidAppUrl?.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 text-center hover:bg-gray-50 cursor-pointer ${
                  deviceOS === 'Android' ? 'border-primary bg-primary/5' : 'border-gray-100'
                }`}
              >
                <Smartphone size={18} className={deviceOS === 'Android' ? 'text-primary' : 'text-gray-400'} />
                <span className="text-[9px] font-black text-secondary leading-none">Android</span>
              </a>

              <a
                href={siteConfig?.iphoneAppUrl || '#'}
                onClick={(e) => handlePlatformClick('ios', e)}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 text-center hover:bg-gray-50 cursor-pointer ${
                  deviceOS === 'iOS' ? 'border-primary bg-primary/5' : 'border-gray-100'
                }`}
              >
                <img 
                  src="/icon-192x192.png" 
                  alt="iPhone" 
                  className={`w-[18px] h-[18px] object-contain ${deviceOS === 'iOS' ? '' : 'opacity-40 grayscale'}`} 
                  onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="text-[9px] font-black text-secondary leading-none">iPhone</span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
