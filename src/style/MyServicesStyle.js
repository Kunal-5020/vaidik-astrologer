import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
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

  // Warning Card
  warningCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  warningContent: {
    flex: 1,
    marginLeft: 10,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 3,
  },
  warningText: {
    fontSize: 12,
    color: '#78350F',
    marginBottom: 10,
    lineHeight: 17,
  },
  setupButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Section
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#372643',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#372643',
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 2,
  },

  // Pricing Card
  pricingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  priceDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#372643',
  },
  priceUnit: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },

  // Input
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#372643',
  },
  cancelButtonText: {
    color: '#372643',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#372643',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Service Card
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  serviceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    marginLeft: 12,
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  serviceRate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  // Info Card
  infoCard: {
    backgroundColor: '#E8EAF6',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
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
});