#ifndef CGLP_DUK_H_
#define CGLP_DUK_H_

#include "cglp.h"

int addJSGameFromFile(char*);
int loadJSGameFromFile(char*);
int initJS();
void cleanupJS();
bool isJSGame(Game game);

#endif