---
title: Particle Evolution
description: A GPU accelerated genome based Particle Life simulation
date: 2026-09-16
tags: [software, python, stardance, gpu]
subtitle: "A GPU-accelerated Particle Life simulation where species interact through genomes instead of a fixed attraction matrix. Inspired by [Sandbox Science's Particle Life](https://sandbox-science.com/particle-life)."
github: https://github.com/dubbyy1/particle-evo
try: "Download the latest build from GitHub."
links:
  - label: "Go to downloads"
    url: "https://github.com/dubbyy1/particle-evo/releases/tag/v1.0.0"
hero:
  video: "/media/projects/particle-evo/demo.mp4"
  poster: "/media/projects/particle-evo/demo-poster.jpg"
  alt: "Particle Evolution running with three species forming rings and cells, with the options and controls panels open."
block:
  shape: big-right-triangle
  colour: blue
  image: ../../assets/projects/particle-evo.png
---

## Intro

<p>Something I really love is seeing a lot of small things come together to make a big thing. A few weeks ago I saw a video about Particle Life, and I haven't been able to get it out of my head ever since.</p>

<p>In case you don't know, Particle Life is a simulation involving thousands of small particles of different species. Species push and pull each other according to a matrix, like this:</p>

<figure><img src="/media/projects/particle-evo/matrix.png" alt="A traditional Particle Life attraction matrix, with five coloured species along each axis and green or red cells for attraction or repulsion." style="max-width: 25%" /></figure>

<p>Over time, these simple rules create complex forms and behaviours resembling cells and organisms.</p>

<figure><img src="/media/projects/particle-evo/cells.png" alt="Glowing particles in pink, green and blue, with pink rings forming membranes around bright nuclei, like cells." /></figure>

<p>My <em>idea</em> was to create a system where the matrix changes over time, allowing the "organisms" to evolve. How was I going to do that? I had no idea.</p>

## Particles

<p>I decided to start coding, and hoped something would come to me along the way. I started by recreating a simple version of Particle Life in Python, using <strong>Pygame</strong>. After getting the physics formulas wrong about 5 times, I finally ended up with something that kind of worked.</p>

<figure><img src="/media/projects/particle-evo/early-version.gif" alt="The early Pygame version: small clusters of coloured particles drifting in arcs, with the attraction matrix in the corner." style="max-width: 60%" loading="lazy" /></figure>

<p>Once I was happy with the physics, I rewrote the backend with <a href="https://www.taichi-lang.org" target="_blank" rel="noopener noreferrer">Taichi</a>, allowing the code to run on the GPU.</p>

<p>In this version, instead of the particles being individual objects, they were represented by 3 lists: position, force and acceleration. This, alongside parallel processing on the GPU, greatly increased the processing speed. I was now able to run up to 30,000 particles without lag, about 20x the previous limit.</p>

<figure><img src="/media/projects/particle-evo/gpu-version.gif" alt="The first GPU version: tens of thousands of particles packed into rings, cells and streaks across the whole window." style="max-width: 60%" loading="lazy" /></figure>

## Evolution

<p>When it was time for the Evolution part of Particle Evolution, I still hadn't thought of an idea. I tried a few simple methods involving reproduction and exchanging DNA, but everything I tried turned into either complete chaos or complete uniformity. After realising how hard it was to create a stable ecosystem, I decided to pivot.</p>

<p>While experimenting with evolution, I created a genome system. Instead of having full evolution, I decided to keep the genome system and allow the user to control it.</p>

## Genomes

<p>Each genome contains <strong>3 traits</strong> and <strong>3 receptors</strong>. Traits describe a particle, and receptors describe how it interacts with other particles. For example, a particle with a positive A receptor will be attracted to a particle with a positive A trait, but repelled by a particle with a negative A trait.</p>

<p>Instead of each particle having its own genome, there's a fixed number of species that can be controlled individually.</p>

## UI

<p>At this point the graphics were still being drawn in Pygame. This slowed things down in two ways. One, Pygame has no parallel processing, so every particle is rendered individually. Two, because Pygame uses the CPU, time is wasted transferring data between the GPU and CPU. To fix this, I created a new interface using Taichi's UI library.</p>

<p>The new UI had control panels for each species, as well as one to tweak the global physics values. I also added a save/load system to preserve my favourite configurations.</p>
