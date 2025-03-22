#ifndef CGLP_DUK_NATIVE_VECTOR_H_
#define CGLP_DUK_NATIVE_VECTOR_H_

#include "cglp.h"
#include "duktape.h"
#include "vector.h"

duk_idx_t parse_vector(duk_context* ctx, duk_idx_t idx, duk_idx_t top, Vector* data);

void register_native_vector_class(duk_context *ctx);
duk_ret_t native_vector_constructor(duk_context *ctx);
duk_ret_t native_vector_finalizer(duk_context* ctx);
duk_ret_t native_vector_x_get(duk_context *ctx);
duk_ret_t native_vector_x_set(duk_context *ctx);
duk_ret_t native_vector_y_get(duk_context *ctx);
duk_ret_t native_vector_y_set(duk_context *ctx);
duk_ret_t native_vector_length_get(duk_context *ctx);
duk_ret_t native_vector_angle_get(duk_context *ctx);

duk_ret_t native_vector_set(duk_context* ctx);
duk_ret_t native_vector_add(duk_context* ctx);
duk_ret_t native_vector_sub(duk_context* ctx);
duk_ret_t native_vector_mul(duk_context* ctx);
duk_ret_t native_vector_div(duk_context* ctx);
duk_ret_t native_vector_clamp(duk_context* ctx);
duk_ret_t native_vector_wrap(duk_context* ctx);
duk_ret_t native_vector_addWithAngle(duk_context* ctx);
duk_ret_t native_vector_swapXy(duk_context* ctx);
duk_ret_t native_vector_normalize(duk_context* ctx);
duk_ret_t native_vector_rotate(duk_context* ctx);
duk_ret_t native_vector_angleTo(duk_context* ctx);
duk_ret_t native_vector_distanceTo(duk_context* ctx);
duk_ret_t native_vector_isInRect(duk_context* ctx);
duk_ret_t native_vector_equals(duk_context* ctx);
duk_ret_t native_vector_floor(duk_context* ctx);
duk_ret_t native_vector_round(duk_context* ctx);
duk_ret_t native_vector_ceil(duk_context* ctx);

#endif