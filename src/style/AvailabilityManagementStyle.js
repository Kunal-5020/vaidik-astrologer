import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: Math.min(width * 0.04, 16),
    paddingBottom: 24,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },

  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#372643',
    marginLeft: 8,
  },

  scheduleContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 6,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastDayRow: {
    borderBottomWidth: 0,
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width < 360 ? '35%' : '40%',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  disabledText: {
    color: '#9CA3AF',
  },

  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeButton: {
    backgroundColor: '#E8EAF6',
    paddingVertical: 6,
    paddingHorizontal: width < 360 ? 8 : 10,
    borderRadius: 6,
  },
  timeText: {
    color: '#372643',
    fontSize: 12,
    fontWeight: '600',
  },
  dash: {
    marginHorizontal: 6,
    color: '#9CA3AF',
    fontSize: 14,
  },
  closedText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontStyle: 'italic',
  },

  infoCard: {
    backgroundColor: '#E8EAF6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#372643',
    marginBottom: 3,
  },
  infoText: {
    fontSize: 12,
    color: '#4A5568',
    lineHeight: 17,
  },

  timezoneContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  timezoneText: {
    color: '#6B7280',
    fontSize: 11,
  },

  saveButton: {
    backgroundColor: '#372643',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#372643',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
