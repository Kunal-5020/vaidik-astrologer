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
  statusBarColor = '#fff',
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

      {/* ✅ UNIFIED FIX: 
         We switched Manifest to 'adjustPan'.
         Now we MUST use 'behavior="padding"' (or height) on Android too.
         This forces the layout to shrink on ALL devices, ignoring OS fragmentation.
      */}
        <ContainerComponent 
          style={[styles.container, style]} 
          {...scrollProps}
        >
          {children}
        </ContainerComponent>
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