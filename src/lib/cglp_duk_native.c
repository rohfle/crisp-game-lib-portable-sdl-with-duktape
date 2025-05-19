#include "duktape.h"


#include "cglp_duk_native.h"

char* soundsAsStrings[] = {
    "coin",
    "laser",
    "explosion",
    "power_up",
    "hit",
    "jump",
    "select",
    "random",
    "click",
};

char* colorsAsStrings[] = {
    "white",
    "red",
    "green",
    "yellow",
    "blue",
    "purple",
    "cyan",
    "black",
    "light_red",
    "light_green",
    "light_yellow",
    "light_blue",
    "light_purple",
    "light_cyan",
    "light_black",
};

// #define DEBUG_TRACE(x) printf(#x "\n")
#define DEBUG_TRACE(x)

void print_stack(duk_context *ctx) {
    duk_idx_t top = duk_get_top(ctx);
    printf("[");
    for (duk_idx_t i = top - 1; i >= 0; i--) {
        if (i < top - 1) printf(", ");
        duk_dup(ctx, i);
        printf("%s", duk_safe_to_string(ctx, -1));
        duk_pop(ctx);
    }
    printf("]\n");
}

bool parse_vectorlike(duk_context* ctx, duk_idx_t obj_idx, duk_float_t* x, duk_float_t* y) {
    DEBUG_TRACE(parse_vectorlike);
    duk_get_prop_string(ctx, obj_idx, "x");
    *x = duk_get_number(ctx, -1);
    duk_pop(ctx);
    duk_get_prop_string(ctx, obj_idx, "y");
    *y = duk_get_number(ctx, -1);
    duk_pop(ctx);
    return true;
}

bool parse_vectorlike_or_xy(duk_context* ctx, duk_idx_t idx, duk_float_t *x, duk_float_t *y) {
    DEBUG_TRACE(parse_vectorlike_or_xy);
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    bool valid = true;
    if (duk_is_number(ctx, idx)) {
        if (duk_is_number(ctx, idx+1)) {
            *x = duk_get_number(ctx, idx);
            *y = duk_get_number(ctx, idx+1);
        } else {
            valid = false;
        }
    } else {
        valid = parse_vectorlike(ctx, idx, x, y);
    }
    return valid;
}

// same as duk_get_string but returned value is a copy
// returned value will need to be freed later
char* duk_get_string_persistent(duk_context *ctx, duk_idx_t idx) {
    DEBUG_TRACE(duk_get_string_persistent);
    const char *str = duk_get_string(ctx, idx);
    if (!str) {
        return NULL;
    }
    size_t len = strlen(str) + 1;
    char *copy = malloc(len);
    if (!copy) {
        return NULL;
    }
    memcpy(copy, str, len);
    return copy;
}

int duk_push_input(duk_context* ctx, Input input) {
    DEBUG_TRACE(duk_push_input);
    duk_idx_t input_obj_idx = duk_push_object(ctx);
    duk_push_boolean(ctx, input.isPressed);
    duk_put_prop_string(ctx, input_obj_idx, "isPressed");
    duk_push_boolean(ctx, input.isJustPressed);
    duk_put_prop_string(ctx, input_obj_idx, "isJustPressed");
    duk_push_boolean(ctx, input.isJustReleased);
    duk_put_prop_string(ctx, input_obj_idx, "isJustReleased");
    duk_push_vector(ctx, input.pos);
    duk_put_prop_string(ctx, input_obj_idx, "pos");
    return 1;
}

int duk_push_vector(duk_context* ctx, Vector vector) {
    DEBUG_TRACE(duk_push_vector);
    duk_get_global_string(ctx, "Vector");
    duk_push_number(ctx, vector.x);
    duk_push_number(ctx, vector.y);
    duk_call(ctx, 2);
    return 1;
}

int duk_push_collision(duk_context *ctx, Collision collision) {
    // DEBUG_TRACE(duk_push_collision);
    duk_idx_t collision_obj_idx = duk_push_object(ctx);
    duk_idx_t isColliding_obj_idx = duk_push_object(ctx);
    duk_idx_t rect_obj_idx = duk_push_object(ctx);
    duk_idx_t text_obj_idx = duk_push_object(ctx);
    duk_idx_t char_obj_idx = duk_push_object(ctx);
    int i;
    char charString[2];
    for (i = 0; i < COLOR_COUNT; i++) {
        if (collision.isColliding.rect[i]) {
           duk_push_boolean(ctx, true);
           duk_put_prop_string(ctx, rect_obj_idx, colorsAsStrings[i]);
        }
    }
    for (i = '!'; i <= '~'; i++) {
        if (collision.isColliding.text[i]) {
            charString[0] = i;
            charString[1] = '\0';
           duk_push_boolean(ctx, true);
           duk_put_prop_string(ctx, text_obj_idx, charString);
        }
    }
    for (i = 'a'; i <= 'z'; i++) {
        if (collision.isColliding.character[i]) {
            charString[0] = i;
            charString[1] = '\0';
           duk_push_boolean(ctx, true);
           duk_put_prop_string(ctx, char_obj_idx, charString);
        }
    }

    duk_put_prop_string(ctx, isColliding_obj_idx, "char");
    duk_put_prop_string(ctx, isColliding_obj_idx, "text");
    duk_put_prop_string(ctx, isColliding_obj_idx, "rect");
    duk_put_prop_string(ctx, collision_obj_idx, "isColliding");
    return 1;
}

