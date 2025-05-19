#ifndef CGLP_DUK_H_
#define CGLP_DUK_H_

#include "cglp.h"

int loadJSGameFromFile(int);
int initJS();
void cleanupJS();
bool isJSGame(Game game);

#endif