export const aiCharacters = [
  {
    id: 'woman-kente',
    expressions: {
      happy: require('../../assets/my-corner-ai/characters/expressions/woman-kente-happy.png'),
      blink: require('../../assets/my-corner-ai/characters/expressions/woman-kente-blink.png'),
      speaking: require('../../assets/my-corner-ai/characters/expressions/woman-kente-speaking.png'),
      surprised: require('../../assets/my-corner-ai/characters/expressions/woman-kente-surprised.png'),
    },
    displayName: 'Ebony',
    label: 'Ebony, My Corner AI character',
    full: require('../../assets/my-corner-ai/characters/character-woman-kente.png'),
    portrait: require('../../assets/my-corner-ai/characters/portraits/character-woman-kente-portrait.png'),
  },
  {
    id: 'older-man',
    expressions: {
      happy: require('../../assets/my-corner-ai/characters/expressions/older-man-happy.png'),
      blink: require('../../assets/my-corner-ai/characters/expressions/older-man-blink.png'),
      speaking: require('../../assets/my-corner-ai/characters/expressions/older-man-speaking.png'),
      surprised: require('../../assets/my-corner-ai/characters/expressions/older-man-surprised.png'),
    },
    displayName: 'Mr. Owusu',
    label: 'Mr. Owusu, My Corner AI character',
    full: require('../../assets/my-corner-ai/characters/character-older-man.png'),
    portrait: require('../../assets/my-corner-ai/characters/portraits/character-older-man-portrait.png'),
  },
  {
    id: 'young-man',
    expressions: {
      happy: require('../../assets/my-corner-ai/characters/expressions/young-man-happy.png'),
      blink: require('../../assets/my-corner-ai/characters/expressions/young-man-blink.png'),
      speaking: require('../../assets/my-corner-ai/characters/expressions/young-man-speaking.png'),
      surprised: require('../../assets/my-corner-ai/characters/expressions/young-man-surprised.png'),
    },
    displayName: 'Ekow',
    label: 'Ekow, My Corner AI character',
    full: require('../../assets/my-corner-ai/characters/character-young-man.png'),
    portrait: require('../../assets/my-corner-ai/characters/portraits/character-young-man-portrait.png'),
  },
  {
    id: 'woman-purple',
    expressions: {
      happy: require('../../assets/my-corner-ai/characters/expressions/woman-purple-happy.png'),
      blink: require('../../assets/my-corner-ai/characters/expressions/woman-purple-blink.png'),
      speaking: require('../../assets/my-corner-ai/characters/expressions/woman-purple-speaking.png'),
      surprised: require('../../assets/my-corner-ai/characters/expressions/woman-purple-surprised.png'),
    },
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