void duk_get_letteroptions(duk_context* ctx, duk_idx_t idx, int* color, CharacterOptions* characterOptions) {
    DEBUG_TRACE(duk_get_letteroptions);
    if (duk_has_prop_string(ctx, idx, "color")) {
       duk_get_prop_string(ctx, idx, "color");
       parse_color(ctx, -1, color);
       duk_pop(ctx);
    }

    if (duk_has_prop_string(ctx, idx, "mirror")) {
       duk_get_prop_string(ctx, idx, "mirror");
       duk_idx_t mirrorIdx = duk_normalize_index(ctx, -1);
        if (duk_has_prop_string(ctx, mirrorIdx, "x")) {
           duk_get_prop_string(ctx, mirrorIdx, "x");
            characterOptions->isMirrorX = (duk_get_int(ctx, -1) == -1);
           duk_pop(ctx);
        }
        if (duk_has_prop_string(ctx, mirrorIdx, "y")) {
           duk_get_prop_string(ctx, mirrorIdx, "y");
            characterOptions->isMirrorY = (duk_get_int(ctx, -1) == -1);
           duk_pop(ctx);
        }
       duk_pop(ctx);
    }

    if (duk_has_prop_string(ctx, idx, "rotation")) {
       duk_get_prop_string(ctx, idx, "rotation");
        characterOptions->rotation = duk_get_int(ctx, -1);
       duk_pop(ctx);
    }
}

duk_ret_t native_rnd(duk_context* ctx) {
    DEBUG_TRACE(native_rnd);
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    duk_double_t low = 0;
    duk_double_t high = 1;
    if (n == 1) {
        high = duk_to_number(ctx, 0);
    } else if (n == 2) {
        low =  duk_to_number(ctx, 0);
        high = duk_to_number(ctx, 1);
    }
    duk_float_t result = rnd(low, high);
	duk_push_number(ctx, result);
	return 1;  /* one return value */
}

duk_ret_t native_rndi(duk_context* ctx) {
    DEBUG_TRACE(native_rndi);
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    duk_int_t low = 0;
    duk_int_t high = 2;
    if (n == 1) {
        high = duk_to_int(ctx, 0);
    } else if (n == 2) {
        low =  duk_to_int(ctx, 0);
        high = duk_to_int(ctx, 1);
    }
	duk_push_int(ctx, rndi(low, high));
	return 1;  /* one return value */
}

duk_ret_t native_rnds(duk_context* ctx) {
    DEBUG_TRACE(native_rnds);
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    duk_double_t low = 0;
    duk_double_t high = 1;
    if (n == 1) {
        high = duk_to_number(ctx, 0);
    } else if (n == 2) {
        low =  duk_to_number(ctx, 0);
        high = duk_to_number(ctx, 1);
    }
    duk_float_t result = rnd(low, high);
    duk_int_t sign = rndi(0, 2) * 2 - 1;
	duk_push_number(ctx, result * (float)sign);
	return 1;  /* one return value */
}

bool parse_color(duk_context* ctx, duk_idx_t idx, int* color) {
    if (duk_is_number(ctx, idx)) {
        *color = duk_get_int(ctx, idx);
        return true;
    } else if (duk_is_string(ctx, idx)) {
        const char* colorStr = duk_get_string(ctx, idx);
        if (strncmp(colorStr, "transparent", 5) == 0) {
            *color = TRANSPARENT;
            return true;
        }
        for (int i = 0; i < COLOR_COUNT; i++) {
            if (strncmp(colorStr, colorsAsStrings[i], 10) == 0) {
                *color = i;
                return true;
            }
        }
    }
    return false;
}

duk_ret_t native_color(duk_context* ctx) {
    DEBUG_TRACE(native_color);
    parse_color(ctx, 0, &color);
    return 0;
}

duk_ret_t native_range(duk_context* ctx) {
    DEBUG_TRACE(native_range);
    const duk_int_t count = duk_get_int(ctx, 0);
    duk_idx_t arr_idx = duk_push_array(ctx);

    for (int idx = 0; idx < count; idx++) {
       duk_push_int(ctx, idx);
       duk_put_prop_index(ctx, arr_idx, idx);
    }
    return 1;
}

