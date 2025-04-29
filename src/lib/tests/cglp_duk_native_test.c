#include "duktape.h"
#include "cglp_duk_native.h"
#include "cglp_duk.h"
#include "cglp.h"
#include "particle.h"

EXTERNC duk_context* ctx;

#define APPROX_EQUAL(f1, f2, fuzz) (abs(f1-f2) < fuzz)

// stubs for machine dependent functions
int tonesPlayed = 0;
float audioTime = 100;
int drawnRects = 0;
int drawnChars = 0;
void md_drawRect(float x, float y, float w, float h, unsigned char r,
    unsigned char g, unsigned char b) { drawnRects += 1; }
void md_drawCharacter(unsigned char(*zzz)[6][3], float x, float y, int hash) { drawnChars += 1; }
void md_clearView(unsigned char r, unsigned char g, unsigned char b) {}
void md_clearScreen(unsigned char r, unsigned char g, unsigned char b) {}
void md_playTone(float freq, float duration, float when) { tonesPlayed++; }
void md_stopTone() {}
float md_getAudioTime() { audioTime += 100; return audioTime;}
void md_initView(int w, int h) {}
void md_consoleLog(char *msg) {
    printf("md_consoleLog: %s\n", msg);
}
int md_readJSGame(char* filename, char* buf, int buflen) {return 0;}
void md_loadJSGames() {}

#define SUCCESS 1
#define FAIL -1
#define SKIP 0

#define TESTLOG(fmt, ...) printf("%s: " fmt "\n", function_name __VA_OPT__(,) __VA_ARGS__)


void duk_debug_print(duk_context* ctx, char* key) {
    // Call JSON.stringify with no arguments
    duk_get_global_string(ctx, "JSON");
    duk_get_prop_string(ctx, -1, "stringify");
    // Get the object to stringify
    duk_get_global_string(ctx, key);
    duk_call(ctx, 1);
    // Get the result string
    const char *result = duk_get_string(ctx, -1);
    printf("duk_debug_print: %s\n", result);
    duk_pop(ctx);  // Pop the result
}

int test_duk_get_characters_persistent(char* function_name) {
    int result = FAIL;

    duk_eval_string_noresult(ctx,
        "characters = [\n"
        "    \"\\n l\\nlll\\nl l\\n\", \n"
        "    \"\\nllllll\\nll l l\\nll l l\\nllllll\\n l  l\\n l  l\\n  \", \n"
        "    \"\\nllllll\\nll l l\\nll l l\\nllllll\\nll  ll\\n  \"\n"
        "];\n"
    );

    char (*characters)[CHARACTER_WIDTH][CHARACTER_HEIGHT + 1];
    duk_get_global_string(ctx, "characters");
    int charactersLength = duk_get_characters_persistent(ctx, -1, &characters);
    duk_pop(ctx);

    if (charactersLength != 3) {
        TESTLOG("charactersLength should be 3 instead of %d", charactersLength);
        goto cleanup;
    }

    char expectedCharacters[][CHARACTER_WIDTH][CHARACTER_HEIGHT + 1] = {{
        "      ",
        "      ",
        "   l  ",
        "  lll ",
        "  l l ",
        "      ",
    },
    {
        "llllll",
        "ll l l",
        "ll l l",
        "llllll",
        " l  l ",
        " l  l ",
    },
    {
        "      ",
        "llllll",
        "ll l l",
        "ll l l",
        "llllll",
        "ll  ll",
    }};
    int expectedCharactersLength = 3;

    int cmpresult = memcmp(
        characters,
        expectedCharacters,
        expectedCharactersLength * CHARACTER_WIDTH * (CHARACTER_HEIGHT + 1) * sizeof(char)
    );

    if (cmpresult != 0) {
        TESTLOG("characters do not match");
        printf("Expected:\n");
        for (int i = 0; i < expectedCharactersLength; i++) {
            for (int j = 0; j < CHARACTER_HEIGHT; j++) {
                printf("%d: %s\n", i, expectedCharacters[i][j]);
            }
        }
        printf("Actual:\n");
        for (int i = 0; i < charactersLength; i++) {
            for (int j = 0; j < CHARACTER_HEIGHT; j++) {
                printf("%d: %s\n", i, characters[i][j]);
            }
        }
    }
    result = SUCCESS;

cleanup:
    if (characters != NULL) {
        free(characters);
    }
    return result;
}

int test_duk_get_string_persistent(char* function_name) {
    int result = FAIL;
    char* fooText = NULL;

    duk_eval_string(ctx, "foo = \"hello world\"");
    duk_pop(ctx);
    duk_get_global_string(ctx, "foo");
    fooText = duk_get_string_persistent(ctx, -1);

    if (fooText == NULL) {
        TESTLOG("Wanted \"hello world\" got NULL");
        goto cleanup;
    }

    if (strncmp(fooText, "hello world", 12) != 0) {
        TESTLOG("Wanted \"hello world\" got \"%s\"", fooText);
        goto cleanup;
    }

    cleanupJS();
    if (strncmp(fooText, "hello world", 12) != 0) {
        TESTLOG("After free wanted \"hello world\" got \"%s\"", fooText);
        goto cleanup;
    }

    result = SUCCESS;

cleanup:
    if (fooText != NULL) {
        free(fooText);
    }
    cleanupJS();
    return result;
}

