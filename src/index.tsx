#!/usr/bin/env node

import React, { useEffect } from "react";
import { render, Text, Box, useInput, useApp, useStdout } from "ink";
import { useStore } from "@nanostores/react";
import { copyFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { cwd } from "node:process";
import { scanEnvFiles } from "./env-scanner.js";
import { scanPackageScripts } from "./package-scanner.js";
import { EnvSelector } from "./components/EnvSelector.js";
import { CommandModal } from "./components/CommandModal.js";
import { EnvPreview } from "./components/EnvPreview.js";
import type { EnvFile, Command } from "./types.js";
import {
  appState,
  error,
  commands,
  selectedEnv,
  highlightedEnv,
  activePanel,
  showCommandModal,
  terminalHeight,
  setAppState,
  setError,
  setEnvFiles,
  setCommands,
  setSelectedEnv,
  toggleActivePanel,
  scrollPreview,
  setShowCommandModal,
  setTerminalHeight,
} from "./stores.js";

function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();

  // Subscribe only to stores needed for rendering
  const state = useStore(appState);
  const errorMsg = useStore(error);
  const modal = useStore(showCommandModal);
  const selected = useStore(selectedEnv);
  const height = useStore(terminalHeight);

  // Handle keyboard input
  useInput((input, key) => {
    // Exit on q or Ctrl+C
    if (input === "q" || (key.ctrl && input === "c")) {
      exit();
      return;
    }

    // Close modal on Esc
    if (key.escape && showCommandModal.get()) {
      setShowCommandModal(false);
      return;
    }

    // Only handle panel switching and scrolling in selectEnv state
    if (appState.get() !== "selectEnv" || showCommandModal.get()) return;

    // Switch panels with Tab
    if (key.tab) {
      toggleActivePanel();
      return;
    }

    // Handle preview mode
    if (activePanel.get() === "preview") {
      const current = highlightedEnv.get();
      // Enter selects the highlighted file
      if (key.return && current) {
        handleEnvSelect(current);
        return;
      }

      if (key.upArrow) {
        scrollPreview(-1);
      } else if (key.downArrow) {
        scrollPreview(1);
      }
    }
  });

  useEffect(() => {
    if (stdout) {
      setTerminalHeight(stdout.rows);

      const handleResize = () => {
        setTerminalHeight(stdout.rows);
      };

      stdout.on("resize", handleResize);

      return () => {
        stdout.off("resize", handleResize);
      };
    }
  }, [stdout]);

  useEffect(() => {
    async function init() {
      try {
        const currentDir = cwd();
        const files = await scanEnvFiles(currentDir);

        if (files.length === 0) {
          setError("No .env.* files found in current directory");
          setAppState("error");
          return;
        }

        const scripts = await scanPackageScripts(currentDir);

        setEnvFiles(files);
        setCommands(scripts);
        setAppState("selectEnv");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setAppState("error");
      }
    }

    init();
  }, []);

  const handleEnvSelect = async (file: EnvFile) => {
    try {
      setSelectedEnv(file);
      const targetPath = `${cwd()}/.env`;
      await copyFile(file.path, targetPath);

      const cmds = commands.get();
      if (cmds.length > 1) {
        setShowCommandModal(true);
      } else if (cmds.length === 1) {
        runCommand(cmds[0]);
      } else {
        setAppState("done");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to copy .env file");
      setAppState("error");
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
    setAppState("running");

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
        <Text color="red">Error: {errorMsg}</Text>
      </Box>
    );
  }

  if (state === "selectEnv") {
    const panel = activePanel.get();
    const hints =
      panel === "selector"
        ? "↑↓: Navigate | Enter: Select | Tab: Switch to Preview | q: Quit"
        : "↑↓: Scroll | Tab: Switch to Selector | q: Quit";

    return (
      <Box
        flexDirection="column"
        width="100%"
        height={height}
        borderStyle="round"
        borderColor="white"
        padding={1}
      >
        <Box flexDirection="row" flexGrow={1}>
          <EnvSelector onSelect={handleEnvSelect} />
          <EnvPreview maxHeight={height - 4} />
        </Box>
        <Box borderStyle="single" borderColor="gray" paddingX={1} marginTop={1}>
          <Text dimColor>{hints}</Text>
        </Box>
        {modal && (
          <CommandModal
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
        <Text color="green">✓ Done! {selected?.name} copied to .env</Text>
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