duk_ret_t native_clamp(duk_context* ctx) {
    DEBUG_TRACE(native_clamp);
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    const duk_float_t value = duk_get_number(ctx, 0);
    duk_float_t low;
    duk_float_t high;

    parse_clamp(ctx, 1, n, &low, &high);
    float result = clamp(value, low, high);
    duk_push_number(ctx, result);
    return 1;
}

duk_ret_t native_wrap(duk_context* ctx) {
    DEBUG_TRACE(native_wrap);
    const duk_float_t value = duk_get_number(ctx, 0);
    const duk_float_t low = duk_get_number(ctx, 1);
    const duk_float_t high = duk_get_number(ctx, 2);
    // TODO: check arguments
    float result = wrap(value, low, high);
    duk_push_number(ctx, result);
   return 1;
}

duk_ret_t native_addScore(duk_context* ctx) {
    DEBUG_TRACE(native_addScore);
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    duk_float_t x, y;
    duk_float_t scoreDelta = duk_to_number(ctx, 0);
    bool valid = true;
    // get score from duktape as it might have changed
    duk_get_global_string(ctx, "score");
    score = duk_get_number(ctx, -1);
    duk_pop(ctx);
    if (n == 1) {
        score += scoreDelta;
    } else if (n >= 2) {
        valid = parse_vectorlike_or_xy(ctx, 1, &x, &y);
        if (valid) {
            addScore(scoreDelta, x, y);
        }
    }
    // push score to duktape afterwards
    duk_push_number(ctx, score);
    duk_put_global_string(ctx, "score");
	return 0;  /* no return value */
}

duk_ret_t native_addWithCharCode(duk_context* ctx) {
    // DEBUG_TRACE(native_addWithCharCode);
    const char* charCode = duk_get_string(ctx, 0);
    if (charCode == NULL || charCode[0] == '\0') {
        // From JS version:
        // String.fromCharCode(char.charCodeAt(0) + 1) returns '\0'
        duk_push_string(ctx, "");
        return 1;
    }
    const duk_int_t offset = duk_get_int(ctx, 1);

    char addWithCharCodeResult[2] = {0};
    addWithCharCodeResult[0] = charCode[0] + offset;
    duk_push_string(ctx, addWithCharCodeResult);
    return 1;
}

duk_ret_t native_end(duk_context* ctx) {
    DEBUG_TRACE(native_end);
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    if (n >= 1) {
        // TODO: support custom game over text
        // There is currently no way to do this
    }
    gameOver();
    return 0;
}

duk_ret_t native_play(duk_context* ctx) {
    DEBUG_TRACE(native_play);
    // TODO: support or error on options
    // currently this is platform specific
    if (duk_is_number(ctx, 0)) {
        play(duk_get_int(ctx, 0));
        return 0;
    } else if (duk_is_string(ctx, 0)) {
        const char* soundStr = duk_get_string(ctx, 0);
        for (int i = 0; i < SOUND_EFFECT_TYPE_COUNT; i++) {
            if (strncmp(soundStr, soundsAsStrings[i], 10) == 0) {
                play(i);
                return 0;
            }
        }
    }
    return 0;
}

duk_ret_t native_remove(duk_context* ctx) {
    DEBUG_TRACE(native_remove);
    duk_idx_t removed_idx = duk_push_array(ctx);
    int removed_len = 0;
    duk_idx_t array_idx = 0;
    duk_idx_t func_idx = 1;
    for (duk_size_t i = 0, index = 0; i < duk_get_length(ctx, array_idx); index++) {
       duk_dup(ctx, func_idx);
       duk_get_prop_index(ctx, array_idx, i);
       duk_push_int(ctx, index);
       duk_call(ctx, 2);
        if (duk_get_boolean(ctx, -1)) {
           duk_get_prop_index(ctx, array_idx, i);
           duk_put_prop_index(ctx, removed_idx, removed_len);
            removed_len += 1;
           duk_push_string(ctx, "splice");
           duk_push_int(ctx, i);
           duk_push_int(ctx, 1);
           duk_call_prop(ctx, array_idx, 2);
           duk_pop(ctx);
        } else {
            i++;
        }
       duk_pop(ctx);
    }

    duk_push_number(ctx, removed_len);
    duk_put_prop_string(ctx, removed_idx, "length");
    return 1;
}

duk_ret_t native_times(duk_context* ctx) {
    DEBUG_TRACE(native_times);
    duk_idx_t results_idx = duk_push_array(ctx);
    int results_len = 0;

    const duk_int_t count = duk_get_int(ctx, 0);
    const duk_idx_t func_idx = 1;
    for (int idx = 0; idx < count; idx++) {
        // use function over and over
       duk_dup(ctx, func_idx);
       duk_push_int(ctx, idx);
       duk_call(ctx, 1);
       duk_put_prop_index(ctx, results_idx, results_len);
        results_len += 1;
    }
    duk_push_number(ctx, results_len);
    duk_put_prop_string(ctx, results_idx, "length");
    return 1;
}

