import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Send, 
  Clock,
  User,
  Move
} from 'lucide-react';
import useChatStore from '../../store/chatStore';

// Hook para hacer el botón arrastrable
const useDraggable = (initialPosition = { x: 0, y: 0 }) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const getEventPos = (e) => {
      if (e.touches && e.touches[0]) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    };

    const handleMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const pos = getEventPos(e);
      const deltaX = pos.x - startMousePos.current.x;
      const deltaY = pos.y - startMousePos.current.y;
      
      const newX = startPos.current.x + deltaX;
      const newY = startPos.current.y + deltaY;
      
      // Límites de la pantalla con margen
      const margin = 20;
      const buttonSize = 64;
      const navbarHeight = 100; // Zona del navbar inferior
      const maxX = window.innerWidth - buttonSize - margin;
      const maxY = window.innerHeight - buttonSize - navbarHeight - margin;
      
      setPosition({
        x: Math.max(margin, Math.min(maxX, newX)),
        y: Math.max(margin, Math.min(maxY, newY))
      });
    };

    const handleEnd = () => {
      setIsDragging(false);
      
      // Snap to edges si está cerca
      const snapDistance = 50;
      const margin = 20;
      const buttonSize = 64;
      
      setPosition(current => {
        let newX = current.x;
        let newY = current.y;
        
        // Snap horizontal
        if (current.x < snapDistance) {
          newX = margin; // Snap a la izquierda
        } else if (current.x > window.innerWidth - buttonSize - snapDistance) {
          newX = window.innerWidth - buttonSize - margin; // Snap a la derecha
        }
        
        // Evitar navbar inferior (últimos 100px)
        const navbarZone = 100;
        if (current.y > window.innerHeight - buttonSize - navbarZone) {
          newY = window.innerHeight - buttonSize - navbarZone - margin;
        }
        
        return { x: newX, y: newY };
      });
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const handleStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    startPos.current = position;
    
    if (e.touches && e.touches[0]) {
      startMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      startMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  return {
    position,
    isDragging,
    dragRef,
    handleStart
  };
};

const SupportChat = () => {
  const {
    isOpen,
    isMinimized,
    messages,
    unreadCount,
    isTyping,
    currentAgent,
    quickReplies,
    openChat,
    closeChat,
    minimizeChat,
    maximizeChat,
    sendMessage,
    sendQuickReply,
    markAsRead,
    initializeChat,
    isWithinSupportHours
  } = useChatStore();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Posición inicial inteligente (evita navbar inferior y carrito)
  const getInitialPosition = () => {
    const margin = 24;
    const buttonSize = 64;
    const navbarHeight = 80; // Altura aproximada del navbar inferior
    
    return {
      x: window.innerWidth - buttonSize - margin,
      y: window.innerHeight - buttonSize - navbarHeight - margin
    };
  };
  
  const { position, isDragging, handleStart } = useDraggable(getInitialPosition());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      markAsRead();
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized, markAsRead]);

  const handleOpenChat = () => {
    if (!currentAgent) {
      initializeChat();
    }
    openChat();
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleQuickReply = (reply) => {
    sendQuickReply(reply);
  };

  // Botón flotante del chat
  if (!isOpen) {
    return (
      <motion.div
        className="fixed z-50"
        style={{
          left: position.x,
          top: position.y,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <motion.button
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          onClick={!isDragging ? handleOpenChat : undefined}
          className={`bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 relative group select-none ${
            isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab'
          }`}
          whileHover={!isDragging ? { scale: 1.1 } : {}}
          whileTap={!isDragging ? { scale: 0.9 } : {}}
        >
          <MessageCircle size={24} />
          
          {/* Indicador de arrastre */}
          <div className={`absolute -top-1 -right-1 transition-opacity ${
            isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <Move size={12} className="text-white bg-orange-600 rounded-full p-1" />
          </div>
          
          {unreadCount > 0 && (
            <motion.span
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              {unreadCount}
            </motion.span>
          )}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      }`}
      style={{
        left: Math.max(10, Math.min(position.x, window.innerWidth - (isMinimized ? 320 : 384) - 10)),
        top: Math.max(10, Math.min(position.y, window.innerHeight - (isMinimized ? 64 : 500) - 10))
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="bg-orange-500 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
            {currentAgent?.avatar || <User size={16} />}
          </div>
          <div>
            <h3 className="font-semibold text-sm">
              {currentAgent?.name || 'Soporte Full Queso'}
            </h3>
            <div className="flex items-center space-x-1 text-xs opacity-90">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>En línea</span>
              {!isWithinSupportHours() && (
                <>
                  <Clock size={12} className="ml-2" />
                  <span>Fuera de horario</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={isMinimized ? maximizeChat : minimizeChat}
            className="hover:bg-orange-400 p-1 rounded"
          >
            <Minimize2 size={16} />
          </button>
          <button
            onClick={closeChat}
            className="hover:bg-orange-400 p-1 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            className="flex flex-col h-[436px]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 436, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-orange-500 text-white'
                        : message.sender === 'system'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.sender === 'agent' && message.agentName && (
                      <div className="text-xs font-semibold mb-1 text-orange-600">
                        {message.agentAvatar} {message.agentName}
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString('es-VE', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <div className="text-xs text-gray-500 mb-2">Respuestas rápidas:</div>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.slice(0, 3).map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SupportChat;