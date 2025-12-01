# 08.09.2025

import os
import logging
import tempfile
import subprocess


# Internal utils
from SpotDown.utils.os import file_utils


def convert_to_jpg_with_ffmpeg(input_data: bytes, output_path) -> bool:
    """
    Convert image data to JPG using ffmpeg

    Args:
        input_data (bytes): Raw image data
        output_path: Path where to save the converted JPG

    Returns:
        bool: True if conversion succeeded
    """
    try:
        # Create a temporary file for the input image
        with tempfile.NamedTemporaryFile(delete=False, suffix='.tmp') as temp_input:
            temp_input.write(input_data)
            temp_input.flush()

            # Use ffmpeg to convert to JPG
            ffmpeg_cmd = [
                str(file_utils.ffmpeg_path),
                '-i', temp_input.name,
                '-q:v', '2',  # High quality JPG
                '-y',  # Overwrite output file
                str(output_path)
            ]

            process = subprocess.run(
                ffmpeg_cmd,
                capture_output=True,
                text=True
            )

            # Clean up temporary file
            try:
                os.unlink(temp_input.name)
            except Exception:
                pass

            return process.returncode == 0

    except Exception as e:
        logging.error(f"FFmpeg conversion failed: {e}")
        return False


def add_cover_art(audio_path, cover_path) -> bool:
    """
    Embed cover art into audio file using ffmpeg
    """
    try:
        from pathlib import Path
        audio_path_obj = Path(audio_path)
        ext = audio_path_obj.suffix
        temp_output = str(audio_path_obj.with_name(f"{audio_path_obj.stem}_temp{ext}"))
        
        ffmpeg_cmd = [
            str(file_utils.ffmpeg_path),
            '-i', str(audio_path),
            '-i', str(cover_path),
            '-map', '0:a',
            '-map', '1:0',
            '-c', 'copy',
            '-metadata:s:v', 'title="Album cover"',
            '-metadata:s:v', 'comment="Cover (front)"',
            '-disposition:v', 'attached_pic', 
            '-y',
            temp_output
        ]
        
        # Add ID3 version only for MP3
        if ext.lower() == '.mp3':
            ffmpeg_cmd.insert(5, '-id3v2_version')
            ffmpeg_cmd.insert(6, '3')
        
        process = subprocess.run(
            ffmpeg_cmd,
            capture_output=True,
            text=True
        )
        
        if process.returncode == 0:
            # Replace original file with new one
            if os.path.exists(audio_path):
                os.unlink(audio_path)
            os.rename(temp_output, audio_path)
            return True
        else:
            logging.error(f"FFmpeg embed failed: {process.stderr}")
            if os.path.exists(temp_output):
                os.unlink(temp_output)
            return False
            
    except Exception as e:
        from rich.console import Console
        Console().print(f"[red]Error embedding cover art: {e}[/red]")
        logging.error(f"Error embedding cover art: {e}")
        return False