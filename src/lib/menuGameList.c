#include "cglp.h"

void addGameSection(char *sectionName)
{
  Options o = {0};
  addGame(sectionName, "", NULL, NULL, 0, o, false, NULL);
}

void addGames(char* gamesPath)
{
  // if you want add other c games do so here
  md_loadJSGames(gamesPath);
}
