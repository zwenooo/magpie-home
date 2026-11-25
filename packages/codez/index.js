// magpie's plugin host calls every function this file exports as a
// plugin, so it exports only the plugin's.

import { createPlugin } from "./codez.js"

export const CodeZ = async () => createPlugin()