duk_ret_t native_rect(duk_context* ctx) {
    DEBUG_TRACE(native_rect);
    duk_float_t x, y, w, h;
    Collision collision;
    bool valid = parse_rect(ctx, &x, &y, &w, &h);

    if (valid) {
        collision = rect(x, y, w, h);
    }
    duk_push_collision(ctx, collision);
    return 1;
}

duk_ret_t native_box(duk_context* ctx) {
    DEBUG_TRACE(native_box);
    duk_float_t x, y, w, h;
    Collision collision;
    bool valid = parse_rect(ctx, &x, &y, &w, &h);

    if (valid) {
        collision = box(x, y, w, h);
    }
    duk_push_collision(ctx, collision);
    return 1;
}

duk_ret_t native_bar(duk_context* ctx) {
    DEBUG_TRACE(native_bar);
    // function bar(x, y, length, thickness, rotate, centerPosRatio) {}
    duk_float_t x, y, length, angle;
    Collision collision;
    bool valid = parse_bar(ctx, &x, &y, &length, &thickness, &angle, &barCenterPosRatio);
    if (valid) {
        collision = bar(x, y, length, angle);
    }
    thickness = 3; // reset thickness
    barCenterPosRatio = 0.5f; // reset barCenterPosRatio
    duk_push_collision(ctx, collision);
    return 1;
}

duk_ret_t native_line(duk_context* ctx) {
    DEBUG_TRACE(native_line);
    // function line(x1, y1, x2, y2, thickness) {}
    duk_float_t x1, y1, x2, y2;
    x1 = y1 = x2 = y2 = 0;
    Collision collision;
    bool valid = parse_line(ctx, &x1, &y1, &x2, &y2, &thickness);
    if (valid) {
        collision = line(x1, y1, x2, y2);
    }
    duk_push_collision(ctx, collision);
    thickness = 3; // reset thickness
    return 1;

}

duk_ret_t native_char(duk_context* ctx) {
    DEBUG_TRACE(native_char);
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    const char* msg = duk_to_string(ctx, 0);

    duk_float_t x, y;
    duk_idx_t extra_idx;
    if (duk_is_number(ctx, 1)) {
        x = duk_get_number(ctx, 1);
        y = duk_get_number(ctx, 2);
        extra_idx = 3;
    } else {
       duk_get_prop_string(ctx, 1, "x");
        x = duk_get_number(ctx, -1);
       duk_get_prop_string(ctx, 1, "y");
        y = duk_get_number(ctx, -1);
       duk_pop_2(ctx);
        extra_idx = 2;
    }

    if (extra_idx < n) {
        saveCurrentColorAndCharacterOptions();
        duk_get_letteroptions(ctx, extra_idx, &color, &characterOptions);
    }
    Collision collision = character((char*)msg, x, y);
    if (extra_idx < n) {
        loadCurrentColorAndCharacterOptions();
    }
    duk_push_collision(ctx, collision);
    return 1;
}

duk_ret_t native_isVectorLike(duk_context* ctx) {
    DEBUG_TRACE(native_isVectorLike);
    duk_get_prop_string(ctx, 0, "x");
    duk_get_prop_string(ctx, 0, "y");
    bool result = !duk_is_null_or_undefined(ctx, -1) && !duk_is_null_or_undefined(ctx, -2);
    duk_pop_2(ctx);
    duk_push_boolean(ctx, result);
    return 1;
}

duk_ret_t native_arc(duk_context* ctx) {
    DEBUG_TRACE(native_arc);
    duk_float_t centerX, centerY, radius, angleFrom, angleTo;
    Collision collision;
    bool valid = parse_arc(ctx, &centerX, &centerY, &radius, &thickness, &angleFrom, &angleTo);
    if (valid) {
        collision = arc(centerX, centerY, radius, angleFrom, angleTo);
    }
    thickness = 3; // reset thickness
    duk_push_collision(ctx, collision);
    return 1;
}

duk_ret_t native_particle(duk_context* ctx) {
    DEBUG_TRACE(native_particle);
    duk_float_t x, y, count, speed, angle, angleWidth;
    bool valid = parse_particle(ctx, &x, &y, &count, &speed, &angle, &angleWidth);
    if (valid) {
        particle(x, y, count, speed, angle, angleWidth);
    }
    return 0;
}

