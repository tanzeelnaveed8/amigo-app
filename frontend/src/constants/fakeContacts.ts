/**
 * Fake contacts for testing - number 03202834184
 */
export const FAKE_CONTACT_NUMBER = '03202834184';

export interface FakeContactItem {
  id: string;
  name: string;
  desc?: string;
  profileImage?: string;
  displayName?: string;
  userName?: string;
  blockUser?: any;
  conversationId?: string;
}

export const FAKE_CONTACTS_0320: FakeContactItem[] = [
  { id: 'fake-0320-1', name: 'Fake One', displayName: 'Fake One', desc: FAKE_CONTACT_NUMBER, userName: `user_${FAKE_CONTACT_NUMBER}_1` },
  { id: 'fake-0320-2', name: 'Fake Two', displayName: 'Fake Two', desc: FAKE_CONTACT_NUMBER, userName: `user_${FAKE_CONTACT_NUMBER}_2` },
  { id: 'fake-0320-3', name: 'Fake Three', displayName: 'Fake Three', desc: FAKE_CONTACT_NUMBER, userName: `user_${FAKE_CONTACT_NUMBER}_3` },
  { id: 'fake-0320-4', name: 'Fake Four', displayName: 'Fake Four', desc: FAKE_CONTACT_NUMBER, userName: `user_${FAKE_CONTACT_NUMBER}_4` },
];
