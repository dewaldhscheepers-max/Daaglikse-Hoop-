package com.dewaldscheepers.daaglikshoop;

import android.os.Bundle;
import android.webkit.WebSettings;

import androidx.webkit.WebSettingsCompat;
import androidx.webkit.WebViewFeature;

import com.getcapacitor.BridgeActivity;

/* Daaglikse Hoop se Android-omhulsel.
 *
 * Die HELE rede waarom hierdie klas iets doen, is die donker modus.
 *
 * Vroeer was hierdie app 'n TWA — 'n houer wat vir die foon gese het "maak
 * my webwerf oop in die verstek-blaaier". Op 'n Samsung is daardie blaaier
 * Samsung Internet, en Samsung Internet keer elke kleur op die bladsy om
 * sodra die foon (of kragbespaarder) op donker modus is. Die app het swart
 * en stukkend gelyk en ons kon niks daaraan doen nie: dit was nie ons
 * blaaier nie.
 *
 * Nou dra ons ons eie WebView saam, en die keuse is ons s'n.
 *
 * setAlgorithmicDarkeningAllowed(false) is die moderne reel. Dit se vir die
 * WebView: moenie hierdie bladsy self donker maak nie. Die ou naam hiervoor
 * was setForceDark(FORCE_DARK_OFF).
 *
 * Die kontrole met WebViewFeature is nie oorversigtigheid nie — die WebView
 * word deur Google Play opgedateer, apart van Android self, en op 'n ou of
 * afgeskakelde WebView bestaan die reel eenvoudig nie. Vra sonder om te kyk
 * en die app val om by die oopmaak.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebSettings instellings = getBridge().getWebView().getSettings();

        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            WebSettingsCompat.setAlgorithmicDarkeningAllowed(instellings, false);
        } else if (WebViewFeature.isFeatureSupported(WebViewFeature.FORCE_DARK)) {
            WebSettingsCompat.setForceDark(instellings, WebSettingsCompat.FORCE_DARK_OFF);
        }
    }
}
