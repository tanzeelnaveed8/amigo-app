import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
  Modal,
} from 'react-native';
import {FontFamily} from '../../../GlobalStyles';
import AdminShieldIcon from '../../assets/svg/AdminShieldIcon';
import FlagIcon from '../../assets/svg/FlagIcon';
import InfoIcon from '../../assets/svg/InfoIcon';
import CloseIcon from '../../assets/svg/CloseIcon';
import RightArrowIcon from '../../assets/svg/RightArrowIcon';
import WarningIcon from '../../assets/svg/WarningIcon';
import MailSvg from '../../assets/svg/MailSVG';
import ExternalLinkSvg from '../../assets/svg/ExternalLinkSVG';
import FileTextSvg from '../../assets/svg/FileTextSVG';

const SettingItem = ({
  icon: Icon,
  iconColor,
  title,
  description,
  onPress,
  isDestructive = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.settingItem}
    activeOpacity={0.7}
  >
    <View
      style={[styles.iconContainer, {backgroundColor: `${iconColor}20`}]}
    >
      <Icon width={24} height={24} strokeColor={iconColor}/>
    </View>
    <View style={styles.textContainer}>
      <Text style={[styles.itemTitle, isDestructive && styles.destructiveText]}>
        {title}
      </Text>
      <Text style={styles.itemDescription}>
        {description}
      </Text>
    </View>
    <ExternalLinkSvg width={18} height={18} strokeColor="#8B8CAD" />
  </TouchableOpacity>
);

const GhostSettingsScreen = ({navigation}) => {
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleContactUs = () => {
    setShowContactDialog(true);
  };

  const handleReportSafety = () => {
    setShowReportDialog(true);
  };

  const openEULA = () => {
    Linking.openURL('https://www.cryptogram.tech/eula').catch(err =>
      console.error("Couldn't load page", err),
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://www.cryptogram.tech/privacy').catch(err =>
      console.error("Couldn't load page", err),
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.closeButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <CloseIcon width={24} height={24} strokeColor="#8B8CAD" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Support & Safety</Text>
            <View style={styles.itemsContainer}>
              <SettingItem
                icon={MailSvg}
                iconColor="#9B7BFF"
                title="Contact Us"
                description="Get help or send feedback to our support team"
                onPress={handleContactUs}
              />
              <SettingItem
                icon={AdminShieldIcon}
                iconColor="#FF6363"
                title="Report Safety Issue"
                description="Report abuse, harassment, or safety concerns"
                onPress={handleReportSafety}
                isDestructive
              />
            </View>
          </View>

          {/* Legal Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Legal</Text>
            <View style={styles.itemsContainer}>
              <SettingItem
                icon={FileTextSvg}
                iconColor="#60A5FA"
                title="Privacy Policy"
                description="Learn how we protect your data and privacy"
                onPress={openPrivacyPolicy}
              />
              <SettingItem
                icon={FileTextSvg}
                iconColor="#60A5FA"
                title="Terms of Service (EULA)"
                description="Read our end user license agreement"
                onPress={openEULA}
              />
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              <Text style={styles.highlightText}>Ghost Mode</Text> is a temporary, anonymous chat experience.
              We take safety seriously and have zero tolerance for abusive content.
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Contact Us Dialog */}
      <Modal
        visible={showContactDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContactDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconContainer, {backgroundColor: 'rgba(155, 123, 255, 0.2)'}]}>
                <MailSvg width={24} height={24} strokeColor="#9B7BFF" />
              </View>
              <Text style={styles.modalTitle}>Contact Support</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Need help or have feedback? We'd love to hear from you!
              </Text>

              <View style={styles.emailBox}>
                <Text style={styles.emailLabel}>Email us:</Text>
                <TouchableOpacity onPress={() => Linking.openURL('mailto:support@cryptogram.tech')}>
                  <Text style={styles.emailLink}>support@cryptogram.tech</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalFooterText}>
                We typically respond within 24-48 hours.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.modalButton, {backgroundColor: '#9B7BFF'}]}
              onPress={() => setShowContactDialog(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Report Safety Dialog */}
      <Modal
        visible={showReportDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconContainer, {backgroundColor: 'rgba(255, 99, 99, 0.2)'}]}>
                <WarningIcon width={24} height={24} strokeColor="#FF6363" />
              </View>
              <Text style={styles.modalTitle}>Report Safety Issue</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Report abuse, harassment, illegal content, or safety concerns.
              </Text>

              <View style={styles.emailBox}>
                <Text style={styles.emailLabel}>Email us:</Text>
                <TouchableOpacity onPress={() => Linking.openURL('mailto:support@cryptogram.tech')}>
                  <Text style={styles.emailLink}>support@cryptogram.tech</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.alertBox}>
                <Text style={styles.alertText}>
                  <Text style={styles.alertHighlight}>Zero Tolerance:</Text> Reports are reviewed immediately.
                  Confirmed violations result in permanent bans.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.modalButton, {backgroundColor: '#FF6363'}]}
              onPress={() => setShowReportDialog(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default GhostSettingsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 12,
    fontWeight: '700',
    color: '#8B8CAD',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  itemsContainer: {
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    backgroundColor: '#141422',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  destructiveText: {
    color: '#FF6363',
  },
  itemDescription: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 13,
    color: '#8B8CAD',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: 'rgba(20, 20, 34, 0.5)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(155, 123, 255, 0.2)',
    marginTop: 8,
  },
  infoText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 12,
    color: '#C5C6E3',
    lineHeight: 18,
  },
  highlightText: {
    color: '#9B7BFF',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0A0A14',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  modalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBody: {
    marginBottom: 24,
  },
  modalDescription: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 14,
    color: '#C5C6E3',
    lineHeight: 20,
    marginBottom: 16,
  },
  emailBox: {
    backgroundColor: '#141422',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  emailLabel: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emailLink: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 16,
    color: '#FF6363',
    textDecorationLine: 'underline',
  },
  modalFooterText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 12,
    color: '#8B8CAD',
  },
  alertBox: {
    backgroundColor: 'rgba(255, 99, 99, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 99, 0.3)',
  },
  alertText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 12,
    color: '#C5C6E3',
    lineHeight: 18,
  },
  alertHighlight: {
    color: '#FF6363',
    fontWeight: '700',
  },
  modalButton: {
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});