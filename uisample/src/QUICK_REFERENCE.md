# ⚡ QUICK REFERENCE GUIDE

## 🎯 Most Important Info at a Glance

---

## 🚀 QUICK START

### Ghost Mode (No Login)
1. Click "Enter Ghost Mode"
2. Choose a ghost name
3. Create or join a crowd
4. Start chatting!

### Amigo Account (Login Required)
1. Click "Login / Sign Up"
2. Enter phone number
3. **New user?** → Invite code or buy premium pass
4. Verify OTP
5. Complete profile

---

## 🎨 THEME COLORS

### Ghost Mode
- **Primary:** `#9B7BFF` (Purple)
- **Background:** `#050509` → `#141426`
- **Card:** `#141422`

### Amigo Account
- **Primary:** `#3B82F6` (Blue)
- **Gradient:** `#2563EB` → `#1D4ED8`
- **Background:** `#0A0A14`

---

## 👻 GHOST MODE FEATURES

| Feature | Limit | Notes |
|---------|-------|-------|
| **Crowd Creation** | 3/day | Resets at midnight |
| **Crowd Duration** | 1-31 days | Chosen at creation |
| **Ghost Name** | 2-20 chars | Letters, numbers, _, -, space |
| **Crowd Name** | 2-40 chars | Same rules as ghost name |
| **Bots per Crowd** | 2-4 | Auto-join on creation |

---

## 🤖 GHOST BOTS

1. **Shadow_Wanderer** 🌙
2. **Neon_Echo** ⚡
3. **Midnight_Pulse** 🌌
4. **Cosmic_Drift** ✨

**Behavior:**
- Join 1-4 seconds apart
- Send 2-3 messages each
- Messages every 2-6 seconds

---

## 🛡️ MODERATION ACTIONS

### For Members
- **Report Message:** Right-click → Report
- **Report Crowd:** Settings → Report Crowd

### For Admins
- **Ban User:** Long-press → Ban (permanent)
- **Mute User:** Long-press → Mute (1h/24h/permanent)
- **Kick User:** Long-press → Kick
- **Lock Chat:** Admin-only talk mode
- **View Safety Panel:** Admin menu → Safety & Moderation

---

## 🚫 AUTO-FLAGGED KEYWORDS

**Spam:** upi, free money, win prize, click here  
**Sexual:** sex, porn, nude, xxx  
**Hate:** kill, die, hate  

**Admin sees:** ⚠️ Flagged indicator

---

## 📊 SAFETY PANEL TABS

1. **Reports** - Message & crowd reports
2. **Flagged** - Auto-detected violations
3. **Bans** - Permanently banned users
4. **Mutes** - Muted users with expiry

---

## 🎭 DEMO CREDENTIALS

### Phone Numbers
- **Existing User:** `9971645229` (any country code)
- **New User:** Any other number

### Invite Codes
- `ABC123`
- `XYZ789`
- `DEMO01`
- Any 6-character code (demo mode)

### OTP Codes
- `123456` (always works)
- Any 6-digit code (demo mode)

---

## 📁 KEY FILES

### Stores
- `useSessionStore.ts` - Ghost sessions & limits
- `useCrowdStore.ts` - Crowds & members
- `useChatStore.ts` - Messages & typing
- `useModerationStore.ts` - Reports, bans, mutes, flags

### Components (Moderation)
- `MessageActionsSheet.tsx` - Message menu
- `ReportMessageModal.tsx` - Report interface
- `BanUserModal.tsx` - Ban confirmation
- `MuteUserModal.tsx` - Mute selection
- `SafetyPanel.tsx` - Admin moderation hub

### Screens (Key)
- `EntryScreen.tsx` - Choose Ghost/Login
- `GhostHomeScreen.tsx` - Ghost Mode hub
- `CrowdChatScreen.tsx` - Main chat
- `BannedScreen.tsx` - Ban notification
- `ProfileSetupScreen.tsx` - Amigo onboarding

### Utils
- `ghostBots.ts` - Bot system
- `useModerationStore.ts` - Content filter

---

## 🔥 COMMON TASKS

### Create a Crowd
```
Ghost Home → Create Crowd → Enter name → 
Select duration → Create & Generate QR
```

### Join a Crowd
```
Ghost Home → Join Crowd → Scan QR → 
Join (or see BannedScreen if banned)
```

### Report a Message
```
Right-click message → Report Message → 
Select reason → Add details → Submit
```

### Ban a User (Admin)
```
View Members → Long-press user → Ban → 
Confirm → User removed
```

