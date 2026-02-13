import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useChatStore = create(
  persist(
    (set, get) => ({
      // Estado del chat
      isOpen: false,
      isMinimized: false,
      messages: [],
      unreadCount: 0,
      isTyping: false,
      connectionStatus: 'disconnected', // disconnected, connecting, connected
      currentAgent: null,
      sessionId: null,

      // Configuración
      supportHours: {
        start: 8, // 8 AM
        end: 22,  // 10 PM
        timezone: 'America/Caracas'
      },

      // Acciones del chat
      openChat: () => set({ isOpen: true, isMinimized: false }),
      closeChat: () => set({ isOpen: false }),
      minimizeChat: () => set({ isMinimized: true }),
      maximizeChat: () => set({ isMinimized: false }),

      // Gestión de mensajes
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...message
        }]
      })),

      markAsRead: () => set({ unreadCount: 0 }),

      // Simulación de respuestas automáticas
      sendMessage: async (content) => {
        const { addMessage } = get();
        
        // Agregar mensaje del usuario
        addMessage({
          content,
          sender: 'user',
          type: 'text'
        });

        // Simular typing
        set({ isTyping: true });

        // Respuesta automática después de 1-3 segundos
        setTimeout(() => {
          const lowerContent = content.toLowerCase();
          let response = "¡Hola! Gracias por contactarnos. ¿En qué puedo ayudarte hoy?";
          
          if (lowerContent.includes('pedido') || lowerContent.includes('orden')) {
            response = "Entiendo que tienes una consulta sobre tu pedido. ¿Podrías darme tu número de orden para ayudarte mejor?";
          } else if (lowerContent.includes('pago') || lowerContent.includes('tarjeta')) {
            response = "Veo que tienes una consulta sobre pagos. Aceptamos tarjetas internacionales, tarjetas venezolanas y Pago Móvil. ¿Con cuál necesitas ayuda?";
          } else if (lowerContent.includes('entrega') || lowerContent.includes('delivery')) {
            response = "Sobre entregas: nuestro tiempo estimado es de 45 minutos. Puedes rastrear tu pedido en tiempo real desde la sección 'Mis Órdenes'.";
          } else if (lowerContent.includes('hola') || lowerContent.includes('buenos') || lowerContent.includes('buenas')) {
            response = "¡Hola! Bienvenido a Full Queso 🍕 Soy María y estoy aquí para ayudarte. ¿Qué necesitas hoy?";
          } else if (lowerContent.includes('gracias')) {
            response = "¡De nada! Es un placer ayudarte. ¿Hay algo más en lo que pueda asistirte?";
          }
          
          addMessage({
            content: response,
            sender: 'agent',
            type: 'text',
            agentName: 'María González',
            agentAvatar: '👩‍💼'
          });

          set({ isTyping: false, unreadCount: get().unreadCount + 1 });
        }, Math.random() * 2000 + 1000);
      },

      // Respuestas rápidas predefinidas
      quickReplies: [
        "Estado de mi pedido",
        "Cambiar dirección",
        "Métodos de pago",
        "Horarios de entrega",
        "Cancelar pedido",
        "Hablar con gerente"
      ],

      sendQuickReply: (reply) => {
        const { sendMessage } = get();
        sendMessage(reply);
      },

      // Verificar horarios de atención
      isWithinSupportHours: () => {
        const now = new Date();
        const hour = now.getHours();
        const { supportHours } = get();
        return hour >= supportHours.start && hour < supportHours.end;
      },

      // Inicializar chat
      initializeChat: () => {
        const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set({ 
          sessionId,
          connectionStatus: 'connected',
          currentAgent: {
            name: 'María González',
            avatar: '👩‍💼',
            status: 'online'
          }
        });

        // Mensaje de bienvenida
        const { addMessage, isWithinSupportHours } = get();
        
        if (isWithinSupportHours()) {
          addMessage({
            content: "¡Hola! Soy María de Full Queso. ¿En qué puedo ayudarte hoy? 🍕",
            sender: 'agent',
            type: 'text',
            agentName: 'María González',
            agentAvatar: '👩‍💼'
          });
        } else {
          addMessage({
            content: "¡Hola! Actualmente estamos fuera del horario de atención (8 AM - 10 PM). Deja tu mensaje y te responderemos pronto. 🌙",
            sender: 'system',
            type: 'text'
          });
        }
      },

      // Limpiar chat
      clearChat: () => set({
        messages: [],
        unreadCount: 0,
        sessionId: null,
        connectionStatus: 'disconnected',
        currentAgent: null
      })
    }),
    {
      name: 'full-queso-chat',
      partialize: (state) => ({
        messages: state.messages,
        sessionId: state.sessionId
      })
    }
  )
);

export default useChatStore;