import { cloneElement, type ReactElement } from 'react';
import { Link, router, type Href } from 'expo-router';
import { Platform, type PressableProps } from 'react-native';

type WebSafeLinkProps = {
  asChild: true;
  children: ReactElement<PressableProps>;
  href: Href;
};

export function WebSafeLink({ children, href }: WebSafeLinkProps) {
  if (Platform.OS === 'web') {
    const onPress: PressableProps['onPress'] = (event) => {
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
