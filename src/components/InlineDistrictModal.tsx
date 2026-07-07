import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface InlineDistrictModalProps {
  ALL_DISTRICTS: any;
  inlineDistrictSearch: any;
  setInlineOrderDistrict: any;
  setInlineOrderThana: any;
  setInlineOrderArea: any;
  setIsInlineDistrictOpen: any;
  inlineOrderDistrict: any;
  isInlineDistrictOpen: any;
}

export default function InlineDistrictModal(props: InlineDistrictModalProps) {
  const {
    ALL_DISTRICTS,
    inlineDistrictSearch,
    setInlineOrderDistrict,
    setInlineOrderThana,
    setInlineOrderArea,
    setIsInlineDistrictOpen,
    inlineOrderDistrict,
    isInlineDistrictOpen,
  } = props;

  return (
    <>
      {isInlineDistrictOpen && (
                              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] max-h-60 overflow-y-auto">
                                {ALL_DISTRICTS.filter(d => 
                                  d.toLowerCase().includes(inlineDistrictSearch.toLowerCase())
                                ).length > 0 ? (
                                  ALL_DISTRICTS.filter(d => 
                                    d.toLowerCase().includes(inlineDistrictSearch.toLowerCase())
                                  ).map((d) => (
                                    <div
                                      key={d}
                                      onMouseDown={() => {
                                        setInlineOrderDistrict(d);
                                        setInlineOrderThana("");
                                        if (d === "Dhaka") {
                                          setInlineOrderArea("inside");
                                        } else {
                                          setInlineOrderArea("outside");
                                        }
                                        setIsInlineDistrictOpen(false);
                                      }}
                                      className={`px-4 py-2.5 hover:bg-red-50 hover:text-primary cursor-pointer text-sm text-left ${
                                        inlineOrderDistrict === d ? "bg-red-50 text-primary font-bold" : "text-gray-700"
                                      }`}
                                    >
                                      {d}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                   ঢাকার মধ্যে
                                  </div>
                                )}
                              </div>
                            )}
    </>
  );
}
