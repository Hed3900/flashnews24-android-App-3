package com.flashnews24.app;

import android.content.Context;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;

public class InlineAdView extends FrameLayout {

    private final AdView adView;

    public InlineAdView(Context context) {
        super(context);

        setClipChildren(false);
        setClipToPadding(false);

        adView = new AdView(context);

        int widthPx = context.getResources().getDisplayMetrics().widthPixels;
        float density = context.getResources().getDisplayMetrics().density;
        int widthDp = Math.max(320, (int) (widthPx / density));

        adView.setAdSize(
            AdSize.getInlineAdaptiveBannerAdSize(widthDp, 100)
        );

        adView.setAdUnitId("ca-app-pub-3288039417600063/3826509024");

        addView(
            adView,
            new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        );

        adView.loadAd(new AdRequest.Builder().build());
    }
}
