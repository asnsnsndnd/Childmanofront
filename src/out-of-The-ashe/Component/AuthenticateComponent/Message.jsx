import { faArrowLeft, faClock, faFile, faMicrophone, faPhone, faSearch, faVideo, faPaperPlane, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMediaQuery } from "react-responsive";
import { useSelector, useDispatch } from "react-redux";
import { useGetMessageByIdQuery, useGetConversionByIdQuery } from "../../Redux/message";
import { useGetEmployeeByIdQuery } from "../../Redux/Employee";
import { UpdateChatId } from "../../Redux/StateWeb";
import { socket } from "./SocketIoConfig";
import { APi } from "../../Redux/CenteralAPI";

const Message = () => {
  const isWide = useMediaQuery({ query: "(min-width: 900px)" });
  const dispatch = useDispatch();
  
  // Selectors
  const { ActiveChatId } = useSelector((state) => state.webState);
  const { id } = useSelector((state) => state.auth);

  // Local State
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageCollection, setMessageCollection] = useState([]);
  const [conversionCollection, setConversionCollection] = useState([]);
  
  const lastMessageRef = useRef(null);

  // RTK Queries
  const { data: EmployeeData } = useGetEmployeeByIdQuery(ActiveChatId, { skip: !ActiveChatId });
  const { data: MessageData } = useGetMessageByIdQuery({ id: ActiveChatId, myId: id }, { skip: !ActiveChatId });
  const { data: ConversionData, isLoading: convLoading } = useGetConversionByIdQuery(id);

  // Sync RTK Data to Local State
  useEffect(() => { 
    if (MessageData) setMessageCollection(MessageData); 
  }, [MessageData]);

  useEffect(() => { 
    if (ConversionData) setConversionCollection(ConversionData); 
  }, [ConversionData]);

  // Socket Listeners & Cache Invalidation
  useEffect(() => {
    const refreshData = () => {
      dispatch(APi.util.invalidateTags([{ type: "conversion" }, { type: "Message" }]));
    };

    socket.on('succfuly_mark_as_read', refreshData);
    socket.on('both_succfuly_mark_as_read', refreshData);
    socket.on("sussfully_send_message", refreshData);

    return () => {
      socket.off('succfuly_mark_as_read', refreshData);
      socket.off('both_succfuly_mark_as_read', refreshData);
      socket.off("sussfully_send_message", refreshData);
    };
  }, [dispatch]);

  // Filter and Sort Conversations (Newest at Top)
  const filteredConversations = useMemo(() => {
    return [...conversionCollection]
      .filter(c => {
        const fullName = `${c.otherUserData.firstName} ${c.otherUserData.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [conversionCollection, searchTerm]);

  const sendHandler = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const msg = { 
      senderId: id, 
      receiverId: ActiveChatId, 
      text: messageText,
      createdAt: new Date().toISOString() // Temporary timestamp for UI
    };

    // 1. Optimistic UI Update (Chat Box)
    setMessageCollection(prev => [...prev, msg]);

    // 2. Optimistic UI Update (Sidebar)
    setConversionCollection(prev => 
      prev.map(conv => 
        conv.otherUserData._id === ActiveChatId 
          ? { ...conv, lastMessage: messageText, updatedAt: new Date().toISOString() }
          : conv
      )
    );

    socket.emit("send_message", msg);
    setMessageText('');
  };

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCollection]);

  const formatChatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (convLoading) return <LoadingSpinner />;

  return (
    <div className="flex h-full bg-white md:m-4 md:rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
      
      {/* Sidebar */}
      <aside className={`${isWide || !ActiveChatId ? "flex" : "hidden"} flex-col w-full md:w-[350px] border-r border-slate-100 bg-slate-50/50`}>
        <div className="p-6">
          <h2 className="text-2xl font-black text-slate-800 mb-4">Inbox</h2>
          <div className="relative group">
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-white border-none rounded-2xl py-3 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-sky-500/20 outline-none transition-all font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {filteredConversations.map((item) => (
            <div
              key={item._id}
              onClick={() => {
                socket.emit('mark_as_read', { id, otherId: item.otherUserData._id });
                dispatch(UpdateChatId(item.otherUserData._id));
              }}
              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                ActiveChatId === item.otherUserData._id ? "bg-white shadow-md ring-1 ring-slate-100" : "hover:bg-slate-100/50"
              }`}
            >
              <div className="relative">
                <img src={item.otherUserData.profile.mediaurl || item.otherUserData.profile} className="w-12 h-12 rounded-2xl object-cover" alt="avatar" />
                {item.unreadCount?.[id] > 0 && ActiveChatId !== item.otherUserData._id && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {item.unreadCount[id]}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-slate-800 truncate">{item.otherUserData.firstName}</h4>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">{formatChatTime(item.updatedAt)}</span>
                </div>
                <p className="text-sm text-slate-500 truncate font-medium">
                  {item.lastMessage || "No messages yet"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Area */}
      <main className={`${ActiveChatId || isWide ? "flex" : "hidden"} flex-1 flex-col bg-white relative`}>
        {ActiveChatId && EmployeeData ? (
          <>
            <header className="flex justify-between items-center px-8 py-4 border-b border-slate-50 shadow-sm">
              <div className="flex items-center gap-4">
                {!isWide && <button onClick={() => dispatch(UpdateChatId(null))} className="mr-2 text-slate-400"><FontAwesomeIcon icon={faArrowLeft} /></button>}
                <img src={EmployeeData?.profile.mediaurl || EmployeeData?.profile} className="w-11 h-11 rounded-2xl object-cover shadow-sm" alt="profile" />
                <div>
                  <h3 className="font-black text-slate-800 leading-tight">{EmployeeData.firstName} {EmployeeData.lastName}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Now</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 text-slate-400">
                <button className="hover:text-sky-500 transition-colors"><FontAwesomeIcon icon={faVideo} /></button>
                <button className="hover:text-green-500 transition-colors"><FontAwesomeIcon icon={faPhone} /></button>
                <button className="hover:text-slate-600 transition-colors"><FontAwesomeIcon icon={faEllipsisV} /></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
              {messageCollection.map((msg, i) => {
                const isMe = msg.senderId === id;
                return (
                  <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className="max-w-[70%]">
                      <div className={`px-5 py-3 rounded-[1.5rem] font-medium text-sm shadow-sm ${
                        isMe ? "bg-sky-500 text-white rounded-tr-none" : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                      }`}>
                        {msg.text}
                      </div>
                      <div className={`flex items-center mt-1 gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">
                          {msg.createdAt ? formatChatTime(msg.createdAt) : <FontAwesomeIcon icon={faClock} className="animate-spin" />}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={lastMessageRef} />
            </div>

            <footer className="p-6 bg-white border-t border-slate-50">
              <form onSubmit={sendHandler} className="flex items-end gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-100 focus-within:border-sky-200 focus-within:bg-white transition-all shadow-inner">
                <div className="flex gap-2 mb-1.5 ml-2">
                  <button type="button" className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors rounded-full"><FontAwesomeIcon icon={faFile} /></button>
                  <button type="button" className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors rounded-full"><FontAwesomeIcon icon={faMicrophone} /></button>
                </div>
                <textarea
                  rows={1}
                  value={messageText}
                  placeholder="Write a message..."
                  className="flex-1 bg-transparent border-none py-3 outline-none resize-none font-medium text-slate-700"
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendHandler(e); } }}
                />
                <button 
                  type="submit" 
                  disabled={!messageText.trim()}
                  className="w-11 h-11 bg-sky-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-sky-600 disabled:opacity-50 transition-all active:scale-90"
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faPaperPlane} className="text-3xl text-slate-200" />
            </div>
            <p className="font-black uppercase tracking-widest text-xs">Select a conversation to start</p>
          </div>
        )}
      </main>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-10 w-10 border-4 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
  </div>
);

export default Message;