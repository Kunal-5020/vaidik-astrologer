import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function InterviewTimeline({ interviews, currentStatus }) {
  const rounds = [
    { key: 'round1', title: 'Round 1: Profile Review', step: 1 },
    { key: 'round2', title: 'Round 2: Audio Call', step: 2 },
    { key: 'round3', title: 'Round 3: Video Call', step: 3 },
    { key: 'round4', title: 'Round 4: Final Verification', step: 4 },
  ];

  const getStepStatus = (round) => {
    if (!interviews || !interviews[round.key]) {
      return 'pending';
    }
    
    const roundData = interviews[round.key];
    
    if (roundData.status === 'failed' || (roundData.status === 'completed' && !roundData.passed && !roundData.approved)) {
      return 'failed';
    }
    
    if (roundData.status === 'completed' && (roundData.passed || roundData.approved)) {
      return 'completed';
    }
    
    if (roundData.status === 'scheduled') {
      return 'scheduled';
    }
    
    return 'pending';
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'scheduled':
        return '#2196f3';
      case 'failed':
        return '#f44336';
      default:
        return '#e0e0e0';
    }
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'scheduled':
        return '📅';
      case 'failed':
        return '✗';
      default:
        return '○';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Interview Progress</Text>
      
      {rounds.map((round, index) => {
        const status = getStepStatus(round);
        const roundData = interviews?.[round.key];
        const isLast = index === rounds.length - 1;

        return (
          <View key={round.key} style={styles.stepContainer}>
            {/* Timeline Line */}
            <View style={styles.timelineColumn}>
              <View
                style={[
                  styles.stepDot,
                  { backgroundColor: getStepColor(status) },
                ]}
              >
                <Text style={styles.stepIcon}>{getStepIcon(status)}</Text>
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.timelineLine,
                    { backgroundColor: status === 'completed' ? '#4caf50' : '#e0e0e0' },
                  ]}
                />
              )}
            </View>

            {/* Round Details */}
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{round.title}</Text>
              
              {status === 'pending' && (
                <Text style={styles.stepStatus}>Not scheduled yet</Text>
              )}
              
              {status === 'scheduled' && roundData?.scheduledAt && (
                <Text style={styles.stepStatusScheduled}>
                  Scheduled: {formatDate(roundData.scheduledAt)}
                </Text>
              )}
              
              {status === 'completed' && (
                <View>
                  <Text style={styles.stepStatusCompleted}>
                    ✓ Completed: {formatDate(roundData.completedAt)}
                  </Text>
                  {roundData.feedback && (
                    <Text style={styles.feedback}>
                      Feedback: {roundData.feedback}
                    </Text>
                  )}
                </View>
              )}
              
              {status === 'failed' && (
                <View>
                  <Text style={styles.stepStatusFailed}>✗ Not cleared</Text>
                  {roundData.feedback && (
                    <Text style={styles.feedbackNegative}>
                      Reason: {roundData.feedback}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timelineColumn: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIcon: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  timelineLine: {
    width: 3,
    flex: 1,
    minHeight: 60,
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepStatus: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  stepStatusScheduled: {
    fontSize: 13,
    color: '#2196f3',
    fontWeight: '600',
  },
  stepStatusCompleted: {
    fontSize: 13,
    color: '#4caf50',
    fontWeight: '600',
    marginBottom: 4,
  },
  stepStatusFailed: {
    fontSize: 13,
    color: '#f44336',
    fontWeight: '600',
    marginBottom: 4,
  },
  feedback: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  feedbackNegative: {
    fontSize: 12,
    color: '#f44336',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
