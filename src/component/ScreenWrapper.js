// src/component/ScreenWrapper.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StatusBar, 
  StyleSheet, 
  Platform, 
  Keyboard, 
  Animated,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWrapper = ({
  children,
  style,
  contentContainerStyle,
  backgroundColor = '#fff',
  statusBarColor = 'transparent',
  barStyle = 'dark-content',
  translucent = true,
  scroll = false,
  avoidKeyboard = false,
  keyboardVerticalOffset = 0,
  safeAreaTop = true,
  safeAreaBottom = true,
  safeAreaLeft = true,
  safeAreaRight = true,
}) => {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  
  // Track if the system (Android adjustResize) is already moving the layout
  const [isSystemResizing, setIsSystemResizing] = useState(false);
  const initialHeight = useRef(0);

  useEffect(() => {
    if (!avoidKeyboard) {
      keyboardHeight.setValue(0);
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      // If system is already resizing (detected via onLayout), we stay at 0
      if (isSystemResizing) {
        keyboardHeight.setValue(0);
        return;
      }

      const extraOffset = 20; 
      Animated.timing(keyboardHeight, {
        duration: e.duration || 250,
        toValue: e.endCoordinates.height + extraOffset,
        useNativeDriver: false,
      }).start();
    });

    const hideSubscription = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardHeight, {
        duration: e.duration || 250,
        toValue: 0,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [avoidKeyboard, isSystemResizing]);

  // ✅ The "Magic" fix for old phones: Detect if the layout physically shrunk
  const handleLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    
    if (initialHeight.current === 0) {
      initialHeight.current = height;
      return;
    }

    // If the view height dropped significantly while keyboard is active, 
    // it means the Android System is handling the resize itself.
    if (Platform.OS === 'android' && height < initialHeight.current - 100) {
      setIsSystemResizing(true);
    } else if (height >= initialHeight.current) {
      setIsSystemResizing(false);
    }
  };

  const ContainerComponent = scroll ? ScrollView : View;
  const scrollProps = scroll ? {
    showsVerticalScrollIndicator: false,
    contentContainerStyle: [styles.scrollContent, contentContainerStyle],
    keyboardShouldPersistTaps: 'handled'
  } : {};

  return (
    <View 
      style={[styles.outerWrapper, { backgroundColor }]} 
      onLayout={handleLayout} // ✅ Listens for system resizes
    >
      <StatusBar
        backgroundColor={statusBarColor}
        barStyle={barStyle}
        translucent={translucent}
      />
      <Animated.View 
        style={[
          styles.outerWrapper, 
          { 
            // Apply margin only if the system didn't already move the view
            marginBottom: avoidKeyboard ? keyboardHeight : 0, 
            paddingTop: safeAreaTop ? insets.top : 0,
            paddingLeft: safeAreaLeft ? insets.left : 0,
            paddingRight: safeAreaRight ? insets.right : 0,
            // Handle bottom inset: Remove it when keyboard is up to prevent double gap
            paddingBottom: (safeAreaBottom && !isSystemResizing) ? 
              keyboardHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [insets.bottom, 0],
                extrapolate: 'clamp'
              }) : 0 
          }
        ]}
      >
        <ContainerComponent style={[styles.container, style]} {...scrollProps}>
          {children}
        </ContainerComponent>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});

export default ScreenWrapper;