int test_duk_push_collision(char* function_name) {
    int result = FAIL;
    Collision collision = {0};
    collision.isColliding.character['a'] = 1;
    collision.isColliding.text['b'] = 1;
    collision.isColliding.rect[2] = 1;

    duk_push_collision(ctx, collision);
    duk_put_global_string(ctx, "collision");
    // test values are present in resulting object

    duk_get_global_string(ctx, "collision");
    duk_idx_t collisionIdx = duk_normalize_index(ctx, -1);
    if (!duk_is_object(ctx, collisionIdx)) {
        TESTLOG("'collision' is not an object");
        goto cleanup;
    }

    duk_get_prop_string(ctx, collisionIdx, "isColliding");
    duk_idx_t isCollidingIdx = duk_normalize_index(ctx, -1);
    if (!duk_is_object(ctx, isCollidingIdx)) {
        TESTLOG("'isColliding' is not an object");
        goto cleanup;
    }

    duk_get_prop_string(ctx, isCollidingIdx, "char");
    duk_idx_t charIdx = duk_normalize_index(ctx, -1);
    if (!duk_is_object(ctx, -1)) {
        TESTLOG("'char' is not an object");
        goto cleanup;
    }

    duk_get_prop_string(ctx, isCollidingIdx, "text");
    duk_idx_t textIdx = duk_normalize_index(ctx, -1);
    if (!duk_is_object(ctx, -1)) {
        TESTLOG("'char' is not an object");
        goto cleanup;
    }

    duk_get_prop_string(ctx, isCollidingIdx, "rect");
    duk_idx_t rectIdx = duk_normalize_index(ctx, -1);
    if (!duk_is_object(ctx, -1)) {
        TESTLOG("'char' is not an object");
        goto cleanup;
    }

    duk_get_prop_string(ctx, charIdx, "a");
    if (!duk_is_boolean(ctx, -1) || !duk_to_boolean(ctx, -1)) {
        TESTLOG("'char.a' is not true");
        goto cleanup;
    }

    duk_get_prop_string(ctx, textIdx, "b");
    if (!duk_is_boolean(ctx, -1) || !duk_to_boolean(ctx, -1)) {
        TESTLOG("'text.b' is not true");
        goto cleanup;
    }

    duk_get_prop_string(ctx, rectIdx, "green");
    if (!duk_is_boolean(ctx, -1) || !duk_to_boolean(ctx, -1)) {
        TESTLOG("'rect.green' is not true");
        goto cleanup;
    }

    result = SUCCESS;

    cleanup:
    duk_pop_n(ctx, duk_get_top(ctx) - collisionIdx);
    return result;
}

int test_native_rnd(char* function_name) {
    int result = FAIL;
    duk_float_t returned, returned2;

    initRandomSeed();

    duk_get_global_string(ctx, "rnd");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'rnd' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'rnd' is not a function");
        goto cleanup;
    }

    duk_call(ctx, 0);
    returned = duk_get_number(ctx, -1);
    duk_pop(ctx);
    if (returned > 1.0 || returned < 0.0) {
        TESTLOG("returned value %0.2f from 'rnd()' is outside of expected range", returned);
        goto cleanup;
    }

    duk_get_global_string(ctx, "rnd");
    duk_push_number(ctx, 100);
    duk_call(ctx, 1);
    returned2 = duk_get_number(ctx, -1);
    duk_pop(ctx);
    if (returned2 > 100.0 || returned2 < 0.0) {
        TESTLOG("returned value %0.2f from 'rnd(100)' is outside of expected range", returned2);
        goto cleanup;
    }

    if (returned2 == returned) {
        TESTLOG("random returned same number sequentially");
        goto cleanup;
    }


    duk_get_global_string(ctx, "rnd");
    duk_push_number(ctx, 100);
    duk_push_number(ctx, 200);
    duk_call(ctx, 2);
    returned = duk_get_number(ctx, -1);
    duk_pop(ctx);
    if (returned > 200.0 || returned < 100.0) {
        TESTLOG("returned value %0.2f from 'rnd(100, 200)' is outside of expected range", returned);
        goto cleanup;
    }

    result = SUCCESS;

    cleanup:
    return result;
}

int test_native_rndi(char* function_name) {
    int result = FAIL;
    duk_int_t returned, returned2;

    initRandomSeed();

    duk_get_global_string(ctx, "rndi");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'rndi' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'rndi' is not a function");
        goto cleanup;
    }

    duk_call(ctx, 0);
    returned = duk_get_int(ctx, -1);
    duk_pop(ctx);
    if (returned > 2 || returned < 0) {
        TESTLOG("returned value %d from 'rndi()' is outside of expected range", returned);
        goto cleanup;
    }

    duk_get_global_string(ctx, "rndi");
    duk_push_int(ctx, 1000000);
    duk_call(ctx, 1);
    returned2 = duk_get_int(ctx, -1);
    duk_pop(ctx);
    if (returned2 > 1000000 || returned2 < 0) {
        TESTLOG("returned value %d from 'rndi(1000000)' is outside of expected range", returned2);
        goto cleanup;
    }

    if (returned2 == returned) {
        TESTLOG("random returned same number sequentially: %d", returned);
        goto cleanup;
    }

    duk_get_global_string(ctx, "rndi");
    duk_push_number(ctx, 1000000);
    duk_push_number(ctx, 2000000);
    duk_call(ctx, 2);
    returned = duk_get_int(ctx, -1);
    duk_pop(ctx);
    if (returned > 2000000 || returned < 1000000) {
        TESTLOG("returned value %d from 'rndi(1000000, 2000000)' is outside of expected range", returned);
        goto cleanup;
    }

    result = SUCCESS;

    cleanup:
    return result;
}

int test_native_rnds(char* function_name) {
    int result = FAIL;
    duk_float_t returned, returned2;

    initRandomSeed();

    duk_get_global_string(ctx, "rnds");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'rnds' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'rnds' is not a function");
        goto cleanup;
    }

    duk_call(ctx, 0);
    returned = duk_get_number(ctx, -1);
    duk_pop(ctx);
    if (returned > 1.0 || returned < -1.0) {
        TESTLOG("returned value %0.2f from 'rnds()' is outside of expected range", returned);
        goto cleanup;
    }

    duk_get_global_string(ctx, "rnds");
    duk_push_number(ctx, 100);
    duk_call(ctx, 1);
    returned2 = duk_get_number(ctx, -1);
    duk_pop(ctx);
    if (returned2 > 100.0 || returned2 < -100.0) {
        TESTLOG("returned value %0.2f from 'rnds(100)' is outside of expected range", returned2);
        goto cleanup;
    }

    if (returned2 == returned) {
        TESTLOG("random returned same number sequentially");
        goto cleanup;
    }

    duk_get_global_string(ctx, "rnds");
    duk_push_number(ctx, 100);
    duk_push_number(ctx, 200);
    duk_call(ctx, 2);
    returned = duk_get_number(ctx, -1);
    duk_pop(ctx);
    if (abs(returned) > 200.0 || abs(returned) < 100.0) {
        TESTLOG("returned value %0.2f from 'rnds(100, 200)' is outside of expected range", returned);
        goto cleanup;
    }

    result = SUCCESS;

    cleanup:
    return result;
}

