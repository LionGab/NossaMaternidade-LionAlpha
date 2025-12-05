/**
 * Row Component - Layout primitive
 * Componente para layout horizontal com espaçamento consistente entre filhos
 */

import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';

import { Spacing } from '@/theme/tokens';

export interface RowProps extends Omit<ViewProps, 'style'> {
  children: React.ReactNode;
  space?: keyof typeof Spacing;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justify?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  wrap?: boolean;
  divider?: React.ReactElement;
  style?: ViewStyle;
}

export function Row({
  children,
  space = '4',
  align = 'center',
  justify = 'flex-start',
  wrap = false,
  divider,
  style,
  ...props
}: RowProps) {
  const spacing = Spacing[space];

  // Convert children to array and filter out null/undefined
  const childArray = React.Children.toArray(children).filter(Boolean);

  const computedStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    ...style,
  };

  return (
    <View style={computedStyle} {...props}>
      {childArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {divider && index < childArray.length - 1 && (
            <View style={{ marginHorizontal: spacing / 2 }}>{divider}</View>
          )}
          {!divider && index < childArray.length - 1 && <View style={{ width: spacing }} />}
        </React.Fragment>
      ))}
    </View>
  );
}
