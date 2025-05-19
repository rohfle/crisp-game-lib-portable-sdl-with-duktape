#include "cglp.h"

#include <stdint.h>

#define MAX_NAME_LENGTH 15

typedef struct {
    char name[MAX_NAME_LENGTH + 1];
    // packed specific
    uint32_t offset;
    uint32_t size;
  } game_meta_t;

  typedef struct {
    char magic[2];
    uint16_t count;
    game_meta_t meta[];
  } games_packed_t;

extern const uint8_t packed_start[] asm("_binary_games_bin_start");
extern const uint8_t packed_end[]  asm("_binary_games_bin_end");
const games_packed_t* packed = (games_packed_t*)packed_start;

int md_gameListLoad() {
    // check index item in bounds of packed file
    const game_meta_t* meta = &(packed->meta[packed->count - 1]);
    const bool meta_out_of_bounds = meta < packed_start || meta > (packed_end - sizeof(game_meta_t));
    if (meta_out_of_bounds) {
        return -1;
    }
    return packed->count;
}

const char* md_gameListGetItemName(int idx) {
    // check index item in bounds of packed file
    const game_meta_t* meta = &(packed->meta[idx]);
    const bool meta_out_of_bounds = meta < packed_start || meta > (packed_end - sizeof(game_meta_t));
    if (meta_out_of_bounds) {
        return (const char*)-1;
    }
    // check if name is unterminated
    const bool name_unterminated = meta->name[MAX_NAME_LENGTH] != 0;
    if (name_unterminated) {
        return (const char*)-2;
    }
    return meta->name;
}

int md_gameListReadItemContents(int idx, char** returned) {
    // check index item in bounds of packed file
    const game_meta_t* meta = &(packed->meta[idx]);
    const bool meta_out_of_bounds = meta < packed_start || meta > (packed_end - sizeof(game_meta_t));
    if (meta_out_of_bounds) {
        return -1;
    }

    // check bounds of memory
    const uint8_t* start = packed_start + meta->offset;
    const uint8_t* end = start + meta->size;
    const bool content_out_of_bounds = (
        start < packed_start || start >= packed_end ||
        end <= packed_start || end > packed_end ||
        end < start
    );
    if (content_out_of_bounds) {
        return -2;
    }
    // check if name is terminated
    const bool content_unterminated = *end != 0;
    if (content_unterminated) {
        return -3;
    }
    // return contents
    *returned = (packed_start + packed->meta[idx].offset);
    return packed->meta[idx].size;
}