import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#372643' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#666', 
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  header: {
    backgroundColor: '#372643',
    padding: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  earnedBox: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'flex-end',
  },
  earnedLabel: {
    fontSize: 10,
    color: '#EDE7F6',
  },
  earnedValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    padding: 4,
    marginTop: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFF',
  },
  tabText: { 
    color: '#E0E0E0', 
    fontWeight: '600', 
    fontSize: 13,
  },
  tabTextActive: { 
    color: '#5A2CCF', 
    fontWeight: '700' 
  },
  listContent: { padding: 16 },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrapper: {
    marginRight: 12,
  },
  userBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#555',
  },
  typeIconContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: { flex: 1 },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTitle: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    color: '#333', 
    flex: 1 
  },
  itemDate: {
    fontSize: 11,
    color: '#888',
    marginLeft: 8,
  },
  itemMeta: {
    fontSize: 12,
    color: '#555',
  },
  itemSubMeta: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
  },
  badgeActive: { backgroundColor: '#E8F5E9' },
  badgeCompleted: { backgroundColor: '#F5F5F5' },
  statusText: { fontSize: 10, fontWeight: '700' },
  textActive: { color: '#2E7D32' },
  textCompleted: { color: '#757575' },
  viewText: {
    fontSize: 11,
    color: '#5A2CCF',
    fontWeight: '600',
  },
  itemCardDisabled: {
    opacity: 0.7,
    backgroundColor: '#FAFAFA',
  },
  bubbleDisabled: {
    backgroundColor: '#E0E0E0',
  },
  textDisabled: {
    color: '#777',
  },
  noDetailsText: {
    fontSize: 11,
    color: '#999', // Grey text indicates it's not clickable/error
    fontWeight: '500',
    fontStyle: 'italic'
  },
});