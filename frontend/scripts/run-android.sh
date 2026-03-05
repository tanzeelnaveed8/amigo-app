#!/bin/bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
cd "$(dirname "$0")/.." || exit
npx react-native run-android "$@"

