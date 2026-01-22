// src/screens/MediaViewer.js
import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ScreenWrapper from '../../component/ScreenWrapper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Video from 'react-native-video';
import { styles, COLORS } from '../../style/MediaViewerStyle';


const MediaViewer = ({ route }) => {
  const navigation = useNavigation();
  const { mediaUrl, mediaType = 'image' } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);

  if (!mediaUrl) {
    Alert.alert('Error', 'No media URL provided');
    navigation.goBack();
    return null;
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const togglePlayPause = () => {
    setPaused(!paused);
  };

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <ScreenWrapper 
  backgroundColor="#000000" 
  barStyle="light-content" 
  translucent={true}
  safeAreaTop={false} 
  safeAreaBottom={false}
>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
      </ScreenWrapper>

      {/* Media Content */}
      {mediaType === 'video' ? (
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setShowControls(!showControls)}
          style={styles.videoContainer}
        >
          <Video
            source={{ uri: mediaUrl }}
            style={styles.video}
            resizeMode="contain"
            paused={paused}
            onLoad={() => setLoading(false)}
            onError={(error) => {
              console.error('Video error:', error);
              Alert.alert('Error', 'Failed to load video');
            }}
            controls={false}
            repeat
          />

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.ACCENT} />
            </View>
          )}

          {showControls && !loading && (
            <TouchableOpacity 
              style={styles.playButton} 
              onPress={togglePlayPause}
            >
              <View style={styles.playCircle}>
                <Ionicons 
                  name={paused ? 'play' : 'pause'} 
                  size={32} 
                  color="#FFF" 
                />
              </View>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ) : (
        <ImageViewer
          imageUrls={[{ url: mediaUrl }]}
          enableSwipeDown
          onSwipeDown={handleBack}
          backgroundColor={COLORS.BG}
          renderIndicator={() => null}
          loadingRender={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.ACCENT} />
            </View>
          )}
          enableImageZoom
          saveToLocalByLongPress={false}
          onClick={() => setShowControls(!showControls)}
        />
      )}
    </View>
  );
};

export default MediaViewer;
