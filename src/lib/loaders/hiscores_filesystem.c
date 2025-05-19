#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <stdbool.h>

#ifdef _WIN32
#include <io.h>
#define ACCESS _access
#define F_OK 0
#else
#include <unistd.h>
#define ACCESS access
#endif

#define MAX_NAME_LENGTH 15

void writeHomeDirectory(char* buf, size_t buflen) {
#ifdef _WIN32
    const char* home = getenv("USERPROFILE");
    if (!home) {
        const char* drive = getenv("HOMEDRIVE");
        const char* path = getenv("HOMEPATH");
        if (drive && path) {
            snprintf(buf, buflen, "%s%s", drive, path);
            return;
        }
    }
#else
    const char* home = getenv("HOME");
#endif
    snprintf(buf, buflen, "%s", home ? home : ".");
}


int md_hiScoreInit() { return 0; }

int md_hiScoreLoad(char* name) {
    char fileName[FILENAME_MAX];
    writeHomeDirectory(fileName, FILENAME_MAX);
    strncat(fileName, "/.cglpscore.dat", FILENAME_MAX-1);
    FILE *fp;
    fp = fopen(fileName, "rb");
    if (!fp) {
        return 0;
    }

    int score = 0;
    char recordName[MAX_NAME_LENGTH + 1];
    int recordScore;

    int result;
    while (!feof(fp))
    {
        result = fread(recordName, sizeof(char), MAX_NAME_LENGTH + 1, fp);
        if (result < (MAX_NAME_LENGTH + 1)) {
            if (result < 0) {
                // handle error
            }
            score = -1;
            break;
        }
        result = fread(&recordScore, sizeof(int), 1, fp);
        if (result < 1) {
            if (result < 0) {
                // handle error
            }
            score = -1;
            break;
        }
        // printf("%s: %d\n", recordName, recordScore);
        if (strncmp(name, recordName, MAX_NAME_LENGTH) == 0 && recordScore >= 0) {
            score = recordScore;
            break;
        }
    }
    fclose(fp);
    return score;
}


int md_hiScoreSave(char* name, int score) {
    char fileName[FILENAME_MAX];
    writeHomeDirectory(fileName, FILENAME_MAX);
    strncat(fileName, "/.cglpscore.dat", FILENAME_MAX-1);
    FILE *fp;
    if (ACCESS(fileName, F_OK) == 0) {
        fp = fopen(fileName, "r+b"); // exists, open read/write
    } else {
        fp = fopen(fileName, "w+b"); // doesn't exist, create new
    }

    if (!fp) {
        return 0;
    }

    char recordName[MAX_NAME_LENGTH + 1];
    int recordScore;

    bool written = false;
    int result;
    while (!feof(fp))
    {

        result = fread(recordName, sizeof(char), MAX_NAME_LENGTH + 1, fp);
        if (result < (MAX_NAME_LENGTH + 1)) {
            if (result < 0) {
                // handle error
            }
            break;
        }
        result = fread(&recordScore, sizeof(int), 1, fp);
        if (result < 1) {
            if (result < 0) {
                // handle error
            }
            score = -1;
            break;
        }
        if (strncmp(name, recordName, MAX_NAME_LENGTH) == 0) {
            if (recordScore >= score) {
                result = -1; // existing score is higher
                break;
            }
            result = fseek(fp, -sizeof(int), SEEK_CUR);
            written = true;
            result = fwrite(&score, sizeof(int), 1, fp);
            if (result < 1) {
                if (result < 0) {
                    // handle error
                }
                break;
            }
            break;
        }
    }
    if (result >= 0 && !written) {
        do {
            memset(recordName, 0, MAX_NAME_LENGTH + 1);
            strncpy(recordName, name, MAX_NAME_LENGTH);
            result = fwrite(recordName, sizeof(char), MAX_NAME_LENGTH + 1, fp);
            if (result < (MAX_NAME_LENGTH + 1)) {
                if (result < 0) {
                    // handle error
                }
                result = -1;
                break;
            }
            result = fwrite(&score, sizeof(int), 1, fp);
            if (result < 1) {
                if (result < 0) {
                    // handle error
                }
                result = -1;
                break;
            }
            written = true;
        } while(false);
    }
    fclose(fp);
    return written;
}