int test_native_color(char* function_name) {
    int result = FAIL;

    duk_get_global_string(ctx, "color");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'color' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'color' is not a function");
        goto cleanup;
    }

    // test by string
    duk_push_string(ctx, "transparent");
    duk_call(ctx, 1);
    duk_pop(ctx);
    if (color != TRANSPARENT) {
        TESTLOG("'color' is not set to %d", TRANSPARENT);
        goto cleanup;
    }
    // test by number also
    duk_get_global_string(ctx, "color");
    duk_push_int(ctx, TRANSPARENT);
    duk_call(ctx, 1);
    duk_pop(ctx);
    if (color != TRANSPARENT) {
        TESTLOG("'color' is not set to %d", TRANSPARENT);
        goto cleanup;
    }

    for (int idx = 0; idx < COLOR_COUNT; idx++) {
        // test by string
        duk_get_global_string(ctx, "color");
        duk_push_string(ctx, colorsAsStrings[idx]);
        duk_call(ctx, 1);
        duk_pop(ctx);
        if (color != idx) {
            TESTLOG("'color' is not set to %d", idx);
            goto cleanup;
        }
        // test by number also
        duk_get_global_string(ctx, "color");
        duk_push_int(ctx, idx);
        duk_call(ctx, 1);
        duk_pop(ctx);
        if (color != idx) {
            TESTLOG("'color' is not set to %d", idx);
            goto cleanup;
        }
    }

    result = SUCCESS;

cleanup:
    return result;
}

int test_native_range(char* function_name) {
    int result = FAIL;

    duk_get_global_string(ctx, "range");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'range' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'range' is not a function");
        goto cleanup;
    }

    for (int idx = 0; idx < 5; idx++) {
        // create the array
        duk_dup(ctx, -1);
        duk_push_int(ctx, idx);
        duk_call(ctx, 1);
        duk_idx_t array_idx = duk_normalize_index(ctx, -1);

        for (int jdx = 0; jdx < idx; jdx++) {
            duk_get_prop_index(ctx, array_idx, jdx);
            int value = duk_get_int(ctx, -1);
            if (value != jdx) {
                TESTLOG("unexpected %d at position %d in range", value, jdx);
                goto cleanup;
            }
            duk_pop(ctx);
        }
        duk_pop(ctx);
    }

    result = SUCCESS;

cleanup:
    duk_pop(ctx);
    return result;
}

int test_native_clamp(char* function_name) {
    int result = FAIL;
    duk_float_t returned, returned2;

    duk_get_global_string(ctx, "clamp");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'clamp' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'clamp' is not a function");
        goto cleanup;
    }

    duk_push_number(ctx, 100);
    duk_call(ctx, 1);
    returned = duk_get_number(ctx, -1);
    duk_pop(ctx);
    if (returned != 1.0) {
        TESTLOG("returned value %0.2f from 'clamp(100)' is not clamped to 1.0", returned);
        goto cleanup;
    }

    duk_get_global_string(ctx, "clamp");
    duk_push_number(ctx, 100);
    duk_push_number(ctx, 50);
    duk_push_number(ctx, 200);
    duk_call(ctx, 3);
    returned = duk_get_number(ctx, -1);
    duk_pop(ctx);
    if (returned != 100.0) {
        TESTLOG("returned value %0.2f from 'clamp(100, 50, 200)' should not be changed", returned);
        goto cleanup;
    }

    duk_get_global_string(ctx, "clamp");
    duk_push_number(ctx, -100);
    duk_push_number(ctx, 50);
    duk_push_number(ctx, 200);
    duk_call(ctx, 3);
    returned = duk_get_number(ctx, -1);
    duk_pop(ctx);
    if (returned != 50.0) {
        TESTLOG("returned value %0.2f from 'clamp(-100, 50, 200)' is not clamped to 50.0", returned);
        goto cleanup;
    }

    result = SUCCESS;

    cleanup:
    return result;
}

int test_native_wrap(char* function_name) {
    int result = FAIL;
    duk_float_t returned;

    duk_get_global_string(ctx, "wrap");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'wrap' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'wrap' is not a function");
        goto cleanup;
    }

    duk_push_number(ctx, 100);
    duk_push_number(ctx, 50);
    duk_push_number(ctx, 200);
    duk_call(ctx, 3);
    returned = duk_get_number(ctx, -1);
    duk_pop(ctx);
    if (returned != 100.0) {
        TESTLOG("returned value %0.2f from 'wrap(100, 50, 200)' should not be changed", returned);
        goto cleanup;
    }

    duk_get_global_string(ctx, "wrap");
    duk_push_number(ctx, -110);
    duk_push_number(ctx, 50);
    duk_push_number(ctx, 200);
    duk_call(ctx, 3);
    returned = duk_get_number(ctx, -1);
    duk_pop(ctx);
    if (returned != 190.0) {
        TESTLOG("returned value %0.2f from 'wrap(-110, 50, 200)' is not wrapped to 190.0", returned);
        goto cleanup;
    }

    result = SUCCESS;

    cleanup:
    return result;
}

int test_native_addScore(char* function_name) {
    int result = FAIL;

    duk_get_global_string(ctx, "addScore");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'addScore' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'addScore' is not a function");
        goto cleanup;
    }

    score = 0;
    // this would usually be set before calling update
    duk_push_number(ctx, score);
    duk_put_global_string(ctx, "score");
    duk_push_number(ctx, 100);
    duk_call(ctx, 1);
    duk_pop(ctx);
    if (score != 100) {
        TESTLOG("addScore(100) does not add 100 to score");
        goto cleanup;
    }

    initScoreBoards();
    // note score is 0 in c, but still 100 in javascript
    // c should be overwritten by javascript value
    score = 0;
    scoreBoards[0].pos.x = 0;
    scoreBoards[0].pos.y = 0;
    duk_get_global_string(ctx, "addScore");
    duk_push_number(ctx, 100);
    duk_push_number(ctx, 80);
    duk_push_number(ctx, 60);
    duk_call(ctx, 3);
    duk_pop(ctx);
    if (score != 200) {
        TESTLOG("addScore(100, 80, 60) when score is 100 does not equal 200");
        goto cleanup;
    }
    if (scoreBoards[0].pos.x == 0) {
        TESTLOG("addScore(100, 80, 60) does not set x in scoreBoards");
        goto cleanup;
    }
    if (scoreBoards[0].pos.y == 0) {
        TESTLOG("addScore(100, 80, 60) does not set y in scoreBoards");
        goto cleanup;
    }

    initScoreBoards();
    // note score is 0 in c, but still 200 in javascript
    // c should be overwritten by javascript value
    score = 0;
    scoreBoards[0].pos.x = 0;
    scoreBoards[0].pos.y = 0;
    duk_get_global_string(ctx, "addScore");
    duk_push_number(ctx, 100);
    duk_idx_t obj_idx = duk_push_object(ctx);
    duk_push_number(ctx, 80);
    duk_put_prop_string(ctx, obj_idx, "x");
    duk_push_number(ctx, 60);
    duk_put_prop_string(ctx, obj_idx, "y");
    duk_call(ctx, 2);
    duk_pop(ctx);
    if (score != 300) {
        TESTLOG("addScore(100, {x:80, y:60}) when score is 100 does not equal 200");
        goto cleanup;
    }
    if (scoreBoards[0].pos.x == 0) {
        TESTLOG("addScore(100, {x:80, y:60) does not set x in scoreBoards");
        goto cleanup;
    }
    if (scoreBoards[0].pos.y == 0) {
        TESTLOG("addScore(100, {x:80, y:60) does not set y in scoreBoards");
        goto cleanup;
    }

    result = SUCCESS;

    cleanup:
    return result;
}

