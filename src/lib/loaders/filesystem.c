
#ifndef _WIN32
    #include <dirent.h>
    #include <fcntl.h>
    #include <unistd.h>
#endif

#include <errno.h>
#include <string.h>
#include <ctype.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <sys/types.h>

#include "cglp_duk.h"

// TODO: override with cli argument
#define GAMES_DIRECTORY "games"

#define MAX_NAME_LENGTH 15
#define GAME_LIST_CHUNK 100

typedef struct {
    char name[MAX_NAME_LENGTH + 1];
    char* filename;
} gamelist_item_t;

#define MAX_FILE_SIZE 32767
char fileBuffer[MAX_FILE_SIZE + 1] = {0};



int gamelist_compare(const void *a, const void *b) {
    const gamelist_item_t* v1 = (gamelist_item_t*)a;
    const gamelist_item_t* v2 = (gamelist_item_t*)b;

    #ifdef _WIN32
        return _stricmp(v1->name, v2->name);
    #else
        return strcasecmp(v1->name, v2->name);
    #endif
}

int gameListAllocSize = 0;
int gameListCount = 0;
gamelist_item_t* gameList = NULL;

void gameListCleanup() {
    if (gameList == NULL) {
        return;
    }
    for (int i = 0; i < gameListCount; i++) {
        if (gameList[i].filename != NULL) {
            free(gameList[i].filename);
        }
    }
    free(gameList);
    gameList = NULL;
    gameListCount = 0;
    gameListAllocSize = 0;
}

const char* md_gameListGetItemName(int idx) {
    if (idx >= gameListCount) {
        return (const char*)-1;
    }
    return gameList[idx].name;
}

#ifdef _WIN32
#include <windows.h>

void md_gameListLoad() {
    gameListCleanup();

    WIN32_FIND_DATA findData;
    HANDLE hFind = INVALID_HANDLE_VALUE;

    hFind = FindFirstFile(GAMES_DIRECTORY "\\*.js", &findData);
    if (hFind == INVALID_HANDLE_VALUE)
    {
        consoleLog("FindFirstFile: Error opening directory %s: error %d\n", GAMES_DIRECTORY, GetLastError());
        return;
    }

    do {
        const char* name = findData.cFileName;
        // Skip current directory and parent directory entries
        if (strcmp(name, ".") == 0 || strcmp(name, "..") == 0)
            continue;


        int len = strlen(name);
        if (len <= 3 || name[len-3] != '.' || name[len-2] != 'j' || name[len-1] != 's') {
            continue;
        }

        if (gameListCount >= gameListAllocSize) {
            gameListAllocSize += GAME_LIST_CHUNK;
            gameList = realloc(gameList, sizeof(gamelist_item_t) * gameListAllocSize);
        }

        gameList[gameListCount].filename = _strdup(name);
        memset(gameList[gameListCount].name, 0, 16);
        for (int i = 0; i < MAX_NAME_LENGTH; i++) {
            if (name[i] == 0 || name[i] == '.') {
                break;
            }
            gameList[gameListCount].name[i] = toupper(name[i]);
        }
        gameListCount += 1;
    } while (FindNextFile(hFind, &findData));

    FindClose(hFind);

    // sort filenames
    qsort(gameList, gameListCount, sizeof(gamelist_item_t), gamelist_compare);
    return gameListCount;
}

int md_gameListReadItemContents(int idx, char** returned) {
    if (idx >= gameListCount) {
        return -1;
    }

    char filepath[MAX_PATH] = GAMES_DIRECTORY "\\";
    strcat(filepath, gameList[idx].filename);

    HANDLE hFile = CreateFile(filepath, GENERIC_READ, FILE_SHARE_READ, NULL,
        OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    if (hFile == INVALID_HANDLE_VALUE) {
        consoleLog("CreateFile: Error opening game %s: error %d\n", gameList[idx].filename, errno);
        return -1;
    }

    // Read file contents
    DWORD bytesRead;
    if (!ReadFile(hFile, fileBuffer, MAX_FILE_SIZE, &bytesRead, NULL)) {
        DWORD error = GetLastError();
        if (error == ERROR_HANDLE_EOF) {
            consoleLog("ReadFile: Game is too big: over %d bytes %s\n", MAX_FILE_SIZE, gameList[idx].filename);
        } else {
            consoleLog("ReadFile: Error reading game %s\n", gameList[idx].filename);
        }
        CloseHandle(hFile);
        return -1;
    }
    fileBuffer[bytesRead] = '\0'; // ensure null termination
    *returned = fileBuffer;
    return bytesRead;
}

#else

int md_gameListLoad() {
    gameListCleanup();

    DIR *directory = opendir(GAMES_DIRECTORY);
    if (directory == NULL)
    {
        consoleLog("opendir: Error opening directory %s: error %d\n", GAMES_DIRECTORY, errno);
        return -1;
    }

    struct dirent *entry = NULL;
    while ((entry = readdir(directory)) != NULL)
    {
        char* name = entry->d_name;
        if (name[0] == '.') {
            continue;
        }

        int len = strlen(name);
        if (len <= 3 || name[len-3] != '.' || name[len-2] != 'j' || name[len-1] != 's') {
            continue;
        }

        if (gameListCount >= gameListAllocSize) {
            gameListAllocSize += GAME_LIST_CHUNK;
            gameList = realloc(gameList, sizeof(gamelist_item_t) * gameListAllocSize);
        }

        gameList[gameListCount].filename = strdup(name);
        memset(gameList[gameListCount].name, 0, 16);
        for (int i = 0; i < MAX_NAME_LENGTH; i++) {
            if (name[i] == 0 || name[i] == '.') {
                break;
            }
            gameList[gameListCount].name[i] = toupper(name[i]);
        }
        gameListCount += 1;
    }
    closedir(directory);
    // sort filenames
    qsort(gameList, gameListCount, sizeof(gamelist_item_t), gamelist_compare);
    return gameListCount;
}

int md_gameListReadItemContents(int idx, char** returned) {
    if (idx >= gameListCount) {
        return -1;
    }

    int dirfd = open(GAMES_DIRECTORY, O_DIRECTORY);
    if (dirfd < 0) {
        consoleLog("open: Error opening directory %s: error %d\n", GAMES_DIRECTORY, errno);
        return dirfd;
    }
    int srcfd = openat(dirfd, gameList[idx].filename, O_NOFOLLOW);
    if (srcfd < 0) {
        consoleLog("openat: Error opening game %s: error %d\n", gameList[idx].filename, errno);
        return srcfd;
    }
    FILE *f = fdopen(srcfd, "rb");
    if (f == NULL) {
        consoleLog("fdopen: Error opening game %s: error %d\n", gameList[idx].filename, errno);
        return -1;
    }
    size_t len = fread((void *) fileBuffer, 1, MAX_FILE_SIZE, f);
    if (!feof(f) && ferror(f)) {
        fileBuffer[0] = '\0';  // return zero length string
        consoleLog("fread: Error reading game %s\n", gameList[idx].filename);
        return -1;
    }
    if (!feof(f)) {
        consoleLog("fread: Game is too big: over %d bytes %s\n", MAX_FILE_SIZE, gameList[idx].filename);
        return -1;
    }
    fileBuffer[len] = '\0'; // ensure null termination
    fclose(f);
    close(dirfd);

    *returned = fileBuffer;
    return len;
}

#endif

