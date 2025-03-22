#include "duktape.h"
#include "cglp_duk_native.h"
#include "cglp_duk_native_vector.h"

duk_idx_t parse_vector(duk_context* ctx, duk_idx_t idx, duk_idx_t top, Vector* data) {
    data->x = 0;
    data->y = 0;
    if (top <= idx) {
        // no arguments given; set x=0, y=0
    } else if (duk_is_number(ctx, idx)) {
        data->x = duk_get_number(ctx, idx);
        idx += 1;
        if (top <= idx) {
            data->y = 0; // no argument; set y=0
        } else if (duk_is_number(ctx, idx)) {
            data->y = duk_get_number(ctx, idx);
            idx += 1;
        }
    } else if (duk_has_prop_string(ctx, idx, DUK_HIDDEN_SYMBOL("vectordata"))) {
        duk_get_prop_string(ctx, idx, DUK_HIDDEN_SYMBOL("vectordata"));
        Vector *otherdata = duk_get_pointer(ctx, -1);
        memcpy(data, otherdata, sizeof(Vector));     
        duk_pop(ctx);
        idx += 1;
    } else { 
        duk_get_prop_string(ctx, idx, "x");
        data->x = duk_get_number(ctx, -1);
        duk_get_prop_string(ctx, idx, "y");
        data->y = duk_get_number(ctx, -1);
        duk_pop_2(ctx);
        idx += 1;
    }
    return idx;
}

void register_native_vector_class(duk_context *ctx) {
    duk_idx_t class_idx = duk_push_c_function(ctx, native_vector_constructor, DUK_VARARGS);
    duk_idx_t proto_idx = duk_push_object(ctx);
    duk_push_c_function(ctx, native_vector_constructor, DUK_VARARGS);
    duk_put_prop_string(ctx, proto_idx,"constructor");
    duk_push_c_function(ctx, native_vector_set, DUK_VARARGS);
    duk_put_prop_string(ctx, proto_idx,"set");
    duk_push_c_function(ctx, native_vector_add, DUK_VARARGS);
    duk_put_prop_string(ctx, proto_idx,"add");
    duk_push_c_function(ctx, native_vector_sub, DUK_VARARGS);
    duk_put_prop_string(ctx, proto_idx,"sub");
    duk_push_c_function(ctx, native_vector_mul, DUK_VARARGS);
    duk_put_prop_string(ctx, proto_idx,"mul");
    duk_push_c_function(ctx, native_vector_div, DUK_VARARGS);
    duk_put_prop_string(ctx, proto_idx,"div");
    duk_push_c_function(ctx, native_vector_clamp, DUK_VARARGS);
    duk_put_prop_string(ctx, proto_idx,"clamp");
    duk_push_c_function(ctx, native_vector_wrap, 4);
    duk_put_prop_string(ctx, proto_idx,"wrap");
    duk_push_c_function(ctx, native_vector_addWithAngle, 2);
    duk_put_prop_string(ctx, proto_idx,"addWithAngle");
    duk_push_c_function(ctx, native_vector_swapXy, 0);
    duk_put_prop_string(ctx, proto_idx,"swapXy");
    duk_push_c_function(ctx, native_vector_normalize, 0);
    duk_put_prop_string(ctx, proto_idx,"normalize");
    duk_push_c_function(ctx, native_vector_rotate, 1);
    duk_put_prop_string(ctx, proto_idx,"rotate");
    duk_push_c_function(ctx, native_vector_angleTo, DUK_VARARGS);
    duk_put_prop_string(ctx, proto_idx,"angleTo");
    duk_push_c_function(ctx, native_vector_distanceTo, DUK_VARARGS);
    duk_put_prop_string(ctx, proto_idx,"distanceTo");
    duk_push_c_function(ctx, native_vector_isInRect, 4);
    duk_put_prop_string(ctx, proto_idx,"isInRect");
    duk_push_c_function(ctx, native_vector_equals, 1);
    duk_put_prop_string(ctx, proto_idx,"equals");
    duk_push_c_function(ctx, native_vector_floor, 0);
    duk_put_prop_string(ctx, proto_idx,"floor");
    duk_push_c_function(ctx, native_vector_round, 0);
    duk_put_prop_string(ctx, proto_idx,"round");
    duk_push_c_function(ctx, native_vector_ceil, 0);
    duk_put_prop_string(ctx, proto_idx,"ceil");
    duk_dup(ctx, proto_idx);
    duk_set_prototype(ctx, class_idx);
    duk_put_prop_string(ctx, class_idx,"prototype");
    duk_dup(ctx, class_idx);
    duk_put_global_string(ctx, "vec");
    duk_put_global_string(ctx, "Vector");
}

