export const aiCharacters = [
  {
    id: 'woman-kente',
    displayName: 'Ebony',
    label: 'Ebony, My Corner AI character',
    full: require('../../assets/my-corner-ai/characters/character-woman-kente.png'),
    portrait: require('../../assets/my-corner-ai/characters/portraits/character-woman-kente-portrait.png'),
  },
  {
    id: 'older-man',
    displayName: 'Mr. Owusu',
    label: 'Mr. Owusu, My Corner AI character',
    full: require('../../assets/my-corner-ai/characters/character-older-man.png'),
    portrait: require('../../assets/my-corner-ai/characters/portraits/character-older-man-portrait.png'),
  },
  {
    id: 'young-man',
    displayName: 'Ekow',
    label: 'Ekow, My Corner AI character',
    full: require('../../assets/my-corner-ai/characters/character-young-man.png'),
    portrait: require('../../assets/my-corner-ai/characters/portraits/character-young-man-portrait.png'),
  },
  {
    id: 'woman-purple',
    displayName: 'Mama G.',
    label: 'Mama G., My Corner AI character',
    full: require('../../assets/my-corner-ai/characters/character-woman-purple.png'),
    portrait: require('../../assets/my-corner-ai/characters/portraits/character-woman-purple-portrait.png'),
  },
] as const;
export type AICharacterId = (typeof aiCharacters)[number]['id'];
export type AICharacter = (typeof aiCharacters)[number];
export const defaultAICharacter = aiCharacters[0];
export function findAICharacter(value: unknown): AICharacter {
  return aiCharacters.find((character) => character.id === value) ?? defaultAICharacter;
}
