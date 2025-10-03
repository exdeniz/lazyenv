import React from "react";
import { Text, Box } from "ink";
import SelectInput from "ink-select-input";
import figures from "figures";
import type { EnvFile } from "../types.js";

interface EnvSelectorProps {
  envFiles: EnvFile[];
  onSelect: (file: EnvFile) => void;
  onHighlight?: (file: EnvFile) => void;
  isActive?: boolean;
  highlightedFile?: EnvFile | null;
}

export function EnvSelector({
  envFiles,
  onSelect,
  onHighlight,
  isActive = true,
  highlightedFile,
}: EnvSelectorProps) {
  const items = envFiles.map((file, index) => ({
    key: `env-${index}`,
    label: file.name,
    value: file,
  }));

  return (
    <Box flexDirection="column" flexGrow={1} paddingRight={1}>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={isActive ? "green" : "gray"}
        padding={1}
        flexGrow={1}
      >
        <Box marginBottom={1}>
          <Text bold color="cyan">
            Select .env file:
          </Text>
        </Box>
        {isActive ? (
          <SelectInput
            items={items}
            onSelect={(item) => onSelect(item.value)}
            onHighlight={
              onHighlight ? (item) => onHighlight(item.value) : undefined
            }
            isFocused={isActive}
          />
        ) : (
          <Box flexDirection="column">
            {items.map((item) => {
              const isHighlighted = highlightedFile?.path === item.value.path;
              return (
                <Box key={item.key} flexDirection="row">
                  <Text color={isHighlighted ? "cyan" : "gray"}>
                    {isHighlighted ? `${figures.pointer} ` : "  "}
                  </Text>
                  <Text
                    color={isHighlighted ? "cyan" : "gray"}
                    bold={isHighlighted}
                  >
                    {item.label}
                  </Text>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
