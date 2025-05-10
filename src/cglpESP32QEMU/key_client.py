import socket
import sdl2
import sdl2.ext
import string
state = {c: "up" for c in string.ascii_letters}

# Connect to TCP server at localhost:4444
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(('localhost', 4444))

running = True

def send_char(char):
    global client
    try:
        client.sendall(char)
    except Exception as e:

        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client.connect(('localhost', 4444))
        print(f"Error sending data: {e}")


def process(event, event_kind):
    key = event.key.keysym.sym
    keyname = sdl2.SDL_GetKeyName(key).decode('utf-8').lower()
    special_key = keyname in ("up", "left", "down", "right", "escape")
    if not (keyname.isascii() and keyname.isalpha()):
        return
    if special_key:
        keyname = keyname[0]
    if len(keyname) > 1:
        return
    if keyname =="q":
        global running
        running = False
        sdl2.ext.quit()
        return
    if state[keyname] == event_kind:
        return
    state[keyname] = event_kind
    print(f"Key {event_kind}: {keyname}")
    if event_kind == "down":
        keyname = keyname.upper()
    send_char(keyname.encode())




def run():
    sdl2.ext.init()
    window = sdl2.ext.Window("Keyboard Event Logger", size=(50, 50))
    window.show()
    global running
    event = sdl2.SDL_Event()


    while running:
        if sdl2.SDL_WaitEvent(event) == 1:
            if event.type == sdl2.SDL_QUIT:
                running = False
            elif event.type == sdl2.SDL_KEYDOWN:
                process(event, "down")
            elif event.type == sdl2.SDL_KEYUP:
                process(event, "up")
    sdl2.ext.quit()

if __name__ == "__main__":
    run()