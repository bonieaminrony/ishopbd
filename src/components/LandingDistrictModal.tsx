import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LandingDistrictModalProps {
  ALL_DISTRICTS: any;
  landingDistrictSearch: any;
  setLandingDistrict: any;
  setLandingThana: any;
  setLandingArea: any;
  setIsLandingDistrictOpen: any;
  landingDistrict: any;
  isLandingDistrictOpen: any;
}

export default function LandingDistrictModal(props: LandingDistrictModalProps) {
  const {
    ALL_DISTRICTS,
    landingDistrictSearch,
    setLandingDistrict,
    setLandingThana,
    setLandingArea,
    setIsLandingDistrictOpen,
    landingDistrict,
    isLandingDistrictOpen,
  } = props;

  return (
    <>
      {isLandingDistrictOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] max-h-60 overflow-y-auto">
                        {ALL_DISTRICTS.filter(d => 
                          d.toLowerCase().includes(landingDistrictSearch.toLowerCase())
                        ).length > 0 ? (
                          ALL_DISTRICTS.filter(d => 
                            d.toLowerCase().includes(landingDistrictSearch.toLowerCase())
                          ).map((d) => (
                            <div
                              key={d}
                              onMouseDown={() => {
                                setLandingDistrict(d);
                                setLandingThana("");
                                if (d === "Dhaka") {
                                  setLandingArea("inside");
                                } else {
                                  setLandingArea("outside");
                                }
                                setIsLandingDistrictOpen(false);
                              }}
                              className={`px-4 py-2.5 hover:bg-red-50 hover:text-primary cursor-pointer text-sm text-left ${
                                landingDistrict === d ? "bg-red-50 text-primary font-bold" : "text-gray-700"
                              }`}
                            >
                              {d}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            জেলা পাওয়া যায়নি
                          </div>
                        )}
                      </div>
                    )}
    </>
  );
}
