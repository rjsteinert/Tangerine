#!/bin/bash

echo ""
echo "Tangerine Commands:"
echo ""
echo "reporting-cache-clear    (Clear all reporting caches)"
echo "reporting-worker-pause   (Pause the reporting worker to prevent reporting caches from being built)"
echo "reporting-worker-unpause (Unpause the reporting worker to continue building caches)"
echo "find-missing-records     (Find any missing records in reporting cache [experimental])"
echo "generate-csv             (Generate a CSV)"
echo "generate-uploads         (Generate fake uploads for a group)"
echo "push-all-group-views     (Push all database views into all groups)"
echo "import-archives          (Import client archives from the ./data/archives folder)"
echo "release-apk              (Release a Group App as an APK)"
echo "release-pwa              (Release a Group App as a PWA)"
echo "release-dat              (Release a Group APP as a Dat Archive)"
echo ""
echo "Add --help option to any command for command specific documentation."
