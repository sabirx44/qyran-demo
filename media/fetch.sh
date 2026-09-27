#!/bin/bash
# Downloads Pexels clips at 720p (portrait or landscape) by id. Usage: fetch.sh name:id ...
cd "$(dirname "$0")/raw"
for pair in "$@"; do
  name=${pair%%:*}; id=${pair##*:}; f="$name-$id.mp4"
  [ -s "$f" ] && continue
  loc=""
  for q in "?h=1280&w=720" "?w=1280&h=720" "?w=1920&h=1080" ""; do
    loc=$(curl -s -I -m 20 -A "Mozilla/5.0" "https://www.pexels.com/download/video/$id/$q" | tr -d '\r' | awk -F': ' 'tolower($1)=="location"{print $2}')
    case "$loc" in *_720_*|*_1280_720*|*_1920_1080*|*_1080_1920*) break;; esac
    [ -n "$q" ] || break
  done
  [ -n "$loc" ] && curl -s -m 300 -A "Mozilla/5.0" -o "$f" "$loc" && echo "$f $(du -k "$f" | cut -f1)KB $(basename "$loc")" || echo "fail $pair"
done
