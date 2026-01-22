// src/component/ScreenWrapper.js
import React from 'react';
import { 
  View, 
  StatusBar, 
  StyleSheet, 
  Platform, 
  KeyboardAvoidingView, 
  ScrollView 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWrapper = ({
  children,
  style,
  contentContainerStyle,
  backgroundColor = '#fff', // Main background color
  statusBarColor = 'transparent', // Default to transparent for immersive feel
  barStyle = 'dark-content', // 'dark-content' or 'light-content'
  translucent = true, // Default to true for modern look
  scroll = false, // Toggle scroll view
  avoidKeyboard = false, // Toggle keyboard avoidance
  keyboardVerticalOffset = 0,
  // Edge protection props
  safeAreaTop = true,
  safeAreaBottom = true,
  safeAreaLeft = true,
  safeAreaRight = true,
}) => {
  const insets = useSafeAreaInsets();

  // Unified padding calculation
  const containerStyle = {
    flex: 1,
    backgroundColor,
    paddingTop: safeAreaTop ? insets.top : 0,
    paddingBottom: safeAreaBottom ? insets.bottom : 0,
    paddingLeft: safeAreaLeft ? insets.left : 0,
    paddingRight: safeAreaRight ? insets.right : 0,
  };

  // Wrapper Selection: View vs ScrollView
  const ContainerComponent = scroll ? ScrollView : View;
  
  // Props specific to ScrollView
  const scrollProps = scroll ? {
    showsVerticalScrollIndicator: false,
    contentContainerStyle: [styles.scrollContent, contentContainerStyle],
    keyboardShouldPersistTaps: 'handled'
  } : {};

  // Core Content Render
  const Content = (
    <ContainerComponent 
      style={[styles.container, style]} 
      {...scrollProps}
    >
      <StatusBar
        backgroundColor={statusBarColor}
        barStyle={barStyle}
        translucent={translucent}
      />
      {children}
    </ContainerComponent>
  );

  // Return with or without KeyboardAvoidingView
  if (avoidKeyboard) {
    return (
      <View style={[styles.outerWrapper, { backgroundColor }]}>
        <KeyboardAvoidingView
          style={[styles.outerWrapper, { 
            // Apply safe area padding to the outer wrapper to prevent keyboard jumping over headers
            paddingTop: safeAreaTop ? insets.top : 0,
            paddingBottom: safeAreaBottom ? insets.bottom : 0 
          }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          {/* Reset padding for inner content since we applied it to the wrapper 
             This prevents double padding when using KeyboardAvoidingView
          */}
          <View style={{ flex: 1, paddingBottom: 0, paddingTop: 0 }}>
             {/* If using KeyboardAvoidingView, we often want the ScrollView to take available space
               Re-rendering content logic slightly for this case
             */}
              <ContainerComponent 
                style={[styles.container, style]} 
                {...scrollProps}
              >
                <StatusBar
                  backgroundColor={statusBarColor}
                  barStyle={barStyle}
                  translucent={translucent}
                />
                {children}
              </ContainerComponent>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // Standard Render
  return (
    <View style={[styles.outerWrapper, containerStyle]}>
       {Content}
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default ScreenWrapper;