### View Reports (Admin)
```
Admin menu → Safety & Moderation → 
Reports tab → View/Ignore reports
```

---

## 🎯 USER ROLES

### Creator
- First admin
- Can delete crowd
- Loses status if they leave

### Admin
- Promote/demote members
- Ban/mute users
- Lock chat
- Pin messages
- Access Safety Panel
- Cannot leave if only admin

### Member
- Send messages
- Report content
- Leave crowd anytime

### Muted User
- Read messages ✅
- Send messages ❌
- Input shows: "You're muted by admin"

### Banned User
- Rejoin crowd ❌
- Shows: BannedScreen

---

## 🔍 DEBUGGING

### Check Ban Status
```typescript
const isBanned = useModerationStore(state => 
  state.isUserBanned(crowdId, ghostSessionId)
);
```

### Check Mute Status
```typescript
const isMuted = useModerationStore(state => 
  state.isUserMuted(crowdId, ghostSessionId)
);
```

### Check Flagged Message
```typescript
const isFlagged = useModerationStore(state => 
  state.isMessageFlagged(messageId)
);
```

### Check Admin Status
```typescript
const isAdmin = useCrowdStore(state => 
  state.isUserAdmin(crowdId, ghostSessionId)
);
```

---

## 🎨 COMMON ANIMATIONS

### Modal Entry
```typescript
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.95 }}
```

### Bottom Sheet
```typescript
initial={{ y: '100%' }}
animate={{ y: 0 }}
exit={{ y: '100%' }}
```

### Glow Effect
```typescript
<motion.div
  animate={{ 
    scale: [1, 1.2, 1],
    opacity: [0.5, 0.3, 0.5]
  }}
  transition={{ 
    repeat: Infinity, 
    duration: 2,
    ease: "easeInOut"
  }}
  className="absolute inset-0 bg-[#9B7BFF] blur-xl"
/>
```

---

## 📊 STATE HIERARCHY

```
useSessionStore
├─ Ghost Mode State
├─ Amigo Auth State
└─ Crowd Creation Limits

useCrowdStore
├─ All Crowds
├─ Members per Crowd
└─ Admin Controls

useChatStore
├─ Messages by Crowd
├─ Typing Indicators
└─ Media Messages

useModerationStore
├─ Reports (Message & Crowd)
├─ Banned Users
├─ Muted Users
└─ Flagged Messages
```

---

## 🚨 IMPORTANT NOTES

1. **Ban = Permanent** - User cannot rejoin same crowd
2. **Mute ≠ Ban** - User stays in crowd, just can't talk
3. **Creator ≠ Admin** - Loses creator status if leaves
4. **Bots = Helpful** - Auto-populate crowds, not deceptive
5. **Flags = Auto** - Keywords trigger, admins review
6. **Reports = User-driven** - Members report violations
7. **Ghost Mode = Temporary** - All data expires with crowd
8. **Amigo = Permanent** - Profile persists after login

---

## 🎬 QUICK DEMO SCRIPT

```
1. Open app → See splash screen (2s)
2. Entry → "Enter Ghost Mode"
3. Choose name: "TesterGhost"
4. Create crowd: "Demo Chat" (3 days)
5. See QR code generated
6. Bots auto-join (Shadow_Wanderer, Neon_Echo, etc.)
7. Bots send welcome messages
8. Send test message
9. Right-click message → Copy/Report
10. View members → See bots and you
11. (Admin) Long-press bot → Ban/Mute/Kick
12. Exit Ghost Mode
13. Return to entry → "Login / Sign Up"
14. Enter phone: 9971645229
15. Enter OTP: 123456
16. Navigate Amigo Home
```

---

## ⚡ PERFORMANCE TIPS

- Bots join after 1s delay (prevents UI freeze)
- Message sending uses optimistic updates
- Typing indicators auto-clear after 3s
- Flagging happens async (doesn't block send)
- Context menus use portals (prevent overflow)

---

## 🔗 DOCUMENTATION LINKS

- **Full App:** `/COMPLETE_APP_DOCUMENTATION.md`
- **Moderation:** `/MODERATION_SYSTEM_STATUS.md`
- **Bots:** `/GHOST_BOTS_COMPLETE.md`
- **Overview:** `/SYSTEM_OVERVIEW.md`
- **Quick Ref:** `/QUICK_REFERENCE.md` (this file)

---

**Last Updated:** January 29, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

🚀 **Happy coding!** 👻
