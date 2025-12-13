//
//  AppDelegate.swift
//  VaidikAstrologers
//
//  Created by you.
//  Updated to match User App Configuration
//

import UIKit
import Firebase
import FirebaseMessaging
import UserNotifications
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?
    
    // React Native New Architecture
    var reactNativeDelegate: ReactNativeDelegate?
    var reactNativeFactory: RCTReactNativeFactory?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {

        // 1. Setup React Native (New Arch)
        let delegate = ReactNativeDelegate()
        let factory = RCTReactNativeFactory(delegate: delegate)
        delegate.dependencyProvider = RCTAppDependencyProvider()
        reactNativeDelegate = delegate
        reactNativeFactory = factory

        window = UIWindow(frame: UIScreen.main.bounds)
        
        // ⚠️ IMPORTANT: Module Name kept as "VaidikAstrologers"
        factory.startReactNative(
            withModuleName: "VaidikAstrologers",
            in: window,
            launchOptions: launchOptions
        )

        // 2. Setup Firebase
        FirebaseApp.configure()
        
        // 3. Setup Notifications
        UNUserNotificationCenter.current().delegate = self
        let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
        UNUserNotificationCenter.current().requestAuthorization(
            options: authOptions,
            completionHandler: { _, _ in }
        )
        application.registerForRemoteNotifications()

        return true
    }

    // MARK: - URL Handling (Deep Links)
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        return RCTLinkingManager.application(app, open: url, options: options)
    }

    // MARK: - Universal Links
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}

// MARK: - React Native Delegate
class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
    override func sourceURL(for bridge: RCTBridge) -> URL? {
        return bundleURL()
    }
    
    override func bundleURL() -> URL? {
    #if DEBUG
        return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
        return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
    }
}

// MARK: - Notification Handling
extension AppDelegate {
    // Show notification banner even when app is open (Foreground Notifications)
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound, .badge])
    }
}