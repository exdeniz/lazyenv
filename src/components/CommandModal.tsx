import React from "react";
import { Text, Box } from "ink";
import SelectInput from "ink-select-input";
import type { Command } from "../types.js";

interface CommandModalProps {
  commands: Command[];
  onSelect: (command: Command) => void;
  onClose: () => void;
}

export function CommandModal({
  commands,
  onSelect,
  onClose,
}: CommandModalProps) {
  const items = commands.map((cmd, index) => ({
    key: `cmd-${index}`,
    label: cmd.name,
    value: cmd,
  }));

  return (
    <Box
      flexDirection="column"
      position="absolute"
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
    >
      {/* Backdrop */}
      <Box
        position="absolute"
        width="100%"
        height="100%"
        flexDirection="column"
      />

      {/* Modal */}
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="yellow"
        padding={1}
        minWidth={50}
        backgroundColor={"black"}
      >
        <Box marginBottom={1}>
          <Text bold color="yellow">
            Select command to run:
          </Text>
        </Box>
        <SelectInput
          items={items}
          onSelect={(item) => onSelect(item.value)}
          isFocused={true}
        />
        <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
          <Text dimColor>Esc: Cancel | Enter: Select</Text>
        </Box>
      </Box>
    </Box>
  );
}
