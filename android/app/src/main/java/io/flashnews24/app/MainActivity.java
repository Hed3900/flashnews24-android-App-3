package com.flashnews24.app;

import android.os.Bundle;
import android.content.Intent;
import android.util.Log;
import android.widget.Toast;

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
                        Log.e("FCM", "Token Error", task.getException());

                        Toast.makeText(
                                this,
                                "FCM Error: " + task.getException(),
                                Toast.LENGTH_LONG
                        ).show();
                        return;
                    }

                    String token = task.getResult();

                    android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(this);
builder.setTitle("FCM Token");
builder.setMessage(token);
builder.setPositiveButton("OK", null);
builder.show();

                    Toast.makeText(
                            this,
                            token,
                            Toast.LENGTH_LONG
                    ).show();
                });
    }
}