int test_native_addWithCharCode(char* function_name) {
    int result = FAIL;

    duk_get_global_string(ctx, "addWithCharCode");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'addWithCharCode' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'addWithCharCode' is not a function");
        goto cleanup;
    }


    duk_push_string(ctx, "a");
    duk_push_int(ctx, 2);
    duk_call(ctx, 2);
    const char* returned = duk_get_string(ctx, -1);
    duk_pop(ctx);
    if (strlen(returned) <= 0 || returned[0] != 'c') {
        TESTLOG("addWithCharCode(\"a\", 2) does not return \"c\"");
        goto cleanup;
    }

    duk_get_global_string(ctx, "addWithCharCode");
    duk_push_string(ctx, "b");
    duk_push_int(ctx, 4);
    duk_call(ctx, 2);
    returned = duk_get_string(ctx, -1);
    duk_pop(ctx);
    if (strlen(returned) <= 0 || returned[0] != 'f') {
        TESTLOG("addWithCharCode(\"b\", 4) does not return \"f\"");
        goto cleanup;
    }

    result = SUCCESS;

    cleanup:
    return result;
}

int test_native_end(char* function_name) {
    int result = FAIL;

    duk_get_global_string(ctx, "end");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'end' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'end' is not a function");
        goto cleanup;
    }

    duk_call(ctx, 0);
    duk_pop(ctx);

    result = SUCCESS;

    cleanup:
    return result;
}

int test_native_play(char* function_name) {
    int result = FAIL;

    enableSound();

    duk_get_global_string(ctx, "play");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'play' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'play' is not a function");
        goto cleanup;
    }
    duk_pop(ctx);

    for (int idx = 0; idx < SOUND_EFFECT_TYPE_COUNT; idx++) {
        // test by string
        tonesPlayed = 0;
        duk_get_global_string(ctx, "play");
        duk_push_string(ctx, soundsAsStrings[idx]);
        duk_call(ctx, 1);
        duk_pop(ctx);
        if (tonesPlayed == 0) {
            TESTLOG("no tones played for sound '%s'", soundsAsStrings[idx]);
            goto cleanup;
        }
        // test by number also
        tonesPlayed = 0;
        duk_get_global_string(ctx, "play");
        duk_push_int(ctx, idx);
        duk_call(ctx, 1);
        duk_pop(ctx);
        if (tonesPlayed == 0) {
            TESTLOG("no tones played for sound %d", idx);
            goto cleanup;
        }
    }

    result = SUCCESS;

cleanup:
    return result;
}

int test_native_remove(char* function_name) {
    int result = FAIL;

    duk_get_global_string(ctx, "remove");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'remove' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'remove' is not a function");
        goto cleanup;
    }
    duk_pop(ctx);

    duk_eval_string_noresult(ctx,
        "function compare(array1, array2) {\n"
        "  return array1.length === array2.length && array1.every(function(value, index) { return value === array2[index]})}");

    duk_eval_string_noresult(ctx,
        "array = [1,2,3,4,5];\n"
        "func = function(x, i) {\n"
        "  return x % 2 == 1;\n"
        "}\n"
        "removed = remove(array, func)\n"
        "removedOk = compare(removed, [1,3,5])\n"
        "arrayOk = compare(array, [2,4])\n"
    );

    duk_get_global_string(ctx, "removedOk");
    bool removedOk = duk_get_boolean(ctx, -1);
    duk_pop(ctx);

    duk_get_global_string(ctx, "arrayOk");
    bool arrayOk = duk_get_boolean(ctx, -1);
    duk_pop(ctx);

    if (!removedOk) {
        TESTLOG("returned 'removed' array not matching [1,3,5]");
        duk_debug_print(ctx, "removed");
        goto cleanup;
    }

    if (!arrayOk) {
        TESTLOG("input array not matching [2,4]");
        duk_debug_print(ctx, "array");
        goto cleanup;
    }

    duk_eval_string_noresult(ctx,
        "array = [\"ba\", \"be\", \"bi\", \"bo\", \"bu\", \"ca\", \"ce\", \"ci\", \"co\", \"cu\"];\n"
        "func = function(x, i) {\n"
        "    return x[0] == \"b\"\n"
        "}\n"
        "removed = remove(array, func)\n"
        "removedOk = compare(removed, [\"ba\", \"be\", \"bi\", \"bo\", \"bu\"])\n"
        "arrayOk = compare(array, [\"ca\", \"ce\", \"ci\", \"co\", \"cu\"])\n"
    );

    duk_get_global_string(ctx, "removedOk");
    removedOk = duk_get_boolean(ctx, -1);
    duk_pop(ctx);

    duk_get_global_string(ctx, "arrayOk");
    arrayOk = duk_get_boolean(ctx, -1);
    duk_pop(ctx);

    if (!removedOk) {
        TESTLOG("returned 'removed' array not matching [\"ba\", \"be\", \"bi\", \"bo\", \"bu\"]");
        duk_debug_print(ctx, "removed");
        goto cleanup;
    }

    if (!arrayOk) {
        TESTLOG("input array not matching [\"ca\", \"ce\", \"ci\", \"co\", \"cu\"]");
        duk_debug_print(ctx, "array");
        goto cleanup;
    }

    result = SUCCESS;

cleanup:
    return result;
}

