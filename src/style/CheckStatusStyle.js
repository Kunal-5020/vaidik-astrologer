import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#372643', // Brand Purple
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  
  // Search Card
  searchCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchButton: {
    backgroundColor: '#372643',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Results Area
  resultContainer: {
    gap: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Details Card
  detailsCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  rowValue: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 12,
  },

  // Waitlist Card
  waitlistCard: {
    backgroundColor: '#FFFBEB', // Light Yellow
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  waitlistHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B45309',
    textAlign: 'center',
    marginBottom: 15,
  },
  waitlistRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waitlistItem: {
    flex: 1,
    alignItems: 'center',
  },
  waitlistLabel: {
    fontSize: 12,
    color: '#B45309',
    marginBottom: 4,
  },
  waitlistValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#B45309',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#FCD34D',
    height: '100%',
  },

  // Timeline
  timelineWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 15,
  },

  // Action Cards (Approved/Rejected)
  actionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981', // Default Green
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 8,
  },
  actionDesc: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  primaryActionBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  primaryActionText: {
    color: '#FFF',
    fontWeight: '700',
  },
  reapplyText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
});