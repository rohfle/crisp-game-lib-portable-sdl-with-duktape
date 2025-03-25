#!/bin/bash

find working/crisp-game-lib/docs/ -maxdepth 2 -mindepth 2 -type f -iname "main.js" ! -path '*/_*' -print0 |
    while IFS= read -r -d '' path; do 
        parent="$(dirname "$path")"
        name="$(basename "$parent")"
        echo $path == $name
        babel "$path" > "games/$name.es5.js"
    done