int test_native_times(char* function_name) {
    int result = FAIL;

    duk_get_global_string(ctx, "times");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'times' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'times' is not a function");
        goto cleanup;
    }
    duk_pop(ctx);

    duk_eval_string_noresult(ctx,
        "function compare(array1, array2) {\n"
        "  return array1.length === array2.length && array1.every(function(value, index) { return value === array2[index]})}");

    duk_eval_string_noresult(ctx,
        "func = function(x) {\n"
        "  return x % 2;\n"
        "}\n"
        "result = times(5, func)\n"
        "resultOk = compare(result, [0,1,0,1,0])\n"
    );

    duk_get_global_string(ctx, "resultOk");
    bool resultOk = duk_get_boolean(ctx, -1);
    duk_pop(ctx);


    if (!resultOk) {
        TESTLOG("resulting array not matching [0,1,0,1,0]");
        duk_debug_print(ctx, "result");
        goto cleanup;
    }

    duk_eval_string_noresult(ctx,
        "func = function(x) {\n"
        "  return x\n"
        "}\n"
        "result = times(5, func)\n"
        "resultOk = compare(result, [0,1,2,3,4])\n"
    );

    duk_get_global_string(ctx, "resultOk");
    resultOk = duk_get_boolean(ctx, -1);
    duk_pop(ctx);


    if (!resultOk) {
        TESTLOG("resulting array not matching [0,1,2,3,4]");
        duk_debug_print(ctx, "result");
        goto cleanup;
    }

    result = SUCCESS;

cleanup:
    return result;
}

int test_native_rect(char* function_name) {
    int result = FAIL;

    duk_get_global_string(ctx, "rect");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'rect' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'rect' is not a function");
        goto cleanup;
    }
    duk_pop(ctx);

    drawnRects = 0;
    viewSizeX = 100;
    viewSizeY = 100;
    duk_eval_string_noresult(ctx,
        "color(1)\n"
        "rect(10, 20, 30, 40);\n"
        "rect(10, 20, 30);\n"
        "rect(10, 20, {x: 30, y: 40});\n"
        "rect({x: 10, y: 20}, 30, 40);\n"
        "rect({x: 10, y: 20}, 30);\n"
        "rect({x: 10, y: 20}, {x: 30, y: 40});\n"
    );

    if (drawnRects != 6) {
        TESTLOG("drew 6 rects but only received %d", drawnRects);
        goto cleanup;
    }

    result = SUCCESS;

cleanup:
    return result;
}

int test_native_box(char* function_name) {
    int result = FAIL;

    duk_get_global_string(ctx, "box");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'box' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'box' is not a function");
        goto cleanup;
    }
    duk_pop(ctx);

    drawnRects = 0;
    viewSizeX = 100;
    viewSizeY = 100;
    duk_eval_string_noresult(ctx,
        "color(1)\n"
        "box(10, 20, 30, 40);\n"
        "box(10, 20, 30);\n"
        "box(10, 20, {x: 30, y: 40});\n"
        "box({x: 10, y: 20}, 30, 40);\n"
        "box({x: 10, y: 20}, 30);\n"
        "box({x: 10, y: 20}, {x: 30, y: 40});\n"
    );

    if (drawnRects != 6) {
        TESTLOG("drew 6 rects but only received %d", drawnRects);
        goto cleanup;
    }

    result = SUCCESS;

cleanup:
    return result;
}

int test_native_line(char* function_name) {
    int result = FAIL;

    duk_get_global_string(ctx, "line");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'line' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'line' is not a function");
        goto cleanup;
    }
    duk_pop(ctx);

    drawnRects = 0;
    viewSizeX = 100;
    viewSizeY = 100;
    duk_eval_string_noresult(ctx,
        "color(1)\n"
        "line(10, 20, 30, 40, 5);\n"
        "line(10, 20, 30, 40);\n"
        "line(10, 20, {x: 30, y: 40}, 5);\n"
        "line({x: 10, y: 20}, 30, 40, 5);\n"
        "line(10, 20, {x: 30, y: 40});\n"
        "line({x: 10, y: 20}, 30, 40);\n"
        "line({x: 10, y: 20}, {x: 30, y: 40}, 5);\n"
        "line({x: 10, y: 20}, {x: 30, y: 40});\n"
    );

    if (drawnRects < 8) {
        // the number of rects drawn per line is variable
        TESTLOG("drew 8 lines but only received %d draws", drawnRects);
        goto cleanup;
    }

    result = SUCCESS;

cleanup:
    return result;
}

int test_native_char(char* function_name) {
    int result = FAIL;

    duk_get_global_string(ctx, "char");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'char' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'char' is not a function");
        goto cleanup;
    }
    duk_pop(ctx);

    char testchars[][CHARACTER_HEIGHT][CHARACTER_WIDTH + 1] = {{
        "      ",
        "      ",
        "   l  ",
        "  lll ",
        "  l l ",
        "      ",
    },
    {
        "llllll",
        "ll l l",
        "ll l l",
        "llllll",
        " l  l ",
        " l  l ",
    },
    {
        "      ",
        "llllll",
        "ll l l",
        "ll l l",
        "llllll",
        "ll  ll",
    }};
    characters = testchars;
    charactersCount = 3;

    drawnChars = 0;
    viewSizeX = 100;
    viewSizeY = 100;
    duk_eval_string_noresult(ctx,
        "char(\"a\", 10, 20);\n"
        "char(\"b\", 20, 30);\n"
        "char(\"c\", 30, 40, {rotate:90, mirror:{x:-1,y:-1}, color: \"red\"});\n"
    );

    if (drawnChars != 3) {
        TESTLOG("drew 3 chars but only received %d", drawnChars);
        goto cleanup;
    }

    result = SUCCESS;

cleanup:
    return result;
}

