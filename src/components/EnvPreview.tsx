import React from "react";
import { Text, Box } from "ink";
import { readFileSync } from "node:fs";

interface EnvPreviewProps {
  filePath: string | null;
  scrollOffset?: number;
  isActive?: boolean;
  maxHeight?: number;
}

export function EnvPreview({
  filePath,
  scrollOffset = 0,
  isActive = false,
  maxHeight,
}: EnvPreviewProps) {
  if (!filePath) {
    return (
      <Box flexDirection="column" flexGrow={1} paddingLeft={1}>
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor="gray"
          padding={1}
          flexGrow={1}
        >
          <Text color="gray">No file selected</Text>
        </Box>
      </Box>
    );
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const totalLines = lines.length;

    // Calculate visible lines
    const visibleHeight = maxHeight ? maxHeight - 8 : lines.length; // Subtract for borders, title, and footer
    const visibleLines = lines.slice(
      scrollOffset,
      scrollOffset + visibleHeight,
    );

    const canScrollUp = scrollOffset > 0;
    const canScrollDown = scrollOffset + visibleHeight < totalLines;

    return (
      <Box flexDirection="column" flexGrow={1} paddingLeft={1}>
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor={isActive ? "yellow" : "cyan"}
          padding={1}
          flexGrow={1}
        >
          <Box marginBottom={1} justifyContent="space-between">
            <Text bold color="cyan">
              Preview:
            </Text>
            {maxHeight && (
              <Text dimColor>
                {scrollOffset + 1}-
                {Math.min(scrollOffset + visibleHeight, totalLines)} /{" "}
                {totalLines}
              </Text>
            )}
          </Box>
          <Box flexDirection="column" overflow="hidden">
            {visibleLines.map((line, index) => {
              const isComment = line.trim().startsWith("#");
              const isEmpty = line.trim() === "";
              const isVariable = line.includes("=") && !isComment;

              if (isComment) {
                return (
                  <Text key={scrollOffset + index} color="gray">
                    {line || " "}
                  </Text>
                );
              }

              if (isEmpty) {
                return <Text key={scrollOffset + index}> </Text>;
              }

              if (isVariable) {
                const [key, ...valueParts] = line.split("=");
                const value = valueParts.join("=");
                return (
                  <Text key={scrollOffset + index}>
                    <Text color="cyan">{key}</Text>
                    <Text color="white">=</Text>
                    <Text color="yellow">{value}</Text>
                  </Text>
                );
              }

              return (
                <Text key={scrollOffset + index} color="white">
                  {line}
                </Text>
              );
            })}
          </Box>
          {(canScrollUp || canScrollDown) && (
            <Box marginTop={1}>
              <Text dimColor>
                {canScrollUp && "↑ "}
                {canScrollDown && "↓"}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  } catch (error) {
    return (
      <Box flexDirection="column" flexGrow={1} paddingLeft={1}>
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor="red"
          padding={1}
          flexGrow={1}
        >
          <Text color="red">Error reading file</Text>
        </Box>
      </Box>
    );
  }
}
