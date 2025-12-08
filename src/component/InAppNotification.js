// src/components/InAppNotification.js
import React from 'react';
import {
Modal,
View,
Text,
TouchableOpacity,
StyleSheet,
Image,
Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const InAppNotification = ({ visible, notification, onDismiss, onAction }) => {
if (!visible || !notification) {
return null;
}

return (
<Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onDismiss} statusBarTranslucent >
<View style={styles.modalOverlay}>
<View style={styles.notificationCard}>
{/* Image */}
{notification.imageUrl && (
<Image
source={{ uri: notification.imageUrl }}
style={styles.notificationImage}
resizeMode="cover"
/>
)}
      {/* Title */}
      <Text style={styles.notificationTitle}>
        {notification.title}
      </Text>

      {/* Body */}
      <Text style={styles.notificationBody}>
        {notification.body}
      </Text>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.dismissButton]}
          onPress={onDismiss}
          activeOpacity={0.7}
        >
          <Text style={styles.dismissButtonText}>Dismiss</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.actionButton]}
          onPress={onAction}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
);
};

const styles = StyleSheet.create({
modalOverlay: {
flex: 1,
backgroundColor: 'rgba(0, 0, 0, 0.85)',
justifyContent: 'center',
alignItems: 'center',
padding: 20,
},
notificationCard: {
backgroundColor: '#ffffff',
borderRadius: 20,
padding: 24,
width: width - 40,
maxWidth: 400,
shadowColor: '#000',
shadowOffset: {
width: 0,
height: 8,
},
shadowOpacity: 0.44,
shadowRadius: 10.32,
elevation: 16,
},
notificationImage: {
width: '100%',
height: 180,
borderRadius: 12,
marginBottom: 16,
backgroundColor: '#f0f0f0',
},
notificationTitle: {
fontSize: 22,
fontWeight: 'bold',
color: '#1a1a1a',
marginBottom: 12,
textAlign: 'center',
lineHeight: 28,
},
notificationBody: {
fontSize: 16,
color: '#666666',
marginBottom: 24,
lineHeight: 24,
textAlign: 'center',
},
buttonContainer: {
flexDirection: 'row',
justifyContent: 'space-between',
gap: 12,
},
button: {
flex: 1,
paddingVertical: 14,
borderRadius: 12,
alignItems: 'center',
justifyContent: 'center',
},
dismissButton: {
backgroundColor: '#f0f0f0',
},
dismissButtonText: {
color: '#666666',
fontSize: 16,
fontWeight: '600',
},
actionButton: {
backgroundColor: '#4F46E5',
},
actionButtonText: {
color: '#ffffff',
fontSize: 16,
fontWeight: '600',
},
});

export default InAppNotification;