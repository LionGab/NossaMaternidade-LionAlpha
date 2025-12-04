// Mock para react-native-reanimated no web
// Reanimated não funciona completamente no web, então retornamos funções mock

const createMockAnimatedRef = (initialValue) => {
  let value = initialValue;
  const ref = {
    get value() {
      return value;
    },
    set value(newValue) {
      value = newValue;
    },
    get: function () {
      return value;
    },
    set: function (newValue) {
      value = newValue;
    },
  };
  return ref;
};

// Mock do Reanimated
const mockReanimated = {
  // Hooks
  useSharedValue: (initialValue) => createMockAnimatedRef(initialValue),
  useAnimatedStyle: (updater) => {
    if (typeof updater === 'function') {
      try {
        return updater();
      } catch {
        return {};
      }
    }
    return {};
  },
  useDerivedValue: (updater) => {
    const value = typeof updater === 'function' ? updater() : null;
    return createMockAnimatedRef(value);
  },
  useAnimatedProps: () => ({}),
  useAnimatedGestureHandler: () => ({}),
  useAnimatedScrollHandler: () => () => {},
  useAnimatedRef: () => ({ current: null }),
  useAnimatedReaction: () => {},

  // Animations
  withTiming: (toValue, config, callback) => {
    if (callback) setTimeout(callback, 0);
    return toValue;
  },
  withSpring: (toValue, config, callback) => {
    if (callback) setTimeout(callback, 0);
    return toValue;
  },
  withDecay: (config, callback) => {
    if (callback) setTimeout(callback, 0);
    return 0;
  },
  withRepeat: (animation, numberOfReps, reverse, callback) => {
    if (callback) setTimeout(callback, 0);
    return animation;
  },
  withSequence: (...animations) => animations[animations.length - 1],
  withDelay: (delayMs, animation) => animation,
  cancelAnimation: () => {},

  // Easing
  Easing: {
    linear: (t) => t,
    ease: (t) => t,
    quad: (t) => t * t,
    cubic: (t) => t * t * t,
    poly: (n) => (t) => Math.pow(t, n),
    sin: (t) => 1 - Math.cos((t * Math.PI) / 2),
    circle: (t) => 1 - Math.sqrt(1 - t * t),
    exp: (t) => Math.pow(2, 10 * (t - 1)),
    elastic: (bounciness) => (t) => t,
    back: (s) => (t) => t,
    bounce: (t) => t,
    bezier: (x1, y1, x2, y2) => (t) => t,
    bezierFn: (x1, y1, x2, y2) => (t) => t,
    in: (easing) => easing,
    out: (easing) => (t) => 1 - easing(1 - t),
    inOut: (easing) => (t) => (t < 0.5 ? easing(t * 2) / 2 : 1 - easing((1 - t) * 2) / 2),
  },

  // Interpolation
  interpolate: (value, inputRange, outputRange, options) => {
    return value;
  },
  interpolateColor: (value, inputRange, outputRange, colorSpace) => {
    return outputRange[0];
  },
  Extrapolate: {
    EXTEND: 'extend',
    CLAMP: 'clamp',
    IDENTITY: 'identity',
  },

  // Utilities
  runOnUI: (fn) => fn,
  runOnJS: (fn) => fn,
  measure: () => null,
  scrollTo: () => {},
  setGestureState: () => {},

  // createAnimatedComponent
  createAnimatedComponent: (Component) => Component,
};

// Prevenir execução de worklets
if (typeof global !== 'undefined') {
  global._WORKLET = false;
  global.__WORKLET__ = false;
  global.__reanimatedWorkletInit = () => {};
}

// Exportar tanto como default quanto como named exports
module.exports = mockReanimated;
module.exports.default = mockReanimated;
