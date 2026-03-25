import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { useLinkBuilder } from '@react-navigation/native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const TAB_LABELS: Record<string, string> = {
  '(store)': 'Home',
  '(seller)': 'Sellers',
  '(cart)': 'Cart',
  '(order)': 'Orders',
  '(charity)': 'Charity',
  '(me)': 'Me',
};

function AnimatedTabItem({
  route,
  isFocused,
  options,
  onPress,
  onLongPress,
  href,
}: {
  route: any;
  isFocused: boolean;
  options: any;
  onPress: () => void;
  onLongPress: () => void;
  href?: string;
}) {
  const scale = useSharedValue(1);
  const pillWidth = useSharedValue(0);
  const pillOpacity = useSharedValue(0);

  useEffect(() => {
    if (isFocused) {
      scale.value = withSpring(1.1, { damping: 12, stiffness: 220 });
      pillWidth.value = withSpring(32, { damping: 18, stiffness: 220 });
      pillOpacity.value = withTiming(1, { duration: 180 });
    } else {
      scale.value = withSpring(1, { damping: 12, stiffness: 220 });
      pillWidth.value = withSpring(0, { damping: 18, stiffness: 220 });
      pillOpacity.value = withTiming(0, { duration: 130 });
    }
  }, [isFocused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    width: pillWidth.value,
    opacity: pillOpacity.value,
  }));

  const label = TAB_LABELS[route.name] || route.name;
  const Icon = options.tabBarIcon?.({
    focused: isFocused,
    color: isFocused ? '#4289AB' : '#B0BAC4',
    size: 22,
  });

  return (
    <PlatformPressable
      href={href}
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarButtonTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}>
      <Animated.View style={iconStyle}>{Icon}</Animated.View>
      <Animated.View style={[styles.activePill, pillStyle]} />
      <Text
        style={[
          styles.tabLabel,
          { color: isFocused ? '#4289AB' : '#B0BAC4' },
          isFocused && styles.tabLabelActive,
        ]}>
        {label}
      </Text>
    </PlatformPressable>
  );
}

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { buildHref } = useLinkBuilder();

  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        if ((options as any).href === null || route.name === '(cart)') return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <AnimatedTabItem
            key={route.name}
            route={route}
            isFocused={isFocused}
            options={options}
            onPress={onPress}
            onLongPress={onLongPress}
            href={buildHref(route.name, route.params)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E4ECF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minWidth: 56,
    gap: 3,
  },
  activePill: {
    height: 3,
    borderRadius: 99,
    backgroundColor: '#4289AB',
  },
  tabLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    marginTop: 1,
  },
  tabLabelActive: {
    fontFamily: 'Poppins_600SemiBold',
  },
});
