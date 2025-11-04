// ProfileImageModal.js
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileImageModal = ({
  visible,
  onClose,
  onTakePhoto,
  onChooseGallery,
  onRemovePhoto,
  hasPhoto,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Icon name="close" size={22} color="#000" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Select an Option</Text>

          <TouchableOpacity style={styles.modalBtn} onPress={onTakePhoto}>
            <Text style={styles.modalBtnText}>📸 Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalBtn} onPress={onChooseGallery}>
            <Text style={styles.modalBtnText}>🖼 Choose from Gallery</Text>
          </TouchableOpacity>

          {hasPhoto && (
            <TouchableOpacity style={styles.modalBtn} onPress={onRemovePhoto}>
              <Text style={[styles.modalBtnText, { color: 'red' }]}>
                🗑 Remove Profile Picture
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    marginTop: 10,
    color: '#333',
  },
  modalBtn: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 16,
    color: '#111',
  },
});

export default ProfileImageModal;
