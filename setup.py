# 05.04.2024

from pathlib import Path
from setuptools import setup, find_packages

base_dir = Path(__file__).resolve().parent


# Read version
version = {}
version_file = base_dir / "api" / "SpotDown" / "upload" / "version.py"
with open(version_file, encoding="utf-8") as f:
    exec(f.read(), version)


# Read requirements
requirements_file = base_dir / "requirements.txt"
with open(requirements_file, encoding="utf-8") as f:
    install_requires = f.read().splitlines()


# Read README.md
readme_file = base_dir / "README.md"
with open(readme_file, encoding="utf-8") as f:
    long_description = f.read()


setup(
    name="SSDown",
    version=version["__version__"],
    author="ticoxz",
    author_email="ticomiranda4@gmail.com",
    description="Download songs from Spotify",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/ticoxz/ssdown",
    packages=find_packages(),
    include_package_data=True,
    install_requires=install_requires,
    entry_points={
        "console_scripts": [
            "ssdown=SpotDown.main:run",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: GNU General Public License v3 (GPLv3)",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
)