duk_ret_t native_text(duk_context* ctx) {
    DEBUG_TRACE(native_text);
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    duk_float_t x;
    duk_float_t y;

    const char* msg = duk_to_string(ctx, 0);
    duk_idx_t extra_idx;
    if (duk_is_number(ctx, 1)) {
        x = duk_get_number(ctx, 1);
        y = duk_get_number(ctx, 2);
        extra_idx = 3;
    } else {
       duk_get_prop_string(ctx, 1, "x");
        x = duk_get_number(ctx, -1);
       duk_get_prop_string(ctx, 1, "y");
        y = duk_get_number(ctx, -1);
       duk_pop_2(ctx);
        extra_idx = 2;
    }

    if (extra_idx < n) {
        saveCurrentColorAndCharacterOptions();
        duk_get_letteroptions(ctx, extra_idx, &color, &characterOptions);
    }
    Collision collision = text((char *)msg, x, y);
    if (extra_idx < n) {
        loadCurrentColorAndCharacterOptions();
    }
    duk_push_collision(ctx, collision);
    return 1;
}

duk_idx_t parse_clamp(duk_context* ctx, duk_idx_t idx, duk_idx_t stack_length, duk_float_t* low, duk_float_t* high) {
    DEBUG_TRACE(parse_clamp);
    *low = 0;
    *high = 1;

    if (idx < stack_length) {
        if (!duk_is_null_or_undefined(ctx, idx)) {
            *low = duk_get_number(ctx, idx);
        }
        idx += 1;
    }

    if (idx < stack_length) {
        if (!duk_is_null_or_undefined(ctx, idx)) {
            *high = duk_get_number(ctx, idx);
        }
        idx += 1;
    }
    return idx;
}

bool parse_rect(duk_context* ctx, duk_float_t* x, duk_float_t* y, duk_float_t* w,  duk_float_t* h) {
    DEBUG_TRACE(parse_rect);
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    bool valid = false;

    if (n == 4) {
        // 4: x, y, w, h
        *x = duk_get_number(ctx, 0);
        *y = duk_get_number(ctx, 1);
        *w = duk_get_number(ctx, 2);
        *h = duk_get_number(ctx, 3);
        valid = true;
    } else if (n == 3) {
        if (duk_is_number(ctx, 0)) {
            *x = duk_get_number(ctx, 0);
            *y = duk_get_number(ctx, 1);
            if (duk_is_number(ctx, 2)) {
                // 3: x, y, w, w
                *w = duk_get_number(ctx, 2);
                *h = *w;
                valid = true;
            } else {
                // 3: x, y, w.x, w.y
                valid = parse_vectorlike(ctx, 2, w, h);
            }
        } else {
            // 3: x.x, x.y, y, w
            valid = parse_vectorlike(ctx, 0, x, y);
            *w = duk_get_number(ctx, 1);
            *h = duk_get_number(ctx, 2);
        }
    } else if (n == 2) {
        if (duk_is_number(ctx, 1)) {
            // 2: x.x, x.y, y, y
            valid = parse_vectorlike(ctx, 0, x, y);
            *w = duk_get_number(ctx, 1);
            *h = *w;
        } else {
            // 2: x.x, x.y, y.x, y.y
            valid = parse_vectorlike(ctx, 0, x, y);
            valid &= parse_vectorlike(ctx, 1, w, h);
        }
    }
    return valid;
}

bool parse_line(duk_context* ctx, duk_float_t* x1, duk_float_t* y1, duk_float_t* x2,  duk_float_t* y2, duk_float_t* thickness) {
    DEBUG_TRACE(parse_line);
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    bool valid = false;
    *thickness = 3; // default

    if (n == 5) {
        // 5: x1, y1, x2, y2, thickness
        *x1 = duk_get_number(ctx, 0);
        *y1 = duk_get_number(ctx, 1);
        *x2 = duk_get_number(ctx, 2);
        *y2 = duk_get_number(ctx, 3);
        *thickness = duk_get_number(ctx, 4);
        valid = true;
    } else if (n == 4) {
        if (duk_is_number(ctx, 0)) {
            if (duk_is_number(ctx, 2)) {
                // 4: x1, y1, x2, y2
                *x1 = duk_get_number(ctx, 0);
                *y1 = duk_get_number(ctx, 1);
                *x2 = duk_get_number(ctx, 2);
                *y2 = duk_get_number(ctx, 3);
                valid = true;
            } else {
                // 4: x1, y1, x2.x, x2.y, thickness=y2
                *x1 = duk_get_number(ctx, 0);
                *y1 = duk_get_number(ctx, 1);
                valid = parse_vectorlike(ctx, 2, x2, y2);
                *thickness = duk_get_number(ctx, 3);
            }
        } else {
            // 4: x1.x, x1.y, y1, x2, thickness=y2
            valid = parse_vectorlike(ctx, 0, x1, y1);
            *x2 = duk_get_number(ctx, 1);
            *y2 = duk_get_number(ctx, 2);
            *thickness = duk_get_number(ctx, 3);
        }
    } else if (n == 3) {
        if (duk_is_number(ctx, 0)) {
            // 3: x1, y1, x2.x, x2.y
            *x1 = duk_get_number(ctx, 0);
            *y1 = duk_get_number(ctx, 1);
            valid = parse_vectorlike(ctx, 2, x2, y2);
        } else {
            if (duk_is_number(ctx, 1)) {
                // 3: x1.x, x1.y, y1, x2
                valid = parse_vectorlike(ctx, 0, x1, y1);
                *x2 = duk_get_number(ctx, 1);
                *y2 = duk_get_number(ctx, 2);
            } else {
                // 3: x1.x, x1.y, y1.x, y1.y, thickness=x2
                valid = parse_vectorlike(ctx, 0, x1, y1);
                valid &= parse_vectorlike(ctx, 1, x2, y2);
                *thickness = duk_get_number(ctx, 2);
            }
        }
    } else if (n == 2) {
        // 2: x1.x, x1.y, y1.x, y1.y
        valid = parse_vectorlike(ctx, 0, x1, y1);
        valid &= parse_vectorlike(ctx, 1, x2, y2);
    }

    return valid;
}

