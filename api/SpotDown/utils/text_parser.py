import re
from typing import List, Dict

def parse_tracklist(text: str) -> List[Dict]:
    """
    Parses a text tracklist into a list of track dictionaries.
    
    Args:
        text (str): The raw text of the tracklist.
        
    Returns:
        List[Dict]: A list of dictionaries with 'artist', 'title', and original 'line'.
    """
    tracks = []
    lines = text.strip().split('\n')
    
    # Regex for "01. Artist - Title" or "Artist - Title"
    # We want to capture Artist and Title.
    # Common formats:
    # 01. Artist - Title
    # 1. Artist - Title
    # Artist - Title
    pattern = re.compile(r'^(?:\d+\.?\s*)?(.+?)\s*-\s*(.+)$')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Skip "ID - ID"
        if "ID - ID" in line:
            continue
            
        match = pattern.match(line)
        if match:
            artist = match.group(1).strip()
            title = match.group(2).strip()
            
            # Skip if artist or title is just "ID" (case insensitive)
            if artist.upper() == "ID" or title.upper() == "ID":
                continue
                
            # Clean up "ID Remix" or similar in title if needed, but user said "obvialo" (skip it? or skip the tag?)
            # User said: "otro caso tambien puede id remix o algo asi eso tambien obvialo"
            # This implies skipping the TRACK if it's an ID remix? Or just ignoring the "ID Remix" part?
            # "los que dicen ID - ID no lo vamos a encontrar... otro caso tambien puede id remix o algo asi eso tambien obvialo"
            # It sounds like we should skip tracks that are essentially unidentified.
            # If the title is "Doubledub (ID Remix)", we probably still want to download "Doubledub".
            # But if the user means "skip the track if it's an ID remix", that's different.
            # Given "ID - ID" context, I think he means skip tracks that are unknown.
            # But "Doubledub (ID Remix)" has a known artist "Christian Burkhardt".
            # Let's assume we keep it but maybe clean it? 
            # Actually, "ID - ID" is the main target to skip.
            # Let's stick to skipping "ID - ID" and maybe strict "ID" artist.
            
            tracks.append({
                "artist": artist,
                "title": title,
                "original_line": line
            })
            
    return tracks
