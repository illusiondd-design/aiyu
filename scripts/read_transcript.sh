#!/bin/bash

FILE_PATH="$1"

if [ -z "$FILE_PATH" ]; then
  echo "Fehler: Bitte Transcript-Pfad übergeben."
  exit 1
fi

if [ ! -f "$FILE_PATH" ]; then
  echo "Fehler: Datei nicht gefunden: $FILE_PATH"
  exit 1
fi

cat "$FILE_PATH"
