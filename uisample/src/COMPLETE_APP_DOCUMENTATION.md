# 🎭 GHOST MODE - COMPLETE APP DOCUMENTATION

> **Version:** 1.0  
> **Last Updated:** January 27, 2026

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Ghost Mode Flow](#ghost-mode-flow)
4. [Amigo Login/Signup Flow](#amigo-loginsignup-flow)
5. [All Screens](#all-screens)
6. [Features & Functionality](#features--functionality)
7. [Limits & Restrictions](#limits--restrictions)
8. [State Management](#state-management)
9. [Theme System](#theme-system)
10. [Demo Data](#demo-data)

---

## 🎯 OVERVIEW

**Ghost Mode** is an anonymous, dark-themed iOS-style chat application where users create and join temporary crowds via QR codes using ephemeral identities. It includes:

- **Ghost Mode**: Free, anonymous, temporary crowds (NO LOGIN REQUIRED)
- **Amigo Account**: Full persistent account system (REQUIRES INVITE CODE OR PREMIUM PASS)

### Key Differentiators
- **Ghost Mode**: Completely free, no barriers, anonymous
- **Amigo**: Paid access (invite or premium), persistent identity, full account

---

## 💡 CORE CONCEPTS

### 1. **Crowds**
- Temporary chat groups that expire after a set duration (1-31 days)
- Created by Ghost Mode users
- Members join via QR code scanning
- No data persists after expiration

### 2. **Ghost Names**
- Anonymous identities used in Ghost Mode
- No email, phone, or personal info required
- Can be changed anytime
- Auto-adjusted if duplicate exists in a crowd (e.g., "Ghost" becomes "Ghost_2")

### 3. **Ephemeral Sessions**
- Each Ghost Mode session gets a unique session ID
- Session ID acts as your identity across crowds
- All data tied to session, not user account

### 4. **Admin System**
- Crowd creator is automatically the first admin
- Admins can: promote/demote members, kick members, toggle admin-only talk, delete crowd
- Multiple admins allowed per crowd
- Creator status lost if they leave the crowd (permanent)

---

## 👻 GHOST MODE FLOW

### Complete Navigation Flow

```
1. SplashScreen (2 second animation)
   ↓
2. EntryScreen
   ↓ [Click "Enter Ghost Mode"]
3. GhostNameScreen
   - Choose ghost name (2-20 chars)
   - Validation: letters, numbers, spaces, -, _
   - No emails or phone patterns allowed
   - "Random Name" generator available
   ↓ [Continue]
4. GhostHomeScreen (Main Hub)
   ↓
   ├─→ CreateCrowdScreen
   │   - Enter crowd name (2-40 chars)
   │   - Select duration (1/3/7/15/31 days)
   │   - Daily limit: 3 crowds per day
   │   ↓ [Create & Generate QR]
   │   CrowdQrScreen
   │   - Display QR code for sharing
   │   - Download/Share/Save options
   │   - Show crowd details (name, duration, expiry)
   │   ↓ [Enter Chat]
   │   CrowdChatScreen
   │
   ├─→ QrScanScreen
   │   - Scan QR code with camera
   │   - Manual code entry option
   │   - Validates QR data
   │   ↓ [Successful scan]
   │   CrowdChatScreen
   │
   └─→ Active Crowds List (on GhostHomeScreen)
       - Click any crowd card
       ↓
       CrowdChatScreen
       ↓ [View QR button]
       ViewQrScreen
       - View crowd QR
       - Admin options (if admin)
       - Member management
```

### Ghost Mode Screens Breakdown

#### **1. SplashScreen**
- **Duration**: 2 seconds
- **Content**: Floating ghost icon, "Ghost Mode" title, tagline
- **Theme**: Purple gradient (#050509 → #141426)
- **Auto-navigates** to EntryScreen

#### **2. EntryScreen**
- **Purpose**: Choose between Ghost Mode or Amigo Login
- **Options**:
  - "Enter Ghost Mode" (primary button)
  - "Login / Sign Up" (secondary button)
- **Features**: Floating ghost animation, theme: purple

#### **3. GhostNameScreen**
- **Purpose**: Set your anonymous ghost name
- **Features**:
  - Live avatar preview
  - Real-time validation
  - Random name generator (4 types: Mysterious, Fun, Minimal, Compound)
  - Error messages for invalid names
- **Validation Rules**:
  - 2-20 characters
  - Letters, numbers, spaces, -, _ only
  - No @ symbols (prevent email-like names)
  - No 10+ digit sequences (prevent phone-like names)
- **Examples**: "SilentEcho", "Ghost_42", "NeonViper"

#### **4. GhostHomeScreen** (Main Hub)
- **Header**: Settings icon (left), Logout icon (right)
- **Profile Section**: Avatar, welcome message, description
- **Action Cards**:
  1. **Create Crowd**: Start new temporary crowd
  2. **Join Crowd**: Scan QR to join existing crowd
- **Active Crowds List** (if any):
  - Shows all joined crowds
  - Displays: name, member count, duration, time remaining
  - Color-coded urgency: red if <1 hour remaining
  - Sortable by creation date
- **Footer**: Reminder about temporary/anonymous nature

#### **5. CreateCrowdScreen**
- **Fields**:
  - **Crowd Name**: 2-40 characters, same rules as ghost name
  - **Duration**: Segmented control (1/3/7/15/31 days)
- **Info Card**: Explains crowd behavior
- **Limits**: 3 crowds per day per ghost session
- **Button**: "Create & Generate QR"
- **Creates**:
  - New crowd with unique ID
  - QR code with encoded join data (crowdId + secret + timestamps)
  - Auto-adds creator as first admin

#### **6. CrowdQrScreen**
- **Purpose**: Display QR code after creation
- **Features**:
  - Large QR code display (GhostQrCode component)
  - Crowd name and expiry details
  - Share button (web share API)
  - Download button (canvas to image)
  - Save to gallery button
- **Actions**:
  - "Enter Chat" → Goes to CrowdChatScreen
  - Back → Returns to GhostHomeScreen

#### **7. QrScanScreen**
- **Purpose**: Scan QR codes to join crowds
- **Features**:
  - Animated scan frame overlay
  - Camera preview (simulated in this demo)
  - Manual code entry option
  - Error handling for invalid/expired codes
- **Validation**:
  - Decodes base64 QR payload
  - Checks crowd existence
  - Checks expiration
  - Handles name conflicts (auto-adjusts duplicates)
- **On Success**: Shows join confirmation, navigates to chat

#### **8. CrowdChatScreen**
- **Header**: Back button, crowd name, QR icon, member count
- **Features**:
  - Message list with auto-scroll
  - System messages (joins, leaves, kicks, promotions, locks)
  - Media messages (images, videos, files)
  - Link detection and rendering
  - Typing indicators (shows who's typing)
  - Admin lock indicator (when only admins can talk)
  - Message input with emoji picker
  - Media attachment button
  - Send button
- **Admin Features** (if user is admin):
  - Access member list
  - Promote/demote members
  - Kick members
  - Toggle admin-only talk mode
  - Pin messages
  - Delete crowd (creator only)
- **Message Types**:
  - Regular text messages
  - Media messages (with preview)
  - System messages (gray, centered, italic)

#### **9. ViewQrScreen**
- **Purpose**: View QR code from inside a crowd
- **Content**: Same as CrowdQrScreen but accessed from chat
- **Admin Panel** (if admin):
  - Member list with admin badges
  - Promote/demote buttons
  - Kick button
  - Admin-only talk toggle
  - Delete crowd button (creator only)
- **Leave Crowd Button**: With confirmation dialog
- **Constraints**:
  - Last admin cannot leave (must promote someone first)
  - Creator can delete crowd anytime

#### **10. GhostHomeScreen Exit Flow**
- **Logout Button**: Top-right corner
- **Confirmation Dialog**: "Are you sure you want to exit Ghost Mode?"
- **On Confirm**: 
  - Clears all ghost session data
  - Returns to EntryScreen
  - All crowd memberships lost (but crowds persist for others)

---

## 🔐 AMIGO LOGIN/SIGNUP FLOW

### Complete Navigation Flow

```
1. SplashScreen (2 seconds)
   ↓
2. EntryScreen
   ↓ [Click "Login / Sign Up"]
3. PhoneNumberPopup (Modal)
   - Enter country code + phone number
   - Minimum 10 digits
   ↓ [Click "Verify"]
   Backend checks if phone exists...
   
   ┌─────────────────────────────────────┐
   │  DECISION POINT: Account Exists?    │
   └─────────────────────────────────────┘
          │                    │
          │ YES                │ NO
          │ (Existing User)    │ (New User)
          ↓                    ↓
   4a. OtpScreen         4b. AccessRequiredScreen
       - 6-digit OTP           ↓
       - Verify code           ├─→ InviteCodeScreen
       ↓                      │    - Enter 6-digit code
   5a. AmigoHomeScreen       │    - Can switch to Premium
       (LOGGED IN ✓)         │    ↓ [Valid code]
                              │    OtpScreen
                              │    ↓ [OTP verified]
                              │    ProfileSetupScreen
                              │    ↓
                              │    AmigoHomeScreen ✓
                              │
                              └─→ PremiumAccessPassScreen
                                   - $9.99 one-time payment
                                   - Premium features list
                                   - Can switch to Invite
                                   ↓ [Purchase]
                                   OtpScreen
                                   ↓ [OTP verified]
                                   ProfileSetupScreen
                                   ↓
                                   AmigoHomeScreen ✓
```

### Amigo Screens Breakdown

#### **1. PhoneNumberPopup** (Modal)
- **Theme**: Premium Blue (#3B82F6)
- **Fields**:
  - Country code dropdown (+1, +91, +44)
  - Phone number input (numeric only, 10+ digits)
- **Validation**: Must be 10+ digits
- **Button**: "Verify" (disabled until valid)
- **Animation**: 
  - Ghost icon with blue glow
  - Glow intensifies when phone is valid
  - Loading spinner during backend check (1.5s simulation)
- **Backend Check**: 
  - If phone exists → Navigate to OTP
  - If phone new → Navigate to AccessRequired

#### **2. OtpScreen**
- **Theme**: Premium Blue
- **Purpose**: Verify phone number via SMS code
- **Fields**: 6-digit OTP input (large boxes)
- **Features**:
  - Auto-focus on first box
  - Auto-advance between boxes
  - Paste support (splits code across boxes)
  - Countdown timer (60 seconds)
  - "Resend Code" button (after timer expires)
  - Error state for invalid codes
- **On Success**:
  - **Existing users** → AmigoHomeScreen
  - **New users** → ProfileSetupScreen

#### **3. AccessRequiredScreen**
- **Theme**: Premium Blue
- **Purpose**: Gate for new users (invite or payment required)
- **Header**: Animated badge icon with blue glow
- **Title**: "Access Required"
- **Description**: Explains need for invite code or premium pass
- **Options** (2 large cards):
  1. **Enter Invite Code**
     - Ticket icon
     - "Have an invite code from a friend?"
     - Navigates to InviteCodeScreen
  2. **Get Premium Access Pass**
     - BadgeCheck icon
     - "Get instant access to create your account"
     - Navigates to PremiumAccessPassScreen
- **Can Switch**: Between both options freely

#### **4. InviteCodeScreen**
- **Theme**: Premium Blue with glow effects
- **Fields**: 6-digit invite code input (large boxes, auto-focus)
- **Features**:
  - Real-time validation
  - Error messages for invalid codes
  - Blue glow animation when valid
  - "Switch to Premium Pass" link at bottom
- **Validation Rules**:
  - Exactly 6 digits
  - Server-side check (simulated)
- **On Success**: Navigate to OTP for phone verification

#### **5. PremiumAccessPassScreen**
- **Theme**: Premium Blue with premium aesthetics
- **Header**: Crown icon with animated glow
- **Title**: "Premium Access Pass"
- **Price**: $9.99 (one-time payment)
- **Features List**:
  - ✓ Instant account creation
  - ✓ No invite code needed
  - ✓ Priority support
  - ✓ Early access to new features
  - ✓ Premium badge
  - ✓ Advanced customization
- **Benefits Section**: Highlighted premium perks
- **Button**: "Purchase for $9.99" (large, gradient, glow)
- **Footer**: "Switch to Invite Code" link
- **On Purchase**: Navigate to OTP for phone verification

#### **6. ProfileSetupScreen**
- **Theme**: Premium Blue
- **Purpose**: Set up profile after successful signup
- **Steps**:
  1. **Profile Photo** (Optional)
     - Upload button with circular preview
     - Default: gradient avatar with initials
     - File size limit: 5MB
     - Formats: JPG, PNG, WebP
  
  2. **Display Name** (Required)
     - 2-30 characters
     - Any characters allowed
     - Shows below avatar everywhere
  
  3. **Username** (Required)
     - 3-20 characters
     - Lowercase letters, numbers, _, -
     - Must start with letter or number
     - Real-time availability check
     - Shows @username format
     - Validation errors: "taken", "invalid chars", etc.
  
  4. **Email** (Optional)
     - Email validation
     - "Send Verification" button
     - Verification status indicator
     - Benefits explained (recovery, notifications)

- **Features**:
  - Live preview of profile card
  - Step indicators
  - Form validation with error messages
  - "Skip" option for optional fields
  - Loading states with ghost icon
  
- **Button**: "Complete Setup" (disabled until required fields valid)
- **On Complete**: Navigate to AmigoHomeScreen

#### **7. AmigoHomeScreen**
- **Theme**: Premium Blue
- **Purpose**: Main screen after successful login/signup
- **Header**: Profile avatar, username, premium badge
- **Content**: (Your implementation - placeholder for now)
  - Could show: Friends, messages, amigo-specific features
- **Features**:
  - Logout button (top-right)
  - Settings
  - Profile editing
- **Logout**: Returns to EntryScreen

---

## 📱 ALL SCREENS SUMMARY

| # | Screen Name | Theme | Purpose | Auth Required |
|---|------------|-------|---------|---------------|
| 1 | SplashScreen | Purple | App intro animation | No |
| 2 | EntryScreen | Purple | Choose mode | No |
| 3 | GhostNameScreen | Purple | Set ghost name | No |
| 4 | GhostHomeScreen | Purple | Ghost Mode hub | Ghost Mode |
| 5 | CreateCrowdScreen | Purple | Create new crowd | Ghost Mode |
| 6 | CrowdQrScreen | Purple | Display QR after creation | Ghost Mode |
| 7 | QrScanScreen | Purple | Scan QR to join | Ghost Mode |
| 8 | CrowdChatScreen | Purple | Chat interface | Ghost Mode |
| 9 | ViewQrScreen | Purple | View QR from chat | Ghost Mode |
| 10 | PhoneNumberPopup | Blue | Enter phone number | No (Modal) |
| 11 | OtpScreen | Blue | Verify OTP code | No |
| 12 | AccessRequiredScreen | Blue | Access gate for new users | No |
| 13 | InviteCodeScreen | Blue | Enter invite code | No |
| 14 | PremiumAccessPassScreen | Blue | Purchase premium pass | No |
| 15 | ProfileSetupScreen | Blue | Complete profile setup | After OTP |
| 16 | AmigoHomeScreen | Blue | Amigo main screen | Amigo Account |

**Total Screens**: 16 (10 Ghost Mode, 6 Amigo Account)

---

## ⚡ FEATURES & FUNCTIONALITY

### Ghost Mode Features

#### **Crowd Creation**
- Create temporary chat groups
- Choose duration: 1, 3, 7, 15, or 31 days
- Generate secure QR codes with encoded data
- Share QR via Web Share API or download
- Daily limit: 3 crowds per day per session

#### **Crowd Joining**
- Scan QR codes via camera
- Manual code entry fallback
- Auto-join if already member
- Name conflict resolution (Ghost → Ghost_2)
- Validation of crowd expiry before join

#### **Chat System**
- **Text Messages**: Full Unicode support
- **Media Sharing**: 
  - Images (preview in chat)
  - Videos (with playback controls)
  - Files (with download option)
- **Link Detection**: Auto-linkify URLs with preview
- **Typing Indicators**: Shows who's typing (real-time)
- **System Messages**: 
  - Member joined
  - Member left
  - Member kicked
  - Admin promoted/demoted
  - Admin-only mode toggled
  - Expiry warnings
- **Message Pinning**: Admins can pin important messages
- **Auto-scroll**: Scrolls to bottom on new messages
- **Timestamps**: Relative time display

#### **Admin Controls**
- **Member Management**:
  - View member list with join times
  - See admin badges
  - Promote members to admin
  - Demote admins (if multiple admins)
  - Kick members (removes from crowd)
- **Crowd Controls**:
  - Toggle admin-only talk mode
  - Delete crowd (creator only)
  - Pin/unpin messages
- **Restrictions**:
  - Cannot kick admins
  - Cannot demote if only admin
  - Cannot leave if only admin
  - Creator status lost permanently on leave

#### **QR Code System**
- **Generation**: Base64-encoded JSON payload
- **Payload Contains**:
  - `type`: "crowd_join"
  - `crowdId`: Unique crowd identifier
  - `secret`: Crowd secret for validation
  - `createdAt`: Crowd creation timestamp
  - `expiresAt`: Crowd expiration timestamp
- **Security**: Secret validation prevents unauthorized joins
- **Expiry Check**: QR codes expire with crowd

#### **Name System**
- **Ghost Names**: Anonymous identifiers
- **Conflict Resolution**: Auto-appends number (_2, _3, etc.)
- **Validation**: Real-time with error messages
- **Random Generator**: 4 name types
  - Mysterious: "SilentEcho", "VoidWalker"
  - Fun: "NovaShade", "BluePhantom"
  - Minimal: "Ghost_42", "Echo_123"
  - Compound: "SilentWalker", "NeonOrbit"

#### **Session Management**
- Unique session ID per ghost mode entry
- Session persists until logout
- All crowd memberships tied to session
- Data clears on exit

### Amigo Account Features

#### **Authentication**
- Phone number-based authentication
- OTP verification via SMS
- Country code support (+1, +91, +44, more)
- Session persistence

#### **Access Control**
- **Invite Code System**:
  - 6-digit alphanumeric codes
  - One-time use
  - Generated by existing users
  - Server-side validation
- **Premium Access Pass**:
  - One-time payment: $9.99
  - Instant access
  - No invite needed
  - Includes premium features

#### **Profile System**
- **Profile Photo**: 
  - Upload custom photo
  - 5MB limit
  - Formats: JPG, PNG, WebP
  - Default: gradient with initials
- **Display Name**: 
  - 2-30 characters
  - Public display name
- **Username**: 
  - 3-20 characters
  - Unique across platform
  - @username format
  - Real-time availability check
- **Email** (optional):
  - Email verification system
  - Used for account recovery
  - Newsletter notifications

#### **Premium Features** (with Premium Access Pass)
- Instant account creation
- Priority support
- Early access to new features
- Premium badge display
- Advanced customization options
- No ads

---

## 🚫 LIMITS & RESTRICTIONS

### Ghost Mode Limits

| Feature | Limit | Reset Period | Reason |
|---------|-------|-------------|--------|
| Crowd Creation | 3 per day | Daily (midnight) | Prevent spam |
| Crowd Duration | 1-31 days | N/A | Temporary nature |
| Ghost Name Length | 2-20 chars | N/A | UI/UX |
| Crowd Name Length | 2-40 chars | N/A | UI/UX |
| Members per Crowd | Unlimited | N/A | - |
| Message Length | ~5000 chars | N/A | Database |
| Media Upload Size | 10MB | N/A | Storage |
| Admin Count | Unlimited | N/A | Flexible management |

### Crowd Restrictions

1. **Cannot leave crowd if**:
   - You're the only admin AND other members exist
   - Solution: Promote another member first

2. **Cannot delete crowd unless**:
   - You're the original creator
   - Note: Creator status lost if you leave

3. **Cannot join crowd if**:
   - Crowd expired
   - Crowd deleted
   - Invalid QR secret

4. **Cannot kick/demote if**:
   - Target is admin (cannot kick admins)
   - Only one admin left (cannot demote last admin)

### Amigo Account Limits

| Feature | Limit | Notes |
|---------|-------|-------|
| Display Name | 2-30 chars | Required |
| Username | 3-20 chars | Required, unique |
| Email | 320 chars | Optional |
| Profile Photo | 5MB | Optional |
| Invite Codes | Varies | Based on account tier |
| OTP Attempts | 5 per hour | Security measure |
| OTP Validity | 10 minutes | Security measure |

### Validation Rules

#### Ghost Name Rules
- ✅ Letters (a-z, A-Z)
- ✅ Numbers (0-9)
- ✅ Spaces, hyphens (-), underscores (_)
- ❌ No @ symbols
- ❌ No 10+ digit sequences
- ❌ 2-20 characters only

#### Username Rules (Amigo)
- ✅ Lowercase letters (a-z)
- ✅ Numbers (0-9)
- ✅ Hyphens (-), underscores (_)
- ❌ Must start with letter or number
- ❌ No consecutive special chars
- ❌ 3-20 characters only
- ❌ Must be unique

#### Crowd Name Rules
- Same as Ghost Name rules, but 2-40 characters

---

## 🗄️ STATE MANAGEMENT

### Store Structure (Zustand)

#### **1. useSessionStore** (`/stores/useSessionStore.ts`)

**Purpose**: Manages Ghost Mode session and user state

```typescript
interface SessionState {
  // User Mode
  mode: 'ghost' | 'authenticated' | 'unauthenticated';
  
  // Ghost Mode Data
  ghostName: string | null;
  ghostSessionId: string | null;
  ghostNameCreatedAt: Date | null;
  
  // Crowd Tracking
  lastUsedCrowdId: string | null;
  recentCrowds: string[];
  
  // Limits
  crowdsCreatedToday: number;
  lastCrowdCreationDate: string | null;
  
  // Actions
  enterGhostMode: (name: string) => void;
  exitGhostMode: () => void;
  setGhostName: (name: string) => void;
  setLastUsedCrowd: (crowdId: string) => void;
  incrementCrowdCreation: () => void;
  canCreateCrowd: () => boolean; // Checks if <3 crowds today
}
```

**Key Features**:
- Generates unique session ID on ghost mode entry
- Tracks daily crowd creation (resets at midnight)
- Manages recent crowds list
- Clears all data on exit

#### **2. useCrowdStore** (`/stores/useCrowdStore.ts`)

**Purpose**: Manages all crowds and their members

```typescript
interface Crowd {
  id: string;
  name: string;
  createdAt: Date;
  expiresAt: Date;
  createdByGhostName: string;
  createdByGhostSessionId: string;
  durationDays: number;
  qrJoinCode: string; // Base64 encoded payload
  secret: string; // For validation
  adminOnlyTalk: boolean;
  memberCount: number;
  members: CrowdMember[];
  isDeleted?: boolean;
  pinnedMessageId?: string;
}

interface CrowdMember {
  ghostSessionId: string;
  ghostName: string;
  joinedAt: Date;
  isAdmin: boolean;
  isCreator?: boolean;
}

interface CrowdState {
  crowds: Record<string, Crowd>;
  activeCrowdId: string | null;
  
  // Actions
  createCrowd: (...) => string; // Returns crowdId
  joinCrowd: (...) => { success: boolean; adjustedName?: string; error?: string };
  leaveCrowd: (...) => { canLeave: boolean; needsNewAdmin: boolean };
  deleteCrowd: (crowdId: string) => void;
  setActiveCrowd: (crowdId: string | null) => void;
  getCrowd: (crowdId: string) => Crowd | undefined;
  toggleAdminOnlyTalk: (crowdId: string) => void;
  kickMember: (crowdId: string, ghostSessionId: string) => void;
  promoteMember: (crowdId: string, ghostSessionId: string) => void;
  demoteMember: (crowdId: string, ghostSessionId: string) => void;
  isUserAdmin: (crowdId: string, ghostSessionId: string) => boolean;
  isUserCreator: (crowdId: string, ghostSessionId: string) => boolean;
  isCrowdExpired: (crowdId: string) => boolean;
  getAdminCount: (crowdId: string) => number;
  setPinnedMessage: (crowdId: string, messageId: string | undefined) => void;
}
```

**Key Features**:
- Tracks all crowds in a normalized structure
- Handles name conflict resolution automatically
- Validates admin permissions for actions
- Manages crowd lifecycle (create, join, leave, delete)
- Supports multiple admins

#### **3. useChatStore** (`/stores/useChatStore.ts`)

**Purpose**: Manages all chat messages and typing indicators

```typescript
interface Message {
  id: string;
  crowdId: string;
  senderGhostName: string;
  senderGhostSessionId: string;
  text: string;
  createdAt: Date;
  isSystem: boolean;
  systemType?: 'join' | 'leave' | 'expiryWarning' | 'expired' | 'adminLock' | 'adminUnlock' | 'kick' | 'promote' | 'demote';
  
  // Media
  mediaType?: 'image' | 'video' | 'file';
  mediaUrl?: string;
  mediaName?: string;
}

interface TypingUser {
  ghostName: string;
  ghostSessionId: string;
  crowdId: string;
  timestamp: number;
}

interface ChatState {
  messagesByCrowdId: Record<string, Message[]>;
  typingUsers: TypingUser[];
  
  // Actions
  sendMessage: (...) => void;
  sendMediaMessage: (...) => void;
  addSystemMessage: (...) => void;
  setTyping: (crowdId, ghostName, ghostSessionId, isTyping) => void;
  getTypingUsersForCrowd: (crowdId, excludeSessionId?) => string[];
}
```

**Key Features**:
- Messages organized by crowd ID
- Typing indicators with 3-second timeout
- System message support with types
- Media message support
- Auto-cleanup of old typing states

---

## 🎨 THEME SYSTEM

### Color Palettes

#### **Ghost Mode Theme** (Purple)

```css
/* Primary Colors */
--ghost-primary: #9B7BFF;
--ghost-primary-light: #B88DFF;
--ghost-primary-dark: #7B5FD9;

/* Background Gradients */
--bg-gradient-start: #050509;
--bg-gradient-end: #141426;
--bg-card: #141422;
--bg-card-hover: #1A1A2E;
--bg-darker: #0A0A14;

/* Text Colors */
--text-primary: #FFFFFF;
--text-secondary: #C5C6E3;
--text-tertiary: #8B8CAD;
--text-muted: #5E607E;

/* Borders & Dividers */
--border-subtle: rgba(255, 255, 255, 0.08);
--border-light: rgba(255, 255, 255, 0.05);

/* Status Colors */
--success: #4ADE80;
--error: #FF6363;
--warning: #FBBF24;

/* Glow Effects */
--glow-purple: rgba(155, 123, 255, 0.3);
--shadow-purple: 0 0 30px rgba(155, 123, 255, 0.2);
```

#### **Amigo Account Theme** (Premium Blue)

```css
/* Primary Colors */
--amigo-primary: #3B82F6;
--amigo-gradient-start: #2563EB;
--amigo-gradient-end: #1D4ED8;
--amigo-dark: #1E40AF;

/* Background (Darker than Ghost) */
--bg-amigo: #0A0A14;
--bg-amigo-card: #141422;

/* Text (Same as Ghost Mode) */
--text-primary: #FFFFFF;
--text-secondary: #8B8CAD;

/* Borders */
--border-amigo: rgba(29, 78, 216, 0.3);
--border-amigo-hover: rgba(37, 99, 235, 0.5);

/* Glow Effects */
--glow-blue: rgba(59, 130, 246, 0.4);
--shadow-blue: 0 0 24px rgba(29, 78, 216, 0.5);
```

### Typography

```css
/* Font Family */
--font-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;

/* Font Sizes (Ghost Mode optimized) */
--text-xs: 12px;
--text-sm: 13px;
--text-base: 14px;
--text-md: 15px;
--text-lg: 16px;
--text-xl: 20px;
--text-2xl: 22px;
--text-3xl: 28px;
--text-4xl: 32px;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Design Tokens

#### Border Radius
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 14px;
--radius-xl: 20px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

#### Spacing
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
```

#### Shadows
```css
/* Ghost Mode */
--shadow-ghost-sm: 0 2px 8px rgba(155, 123, 255, 0.1);
--shadow-ghost-md: 0 4px 16px rgba(155, 123, 255, 0.2);
--shadow-ghost-lg: 0 8px 32px rgba(155, 123, 255, 0.3);

/* Amigo */
--shadow-amigo-sm: 0 2px 8px rgba(59, 130, 246, 0.1);
--shadow-amigo-md: 0 4px 16px rgba(59, 130, 246, 0.25);
--shadow-amigo-lg: 0 8px 32px rgba(59, 130, 246, 0.4);
```

---

## 🧪 DEMO DATA

### Test Credentials

#### **Phone Numbers**
- **Existing User**: `9971645229` (any country code)
  - Skips AccessRequired screen
  - Goes directly to OTP → Amigo Home
- **New User**: Any other phone number
  - Requires invite code or premium pass
  - Goes to AccessRequired screen

#### **Invite Codes** (Accepted in demo)
- `ABC123`
- `XYZ789`
- `DEMO01`
- Any 6-character alphanumeric code (demo mode)

#### **OTP Codes** (Accepted in demo)
- `123456` (always works)
- Any 6-digit code (demo mode)

### Mock Crowd Data

The app includes one pre-existing crowd for demo purposes:

```javascript
{
  id: 'crowd-1',
  name: 'Midnight Runners',
  createdAt: now,
  expiresAt: now + 3 days,
  createdByGhostName: 'Ghost_Runner',
  durationDays: 3,
  adminOnlyTalk: false,
  memberCount: 3,
  members: [
    { 
      ghostName: 'Ghost_Runner', 
      isAdmin: true, 
      isCreator: true,
      joinedAt: 70 minutes ago 
    },
    { 
      ghostName: 'Anon_Owl', 
      isAdmin: false,
      joinedAt: 55 minutes ago 
    },
    { 
      ghostName: 'Shadow_Ninja', 
      isAdmin: false,
      joinedAt: 30 minutes ago 
    }
  ]
}
```

### Mock Messages

Pre-loaded messages for demo crowd:

```javascript
[
  {
    sender: 'Ghost_Runner',
    text: 'Welcome everyone to the midnight run planning.',
    time: 1 hour ago,
    isSystem: false
  },
  {
    sender: 'System',
    text: 'Anon_Owl joined the crowd.',
    time: 55 minutes ago,
    isSystem: true,
    systemType: 'join'
  },
  {
    sender: 'Anon_Owl',
    text: 'Thanks! Where are we meeting?',
    time: 50 minutes ago,
    isSystem: false
  }
]
```

---

## 🛠️ COMPONENT LIBRARY

### Custom UI Components

#### **Ghost Mode Components**
- `GhostButton`: Primary/secondary/ghost variants with loading states
- `GhostInput`: Styled input with validation errors
- `GhostLoadingIcon`: Animated floating ghost icon
- `GhostQrCode`: QR code generator with purple gradient
- `Avatar`: Gradient avatar with initials, status indicator
- `TopNavBar`: Navigation bar with back button and title
- `SegmentedControl`: iOS-style segmented control
- `MessageBubble`: Chat message component with media support
- `ScanFrame`: Animated QR scan frame overlay
- `CountdownBadge`: Time remaining badge with urgency colors

#### **Shared Components**
- `AlertDialog`: Confirmation dialogs
- `Dialog`: Modal dialogs
- `Sheet`: Bottom sheets
- `Tooltip`: Hover tooltips
- `Popover`: Popover menus
- `Accordion`: Collapsible sections
- `Card`: Content cards with variants

---

## 📊 NAVIGATION ARCHITECTURE

```
App.tsx (Root Router)
│
├─ SplashScreen (initial)
│
├─ EntryScreen (modal switch)
│  ├─ Ghost Mode Path →
│  │  ├─ GhostNameScreen
│  │  └─ GhostHomeScreen (hub)
│  │     ├─ CreateCrowdScreen → CrowdQrScreen → Chat
│  │     ├─ QrScanScreen → Chat
│  │     └─ Chat → ViewQrScreen
│  │
│  └─ Amigo Path →
│     ├─ PhoneNumberPopup (modal)
│     ├─ Existing User:
│     │  └─ OtpScreen → AmigoHomeScreen
│     │
│     └─ New User:
│        └─ AccessRequiredScreen
│           ├─ InviteCodeScreen → OtpScreen → ProfileSetup → AmigoHome
│           └─ PremiumPassScreen → OtpScreen → ProfileSetup → AmigoHome
│
└─ Shared Components (modals, dialogs, sheets)
```

---

## 🔒 SECURITY & PRIVACY

### Ghost Mode Security

1. **No Personal Data**: Zero PII collected
2. **Ephemeral Sessions**: All data tied to session, deleted on exit
3. **Secure QR Codes**: Include secret for validation
4. **No Tracking**: No analytics, cookies, or trackers
5. **Temporary Data**: All crowds and messages auto-delete after expiry

### Amigo Account Security

1. **Phone Verification**: OTP-based authentication
2. **Secure Sessions**: Session tokens with expiry
3. **Password-less**: No passwords to leak
4. **Invite Gating**: Controlled user growth
5. **Premium Verification**: Payment verification via secure gateway

---

## 🚀 FUTURE FEATURES (Roadmap)

### Ghost Mode
- [ ] End-to-end encryption
- [ ] Voice messages
- [ ] Reactions to messages
- [ ] Message replies/threads
- [ ] Custom crowd themes
- [ ] Crowd templates
- [ ] Export crowd history (before expiry)
- [ ] Crowd discovery (public crowds)

### Amigo Account
- [ ] Friends system
- [ ] Private messaging
- [ ] Profile customization
- [ ] Account recovery options
- [ ] Two-factor authentication
- [ ] Activity history
- [ ] Invite code generation
- [ ] Referral rewards

---

## 📝 NOTES

### Development Info
- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (Framer Motion)
- **State**: Zustand
- **Form Validation**: React Hook Form + Zod
- **Date/Time**: date-fns
- **Icons**: Lucide React
- **QR Codes**: qrcode.react

### Demo Limitations
- No real backend (all simulated)
- No real camera access (simulated scanning)
- No real SMS (OTP auto-accepted)
- No real payments (purchase simulated)
- No persistence (reloads clear data except Zustand persist)

---

**END OF DOCUMENTATION**

*For questions or updates, contact the development team.*
