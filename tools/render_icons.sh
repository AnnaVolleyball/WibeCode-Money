#!/bin/sh
# PNG-иконки из icons/icon.svg встроенным в macOS просмотрщиком (qlmanage). Запуск из корня репозитория.
# qlmanage правильно рисует только крупный размер, поэтому рисуем 512 и уменьшаем до 192 и 180.
set -e
tmp=$(mktemp -d)
sed 's/width="180" height="180"/width="512" height="512"/' icons/icon.svg > "$tmp/icon.svg"
qlmanage -t -s 512 -o "$tmp" "$tmp/icon.svg" >/dev/null 2>&1
# без прозрачности: iPhone закрашивает прозрачное чёрным
sips -s format jpeg "$tmp/icon.svg.png" --out "$tmp/flat.jpg" >/dev/null
for size in 512 192 180; do
  sips -s format png -z "$size" "$size" "$tmp/flat.jpg" --out "icons/icon-$size.png" >/dev/null
done
rm -rf "$tmp"
ls -l icons/icon-*.png
