#!/bin/sh
# PNG-иконки из icons/icon.svg встроенным в macOS просмотрщиком (qlmanage). Запуск из корня репозитория.
set -e
tmp=$(mktemp -d)
for size in 180 192 512; do
  sed "s/width=\"180\" height=\"180\"/width=\"$size\" height=\"$size\"/" icons/icon.svg > "$tmp/icon.svg"
  qlmanage -t -s "$size" -o "$tmp" "$tmp/icon.svg" >/dev/null 2>&1
  # без прозрачности: iPhone закрашивает прозрачное чёрным
  sips -s format jpeg "$tmp/icon.svg.png" --out "$tmp/flat.jpg" >/dev/null
  sips -s format png -z "$size" "$size" "$tmp/flat.jpg" --out "icons/icon-$size.png" >/dev/null
  rm -f "$tmp/icon.svg.png" "$tmp/flat.jpg"
done
rm -rf "$tmp"
ls -l icons/icon-*.png