bool parse_arc(
    duk_context* ctx,
    duk_float_t* centerX,
    duk_float_t* centerY,
    duk_float_t* radius,
    duk_float_t* thickness,
    duk_float_t* angleFrom,
    duk_float_t* angleTo
) {
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    duk_idx_t extra_idx;
    if (duk_is_number(ctx, 0)) {
        *centerX = duk_get_number(ctx, 0);
        *centerY = duk_get_number(ctx, 1);
        extra_idx = 2;
    } else {
       duk_get_prop_string(ctx, 0, "x");
        *centerX = duk_get_number(ctx, -1);
       duk_get_prop_string(ctx, 0, "y");
        *centerY = duk_get_number(ctx, -1);
       duk_pop_2(ctx);
        extra_idx = 1;
    }

    *radius = duk_get_number(ctx, extra_idx);
    *thickness = 3;
    *angleFrom = 0;
    *angleTo = M_PI * 2;

    extra_idx += 1;
    if (extra_idx < n && !duk_is_null_or_undefined(ctx, extra_idx)) {
        *thickness = duk_get_number(ctx, extra_idx);
    }

    extra_idx += 1;
    if (extra_idx < n && !duk_is_null_or_undefined(ctx, extra_idx)) {
        *angleFrom = duk_get_number(ctx, extra_idx);
    }

    extra_idx += 1;
    if (extra_idx < n && !duk_is_null_or_undefined(ctx, extra_idx)) {
        *angleTo = duk_get_number(ctx, extra_idx);
    }
    // TODO: catch some bad calls
    return true;
}

bool parse_bar(
    duk_context* ctx,
    duk_float_t* x,
    duk_float_t* y,
    duk_float_t* length,
    duk_float_t* thickness,
    duk_float_t* angle,
    duk_float_t* barCenterPosRatio
) {
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    duk_idx_t extra_idx;
    if (duk_is_number(ctx, 0)) {
        *x = duk_get_number(ctx, 0);
        *y = duk_get_number(ctx, 1);
        extra_idx = 2;
    } else {
       duk_get_prop_string(ctx, 0, "x");
        *x = duk_get_number(ctx, -1);
       duk_get_prop_string(ctx, 0, "y");
        *y = duk_get_number(ctx, -1);
       duk_pop_2(ctx);
        extra_idx = 1;
    }

    *length = duk_get_number(ctx, extra_idx);
    extra_idx += 1;
    *thickness = duk_get_number(ctx, extra_idx);


    *angle = 0.5;
    *barCenterPosRatio = 0.5;
    extra_idx += 1;
    if (extra_idx < n && !duk_is_null_or_undefined(ctx, extra_idx)) {
        *angle = duk_get_number(ctx, extra_idx);
    }

    extra_idx += 1;
    if (extra_idx < n && !duk_is_null_or_undefined(ctx, extra_idx)) {
        *barCenterPosRatio = duk_get_number(ctx, extra_idx);
    }

    // TODO: catch some bad calls
    return true;
}

