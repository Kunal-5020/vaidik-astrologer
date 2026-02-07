import React from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWrapper = ({
  children,
  style,
  contentContainerStyle,
  backgroundColor = '#fff',
  statusBarColor = 'transparent',
  barStyle = 'dark-content',
  translucent = true,
  scroll = false,
  avoidKeyboard = false, // Set to true for Chat screens
  keyboardVerticalOffset = 0,
  safeAreaTop = true,
  safeAreaBottom = true,
  safeAreaLeft = true,
  safeAreaRight = true,
}) => {
  const insets = useSafeAreaInsets();

  // Define edges for SafeAreaView based on props
  const edges = [
    safeAreaTop && 'top',
    safeAreaBottom && 'bottom',
    safeAreaLeft && 'left',
    safeAreaRight && 'right',
  ].filter(Boolean);

  const ContainerComponent = scroll ? ScrollView : View;
  
  const scrollProps = scroll ? {
    showsVerticalScrollIndicator: false,
    contentContainerStyle: [styles.scrollContent, contentContainerStyle],
    keyboardShouldPersistTaps: 'handled',
  } : {};

  return (
    <SafeAreaView 
      edges={edges}
      style={[styles.outerWrapper, { backgroundColor }]}
    >
      <StatusBar
        backgroundColor={statusBarColor}
        barStyle={barStyle}
        translucent={translucent}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
        // ✅ CRITICAL FIX: 
        // iOS needs 'padding' to push content up.
        // Android needs 'undefined' (OFF) because 'adjustResize' in Manifest does it natively.
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={avoidKeyboard}
        keyboardVerticalOffset={Platform.OS === 'ios' ? keyboardVerticalOffset : 0}
      >
        <ContainerComponent 
          style={[styles.container, style]} 
          {...scrollProps}
        >
          {children}
        </ContainerComponent>
      </KeyboardAvoidingView>
    </SafeAreaView>
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