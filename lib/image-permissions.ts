import Constants, { AppOwnership } from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';

/**
 * Inside Expo Go, every app shares the same host binary, so iOS/Android
 * Settings lists the permission under "Expo Go", not "LUVLOTS" -- pointing
 * users at a "LUVLOTS" entry that doesn't exist there is a dead end. This
 * only tells the truth for the environment actually running (a standalone/
 * dev-client build really is named LUVLOTS in Settings).
 */
function settingsAppName() {
  return Constants.appOwnership === AppOwnership.Expo ? 'Expo Go' : 'LUVLOTS';
}

/**
 * Requests photo library access and throws a clear, actionable error if
 * denied -- distinguishing "you can ask again" (permission dialog was
 * dismissed) from "permanently denied" (user must enable it manually in
 * system Settings, since iOS/Android won't re-prompt after a hard denial).
 */
export async function ensureMediaLibraryPermission() {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) return;

  const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (requested.granted) return;

  if (requested.canAskAgain === false) {
    throw new Error(
      `Photo library access is turned off. Enable it in your device Settings > Apps > ${settingsAppName()} > Permissions, then try again.`,
    );
  }

  throw new Error('Photo library permission is required to continue.');
}
