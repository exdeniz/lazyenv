#!/usr/bin/env node

import React, { useState, useEffect } from "react";
import { render, Text, Box, useInput, useApp, useStdout } from "ink";
import { copyFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { cwd } from "node:process";
import { scanEnvFiles } from "./env-scanner.js";
import { scanPackageScripts } from "./package-scanner.js";
import { EnvSelector } from "./components/EnvSelector.js";
import { CommandModal } from "./components/CommandModal.js";
import { EnvPreview } from "./components/EnvPreview.js";
import type { EnvFile, Command } from "./types.js";

type AppState = "loading" | "selectEnv" | "running" | "done" | "error";

function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [state, setState] = useState<AppState>("loading");
  const [envFiles, setEnvFiles] = useState<EnvFile[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<EnvFile | null>(null);
  const [highlightedEnv, setHighlightedEnv] = useState<EnvFile | null>(null);
  const [error, setError] = useState<string>("");
  const [terminalHeight, setTerminalHeight] = useState(stdout?.rows || 24);
  const [activePanel, setActivePanel] = useState<"selector" | "preview">(
    "selector",
  );
  const [previewScroll, setPreviewScroll] = useState(0);
  const [showCommandModal, setShowCommandModal] = useState(false);

  // Calculate dynamic width for left panel based on longest file name
  const leftPanelWidth = React.useMemo(() => {
    if (envFiles.length === 0) return 30;

    const maxFileNameLength = Math.max(
      ...envFiles.map((file) => file.name.length),
    );
    const titleLength = "Select .env file:".length;

    // Take the longest between file names and title, add padding for borders and margins
    const contentWidth = Math.max(maxFileNameLength, titleLength) + 8;
    const minWidth = 25;
    const maxWidth = 50;

    return Math.max(Math.min(contentWidth, maxWidth), minWidth);
  }, [envFiles]);

  // Handle keyboard input
  useInput((input, key) => {
    // Exit on q or Ctrl+C
    if (input === "q" || (key.ctrl && input === "c")) {
      exit();
      return;
    }

    // Close modal on Esc
    if (key.escape && showCommandModal) {
      setShowCommandModal(false);
      return;
    }

    // Only handle panel switching and scrolling in selectEnv state
    if (state !== "selectEnv" || showCommandModal) return;

    // Switch panels with Tab
    if (key.tab) {
      setActivePanel((prev) => (prev === "selector" ? "preview" : "selector"));
      return;
    }

    // Handle preview mode
    if (activePanel === "preview") {
      // Enter selects the highlighted file
      if (key.return && highlightedEnv) {
        handleEnvSelect(highlightedEnv);
        return;
      }

      if (key.upArrow) {
        setPreviewScroll((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setPreviewScroll((prev) => prev + 1);
      }
    }
  });

  useEffect(() => {
    const handleResize = () => {
      if (stdout) {
        setTerminalHeight(stdout.rows);
      }
    };

    if (stdout) {
      stdout.on("resize", handleResize);
    }

    return () => {
      if (stdout) {
        stdout.off("resize", handleResize);
      }
    };
  }, [stdout]);

  useEffect(() => {
    async function init() {
      try {
        const currentDir = cwd();
        const files = await scanEnvFiles(currentDir);

        if (files.length === 0) {
          setError("No .env.* files found in current directory");
          setState("error");
          return;
        }

        const scripts = await scanPackageScripts(currentDir);

        setEnvFiles(files);
        setCommands(scripts);
        setHighlightedEnv(files[0] || null);
        setState("selectEnv");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setState("error");
      }
    }

    init();
  }, []);

  // Reset scroll when highlighted file changes
  useEffect(() => {
    setPreviewScroll(0);
  }, [highlightedEnv]);

  const handleEnvSelect = async (file: EnvFile) => {
    try {
      setSelectedEnv(file);
      const targetPath = `${cwd()}/.env`;
      await copyFile(file.path, targetPath);

      if (commands.length > 1) {
        setShowCommandModal(true);
      } else if (commands.length === 1) {
        runCommand(commands[0]);
      } else {
        setState("done");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to copy .env file");
      setState("error");
    }
  };

  const handleCommandSelect = (command: Command) => {
    setShowCommandModal(false);
    runCommand(command);
  };

  const handleCloseModal = () => {
    setShowCommandModal(false);
  };

  const runCommand = (command: Command) => {
    setState("running");

    // Clear screen and exit alternate screen buffer before running command
    process.stdout.write("\x1b[?1049l"); // Exit alternate screen
    process.stdout.write("\x1b[2J\x1b[3J\x1b[H"); // Clear screen

    const [cmd, ...args] = command.command.split(" ");
    const child = spawn(cmd, args, {
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      process.exit(code ?? 0);
    });

    child.on("error", (err) => {
      console.error(`Failed to run command: ${err.message}`);
      process.exit(1);
    });
  };

  if (state === "loading") {
    return (
      <Box>
        <Text color="yellow">Loading...</Text>
      </Box>
    );
  }

  if (state === "error") {
    return (
      <Box>
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (state === "selectEnv") {
    const hints =
      activePanel === "selector"
        ? "↑↓: Navigate | Enter: Select | Tab: Switch to Preview | q: Quit"
        : "↑↓: Scroll | Tab: Switch to Selector | q: Quit";

    return (
      <Box
        flexDirection="column"
        width="100%"
        height={terminalHeight}
        borderStyle="round"
        borderColor="white"
        padding={1}
      >
        <Box flexDirection="row" flexGrow={1}>
          <Box width={leftPanelWidth}>
            <EnvSelector
              envFiles={envFiles}
              onSelect={handleEnvSelect}
              onHighlight={setHighlightedEnv}
              isActive={activePanel === "selector" && !showCommandModal}
              highlightedFile={highlightedEnv}
            />
          </Box>
          <Box flexGrow={1}>
            <EnvPreview
              filePath={highlightedEnv?.path || null}
              scrollOffset={previewScroll}
              isActive={activePanel === "preview" && !showCommandModal}
              maxHeight={terminalHeight - 4}
            />
          </Box>
        </Box>
        <Box borderStyle="single" borderColor="gray" paddingX={1} marginTop={1}>
          <Text dimColor>{hints}</Text>
        </Box>
        {showCommandModal && (
          <CommandModal
            commands={commands}
            onSelect={handleCommandSelect}
            onClose={handleCloseModal}
          />
        )}
      </Box>
    );
  }

  if (state === "running") {
    return (
      <Box>
        <Text color="green">Running command...</Text>
      </Box>
    );
  }

  if (state === "done") {
    return (
      <Box>
        <Text color="green">✓ Done! {selectedEnv?.name} copied to .env</Text>
      </Box>
    );
  }

  return null;
}

// Clear screen and enter alternate screen buffer
process.stdout.write("\x1b[2J\x1b[3J\x1b[H\x1b[?1049h");

const { waitUntilExit } = render(<App />, {
  exitOnCtrlC: false,
  patchConsole: false,
});

// Clean up on exit
waitUntilExit().then(() => {
  // Exit alternate screen buffer
  process.stdout.write("\x1b[?1049l");
});
