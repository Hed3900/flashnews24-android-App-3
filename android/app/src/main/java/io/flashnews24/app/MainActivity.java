package com.flashnews24.app;

import android.os.Bundle;
import android.content.Intent;
import android.util.Log;

import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.MobileAds;
import com.google.firebase.messaging.FirebaseMessaging;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        MobileAds.initialize(this, initializationStatus -> {});

        FirebaseMessaging.getInstance()
                .subscribeToTopic("flashnews24")
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        Log.d("FCM", "Subscribed to flashnews24");
                    } else {
                        Log.e("FCM", "Topic subscription failed", task.getException());
                    }
                });
    }
}
