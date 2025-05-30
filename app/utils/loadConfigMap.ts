import { CardLabels, ConfigMap, Enhancements, GetConfigParam, JokerCard, JokerCategory, Suits, Value, ValueType } from "@yatongzhao/joky-deck-core";
import { dynamicImport } from "./dynamicImport";

export const loadConfigMap = async (configUrl: string): Promise<ConfigMap> => {
  const url = new URL(configUrl);
  const getConfigMap = (await dynamicImport(url.toString())).getConfig as (param: GetConfigParam) => ConfigMap;
  
  const configMap = getConfigMap({
    jokerCard: JokerCard,
    jokerCategory: JokerCategory,
    cardLabels: CardLabels,
    valueType: ValueType,
    Value,
    suits: Suits,
    style: 'joker',
    enhancements: Enhancements,
  });
  for (const key in configMap) {
    const config = configMap[key]!;
    for (const joker of config.jokers) {
      joker.metadata.image = new URL(joker.metadata.image, url.toString()).toString();
    }
  }
  return configMap;
};
