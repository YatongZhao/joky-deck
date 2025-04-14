import { ConfigMap, JokerCard, JokerCategory } from "@yatongzhao/joky-deck-core";
import { dynamicImport } from "./dynamicImport";

export const loadConfigMap = async (configUrl: string): Promise<ConfigMap> => {
  const url = new URL(configUrl);
  const getConfigMap = (await dynamicImport(url.toString())).getConfig as (jokerCard: typeof JokerCard, jokerCategory: typeof JokerCategory) => ConfigMap;
  return getConfigMap(JokerCard, JokerCategory);
};
