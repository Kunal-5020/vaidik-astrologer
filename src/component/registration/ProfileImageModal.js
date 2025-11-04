import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ProfileImageModal({
  visible,
  onClose,
  onTakePhoto,
  onChooseGallery,
  onRemovePhoto,
  hasPhoto,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Profile Picture</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    onTakePhoto();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>📷</Text>
                  </View>
                  <Text style={styles.optionText}>Take Photo</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    onChooseGallery();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>🖼️</Text>
                  </View>
                  <Text style={styles.optionText}>Choose from Gallery</Text>
                </TouchableOpacity>

                {hasPhoto && (
                  <>
                    <View style={styles.divider} />
                    <TouchableOpacity
                      style={styles.optionButton}
                      onPress={() => {
                        onRemovePhoto();
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>🗑️</Text>
                      </View>
                      <Text style={[styles.optionText, styles.removeText]}>
                        Remove Photo
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    width: width,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  optionsContainer: {
    paddingVertical: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 22,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  removeText: {
    color: '#f44336',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },
  cancelButton: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
