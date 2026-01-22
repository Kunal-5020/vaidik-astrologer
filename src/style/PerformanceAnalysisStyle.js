import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({ 

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  section: {
    marginTop: 16,
    paddingHorizontal: Math.min(width * 0.04, 16),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#372643',
    marginBottom: 10,
  },

  perfCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  perfIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  perfContent: {
    flex: 1,
  },
  perfTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 3,
    fontWeight: '500',
  },
  perfValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  perfSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  metricRow: {
    marginBottom: 14,
  },
  metricLabel: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '500',
  },
  metricRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarContainer: {
    flex: 1,
    height: 7,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    minWidth: 35,
  },
  metricPercentage: {
    fontSize: 12,
    color: '#6B7280',
    minWidth: 42,
    textAlign: 'right',
  },

  insightCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightItem: {
    flex: 1,
    alignItems: 'center',
  },
  insightValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 10,
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 55,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },

  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  financialTotal: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    marginTop: 6,
    paddingTop: 12,
  },
  financialLabel: {
    fontSize: 13,
    color: '#374151',
  },
  penaltyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  financialValue: {
    fontSize: 15,
    fontWeight: '600',
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8EAF6',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: '#4A5568',
    lineHeight: 16,
  },

  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 13,
    color: '#374151',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  summaryBold: {
    fontWeight: '700',
    color: '#111827',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 12,
  },
});