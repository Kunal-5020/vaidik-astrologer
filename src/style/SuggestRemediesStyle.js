import { StyleSheet, Platform } from 'react-native';

export const COLORS = {
  PRIMARY: '#372643',
  ACCENT: '#FFC107',
  BG: '#F5F5F7',
  CARD: '#FFFFFF',
  TEXT_PRIMARY: '#1A1A1A',
  TEXT_SECONDARY: '#6B7280',
  BORDER: '#E5E7EB',
  SUCCESS: '#10B981',
  DANGER: '#EF4444',
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
  },

  categoriesSection: {
    backgroundColor: COLORS.CARD,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesList: {
    paddingHorizontal: 12,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: COLORS.CARD,
    marginHorizontal: 4,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  categoryChipActive: {
    borderColor: COLORS.ACCENT,
    borderWidth: 2,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    zIndex: 1,
  },
  categoryTextActive: {
    color: COLORS.PRIMARY,
    fontWeight: '700',
  },

  productsList: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 100,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  productCard: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  productCardSelected: {
    borderColor: COLORS.ACCENT,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.ACCENT,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.BG,
  },
  productInfo: { padding: 12 },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 6,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 6,
  },

  selectionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.CARD,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 8 },
    }),
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionBadge: {
    backgroundColor: COLORS.PRIMARY,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selectionCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  selectionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  clearText: {
    fontSize: 14,
    color: COLORS.DANGER,
    fontWeight: '600',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.CARD,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    maxHeight: '60%', 
    paddingHorizontal: 20,
  },
  modalScrollContent: {
  paddingBottom: 20,  // ✅ Add padding to content
},
  detailCard: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailCardNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    marginRight: 12,
    width: 24,
  },
  detailImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: COLORS.BG,
    marginRight: 12,
  },
  detailHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  detailProductName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 20,
  },
  detailPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    marginTop: 4,
  },

  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  requiredStar: {
    color: COLORS.DANGER,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    minHeight: 90,
    textAlignVertical: 'top',
    backgroundColor: COLORS.BG,
  },
  charCount: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
    textAlign: 'right',
  },

  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  submitBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.TEXT_SECONDARY,
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});