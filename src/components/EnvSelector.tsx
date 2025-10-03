import React from "react";
import { Text, Box } from "ink";
import { useStore } from "@nanostores/react";
import SelectInput from "ink-select-input";
import figures from "figures";
import {
  envFiles,
  activePanel,
  showCommandModal,
  highlightedEnv,
  highlightedIndex,
  leftPanelWidth,
  setHighlightedEnv,
} from "../stores.js";
import type { EnvFile } from "../types.js";

interface EnvSelectorProps {
  onSelect: (file: EnvFile) => void;
}

export function EnvSelector({ onSelect }: EnvSelectorProps) {
  const files = useStore(envFiles);
  const panel = useStore(activePanel);
  const modal = useStore(showCommandModal);
  const highlighted = useStore(highlightedEnv);
  const index = useStore(highlightedIndex);
  const width = useStore(leftPanelWidth);

  const isActive = panel === "selector" && !modal;

  const items = files.map((file, index) => ({
    key: `env-${index}`,
    label: file.name,
    value: file,
  }));

  return (
    <Box flexDirection="column" width={width} paddingRight={1}>
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
            initialIndex={index}
            onSelect={(item) => onSelect(item.value)}
            onHighlight={(item) => setHighlightedEnv(item.value)}
            isFocused={isActive}
          />
        ) : (
          <Box flexDirection="column">
            {items.map((item) => {
              const isHighlighted = highlighted?.path === item.value.path;
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
