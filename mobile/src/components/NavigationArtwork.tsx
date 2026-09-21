import { createIconSet } from '@expo/vector-icons';

// Traced from the founder's Hire and Neighborhood artwork. The bundled font
// preserves transparent cutouts and uses the same color/size API as Ionicons.
export const NavigationArtwork = createIconSet(
  { hire: 0xe900, neighborhood: 0xe901 },
  'MyCornerNavigation',
  require('../../assets/navigation/MyCornerNavigation.ttf'),
);
