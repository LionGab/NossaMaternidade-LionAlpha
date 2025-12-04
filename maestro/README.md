# Maestro E2E Tests - Nossa Maternidade

This directory contains Maestro test flows for the Nossa Maternidade mobile app.

## Prerequisites

1. **Maestro installed** (already done ✓)
2. **Java 17+** installed (already done ✓)
3. **iOS Simulator or Android Emulator running**

## Running Tests

### Start the app first:

```bash
# iOS
npm run ios

# Android
npm run android
```

### Run a single test:

```bash
maestro test maestro/app-launch.yaml
```

### Run all tests:

```bash
maestro test maestro/
```

### Run with continuous mode (watches for changes):

```bash
maestro test --continuous maestro/
```

## Available Test Flows

- **app-launch.yaml** - Basic app launch verification
- **login-flow.yaml** - Login screen functionality
- **navigation-flow.yaml** - Main screen navigation

## Writing New Tests

Maestro uses YAML files with simple commands:

```yaml
appId: com.nossamaternidade.app
---
- launchApp
- tapOn: 'Button Text'
- assertVisible: 'Expected Text'
- inputText: 'Text to type'
- scroll
- swipe
```

### Useful Commands

- `launchApp` - Launch the app
- `tapOn: "text"` - Tap on element with text
- `assertVisible: "text"` - Assert element is visible
- `assertNotVisible: "text"` - Assert element is not visible
- `inputText: "text"` - Type text into focused input
- `hideKeyboard` - Hide the keyboard
- `scroll` - Scroll down
- `swipe` - Swipe gesture
- `waitForAnimationToEnd` - Wait for animations
- `back` - Go back (Android)

### Element Selection

```yaml
# By text (regex supported)
- tapOn: '.*[Ll]ogin.*'

# By ID
- tapOn:
    id: 'login-button'

# By accessibility label
- tapOn:
    label: 'Login Button'
```

## Debugging

### Studio Mode (Interactive)

```bash
maestro studio
```

This opens an interactive UI to build and test flows visually.

### Record Mode

```bash
maestro record
```

Records your interactions and generates a flow file.

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run E2E Tests
  run: |
    npm run ios &
    maestro test maestro/
```

## Documentation

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Test Commands Reference](https://maestro.mobile.dev/reference/commands)
- [Best Practices](https://maestro.mobile.dev/best-practices)
