import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

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
  const crashFreeLocationBlocker = `
(function() {
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  document.addEventListener('gesturestart',  function(e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('gesturechange', function(e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('gestureend',    function(e) { e.preventDefault(); }, { passive: false });


  const setViewport = () => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no';
  };
  if (document.head) { setViewport(); }
  else { document.addEventListener('DOMContentLoaded', setViewport); }

  window.open = function() { return null; };

  document.addEventListener('click', function(e) {
    let target = e.target;
    while (target && target !== document) {
      if (target.tagName === 'A') {
        const href = target.getAttribute('href') || '';
        const isExternal =
          target.getAttribute('target') === '_blank' ||
          (href.startsWith('http') && !href.includes(window.location.hostname));
        if (isExternal) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
      target = target.parentNode;
    }
  }, true);

  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.tagName === 'IFRAME') {
          const src = node.getAttribute('src') || '';
          const adDomains = ['ads', 'doubleclick', 'googlesyndication', 'adnxs', 'popads', 'popcash'];
          const isAd = adDomains.some(domain => src.includes(domain));
          if (isAd) node.remove();
        }
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
true;
`;

  const INJECTED_JS = `
  (function() {
    const style = document.createElement('style');
    style.textContent = \`
      html, body {
        touch-action: pan-x pan-y !important;
        overflow: hidden !important;
      }
      video, iframe {
        touch-action: none !important;
      }
    \`;
    document.head.appendChild(style);
  })();

  document.addEventListener('fullscreenchange', (event) => {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ isFullscreen: !!document.fullscreenElement })
    );
  });

  true;
`;
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
  return (
    <>
      <WebView
        source={{
          uri: finalUrl,
          headers: {
            Referer: finalRef,
          },
        }}
        allowsFullscreenVideo={true}
        injectedJavaScriptBeforeContentLoaded={crashFreeLocationBlocker}
        injectedJavaScript={INJECTED_JS}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        scalesPageToFit={true}
        backgroundColor="black"
        style={styles.playerFrame}
      />
    </>
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
    alignItems: "center",
    justifyContent: "center",
  },
});
