#ifndef MENU_H
#define MENU_H

#ifdef __cplusplus
#define EXTERNC extern "C"
#else
#define EXTERNC extern
#endif

#include "cglp.h"

EXTERNC int gameCount;
EXTERNC Game getGame(int index);

EXTERNC void menuUpdate();

#endif
