/**
 * Stack Component - Layout primitive
 * Componente para layout vertical com espaçamento consistente entre filhos
 */

import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';

import { Spacing } from '@/theme/tokens';

export interface StackProps extends Omit<ViewProps, 'style'> {
  children: React.ReactNode;
  space?: keyof typeof Spacing;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  divider?: React.ReactElement;
  style?: ViewStyle;
}

export function Stack({
  children,
  space = '4',
  align = 'stretch',
  justify = 'flex-start',
  divider,
  style,
  ...props
}: StackProps) {
  const spacing = Spacing[space];

  // Convert children to array and filter out null/undefined
  const childArray = React.Children.toArray(children).filter(Boolean);

  const computedStyle: ViewStyle = {
    flexDirection: 'column',
    alignItems: align,
    justifyContent: justify,
    ...style,
  };

  return (
    <View style={computedStyle} {...props}>
      {childArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {divider && index < childArray.length - 1 && (
            <View style={{ marginVertical: spacing / 2 }}>{divider}</View>
          )}
          {!divider && index < childArray.length - 1 && <View style={{ height: spacing }} />}
        </React.Fragment>
      ))}
    </View>
  );
}
