import  { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // Header
  headerSection: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#372643',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    fontWeight: '500',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  durationText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#372643',
    letterSpacing: 0.3,
  },

  // Grid
  gridContainer: {
    gap: 16,
    marginBottom: 32,
  },
  analyticsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#F5F3F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#372643',
  },
  cardUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
  },

  // Actions
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#FFD700',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#372643',
    letterSpacing: 0.5,
  },

  // Loading & Error
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666666',
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#372643',
    marginTop: 16,
    marginBottom: 6,
  },
  errorMessage: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#372643',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
