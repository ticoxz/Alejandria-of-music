import os
import sys
from dotenv import load_dotenv

# Add api directory to path
sys.path.append(os.path.join(os.getcwd(), 'api'))

from SpotDown.extractor.spotify_extractor import SpotifyExtractor

def test_url(url):
    print(f"Testing URL: {url}")
    
    # Force reload env
    load_dotenv(override=True)
    
    client_id = os.getenv("SPOTIPY_CLIENT_ID")
    client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")
    
    print(f"Client ID present: {bool(client_id)}")
    print(f"Client Secret present: {bool(client_secret)}")
    
    if not client_id or not client_secret:
        print("ERROR: Credentials missing in .env")
        return

    try:
        with SpotifyExtractor() as extractor:
            print("Extractor initialized. Attempting extraction...")
            info = extractor.extract_track_info(url)
            if info:
                print("SUCCESS!")
                print(f"Title: {info['title']}")
                print(f"Artist: {info['artist']}")
            else:
                print("FAILED: No info returned")
    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    url = "https://open.spotify.com/intl-es/track/3LCX5pudqlryLD2VVibdQn?si=310e60503e3c4a40"
    test_url(url)
