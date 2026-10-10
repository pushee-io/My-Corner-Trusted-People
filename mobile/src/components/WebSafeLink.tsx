import { cloneElement, type ReactElement } from 'react';
import { Link, router, type Href } from 'expo-router';
import { Platform, type PressableProps } from 'react-native';

type WebSafeLinkProps = {
  asChild: true;
  children: ReactElement<PressableProps>;
  href: Href;
};

export function WebSafeLink({ children, href }: WebSafeLinkProps) {
  // Expo's native Link slot flattens function-valued styles as objects, dropping
  // the Pressable background/layout. Keep the Pressable as owner of that style.
  if (Platform.OS === 'web' || typeof children.props.style === 'function') {
    const onPress: PressableProps['onPress'] = (event) => {
      if (children.props.disabled) return;
      children.props.onPress?.(event);
      router.push(href);
    };

    return cloneElement(children, { onPress });
  }

  return (
    <Link asChild href={href}>
      {children}
    </Link>
  );
}
