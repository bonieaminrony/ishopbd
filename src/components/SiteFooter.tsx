import React from 'react';
import { CreditCard, Download, Facebook, Phone } from 'lucide-react';

export interface SiteFooterProps {
  siteConfig: any;
  setIsAppDownloadModalOpen: (open: boolean) => void;
  setActivePolicy: (policy: 'about' | 'privacy' | 'refund' | 'terms') => void;
}

export default function SiteFooter({
  siteConfig,
  setIsAppDownloadModalOpen,
  setActivePolicy,
}: SiteFooterProps) {
  return (
    <footer className="bg-[#1a1a1a] text-white pt-12 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 border-b border-gray-800 pb-12">
          {/* Brand/About */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-2xl font-extrabold text-primary mb-6">i SHOP BD</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {siteConfig?.aboutUs && !siteConfig.aboutUs.includes('আই শপ বিডি')
                ? siteConfig.aboutUs
                : 'i SHOP BD - Premium Gadgets & Electronics Shop. Providing top-quality products at affordable prices is our primary mission.'}
            </p>
            <div className="flex gap-4">
              <a
                href={siteConfig?.facebookUrl || 'https://www.facebook.com/online.ishopbd/'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-primary transition-colors"
                title="Follow us on Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href={`tel:${siteConfig?.supportPhone1?.replace(/[^0-9]/g, '') || '01777600844'}`}
                className="p-2 bg-gray-800 rounded-full hover:bg-primary transition-colors"
                title="Call Us"
              >
                <Phone size={20} />
              </a>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => setIsAppDownloadModalOpen(true)}
                  className="hover:text-primary transition-colors cursor-pointer font-bold text-primary flex items-center gap-1.5"
                >
                  <Download size={14} /> Download App
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy('about')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy('privacy')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy('refund')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Refund Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy('terms')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
              </li>
            </ul>
          </div>
          {/* Customer Care */}
          <div>
            <h4 className="font-bold mb-6">Customer Care</h4>
            <div className="flex items-center gap-3 mb-4">
              <a
                href={`tel:${siteConfig?.supportPhone1?.replace(/[^0-9]/g, '') || '01777600844'}`}
                className="p-2 bg-primary/20 rounded-lg text-primary hover:bg-primary/30 transition-colors"
                title="Call Now"
              >
                <Phone size={20} />
              </a>
              <div>
                <p className="text-xs text-gray-400">Helpline (9:00 AM - 9:00 PM)</p>
                <div className="flex flex-col">
                  <a
                    href={`tel:${siteConfig?.supportPhone1?.replace(/[^0-9]/g, '') || '01777600844'}`}
                    className="text-sm font-bold hover:text-primary transition-colors"
                  >
                    {siteConfig?.supportPhone1 || '01777-600844'}
                  </a>
                  <a
                    href={`tel:${siteConfig?.supportPhone2?.replace(/[^0-9]/g, '') || '01977600844'}`}
                    className="text-sm font-bold hover:text-primary transition-colors"
                  >
                    {siteConfig?.supportPhone2 || '01977-600844'}
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={siteConfig?.facebookUrl || 'https://www.facebook.com/online.ishopbd/'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-blue-500/20 rounded-lg text-blue-500 hover:bg-blue-500/30 transition-colors"
                title="Visit our Facebook Page"
              >
                <Facebook size={20} />
              </a>
              <div>
                <p className="text-xs text-gray-400">Facebook Messenger</p>
                <a
                  href={siteConfig?.facebookUrl || 'https://www.facebook.com/online.ishopbd/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold hover:text-primary transition-colors"
                >
                  i SHOP BD Official
                </a>
              </div>
            </div>
          </div>
          {/* Payment Methods */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-bold mb-6">Payment Methods</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-10 bg-white/10 rounded flex items-center justify-center p-2">
                <span className="text-[10px] font-bold text-[#D12053]">BKASH</span>
              </div>
              <div className="h-10 bg-white/10 rounded flex items-center justify-center p-2">
                <span className="text-[10px] font-bold text-[#F7941D]">NAGAD</span>
              </div>
              <div className="h-10 bg-white/10 rounded flex items-center justify-center p-2">
                <span className="text-[10px] font-bold text-[#8C3494]">ROCKET</span>
              </div>
              <div className="h-10 bg-white/10 rounded flex items-center justify-center p-2">
                <CreditCard size={20} className="text-gray-400" />
              </div>
              <div className="h-10 bg-white/10 rounded flex items-center justify-center p-2">
                <span className="text-[10px] font-bold">CASH</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500">
          <p>© 2026 i SHOP BD | All Rights Reserved.</p>
          <p className="mt-1">Developed for the best shopping experience in Bangladesh.</p>
        </div>
      </div>
    </footer>
  );
}
