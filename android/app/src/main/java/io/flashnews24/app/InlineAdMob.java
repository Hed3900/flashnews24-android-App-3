package com.flashnews24.app;

import android.view.ViewGroup;
import android.widget.FrameLayout;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONArray;
import com.google.android.gms.ads.AdView;

import java.util.HashMap;
import java.util.Map;

@CapacitorPlugin(name = "InlineAdMob")
public class InlineAdMob extends Plugin {

    private final Map<Integer, InlineAdView> adViews = new HashMap<>();
    private int latestRequestId = 0;

    @PluginMethod
    public void show(PluginCall call) {
        JSONArray topsJson = call.getArray("tops");
        JSONArray slotIdsJson = call.getArray("slotIds");

        if (topsJson == null || slotIdsJson == null) {
            call.resolve();
            return;
        }

        int[] tops = new int[topsJson.length()];
        int[] slotIds = new int[slotIdsJson.length()];

        for (int i = 0; i < topsJson.length(); i++) {
            tops[i] = topsJson.optInt(i, 0);
            slotIds[i] = slotIdsJson.optInt(i, i);
        }

        final int requestId = ++latestRequestId;

        getActivity().runOnUiThread(() -> {
            if (requestId != latestRequestId) return;

            FrameLayout root = getActivity().findViewById(android.R.id.content);

            int[] webViewLocation = new int[2];
            int[] rootLocation = new int[2];

            getBridge().getWebView().getLocationOnScreen(webViewLocation);
            root.getLocationOnScreen(rootLocation);

            int webViewToRootOffset = webViewLocation[1] - rootLocation[1];
            float density = getActivity().getResources().getDisplayMetrics().density;

            for (int i = 0; i < tops.length; i++) {
                int slotId = slotIds[i];
                InlineAdView adView = adViews.get(slotId);

                if (adView == null) {
                    adView = new InlineAdView(getActivity());
                    adViews.put(slotId, adView);

                    FrameLayout.LayoutParams params =
                        new FrameLayout.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.WRAP_CONTENT
                        );

                    root.addView(adView, params);
                }

                FrameLayout.LayoutParams params =
                    (FrameLayout.LayoutParams) adView.getLayoutParams();

                params.topMargin = Math.round(tops[i] * density) + webViewToRootOffset;
                adView.setLayoutParams(params);
                adView.setVisibility(android.view.View.VISIBLE);
            }

            for (Map.Entry<Integer, InlineAdView> entry : adViews.entrySet()) {
                boolean visibleSlot = false;

                for (int slotId : slotIds) {
                    if (entry.getKey() == slotId) {
                        visibleSlot = true;
                        break;
                    }
                }

                if (!visibleSlot) {
                    entry.getValue().setVisibility(android.view.View.GONE);
                }
            }

            call.resolve();
        });
    }

    @PluginMethod
    public void hide(PluginCall call) {
        final int requestId = ++latestRequestId;

        getActivity().runOnUiThread(() -> {
            if (requestId != latestRequestId) return;
            for (InlineAdView adView : adViews.values()) {
                adView.setVisibility(android.view.View.GONE);
            }
            call.resolve();
        });
    }
}
