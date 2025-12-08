import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const IncomingChatRequestModal = ({ visible, request, onAccept, onReject }) => {
  if (!visible || !request) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Incoming chat request</Text>
          <Text style={styles.sub}>Rate: ₹{request.ratePerMinute}/min</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.reject]} onPress={onReject}>
              <Text style={styles.btnText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.accept]} onPress={onAccept}>
              <Text style={styles.btnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.6)',alignItems:'center',justifyContent:'center'},
  card:{backgroundColor:'#fff',width:'80%',borderRadius:16,padding:20},
  title:{fontSize:18,fontWeight:'700',marginBottom:6},
  sub:{fontSize:14,color:'#666',marginBottom:16},
  row:{flexDirection:'row',justifyContent:'space-between'},
  btn:{flex:1,paddingVertical:12,borderRadius:10,alignItems:'center'},
  reject:{backgroundColor:'#eee',marginRight:8},
  accept:{backgroundColor:'#4CAF50',marginLeft:8},
  btnText:{color:'#000',fontWeight:'600'}
});

export default IncomingChatRequestModal;
