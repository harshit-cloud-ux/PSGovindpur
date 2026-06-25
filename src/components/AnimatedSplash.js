import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Dimensions, StyleSheet } from 'react-native';

const SPLASH_IMG = require('../assets/images/splash-school.jpg');
const SPLASH_BG = '#EFE9D9'; // matches the photo's blended edges
const DURATION_MS = 3000;

export default function AnimatedSplash({ onFinish }) {
  const { width: SW, height: SH } = Dimensions.get('window');
  const barW = SW * 0.56;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: DURATION_MS,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished && onFinish) onFinish();
    });
    return () => anim.stop();
  }, [onFinish, progress]);

  const fillWidth = progress.interpolate({ inputRange: [0, 1], outputRange: [0, barW] });

  return (
    <View style={[styles.root, { backgroundColor: SPLASH_BG }]}>
      {/* whole photo always visible, centered */}
      <Image source={SPLASH_IMG} resizeMode="contain" style={{ width: SW, height: SH }} />
      <View style={[styles.track, { width: barW, bottom: SH * 0.13 }]}>
        <Animated.View style={[styles.fill, { width: fillWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  track: {
    position: 'absolute',
    height: 12,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.40)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.92)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 7, backgroundColor: '#F4E4B8' },
});
