import struct
import sys
import math

from pathlib import Path

# Note: ESP32 is little endian

# Packed File Format:
# | Field        | Size (bytes) | Description                          |
# |--------------|--------------|--------------------------------------|
# | magic        | 2            | Identifier for the packed file "CG"  |
# | count        | 2            | Number of file entries (N)           |
# | metadata     | N x 24       | Metadata entry for each file         |
# |              |              | (See File Metadata table below)      |
# | content      | N x L        | File content                         |
#
# File Metadata:
# | Field        | Size (bytes) | Description                          |
# |--------------|--------------|--------------------------------------|
# | Name         | 16           | File name (null-terminated)          |
# | Offset       | 4            | Offset relative to start of packed   |
# | Size         | 4            | Size of the file content in bytes    |
# TODO: add CRC32 Checksum field

GAME_DIR = Path(sys.argv[1])
OUTPUT_PATH = Path(sys.argv[2])

def pad_to_alignment(data : bytes, increment=4):
    new_length = len(data) + 1  # ensure at least one null byte
    new_length = int(math.ceil(new_length / increment) * increment)
    return data.ljust(new_length, b'\x00')

def pack_game_metadata(name : str, offset : int, size : int, **options):

    return struct.pack('<15sBII', name.encode('ascii', errors='replace')[:15], 0, offset, size)

def pack_header(game_count):
    return struct.pack('<2sH', b'CG', game_count)

METADATA_SIZE = len(pack_game_metadata("test", 0, 0))

gamepaths = sorted(GAME_DIR.glob("*.es5.js"))
header = pack_header(len(gamepaths))
metadata = bytearray() + header
content = bytearray()
next_offset = len(gamepaths) * METADATA_SIZE + len(metadata)

for gamepath in gamepaths:
    name = str(gamepath).removesuffix(".es5.js").rsplit("/", 1)[-1].upper()

    with open(gamepath, "rb") as f:
        gamedata = f.read()

    padded_data = pad_to_alignment(gamedata, 4)
    content += padded_data
    metadata += pack_game_metadata(name, next_offset, len(gamedata))
    next_offset += len(padded_data)

with open(OUTPUT_PATH, "wb") as fp:
    fp.write(metadata)
    fp.write(content)