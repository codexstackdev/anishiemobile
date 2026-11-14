import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import * as ScreenOrientation from "expo-screen-orientation";

const COLORS = {
  background: "#090A12",
  surface: "#121421",
  surfaceRaised: "#191B2B",
  white: "#F8F7FF",
  muted: "#9294A8",
  purple: "#A78BFA",
  violet: "#7C5CFC",
  cyan: "#83E7F4",
  border: "rgba(255,255,255,0.09)",
};

const getHost = (url: string): string => {
  const match = url.match(/^[a-z][a-z0-9+.-]*:\/\/([^/?#:]+)/i);
  return match ? match[1].toLowerCase() : "";
};

const BASE_ALLOWED_HOSTS = [
  getHost(process.env.EXPO_PUBLIC_API_WATCH ?? ""),
  getHost(process.env.EXPO_PUBLIC_API_WATCH1 ?? ""),
].filter(Boolean);

const EXTRA_ALLOWED_HOSTS: string[] = [];

const ALLOWED_HOSTS = [...BASE_ALLOWED_HOSTS, ...EXTRA_ALLOWED_HOSTS];

const isAllowedHost = (host: string) =>
  ALLOWED_HOSTS.some((h) => host === h || host.endsWith("." + h));

const BLOCKED_HOSTS = ["luugy.com", "pyppo.com"];

const isBlockedHost = (host: string) =>
  BLOCKED_HOSTS.some((h) => host === h || host.endsWith("." + h));

const shouldAllowRequest = (req: { url: string; isTopFrame?: boolean }) => {
  const url = req.url;

  if (/^(intent|market|googlechrome|chrome):/i.test(url)) return false;

  if (url === "about:blank" || url.startsWith("data:")) return true;

  const host = getHost(url);

  if (isBlockedHost(host)) return false;

  if (req.isTopFrame === false) return true;

  const allowed = isAllowedHost(host);
  if (!allowed) console.log("🚫 Blocked:", url);
  return allowed;
};

const AD_DOMAINS_JS =
  "['ads','doubleclick','googlesyndication','adnxs','popads','popcash','luugy','pyppo']";

const BEFORE_LOAD_JS = `
(function() {
  var lockScroll = function() {
    var s = document.createElement('style');
    s.textContent = 'html,body{position:fixed!important;top:0;left:0;width:100%!important;height:100%!important;overflow:hidden!important;overscroll-behavior:none!important;touch-action:none!important;}';
    document.head.appendChild(s);
  };
  if (document.head) lockScroll();
  else document.addEventListener('DOMContentLoaded', lockScroll);

  document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });
  document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });
  document.addEventListener('gesturestart',  function(e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('gesturechange', function(e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('gestureend',    function(e) { e.preventDefault(); }, { passive: false });

  var setViewport = function() {
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no';
  };
  if (document.head) setViewport();
  else document.addEventListener('DOMContentLoaded', setViewport);

  try {
    Object.defineProperty(window, 'open', { value: function() { return null; }, writable: false });
  } catch (e) {
    window.open = function() { return null; };
  }

  document.addEventListener('submit', function(e) { e.preventDefault(); }, true);

  document.addEventListener('click', function(e) {
    var target = e.target;
    while (target && target !== document) {
      if (target.tagName === 'A') {
        var href = target.getAttribute('href') || '';
        var isExternal =
          target.getAttribute('target') === '_blank' ||
          (href.indexOf('http') === 0 && href.indexOf(window.location.hostname) === -1);
        if (isExternal) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
      target = target.parentNode;
    }
  }, true);

  var adDomains = ${AD_DOMAINS_JS};
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (!node.tagName) return;
        if (['IFRAME', 'A', 'SCRIPT'].indexOf(node.tagName) !== -1) {
          var src = node.getAttribute('src') || node.getAttribute('href') || '';
          var isAd = adDomains.some(function(d) { return src.indexOf(d) !== -1; });
          if (isAd) node.remove();
        }
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
true;
`;

const AFTER_LOAD_JS = `
(function() {
  var style = document.createElement('style');
  style.textContent = 'html,body{position:fixed!important;top:0;left:0;width:100%!important;height:100%!important;overflow:hidden!important;overscroll-behavior:none!important;touch-action:none!important;}';
  document.head.appendChild(style);
})();

document.addEventListener('fullscreenchange', function() {
  window.ReactNativeWebView.postMessage(
    JSON.stringify({ isFullscreen: !!document.fullscreenElement })
  );
});

true;
`;

export default function AnimeFrame({
  id,
  audio,
  server,
  episode,
  season,
}: {
  id: string;
  audio: "sub" | "dub";
  server?: String;
  episode?: Number;
  season?: string;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
  }, [id, episode, server, audio]);

  const handleFullscreenChange = async (isFullscreen: boolean) => {
    try {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT,
        );
      } else {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP,
        );
      }
    } catch (error) {
      console.error("Failed to change orientation:", error);
    }
  };

  const handleWebViewMessage = async (event: any) => {
    try {
      const rawData = JSON.parse(event.nativeEvent.data);
      if (rawData && typeof rawData.isFullscreen !== "undefined") {
        handleFullscreenChange(rawData.isFullscreen);
      }
    } catch (error) {
      console.log("❌ Failed to parse message:", error);
    }
  };

  const finalUrl =
    server === "s1"
      ? `${process.env.EXPO_PUBLIC_API_WATCH}/stream/ani/${id}/${episode}/${audio}`
      : server === "s2"
        ? `${process.env.EXPO_PUBLIC_API_WATCH1}/embed/ani/${id}/${episode}?track=${audio}&autoPlay=1&muted=0&autoSkip=1&autoNext=0&start=0&accent=83e7f4&captionBg=0&hide=next%2Cpip%2Cserver%2Caudio&logo=https://ik.imagekit.io/zyntax/875870128_18108672005577199_374984678886188044_n.jpg&captionSize=s`
        : "";

  const finalRef =
    server === "s1"
      ? `${process.env.EXPO_PUBLIC_API_WATCH}`
      : server === "s2"
        ? `${process.env.EXPO_PUBLIC_API_WATCH1}`
        : "";

  if (!finalUrl) {
    return <View style={styles.playerFrame} />;
  }

  return (
    <View style={styles.playerFrame}>
      <WebView
        key={finalUrl}
        source={{
          uri: finalUrl,
          headers: { Referer: finalRef },
        }}
        originWhitelist={[
          "https://*",
          "http://*",
          "about:*",
          "data:*",
          "intent:*",
        ]}
        onShouldStartLoadWithRequest={shouldAllowRequest}
        setSupportMultipleWindows={false}
        onOpenWindow={() => {}}
        onMessage={handleWebViewMessage}
        onLoadEnd={() => setTimeout(() => setReady(true), 1200)}
        injectedJavaScriptBeforeContentLoaded={BEFORE_LOAD_JS}
        injectedJavaScriptBeforeContentLoadedForMainFrameOnly={false}
        injectedJavaScript={AFTER_LOAD_JS}
        injectedJavaScriptForMainFrameOnly={false}
        allowsFullscreenVideo={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={false}
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
        backgroundColor="black"
        style={styles.webview}
      />

      {!ready && (
        <View
          style={StyleSheet.absoluteFill}
          pointerEvents="auto"
          onStartShouldSetResponder={() => true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  playerFrame: {
    width: "100%",
    aspectRatio: 16 / 9,
    overflow: "hidden",
    backgroundColor: "#111321",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  webview: {
    flex: 1,
    backgroundColor: "black",
  },
});
