import React, {useEffect, useRef, useState, useMemo} from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {Phone, Search, X} from 'lucide-react-native';
import {FontFamily} from '../../../GlobalStyles';
import CloseIcon from '../../assets/svg/CloseIcon';
import WhiteGhostIcon from '../../assets/svg/WhiteGhostIcon';
import {shadow} from '../../constants/shadows';

const ALL_COUNTRIES = [
  {code: '+93', name: 'Afghanistan', flag: '🇦🇫'},
  {code: '+355', name: 'Albania', flag: '🇦🇱'},
  {code: '+213', name: 'Algeria', flag: '🇩🇿'},
  {code: '+376', name: 'Andorra', flag: '🇦🇩'},
  {code: '+244', name: 'Angola', flag: '🇦🇴'},
  {code: '+1268', name: 'Antigua & Barbuda', flag: '🇦🇬'},
  {code: '+54', name: 'Argentina', flag: '🇦🇷'},
  {code: '+374', name: 'Armenia', flag: '🇦🇲'},
  {code: '+61', name: 'Australia', flag: '🇦🇺'},
  {code: '+43', name: 'Austria', flag: '🇦🇹'},
  {code: '+994', name: 'Azerbaijan', flag: '🇦🇿'},
  {code: '+1242', name: 'Bahamas', flag: '🇧🇸'},
  {code: '+973', name: 'Bahrain', flag: '🇧🇭'},
  {code: '+880', name: 'Bangladesh', flag: '🇧🇩'},
  {code: '+1246', name: 'Barbados', flag: '🇧🇧'},
  {code: '+375', name: 'Belarus', flag: '🇧🇾'},
  {code: '+32', name: 'Belgium', flag: '🇧🇪'},
  {code: '+501', name: 'Belize', flag: '🇧🇿'},
  {code: '+229', name: 'Benin', flag: '🇧🇯'},
  {code: '+975', name: 'Bhutan', flag: '🇧🇹'},
  {code: '+591', name: 'Bolivia', flag: '🇧🇴'},
  {code: '+387', name: 'Bosnia & Herzegovina', flag: '🇧🇦'},
  {code: '+267', name: 'Botswana', flag: '🇧🇼'},
  {code: '+55', name: 'Brazil', flag: '🇧🇷'},
  {code: '+673', name: 'Brunei', flag: '🇧🇳'},
  {code: '+359', name: 'Bulgaria', flag: '🇧🇬'},
  {code: '+226', name: 'Burkina Faso', flag: '🇧🇫'},
  {code: '+257', name: 'Burundi', flag: '🇧🇮'},
  {code: '+855', name: 'Cambodia', flag: '🇰🇭'},
  {code: '+237', name: 'Cameroon', flag: '🇨🇲'},
  {code: '+1', name: 'Canada', flag: '🇨🇦'},
  {code: '+238', name: 'Cape Verde', flag: '🇨🇻'},
  {code: '+236', name: 'Central African Republic', flag: '🇨🇫'},
  {code: '+235', name: 'Chad', flag: '🇹🇩'},
  {code: '+56', name: 'Chile', flag: '🇨🇱'},
  {code: '+86', name: 'China', flag: '🇨🇳'},
  {code: '+57', name: 'Colombia', flag: '🇨🇴'},
  {code: '+269', name: 'Comoros', flag: '🇰🇲'},
  {code: '+242', name: 'Congo', flag: '🇨🇬'},
  {code: '+243', name: 'Congo (DRC)', flag: '🇨🇩'},
  {code: '+506', name: 'Costa Rica', flag: '🇨🇷'},
  {code: '+385', name: 'Croatia', flag: '🇭🇷'},
  {code: '+53', name: 'Cuba', flag: '🇨🇺'},
  {code: '+357', name: 'Cyprus', flag: '🇨🇾'},
  {code: '+420', name: 'Czech Republic', flag: '🇨🇿'},
  {code: '+225', name: "Côte d'Ivoire", flag: '🇨🇮'},
  {code: '+45', name: 'Denmark', flag: '🇩🇰'},
  {code: '+253', name: 'Djibouti', flag: '🇩🇯'},
  {code: '+1767', name: 'Dominica', flag: '🇩🇲'},
  {code: '+1809', name: 'Dominican Republic', flag: '🇩🇴'},
  {code: '+593', name: 'Ecuador', flag: '🇪🇨'},
  {code: '+20', name: 'Egypt', flag: '🇪🇬'},
  {code: '+503', name: 'El Salvador', flag: '🇸🇻'},
  {code: '+240', name: 'Equatorial Guinea', flag: '🇬🇶'},
  {code: '+291', name: 'Eritrea', flag: '🇪🇷'},
  {code: '+372', name: 'Estonia', flag: '🇪🇪'},
  {code: '+251', name: 'Ethiopia', flag: '🇪🇹'},
  {code: '+679', name: 'Fiji', flag: '🇫🇯'},
  {code: '+358', name: 'Finland', flag: '🇫🇮'},
  {code: '+33', name: 'France', flag: '🇫🇷'},
  {code: '+241', name: 'Gabon', flag: '🇬🇦'},
  {code: '+220', name: 'Gambia', flag: '🇬🇲'},
  {code: '+995', name: 'Georgia', flag: '🇬🇪'},
  {code: '+49', name: 'Germany', flag: '🇩🇪'},
  {code: '+233', name: 'Ghana', flag: '🇬🇭'},
  {code: '+30', name: 'Greece', flag: '🇬🇷'},
  {code: '+1473', name: 'Grenada', flag: '🇬🇩'},
  {code: '+502', name: 'Guatemala', flag: '🇬🇹'},
  {code: '+224', name: 'Guinea', flag: '🇬🇳'},
  {code: '+245', name: 'Guinea-Bissau', flag: '🇬🇼'},
  {code: '+592', name: 'Guyana', flag: '🇬🇾'},
  {code: '+509', name: 'Haiti', flag: '🇭🇹'},
  {code: '+504', name: 'Honduras', flag: '🇭🇳'},
  {code: '+852', name: 'Hong Kong', flag: '🇭🇰'},
  {code: '+36', name: 'Hungary', flag: '🇭🇺'},
  {code: '+354', name: 'Iceland', flag: '🇮🇸'},
  {code: '+91', name: 'India', flag: '🇮🇳'},
  {code: '+62', name: 'Indonesia', flag: '🇮🇩'},
  {code: '+98', name: 'Iran', flag: '🇮🇷'},
  {code: '+964', name: 'Iraq', flag: '🇮🇶'},
  {code: '+353', name: 'Ireland', flag: '🇮🇪'},
  {code: '+972', name: 'Israel', flag: '🇮🇱'},
  {code: '+39', name: 'Italy', flag: '🇮🇹'},
  {code: '+1876', name: 'Jamaica', flag: '🇯🇲'},
  {code: '+81', name: 'Japan', flag: '🇯🇵'},
  {code: '+962', name: 'Jordan', flag: '🇯🇴'},
  {code: '+7', name: 'Kazakhstan', flag: '🇰🇿'},
  {code: '+254', name: 'Kenya', flag: '🇰🇪'},
  {code: '+686', name: 'Kiribati', flag: '🇰🇮'},
  {code: '+965', name: 'Kuwait', flag: '🇰🇼'},
  {code: '+996', name: 'Kyrgyzstan', flag: '🇰🇬'},
  {code: '+856', name: 'Laos', flag: '🇱🇦'},
  {code: '+371', name: 'Latvia', flag: '🇱🇻'},
  {code: '+961', name: 'Lebanon', flag: '🇱🇧'},
  {code: '+266', name: 'Lesotho', flag: '🇱🇸'},
  {code: '+231', name: 'Liberia', flag: '🇱🇷'},
  {code: '+218', name: 'Libya', flag: '🇱🇾'},
  {code: '+423', name: 'Liechtenstein', flag: '🇱🇮'},
  {code: '+370', name: 'Lithuania', flag: '🇱🇹'},
  {code: '+352', name: 'Luxembourg', flag: '🇱🇺'},
  {code: '+853', name: 'Macau', flag: '🇲🇴'},
  {code: '+261', name: 'Madagascar', flag: '🇲🇬'},
  {code: '+265', name: 'Malawi', flag: '🇲🇼'},
  {code: '+60', name: 'Malaysia', flag: '🇲🇾'},
  {code: '+960', name: 'Maldives', flag: '🇲🇻'},
  {code: '+223', name: 'Mali', flag: '🇲🇱'},
  {code: '+356', name: 'Malta', flag: '🇲🇹'},
  {code: '+692', name: 'Marshall Islands', flag: '🇲🇭'},
  {code: '+222', name: 'Mauritania', flag: '🇲🇷'},
  {code: '+230', name: 'Mauritius', flag: '🇲🇺'},
  {code: '+52', name: 'Mexico', flag: '🇲🇽'},
  {code: '+691', name: 'Micronesia', flag: '🇫🇲'},
  {code: '+373', name: 'Moldova', flag: '🇲🇩'},
  {code: '+377', name: 'Monaco', flag: '🇲🇨'},
  {code: '+976', name: 'Mongolia', flag: '🇲🇳'},
  {code: '+382', name: 'Montenegro', flag: '🇲🇪'},
  {code: '+212', name: 'Morocco', flag: '🇲🇦'},
  {code: '+258', name: 'Mozambique', flag: '🇲🇿'},
  {code: '+95', name: 'Myanmar', flag: '🇲🇲'},
  {code: '+264', name: 'Namibia', flag: '🇳🇦'},
  {code: '+674', name: 'Nauru', flag: '🇳🇷'},
  {code: '+977', name: 'Nepal', flag: '🇳🇵'},
  {code: '+31', name: 'Netherlands', flag: '🇳🇱'},
  {code: '+64', name: 'New Zealand', flag: '🇳🇿'},
  {code: '+505', name: 'Nicaragua', flag: '🇳🇮'},
  {code: '+227', name: 'Niger', flag: '🇳🇪'},
  {code: '+234', name: 'Nigeria', flag: '🇳🇬'},
  {code: '+850', name: 'North Korea', flag: '🇰🇵'},
  {code: '+389', name: 'North Macedonia', flag: '🇲🇰'},
  {code: '+47', name: 'Norway', flag: '🇳🇴'},
  {code: '+968', name: 'Oman', flag: '🇴🇲'},
  {code: '+92', name: 'Pakistan', flag: '🇵🇰'},
  {code: '+680', name: 'Palau', flag: '🇵🇼'},
  {code: '+970', name: 'Palestine', flag: '🇵🇸'},
  {code: '+507', name: 'Panama', flag: '🇵🇦'},
  {code: '+675', name: 'Papua New Guinea', flag: '🇵🇬'},
  {code: '+595', name: 'Paraguay', flag: '🇵🇾'},
  {code: '+51', name: 'Peru', flag: '🇵🇪'},
  {code: '+63', name: 'Philippines', flag: '🇵🇭'},
  {code: '+48', name: 'Poland', flag: '🇵🇱'},
  {code: '+351', name: 'Portugal', flag: '🇵🇹'},
  {code: '+974', name: 'Qatar', flag: '🇶🇦'},
  {code: '+40', name: 'Romania', flag: '🇷🇴'},
  {code: '+7', name: 'Russia', flag: '🇷🇺'},
  {code: '+250', name: 'Rwanda', flag: '🇷🇼'},
  {code: '+1869', name: 'Saint Kitts & Nevis', flag: '🇰🇳'},
  {code: '+1758', name: 'Saint Lucia', flag: '🇱🇨'},
  {code: '+685', name: 'Samoa', flag: '🇼🇸'},
  {code: '+378', name: 'San Marino', flag: '🇸🇲'},
  {code: '+966', name: 'Saudi Arabia', flag: '🇸🇦'},
  {code: '+221', name: 'Senegal', flag: '🇸🇳'},
  {code: '+381', name: 'Serbia', flag: '🇷🇸'},
  {code: '+248', name: 'Seychelles', flag: '🇸🇨'},
  {code: '+232', name: 'Sierra Leone', flag: '🇸🇱'},
  {code: '+65', name: 'Singapore', flag: '🇸🇬'},
  {code: '+421', name: 'Slovakia', flag: '🇸🇰'},
  {code: '+386', name: 'Slovenia', flag: '🇸🇮'},
  {code: '+677', name: 'Solomon Islands', flag: '🇸🇧'},
  {code: '+252', name: 'Somalia', flag: '🇸🇴'},
  {code: '+27', name: 'South Africa', flag: '🇿🇦'},
  {code: '+82', name: 'South Korea', flag: '🇰🇷'},
  {code: '+211', name: 'South Sudan', flag: '🇸🇸'},
  {code: '+34', name: 'Spain', flag: '🇪🇸'},
  {code: '+94', name: 'Sri Lanka', flag: '🇱🇰'},
  {code: '+249', name: 'Sudan', flag: '🇸🇩'},
  {code: '+597', name: 'Suriname', flag: '🇸🇷'},
  {code: '+46', name: 'Sweden', flag: '🇸🇪'},
  {code: '+41', name: 'Switzerland', flag: '🇨🇭'},
  {code: '+963', name: 'Syria', flag: '🇸🇾'},
  {code: '+886', name: 'Taiwan', flag: '🇹🇼'},
  {code: '+992', name: 'Tajikistan', flag: '🇹🇯'},
  {code: '+255', name: 'Tanzania', flag: '🇹🇿'},
  {code: '+66', name: 'Thailand', flag: '🇹🇭'},
  {code: '+670', name: 'Timor-Leste', flag: '🇹🇱'},
  {code: '+228', name: 'Togo', flag: '🇹🇬'},
  {code: '+676', name: 'Tonga', flag: '🇹🇴'},
  {code: '+1868', name: 'Trinidad & Tobago', flag: '🇹🇹'},
  {code: '+216', name: 'Tunisia', flag: '🇹🇳'},
  {code: '+90', name: 'Turkey', flag: '🇹🇷'},
  {code: '+993', name: 'Turkmenistan', flag: '🇹🇲'},
  {code: '+688', name: 'Tuvalu', flag: '🇹🇻'},
  {code: '+256', name: 'Uganda', flag: '🇺🇬'},
  {code: '+380', name: 'Ukraine', flag: '🇺🇦'},
  {code: '+971', name: 'United Arab Emirates', flag: '🇦🇪'},
  {code: '+44', name: 'United Kingdom', flag: '🇬🇧'},
  {code: '+1', name: 'United States', flag: '🇺🇸'},
  {code: '+598', name: 'Uruguay', flag: '🇺🇾'},
  {code: '+998', name: 'Uzbekistan', flag: '🇺🇿'},
  {code: '+678', name: 'Vanuatu', flag: '🇻🇺'},
  {code: '+58', name: 'Venezuela', flag: '🇻🇪'},
  {code: '+84', name: 'Vietnam', flag: '🇻🇳'},
  {code: '+967', name: 'Yemen', flag: '🇾🇪'},
  {code: '+260', name: 'Zambia', flag: '🇿🇲'},
  {code: '+263', name: 'Zimbabwe', flag: '🇿🇼'},
];

