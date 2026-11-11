import React from 'react';
import { Camera, Headset, Heart, Mic, Send, Square, ThumbsUp, X } from 'lucide-react';

export interface AdminSupportTabProps {
  supportChats: any[];
  selectedChat: any;
  setSelectedChat: (chat: any) => void;
  selectChat: (chat: any) => void;
  handleToggleReaction: (chatId: string, msgIndex: number, type: string) => void;
  adminReplyingTo: any;
  setAdminReplyingTo: (msg: any) => void;
  adminChatEndRef: React.RefObject<HTMLDivElement>;
  handleAdminReply: (e: React.FormEvent) => void;
  handleAdminChatImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  replyMessage: string;
  setReplyMessage: (msg: string) => void;
  handleAdminVoiceToggle: () => void;
  isAdminRecording: boolean;
}

export default function AdminSupportTab({
  supportChats,
  selectedChat,
  setSelectedChat,
  selectChat,
  handleToggleReaction,
  adminReplyingTo,
  setAdminReplyingTo,
  adminChatEndRef,
  handleAdminReply,
  handleAdminChatImageUpload,
  replyMessage,
  setReplyMessage,
  handleAdminVoiceToggle,
  isAdminRecording,
}: AdminSupportTabProps) {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Chat List */}
      <div
        className={`w-full md:w-80 border-r overflow-y-auto bg-gray-50/50 ${
          selectedChat ? 'hidden md:flex' : 'flex'
        } flex-col`}
      >
        <div className="p-4 border-b bg-white sticky top-0 z-10">
          <h4 className="font-bold text-secondary uppercase tracking-widest text-xs">Total Chats</h4>
        </div>
        {supportChats.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No conversations found</div>
        ) : (
          supportChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => selectChat(chat)}
              className={`w-full p-4 border-b flex flex-col gap-1 text-left transition-all hover:bg-white ${
                selectedChat?.id === chat.id ? 'bg-white border-r-4 border-r-primary' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-secondary truncate pr-2">{chat.userName}</span>
                {chat.unreadByAdmin && <span className="w-2 h-2 bg-primary rounded-full shrink-0" />}
              </div>
              <p className="text-[10px] text-gray-500 line-clamp-1">{chat.lastMessage}</p>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                {new Date(chat.lastMessageAt).toLocaleString()}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Chat Detail */}
      <div className={`flex-1 ${!selectedChat ? 'hidden md:flex' : 'flex'} flex-col bg-white overflow-hidden`}>
        {selectedChat ? (
          <>
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between shrink-0">
              <div>
                <h4 className="font-bold text-secondary">{selectedChat.userName}</h4>
                <p className="text-[10px] text-gray-400 font-mono">{selectedChat.id}</p>
              </div>
              <button
                onClick={() => setSelectedChat(null)}
                className="text-gray-400 hover:text-primary md:hidden"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
              {selectedChat.messages?.map((msg: any, idx: number) => (
                <div key={idx} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex flex-col gap-1 max-w-[80%] ${msg.isAdmin ? 'items-end' : 'items-start'}`}>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-1">
                      {msg.senderName}   {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm font-medium shadow-sm transition-all hover:shadow-md relative ${
                        msg.isAdmin
                          ? 'bg-secondary text-white rounded-tr-none'
                          : 'bg-white text-secondary border border-gray-100 rounded-tl-none'
                      }`}
                    >
                      {msg.replyTo && (
                        <div
                          className={`text-[10px] p-2 rounded-lg mb-2 opacity-80 border-l-2 ${
                            msg.isAdmin ? 'bg-black/20 border-white/30' : 'bg-gray-100 border-primary/30'
                          }`}
                        >
                          <span className="font-bold">Replying to:</span> {msg.replyTo}
                        </div>
                      )}
                      {msg.text}
                      {msg.image && (
                        <img
                          loading="lazy"
                          src={msg.image}
                          className="max-w-full rounded-xl mt-2 border border-white/20"
                          alt="Uploaded"
                        />
                      )}
                      {msg.audio && (
                        <div className="space-y-2 mb-1">
                          <div
                            className={`flex items-center gap-2 p-2 rounded-xl border ${
                              msg.isAdmin ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-100'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                msg.isAdmin ? 'bg-white text-secondary' : 'bg-primary text-white'
                              }`}
                            >
                              <Mic size={14} />
                            </div>
                            <div>
                              <p
                                className={`text-[10px] font-bold uppercase tracking-widest ${
                                  msg.isAdmin ? 'text-white' : 'text-gray-400'
                                }`}
                              >
                                Admin
                              </p>
                              <p className={`text-[9px] font-bold ${msg.isAdmin ? 'text-white/60' : 'text-gray-300'}`}>
                                Turn on sound to listen
                              </p>
                            </div>
                          </div>
                          <audio
                            src={msg.audio}
                            controls
                            className={`block w-full h-10 ${msg.isAdmin ? 'invert opacity-80' : ''}`}
                            style={{ filter: msg.isAdmin ? 'invert(1) hue-rotate(180deg)' : 'none' }}
                            preload="metadata"
                          />
                        </div>
                      )}
                      {msg.reactions && Object.values(msg.reactions).some((v) => v) && (
                        <div
                          className={`absolute -bottom-2 ${
                            msg.isAdmin ? 'right-2' : 'left-2'
                          } flex gap-1 bg-white shadow-xl border border-gray-100 rounded-full px-1.5 py-0.5 scale-75 origin-top z-10`}
                        >
                          {msg.reactions.love && (
                            <span className="text-red-500 hover:scale-125 transition-transform cursor-pointer">❤️</span>
                          )}
                          {msg.reactions.like && (
                            <span className="text-blue-500 hover:scale-125 transition-transform cursor-pointer"></span>
                          )}
                        </div>
                      )}
                    </div>
                    {!msg.isAdmin && (
                      <div className="flex gap-2 mt-1 px-1">
                        <button
                          onClick={() => handleToggleReaction(selectedChat.id, idx, 'love')}
                          className={`p-1.5 rounded-full transition-all ${
                            msg.reactions?.love
                              ? 'bg-red-50 text-red-500 scale-110 shadow-sm'
                              : 'text-gray-300 hover:bg-gray-100 hover:text-red-400'
                          }`}
                          title="Love"
                        >
                          <Heart size={12} fill={msg.reactions?.love ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => handleToggleReaction(selectedChat.id, idx, 'like')}
                          className={`p-1.5 rounded-full transition-all ${
                            msg.reactions?.like
                              ? 'bg-blue-50 text-blue-500 scale-110 shadow-sm'
                              : 'text-gray-300 hover:bg-gray-100 hover:text-blue-400'
                          }`}
                          title="Like"
                        >
                          <ThumbsUp size={12} fill={msg.reactions?.like ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => setAdminReplyingTo(msg)}
                          className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full hover:bg-primary/20 font-bold ml-2 transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={adminChatEndRef} />
            </div>
            {adminReplyingTo && (
              <div className="px-4 py-2 bg-gray-50 border-t flex justify-between items-center text-xs text-gray-500 font-medium">
                <div className="line-clamp-1 border-l-2 border-primary pl-2">
                  <span className="font-bold mr-1">Replying to:</span> {adminReplyingTo.text || 'Media'}
                </div>
                <button onClick={() => setAdminReplyingTo(null)} className="hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            )}
            <form onSubmit={handleAdminReply} className="p-4 border-t bg-white flex gap-3 shrink-0 items-center">
              <div className="relative">
                <input
                  id="admin-chat-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAdminChatImageUpload}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('admin-chat-image-upload')?.click()}
                  className="p-3 bg-gray-50 text-gray-400 hover:text-primary transition-colors hover:bg-gray-100 rounded-2xl h-14 w-14 flex items-center justify-center shrink-0"
                >
                  <Camera size={24} />
                </button>
              </div>
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-6 pr-14 py-4 text-sm font-bold focus:border-primary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleAdminVoiceToggle}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors ${
                    isAdminRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-primary'
                  }`}
                >
                  {isAdminRecording ? <Square size={18} /> : <Mic size={18} />}
                </button>
              </div>
              <button
                type="submit"
                disabled={!replyMessage.trim()}
                className="bg-primary text-white w-14 h-14 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shrink-0"
              >
                <Send size={24} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center bg-gray-50/20">
            <div className="w-24 h-24 bg-gray-100 rounded-[2.5rem] flex items-center justify-center mb-6 text-gray-300">
              <Headset size={48} />
            </div>
            <h4 className="text-xl font-bold text-secondary mb-2">Admin Support</h4>
            <p className="text-sm font-medium leading-relaxed max-w-xs">
              Select a conversation from the list on the left to view messages and reply.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
