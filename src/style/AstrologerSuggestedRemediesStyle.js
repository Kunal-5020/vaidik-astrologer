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
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
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
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#FFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: { 
    fontSize: 13, 
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  
  listContent: { 
    padding: 16,
    paddingBottom: 32,
  },
  
  loader: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },

  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
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
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.BG,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ACCENT,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  typeText: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: COLORS.PRIMARY,
  },
  
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusSuggested: { backgroundColor: COLORS.WARNING },
  statusPurchased: { backgroundColor: COLORS.SUCCESS },
  statusText: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#FFF',
  },

  cardBody: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  
  imageContainer: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.BG,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.BG,
  },
  
  contentCol: { 
  flex: 1,
  justifyContent: 'flex-start',  // ✅ Added
},
  
  title: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    lineHeight: 22,
  },
  
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: COLORS.PRIMARY,
    marginLeft: 2,
  },
  
  reasonSection: {
    marginBottom: 12,
  },
  instructionsSection: {
    marginTop: 8,
  },
  
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  label: { 
    fontSize: 12, 
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: { 
    fontSize: 14, 
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 20,
  },

  cardFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.BG,
  },
  
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: { 
    fontSize: 11, 
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },

  emptyContainer: { 
    alignItems: 'center', 
    paddingVertical: 100,
    paddingHorizontal: 24,
  },
  emptyText: { 
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 6,
    textAlign: 'center',
  },
});