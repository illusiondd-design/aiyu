#!/bin/bash

VIDEO_PATH="$1"

if [ -z "$VIDEO_PATH" ]; then
  echo "Fehler: Bitte Video-Pfad übergeben."
  echo "Beispiel: ./scripts/video_probe.sh /Users/tom/Projects/postmeister/input/videos/test_video.mp4"
  exit 1
fi

if [ ! -f "$VIDEO_PATH" ]; then
  echo "Fehler: Datei nicht gefunden: $VIDEO_PATH"
  exit 1
fi

ffprobe -v quiet -print_format json -show_format -show_streams "$VIDEO_PATH"
