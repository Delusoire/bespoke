import { Module } from "./module.js";
import { applyTransforms } from "./transforms/index.js";
import "./transforms/devtools.js";
import "./transforms/styledComponents.js";

await Module.onSpotifyPreInit();

// initialize spotify
await Promise.all(["/vendor~xpui.js", "/xpui.js"].map(applyTransforms).map(async p => import(await p)));

const { awaitedMixins } = Module.INTERNAL;
console.info(awaitedMixins);
await Promise.all(awaitedMixins);

await Module.onSpotifyPostInit();
