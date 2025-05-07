#include "cglp.h"
#include "duktape.h"
#include "cglp_duk.h"
#include "cglp_duk_native.h"
#include "cglp_duk_native_vector.h"
#include "duk_print_alert.h"

#include <ctype.h>

#define MAX_FILE_SIZE 32768

const char* CGLP_DUK_SHIM =
    "abs = Math.abs;\n"
    "atan2 = Math.atan2;\n"
    "ceil = Math.ceil;\n"
    "cos = Math.cos;\n"
    "floor = Math.floor;\n"
    "pow = Math.pow;\n"
    "sin = Math.sin;\n"
    "sqrt = Math.sqrt;\n"
    "round = Math.round;\n"
    "PI = Math.PI;\n";

duk_context* ctx = NULL;

void updateJSFrame();

char* getTitleFromFilename(char* filename) {
    char *dot = strchr(filename, '.');
    char* title;
    int length;
    if (!dot) {
        length = strlen(filename);
    } else {
        length = (dot - filename);
    }
    title = calloc(length+1, sizeof(char));
    strncpy(title, filename, length);
    for (size_t i = 0; i < strlen(title); i++) {
        title[i] = toupper(title[i]);
    }
    return title;
}

int addJSGameFromFile(char* filename) {
    char buf[MAX_FILE_SIZE];
    int len = md_readJSGame(filename, buf, sizeof(buf));
    if (len < 0) {
        return -1;
    }
    initJS();
    duk_push_lstring(ctx, (const char *) buf, (duk_size_t) len);
    if (duk_peval(ctx) != 0) {
        /* Use duk_safe_to_string() to convert error into string.  This API
         * call is guaranteed not to throw an error during the coercion.
         */
        printf("Script error: %s\n", duk_safe_to_string(ctx, -1));
        cleanupJS();
        return -1;
    }
    // use strstr to search for "input.pos" in javascript source code
    // to figure out if the game usesMouse
    bool usesMouse = strstr(buf, "input.pos") != NULL;
    // get title
    char* title = getTitleFromFilename(filename);
    duk_get_global_string(ctx, "description");
    char* description = duk_get_string_persistent(ctx, -1);
    duk_pop(ctx);
    char (*characters)[CHARACTER_WIDTH][CHARACTER_HEIGHT + 1];
    duk_get_global_string(ctx, "characters");
    int charactersLength = duk_get_characters_persistent(ctx, -1, &characters);
    duk_pop(ctx);
    Options* options;
    duk_get_global_string(ctx, "options");
    duk_get_options_persistent(ctx, -1, &options);
    duk_pop(ctx);
    addGame(title, description, filename, characters, charactersLength, *options, usesMouse, updateJSFrame);
    cleanupJS();
    return 0;
}

int loadJSGameFromFile(char* filename) {
    initJS();
    char buf[MAX_FILE_SIZE];
    int len = md_readJSGame(filename, buf, sizeof(buf));
    if (len < 0) {
        return -1;
    }
    initJS();
    duk_push_lstring(ctx, (const char *) buf, (duk_size_t) len);
    if (duk_peval(ctx) != 0) {
        /* Use duk_safe_to_string() to convert error into string.  This API
         * call is guaranteed not to throw an error during the coercion.
         */
        printf("Script error: %s\n", duk_safe_to_string(ctx, -1));
        cleanupJS();
        return -1;
    }
    return 0;
}

int initJS() {
    cleanupJS();
    ctx = duk_create_heap_default();
    // ctx = duk_create_heap(my_alloc,
    //     my_realloc,
    //     my_free,
    //     my_udata,
    //     my_fatal);
    if (ctx == NULL) {
        consoleLog("Error while initializing js\n");
        return -1;
    }
    duk_print_alert_init(ctx, 0);

    duk_push_string(ctx, CGLP_DUK_SHIM);
    if (duk_peval(ctx) != 0) {
        consoleLog("Error while loading shim: %s\n", duk_safe_to_string(ctx, -1));
        cleanupJS();
        return -1;
    }
    // TODO: handle errors
    push_native_functions(ctx);
    register_native_vector_class(ctx);
    return 0;
}

void cleanupJS() {
    if (ctx != NULL) {
        duk_destroy_heap(ctx);
        ctx = NULL;
    }
}

bool isJSGame(Game game) {
    return game.update == updateJSFrame;
}

void updateJSFrame() {
    // set inputs
    duk_push_number(ctx, difficulty);
    duk_put_global_string(ctx, "difficulty");
    duk_push_int(ctx, ticks);
    duk_put_global_string(ctx, "ticks");
    duk_push_input(ctx, input);
    duk_put_global_string(ctx, "input");
    duk_push_number(ctx, score);
    duk_put_global_string(ctx, "score");
    // run update function
    duk_get_global_string(ctx, "update");
    duk_int_t rc = duk_pcall(ctx, 0);
    if (rc != DUK_EXEC_SUCCESS) {
        if (duk_is_error(ctx, -1)) {
            /* Accessing .stack might cause an error to be thrown, so wrap this
            * access in a duk_safe_call() if it matters.
            */
            duk_get_prop_string(ctx, -1, "stack");
            printf("error: %s\n", duk_safe_to_string(ctx, -1));
            duk_pop(ctx);
        } else {
            /* Non-Error value, coerce safely to string. */
            printf("error: %s\n", duk_safe_to_string(ctx, -1));
        }
    }
    duk_pop(ctx);
    // get outputs
    duk_get_global_string(ctx, "score");
    score = duk_get_number(ctx, -1);
    duk_pop(ctx);
}