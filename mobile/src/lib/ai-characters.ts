export const aiCharacters = [
  {
    id: 'woman-kente',
    label: 'Woman in kente',
    full: require('../../assets/my-corner-ai/characters/character-woman-kente.png'),
    portrait: require('../../assets/my-corner-ai/characters/portraits/character-woman-kente-portrait.png'),
  },
  {
    id: 'older-man',
    label: 'Older man in kente',
    full: require('../../assets/my-corner-ai/characters/character-older-man.png'),
    portrait: require('../../assets/my-corner-ai/characters/portraits/character-older-man-portrait.png'),
  },
  {
    id: 'young-man',
    label: 'Young man in gold',
    full: require('../../assets/my-corner-ai/characters/character-young-man.png'),
    portrait: require('../../assets/my-corner-ai/characters/portraits/character-young-man-portrait.png'),
  },
  {
    id: 'woman-purple',
    label: 'Woman in purple',
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
