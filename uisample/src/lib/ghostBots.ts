import { useCrowdStore } from '../stores/useCrowdStore';
import { useChatStore } from '../stores/useChatStore';

// Bot configurations
export const GHOST_BOTS = [
  {
    id: 'bot-shadow-wanderer',
    name: 'Shadow_Wanderer',
    messages: [
      "Hey everyone! 👋",
      "Just joined, what's this crowd about?",
      "Anyone here?",
      "Looking forward to chatting with you all!",
      "Hello! Nice to be here 😊",
    ]
  },
  {
    id: 'bot-neon-echo',
    name: 'Neon_Echo',
    messages: [
      "What's up folks!",
      "Hey, just found this crowd!",
      "This looks interesting 👀",
      "Hi everyone!",
      "Excited to be part of this!",
    ]
  },
  {
    id: 'bot-midnight-pulse',
    name: 'Midnight_Pulse',
    messages: [
      "Hello there!",
      "Just dropped in to say hi!",
      "Anyone active here?",
      "Nice crowd name btw",
      "Hey all! 🌙",
    ]
  },
  {
    id: 'bot-cosmic-drift',
    name: 'Cosmic_Drift',
    messages: [
      "Yo! What's happening here?",
      "Just joined, seems cool!",
      "Hello everyone! ✨",
      "Hey hey!",
      "What's good?",
    ]
  }
];

// Additional conversational messages bots can send
const ADDITIONAL_MESSAGES = [
  "How's everyone doing?",
  "This is pretty cool",
  "Anyone want to chat?",
  "Just checking in!",
  "Hope everyone's having a good day",
  "Nice to meet you all",
  "What brings everyone here?",
  "Interesting crowd!",
  "Love the vibe here",
  "Anyone else new here?",
];

/**
 * Randomly select a message from an array
 */
function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a random delay between min and max milliseconds
 */
function getRandomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Make bots join a crowd and send initial messages
 */
export function addBotsToNewCrowd(crowdId: string) {
  const crowdStore = useCrowdStore.getState();
  const chatStore = useChatStore.getState();
  
  // Randomly select 2-4 bots to join
  const botsToJoin = Math.floor(Math.random() * 3) + 2; // 2-4 bots
  const selectedBots = [...GHOST_BOTS]
    .sort(() => Math.random() - 0.5)
    .slice(0, botsToJoin);

  selectedBots.forEach((bot, index) => {
    // Stagger bot joins (1-4 seconds apart)
    const joinDelay = getRandomDelay(1000, 4000) * (index + 1);
    
    setTimeout(() => {
      // Bot joins the crowd
      const joinResult = crowdStore.joinCrowd(crowdId, bot.name, bot.id);
      
      if (joinResult.success) {
        const finalBotName = joinResult.adjustedName || bot.name;
        
        // Send system join message
        chatStore.addSystemMessage(
          crowdId,
          `${finalBotName} joined the crowd.`,
          'join'
        );
        
        // Send 2-3 conversational messages
        const messagesToSend = Math.floor(Math.random() * 2) + 2; // 2-3 messages
        
        for (let i = 0; i < messagesToSend; i++) {
          const messageDelay = getRandomDelay(2000, 6000) * (i + 1);
          
          setTimeout(() => {
            // Choose from bot's specific messages or additional pool
            let message: string;
            if (i === 0) {
              // First message is always from bot's greeting messages
              message = getRandomMessage(bot.messages);
            } else {
              // Subsequent messages can be from either pool
              const useAdditional = Math.random() > 0.5;
              message = useAdditional 
                ? getRandomMessage(ADDITIONAL_MESSAGES)
                : getRandomMessage(bot.messages);
            }
            
            // Send the message
            chatStore.sendMessage(crowdId, message, finalBotName, bot.id);
          }, messageDelay);
        }
      }
    }, joinDelay);
  });
}

/**
 * Make a random bot send an occasional message (for activity)
 */
export function sendRandomBotMessage(crowdId: string) {
  const crowdStore = useCrowdStore.getState();
  const chatStore = useChatStore.getState();
  const crowd = crowdStore.getCrowd(crowdId);
  
  if (!crowd) return;
  
  // Find bots in this crowd
  const botsInCrowd = crowd.members.filter(member => 
    GHOST_BOTS.some(bot => bot.id === member.ghostSessionId)
  );
  
  if (botsInCrowd.length === 0) return;
  
  // Randomly select a bot
  const selectedBot = botsInCrowd[Math.floor(Math.random() * botsInCrowd.length)];
  const botConfig = GHOST_BOTS.find(bot => bot.id === selectedBot.ghostSessionId);
  
  if (!botConfig) return;
  
  // Send a random message
  const message = getRandomMessage([...botConfig.messages, ...ADDITIONAL_MESSAGES]);
  chatStore.sendMessage(crowdId, message, selectedBot.ghostName, selectedBot.ghostSessionId);
}

/**
 * Initialize bot activity for a crowd (occasional random messages)
 */
export function initializeBotActivity(crowdId: string) {
  // Send a random bot message every 2-5 minutes
  const sendRandomMessage = () => {
    const delay = getRandomDelay(120000, 300000); // 2-5 minutes
    
    setTimeout(() => {
      // 30% chance to send a message
      if (Math.random() < 0.3) {
        sendRandomBotMessage(crowdId);
      }
      sendRandomMessage(); // Schedule next potential message
    }, delay);
  };
  
  sendRandomMessage();
}
