import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  Plus,
  FileText,
  Search,
  ChevronRight,
  X,
  Shield,
  Pencil,
  Check,
  AlertCircle,
} from 'lucide-react-native';
import moment from 'moment';
import Context from '../../context';
import useNavigationHook from '../../hooks/use_navigation';
import {
  getWalletList,
  uploadWalletFile,
  deleteWalletItem,
  renameWalletItem,
  getWalletItemDownloadUrl,
  WalletItem,
} from '../../apis/wallet';
import { launchImageLibrary } from '../../utils/imagePickerCompat';
import * as DocumentPicker from 'expo-document-picker';
import useTopEnterAnim from '../../hooks/useTopEnterAnim';

const MAX_ITEMS = 30;
const MAX_STORAGE_MB = 300;
const MAX_FILE_SIZE_MB = 70;

const WalletScreen = () => {
  const navigation = useNavigationHook();
  const { colors, setToastMsg } = useContext(Context);
  const isDark = colors.bgColor === '#0A0A14' || (colors.bgColor && String(colors.bgColor).includes('0A0A'));
  const accent = colors.accentColor ?? '#9B7BFF';
  const enterStyle = useTopEnterAnim({ offsetY: -40 });

  const [items, setItems] = useState<WalletItem[]>([]);
  const [totalSizeBytes, setTotalSizeBytes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'docs'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<WalletItem | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWalletList();
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setTotalSizeBytes(res.data.totalSizeBytes || 0);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to load wallet';
      setError(msg);
      setToastMsg?.(msg);
    } finally {
      setLoading(false);
    }
  }, [setToastMsg]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    if (selectedItem) {
      setRenameValue(selectedItem.name);
      setIsRenaming(false);
    }
  }, [selectedItem]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (activeTab === 'images') list = list.filter((i) => i.type === 'image');
    if (activeTab === 'docs') list = list.filter((i) => i.type === 'document');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    return list;
  }, [items, activeTab, searchQuery]);

  const totalMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
  const usedPct = Math.min(100, (totalSizeBytes / (MAX_STORAGE_MB * 1024 * 1024)) * 100);

  const handleAdd = () => {
    if (items.length >= MAX_ITEMS) {
      setError(`Wallet is full (${MAX_ITEMS} items max).`);
      return;
    }
    const remainingMB = MAX_STORAGE_MB - parseFloat(totalMB);
    if (remainingMB <= 0) {
      setError(`Storage limit exceeded (${MAX_STORAGE_MB}MB max).`);
      return;
    }
    Alert.alert('Add to Wallet', 'Choose photo or document', [
      { text: 'Photo', onPress: pickImage },
      { text: 'Document', onPress: pickDocument },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const pickImage = async () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, async (response: any) => {
      if (response.didCancel || response.error) return;
      const asset = response.assets?.[0];
      if (!asset?.uri) return;
      const name = (asset.fileName || 'image').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_') || 'image';
      const type = asset.mimeType || 'image/jpeg';
      const sizeMB = (asset.fileSize || 0) / (1024 * 1024);
      if (sizeMB > MAX_FILE_SIZE_MB) {
        setError(`File too large (${MAX_FILE_SIZE_MB}MB max).`);
        return;
      }
      await uploadFile(asset.uri, name, type);
    });
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      const name = (file.name || 'document').replace(/[^a-zA-Z0-9._-]/g, '_');
      const type = file.mimeType || 'application/octet-stream';
      const sizeMB = (file.size || 0) / (1024 * 1024);
      if (sizeMB > MAX_FILE_SIZE_MB) {
        setError(`File too large (${MAX_FILE_SIZE_MB}MB max).`);
        return;
      }
      await uploadFile(file.uri, name, type);
    } catch (_) {
      setToastMsg?.('Could not pick document');
    }
  };

  const uploadFile = async (uri: string, name: string, type: string) => {
    const remainingMB = MAX_STORAGE_MB - parseFloat(totalMB);
    if (remainingMB <= 0) {
      setToastMsg?.('Storage limit reached.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const res = await uploadWalletFile({ uri, name, type }, name);
      if (res.success && res.data) {
        setItems((prev) => [res.data!, ...prev]);
        setTotalSizeBytes((prev) => prev + (res.data!.sizeBytes || 0));
        setToastMsg?.('Added to wallet');
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Upload failed';
      setToastMsg?.(msg);
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (item: WalletItem) => {
    setSelectedItem(null);
    setError(null);
    deleteWalletItem(item.id)
      .then(() => {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setTotalSizeBytes((prev) => Math.max(0, prev - item.sizeBytes));
        setToastMsg?.('Removed from wallet');
      })
      .catch((e: any) => {
        setToastMsg?.(e?.response?.data?.message || 'Delete failed');
      });
  };

  const handleRename = () => {
    if (!renameValue.trim() || !selectedItem) return;
    const newName = renameValue.trim();
    renameWalletItem(selectedItem.id, newName)
      .then((res) => {
        if (res.success && res.data) {
          setItems((prev) => prev.map((i) => (i.id === selectedItem.id ? { ...i, name: res.data!.name } : i)));
          setSelectedItem((prev) => (prev ? { ...prev, name: newName } : null));
          setIsRenaming(false);
          setToastMsg?.('Renamed');
        }
      })
      .catch((e: any) => setToastMsg?.(e?.response?.data?.message || 'Rename failed'));
  };

  const handleViewFullScreen = async () => {
    if (!selectedItem) return;
    try {
      const res = await getWalletItemDownloadUrl(selectedItem.id);
      if (res.success && res.data?.downloadUrl) {
        await Linking.openURL(res.data.downloadUrl);
      } else {
        const url = `https://your-api.com/wallet/item/${selectedItem.id}/download`;
        setToastMsg?.('Open in browser from share/download');
      }
    } catch (_) {
      setToastMsg?.('Could not open file');
    }
  };

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: isDark ? '#0A0A14' : '#F2F2F7' },
    container: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 16 : 20,
      paddingBottom: 8,
      backgroundColor: isDark ? '#0A0A14' : '#F2F2F7',
    },
    backBtn: { padding: 8, marginLeft: -8 },
    scroll: { flex: 1, paddingHorizontal: 20, paddingBottom: 100 },
    titleMy: { fontSize: 34, fontWeight: '700', color: isDark ? '#FFFFFF' : '#111827', marginTop: 8 },
    titleWallet: {
      fontSize: 34,
      fontWeight: '700',
      marginBottom: 12,
    },
    subtitle: { fontSize: 15, color: isDark ? '#8B8CAD' : '#6B7280', marginBottom: 24, maxWidth: '90%' },
    card: {
      borderRadius: 22,
      padding: 20,
      marginBottom: 24,
      backgroundColor: isDark ? '#141422' : '#FFFFFF',
      ...(isDark ? {} : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }),
    },
    cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#1F1F2E' : 'rgba(0,0,0,0.06)',
    },
    cardTitle: { fontSize: 16, fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
    cardSub: { fontSize: 13, color: isDark ? '#8B8CAD' : '#6B7280', marginTop: 2 },
    count: { fontSize: 20, fontWeight: '700', color: isDark ? '#FFFFFF' : '#111827' },
    countSub: { fontSize: 14, fontWeight: '400', color: '#9CA3AF' },
    progressLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressText: { fontSize: 11, fontWeight: '500', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' },
    progressBg: {
      height: 8,
      borderRadius: 4,
      backgroundColor: isDark ? '#1F1F2E' : 'rgba(0,0,0,0.06)',
      overflow: 'hidden',
    },
    progressBar: { height: '100%', borderRadius: 4, backgroundColor: accent },
    searchWrap: {
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      backgroundColor: isDark ? '#141422' : '#E3E3E8',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent',
      paddingHorizontal: 14,
    },
    searchIcon: { marginRight: 10 },
    searchInput: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 15,
      color: isDark ? '#FFFFFF' : '#111827',
      paddingRight: 40,
    },
    searchClear: { position: 'absolute', right: 12, padding: 4 },
    tabs: { flexDirection: 'row', gap: 8, marginBottom: 24 },
    tab: {
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 999,
    },
    tabInactive: { backgroundColor: isDark ? '#141422' : '#FFFFFF' },
    tabText: { fontSize: 15, fontWeight: '500' },
    tabTextActive: { color: '#FFFFFF' },
    tabTextInactive: { color: isDark ? '#8B8CAD' : '#6B7280' },
    listCard: {
      borderRadius: 18,
      overflow: 'hidden',
      backgroundColor: isDark ? '#141422' : '#FFFFFF',
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
    },
    itemRowLast: { borderBottomWidth: 0 },
    itemThumb: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: isDark ? '#1F1F2E' : 'rgba(0,0,0,0.06)',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    itemBody: { flex: 1, minWidth: 0 },
    itemName: { fontSize: 16, fontWeight: '500', color: isDark ? '#FFFFFF' : '#111827' },
    itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    itemMetaText: { fontSize: 12, color: isDark ? '#8B8CAD' : '#6B7280' },
    dot: { width: 2, height: 2, borderRadius: 1, backgroundColor: isDark ? '#6B7280' : '#9CA3AF' },
    emptyWrap: { paddingVertical: 48, alignItems: 'center', justifyContent: 'center' },
    emptyIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#1F1F2E' : 'rgba(0,0,0,0.04)',
      marginBottom: 12,
    },
    emptyText: { fontSize: 15, fontWeight: '500', color: isDark ? '#FFFFFF' : '#111827' },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 12,
      backgroundColor: 'rgba(239,68,68,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.2)',
      marginBottom: 16,
    },
    errorText: { fontSize: 13, color: '#EF4444' },
    fabWrap: {
      position: 'absolute',
      bottom: 32,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    shadowColor: accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  fabText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    padding: 32,
    backgroundColor: isDark ? '#141422' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
  },
  modalClose: { position: 'absolute', top: 16, right: 16, padding: 8, borderRadius: 20, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
  modalPreview: {
    width: 112,
    height: 112,
    borderRadius: 24,
    backgroundColor: isDark ? '#1F1F2E' : 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 },
  modalName: { fontSize: 20, fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827', maxWidth: 200 },
  modalRenameBtn: { padding: 6, borderRadius: 20, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
  modalRenameInput: {
    fontSize: 18,
    color: isDark ? '#FFFFFF' : '#111827',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
    minWidth: 160,
    textAlign: 'center',
  },
  modalMeta: { fontSize: 13, fontWeight: '500', color: isDark ? '#8B8CAD' : '#6B7280', textAlign: 'center', marginBottom: 32 },
  modalBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalBtnPrimary: { backgroundColor: isDark ? '#1F1F2E' : 'rgba(0,0,0,0.06)' },
  modalBtnDanger: { marginBottom: 0 },
  modalBtnTextPrimary: { fontSize: 15, fontWeight: '500', color: isDark ? '#FFFFFF' : '#111827' },
  modalBtnTextDanger: { fontSize: 15, fontWeight: '500', color: '#EF4444' },
  });

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[{ flex: 1 }, enterStyle]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color={accent} />
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.titleMy}>My</Text>
          <Text style={[styles.titleWallet, { color: accent }]}>Wallet</Text>
          <Text style={styles.subtitle}>
            Securely store, organize, and access your important documents and IDs.
          </Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardLeft}>
              <View style={styles.cardIcon}>
                <Shield size={20} color={accent} />
              </View>
              <View>
                <Text style={styles.cardTitle}>Secure Vault</Text>
                <Text style={styles.cardSub}>Encrypted Storage</Text>
              </View>
            </View>
            <Text style={styles.count}>
              {items.length}<Text style={styles.countSub}>/{MAX_ITEMS}</Text>
            </Text>
          </View>
          <View style={styles.progressLabel}>
            <Text style={styles.progressText}>Storage Used</Text>
            <Text style={styles.progressText}>{totalMB} MB / {MAX_STORAGE_MB} MB</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressBar, { width: `${usedPct}%` }]} />
          </View>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.searchWrap}>
          <Search size={17} color={isDark ? '#5E607E' : '#6B7280'} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search files..."
            placeholderTextColor={isDark ? '#5E607E' : '#9CA3AF'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <Pressable style={styles.searchClear} onPress={() => setSearchQuery('')}>
              <X size={16} color={isDark ? 'rgba(255,255,255,0.7)' : '#6B7280'} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.tabs}>
          {(['all', 'images', 'docs'] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[
                styles.tab,
                activeTab !== tab && styles.tabInactive,
                activeTab === tab && { backgroundColor: accent },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                {tab === 'all' ? 'All' : tab === 'images' ? 'Images' : 'Docs'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.listCard}>
          {loading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator size="large" color={accent} />
            </View>
          ) : filteredItems.length === 0 ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Search size={24} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyText}>No items found</Text>
            </View>
          ) : (
            filteredItems.map((item, index) => (
              <Pressable
                key={item.id}
                style={[styles.itemRow, index === filteredItems.length - 1 && styles.itemRowLast]}
                onPress={() => setSelectedItem(item)}
              >
                <View style={styles.itemThumb}>
                  {item.type === 'image' ? (
                    <FileText size={20} color={isDark ? '#8B8CAD' : '#6B7280'} />
                  ) : (
                    <FileText size={20} color={isDark ? '#8B8CAD' : '#6B7280'} />
                  )}
                </View>
                <View style={styles.itemBody}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemMetaText}>
                      {item.createdAt ? moment(item.createdAt).format('MMM D') : '—'}
                    </Text>
                    <View style={styles.dot} />
                    <Text style={styles.itemMetaText}>{item.size}</Text>
                  </View>
                </View>
                <ChevronRight size={18} color={isDark ? '#6B7280' : '#D1D5DB'} />
              </Pressable>
            ))
          )}
        </View>
        </ScrollView>

        <View style={styles.fabWrap}>
          <Pressable
            onPress={handleAdd}
            disabled={uploading || items.length >= MAX_ITEMS}
            style={[styles.fab, { backgroundColor: accent }]}
          >
            {uploading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.fabText}>Add New Item</Text>
              </>
            )}
          </Pressable>
        </View>
      </Animated.View>

      <Modal
        visible={!!selectedItem}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedItem(null)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <Pressable style={styles.modalClose} onPress={() => setSelectedItem(null)}>
              <X size={20} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
            </Pressable>

            {selectedItem ? (
              <>
                <View style={styles.modalPreview}>
                  <FileText size={48} color={accent} />
                </View>

                <View style={styles.modalNameRow}>
                  {isRenaming ? (
                    <>
                      <TextInput
                        style={styles.modalRenameInput}
                        value={renameValue}
                        onChangeText={setRenameValue}
                        onSubmitEditing={handleRename}
                        onBlur={handleRename}
                        placeholder="Name"
                        placeholderTextColor={isDark ? '#5E607E' : '#9CA3AF'}
                        autoFocus
                        selectTextOnFocus
                      />
                      <Pressable onPress={handleRename} style={styles.modalRenameBtn}>
                        <Check size={16} color="#10B981" />
                      </Pressable>
                    </>
                  ) : (
                    <>
                      <Text style={styles.modalName} numberOfLines={1}>{selectedItem.name}</Text>
                      <Pressable style={styles.modalRenameBtn} onPress={() => setIsRenaming(true)}>
                        <Pencil size={14} color={isDark ? '#8B8CAD' : '#6B7280'} />
                      </Pressable>
                    </>
                  )}
                </View>
                <Text style={styles.modalMeta}>
                  {selectedItem.type.toUpperCase()} • {selectedItem.size}
                </Text>

                <Pressable style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={handleViewFullScreen}>
                  <Text style={styles.modalBtnTextPrimary}>View Full Screen</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, styles.modalBtnDanger]}
                  onPress={() => {
                    Alert.alert('Delete', `Remove "${selectedItem.name}" from wallet?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => handleDelete(selectedItem) },
                    ]);
                  }}
                >
                  <Text style={styles.modalBtnTextDanger}>Delete Item</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default WalletScreen;
