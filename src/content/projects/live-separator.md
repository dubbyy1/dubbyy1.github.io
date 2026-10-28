---
title: Live Separator
description: A Spotify companion app that removes vocals and filters playlists in real time
date: 2026-06-13
tags: [software, python, audio, spotify]
subtitle: "A Spotify companion app to remove vocals and filter playlists in real time"
try: "This project is available for download."
links:
  - label: "Open project page"
    url: "https://live-separator.dubbyy.com"
block:
  shape: polygon
  points: [[4, 4], [270, 170], [66, 274]]
  colour: green
  image: ../../assets/projects/live-separator.png
  labelAngle: -25.6
---

## Intro

<p>Last year, I attempted to create an app that would let me listen to an instrumental version of my playlist in real time, as seamlessly as possible. After a couple days, I was able to make a working prototype in Python, but I never took it further than that.</p>

<p>When I took part in Patch x OpenAI Young Builders Week this June, I decided to try again with a clearer plan and a better understanding of the problem.</p>

## Routing

<p>I needed a way to get the music into the app, and away from the speakers. To do that, I used a software called VB-CABLE to create a virtual cable connecting Spotify and the app.</p>

<p>The app records the audio coming from the cable in seven-second chunks. Each chunk is added to a queue for processing, and the finished chunks are added back into the audio stream being sent to the speakers. This lets the app record, process, and play different chunks at the same time, keeping playback uninterrupted.</p>

## Separation

<p>The traditional approach to vocal removal is called center channel cancellation. It works because vocals are often placed in the center of a song, making them similar in the left and right channels. In theory, that means the channels can be cancelled against each other to remove the vocals. I tried this first because it was fast and simple enough to run in real time, but it was too inconsistent. It only worked on certain songs, and even then the result was usually low quality.</p>

<p>The better option was to use an AI stem splitting model. This was slower and more demanding, but the quality was much more consistent. After testing a few different models, I found that Meta’s Demucs model gave the best balance between quality and speed, getting close enough to real time for the app to work.</p>

## Filters

<p>Once the separation pipeline was working, I wanted to add one more feature before presenting it at the end of the week. I realised that I spend a lot of time searching through my playlist to find songs that match my mood. To avoid having to manage several different playlists, I created a filtering page.</p>

<p>This feature lets the user define rules, to filter out any songs that don't match those rules. It connects to your Spotify account via Spotify's Web API, and pulls the metadata of the track currently playing. Any song that does not match the selected criteria is skipped instantly, making the playlist feel filtered in real time.</p>

<figure><img src="/media/projects/live-separator/separation.png" alt="Separation page showing Spotify as the audio source, an output device picker, and live input and output meters." /></figure>

<figure><img src="/media/projects/live-separator/filters.png" alt="Filters page for Spotify playback with artist, release year, and clean or explicit filter controls." /></figure>
