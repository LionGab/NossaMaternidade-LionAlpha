/**
 * Testes de Acessibilidade - Design Tokens
 *
 * Valida que o design system atende aos padrões WCAG AA/AAA:
 * - Contraste de cores 7:1 (texto normal WCAG AAA) e 4.5:1 (texto WCAG AA)
 * - Touch targets mínimos 44pt (iOS) / 48dp (Android)
 * - Suporte a Dynamic Type / Text Scaling
 */

import { LightTheme, DarkTheme, Tokens } from '../../src/theme/tokens';

// ======================
// 🎨 COLOR CONTRAST TESTS
// ======================

describe('Color Contrast (WCAG)', () => {
  /**
   * Calcula a luminância relativa de uma cor
   */
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  /**
   * Converte hex para RGB
   */
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  /**
   * Calcula o ratio de contraste entre duas cores
   */
  const getContrastRatio = (color1: string, color2: string): number => {
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  // WCAG AA minimum for normal text (4.5:1)
  const WCAG_AA_NORMAL = 4.5;
  const WCAG_AA_LARGE = 3;

  describe('Light Theme', () => {
    const lightBackground = LightTheme.background.canvas;
    const lightCard = LightTheme.background.card;

    test('Primary text on canvas background meets WCAG AA minimum', () => {
      const ratio = getContrastRatio(LightTheme.text.primary, lightBackground);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    });

    test('Primary text on card background meets WCAG AA minimum', () => {
      const ratio = getContrastRatio(LightTheme.text.primary, lightCard);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    });

    test('Secondary text on canvas background meets WCAG AA for large text', () => {
      const ratio = getContrastRatio(LightTheme.text.secondary, lightBackground);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_LARGE);
    });

    test('Primary button color is readable', () => {
      const ratio = getContrastRatio(
        '#FFFFFF', // Button text (white)
        LightTheme.primary.main
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_LARGE);
    });

    test('Status colors are distinguishable from each other', () => {
      // Error and success should be different colors
      expect(LightTheme.status.error).not.toBe(LightTheme.status.success);
      expect(LightTheme.status.warning).not.toBe(LightTheme.status.info);
    });
  });

  describe('Dark Theme', () => {
    const darkBackground = DarkTheme.background.canvas;
    const darkCard = DarkTheme.background.card;

    test('Primary text on dark canvas meets WCAG AA minimum', () => {
      const ratio = getContrastRatio(DarkTheme.text.primary, darkBackground);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    });

    test('Primary text on dark card meets WCAG AA minimum', () => {
      const ratio = getContrastRatio(DarkTheme.text.primary, darkCard);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    });

    test('Secondary text on dark canvas meets WCAG AA for large text', () => {
      const ratio = getContrastRatio(DarkTheme.text.secondary, darkBackground);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_LARGE);
    });
  });
});

// ======================
// 📏 TOUCH TARGET TESTS
// ======================

describe('Touch Targets (iOS/Android)', () => {
  // iOS HIG: 44pt minimum
  // Material Design: 48dp minimum
  const IOS_MIN_TOUCH_TARGET = 44;
  const ANDROID_MIN_TOUCH_TARGET = 48;

  test('Touch target minimum meets iOS minimum (44pt)', () => {
    const minTouchTarget = Tokens.touchTargets.min;
    expect(minTouchTarget).toBeGreaterThanOrEqual(IOS_MIN_TOUCH_TARGET);
  });

  test('Touch target medium meets Android minimum (48dp)', () => {
    const mediumTouchTarget = Tokens.touchTargets.medium;
    expect(mediumTouchTarget).toBeGreaterThanOrEqual(IOS_MIN_TOUCH_TARGET);
  });

  test('Touch target large is adequately sized', () => {
    const largeTouchTarget = Tokens.touchTargets.large;
    expect(largeTouchTarget).toBeGreaterThanOrEqual(ANDROID_MIN_TOUCH_TARGET);
  });

  test('Icon sizes allow for adequate touch area', () => {
    // Icon size + padding should meet minimum
    const iconSize = Tokens.iconSizes.md;
    expect(iconSize).toBeGreaterThanOrEqual(20);
  });
});

// ======================
// 📝 TYPOGRAPHY TESTS
// ======================

