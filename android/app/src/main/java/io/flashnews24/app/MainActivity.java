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

        FirebaseMessaging.getInstance().getToken()
    .addOnCompleteListener(task -> {
        if (!task.isSuccessful()) {
            android.widget.Toast.makeText(
                this,
                "FCM Error: " + task.getException(),
                android.widget.Toast.LENGTH_LONG
            ).show();
            return;
        }

        android.widget.Toast.makeText(
            this,
            task.getResult(),
            android.widget.Toast.LENGTH_LONG
        ).show();
    });
