import { StyleSheet } from 'react-native';

const PRIMARY = '#372643';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PRIMARY }, // ✅ replaced #121212
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: PRIMARY, // ✅ replaced #1E1E1E
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)', // ✅ replaced #333
  },

  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' }, // keep readable on PRIMARY
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },   // ✅ replaced #AAA
  bigRating: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  bigRatingText: { fontSize: 32, fontWeight: 'bold', color: '#FFD700' },

  list: { padding: 16 },

  card: {
    backgroundColor: PRIMARY, // ✅ replaced #1E1E1E
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', // ✅ replaced #333
  },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)', // ✅ replaced #333
  },

  userName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  date: { fontSize: 12, color: 'rgba(255,255,255,0.65)' }, // ✅ replaced #888

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  ratingText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },

  reviewText: { color: 'rgba(255,255,255,0.90)', fontSize: 14, lineHeight: 20, marginBottom: 10 }, // ✅ replaced #DDD
  noText: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontStyle: 'italic', marginBottom: 10 }, // ✅ replaced #666

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)', // ✅ replaced #333
    paddingTop: 8,
  },

  serviceType: { color: 'rgba(255,255,255,0.65)', fontSize: 12 }, // ✅ replaced #888
  emptyText: { color: 'rgba(255,255,255,0.70)', marginTop: 10 },  // ✅ replaced #888
});