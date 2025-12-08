package com.vaidikastrologers

import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class IncomingCallActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Show over lock screen
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
            val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
            keyguardManager.requestDismissKeyguard(this, null)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
            )
        }

        setContentView(R.layout.activity_incoming_call)

        // ✅ Get data from intent
        val callerName = intent.getStringExtra("callerName")
        val callType = intent.getStringExtra("callType")
        val sessionId = intent.getStringExtra("sessionId")
        val orderId = intent.getStringExtra("orderId")
        val userId = intent.getStringExtra("userId")
        val mode = intent.getStringExtra("mode")
        val step = intent.getStringExtra("step")

        // Set up UI
        val callerNameView = findViewById<TextView>(R.id.caller_name)
        callerNameView.text = callerName ?: "Unknown Caller"

        val callTypeView = findViewById<TextView>(R.id.call_type)
        callTypeView.text = when (mode) {
            "chat" -> "Incoming Chat Request"
            "call" -> if (callType == "video") "Incoming Video Call" else "Incoming Audio Call"
            else -> "Incoming Request"
        }

        val acceptButton = findViewById<Button>(R.id.accept_button)
        val rejectButton = findViewById<Button>(R.id.reject_button)

        acceptButton.setOnClickListener {
            val intent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("acceptCall", true)
                putExtra("sessionId", sessionId)
                putExtra("orderId", orderId)
                putExtra("callType", callType)
                putExtra("userId", userId)
                putExtra("userName", callerName)
                putExtra("mode", mode)
                putExtra("step", step)
            }
            startActivity(intent)
            finish()
        }

        rejectButton.setOnClickListener {
            // TODO: Send rejection to server
            finish()
        }
    }
}
