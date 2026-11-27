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
    <footer className="bg-secondary text-white pt-12 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 border-b border-white/10 pb-12">
          {/* Brand/About */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-2xl font-extrabold text-white mb-6">i SHOP <span className="text-[#ff5a6e]">BD</span></h2>
            <p className="text-sm text-white/65 leading-relaxed mb-6">
              {siteConfig?.aboutUs && !siteConfig.aboutUs.includes('আই শপ বিডি')
                ? siteConfig.aboutUs
                : 'i SHOP BD - Premium Gadgets & Electronics Shop. Providing top-quality products at affordable prices is our primary mission.'}
            </p>
            <div className="flex gap-4">
              <a
                href={siteConfig?.facebookUrl || 'https://www.facebook.com/online.ishopbd/'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-primary transition-colors"
                title="Follow us on Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href={`tel:${siteConfig?.supportPhone1?.replace(/[^0-9]/g, '') || '01777600844'}`}
                className="p-2 bg-white/10 rounded-full hover:bg-primary transition-colors"
                title="Call Us"
              >
                <Phone size={20} />
              </a>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-white/65">
              <li>
                <button
                  onClick={() => setIsAppDownloadModalOpen(true)}
                  className="transition-colors cursor-pointer font-bold text-[#ff5a6e] hover:text-white flex items-center gap-1.5"
                >
                  <Download size={14} /> Download App
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy('about')}
                  className="hover:text-[#ff5a6e] transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy('privacy')}
                  className="hover:text-[#ff5a6e] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy('refund')}
                  className="hover:text-[#ff5a6e] transition-colors cursor-pointer"
                >
                  Refund Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy('terms')}
                  className="hover:text-[#ff5a6e] transition-colors cursor-pointer"
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
                className="p-2 bg-white/10 rounded-lg text-white hover:bg-primary transition-colors"
                title="Call Now"
              >
                <Phone size={20} />
              </a>
              <div>
                <p className="text-xs text-white/65">Helpline (9:00 AM - 9:00 PM)</p>
                <div className="flex flex-col">
                  <a
                    href={`tel:${siteConfig?.supportPhone1?.replace(/[^0-9]/g, '') || '01777600844'}`}
                    className="text-sm font-bold hover:text-[#ff5a6e] transition-colors"
                  >
                    {siteConfig?.supportPhone1 || '01777-600844'}
                  </a>
                  <a
                    href={`tel:${siteConfig?.supportPhone2?.replace(/[^0-9]/g, '') || '01977600844'}`}
                    className="text-sm font-bold hover:text-[#ff5a6e] transition-colors"
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
                className="p-2 bg-white/10 rounded-lg text-white hover:bg-[#1877f2] transition-colors"
                title="Visit our Facebook Page"
              >
                <Facebook size={20} />
              </a>
              <div>
                <p className="text-xs text-white/65">Facebook Messenger</p>
                <a
                  href={siteConfig?.facebookUrl || 'https://www.facebook.com/online.ishopbd/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold hover:text-[#ff5a6e] transition-colors"
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
              <div className="h-10 bg-white rounded-lg flex items-center justify-center p-2">
                <span className="text-[10px] font-bold text-[#D12053]">BKASH</span>
              </div>
              <div className="h-10 bg-white rounded-lg flex items-center justify-center p-2">
                <span className="text-[10px] font-bold text-[#F7941D]">NAGAD</span>
              </div>
              <div className="h-10 bg-white rounded-lg flex items-center justify-center p-2">
                <span className="text-[10px] font-bold text-secondary">ROCKET</span>
              </div>
              <div className="h-10 bg-white rounded-lg flex items-center justify-center p-2">
                <CreditCard size={20} className="text-secondary/70" />
              </div>
              <div className="h-10 bg-white rounded-lg flex items-center justify-center p-2">
                <span className="text-[10px] font-bold text-secondary">CASH</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-white/50">
          <p>© 2026 i SHOP BD | All Rights Reserved.</p>
          <p className="mt-1">Developed for the best shopping experience in Bangladesh.</p>
        </div>
      </div>
    </footer>
  );
}
