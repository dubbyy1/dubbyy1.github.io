---
title: PC Stats
description: Tracks my mouse and windows, then shows it all on a dashboard
date: 2026-06-28
tags: [software, python, svelte, linux]
subtitle: "A tracker that records mouse and window activity, then displays it on an interactive web dashboard"
github: https://github.com/dubbyy1/pc-stats
try: "Visit the dashboard."
links:
  - label: "Open blank"
    url: "https://pc-stats.dubbyy.com/"
  - label: "Open with sample data"
    url: "https://pc-stats.dubbyy.com/?db=https%3A%2F%2Fraw.githubusercontent.com%2Fdubbyy1%2Fpc-stats%2Fmain%2Fexamples%2Fstats.db"
block:
  shape: rect
  width: 183
  height: 351
  colour: blue
  image: ../../assets/projects/pc-stats.png
  labelSize: 48
---

## Intro

<p>One day a question crossed my mind; which monitor do I use most? My first thought was to create a heatmap of every click, but before I could even start I was hit with more questions. What app do I spend the most time in? How many times a day do I right click? What hour am I most active?</p>

<p>To answer these <em>very</em> important questions, I created PC Stats. It has 2 parts: a Linux app that logs every click and records the names and positions of open windows every five minutes, and a dashboard website to display that data in an interesting and interactive way.</p>

## Collector

<p>The collector app is written in <strong>Python</strong>. It runs quietly in the background while you use your computer, and has a simple <strong>Qt</strong> UI. You can pause and play the data collection at any time, and configure the update frequency. The data is stored in a <strong>SQLite</strong> database at <code>~/.local/share/pc-stats/stats.db</code>. When you run it for the first time, it stores your monitor configuration in a table, which is later used by the dashboard.</p>

<table>
<thead>
<tr>
<th colspan="3">monitors</th>
</tr>
<tr>
<th>Column</th>
<th>Type</th>
<th>Purpose</th>
</tr>
</thead>
<tbody>
<tr>
<td>id</td>
<td>INTEGER</td>
<td>Monitor id used by the dashboard.</td>
</tr>
<tr>
<td>name</td>
<td>STRING</td>
<td>Display name reported by the system.</td>
</tr>
<tr>
<td>x</td>
<td>INTEGER</td>
<td>Monitor x offset in the full desktop layout.</td>
</tr>
<tr>
<td>y</td>
<td>INTEGER</td>
<td>Monitor y offset in the full desktop layout.</td>
</tr>
<tr>
<td>width</td>
<td>INTEGER</td>
<td>Monitor width in pixels.</td>
</tr>
<tr>
<td>height</td>
<td>INTEGER</td>
<td>Monitor height in pixels.</td>
</tr>
</tbody>
</table>

## Mouse Data

<p>There are two aspects to mouse tracking: detecting the click, and finding its position. To detect when a mouse button is pressed, the collector reads input events directly from <code>/dev/input/</code>. (I tried to use modules like pynput to listen for inputs, but these are blocked on Wayland systems for security reasons) It scans the directory for mouse-like devices and reads inputs from all of them, to accommodate for setups with multiple mouse inputs. This also helps handle disconnects more gracefully.</p>

<p>When an input event is received, the collector has to find its coordinates. This is the hardest part of tracking the mouse. Once again, Wayland blocks most methods of getting the position. Reading from <code>/dev/input/</code> only gives raw relative motion from the sensor. This can't be used to recreate the mouse's position, because it doesn't account for cursor acceleration. The solution to this was writing separate implementations for each of the most popular Window Managers.</p>

### KDE Wayland

<p>The way I decided to get the cursor position on KDE was to create a custom <strong>KWin</strong> script and read its output. The script contains a couple lines of <strong>JavaScript</strong> to print the cursor's position, and is saved to <code>~/.local/share/pc-stats/scripts/mouse_pos.js</code> on first run. Using <strong>dbus</strong>, the collector sends commands to KWin telling it to load the script, start it, and stop it. It then reads the outputted position from the system journal and prepares it for storage.</p>

### Hyprland

<p>Hyprland exposes a local IPC socket for controlling and querying the compositor. The collector finds the socket using Hyprland's instance signature, connects to it with a Unix domain socket, and sends the <code>cursorpos</code> command. Hyprland responds with the cursor position as an <code>x,y</code> pair.</p>

### X11 + GNOME Wayland

<p>These two are much simpler. Using <strong>Xlib</strong>, the collector can query the mouse's position directly, no commands or scripts required.</p>

<p>Once the position is found, the coordinates are added to a dictionary alongside the button and the timestamp. Instead of being stored straight away, each click is added to a buffer. At regular intervals, the buffer is flushed and the clicks are stored in the database.</p>

<table>
<thead>
<tr>
<th colspan="3">clicks</th>
</tr>
<tr>
<th>Column</th>
<th>Type</th>
<th>Purpose</th>
</tr>
</thead>
<tbody>
<tr>
<td>id</td>
<td>INTEGER</td>
<td>Unique click id.</td>
</tr>
<tr>
<td>timestamp</td>
<td>REAL</td>
<td>Unix timestamp for when the click happened.</td>
</tr>
<tr>
<td>x</td>
<td>INTEGER</td>
<td>Global x position.</td>
</tr>
<tr>
<td>y</td>
<td>INTEGER</td>
<td>Global y position.</td>
</tr>
<tr>
<td>button</td>
<td>STRING</td>
<td>LEFT, RIGHT, or MIDDLE.</td>
</tr>
</tbody>
</table>