duk_ret_t native_vector_constructor(duk_context *ctx) {
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    if (duk_is_constructor_call(ctx)) {
        duk_push_this(ctx);
    } else {
        duk_push_object(ctx);
    }
    
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    Vector *data = malloc(sizeof(Vector));
    data->x = 0;
    data->y = 0;
    if (n > 0) {
        parse_vector(ctx, 0, n, data);
    }

    duk_push_pointer(ctx, data);
    duk_put_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    duk_get_global_string(ctx, "Vector");  // Get Person constructor
    duk_get_prop_string(ctx, -1, "prototype");  // Get its prototype
    duk_set_prototype(ctx, obj_idx);  // Set prototype on the new object
    duk_pop(ctx);

    duk_push_string(ctx, "x");
    duk_push_c_function(ctx, native_vector_x_get, 0 /*nargs*/);
    duk_push_c_function(ctx, native_vector_x_set, 1 /*nargs*/);
    duk_def_prop(ctx,
                obj_idx,
                DUK_DEFPROP_SET_ENUMERABLE |
                DUK_DEFPROP_HAVE_GETTER |
                DUK_DEFPROP_HAVE_SETTER);

    duk_push_string(ctx, "y");
    duk_push_c_function(ctx, native_vector_y_get, 0 /*nargs*/);
    duk_push_c_function(ctx, native_vector_y_set, 1 /*nargs*/);
    duk_def_prop(ctx,
                obj_idx,
                DUK_DEFPROP_SET_ENUMERABLE |
                DUK_DEFPROP_HAVE_GETTER |
                DUK_DEFPROP_HAVE_SETTER);

    duk_push_string(ctx, "length");
    duk_push_c_function(ctx, native_vector_length_get, 0 /*nargs*/);
    duk_def_prop(ctx,
                obj_idx,
                DUK_DEFPROP_HAVE_GETTER);  

    duk_push_string(ctx, "angle");
    duk_push_c_function(ctx, native_vector_angle_get, 0 /*nargs*/);
    duk_def_prop(ctx,
                obj_idx,
                DUK_DEFPROP_HAVE_GETTER); 

    duk_push_c_function(ctx, native_vector_finalizer, 1);
    duk_set_finalizer(ctx, obj_idx);
    if (duk_is_constructor_call(ctx)) {
        duk_pop(ctx);
        return 0;
    } else {
        return 1;
    }
}

duk_ret_t native_vector_finalizer(duk_context* ctx) {
    duk_get_prop_string(ctx, 0, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    free(data);
    return 0;
}


duk_ret_t native_vector_x_get(duk_context *ctx) {
    duk_push_this(ctx);
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);
    duk_push_number(ctx, data->x);
    return 1;
}

duk_ret_t native_vector_x_set(duk_context *ctx) {
    duk_push_this(ctx);
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);
    data->x = duk_get_number(ctx, 0);
    return 0;
}

duk_ret_t native_vector_y_get(duk_context *ctx) {
    duk_push_this(ctx);
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);
    duk_push_number(ctx, data->y);
    return 1;
}

duk_ret_t native_vector_y_set(duk_context *ctx) {
    duk_push_this(ctx);
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);
    data->y = duk_get_number(ctx, 0);
    return 0;
}

duk_ret_t native_vector_length_get(duk_context *ctx) {
    duk_push_this(ctx);
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);
    duk_push_number(ctx, vectorLength(data));
    return 1;
}

