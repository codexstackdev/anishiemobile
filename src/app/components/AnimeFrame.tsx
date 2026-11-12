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

export default function AnimeFrame({id} : {id: string}) {
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

    return (
      <>
        <WebView
          source={{
            uri: `${process.env.EXPO_PUBLIC_API_WATCH}/stream/ani/${id}/1/sub`,
            headers: { 
                Referer: `${process.env.EXPO_PUBLIC_API_WATCH}`
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