bool parse_particle(
    duk_context* ctx,
    duk_float_t* x,
    duk_float_t* y,
    duk_float_t* count,
    duk_float_t* speed,
    duk_float_t* angle,
    duk_float_t* angleWidth
) {
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    duk_idx_t extra_idx;
    if (duk_is_number(ctx, 0)) {
        *x = duk_get_number(ctx, 0);
        *y = duk_get_number(ctx, 1);
        extra_idx = 2;
    } else {
       duk_get_prop_string(ctx, 0, "x");
        *x = duk_get_number(ctx, -1);
       duk_get_prop_string(ctx, 0, "y");
        *y = duk_get_number(ctx, -1);
       duk_pop_2(ctx);
        extra_idx = 1;
    }


    *count = 16;
    *speed = 1;
    *angle = 0;
    *angleWidth = M_PI * 2;

    if (extra_idx >= n) {
        return true;
    }

    if (duk_is_number(ctx, extra_idx) || duk_is_null_or_undefined(ctx, extra_idx)) {
        if (extra_idx < n && !duk_is_null_or_undefined(ctx, extra_idx)) {
            *count = duk_get_number(ctx, extra_idx);
        }
        extra_idx += 1;
        if (extra_idx < n && !duk_is_null_or_undefined(ctx, extra_idx)) {
            *speed = duk_get_number(ctx, extra_idx);
        }
        extra_idx += 1;
        if (extra_idx < n && !duk_is_null_or_undefined(ctx, extra_idx)) {
            *angle = duk_get_number(ctx, extra_idx);
        }
        extra_idx += 1;
        if (extra_idx < n && !duk_is_null_or_undefined(ctx, extra_idx)) {
            *angleWidth = duk_get_number(ctx, extra_idx);
        }
    } else {
        // in an object
        if (duk_has_prop_string(ctx, extra_idx, "count")) {
           duk_get_prop_string(ctx, extra_idx, "count");
            if (!duk_is_null_or_undefined(ctx, -1)) {
                *count = duk_get_number(ctx, -1);
            }
           duk_pop(ctx);
        }
        if (duk_has_prop_string(ctx, extra_idx, "speed")) {
           duk_get_prop_string(ctx, extra_idx, "speed");
            if (!duk_is_null_or_undefined(ctx, -1)) {
                *speed = duk_get_number(ctx, -1);
            }
           duk_pop(ctx);
        }
        if (duk_has_prop_string(ctx, extra_idx, "angle")) {
           duk_get_prop_string(ctx, extra_idx, "angle");
            if (!duk_is_null_or_undefined(ctx, -1)) {
                *angle = duk_get_number(ctx, -1);
            }
           duk_pop(ctx);
        }
        if (duk_has_prop_string(ctx, extra_idx, "angleWidth")) {
           duk_get_prop_string(ctx, extra_idx, "angleWidth");
            if (!duk_is_null_or_undefined(ctx, -1)) {
                *angleWidth = duk_get_number(ctx, -1);
            }
           duk_pop(ctx);
        }
    }

    // TODO: catch some bad calls
    return true;
}


void push_native_functions(duk_context* ctx) {
    DEBUG_TRACE(push_native_functions);
    // Define crisp-game-lib library functions
    duk_push_c_function(ctx, native_rnd, DUK_VARARGS);
    duk_put_global_string(ctx, "rnd");
    duk_push_c_function(ctx, native_rndi, DUK_VARARGS);
    duk_put_global_string(ctx, "rndi");
    duk_push_c_function(ctx, native_rnds, DUK_VARARGS);
    duk_put_global_string(ctx, "rnds");
    duk_push_c_function(ctx, native_addScore, DUK_VARARGS);
    duk_put_global_string(ctx, "addScore");
    duk_push_c_function(ctx, native_arc, DUK_VARARGS);
    duk_put_global_string(ctx, "arc");
    duk_push_c_function(ctx, native_bar, DUK_VARARGS);
    duk_put_global_string(ctx, "bar");
    duk_push_c_function(ctx, native_box, DUK_VARARGS);
    duk_put_global_string(ctx, "box");
    duk_push_c_function(ctx, native_char, DUK_VARARGS);
    duk_put_global_string(ctx, "char");
    duk_push_c_function(ctx, native_color, 1);
    duk_put_global_string(ctx, "color");
    duk_push_c_function(ctx, native_end, DUK_VARARGS);
    duk_put_global_string(ctx, "end");
    duk_push_c_function(ctx, native_line, DUK_VARARGS);
    duk_put_global_string(ctx, "line");
    duk_push_c_function(ctx, native_particle, DUK_VARARGS);
    duk_put_global_string(ctx, "particle");
    duk_push_c_function(ctx, native_play, DUK_VARARGS);
    duk_put_global_string(ctx, "play");
    duk_push_c_function(ctx, native_rect, DUK_VARARGS);
    duk_put_global_string(ctx, "rect");
    duk_push_c_function(ctx, native_text, DUK_VARARGS);
    duk_put_global_string(ctx, "text");
    duk_push_c_function(ctx, native_range, 1);
    duk_put_global_string(ctx, "range");
    duk_push_c_function(ctx, native_clamp, DUK_VARARGS);
    duk_put_global_string(ctx, "clamp");
    duk_push_c_function(ctx, native_wrap, 3);
    duk_put_global_string(ctx, "wrap");
    duk_push_c_function(ctx, native_addWithCharCode, 2);
    duk_put_global_string(ctx, "addWithCharCode");
    duk_push_c_function(ctx, native_remove, 2);
    duk_put_global_string(ctx, "remove");
    duk_push_c_function(ctx, native_times, 2);
    duk_put_global_string(ctx, "times");
    duk_push_c_function(ctx, native_isVectorLike, 1);
    duk_put_global_string(ctx, "isVectorLike");
}

