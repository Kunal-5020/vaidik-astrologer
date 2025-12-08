package com.vaidikastrologers

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        private const val TAG = "FCMService"
        private const val CHANNEL_ID = "vaidik_talk_notifications"
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
        Log.d(TAG, "📩 Message received from: ${remoteMessage.from}")

        // Check if message contains a notification payload
        remoteMessage.notification?.let { notification ->
            val title = notification.title ?: "Notification"
            val body = notification.body ?: ""
            
            Log.d(TAG, "Notification Title: $title")
            Log.d(TAG, "Notification Body: $body")
            
            // Check if it's a full-screen call notification
            val isFullScreen = remoteMessage.data["fullScreen"]?.toBoolean() ?: false
            
            if (isFullScreen) {
                showFullScreenNotification(title, body, remoteMessage.data)
            } else {
                sendNotification(title, body, remoteMessage.data)
            }
        }

        // Check if message contains a data payload
        if (remoteMessage.data.isNotEmpty()) {
            Log.d(TAG, "Message data payload: ${remoteMessage.data}")
            
            // If only data (no notification), still process it
            if (remoteMessage.notification == null) {
                val mode = remoteMessage.data["mode"]
                val title = remoteMessage.data["title"] ?: "New Request"
                val body = remoteMessage.data["body"] ?: ""
                
                if (mode == "chat" || mode == "call") {
                    showFullScreenNotification(title, body, remoteMessage.data)
                } else {
                    sendNotification(title, body, remoteMessage.data)
                }
            }
        }
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "🔑 New FCM Token: $token")
        // TODO: Send token to your server
    }

    private fun showFullScreenNotification(
        title: String,
        body: String,
        data: Map<String, String>
    ) {
        Log.d(TAG, "📲 Showing full-screen notification")
        
        val intent = Intent(this, IncomingCallActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("callerName", data["userName"] ?: data["astrologerName"] ?: "User")
            putExtra("callType", data["callType"] ?: "chat")
            putExtra("sessionId", data["sessionId"])
            putExtra("orderId", data["orderId"])
            putExtra("userId", data["userId"])
            putExtra("mode", data["mode"])
            putExtra("step", data["step"])
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        createNotificationChannel()

        val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setFullScreenIntent(pendingIntent, true)
            .setContentIntent(pendingIntent)
            .setVibrate(longArrayOf(0, 500, 200, 500))
            .setSound(android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_RINGTONE))

        val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
        
        Log.d(TAG, "✅ Full-screen notification displayed")
    }

    private fun sendNotification(
        title: String,
        body: String,
        data: Map<String, String>
    ) {
        Log.d(TAG, "📬 Showing normal notification")
        
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
            
            // Add data to intent
            data.forEach { (key, value) ->
                putExtra(key, value)
            }
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )

        createNotificationChannel()

        val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setSound(android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION))

        val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
        
        Log.d(TAG, "✅ Normal notification displayed")
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Vaidik Talk Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for astrologers"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 200, 500)
                setSound(
                    android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_RINGTONE),
                    null
                )
            }
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
            
            Log.d(TAG, "✅ Notification channel created")
        }
    }
}
