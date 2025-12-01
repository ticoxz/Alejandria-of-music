import sys
import os
import logging

# Add api directory to path
sys.path.insert(0, os.path.join(os.getcwd(), 'api'))

from SpotDown.downloader.youtube_downloader import YouTubeDownloader
from SpotDown.extractor.spotify_extractor import SpotifyExtractor
from SpotDown.extractor.youtube_extractor import YouTubeExtractor
from SpotDown.utils.os import file_utils

# Configure logging
logging.basicConfig(level=logging.INFO)

def setup():
    print("Initializing system...")
    file_utils.get_system_summary()

def test_spotify_flac():
    print("\n--- Testing Spotify FLAC Download ---")
    url = "https://open.spotify.com/intl-es/track/0RRAHU9Dkui4ZuroPk7XF3?si=942c64b3371541d8"
    
    try:
        with SpotifyExtractor() as extractor:
            print(f"Extracting Spotify info for: {url}")
            spotify_info = extractor.extract_track_info(url)
            
        if not spotify_info:
            print("Failed to extract Spotify info")
            return

        print(f"Found: {spotify_info['artist']} - {spotify_info['title']}")
        
        query = f"{spotify_info['artist']} {spotify_info['title']}"
        print(f"Searching YouTube for: {query}")
        
        with YouTubeExtractor() as yt_extractor:
            results = yt_extractor.search(query, spotify_info)
            
        if not results:
            print("No YouTube results found")
            return
            
        video_info = results[0]
        print(f"Found video: {video_info['title']} ({video_info['url']})")
        
        downloader = YouTubeDownloader()
        print("Attempting FLAC download...")
        success = downloader.download(video_info, spotify_info, quality="FLAC")
        
        if success:
            print("Spotify FLAC download SUCCESS")
        else:
            print("Spotify FLAC download FAILED")
            
    except Exception as e:
        print(f"Error testing Spotify: {e}")
        import traceback
        traceback.print_exc()

def test_youtube_flac():
    print("\n--- Testing YouTube FLAC Download ---")
    url = "https://youtu.be/zfGTr9OZmtE?si=sS5tmZADhqCKGv4o"
    
    try:
        import yt_dlp
        
        print(f"Extracting YouTube info for: {url}")
        ydl_opts = {'quiet': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
        video_info = info
        # Ensure url key exists (mimicking main.py fix)
        if 'url' not in video_info:
            video_info['url'] = info.get('webpage_url') or url
            
        spotify_info = {
            "title": info.get('title'),
            "artist": info.get('uploader') or "Unknown",
            "album": "Single",
            "cover_url": info.get('thumbnail'),
            "url": url
        }
        
        print(f"Video: {spotify_info['title']}")
        
        downloader = YouTubeDownloader()
        print("Attempting FLAC download...")
        success = downloader.download(video_info, spotify_info, quality="FLAC")
        
        if success:
            print("YouTube FLAC download SUCCESS")
        else:
            print("YouTube FLAC download FAILED")

    except Exception as e:
        print(f"Error testing YouTube: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    setup()
    test_spotify_flac()
    test_youtube_flac()
