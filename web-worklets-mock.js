// Mock para react-native-worklets no web
// Worklets não são suportados no web, então retornamos funções mock

// Função helper para criar um objeto mock que se comporta como SerializableRef
const createMockSerializableRef = (initialValue) => {
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

// Mock básico que previne erros de serialização
const mockWorklet = {
  // Funções de worklet
  createWorklet: () => () => {},
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,

  // Funções de serialização (essenciais para evitar erros)
  createSerializable: (value, shouldPersistRemote, nativeStateSource) => {
    return createMockSerializableRef(value);
  },
  createSerializableImport: (source, imported) => {
    return createMockSerializableRef(null);
  },
  createSerializableString: (str) => {
    return createMockSerializableRef(str);
  },
  createSerializableNumber: (num) => {
    return createMockSerializableRef(num);
  },
  createSerializableBoolean: (bool) => {
    return createMockSerializableRef(bool);
  },
  createSerializableBigInt: (bigInt) => {
    return createMockSerializableRef(bigInt);
  },
  createSerializableUndefined: () => {
    return createMockSerializableRef(undefined);
  },
  createSerializableNull: () => {
    return createMockSerializableRef(null);
  },
  createSerializableTurboModuleLike: (props, proto) => {
    return createMockSerializableRef(props);
  },

  // Funções do Reanimated (caso sejam usadas)
  useSharedValue: (initialValue) => createMockSerializableRef(initialValue),
  useAnimatedStyle: () => ({}),
  useDerivedValue: (updater) => createMockSerializableRef(null),
  withTiming: (value) => value,
  withSpring: (value) => value,
  withRepeat: (value) => value,
  withSequence: (...values) => values[values.length - 1],
  cancelAnimation: () => {},
  Easing: {
    linear: (t) => t,
    ease: (t) => t,
    quad: (t) => t * t,
    cubic: (t) => t * t * t,
  },
};

// Prevenir chamadas de serialização
if (typeof global !== 'undefined') {
  global.__WORKLET__ = false;
}

module.exports = mockWorklet;
