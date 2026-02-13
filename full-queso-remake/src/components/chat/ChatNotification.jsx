import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import useChatStore from '../../store/chatStore';

const ChatNotification = ({ message, onDismiss }) => {
  const { openChat } = useChatStore();

  const handleOpenChat = () => {
    openChat();
    onDismiss();
  };

  return (
    <motion.div
      className="fixed top-4 right-4 z-40 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm"
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
    >
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
          <MessageCircle size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm text-gray-900">Soporte Full Queso</h4>
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">{message}</p>
          <button
            onClick={handleOpenChat}
            className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-full transition-colors"
          >
            Responder
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatNotification;