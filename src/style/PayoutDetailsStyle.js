import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666',
  },

  content: {
    padding: 16,
    paddingBottom: 24,
  },

  amountCard: {
    backgroundColor: '#372643',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  amountLabel: {
    color: '#E0E0E0',
    fontSize: 13,
    marginBottom: 6,
  },
  amountValue: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  labelText: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },

  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    padding: 12,
    borderRadius: 10,
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bankName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 3,
  },
  bankDetail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingBottom: 16,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconActive: {
    backgroundColor: '#372643',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 3,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineTitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 3,
  },
  timelineTitleActive: {
    color: '#111827',
    fontWeight: '600',
  },
  timelineDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  rejectionCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  rejectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 3,
  },
  rejectionText: {
    fontSize: 12,
    color: '#DC2626',
    lineHeight: 17,
  },

  notesCard: {
    flexDirection: 'row',
    backgroundColor: '#E8EAF6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#372643',
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#372643',
    marginBottom: 3,
  },
  notesText: {
    fontSize: 12,
    color: '#4A5568',
    lineHeight: 17,
  },
});