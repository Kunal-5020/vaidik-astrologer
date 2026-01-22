import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F6FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#372643',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700',
  },
  unreadCount: { 
    color: '#FFD700', 
    fontSize: 11, 
    marginTop: 2,
    fontWeight: '600',
  },
  
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EAF6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 8,
    gap: 6,
  },
  markAllText: { 
    fontSize: 13, 
    color: '#372643', 
    fontWeight: '600',
  },
  
  listContent: {
    paddingVertical: 8,
  },
  
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#E8EAF6',
    borderLeftWidth: 3,
    borderLeftColor: '#372643',
  },
  
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  content: { 
    flex: 1,
    paddingRight: 8,
  },
  titleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    marginBottom: 4,
  },
  title: { 
    flex: 1, 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#111827',
  },
  unreadDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#372643',
  },
  message: { 
    fontSize: 12, 
    color: '#6B7280', 
    marginBottom: 6, 
    lineHeight: 17,
  },
  time: { 
    fontSize: 11, 
    color: '#9CA3AF',
  },
  
  deleteBtn: { 
    padding: 6,
    marginLeft: 4,
  },
  
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#374151', 
    marginTop: 16, 
    marginBottom: 6,
  },
  emptySubtitle: { 
    fontSize: 13, 
    color: '#6B7280', 
    textAlign: 'center',
  },
  
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
