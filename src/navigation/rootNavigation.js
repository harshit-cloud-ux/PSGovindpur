import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function goHome() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Home');
  }
}