int test_native_isVectorLike(char* function_name) {
    int result = FAIL;
    bool returned;

    duk_get_global_string(ctx, "isVectorLike");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'isVectorLike' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'isVectorLike' is not a function");
        goto cleanup;
    }

    duk_idx_t obj_idx = duk_push_object(ctx);
    duk_push_number(ctx, 1.0);
    duk_put_prop_string(ctx, obj_idx, "x");
    duk_push_number(ctx, 1.0);
    duk_put_prop_string(ctx, obj_idx, "y");
    duk_call(ctx, 1);
    returned = duk_get_boolean(ctx, -1);
    duk_pop(ctx);
    if (!returned) {
        TESTLOG("'isVectorLike' erroneously returned false for {x: 1.0, y: 1.0}");
        goto cleanup;
    }

    duk_get_global_string(ctx, "isVectorLike");
    obj_idx = duk_push_object(ctx);
    duk_push_null(ctx);
    duk_put_prop_string(ctx, obj_idx, "x");
    duk_push_number(ctx, 1.0);
    duk_put_prop_string(ctx, obj_idx, "y");
    duk_call(ctx, 1);
    returned = duk_get_boolean(ctx, -1);
    duk_pop(ctx);
    if (returned) {
        TESTLOG("'isVectorLike' erroneously returned true for {x: null, y: 1.0}");
        goto cleanup;
    }

    duk_get_global_string(ctx, "isVectorLike");
    obj_idx = duk_push_object(ctx);
    duk_push_number(ctx, 1.0);
    duk_put_prop_string(ctx, obj_idx, "y");
    duk_call(ctx, 1);
    returned = duk_get_boolean(ctx, -1);
    duk_pop(ctx);
    if (returned) {
        TESTLOG("'isVectorLike' erroneously returned true for {y: 1.0}");
        goto cleanup;
    }

    result = SUCCESS;

cleanup:
    return result;
}

int test_native_arc(char* function_name) {
    int result = FAIL;

    duk_get_global_string(ctx, "arc");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'arc' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'arc' is not a function");
        goto cleanup;
    }
    duk_pop(ctx);

    drawnRects = 0;
    viewSizeX = 100;
    viewSizeY = 100;
    duk_eval_string_noresult(ctx,
        "color(1)\n"
        "arc(10, 20, 30, 5, 0, PI);\n"
        "arc({x:10, y:20}, 30, 5, PI, 3*PI/2);\n"
        "arc({x:10, y:20}, 30, null, null, null);\n"
        "arc({x:10, y:20}, 30);\n"
    );

    if (drawnRects < 4) {
        // the number of rects drawn per line is variable
        TESTLOG("drew 4 arcs but only received %d draws", drawnRects);
        goto cleanup;
    }

    result = SUCCESS;

cleanup:
    return result;
}

int test_native_bar(char* function_name) {
    int result = FAIL;

    duk_get_global_string(ctx, "bar");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'bar' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'bar' is not a function");
        goto cleanup;
    }
    duk_pop(ctx);

    drawnRects = 0;
    viewSizeX = 100;
    viewSizeY = 100;
    duk_eval_string_noresult(ctx,
        "color(1)\n"
        "bar(10, 20, 30, 5, PI, 0.5);\n"
        "bar({x: 10, y: 20}, 30, 5, PI, 0.5);\n"
        "bar(10, 20, 30, 5, null, null);\n"
        "bar(10, 20, 30, 5);\n"
        "bar({x: 10, y: 20}, 30, 5, null, null);\n"
        "bar({x: 10, y: 20}, 30, 5);\n"
    );

    if (drawnRects < 6) {
        // the number of rects drawn per bar is variable
        TESTLOG("drew 6 bars but only received %d draws", drawnRects);
        goto cleanup;
    }

    result = SUCCESS;

cleanup:
    return result;
}

int test_native_particle(char* function_name) {
    int result = FAIL;

    duk_get_global_string(ctx, "particle");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'particle' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'particle' is not a function");
        goto cleanup;
    }
    duk_pop(ctx);

    drawnRects = 0;
    viewSizeX = 100;
    viewSizeY = 100;
    duk_eval_string_noresult(ctx,
        "color(1)\n"
        "particle(10, 20, 30, 5, PI, 0.5);\n"
        "particle({x: 10, y: 20}, 30, 5, PI, 0.5);\n"
        "particle(10, 20, null, 5, null, 0.5);\n"
        "particle(10, 20);\n"
        "particle({x: 10, y: 20});\n"
        "particle(10, 20, {count:30, speed:5, angle:PI, angleWidth: 2*PI});\n"
        "particle({x: 10, y: 20}, {count:30});\n"
    );
    updateParticles(); // to get drawnRects to update

    if (drawnRects < 7) {
        TESTLOG("drew 7 particles but only received %d draws", drawnRects);
        goto cleanup;
    }

    result = SUCCESS;

cleanup:
    return result;
}

int test_native_text(char* function_name) {
    int result = FAIL;

    duk_get_global_string(ctx, "text");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'text' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'text' is not a function");
        goto cleanup;
    }
    duk_pop(ctx);

    drawnChars = 0;
    viewSizeX = 100;
    viewSizeY = 100;
    duk_eval_string_noresult(ctx,
        "color(1)\n"
        "text(\"hello\", 10, 20);\n"
        "text(\"hello\", 10, 20, {rotate:90, mirror:{x:-1,y:-1}, color: \"red\"});\n"
        "text(\"hello\", {x: 10, y: 20});\n"
        "text(\"hello\", {x: 10, y: 20}, {rotate:90, mirror:{x:-1,y:-1}, color: \"red\"});\n"
    );

    if (drawnChars < 4) {
        TESTLOG("drew 4 texts but only received %d draws", drawnChars);
        goto cleanup;
    }

    result = SUCCESS;

cleanup:
    return result;
}

