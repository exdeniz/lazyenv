import React from "react";
import { Text, Box } from "ink";
import SelectInput from "ink-select-input";
import type { Command } from "../types.js";

interface CommandSelectorProps {
  commands: Command[];
  onSelect: (command: Command) => void;
}

export function CommandSelector({ commands, onSelect }: CommandSelectorProps) {
  const items = commands.map((cmd, index) => ({
    key: `cmd-${index}`,
    label: `${cmd.name} (${cmd.command})`,
    value: cmd,
  }));

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="green">
          Select command to run:
        </Text>
      </Box>
      <SelectInput items={items} onSelect={(item) => onSelect(item.value)} />
    </Box>
  );
}
