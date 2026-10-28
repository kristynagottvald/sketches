# Clip encoder

`encode-webm.mjs` turns a folder of frames into a looping WebM clip using Chrome's built-in VP9 encoder, so it needs no other software.

```bash
node tools/encode-webm.mjs <frames-dir> <out.webm> [--fps 12] [--size 1280x720] [--kbps 1500]
```

- Needs Node 22+ and Google Chrome (set `CHROME=/path/to/chrome` if it is not in the usual place).
- Frames are read in name order (png or jpg) and recorded in real time, one frame per tick. A 72-frame clip at 12 fps takes about 6 seconds.
- The home page clips are 72 frames at 12 fps, 1280x720, about 1500 kbps.
