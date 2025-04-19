import { Accordion, Box, Button, Group, SegmentedControl, Stack, TextInput } from "@mantine/core"
import { useForm } from '@mantine/form';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadConfigMap } from "../utils/loadConfigMap";
import { Config, ConfigMap } from "@yatongzhao/joky-deck-core";
import { PanelButton } from "../components/PanelButton";
import { DevJokers, DevPlayingCards } from "./DevJokers";

const defaultConfigUrl = 'https://yatongzhao.github.io/joky-deck-dataset-balatro/js/config.js';
export const HomeScene: React.FC<{ onStart?: (config: Config) => void }> = ({ onStart }) => {
  const [configs, setConfigs] = useState<{ name: string, config: Config }[]>([]);
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      configUrl: defaultConfigUrl,
    },
  });

  const valueRef = useRef<string>(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const loadGameConfig = useCallback(async (configUrl: string) => {
    setLoading(true);
    const configMap = await loadConfigMap(configUrl) as ConfigMap;
    const configs = [];
    for (const config in configMap) {
      configs.push({ name: config, config: configMap[config] });
    }
    setConfigs(configs);
    if (!valueRef.current && configs.length > 0) {
      setValue(configs[0].name);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadGameConfig(defaultConfigUrl);
  }, [loadGameConfig]);

  const handleSubmit = async (values: { configUrl: string }) => {
    await loadGameConfig(values.configUrl);
  }

  const config = useMemo(() => {
    return configs.find(config => config.name === value)?.config;
  }, [configs, value]);

  const handleStart = () => {
    const config = configs.find(config => config.name === value);
    if (onStart && config) {
      onStart(config.config);
    }
  }

  return <Stack align="center" justify="center" mt={100} w={600}>
    <PanelButton onClick={handleStart} buttonColor="blue" w="100%" h={60} fz={28}>Start Game</PanelButton>
    <Box w="100%" h={40}>
      <SegmentedControl
        fullWidth
        value={value}
        onChange={setValue}
        orientation="vertical"
        data={configs.map(config => config.name)}
        disabled={loading}
      />
    </Box>
    <Accordion w="100%">
      <Accordion.Item value="config">
        <Accordion.Control style={{ textAlign: 'center' }}>Config</Accordion.Control>
        <Accordion.Panel styles={{ content: { padding: 0 } }}>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack w={600} gap="xs">
              <TextInput label="Config URL" {...form.getInputProps('configUrl')} />
              <Group justify="flex-end">
                <Button type="submit" fullWidth variant="light">Submit</Button>
              </Group>
            </Stack>
          </form>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
    {config && <Box pb={100}>
      <DevJokers config={config} />
      <DevPlayingCards config={config} />
    </Box>}
  </Stack>
}
