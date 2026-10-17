<h1 align="center">omaglobe for omarchy</h1>

<p align="center">
  <img src="https://raw.githubusercontent.com/mark-omarov/omaglobe/main/docs/media/hero.gif" width="720" alt="A pixel-art globe turning slowly, with glowing cities streaming particles into the OMAGLOBE wordmark">
</p>

<p align="center">A globe in your omarchy bar that puts your machine on the <a href="https://omaglobe.mark-omarov.workers.dev">omaglobe</a> map while it's online.</p>

## Install

```sh
omarchy plugin add https://github.com/mark-omarov/omaglobe-plugin --enable
omarchy bar move io.github.mark-omarov.omaglobe --after omarchy.indicators
```

The globe stays hidden like the indicators. Hover the middle of your bar to find it.

## Use

<p align="center">
  <img src="https://raw.githubusercontent.com/mark-omarov/omaglobe/main/docs/media/plugin.png" width="342" alt="The omaglobe popup with a sharing switch, a city picker, and an open-the-map button">
</p>

1. Click the globe.
2. Pick your city, or press the crosshair to use the nearest city from your weather setting or timezone.
3. Switch sharing on.

Right-click the globe to open the map in your current omarchy theme.

| Key, with the popup open | Action |
|---|---|
| `enter` or `s` | Switch sharing on or off |
| `l` | Locate |
| `o` | Open the map |
| `?` | Show what gets shared |
| `esc` | Close |

From a script or keybinding:

```sh
omarchy-shell omaglobe toggleSharing
omarchy-shell omaglobe toggle
```

To add it to the omarchy menu under Trigger, then Toggle, put this line in `~/.config/omarchy/extensions/omarchy-menu.jsonc`:

```jsonc
"trigger.toggle.omaglobe": {"icon":"󰇧","label":"omaglobe","action":"omarchy-shell -q omaglobe toggleSharing","checked":"jq -e .online ~/.local/state/omaglobe/state.json >/dev/null 2>&1"},
```

## What it sends

While sharing is on, the plugin sends the city you picked and a random install id once an hour. The server keeps a hash of the id and deletes it an hour after the last check-in, or as soon as you switch sharing off. If the connection drops, the plugin keeps your setting and retries after 1, 2, 4, and up to 30 minutes.

The plugin keeps its settings in `~/.local/state/omaglobe/state.json`, outside your dotfiles.

## Uninstall

```sh
omarchy plugin remove io.github.mark-omarov.omaglobe
rm -r ~/.local/state/omaglobe
```

Source and issues are at [mark-omarov/omaglobe](https://github.com/mark-omarov/omaglobe). This repository is built from it on each release. MIT license.
