import { useState } from "react";
import { ActionIcon, Modal, Table, Text, Group, Kbd } from "@mantine/core";
import { HelpCircle } from "lucide-react";

// Merged shortcut definitions
const SHORTCUTS = [
  { keys: [["mod", "z"]], description: "Undo" },
  { keys: [["mod", "shift", "z"]], description: "Redo" },
  { keys: [["space"]], description: "Play/Pause timeline" },
  { keys: [["a"]], description: "Enter add gear mode" },
  { keys: [["esc"]], description: "Exit current mode" },
  { keys: [["d"], ["delete"], ["backspace"]], description: "Delete selected gear and its descendants" },
];

export const HelpShortcuts = () => {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={<Text fw={700} fz="lg">Keyboard Shortcuts</Text>} size="lg" centered>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Shortcut</Table.Th>
              <Table.Th>Description</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {SHORTCUTS.map((item, idx) => (
              <Table.Tr key={idx}>
                <Table.Td>
                  <Group gap={4}>
                    {item.keys.map((combo, i) => (
                      <Group key={i} gap={2} align="center">
                        {combo.map((key, j) => (
                          <Kbd key={j}>{key}</Kbd>
                        ))}
                        {i < item.keys.length - 1 && <Text span c="gray">/</Text>}
                      </Group>
                    ))}
                  </Group>
                </Table.Td>
                <Table.Td>{item.description}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Modal>
      <ActionIcon variant="light" c="dark" onClick={() => setOpened(true)}>
        <HelpCircle size={16} />
      </ActionIcon>
    </>
  );
}; 