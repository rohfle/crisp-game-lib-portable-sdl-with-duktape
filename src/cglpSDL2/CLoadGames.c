
#ifndef _WIN32
    #include <dirent.h>
    #include <fcntl.h>
    #include <unistd.h>
#endif

#include <errno.h>
#include <string.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <sys/types.h>

#include "cglp_duk.h"

// TODO: override with cli argument
#define GAMES_DIRECTORY "games"

#ifdef _WIN32
#include <windows.h>

int md_readJSGame(char* filename, char* buf, int buflen) {
    buflen -= 1; // allow for space for null termination

    char filepath[MAX_PATH] = GAMES_DIRECTORY "\\";
    strcat(filepath, filename);

    HANDLE hFile = CreateFile(filepath, GENERIC_READ, FILE_SHARE_READ, NULL,
        OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    if (hFile == INVALID_HANDLE_VALUE) {
        consoleLog("CreateFile: Error opening game %s: error %d\n", filename, errno);
        return -1;
    }

    // Read file contents
    DWORD bytesRead;
    if (!ReadFile(hFile, buf, buflen, &bytesRead, NULL)) {
        DWORD error = GetLastError();
        if (error == ERROR_HANDLE_EOF) {
            consoleLog("ReadFile: Game is too big: over %d bytes %s\n", buflen, filename);
        } else {
            consoleLog("ReadFile: Error reading game %s\n", filename);
        }
        CloseHandle(hFile);
        return -1;
    }
    buf[bytesRead] = '\0'; // ensure null termination
    return bytesRead;
}
#else
int md_readJSGame(char* filename, char* buf, int buflen) {
    buflen -= 1; // allow for space for null termination
    int dirfd = open(GAMES_DIRECTORY, O_DIRECTORY);
    if (dirfd < 0) {
        consoleLog("open: Error opening directory %s: error %d\n", GAMES_DIRECTORY, errno);
        return dirfd;
    }
    int srcfd = openat(dirfd, filename, O_NOFOLLOW);
    if (srcfd < 0) {
        consoleLog("openat: Error opening game %s: error %d\n", filename, errno);
        return srcfd;
    }
    FILE *f = fdopen(srcfd, "rb");
    if (f == NULL) {
        consoleLog("fdopen: Error opening game %s: error %d\n", filename, errno);
        return -1;
    }
    size_t len = fread((void *) buf, 1, buflen, f);
    if (!feof(f) && ferror(f)) {
        buf[0] = '\0';  // return zero length string
        consoleLog("fread: Error reading game %s\n", filename);
        return -1;
    }
    if (!feof(f)) {
        consoleLog("fread: Game is too big: over %d bytes %s\n", buflen, filename);
        return -1;
    }
    buf[len] = '\0'; // ensure null termination
    fclose(f);
    close(dirfd);
    return len;
}
#endif

int filename_compare(const void *a, const void *b) {
    const char **str1 = (const char **)a;
    const char **str2 = (const char **)b;

    #ifdef _WIN32
        return _stricmp(*str1, *str2);
    #else
        return strcasecmp(*str1, *str2);
    #endif
}

#ifdef _WIN32
void md_loadJSGames() {
    char* filenames[MAX_GAME_COUNT];
    int filenameCount = 0;

    WIN32_FIND_DATA findData;
    HANDLE hFind = INVALID_HANDLE_VALUE;

    hFind = FindFirstFile(GAMES_DIRECTORY "\\*.js", &findData);
    if (hFind == INVALID_HANDLE_VALUE)
    {
        consoleLog("FindFirstFile: Error opening directory %s: error %d\n", GAMES_DIRECTORY, GetLastError());
        return;
    }

    do {
        // Skip current directory and parent directory entries
        if (strcmp(findData.cFileName, ".") == 0 || strcmp(findData.cFileName, "..") == 0)
            continue;

        filenames[filenameCount++] = _strdup(findData.cFileName);
        if (filenameCount >= MAX_GAME_COUNT) {
            consoleLog("md_loadJSGames: Stopped loading after reaching game limit of %d\n", MAX_GAME_COUNT);
            break;
        }
    } while (FindNextFile(hFind, &findData));

    FindClose(hFind);

    // sort filenames
    qsort(filenames, filenameCount, sizeof(char*), filename_compare);
    // then add the games
    for (int i = 0; i < filenameCount; i++) {
        addJSGameFromFile(filenames[i]);
    }
}
#else
void md_loadJSGames() {
    char* filenames[MAX_GAME_COUNT];
    int filenameCount = 0;

    DIR *directory = opendir(GAMES_DIRECTORY);
    if (directory == NULL)
    {
        consoleLog("opendir: Error opening directory %s: error %d\n", GAMES_DIRECTORY, errno);
        return;
    }

    struct dirent *entry = NULL;

    while ((entry = readdir(directory)) != NULL)
    {
        char* name = entry->d_name;
        if (name[0] == '.') {
            continue;
        }
        int len = strlen(name);
        if (name[len-3] != '.' || name[len-2] != 'j' || name[len-1] != 's') {
            continue;
        }
        filenames[filenameCount++] = strdup(name);
        if (filenameCount >= MAX_GAME_COUNT) {
            consoleLog("md_loadJSGames: Stopped loading after reaching game limit of %d\n", MAX_GAME_COUNT);
            break;
        }
    }
    closedir(directory);
    // sort filenames
    qsort(filenames, filenameCount, sizeof(char*), filename_compare);
    // then add the games
    for (int i = 0; i < filenameCount; i++) {
        addJSGameFromFile(filenames[i]);
    }
}
#endif