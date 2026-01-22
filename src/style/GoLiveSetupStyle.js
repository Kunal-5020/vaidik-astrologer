import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F6FA' },
  container: { padding: 16 },
  section: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#111' },
  label: { fontSize: 13, color: '#666', marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, color: '#111' },
  disabledInput: { color: '#999', backgroundColor: '#F3F4F6' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  
  toggleRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginVertical: 8 
  },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  toggleSub: { fontSize: 11, color: '#999', marginTop: 2 },

  goLiveBtn: { backgroundColor: '#EF4444', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  goLiveText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});