duk_ret_t native_vector_angle_get(duk_context *ctx) {
    duk_push_this(ctx);
    duk_get_prop_string(ctx, -1, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop_2(ctx);
    duk_push_number(ctx, vectorAngle(data));
    return 1;
}

duk_ret_t native_vector_set(duk_context* ctx) {
    duk_idx_t n = duk_get_top(ctx);
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    parse_vector(ctx, 0, n, data);
    duk_pop(ctx);
    return 1;
}

duk_ret_t native_vector_add(duk_context* ctx) {
    duk_idx_t n = duk_get_top(ctx);
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    Vector otherdata;
    parse_vector(ctx, 0, n, &otherdata);
    vectorAdd(data, otherdata.x, otherdata.y);
    return 1;
}

duk_ret_t native_vector_sub(duk_context* ctx) {
    duk_idx_t n = duk_get_top(ctx);
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    Vector otherdata;
    parse_vector(ctx, 0, n, &otherdata);
    vectorAdd(data, -otherdata.x, -otherdata.y);
    return 1;
}

duk_ret_t native_vector_mul(duk_context* ctx) {
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    duk_float_t v = duk_get_number(ctx, 0);
    vectorMul(data, v);
    return 1;

}

duk_ret_t native_vector_div(duk_context* ctx) {
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    duk_float_t v = duk_get_number(ctx, 0);
    vectorMul(data, 1/v);
    return 1;
}

duk_ret_t native_vector_clamp(duk_context* ctx) {
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    duk_idx_t idx = 0;
    duk_float_t xLow, xHigh, yLow, yHigh;
    idx = parse_clamp(ctx, idx, n, &xLow, &xHigh);
    idx = parse_clamp(ctx, idx, n, &yLow, &yHigh);
    data->x = clamp(data->x, xLow, xHigh);
    data->y = clamp(data->y, yLow, yHigh);
    return 1;
}

duk_ret_t native_vector_wrap(duk_context* ctx) {
    duk_idx_t n = duk_get_top(ctx);  /* #args */
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    duk_float_t xLow = duk_get_number(ctx, 0);
    duk_float_t xHigh = duk_get_number(ctx, 1);
    duk_float_t yLow = duk_get_number(ctx, 2);
    duk_float_t yHigh = duk_get_number(ctx, 3);
    data->x = wrap(data->x, xLow, xHigh);
    data->y = wrap(data->y, yLow, yHigh);
    return 1;
}

duk_ret_t native_vector_addWithAngle(duk_context* ctx) {
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    duk_float_t angle = duk_get_number(ctx, 0);
    duk_float_t length = duk_get_number(ctx, 1);
    addWithAngle(data, angle, length);
    return 1;
}

duk_ret_t native_vector_swapXy(duk_context* ctx) {
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    float temp = data->x;
    data->x = data->y;
    data->y = temp;
    return 1;
}

duk_ret_t native_vector_normalize(duk_context* ctx) {
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    vectorMul(data, 1/vectorLength(data));
    return 1;
}

duk_ret_t native_vector_rotate(duk_context* ctx) {
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    duk_float_t angle = duk_get_number(ctx, 0);
    rotate(data, angle);
    return 1;
}

duk_ret_t native_vector_angleTo(duk_context* ctx) {
    duk_idx_t n = duk_get_top(ctx);
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    Vector otherdata;
    parse_vector(ctx, 0, n, &otherdata);
    float angle = angleTo(data, otherdata.x, otherdata.y);
    duk_pop(ctx);
    duk_push_number(ctx, angle);
    return 1;
}

duk_ret_t native_vector_distanceTo(duk_context* ctx) {
    duk_idx_t n = duk_get_top(ctx);
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    Vector otherdata;
    parse_vector(ctx, 0, n, &otherdata);
    float length = distanceTo(data, otherdata.x, otherdata.y);
    duk_pop(ctx);
    duk_push_number(ctx, length);
    return 1;
}

duk_ret_t native_vector_isInRect(duk_context* ctx) {
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    duk_float_t x = duk_get_number(ctx, 0);
    duk_float_t y = duk_get_number(ctx, 1);
    duk_float_t width = duk_get_number(ctx, 2);
    duk_float_t height = duk_get_number(ctx, 3);
    bool result = (x <= data->x) && (data->x < (x+width));
    result &= (y <= data->y) && (data->y < (y+height));
    duk_pop(ctx);
    duk_push_boolean(ctx, result);
    return 1;
}

duk_ret_t native_vector_equals(duk_context* ctx) {
    duk_idx_t n = duk_get_top(ctx);
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    Vector otherdata;
    parse_vector(ctx, 0, n, &otherdata);
    bool same = memcmp(data, &otherdata, sizeof(Vector)) == 0;

    duk_pop(ctx);
    duk_push_boolean(ctx, same);
    return 1;
}

duk_ret_t native_vector_floor(duk_context* ctx) {
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    data->x = floor(data->x);
    data->y = floor(data->y);
    return 1;
}

duk_ret_t native_vector_round(duk_context* ctx) {
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    data->x = round(data->x);
    data->y = round(data->y);
    return 1;
}

duk_ret_t native_vector_ceil(duk_context* ctx) {
    duk_push_this(ctx);
    duk_idx_t obj_idx = duk_normalize_index(ctx, -1);
    duk_get_prop_string(ctx, obj_idx, DUK_HIDDEN_SYMBOL("vectordata"));
    Vector* data = (Vector*)duk_get_pointer(ctx, -1);
    duk_pop(ctx);
    data->x = ceil(data->x);
    data->y = ceil(data->y);
    return 1;
}
