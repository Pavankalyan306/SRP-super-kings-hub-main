declare global {
  interface Window {
    median?: {
      onesignal?: {
        register?: () => void;
        userPrivacyConsent?: {
          grant?: () => void;
        };
      };
    };
    gonative?: Window["median"];
  }
}

function getMedianBridge() {
  return window.median || window.gonative;
}

export function requestMedianPushRegistration() {
  const bridge = getMedianBridge();

  try {
    bridge?.onesignal?.userPrivacyConsent?.grant?.();
    bridge?.onesignal?.register?.();
  } catch (error) {
    console.warn("Median push registration failed", error);
  }
}

export function isMedianApp() {
  return Boolean(getMedianBridge());
}

export {};
