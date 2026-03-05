# ✅ EULA & Active Consent Implementation

## 🎯 Purpose
**App Store Compliance** - Apple and Google require **Active Consent** to EULA/Privacy Policy before users can generate content in anonymous chat apps.

## 📍 Location
**File**: `/screens/EntryScreen.tsx`  
**Screen**: Entry screen (before Ghost Mode)

## ✨ Implementation Details

### UI Components
1. **Checkbox** ☑️
   - Unchecked by default
   - Purple theme (#9B7BFF)
   - Accessible (aria-label)
   - Keyboard navigable

2. **Legal Text**
   ```
   "I agree to the [EULA] and [Privacy Policy]. 
   I understand there is zero tolerance for abusive content."
   ```
   - EULA = clickable link (purple, underlined)
   - Privacy Policy = clickable link (purple, underlined)
   - Zero tolerance warning = explicit safety notice

3. **Button State**
   - **Disabled** when checkbox unchecked (grayed out, no click)
   - **Enabled** when checkbox checked (purple glow, clickable)

### Logic Flow
```
User arrives at EntryScreen
  ↓
Checkbox: UNCHECKED (default)
Button: DISABLED
  ↓
User clicks checkbox → Checkbox: CHECKED
  ↓
Button: ENABLED
  ↓
User clicks "Enter Ghost Mode"
  ↓
Proceeds to GhostNameScreen
```

## 🔒 Why This Matters

### App Store Guidelines
- **Guideline 1.2 (Safety)**: Requires active consent for UGC apps
- **Guideline 5.1.1 (Legal)**: Privacy Policy must be accessible
- **High-Risk Apps**: Anonymous chat = extra scrutiny

### Active Consent vs Passive
❌ **Passive** (Rejected): "By continuing, you agree..."  
✅ **Active** (Approved): User must check box before proceeding

### Zero Tolerance Language
Including "zero tolerance for abusive content" shows:
- App takes safety seriously
- Users are warned upfront
- Reduces liability

## 📱 Production Setup

### Before Submitting to App Stores:

1. **Create Real EULA**
   - ✅ **DONE**: Hosted at `https://www.cryptogram.tech/eula`
   - ✅ **DONE**: Link updated in EntryScreen.tsx

2. **Create Real Privacy Policy**
   - ✅ **DONE**: Hosted at `https://www.cryptogram.tech/privacy`
   - ✅ **DONE**: Link updated in EntryScreen.tsx
   - Must include:
     - Data collection practices
     - Temporary/anonymous nature
     - No PII collection
     - Auto-deletion policy

3. **Link Behavior**
   - ✅ Opens in new tab (`target="_blank"`)
   - ✅ Security: `rel="noopener noreferrer"`
   - ✅ Prevents checkbox toggle when clicking links (`e.stopPropagation()`)

### Production Code (LIVE):
```tsx
<a 
  href="https://www.cryptogram.tech/eula" 
  target="_blank"
  rel="noopener noreferrer"
  onClick={(e) => e.stopPropagation()}
  className="text-[#9B7BFF] underline hover:text-[#B88DFF]"
>
  EULA
</a>

<a 
  href="https://www.cryptogram.tech/privacy" 
  target="_blank"
  rel="noopener noreferrer"
  onClick={(e) => e.stopPropagation()}
  className="text-[#9B7BFF] underline hover:text-[#B88DFF]"
>
  Privacy Policy
</a>
```

## 🧪 Testing

### Manual Test:
1. Open app → EntryScreen
2. Verify checkbox is **unchecked**
3. Verify "Enter Ghost Mode" button is **grayed out**
4. Click checkbox → Checkbox checked
5. Verify button is now **purple/enabled**
6. Click button → Navigates to GhostNameScreen

### Edge Cases:
- Uncheck after checking → Button disables again ✅
- Click EULA link → Opens https://www.cryptogram.tech/eula in new tab ✅
- Click Privacy Policy link → Opens https://www.cryptogram.tech/privacy in new tab ✅
- Clicking links doesn't toggle checkbox ✅
- Keyboard navigation (Tab → Space to check) ✅

## 📊 Compliance Checklist

- [x] Checkbox visible and accessible
- [x] Checkbox unchecked by default
- [x] Button disabled until checked
- [x] EULA link clickable
- [x] Privacy Policy link clickable
- [x] "Zero tolerance" language included
- [x] Real EULA hosted and linked (https://www.cryptogram.tech/eula)
- [x] Real Privacy Policy hosted and linked (https://www.cryptogram.tech/privacy)
- [x] Links open in new tab securely

## 🚨 Important Notes

1. **Required for Both Stores**
   - Apple App Store: Guideline 1.2, 5.1.1
   - Google Play: User Data policy

2. **Cannot Bypass**
   - No "Skip" option
   - No auto-check on load
   - User must actively check the box

3. **Persistence**
   - Currently resets on app restart (stateless)
   - Consider saving to localStorage for better UX
   - Still show on first-time launch

4. **Login/Sign Up Flow**
   - Currently only on Ghost Mode
   - Consider adding to Login flow too for consistency

## 🎨 Styling Details

- **Theme**: Purple (#9B7BFF) - Ghost Mode brand color
- **Font Size**: 12px - Readable but not intrusive
- **Spacing**: 3px gap between checkbox and text
- **Animation**: Fades in at 0.3s delay
- **Accessibility**: Full keyboard support, aria-labels

---

**Status**: ✅ Implemented & Production Ready  
**File Modified**: `/screens/EntryScreen.tsx`  
**Lines Changed**: +52 lines (added state, checkbox, disabled logic)  
**EULA URL**: https://www.cryptogram.tech/eula  
**Privacy Policy URL**: https://www.cryptogram.tech/privacy  
**Ready for**: App Store submission ✅