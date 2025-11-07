import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
// import { Card, Avatar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = ({ navigation }) => {
  const handleCallHistory = () => {
    navigation.navigate('CallHistory');
  };

  const handleCurrentStatus = () => {
    navigation.navigate('CurrentStatus');
  };

  const handleCustomerQueue = () => {
    navigation.navigate('CustomerQueue');
  };

  const handleCoinOrder = () => {
    navigation.navigate('CoinOrder');
  };

   const handleActiveSession = () => {
    navigation.navigate('ActiveSessions');
  };


  const handlePerformance = () => {
    navigation.navigate('PerformanceAnalysis');
  };

  const handlVideoCall = () => {
    navigation.navigate('VideoCallSession');
  };
  const handleChat = () => {
    navigation.navigate('ChatScreen');
  };
  const handleCall = () => {
    navigation.navigate('Call');
  };
  const handleQuickhelp = () => {
    navigation.navigate('QuickHelp');
  };
  const handleGallerymgmt = () => {
    navigation.navigate('Gallery');
  };
  const handleIntroAudio = () => {
    navigation.navigate('IntroAudio');
  };
  const handleChangeRequest = () => {
    navigation.navigate('ChangeRequest');
  };

  const handlePendingRequest = () =>{
    navigation.navigate('PendingRequest')
  }
  return (
    <View style={styles.container}>
      {/* Header with profile */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#fff" style={{ left: 20 }} />
        </TouchableOpacity>
        <Text style={styles.name}>My Settings</Text>
      </View>

      {/* 3 cards in row */}
      <ScrollView style={{ backgroundColor: '#f5f5f5' }}>
        <View style={styles.buttonList}>
          <TouchableOpacity
            style={styles.buttonItem}
            onPress={handleCallHistory}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                {/* <Icon name="edit" size={24} color="#6200ea" /> */}
                <Text style={styles.buttonText}>Call History</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonItem} onPress={handleCoinOrder}>
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                {/* <Icon name="schedule" size={24} color="#6200ea" /> */}
                <Text style={styles.buttonText}>Coins Order</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonItem}
            onPress={handleCustomerQueue}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                {/* <Icon name="work" size={24} color="#6200ea" /> */}
                <Text style={styles.buttonText}>Customer Queue</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>

          {/* ==========other part of screen inside setting ====================== */}
          <TouchableOpacity
            style={styles.buttonItem}
            onPress={() => navigation.navigate('CurrentStatus')}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                {/* <Icon name="settings" size={22} color="#6200ea" /> */}
                <Text style={styles.buttonText}>Current Status</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonItem}
            onPress={handleActiveSession}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                {/* <Icon name="settings" size={22} color="#6200ea" /> */}
                <Text style={styles.buttonText}>Active Sessions</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonItem}
            onPress={handlePerformance}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                {/* <Icon name="settings" size={22} color="#6200ea" /> */}
                <Text style={styles.buttonText}>PerformanceAnalysis</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonItem}
            onPress={handlVideoCall}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                {/* <Icon name="settings" size={22} color="#6200ea" /> */}
                <Text style={styles.buttonText}>VideoCallVoiceCall</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonItem}
            onPress={handleQuickhelp}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                {/* <Icon name="settings" size={22} color="#6200ea" /> */}
                <Text style={styles.buttonText}>QuickHelp</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonItem}
            onPress={handleChat}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                {/* <Icon name="settings" size={22} color="#6200ea" /> */}
                <Text style={styles.buttonText}>Chat </Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonItem}
            onPress={handleCall}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                {/* <Icon name="settings" size={22} color="#6200ea" /> */}
                <Text style={styles.buttonText}>Call</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonItem}
            onPress={handleGallerymgmt}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                {/* <Icon name="settings" size={22} color="#6200ea" /> */}
                <Text style={styles.buttonText}>Gallery Management</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonItem}
            onPress={handleIntroAudio}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                {/* <Icon name="settings" size={22} color="#6200ea" /> */}
                <Text style={styles.buttonText}>IntroAudio</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonItem}
            onPress={handleChangeRequest}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                {/* <Icon name="settings" size={22} color="#6200ea" /> */}
                <Text style={styles.buttonText}>ChangeRequest</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>
            <TouchableOpacity
            style={styles.buttonItem}
            onPress={handlePendingRequest}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                {/* <Icon name="settings" size={22} color="#6200ea" /> */}
                <Text style={styles.buttonText}>Pending Request</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#6200ea',
    //  backgroundColor: '#372643',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  name: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '400',
    // marginTop: 8,
    left: 30,
  },

  // ============new=================

  buttonList: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  buttonItem: {
    backgroundColor: 'white',
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    height: 60, // 👈 consistent height
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  buttonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
});

export default ProfileScreen;
