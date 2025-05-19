#ifndef CGLP_DUK_UTILS_H_
#define CGLP_DUK_UTILS_H_

#include "duktape.h"

void* duk_cglp_alloc_function(void* udata, duk_size_t size);
void duk_cglp_free_function(void* udata, void* ptr);
void* duk_cglp_realloc_function(void* udata, void* ptr, duk_size_t newsize);
void duk_cglp_fatal_handler(void* udata, const char* msg);

#endif