bool find_character_bounds(const char* str, int strlen, int* start, int* finish, int* width, int* height) {
    DEBUG_TRACE(find_character_bounds);
    int cidx;
    *start = 0;
    *finish = strlen - 1;
    // search for active part of character
    for (cidx = 0; cidx < strlen; cidx++) {
        if (str[cidx] == '\n') {
            *start = cidx + 1;
            break;
        }
    }

    if (cidx >= strlen || *start >= strlen) {
        return false; // empty character, ignore
    }

    for (cidx = strlen - 1; cidx >= 0; cidx--) {
        if (str[cidx] == '\n') {
            *finish = cidx - 1;
            break;
        }
    }

    int w = 0;
    *width = 0;
    *height = 1;
    for (cidx = *start; cidx <= *finish; cidx++) {
        if (str[cidx] == '\n') {
            *height += 1;
            *width = MAX(w, *width);
            w = 0;
        } else {
            w += 1;
        }
    }

    return true;
}

// pretty sure these dimensions are wrong order and need to be swapped
int duk_get_characters_persistent(duk_context* ctx, duk_idx_t idx, char(**characters)[CHARACTER_WIDTH][CHARACTER_HEIGHT + 1]) {
    DEBUG_TRACE(duk_get_characters_persistent);
    duk_idx_t arr_idx = duk_normalize_index(ctx, idx);
    int charactersLength = duk_get_length(ctx, arr_idx);
    int sz = charactersLength * CHARACTER_WIDTH * (CHARACTER_HEIGHT + 1) * sizeof(char);
    *characters = malloc(sz);
    memset(*characters, ' ', sz);

    for (int charidx = 0; charidx < charactersLength; charidx++) {
        // add null termination
        for (int y = 0; y < CHARACTER_WIDTH; y++) {
            (*characters)[charidx][y][CHARACTER_HEIGHT] = '\0';
        }

        duk_get_prop_index(ctx, arr_idx, charidx);
        if (!duk_is_string(ctx, -1)) {
            continue;
        }
        const char *str = duk_get_string(ctx, -1);
        size_t strlen = duk_get_length(ctx, -1);
        duk_pop(ctx);

        int start;
        int finish;
        int width;
        int height;
        bool found = find_character_bounds(str, strlen, &start, &finish, &width, &height);
        if (!found) {
            continue;
        }

        int xpad = MAX(0, ceil(((float)CHARACTER_WIDTH - (float)width) / 2));
        int ypad = MAX(0, ceil(((float)CHARACTER_HEIGHT - (float)height) / 2));
        // copy data into character array
        int x = xpad;
        int y = ypad;
        for (int cidx = start; cidx <= finish; cidx++) {
            if (str[cidx] == '\n') {
                y += 1;
                x = xpad;
                continue;
            }
            if (x < CHARACTER_WIDTH && y < CHARACTER_HEIGHT) {
                (*characters)[charidx][y][x] = str[cidx];
            }
            x += 1;
        }
    }

    return charactersLength;
}

void duk_get_options(duk_context* ctx, duk_idx_t idx, Options* o) {
    DEBUG_TRACE(duk_get_options);
    o->viewSizeX = 100;
    o->viewSizeY = 100;
    o->soundSeed = 1;
    o->isDarkColor = false;
    o->isShowingScore = true;
    // TODO: isShowingScore
    if (duk_has_prop_string(ctx, idx, "isShowingScore")) {
        duk_get_prop_string(ctx, idx, "isShowingScore");
        o->isShowingScore = duk_get_boolean(ctx, -1);
        duk_pop(ctx);
    }


    if (duk_has_prop_string(ctx, idx, "audioSeed")) {
        duk_get_prop_string(ctx, idx, "audioSeed");
        o->soundSeed = duk_get_int(ctx, -1);
        duk_pop(ctx);
    } else if (duk_has_prop_string(ctx, idx, "seed")) {
        duk_get_prop_string(ctx, idx, "seed");
        o->soundSeed = duk_get_int(ctx, -1);
        duk_pop(ctx);
    }

    if (duk_has_prop_string(ctx, idx, "viewSize")) {
        duk_get_prop_string(ctx, idx, "viewSize");
        duk_idx_t view_idx = duk_normalize_index(ctx, -1);
        if (duk_has_prop_string(ctx, view_idx, "x")) {
            duk_get_prop_string(ctx, view_idx, "x");
            o->viewSizeX = duk_get_int(ctx, -1);
            duk_pop(ctx);
        }
        if (duk_has_prop_string(ctx, view_idx, "y")) {
            duk_get_prop_string(ctx, view_idx, "y");
            o->viewSizeY = duk_get_int(ctx, -1);
            duk_pop(ctx);
        }
    }
    if (duk_has_prop_string(ctx, idx, "theme")) {
        duk_get_prop_string(ctx, idx, "theme");
        o->isDarkColor = strcmp(duk_get_string(ctx, -1), "dark") == 0;
        duk_pop(ctx);
    }
}