int test_native_vector(char* function_name) {
    int result = FAIL;
    Vector *p, *p1, *p2;
    char ident[3] = "v1";

    duk_get_global_string(ctx, "Vector");
    duk_idx_t class_idx = duk_normalize_index(ctx, -1);
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("class 'Vector' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'Vector' is not a function");
        goto cleanup;
    }

    if (!duk_has_prop_string(ctx, class_idx, "prototype")) {
        TESTLOG("'Vector' does not have a prototype");
        goto cleanup;
    }
    duk_pop(ctx);

    duk_get_global_string(ctx, "vec");
    if (duk_is_undefined(ctx, -1)) {
        TESTLOG("function 'vec' is undefined");
        goto cleanup;
    }

    if (!duk_is_function(ctx, -1)) {
        TESTLOG("'vec' is not a function");
        goto cleanup;
    }
    duk_pop(ctx);


    drawnChars = 0;
    viewSizeX = 100;
    viewSizeY = 100;
    duk_eval_string_noresult(ctx,
        "color(1)\n"
        "var v1 = new Vector(10, 20);\n"
        "var v2 = new Vector({x: 10, y: 20});\n"
        "var v3 = vec({x: 10, y: 20});\n"
        "var v4 = vec(10, 20);\n"
        "function reset_v1234() {v1 = vec(10, 20); v2 = vec(10, 20); v3 = vec(10, 20); v4 = vec(10, 20);};\n"
    );

    for (int i = 1; i <= 4; i++) {
        ident[1] = 0x30 + i;
        duk_get_global_string(ctx, ident);
        duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
        p = (Vector*)duk_get_pointer(ctx, -1);
        duk_pop_2(ctx);

        if (p->x != 10.0 || p->y != 20.0) {
            TESTLOG("%s should be x=10.0, y=20.0 but got x=%0.1f, y=%0.1f", ident, p->x, p->y);
            goto cleanup;
        }
    }

    duk_eval_string_noresult(ctx,
        "v1.x = 25;\n"
        "v3.x = 25;\n"
        "v2.x = v3.x;\n"
        "v1.y = 10;\n"
        "v3.y = 10;\n"
        "v2.y = v3.y;\n"
    );

    for (int i = 1; i <= 3; i++) {
        ident[1] = 0x30 + i;
        duk_get_global_string(ctx, ident);
        duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
        p = (Vector*)duk_get_pointer(ctx, -1);
        duk_pop_2(ctx);

        if (p->x != 25.0 || p->y != 10.0) {
            TESTLOG("%s should be set to x=25.0, y=10.0 but got x=%0.1f, y=%0.1f", ident, p->x, p->y);
            goto cleanup;
        }
    }

    duk_eval_string_noresult(ctx,
        "v2.set(v1);\n"
    );

    duk_get_global_string(ctx, "v1");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p1 = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    duk_get_global_string(ctx, "v2");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p2 = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p1->x != p2->x || p1->y != p2->y) {
        TESTLOG("v1 and v2 should be same; instead v1=(%0.1f, %0.1f) v2=(%0.1f, %0.1f)", p1->x, p2->x, p1->y, p2->y);
        goto cleanup;
    }

    duk_eval_string_noresult(ctx,
        "reset_v1234();\n"
        "v1.add(v2);\n"
        "v2.sub(v1);\n"
        "v3.mul(4);\n"
        "v4.div(2);\n"
    );

    duk_get_global_string(ctx, "v1");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p->x != 20.0 || p->y != 40.0) {
        TESTLOG("after add, v1 should be x=20.0, y=40.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_get_global_string(ctx, "v2");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p->x != -10.0 || p->y != -20.0) {
        TESTLOG("after sub, v2 should be x=-10.0, y=-20.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_get_global_string(ctx, "v3");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p->x != 40.0 || p->y != 80.0) {
        TESTLOG("after mul, v3 should be x=40.0, y=80.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_get_global_string(ctx, "v4");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p->x != 5.0 || p->y != 10.0) {
        TESTLOG("after div, v4 should be x=5.0, y=10.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_eval_string_noresult(ctx,
        "reset_v1234();\n"
        "v1.clamp(0, 10, 0, 10);\n"
        "v2.clamp(0, 10);\n"
        "v3.clamp();\n"
        "v4.wrap(0, 10, 0, 10);\n"
    );

    duk_get_global_string(ctx, "v1");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p->x != 10.0 || p->y != 10.0) {
        TESTLOG("after clamp, v1 should be x=10.0, y=10.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_get_global_string(ctx, "v2");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p->x != 10.0 || p->y != 1.0) {
        TESTLOG("after clamp, v2 should be x=10.0, y=1.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_get_global_string(ctx, "v3");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p->x != 1.0 || p->y != 1.0) {
        TESTLOG("after clamp, v3 should be x=1.0, y=1.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_get_global_string(ctx, "v4");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p->x != 0 || p->y != 0) {
        TESTLOG("after wrap, v4 should be x=0.0, y=0.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_eval_string_noresult(ctx,
        "reset_v1234();\n"
        "v1.swapXy();\n"
        "v2.normalize();\n"
        "var length = v2.length;\n"
    );

    duk_get_global_string(ctx, "v1");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p->x != 20.0 || p->y != 10.0) {
        TESTLOG("after swapXy, v1 should be x=20.0, y=10.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_get_global_string(ctx, "v2");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    duk_get_global_string(ctx, "length");
    float length = duk_get_number(ctx, -1);
    duk_pop(ctx);

    if (p->x < 0 || p->x > 1.0 || p->y < 0 || p->y > 1.0) {
        TESTLOG("after normalize, v2 should be 0<=x<=1.0, 0<=y<=1.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    if (length != 1.0) {
        TESTLOG("after normalize, v2 length should be 1.0; not %0.1f", length);
        goto cleanup;
    }

    duk_eval_string_noresult(ctx,
        "v1.set(2.3, 2.7);\n"
        "v2.set(2.3, 2.7);\n"
        "v3.set(2.3, 2.7);\n"
        "v1.round();\n"
        "v2.floor();\n"
        "v3.ceil();\n"
    );

    duk_get_global_string(ctx, "v1");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p->x != 2.0 || p->y != 3.0) {
        TESTLOG("after round, v1 should be x=2.0, y=3.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_get_global_string(ctx, "v2");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p->x != 2.0 || p->y != 2.0) {
        TESTLOG("after floor, v2 should be x=2.0, y=2.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_get_global_string(ctx, "v3");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p->x != 3.0 || p->y != 3.0) {
        TESTLOG("after ceil, v3 should be x=3.0, y=3.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_eval_string_noresult(ctx,
        "v1.set(1, 1);\n"
        "var angle = v2.angle;\n"
    );

    duk_get_global_string(ctx, "angle");
    float angle = duk_get_number(ctx, -1);
    duk_pop(ctx);

    if (!APPROX_EQUAL(angle, M_PI / 4, 0.05)) {
        TESTLOG("v1 angle should be 0.785398; not %0.6f", angle);
        goto cleanup;
    }

    duk_eval_string_noresult(ctx,
        "var e1 = v2.equals(v2);\n"
        "var e2 = v1.equals(v2);\n"
    );

    duk_get_global_string(ctx, "e1");
    bool equal = duk_get_boolean(ctx, -1);
    duk_pop(ctx);

    if (!equal) {
        TESTLOG("v2 should be equal to v2");
        goto cleanup;
    }

    duk_get_global_string(ctx, "e2");
    equal = duk_get_boolean(ctx, -1);
    duk_pop(ctx);

    if (equal) {
        TESTLOG("v1 should not be equal to v2");
        goto cleanup;
    }

    duk_eval_string_noresult(ctx,
        "v1 = vec(0, 0);\n"
        "v2 = vec(6, 8);\n"
        "var d1 = v2.distanceTo(v2);\n"
        "var d2 = v1.distanceTo(v2);\n"
    );

    duk_get_global_string(ctx, "d1");
    length = duk_get_number(ctx, -1);
    duk_pop(ctx);

    if (length != 0) {
        TESTLOG("distance from v2 to v2 should be 0, not %0.6f", length);
        goto cleanup;
    }

    duk_get_global_string(ctx, "d2");
    length = duk_get_number(ctx, -1);
    duk_pop(ctx);

    if (!APPROX_EQUAL(length, 10.0, 0.05)) {
        TESTLOG("distance from v1 to v2 should be 10.0, not %0.6f", length);
        goto cleanup;
    }

    duk_eval_string_noresult(ctx,
        "var a1 = v2.angleTo(v2);\n"
        "var a2 = v1.angleTo(v2);\n"
    );

    duk_get_global_string(ctx, "a1");
    angle = duk_get_number(ctx, -1);
    duk_pop(ctx);

    if (angle != 0) {
        TESTLOG("angle from v2 to v2 should be 0, not %0.6f", angle);
        goto cleanup;
    }

    duk_get_global_string(ctx, "a2");
    angle = duk_get_number(ctx, -1);
    duk_pop(ctx);

    if (!APPROX_EQUAL(angle, 0.9272952, 0.01)) {
        TESTLOG("angle from v1 to v2 should be 0.9272952, not %0.6f", angle);
        goto cleanup;
    }

    duk_eval_string_noresult(ctx,
        "v1 = vec(0, 1);\n"
        "v1.rotate(PI);\n"
    );

    duk_get_global_string(ctx, "v1");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (!APPROX_EQUAL(p->x, 0.0, 0.0001) || !APPROX_EQUAL(p->y, -1.0, 0.0001)) {
        TESTLOG("after rotate, v1 should be x=0.0, y=-1.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_eval_string_noresult(ctx,
        "v1 = vec(0, 1);\n"
        "v1.addWithAngle(PI, 20);\n"
    );

    duk_get_global_string(ctx, "v1");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (!APPROX_EQUAL(p->x, -20.0, 0.0001) || !APPROX_EQUAL(p->y, 1.0, 0.0001)) {
        TESTLOG("after addWithAngle, v1 should be x=-20.0, y=1.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_eval_string_noresult(ctx,
        "v2 = vec(50, 50);\n"
        "e1 = v2.isInRect(0, 0, 100, 100);\n"
        "e2 = v2.isInRect(0, 0, 1, 1);\n"
    );

    duk_get_global_string(ctx, "e1");
    equal = duk_get_boolean(ctx, -1);
    duk_pop(ctx);

    if (!equal) {
        TESTLOG("v2=(50,50) should be in rect(0, 100, 0, 100)");
        goto cleanup;
    }

    duk_get_global_string(ctx, "e2");
    equal = duk_get_boolean(ctx, -1);
    duk_pop(ctx);

    if (equal) {
        TESTLOG("v2=(50,50) should not be in rect(0, 1, 0, 1)");
        goto cleanup;
    }

    duk_eval_string_noresult(ctx,
        "v1 = vec();\n"
        "v2 = vec(50);\n"
        "v3 = vec(50,50).set();\n"
        "v4 = vec(50,50).set(25);\n"
    );

    duk_get_global_string(ctx, "v1");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p->x != 0.0 || p->y != 0.0) {
        TESTLOG("v1=vec() should be x=0, y=0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_get_global_string(ctx, "v2");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p->x != 50.0 || p->y != 0.0) {
        TESTLOG("v2=vec(50) should be x=50.0, y=0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_get_global_string(ctx, "v3");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p->x != 0.0 || p->y != 0.0) {
        TESTLOG("v3=vec(50,50).set() should be x=0.0, y=0.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    duk_get_global_string(ctx, "v4");
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    p = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);

    if (p->x != 25.0 || p->y != 0.0) {
        TESTLOG("v4=vec(50,50).set(25) should be x=25.0, y=0.0; not x=%0.1f, y=%0.1f", p->x, p->y);
        goto cleanup;
    }

    result = SUCCESS;

cleanup:
    return result;
}

typedef struct {
    int (*testfunc)(char*);
    char* name;
} test_case_t;

#define TEST_CASE(t) {t, #t}

void main() {
    test_case_t tests[] = {
        TEST_CASE(test_duk_get_characters_persistent),
        TEST_CASE(test_duk_get_string_persistent),
        TEST_CASE(test_duk_push_collision),
        TEST_CASE(test_native_rnd),
        TEST_CASE(test_native_rndi),
        TEST_CASE(test_native_rnds),
        TEST_CASE(test_native_color),
        TEST_CASE(test_native_range),
        TEST_CASE(test_native_clamp),
        TEST_CASE(test_native_wrap),
        TEST_CASE(test_native_addScore),
        TEST_CASE(test_native_addWithCharCode),
        TEST_CASE(test_native_end),
        TEST_CASE(test_native_play),
        TEST_CASE(test_native_remove),
        TEST_CASE(test_native_times),
        TEST_CASE(test_native_rect),
        TEST_CASE(test_native_box),
        TEST_CASE(test_native_line),
        TEST_CASE(test_native_char),
        TEST_CASE(test_native_isVectorLike),
        TEST_CASE(test_native_arc),
        TEST_CASE(test_native_bar),
        TEST_CASE(test_native_particle),
        TEST_CASE(test_native_text),
        TEST_CASE(test_native_vector),
    };
    int test_count = sizeof(tests) / sizeof(tests[0]);
    int passed = 0;
    int failed = 0;
    int skipped = 0;
    int result;

    for (int test_idx = 0; test_idx < test_count; test_idx++) {
        int result = initJS();
        if (result < 0) {
            result = FAIL;
        } else {
            duk_idx_t savedTop = duk_get_top(ctx);
            result = tests[test_idx].testfunc(tests[test_idx].name);
            if (ctx != NULL && duk_get_top(ctx) != savedTop) {
                printf("%s: Stack imbalance detected! (saved=%d, current=%d)\n", tests[test_idx].name, savedTop, duk_get_top(ctx));
                result = FAIL;
            }
        }
        cleanupJS();

        if (result > 0) {
            printf("PASS: ");
            passed += 1;
        } else if (result == 0) {
            printf("SKIP: ");
            skipped += 1;
        } else if (result < 0) {
            printf("FAIL: ");
            failed += 1;
        }
        printf("%s\n", tests[test_idx].name);
    }

    printf("%d passed, %d failed, %d skipped\n", passed, failed, skipped);
}