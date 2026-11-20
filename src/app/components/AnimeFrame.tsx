import { useEffect, useRef, useState } from "react";
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
  getHost(process.env.EXPO_PUBLIC_API_WATCH2 ?? ""),
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
(function () {
  if (window.__hooked) return;
  window.__hooked = true;

    var base = document.createElement('style');
  base.textContent = [
  'html,body{margin:0!important;padding:0!important;width:100%!important;height:100%!important;overflow:hidden!important;background:#000!important;overscroll-behavior:none!important;touch-action:manipulation!important;}',
  'iframe{width:100vw!important;height:100vh!important;border:0!important;}',
  '.jw-icon-pip,[aria-label*="Picture in Picture" i],[aria-label*="Picture-in-Picture" i]{display:none!important;}',
'.jw-icon-display, .jw-icon-display .jw-svg-icon, .jw-icon-display .jw-svg-icon path{color:#008DA7!important;fill:#008DA7!important;}',
'.jw-icon-playback, .jw-icon-playback .jw-svg-icon, .jw-icon-playback .jw-svg-icon path{color:#008DA7!important;fill:#008DA7!important;}',
'.jw-slider-time .jw-progress{background:#008DA7!important;}',
'.jw-slider-time .jw-buffer{background:rgba(255,255,255,0.35)!important;}',
'.jw-slider-time .jw-rail{background:rgba(255,255,255,0.15)!important;}',
'.jw-slider-time .jw-knob{background:#008DA7!important;}',
'.jw-icon-buffer, .jw-icon-buffer .jw-svg-icon, .jw-icon-buffer .jw-svg-icon path{color:#008DA7!important;fill:#008DA7!important;}',
'.jw-slider-volume .jw-progress{background:#008DA7!important;}',
].join('');

  document.head.appendChild(base);

  var fsStyle = document.createElement('style');
  document.head.appendChild(fsStyle);

  function post(obj) {
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(obj));
  }

  var onFsChange = function () {
    var fs = !!document.fullscreenElement || !!document.webkitFullscreenElement;
    fsStyle.textContent = fs
      ? 'video{object-fit:cover!important;width:100vw!important;height:100vh!important;}'
      : '';
    post({ isFullscreen: fs });
  };
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);

  var sent = false;
  function ended(src) {
    if (sent) return;
    sent = true;
    post({ ended: true, source: src });
  }

  function centerDisplayIcon() {
  var player = document.querySelector('.jwplayer');
  var btn = document.querySelector('.jw-icon-display');
  if (!player || !btn) return;
  btn.style.transform = '';
  var p = player.getBoundingClientRect();
  var b = btn.getBoundingClientRect();
  if (!b.width) return;
  var dx = (p.left + p.width / 2) - (b.left + b.width / 2);
  if (Math.abs(dx) > 1) btn.style.transform = 'translateX(' + dx + 'px)';
}
setInterval(centerDisplayIcon, 400);
window.addEventListener('resize', centerDisplayIcon);

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (typeof d === 'string') { try { d = JSON.parse(d); } catch (_) { return; } }
    if (!d || typeof d !== 'object') return;

    if (d.type === 'aniembed:ended') return ended('s3');

    if (d.channel === 'megacloud' &&
        (d.event === 'complete' || d.type === 'complete' || d.name === 'complete' ||
         (d.data && (d.data.event === 'complete' || d.data.type === 'complete')))) {
      return ended('s1');
    }

    if (d.channel === 'animeembed' && d.version === 1) {
      post({ dbg: 'animeembed:' + d.event });
      if (d.event === 'ended' || d.event === 'complete' || d.event === 'finished') {
        return ended('s2');
      }
      return;
    }
  });
})();
true;
`;

const wrapperHtml = (src: string) => `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
html,body{margin:0;height:100%;background:#000;overflow:hidden}
iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0}
</style>
</head>
<body>
<iframe src="${src.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"
  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
  allowfullscreen></iframe>
</body>
</html>`;

export default function AnimeFrame({
  id,
  audio,
  server,
  episode,
  onEnded,
}: {
  id: string;
  audio: "sub" | "dub";
  server?: String;
  episode?: Number;
  onEnded?: () => void;
}) {
  const [ready, setReady] = useState(false);
  const endedHandledRef = useRef(false);
  useEffect(() => {
    setReady(false);
    endedHandledRef.current = false;
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

      if (rawData?.ended && !endedHandledRef.current) {
        endedHandledRef.current = true;
        handleFullscreenChange(false);
        onEnded?.();
      }
    } catch (error) {
      console.log("❌ Failed to parse message:", error);
    }
  };

  const finalUrl =
    server === "s1"
      ? `${process.env.EXPO_PUBLIC_API_WATCH}/stream/ani/${id}/${episode}/${audio}`
      : server === "s2"
        ? `${process.env.EXPO_PUBLIC_API_WATCH1}/embed/ani/${id}/${episode}?track=${audio}&autoPlay=1&muted=0&autoSkip=1&autoNext=0&start=0&accent=008da7&captionBg=0&hide=next%2Cpip%2Cserver%2Caudio&logo=https://ik.imagekit.io/zyntax/875870128_18108672005577199_374984678886188044_n.jpg&captionSize=s`
        : `${process.env.EXPO_PUBLIC_API_WATCH2}/embed/ani/${id}/${episode}?track=${audio}`;

  const finalRef =
    server === "s1"
      ? `${process.env.EXPO_PUBLIC_API_WATCH}`
      : server === "s2"
        ? `${process.env.EXPO_PUBLIC_API_WATCH1}`
        : `${process.env.EXPO_PUBLIC_API_WATCH2}`;

  if (!finalUrl) {
    return <View style={styles.playerFrame} />;
  }

  const useWrapper = server === "s2";

  const webViewSource = useWrapper
    ? { html: wrapperHtml(finalUrl), baseUrl: finalRef }
    : { uri: finalUrl, headers: { Referer: finalRef } };

  return (
    <View style={styles.playerFrame}>
      <WebView
        key={finalUrl}
        source={webViewSource}
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
