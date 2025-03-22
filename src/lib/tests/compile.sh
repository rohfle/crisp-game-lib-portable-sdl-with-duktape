#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR/.."

gcc -g -I. -o tests/cglp_duk_native_test tests/cglp_duk_native_test.c *.c -lm