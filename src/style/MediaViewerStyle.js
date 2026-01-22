import { StyleSheet, Dimensions } from 'react-native';

export const COLORS = {
  PRIMARY: '#1E3A8A',
  SECONDARY: '#1E40AF',
  ACCENT: '#FFC107',
  BG: '#000000',
};

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backButton: {
    padding: 16,
    alignSelf: 'flex-start',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: width,
    height: height,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  playButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(30, 58, 138, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 193, 7, 0.8)',
  },
});