#!/bin/bash

compile_game() {
    gamepath="$1"
    parent="$(dirname "$gamepath")"
    name="$(basename "$parent")"
    echo $gamepath == $name
    babel "$gamepath" > "games/$name.es5.js"
    mkdir -p "${parent}-es5"
    ln -srf "./games/$name.es5.js" "${parent}-es5/main.js"
}

if [ "$#" -eq 0 ]; then
    find submodules/crisp-game-lib-games/docs/ -maxdepth 2 -mindepth 2 -type f -iname "main.js" ! -path '*/_*' ! -path '*-es5/*' -print0 |
        while IFS= read -r -d '' gamepath; do
            compile_game "$gamepath"
        done
	find submodules/claude-one-button-game-creation/docs/ -maxdepth 2 -mindepth 2 -type f -iname "main.js" ! -path '*/_*' ! -path '*-es5/*' ! -path '*sample_*' -print0 |
        while IFS= read -r -d '' gamepath; do
            compile_game "$gamepath"
        done
	find submodules/crisp-game-lib-11-games/docs/ -maxdepth 2 -mindepth 2 -type f -iname "main.js" ! -path '*/_*' ! -path '*-es5/*' -print0 |
        while IFS= read -r -d '' gamepath; do
            compile_game "$gamepath"
        done
else
    for gamename in "$@"; do
        gamepath="submodules/crisp-game-lib-games/docs/$gamename/main.js"
        if [ -f "$gamepath" ]; then
            compile_game "$gamepath"
        else
            echo "File \"$gamepath\" does not exist"
        fi
    done
fi