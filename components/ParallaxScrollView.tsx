import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
}>;

export default function ParallaxScrollView({ children, headerImage }: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <View style={ps.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}>
        <Animated.View style={[headerAnimatedStyle, ps.header]}>
          {headerImage}
        </Animated.View>

        <View style={ps.content}>{children}</View>
      </Animated.ScrollView>
    </View>
  );
}

const ps = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 250, overflow: 'hidden' },
  content: { flex: 1, gap: 16, overflow: 'hidden' },
});
