import type { ElectronAPI } from "../preload/types"

declare global {
  interface Window {
    api: ElectronAPI
    __APT5__?: {
      deepLinks?: string[]
    }
  }
}
