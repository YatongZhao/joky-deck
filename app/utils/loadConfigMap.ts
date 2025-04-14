import { CardLabels, ConfigMap, JokerCard, JokerCategory } from "@yatongzhao/joky-deck-core";
import { dynamicImport } from "./dynamicImport";

export const loadConfigMap = async (configUrl: string): Promise<ConfigMap> => {
  const url = new URL(configUrl);
  const getConfigMap = (await dynamicImport(url.toString())).getConfig as (param: {
    jokerCard: typeof JokerCard;
    jokerCategory: typeof JokerCategory;
    cardLabels: typeof CardLabels;
  }) => ConfigMap;
  
  const configMap = getConfigMap({
    jokerCard: JokerCard,
    jokerCategory: JokerCategory,
    cardLabels: CardLabels,
  });
  for (const key in configMap) {
    const config = configMap[key];
    for (const joker of config.jokers) {
      joker.metadata.image = new URL(joker.metadata.image, url.toString()).toString();
    }
  }
  return configMap;
};

