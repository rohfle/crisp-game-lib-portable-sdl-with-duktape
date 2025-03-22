#ifndef CGLP_DUK_NATIVE_H_
#define CGLP_DUK_NATIVE_H_

#include "cglp.h"
#include "duktape.h"

EXTERNC char* colorsAsStrings[];
EXTERNC char* soundsAsStrings[];

bool parse_vectorlike(duk_context* ctx, duk_idx_t obj_idx, duk_float_t* x, duk_float_t* y);
bool parse_vectorlike_or_xy(duk_context* ctx, duk_idx_t idx, duk_float_t *x, duk_float_t *y);
void duk_get_letteroptions(duk_context* ctx, duk_idx_t idx, int* color, CharacterOptions* characterOptions);
int duk_push_input(duk_context* ctx, Input input);
int duk_push_vector(duk_context* ctx, Vector vector);
int duk_push_collision(duk_context *ctx, Collision collision);
char* duk_get_string_persistent(duk_context *ctx, duk_idx_t idx);
int duk_get_characters_persistent(duk_context* ctx, duk_idx_t idx, char(**characters)[CHARACTER_WIDTH][CHARACTER_HEIGHT + 1]);
void duk_get_options_persistent(duk_context* ctx, duk_idx_t idx, Options** options);

// native functions called from javascript
duk_ret_t native_rnd(duk_context* ctx);
duk_ret_t native_rndi(duk_context* ctx);
duk_ret_t native_rnds(duk_context* ctx);
duk_ret_t native_color(duk_context* ctx);
duk_ret_t native_range(duk_context* ctx);
duk_ret_t native_clamp(duk_context* ctx);
duk_ret_t native_wrap(duk_context* ctx);
duk_ret_t native_addScore(duk_context* ctx);
duk_ret_t native_addWithCharCode(duk_context* ctx);
duk_ret_t native_end(duk_context* ctx);
duk_ret_t native_play(duk_context* ctx);
duk_ret_t native_remove(duk_context* ctx);
duk_ret_t native_times(duk_context* ctx);
duk_ret_t native_rect(duk_context* ctx);
duk_ret_t native_box(duk_context* ctx);
duk_ret_t native_bar(duk_context* ctx);
duk_ret_t native_line(duk_context* ctx);
duk_ret_t native_char(duk_context* ctx);
duk_ret_t native_isVectorLike(duk_context* ctx);
duk_ret_t native_arc(duk_context* ctx);
duk_ret_t native_particle(duk_context* ctx);
duk_ret_t native_text(duk_context* ctx);
duk_ret_t native_vec(duk_context* ctx);

duk_idx_t parse_clamp(duk_context* ctx, duk_idx_t idx, duk_idx_t stack_length, duk_float_t* low, duk_float_t* high);
bool parse_color(duk_context* ctx, duk_idx_t idx, int* color);
bool parse_rect(duk_context* ctx, duk_float_t* x, duk_float_t* y, duk_float_t* w,  duk_float_t* h);
bool parse_line(duk_context* ctx, duk_float_t* x1, duk_float_t* y1, duk_float_t* x2,  duk_float_t* y2, duk_float_t* thickness);
bool parse_arc(
    duk_context* ctx, 
    duk_float_t* centerX, 
    duk_float_t* centerY, 
    duk_float_t* radius,  
    duk_float_t* thickness, 
    duk_float_t* angleFrom,
    duk_float_t* angleTo
);

bool parse_bar(
    duk_context* ctx, 
    duk_float_t* x, 
    duk_float_t* y, 
    duk_float_t* length,  
    duk_float_t* thickness, 
    duk_float_t* angle,
    duk_float_t* barCenterPosRatio
);

bool parse_particle(
    duk_context* ctx, 
    duk_float_t* x, 
    duk_float_t* y, 
    duk_float_t* count,  
    duk_float_t* speed, 
    duk_float_t* angle,
    duk_float_t* angleWidth
);

void push_native_functions(duk_context* ctx);

#endif
