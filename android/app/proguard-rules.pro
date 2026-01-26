# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# --- AGORA SDK RULES ---
-keep class io.agora.** { *; }
-dontwarn io.agora.**

# --- FIX FOR MISSING DESUGAR CLASS ---
# References to ThrowableExtension in Agora cause R8 to fail
-dontwarn com.google.devtools.build.android.desugar.runtime.**
