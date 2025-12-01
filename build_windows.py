import os
import subprocess
import shutil
import sys
from pathlib import Path

def run_command(command, cwd=None):
    print(f"Running: {command}")
    try:
        subprocess.check_call(command, shell=True, cwd=cwd)
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        sys.exit(1)

def build():
    base_dir = Path(__file__).parent.absolute()
    web_dir = base_dir / "web"
    api_dir = base_dir / "api"
    dist_dir = base_dir / "dist"
    
    print("=== Starting Build Process ===")

    # 1. Build Frontend
    print("\n--- Building Frontend ---")
    run_command("npm install", cwd=web_dir)
    run_command("npm run build", cwd=web_dir)

    # 2. Prepare Backend Build
    print("\n--- Preparing Backend ---")
    # Ensure PyInstaller is installed
    run_command("pip install pyinstaller", cwd=api_dir)

    # 3. Run PyInstaller
    print("\n--- Packaging with PyInstaller ---")
    
    # Icon handling
    png_icon_path = Path(r"C:\Users\Tico\.gemini\antigravity\brain\bc9277a0-09b6-43cd-9fa0-294449fa25c7\vintage_vinyl_icon_1764612158215.png")
    ico_icon_path = base_dir / "app_icon.ico"
    
    if png_icon_path.exists():
        print(f"Found icon at {png_icon_path}")
        try:
            from PIL import Image
            img = Image.open(png_icon_path)
            img.save(ico_icon_path, format='ICO', sizes=[(256, 256)])
            print(f"Converted icon to {ico_icon_path}")
        except ImportError:
            print("Pillow not installed. Installing...")
            run_command("pip install Pillow", cwd=api_dir)
            from PIL import Image
            img = Image.open(png_icon_path)
            img.save(ico_icon_path, format='ICO', sizes=[(256, 256)])
            print(f"Converted icon to {ico_icon_path}")
        except Exception as e:
            print(f"Failed to convert icon: {e}")
            ico_icon_path = None
    else:
        print("Icon not found, using default.")
        ico_icon_path = None

    pyinstaller_cmd = [
        "pyinstaller",
        "--name=Alejandria",
        "--onedir",
        "--noconfirm",
        "--clean",
        # "--windowed", # Keep console for debugging
        "--add-data", f"{web_dir / 'out'}{os.pathsep}web/out",
        "--hidden-import=uvicorn.loops.auto",
        "--hidden-import=uvicorn.protocols.http.auto",
        "--hidden-import=uvicorn.lifespan.on",
        "--hidden-import=email_validator",
        "--hidden-import=spotipy",
        "main.py"
    ]
    
    if ico_icon_path and ico_icon_path.exists():
        pyinstaller_cmd.insert(5, f"--icon={ico_icon_path}")
    
    # We need to run this inside the api directory so imports work
    subprocess.check_call(pyinstaller_cmd, cwd=api_dir)

    # 4. Organize Output
    print("\n--- Organizing Output ---")
    build_dist = api_dir / "dist" / "Alejandria"
    final_dist = base_dir / "Alejandria_Portable"
    
    if final_dist.exists():
        shutil.rmtree(final_dist)
        
    shutil.move(str(build_dist), str(final_dist))
    
    # Copy ffmpeg if it exists in a known location
    ffmpeg_path = Path(r"C:\binary\ffmpeg-win32-x64.exe")
    ffprobe_path = Path(r"C:\binary\ffprobe-win32-x64.exe")
    
    if ffmpeg_path.exists():
        shutil.copy(ffmpeg_path, final_dist)
        print("Copied ffmpeg")
    
    if ffprobe_path.exists():
        shutil.copy(ffprobe_path, final_dist)
        print("Copied ffprobe")

    print(f"\n=== Build Complete! ===")
    print(f"Portable app is located at: {final_dist}")

if __name__ == "__main__":
    build()
