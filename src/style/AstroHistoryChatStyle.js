import { StyleSheet, Dimensions, Platform } from 'react-native';
const { width } = Dimensions.get('window');

export const COLORS = {
  PRIMARY: '#372643',          // Deep purple/plum
  SECONDARY: '#4A3456',        // Lighter purple
  ACCENT: '#FFC107',           // Yellow
  BG: '#F0F4F8',              // Light background
  BG_CHAT: '#E8EFF5',         // Chat background
  BUBBLE_ASTRO: '#E0D4F0',    // Light purple for astrologer
  BUBBLE_USER: '#FFFFFF',      // White for user
  TEXT_DARK: '#1F2937',
  TEXT_LIGHT: '#6B7280',
  BORDER: '#D1D5DB',
  SUCCESS: '#10B981',
  DANGER: '#FF453A',
  WARNING: '#F59E0B',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '500',
  },

  // Access Blocked Screen
  blockedContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  blockedIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  blockedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.TEXT_DARK,
    marginBottom: 12,
  },
  blockedText: {
    fontSize: 16,
    color: COLORS.TEXT_DARK,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  blockedSubtext: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    textAlign: 'center',
    marginBottom: 32,
  },
  goBackBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  goBackBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.PRIMARY,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  remedyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WARNING,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 5,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.WARNING,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  remedyBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },

  // Chat Area
  chatBackground: {
    flex: 1,
    backgroundColor: COLORS.BG_CHAT,
  },
  flatListContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    paddingBottom: 40,
  },

  // Date Separator
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  datePill: {
    backgroundColor: 'rgba(55, 38, 67, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 38, 67, 0.2)',
  },
  dateText: {
    fontSize: 11,
    color: COLORS.PRIMARY,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Messages
  msgRow: {
    marginVertical: 3,
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
  },
  msgRowLeft: {
    justifyContent: 'flex-start',
  },
  msgRowRight: {
    justifyContent: 'flex-end',
  },

  bubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    position: 'relative',
    minWidth: 80,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  bubbleLeft: {
    backgroundColor: COLORS.BUBBLE_USER,
    borderTopLeftRadius: 4,
    marginLeft: 4,
  },
  bubbleRight: {
    backgroundColor: COLORS.BUBBLE_ASTRO,
    borderTopRightRadius: 4,
    marginRight: 4,
  },

  // Audio Wrapper for better visibility
  audioWrapper: {
    marginBottom: 6,
    paddingVertical: 4,
  },

  msgText: {
    fontSize: 15,
    color: COLORS.TEXT_DARK,
    lineHeight: 22,
  },

  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
    gap: 4,
  },
  timeText: {
    fontSize: 10,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '500',
  },

  // Star Badge
  starIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 2,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  // Media
  imageContainer: {
    marginBottom: 6,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  mediaImg: {
    width: 220,
    height: 220,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },

  videoContainer: {
    marginBottom: 6,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  videoThumbnail: {
    width: 220,
    height: 220,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  videoPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(55, 38, 67, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.ACCENT,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  videoDurationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  videoDurationText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // Kundli Card
  kundliCard: {
    backgroundColor: 'rgba(55, 38, 67, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(55, 38, 67, 0.2)',
  },
  kundliTitle: {
    color: COLORS.PRIMARY,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  kundliText: {
    color: COLORS.TEXT_DARK,
    fontSize: 13,
    lineHeight: 20,
  },

  // Tails
  leftTail: {
    position: 'absolute',
    top: 0,
    left: -6,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: COLORS.BUBBLE_USER,
    borderLeftWidth: 8,
    borderLeftColor: 'transparent',
  },
  rightTail: {
    position: 'absolute',
    top: 0,
    right: -6,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: COLORS.BUBBLE_ASTRO,
    borderRightWidth: 8,
    borderRightColor: 'transparent',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '500',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '500',
  },
});