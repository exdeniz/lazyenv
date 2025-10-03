import { atom, computed } from "nanostores";
import type { EnvFile, Command } from "./types.js";

export type AppState = "loading" | "selectEnv" | "running" | "done" | "error";
export type ActivePanel = "selector" | "preview";

// Core state
export const appState = atom<AppState>("loading");
export const error = atom<string>("");

// Files and commands
export const envFiles = atom<EnvFile[]>([]);
export const commands = atom<Command[]>([]);

// Selection state
export const selectedEnv = atom<EnvFile | null>(null);
export const highlightedEnv = atom<EnvFile | null>(null);
export const highlightedIndex = atom<number>(0);

// UI state
export const activePanel = atom<ActivePanel>("selector");
export const previewScroll = atom<number>(0);
export const showCommandModal = atom<boolean>(false);
export const terminalHeight = atom<number>(24);

// Computed: dynamic left panel width
export const leftPanelWidth = computed(envFiles, (files) => {
  if (files.length === 0) return 30;

  const maxFileNameLength = Math.max(...files.map((file) => file.name.length));
  const titleLength = "Select .env file:".length;

  const contentWidth = Math.max(maxFileNameLength, titleLength) + 8;
  const minWidth = 25;
  const maxWidth = 50;

  return Math.max(Math.min(contentWidth, maxWidth), minWidth);
});

// Actions
export function setAppState(state: AppState) {
  appState.set(state);
}

export function setError(errorMessage: string) {
  error.set(errorMessage);
}

export function setEnvFiles(files: EnvFile[]) {
  envFiles.set(files);
  if (files.length > 0 && !highlightedEnv.get()) {
    highlightedEnv.set(files[0]);
  }
}

export function setCommands(cmds: Command[]) {
  commands.set(cmds);
}

export function setSelectedEnv(env: EnvFile | null) {
  selectedEnv.set(env);
}

export function setHighlightedEnv(env: EnvFile | null) {
  highlightedEnv.set(env);
  // Update index
  if (env) {
    const files = envFiles.get();
    const index = files.findIndex((f) => f.path === env.path);
    if (index !== -1) {
      highlightedIndex.set(index);
    }
  }
  // Reset scroll when highlighted file changes
  previewScroll.set(0);
}

export function setActivePanel(panel: ActivePanel) {
  activePanel.set(panel);
}

export function toggleActivePanel() {
  const current = activePanel.get();
  activePanel.set(current === "selector" ? "preview" : "selector");
}

export function setPreviewScroll(offset: number) {
  previewScroll.set(offset);
}

export function scrollPreview(delta: number) {
  const current = previewScroll.get();
  previewScroll.set(Math.max(0, current + delta));
}

export function setShowCommandModal(show: boolean) {
  showCommandModal.set(show);
}

export function toggleCommandModal() {
  showCommandModal.set(!showCommandModal.get());
}

export function setTerminalHeight(height: number) {
  terminalHeight.set(height);
}