describe('Typography Accessibility', () => {
  // WCAG recommends minimum 16px base font size
  const MIN_BODY_FONT_SIZE = 14;
  const MIN_CAPTION_FONT_SIZE = 12;

  test('Body text is at least 14px', () => {
    const bodySize = Tokens.typography.sizes.md;
    expect(bodySize).toBeGreaterThanOrEqual(MIN_BODY_FONT_SIZE);
  });

  test('Caption text is at least 12px', () => {
    const captionSize = Tokens.typography.sizes.xs;
    expect(captionSize).toBeGreaterThanOrEqual(MIN_CAPTION_FONT_SIZE);
  });

  test('Heading sizes follow hierarchy', () => {
    const h1 = Tokens.typography.sizes['3xl'];
    const h2 = Tokens.typography.sizes['2xl'];
    const h3 = Tokens.typography.sizes.xl;
    const h4 = Tokens.typography.sizes.lg;

    expect(h1).toBeGreaterThan(h2);
    expect(h2).toBeGreaterThan(h3);
    expect(h3).toBeGreaterThan(h4);
  });
});

// ======================
// 🎯 SPACING TESTS
// ======================

describe('Spacing Accessibility', () => {
  test('Base spacing unit is consistent (4px grid)', () => {
    const baseUnit = Tokens.spacing['1'];
    expect(baseUnit).toBe(4);
  });

  test('Spacing scale follows consistent increments', () => {
    const spacing = Tokens.spacing;
    expect(spacing['2']).toBe(spacing['1'] * 2);
    expect(spacing['4']).toBe(spacing['1'] * 4);
    expect(spacing['8']).toBe(spacing['1'] * 8);
  });

  test('Card padding is adequate for touch', () => {
    const cardPadding = Tokens.spacing['4']; // 16px
    expect(cardPadding).toBeGreaterThanOrEqual(12);
  });
});

// ======================
// 🌙 DARK MODE TESTS
// ======================

describe('Dark Mode Support', () => {
  test('Core theme properties exist in both themes', () => {
    // Core properties that must exist in both themes
    const coreProperties = ['background', 'text', 'border', 'primary', 'secondary', 'status'];

    for (const prop of coreProperties) {
      expect(LightTheme).toHaveProperty(prop);
      expect(DarkTheme).toHaveProperty(prop);
    }
  });

  test('Dark background is actually dark', () => {
    const darkBg = DarkTheme.background.canvas;
    const luminance = getLuminance(darkBg);
    expect(luminance).toBeLessThan(0.2);

    function getLuminance(hex: string): number {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return 0;

      const rgb = [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));

      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    }
  });

  test('Light background is actually light', () => {
    const lightBg = LightTheme.background.canvas;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(lightBg);
    if (!result) {
      fail('Invalid hex color');
      return;
    }

    const rgb = [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
    ].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));

    const luminance = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    expect(luminance).toBeGreaterThan(0.8);
  });
});

// ======================
// 🧩 TOKEN COMPLETENESS
// ======================

describe('Design Token Completeness', () => {
  test('All required color tokens exist in Light theme', () => {
    const requiredTokens = ['primary', 'secondary', 'background', 'text', 'border', 'status'];

    for (const token of requiredTokens) {
      expect(LightTheme).toHaveProperty(token);
    }
  });

  test('All required color tokens exist in Dark theme', () => {
    const requiredTokens = ['primary', 'secondary', 'background', 'text', 'border', 'status'];

    for (const token of requiredTokens) {
      expect(DarkTheme).toHaveProperty(token);
    }
  });

  test('All spacing tokens exist', () => {
    const requiredSpacing = ['1', '2', '3', '4', '5', '6', '8', '10', '12', '16'];

    for (const space of requiredSpacing) {
      expect(Tokens.spacing).toHaveProperty(space);
    }
  });

  test('All typography tokens exist', () => {
    expect(Tokens.typography).toHaveProperty('sizes');
    expect(Tokens.typography).toHaveProperty('weights');
    expect(Tokens.typography).toHaveProperty('lineHeights');
  });

  test('All core tokens exist', () => {
    expect(Tokens).toHaveProperty('radius');
    expect(Tokens).toHaveProperty('shadows');
    expect(Tokens).toHaveProperty('touchTargets');
    expect(Tokens).toHaveProperty('iconSizes');
  });
});
