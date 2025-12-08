// src/screens/TabsScreen/HelpSupportScreen.js (ASTROLOGER APP)
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  StatusBar 
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export default function HelpSupportScreen({ navigation }) {
  const { state } = useAuth();
  const webViewRef = useRef(null);
  const CHAT_URL = "https://splendid-marshmallow-9ffa1d.netlify.app/";
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Fixed: useEffect always runs, but only sends data when conditions are met
  useEffect(() => {
    if (!isLoading && webViewRef.current && state.astrologer) {
      const timer = setTimeout(() => {
        sendAstrologerData();
      }, 1500); // Wait 1.5 seconds for Zoho to fully load

      return () => clearTimeout(timer); // Cleanup
    }
  }, [isLoading, state.astrologer]); // Only depend on these

  const sendAstrologerData = () => {
    const astrologer = state.astrologer;
    
    if (!astrologer) {
      console.warn('⚠️ No astrologer data available');
      return;
    }

    console.log('📤 Sending astrologer data to Zoho:', {
      name: astrologer.name,
      email: astrologer.email,
      phone: astrologer.phoneNumber,
    });

    const data = {
      type: 'SET_ASTROLOGER_INFO',
      astrologer: {
        _id: astrologer._id || '',
        name: astrologer.name || 'Unknown Astrologer',
        email: astrologer.email || '',
        phoneNumber: astrologer.phoneNumber || '',
        experienceYears: astrologer.experienceYears || 0,
        specializations: astrologer.specializations || [],
        languages: astrologer.languages || [],
        accountStatus: astrologer.accountStatus || 'active',
        profileCompletion: astrologer.profileCompletion || {},
        isChatEnabled: astrologer.isChatEnabled || false,
        isCallEnabled: astrologer.isCallEnabled || false,
        isLiveStreamEnabled: astrologer.isLiveStreamEnabled || false,
        availability: astrologer.availability || {},
        pricing: astrologer.pricing || {},
        ratings: astrologer.ratings || {},
        stats: astrologer.stats || {},
      }
    };

    // Inject data into WebView
    const script = `
      (function() {
        try {
          window.postMessage(${JSON.stringify(JSON.stringify(data))}, '*');
          console.log('✅ Data posted to Zoho');
        } catch (error) {
          console.error('❌ Error posting data:', error);
        }
      })();
      true;
    `;

    webViewRef.current?.injectJavaScript(script);
    console.log('✅ Astrologer data injected:', astrologer.name);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: CHAT_URL }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
          cacheEnabled={true}
          cacheMode="LOAD_CACHE_ELSE_NETWORK"
          startInLoadingState={true}
          onLoadStart={() => {
            console.log('🔄 WebView loading...');
            setIsLoading(true);
          }}
          onLoadEnd={() => {
            console.log('✅ WebView loaded');
            setIsLoading(false);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('❌ WebView error:', nativeEvent);
            setIsLoading(false);
          }}
          setSupportMultipleWindows={false}
          onShouldStartLoadWithRequest={(request) => {
            // Allow only Zoho and Netlify URLs
            const allowedDomains = ['zoho.in', 'zoho.com', 'netlify.app', 'salesiq'];
            return allowedDomains.some(domain => request.url.includes(domain));
          }}
        />

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#5636B8" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
