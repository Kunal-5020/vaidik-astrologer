import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window')

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F6FA',
  },
  scrollArea: { 
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: Math.min(width * 0.04, 16),
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  card: {
    backgroundColor: '#fff',
    marginHorizontal: Math.min(width * 0.04, 16),
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  
  rowLeft: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  
  iconCircle: {
    backgroundColor: '#F3F4F6',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  
  rowTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#111827',
  },
  
  rowSubtitle: { 
    fontSize: 11, 
    color: '#6B7280',
    marginTop: 2,
  },
  
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 64,
  },
  
  actionsContainer: {
    marginVertical: 8,
    marginHorizontal: Math.min(width * 0.04, 16),
    gap: 10,
  },
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    gap: 8,
  },
  
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
  },
  
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
});