import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Dimensions, StyleSheet } from 'react-native';

// Intrinsic size of src/assets/images/splash-school.jpg
const IMG_W = 1080;
const IMG_H = 2340;
const SPLASH_BG = '#EFE9D9'; // matches the image's blended edges -> invisible letterbox
const SPLASH_IMG = require('../assets/images/splash-school.jpg');
const DURATION_MS = 3000;

/**
 * Full-screen launch screen: shows the "आओ स्कूल चलें" photo (never cropped, fits
 * any device) with a progress bar that fills over exactly 3 seconds, then calls onFinish().
 */
export default function AnimatedSplash({ onFinish }) {
  const { width: SW, height: SH } = Dimensions.get('window');

  // Image is shown full-bleed (resizeMode="cover"). The blended cream padding baked
  // into the image absorbs the crop, so the kids + text are never cut on any ratio.
  // Compute the scaled image rect so the bar always lands just under the text.
  const scale = Math.max(SW / IMG_W, SH / IMG_H);
  const dispW = IMG_W * scale;
  const dispH = IMG_H * scale;
  const offsetY = (SH - dispH) / 2; // <= 0 under cover
  const barW = dispW * 0.56;
  const barX = (SW - barW) / 2;
  const barTop = offsetY + dispH * 0.905; // just below the baked-in text

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: DURATION_MS,
      useNativeDriver: false, // animating width
    });
    anim.start(({ finished }) => {
      if (finished && onFinish) onFinish();
    });
    return () => anim.stop();
  }, [onFinish, progress]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, barW],
  });

  return (
    <View style={[styles.root, { backgroundColor: SPLASH_BG }]}>
      <Image source={SPLASH_IMG} resizeMode="cover" style={StyleSheet.absoluteFill} />
      <View style={[styles.track, { left: barX, top: barTop, width: barW }]}>
        <Animated.View style={[styles.fill, { width: fillWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  track: {
    position: 'absolute',
    height: 12,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.40)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.92)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 7,
    backgroundColor: '#F4E4B8', // warm gold, matches the title
  },
});