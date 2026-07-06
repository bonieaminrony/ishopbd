import React, { createContext, useContext, useState, ReactNode } from 'react';

type ProfileTab = "info" | "orders" | "transactions" | "refunds";

interface UIContextType {
  isProfileOpen: boolean;
  setIsProfileOpen: (val: boolean) => void;
  profileTab: ProfileTab;
  setProfileTab: (val: ProfileTab) => void;
  activePolicy: string | null;
  setActivePolicy: (val: string | null) => void;
  isQuotaExceeded: boolean;
  setIsQuotaExceeded: (val: boolean) => void;
  adminReplyingTo: any;
  setAdminReplyingTo: (val: any) => void;
  chatReplyingTo: any;
  setChatReplyingTo: (val: any) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<ProfileTab>("orders");
  const [activePolicy, setActivePolicy] = useState<string | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [adminReplyingTo, setAdminReplyingTo] = useState<any>(null);
  const [chatReplyingTo, setChatReplyingTo] = useState<any>(null);

  return (
    <UIContext.Provider value={{
      isProfileOpen, setIsProfileOpen,
      profileTab, setProfileTab,
      activePolicy, setActivePolicy,
      isQuotaExceeded, setIsQuotaExceeded,
      adminReplyingTo, setAdminReplyingTo,
      chatReplyingTo, setChatReplyingTo
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUIContext = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return context;
};
