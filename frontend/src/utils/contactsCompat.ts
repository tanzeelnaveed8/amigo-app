import * as ExpoContacts from 'expo-contacts';

async function getAll() {
  const {status} = await ExpoContacts.requestPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Contact permission denied');
  }

  const {data} = await ExpoContacts.getContactsAsync({
    fields: [
      ExpoContacts.Fields.PhoneNumbers,
      ExpoContacts.Fields.Emails,
      ExpoContacts.Fields.Name,
      ExpoContacts.Fields.FirstName,
      ExpoContacts.Fields.LastName,
      ExpoContacts.Fields.Image,
    ],
  });

  return data.map(contact => ({
    recordID: contact.id,
    givenName: contact.firstName || '',
    familyName: contact.lastName || '',
    displayName: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
    phoneNumbers: (contact.phoneNumbers || []).map(p => ({
      label: p.label || 'mobile',
      number: p.number || '',
    })),
    emailAddresses: (contact.emails || []).map(e => ({
      label: e.label || 'email',
      email: e.email || '',
    })),
    thumbnailPath: contact.image?.uri || '',
    hasThumbnail: !!contact.image?.uri,
  }));
}

const ContactsCompat = {
  getAll,
};

export default ContactsCompat;