const PhoneNumberModal = ({
  visible,
  onClose,
  onVerify,
  title = 'Enter your mobile number',
  verifyButtonText = 'Verify',
  defaultCountryCode = '+91',
}) => {
  const defaultCountry = ALL_COUNTRIES.find(c => c.code === defaultCountryCode) || ALL_COUNTRIES.find(c => c.name === 'India');
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 5],
  });

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [floatAnim]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return ALL_COUNTRIES;
    const q = searchQuery.toLowerCase().trim();
    return ALL_COUNTRIES.filter(
      c => c.name.toLowerCase().includes(q) || c.code.includes(q),
    );
  }, [searchQuery]);

  const handleVerify = () => {
    onVerify(selectedCountry.code, phoneNumber);
  };

  const handleClose = () => {
    setPhoneNumber('');
    setShowCountryPicker(false);
    setIsLoading(false);
    setSearchQuery('');
    onClose();
  };

  const handleSelectCountry = country => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    setSearchQuery('');
  };

  const renderCountryItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        selectedCountry?.code === item.code &&
          selectedCountry?.name === item.name &&
          styles.countryItemSelected,
      ]}
      onPress={() => handleSelectCountry(item)}
      activeOpacity={0.7}>
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <Text style={styles.countryName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.countryCode}>{item.code}</Text>
    </TouchableOpacity>
  );

  const isValidPhone = phoneNumber.length >= 7;

  // Country picker modal
  if (showCountryPicker) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setShowCountryPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, {paddingTop: 20, maxHeight: '80%'}]}>
            {/* Header */}
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => { setShowCountryPicker(false); setSearchQuery(''); }} style={styles.pickerClose}>
                <X size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Search size={18} color="#8B8CAD" />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search country or code..."
                placeholderTextColor="#8B8CAD"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color="#8B8CAD" />
                </TouchableOpacity>
              )}
            </View>

            {/* Country list */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item, idx) => `${item.code}-${item.name}-${idx}`}
              renderItem={renderCountryItem}
              style={styles.countryList}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No countries found</Text>
              }
            />
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.modalContainer}>
              {isLoading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
                  <Text style={styles.loaderText}>Checking account...</Text>
                </View>
              ) : (
                <>
                  {/* Close Button */}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                    activeOpacity={0.8}>
                    <CloseIcon width={24} height={24} />
                  </TouchableOpacity>

                  {/* Ghost Icon */}
                  <Animated.View style={[styles.iconContainer, {transform: [{translateY}]}]}>
                    <WhiteGhostIcon stroke="#3B82F6" width={35} height={35} />
                  </Animated.View>

                  {/* Title */}
                  <Text style={styles.title}>{title}</Text>

                  {/* Input Fields */}
                  <View style={styles.inputContainer}>
                    {/* Country Code Selector */}
                    <TouchableOpacity
                      style={styles.countryCodeButton}
                      onPress={() => setShowCountryPicker(true)}
                      activeOpacity={0.8}>
                      <Text style={styles.flagText}>{selectedCountry?.flag}</Text>
                      <Text style={styles.codeText}>{selectedCountry?.code}</Text>
                      <Text style={styles.chevron}>▼</Text>
                    </TouchableOpacity>

                    {/* Phone Number Input */}
                    <View style={styles.phoneInputContainer}>
                      <Phone size={20} color="#3B82F6" style={{marginRight: 10}} />
                      <TextInput
                        style={styles.phoneInput}
                        placeholder="Phone number"
                        placeholderTextColor="#8B8CAD"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        autoComplete="tel"
                        textContentType="telephoneNumber"
                        maxLength={15}
                      />
                    </View>
                  </View>

                  {/* Verify Button */}
                  <TouchableOpacity
                    style={[styles.verifyButton, isValidPhone && styles.verifyButtonActive]}
                    disabled={!isValidPhone}
                    onPress={handleVerify}
                    activeOpacity={0.8}>
                    <Text style={styles.verifyButtonText}>{verifyButtonText}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default PhoneNumberModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#0A0A14',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 25,
    alignItems: 'center',
    ...shadow,
  },
  title: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181830',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    gap: 6,
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
  },
  flagText: {
    fontSize: 20,
  },
  codeText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 15,
    color: '#FFFFFF',
  },
  chevron: {
    fontSize: 9,
    color: '#8B8CAD',
  },
  phoneInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181830',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    borderWidth: 0.5,
    borderColor: '#3B82F6',
    ...shadow,
  },
  phoneInput: {
    flex: 1,
    fontFamily: FontFamily.robotoRegular,
    fontSize: 16,
    color: '#FFFFFF',
    padding: 0,
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#111C46',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 255, 0.3)',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  verifyButtonActive: {
    backgroundColor: '#2058E1',
  },
  verifyButtonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
  },
  loaderContainer: {
    width: '100%',
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    ...shadow,
  },
  loader: {
    marginBottom: 24,
  },
  loaderText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Country picker styles
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  pickerTitle: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pickerClose: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181830',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    width: '100%',
    marginBottom: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.robotoRegular,
    fontSize: 15,
    color: '#FFFFFF',
    padding: 0,
  },
  countryList: {
    width: '100%',
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  countryItemSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  countryFlag: {
    fontSize: 22,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontFamily: FontFamily.robotoRegular,
    fontSize: 15,
    color: '#FFFFFF',
  },
  countryCode: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 14,
    color: '#8B8CAD',
    marginLeft: 8,
  },
  emptyText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 15,
    color: '#8B8CAD',
    textAlign: 'center',
    paddingVertical: 30,
  },
});
