import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headset, X, TrendingUp, Mic, Heart, ThumbsUp, Camera, Square, Send } from 'lucide-react';

export interface ChatModalProps {
  setIsChatOpen: any;
  chatMessages: any;
  user: any;
  sessionId: any;
  handleToggleReaction: any;
  setChatReplyingTo: any;
  chatEndRef: any;
  chatReplyingTo: any;
  handleSendMessage: any;
  handleImageUpload: any;
  chatMessage: any;
  setChatMessage: any;
  handleVoiceToggle: any;
  isRecording: any;
  isChatOpen: any;
}

export default function ChatModal(props: ChatModalProps) {
  const {
    setIsChatOpen,
    chatMessages,
    user,
    sessionId,
    handleToggleReaction,
    setChatReplyingTo,
    chatEndRef,
    chatReplyingTo,
    handleSendMessage,
    handleImageUpload,
    chatMessage,
    setChatMessage,
    handleVoiceToggle,
    isRecording,
    isChatOpen,
  } = props;

  return (
    <>
      {isChatOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-end md:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="w-full md:w-[400px] h-[600px] bg-white md:rounded-[2.5rem] shadow-2xl flex flex-col pointer-events-auto overflow-hidden relative"
            >
              {/* Chat Header */}
              <div className="bg-primary p-6 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Headset size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">i SHOP BD Support</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
                        AI Assistant Online
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X />
                </button>
              </div>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                {chatMessages.length === 0 && (
                  <div className="text-center py-10 px-6">
                    <div className="w-16 h-16 bg-red-50 text-primary rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <TrendingUp size={24} />
                    </div>
                    <p className="text-sm font-bold text-secondary mb-1">
                      আসসালামু আলাইকুম!
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      আমি i SHOP BD এর AI এসিস্ট্যান্ট। আমাদের পন্য বা সার্ভিস
                    </p>
                  </div>
                )}
                {chatMessages.map((msg, idx) => {
                  const isSentByMe = msg.isAdmin ? false : true; // In user chat, sent means from user
                  // Adjust logic: if senderId matches current userId/sessionId, it's sent.
                  const isMe = msg.senderId === (user?.uid || sessionId);
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex flex-col gap-1 max-w-[85%]">
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm text-sm font-medium relative ${
                            isMe
                              ? "bg-primary text-white rounded-tr-none"
                              : "bg-white text-secondary border border-gray-100 rounded-tl-none"
                          }`}
                        >
                          {msg.replyTo && (
                            <div className={`text-[10px] p-2 rounded-lg mb-2 opacity-80 border-l-2 ${isMe ? 'bg-black/20 border-white/30' : 'bg-gray-100 border-primary/30'}`}>
                              <span className="font-bold">Replying to:</span> {msg.replyTo}
                            </div>
                          )}
                          {msg.text}
                          {msg.image && (
                            <img loading="lazy"
                              src={msg.image}
                              className="w-full rounded-lg mt-2"
                              alt="Upload"
                            />
                          )}
                          {msg.audio && (
                            <div className="space-y-2 mb-1">
                              <div className={`flex items-center gap-2 p-2 rounded-xl border ${isMe ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-100'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                                  <Mic size={14} />
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-[10px] font-black uppercase tracking-widest ${isMe ? 'text-white' : 'text-gray-400'}`}>ভয়েস মেসেজ</p>
                                  <p className={`text-[9px] font-bold ${isMe ? 'text-white/60' : 'text-gray-300'}`}>সাউন্ড অন করে শুনুন</p>
                                </div>
                              </div>
                              <audio 
                                src={msg.audio} 
                                controls 
                                className={`block w-full h-10 ${isMe ? 'invert opacity-80' : ''}`} 
                                style={{ filter: isMe ? 'invert(1) hue-rotate(180deg)' : 'none' }}
                                preload="metadata"
                              />
                            </div>
                          )}
                          {/* Reactions (Visible for user) */}
                          {msg.reactions && (Object.values(msg.reactions).some(v => v)) && (
                            <div className={`absolute -bottom-2 ${isMe ? 'right-2' : 'left-2'} flex gap-1 bg-white shadow-xl border border-gray-100 rounded-full px-1.5 py-0.5 scale-75 origin-top z-10`}>
                              {msg.reactions.love && <span className="text-red-500 animate-bounce">❤️</span>}
                              {msg.reactions.like && <span className="text-blue-500 animate-bounce">Ã°Å¸â€˜Â</span>}
                            </div>
                          )}
                        </div>
                        <div className={`flex items-center gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className={`text-[8px] font-bold text-gray-300 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {!isMe && (
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleToggleReaction(user?.uid || sessionId, idx, 'love')}
                                className={`p-1 rounded-full transition-all ${msg.reactions?.love ? 'bg-red-50 text-red-500 scale-110 shadow-sm' : 'text-gray-300 hover:bg-gray-100 hover:text-red-400'}`}
                              >
                                <Heart size={10} fill={msg.reactions?.love ? "currentColor" : "none"} />
                              </button>
                              <button 
                                onClick={() => handleToggleReaction(user?.uid || sessionId, idx, 'like')}
                                className={`p-1 rounded-full transition-all ${msg.reactions?.like ? 'bg-blue-50 text-blue-500 scale-110 shadow-sm' : 'text-gray-300 hover:bg-gray-100 hover:text-blue-400'}`}
                              >
                                <ThumbsUp size={10} fill={msg.reactions?.like ? "currentColor" : "none"} />
                              </button>
                              <button 
                                onClick={() => setChatReplyingTo(msg)}
                                className="text-[8px] text-primary bg-primary/5 px-2 py-0.5 rounded-full hover:bg-primary/10 font-bold ml-1 transition-colors"
                              >
                                Reply
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              {/* Chat Input */}
              {chatReplyingTo && (
                <div className="px-4 py-2 bg-gray-50 border-t flex justify-between items-center text-xs text-gray-500 font-medium">
                  <div className="line-clamp-1 border-l-2 border-primary pl-2"><span className="font-bold mr-1">Replying to:</span> {chatReplyingTo.text || "Media"}</div>
                  <button type="button" onClick={() => setChatReplyingTo(null)} className="hover:text-red-500"><X size={14} /></button>
                </div>
              )}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0"
              >
                <div className="flex-1 relative flex items-center gap-2">
                  <div className="relative">
                    <input
                      id="chat-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("chat-image-upload")?.click()
                      }
                      className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-gray-50 rounded-xl"
                    >
                      <Camera size={20} />
                    </button>
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="মেসেজ লিখুন..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-5 pr-12 text-sm font-bold focus:border-primary outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleVoiceToggle}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors ${
                        isRecording
                          ? "bg-red-500 text-white animate-pulse"
                          : "text-gray-400 hover:text-primary"
                      }`}
                    >
                      {isRecording ? <Square size={18} /> : <Mic size={18} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!chatMessage.trim()}
                  className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
    </>
  );
}
