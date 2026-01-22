import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#372643',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  header: {
    backgroundColor: '#372643',
    paddingHorizontal: Math.min(screenWidth * 0.04, 16),
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownContainer: {
    position: 'relative',
    width: '100%',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 42,
    justifyContent: 'space-between',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownList: {
    position: 'absolute',
    top: 48,
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 999,
    elevation: 6,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#374151',
  },
  dropdownItemSelected: {
    color: '#372643',
    fontWeight: '700',
  },

  scrollContent: { 
    alignItems: 'center', 
    paddingBottom: 24,
  },

  topCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: screenWidth * 0.9,
    marginTop: 14,
    marginBottom: 6,
    gap: 10,
  },
  topCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  topCardTitle: {
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    fontSize: 11,
  },
  topCardValue: {
    fontWeight: '700',
    fontSize: 18,
    color: '#111827',
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    width: screenWidth * 0.9,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#372643',
    marginBottom: 12,
  },

  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  serviceTitle: {
    fontWeight: '700',
    fontSize: 13,
  },
  serviceValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  serviceSubtitle: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 4,
  },
  progressBarBG: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    width: '100%',
    marginVertical: 8,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
});