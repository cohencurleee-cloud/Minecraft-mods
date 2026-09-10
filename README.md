# VoxelForge

A browser-based voxel sandbox built with Three.js.

## Run
Because the source uses JavaScript modules, serve this folder over HTTP. The easiest route is GitHub Pages, Vercel, or any static server.

Desktop: WASD, mouse look, left click to mine/attack, right click to place, Space to jump, Shift to sprint, 1-9/wheel for hotbar.
Mobile: left joystick to move, drag the right side to look, and use Jump / Break / Place.

## Mods
The Mods panel includes built-in gameplay mods. It also accepts safe `mod.json` files that can add colored blocks and tune whitelisted gameplay values. See `example-mod.json`.

## Notes
Three.js is loaded from jsDelivr. Internet access is required unless you vendor Three.js locally.
