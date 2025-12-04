import { Platform, ViewStyle, DimensionValue } from 'react-native';

/**
 * Performance optimization utilities for React Native Web
 * Helps reduce layout and paint work by using GPU-accelerated properties
 */

/**
 * Adds will-change CSS property for web to hint browser optimizations
 * Use sparingly and only for elements that will be animated or frequently changed
 *
 * @param properties - CSS properties that will change (e.g., 'transform', 'opacity')
 * @returns Style object with will-change (web only)
 */
export function addWillChange(properties: string | string[]): ViewStyle {
  if (Platform.OS !== 'web') {
    return {};
  }

  const props = Array.isArray(properties) ? properties.join(', ') : properties;
  return {
    // willChange is a web CSS property, may not be in RN types
    willChange: props,
  } as ViewStyle;
}

/**
 * Converts position-based centering (top: 50%, left: 50% with margins)
 * to transform-based centering for better performance
 *
 * @param style - Original style object
 * @returns Optimized style with transform instead of position + margins
 */
export function optimizeAbsoluteCentering(style: ViewStyle): ViewStyle {
  // If already using transform, return as-is
  if (style.transform) {
    return style;
  }

  const { top, left, right: _right, bottom: _bottom, marginTop, marginLeft, ...rest } = style;

  // Check if this is a centering pattern (top: 50%, left: 50% with negative margins)
  const isCenteringPattern =
    (top === '50%' || top === '50%') &&
    (left === '50%' || left === '50%') &&
    (marginTop !== undefined || marginLeft !== undefined);

  if (isCenteringPattern) {
    const translateX = marginLeft ? -Math.abs(Number(marginLeft) || 0) : -50;
    const translateY = marginTop ? -Math.abs(Number(marginTop) || 0) : -50;

    return {
      ...rest,
      top: '50%',
      left: '50%',
      transform: [
        { translateX: typeof translateX === 'number' ? translateX : -50 },
        { translateY: typeof translateY === 'number' ? translateY : -50 },
      ],
    };
  }

  return style;
}

/**
 * Optimizes animated styles to use transform and opacity instead of layout properties
 * Returns a style object optimized for GPU acceleration
 *
 * @param animatedProps - Object with animated values
 * @param staticStyle - Static style properties
 * @returns Optimized style object
 */
export function optimizeAnimatedStyle(
  animatedProps: {
    translateX?: number;
    translateY?: number;
    scale?: number;
    opacity?: number;
    rotate?: string;
  },
  staticStyle?: ViewStyle
): ViewStyle {
  type TransformItem =
    | { translateX: number }
    | { translateY: number }
    | { scale: number }
    | { rotate: string };

  const transform: TransformItem[] = [];

  if (animatedProps.translateX !== undefined) {
    transform.push({ translateX: animatedProps.translateX });
  }
  if (animatedProps.translateY !== undefined) {
    transform.push({ translateY: animatedProps.translateY });
  }
  if (animatedProps.scale !== undefined) {
    transform.push({ scale: animatedProps.scale });
  }
  if (animatedProps.rotate !== undefined) {
    transform.push({ rotate: animatedProps.rotate });
  }

  return {
    ...staticStyle,
    ...(transform.length > 0 && { transform }),
    ...(animatedProps.opacity !== undefined && { opacity: animatedProps.opacity }),
    // Add will-change hint for web
    ...(Platform.OS === 'web' && transform.length > 0 && addWillChange(['transform', 'opacity'])),
  };
}

/**
 * Creates a style for position: absolute elements that won't trigger layout
 * Use for decorative elements that don't affect document flow
 *
 * @param position - Position object with top, left, right, bottom
 * @param optimize - Whether to optimize centering with transform
 * @returns Optimized absolute positioning style
 */
export function createAbsoluteStyle(
  position: {
    top?: DimensionValue;
    left?: DimensionValue;
    right?: DimensionValue;
    bottom?: DimensionValue;
  },
  optimize = true
): ViewStyle {
  const baseStyle: ViewStyle = {
    position: 'absolute',
    ...position,
  };

  if (optimize) {
    return optimizeAbsoluteCentering(baseStyle);
  }

  return baseStyle;
}
