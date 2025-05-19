#include "duktape.h"

#include <stdio.h>
#include <stdlib.h>

void* duk_cglp_alloc_function(void* udata, duk_size_t size) {
    return malloc(size);
}

void duk_cglp_free_function(void* udata, void *ptr) {
	free(ptr);
}

void* duk_cglp_realloc_function(void* udata, void* ptr, duk_size_t newsize) {
    // prevents realloc() with size 0 errors in valgrind
    if (newsize == 0) {
        free(ptr);
        return NULL;
    }
	return realloc(ptr, newsize);
}

void duk_cglp_fatal_handler(void* udata, const char* msg) {
	msg = msg ? msg : "NULL";

	/* Default behavior is to abort() on error.  There's no printout
	 * which makes this awkward, so it's always recommended to use an
	 * explicit fatal error handler.
	 *
	 * ====================================================================
	 * NOTE: If you are seeing this, you are most likely dealing with an
	 * uncaught error.  You should provide a fatal error handler in Duktape
	 * heap creation, and should consider using a protected call as your
	 * first call into an empty Duktape context to properly handle errors.
	 * See:
	 *   - http://duktape.org/guide.html#error-handling
	 *   - http://wiki.duktape.org/HowtoFatalErrors.html
	 *   - http://duktape.org/api.html#taglist-protected
	 * ====================================================================
	 */
    printf("fatal message: %s\n", msg);
	abort();
}