## Window Data

<p>Window tracking works differently from mouse tracking. Instead of listening for events, the collector takes a snapshot of the desktop every few minutes. The data is stored across two tables: one for the snapshot details, and another for the individual windows.</p>

<table>
<thead>
<tr>
<th colspan="3">window_snapshots</th>
</tr>
<tr>
<th>Column</th>
<th>Type</th>
<th>Purpose</th>
</tr>
</thead>
<tbody>
<tr>
<td>id</td>
<td>INTEGER</td>
<td>Unique snapshot id.</td>
</tr>
<tr>
<td>timestamp</td>
<td>REAL</td>
<td>Unix timestamp for when the snapshot was taken.</td>
</tr>
<tr>
<td>active</td>
<td>STRING</td>
<td>Application that was focused during the snapshot.</td>
</tr>
<tr>
<td>current_desktop</td>
<td>INTEGER</td>
<td>Current desktop or workspace id.</td>
</tr>
</tbody>
</table>

<table>
<thead>
<tr>
<th colspan="3">windows</th>
</tr>
<tr>
<th>Column</th>
<th>Type</th>
<th>Purpose</th>
</tr>
</thead>
<tbody>
<tr>
<td>ssid</td>
<td>INTEGER</td>
<td>Snapshot id linking this window to window_snapshots.</td>
</tr>
<tr>
<td>name</td>
<td>STRING</td>
<td>Application or window class name.</td>
</tr>
<tr>
<td>pid</td>
<td>INTEGER</td>
<td>Process id when available.</td>
</tr>
<tr>
<td>desktop</td>
<td>INTEGER</td>
<td>Desktop or workspace the window is in.</td>
</tr>
<tr>
<td>x</td>
<td>INTEGER</td>
<td>Window x position, or -1 when minimized.</td>
</tr>
<tr>
<td>y</td>
<td>INTEGER</td>
<td>Window y position, or -1 when minimized.</td>
</tr>
<tr>
<td>width</td>
<td>INTEGER</td>
<td>Window width, or -1 when minimized.</td>
</tr>
<tr>
<td>height</td>
<td>INTEGER</td>
<td>Window height, or -1 when minimized.</td>
</tr>
</tbody>
</table>

### KDE Wayland

<p>KDE Wayland uses a KWin script, similar to the mouse position system. This script loops through every visible app, filters out hidden and non-normal windows (taskbar, wallpaper, etc.), and prints a dictionary containing all the above data. It then prints a final dictionary containing the active window and the current desktop. The script is then run and the output is read from the journal, same as before.</p>

### X11

<p>On X11, the collector can again query the window manager directly with Xlib. It reads EWMH properties like <code>_NET_CLIENT_LIST</code>, <code>_NET_ACTIVE_WINDOW</code>, <code>_NET_CURRENT_DESKTOP</code>, <code>_NET_WM_DESKTOP</code>, and <code>_NET_WM_PID</code>. For each client window, it gets the app name, process id, desktop, and geometry, then marks whichever window matches <code>_NET_ACTIVE_WINDOW</code> as focused.</p>

### Hyprland

<p>Hyprland exposes most of this information through <code>hyprctl</code>. The collector runs <code>hyprctl clients -j</code> to get the open windows, <code>hyprctl activewindow -j</code> to find the focused app, and <code>hyprctl activeworkspace -j</code> to find the current workspace. Since the responses are <strong>JSON</strong>, the collector can parse them directly instead of scraping text output.</p>

### Sway

<p>Sway uses <code>swaymsg</code>. The collector reads the full tree with <code>swaymsg -t get_tree -r</code>, walks through the workspace nodes, and collects normal windows from the tree. It also reads <code>swaymsg -t get_workspaces -r</code> to find the focused workspace. This gives the collector the same basic snapshot shape as the other backends, even though the source API is different.</p>

## Dashboard

<p>The dashboard is a static Svelte app. The SQLite database is loaded and parsed directly in the browser with <strong>sql.js</strong>. Imported databases are saved in cache with IndexedDB so the same file can be reopened automatically.</p>

### Mouse

<p>The main feature of the mouse section is the heatmap. Each click is drawn over a layout of the monitors stored earlier. It also has filters for time period and button. The rest of the charts are drawn using <strong>chart.js</strong>, including: a button pie chart, a monitor pie chart, an hourly activity chart, and a daily activity chart.</p>

<figure><img src="/media/projects/pc-stats/mouse-1.png" alt="PC Stats mouse dashboard showing a click heatmap and timeline filter." /></figure>

<figure><img src="/media/projects/pc-stats/mouse-2.png" alt="PC Stats mouse dashboard showing click activity charts and breakdowns." /></figure>

### Windows

<p>The window section features a visualization of the most common positions for every app, to display your usual setup. It also calculates app frequency, app focus percentage, screen coverage, and more.</p>

<figure><img src="/media/projects/pc-stats/windows-1.png" alt="PC Stats window dashboard showing app usage statistics and workspace data." /></figure>

<figure><img src="/media/projects/pc-stats/windows-2.png" alt="PC Stats window dashboard showing common window geometry visualisation." /></figure>

## Conclusion

<p>In summary, I use my left monitor more. I enjoyed this project a lot, and I learned a lot while making it, specifically about SQL and web development. I might expand this in the future, with more charts, more filters, and more data, but I think its time to work on other projects for now.</p>
