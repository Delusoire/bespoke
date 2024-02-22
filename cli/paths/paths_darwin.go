//go:build darwin

package paths

import (
	"path/filepath"
)

func GetPlatformDefaultSpotifyPath() string {
	return "/Applications/Spotify.app/Contents/Resources"
}

func GetSpotifyExecPath(spotifyPath string) string {
	return filepath.Join(spotifyPath, "spotify.exe")
}
